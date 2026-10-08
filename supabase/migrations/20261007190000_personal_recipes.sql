-- Existing recipes remain published. New community recipes go through the RPC below.
alter table public.recipes add column created_by uuid references auth.users(id);
alter table public.recipes add column moderation_status text not null default 'approved'
  check (moderation_status in ('pending', 'approved', 'rejected'));
alter table public.recipes add column reviewed_by uuid references auth.users(id);
alter table public.recipes add column reviewed_at timestamptz;
alter table public.recipes add column moderation_note text;
alter table public.recipes add column image_path text;
alter table public.recipes drop constraint recipes_source_check;
alter table public.recipes add constraint recipes_source_check check (source in ('crous', 'broco-chou', 'instagram', 'community'));
create index recipes_creator_idx on public.recipes(created_by);

-- Admin membership is provisioned through SQL, never from user-editable metadata.
create table public.recipe_admins (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.recipe_admins enable row level security;
create function public.is_recipe_admin() returns boolean language sql stable security definer
set search_path = '' as $$ select exists(select 1 from public.recipe_admins where user_id = auth.uid()); $$;
revoke all on function public.is_recipe_admin() from public;
grant execute on function public.is_recipe_admin() to anon, authenticated;

drop policy "Recipes are readable with publishable key" on public.recipes;
create policy "Published recipes or own submissions" on public.recipes for select to anon, authenticated
using (moderation_status = 'approved' or created_by = (select auth.uid()) or (select public.is_recipe_admin()));
-- All writes are atomic, validated RPCs. No direct writes from browser credentials.
revoke insert, update, delete on public.recipes, public.ingredients, public.recipe_admins from anon, authenticated;

create function public.ingredient_key(value text) returns text language sql immutable strict
set search_path = '' as $$ select translate(lower(regexp_replace(btrim(value), '\s+', ' ', 'g')), 'àâäéèêëîïôöùûüç', 'aaaeeeeiioouuuc'); $$;
create index ingredients_generic_key_idx on public.ingredients(public.ingredient_key(name));

create function public.submit_recipe(payload jsonb) returns text language plpgsql security definer
set search_path = '' as $$
declare
  recipe_id text := 'community-' || gen_random_uuid()::text;
  item jsonb;
  ingredient_name text;
  matched public.ingredients;
  result_ingredients jsonb := '[]'::jsonb;
  photo text := nullif(payload->>'image_path', '');
begin
  if auth.uid() is null then raise exception 'Connexion requise'; end if;
  if length(btrim(coalesce(payload->>'nom', ''))) not between 2 and 150
    or length(coalesce(payload->>'description', '')) > 2000
    or jsonb_typeof(payload->'ingredients') is distinct from 'array'
    or jsonb_typeof(payload->'instructions') is distinct from 'array' then
    raise exception 'Recette invalide';
  end if;
  if jsonb_array_length(payload->'ingredients') not between 1 and 60
    or jsonb_array_length(payload->'instructions') not between 1 and 50
    or exists (select 1 from jsonb_array_elements(payload->'instructions') step
      where jsonb_typeof(step) <> 'string' or length(btrim(step #>> '{}')) not between 1 and 2000)
    or coalesce(payload->>'tag', '') not in ('dejeuner/diner', 'petit_dejeuner', 'dessert', 'aperitif')
    or coalesce((payload->>'estimated_time')::int, 0) not between 1 and 1440
    or coalesce((payload->>'servings')::int, 0) not between 1 and 50 then
    raise exception 'Ingrédients, étapes, durée ou portions invalides';
  end if;
  if photo is not null and (split_part(photo, '/', 1) <> auth.uid()::text
    or not exists(select 1 from storage.objects where bucket_id = 'recipe-photos' and name = photo)) then
    raise exception 'Image invalide';
  end if;
  for item in select * from jsonb_array_elements(payload->'ingredients') loop
    ingredient_name := regexp_replace(btrim(item->>'name'), '\s+', ' ', 'g');
    if coalesce(length(ingredient_name), 0) not between 1 and 120
      or length(coalesce(item->>'quantity', '')) > 40 or length(coalesce(item->>'unit', '')) > 30 then
      raise exception 'Ingrédient invalide';
    end if;
    -- Serialise same-name additions, including concurrent submissions.
    perform pg_advisory_xact_lock(hashtextextended(public.ingredient_key(ingredient_name), 0));
    select * into matched from public.ingredients i
      where public.ingredient_key(i.name) = public.ingredient_key(ingredient_name)
      or exists(select 1 from unnest(i.aliases) alias where public.ingredient_key(alias) = public.ingredient_key(ingredient_name))
      order by i.created_at, i.id limit 1;
    if not found then
      insert into public.ingredients(name, category) values (lower(ingredient_name), 'Épicerie, condiments et produits sucrés') returning * into matched;
    end if;
    result_ingredients := result_ingredients || jsonb_build_array(jsonb_build_object(
      'name', matched.name, 'quantity', coalesce(item->>'quantity',''), 'unit', coalesce(item->>'unit',''),
      'category', matched.category, 'canonical', true));
  end loop;
  insert into public.recipes(id, nom, description, saison, mois, mois_numero, tag, categorie, portions,
    estimated_time, difficulty, ingredients, instructions, source, canonical_ingredients_status,
    created_by, moderation_status, image_path)
  values (recipe_id, btrim(payload->>'nom'), btrim(payload->>'description'), payload->>'saison',
    '', extract(month from now())::int, payload->>'tag', payload->>'categorie',
    (payload->>'servings') || ' personne(s)', (payload->>'estimated_time')::int, 'facile',
    result_ingredients, payload->'instructions', 'community', 'verified', auth.uid(), 'pending', photo);
  return recipe_id;
end; $$;
revoke all on function public.submit_recipe(jsonb) from public;
grant execute on function public.submit_recipe(jsonb) to authenticated;

create function public.review_recipe(recipe_id text, decision text, note text default '') returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_recipe_admin() then raise exception 'Accès administrateur requis'; end if;
  if decision not in ('approved', 'rejected') or decision is null or length(note) > 1000 then raise exception 'Décision invalide'; end if;
  update public.recipes set moderation_status = decision, moderation_note = note,
    reviewed_by = auth.uid(), reviewed_at = now()
    where id = recipe_id and source = 'community' and moderation_status = 'pending';
  if not found then raise exception 'Recette déjà traitée ou introuvable'; end if;
end; $$;
revoke all on function public.review_recipe(text,text,text) from public;
grant execute on function public.review_recipe(text,text,text) to authenticated;

-- Email addresses are only returned to admins, never in the public recipe table.
create function public.recipe_submission_authors() returns table(user_id uuid, email text)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_recipe_admin() then raise exception 'Accès administrateur requis'; end if;
  return query select u.id, u.email::text from auth.users u
    where exists(select 1 from public.recipes r where r.created_by = u.id);
end; $$;
revoke all on function public.recipe_submission_authors() from public;
grant execute on function public.recipe_submission_authors() to authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('recipe-photos', 'recipe-photos', false, 5242880, array['image/jpeg','image/png','image/webp']);
create policy "Upload own recipe photos" on storage.objects for insert to authenticated
with check (bucket_id = 'recipe-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Read visible recipe photos" on storage.objects for select to anon, authenticated
using (bucket_id = 'recipe-photos' and (
  (storage.foldername(name))[1] = auth.uid()::text or public.is_recipe_admin()
  or exists(select 1 from public.recipes r where r.image_path = name and r.moderation_status = 'approved')));
create policy "Remove unused own photos" on storage.objects for delete to authenticated
using (bucket_id = 'recipe-photos' and (storage.foldername(name))[1] = auth.uid()::text
  and not exists(select 1 from public.recipes r where r.image_path = name));
