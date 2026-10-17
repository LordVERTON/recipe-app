import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'

// An ephemeral database inside the known local container; no Cloud credentials.
// Minimal Auth/Storage contracts support the SQL test; the full local API is
// exercised separately by verify-personal-recipes.mjs.
const container = 'supabase_db_recipe-app'
const database = `recipe_review_test_${crypto.randomUUID().replaceAll('-', '')}`
assert.match(database, /^recipe_review_test_[a-f0-9]{32}$/)
const docker = args => execFileSync('docker', args, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] })
const sql = query => execFileSync('docker', ['exec', '-i', container, 'psql', '-X', '-U', 'postgres', '-d', database, '-v', 'ON_ERROR_STOP=1', '-Atq'], {
  input: query, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
}).trim()
const migrations = readdirSync('supabase/migrations').filter(name => name.endsWith('.sql')).sort()
const workflowIndex = migrations.indexOf('20261016180000_recipe_review_workflow.sql')
assert.equal(workflowIndex, 6, 'Reproduce the six-migration production baseline')
assert.equal(migrations[workflowIndex + 1], '20261017120000_add_recipe_moderator_email.sql')
const migration = name => readFileSync(`supabase/migrations/${name}`, 'utf8')
const author = crypto.randomUUID()
const legacyAdmin = crypto.randomUUID()
const moderator = crypto.randomUUID()
let created = false
try {
  docker(['exec', container, 'createdb', '-U', 'postgres', '-T', 'template0', database])
  created = true
  sql(`
    create schema auth;
    create table auth.users(id uuid primary key, email text, email_confirmed_at timestamptz);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated;
    create schema storage;
    create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects(id uuid primary key, bucket_id text, name text);
    create function storage.foldername(name text) returns text[] language sql immutable as $$ select string_to_array(name, '/') $$;
    alter table storage.objects enable row level security;
  `)
  for (const name of migrations.slice(0, workflowIndex)) sql(`begin;\n${migration(name)}\ncommit;`)
  sql(`
    insert into auth.users values
      ('${author}', 'author@example.com', now()),
      ('${legacyAdmin}', 'legacy-admin@example.com', now()),
      ('${moderator}', 'moderator@example.com', now());
    insert into public.recipe_admins values ('${legacyAdmin}');
    insert into storage.objects values (gen_random_uuid(), 'recipe-photos', '${author}/fixture.png');
    select set_config('request.jwt.claim.sub', '${author}', false);
    select public.submit_recipe('{
      "nom":"Recette avant migration", "description":"Fixture isolée", "saison":"automne",
      "categorie":"salé", "tag":"dejeuner/diner", "servings":2, "estimated_time":20,
      "ingredients":[{"name":"ingrédient fictif","quantity":"1","unit":"g"}],
      "instructions":["Préparer."], "image_path":"${author}/fixture.png"
    }'::jsonb);
  `)
  const before = sql('select md5(row_to_json(r)::text) from public.recipes r;')
  const workflow = migrations[workflowIndex]
  const correction = migrations[workflowIndex + 1]
  sql(`begin;\n${migration(workflow)}\n${migration(correction)}\ncommit;`)
  assert.equal(sql('select md5(row_to_json(r)::text) from public.recipes r;'), before, 'Existing recipe, author, status and photo remain unchanged')
  assert.equal(sql('select count(*) from public.recipe_review_notifications where sent_at is null;'), '1', 'Existing pending recipe is queued')
  assert.equal(sql('select count(*) from public.recipe_admin_emails;'), '3', 'Existing whitelist entries are retained and one account added')
  sql(migration(correction))
  assert.equal(sql('select count(*) from public.recipe_admin_emails;'), '3', 'Correction is idempotent')
  sql("insert into public.recipe_admin_emails values ('moderator@example.com');")
  const asUser = (id, query) => sql(`begin; set local role authenticated; select set_config('request.jwt.claim.sub', '${id}', true); ${query}; rollback;`).split('\n').slice(1).join('\n')
  assert.equal(asUser(legacyAdmin, 'select public.is_recipe_admin()'), 't', 'Legacy admin remains admin')
  assert.equal(asUser(moderator, 'select public.is_recipe_admin()'), 't', 'Confirmed allowed account is admin')
  assert.equal(asUser(author, 'select public.is_recipe_admin()'), 'f', 'Author stays a regular user')
  sql(`update auth.users set email_confirmed_at = null where id = '${moderator}';`)
  assert.equal(asUser(moderator, 'select public.is_recipe_admin()'), 'f', 'Unconfirmed email cannot grant admin')
  sql(`update auth.users set email_confirmed_at = now() where id = '${moderator}';`)
  assert.equal(asUser(moderator, "select count(*) from public.recipes where moderation_status = 'pending'"), '1', 'Moderator sees an existing submission by another account')
  assert.equal(sql("begin; set local role anon; select count(*) from public.recipes; rollback;"), '0', 'Visitors cannot see pending recipes')
  assert.equal(asUser(moderator, "select count(*) from public.recipe_submission_authors()"), '1')
  sql(`begin; set local role authenticated; select set_config('request.jwt.claim.sub', '${moderator}', true);
    select public.review_recipe((select id from public.recipes), 'approved', ''); commit;`)
  assert.equal(sql("select moderation_status from public.recipes;"), 'approved')
  assert.equal(sql(`select created_by = '${author}'::uuid and reviewed_by = '${moderator}'::uuid and image_path = '${author}/fixture.png' from public.recipes;`), 't')
  assert.equal(sql('begin; set local role anon; select count(*) from public.recipes; rollback;'), '1', 'Approved recipe becomes public')
  console.log('PASS: six-migration baseline upgraded atomically; existing recipe/photo/author and legacy admins preserved; whitelist addition idempotent; confirmed admin sees and approves another author’s pending recipe; RLS preserved.')
} finally {
  if (created) {
    docker(['exec', container, 'dropdb', '-U', 'postgres', database])
    console.log('PASS: isolated fixture database removed.')
  }
}
