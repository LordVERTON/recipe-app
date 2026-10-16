-- Only confirmed, server-side identities grant moderation rights.
create table public.recipe_admin_emails (email text primary key check (email = lower(email)));
alter table public.recipe_admin_emails enable row level security;
revoke all on public.recipe_admin_emails from anon, authenticated;
insert into public.recipe_admin_emails values ('dan.verton@pm.me'), ('per.pleuvry@gmail.com');
create or replace function public.is_recipe_admin() returns boolean language sql stable security definer
set search_path = '' as $$
  select exists(select 1 from auth.users u where u.id = auth.uid() and u.email_confirmed_at is not null
    and (exists(select 1 from public.recipe_admin_emails a where a.email = lower(u.email))
      or exists(select 1 from public.recipe_admins a where a.user_id = u.id)));
$$;
create function public.save_community_recipe(payload jsonb, editing_id text default null) returns text language plpgsql security definer
set search_path = '' as $$
declare
  recipe_id text := coalesce(editing_id, 'community-' || gen_random_uuid()::text);
  original public.recipes;
  item jsonb;
  ingredient_name text;
  matched public.ingredients;
  result_ingredients jsonb := '[]'::jsonb;
  photo text := nullif(payload->>'image_path', '');
begin
  if auth.uid() is null then raise exception 'Connexion requise'; end if;
  if editing_id is not null then
    if not public.is_recipe_admin() then raise exception 'Accès administrateur requis'; end if;
    select * into original from public.recipes where id = editing_id and source = 'community' and moderation_status = 'pending' for update;
    if not found then raise exception 'Recette déjà traitée ou introuvable'; end if;
  end if;
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
  if photo is not null and ((split_part(photo, '/', 1) <> auth.uid()::text and photo is distinct from original.image_path)
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
  if editing_id is not null then
    update public.recipes set nom = btrim(payload->>'nom'), description = btrim(payload->>'description'),
      saison = payload->>'saison', tag = payload->>'tag', categorie = payload->>'categorie',
      portions = (payload->>'servings') || ' personne(s)', estimated_time = (payload->>'estimated_time')::int,
      ingredients = result_ingredients, instructions = payload->'instructions', image_path = photo
    where id = editing_id;
    return editing_id;
  end if;
  insert into public.recipes(id, nom, description, saison, mois, mois_numero, tag, categorie, portions,
    estimated_time, difficulty, ingredients, instructions, source, canonical_ingredients_status,
    created_by, moderation_status, image_path)
  values (recipe_id, btrim(payload->>'nom'), btrim(payload->>'description'), payload->>'saison',
    '', extract(month from now())::int, payload->>'tag', payload->>'categorie',
    (payload->>'servings') || ' personne(s)', (payload->>'estimated_time')::int, 'facile',
    result_ingredients, payload->'instructions', 'community', 'verified', auth.uid(), 'pending', photo);
  return recipe_id;
end; $$;

revoke all on function public.save_community_recipe(jsonb,text) from public, anon, authenticated;
create or replace function public.submit_recipe(payload jsonb) returns text language sql security definer
set search_path = '' as $$ select public.save_community_recipe(payload, null); $$;
create function public.edit_pending_recipe(recipe_id text, payload jsonb) returns text language plpgsql security definer
set search_path = '' as $$ begin
  if recipe_id is null or not public.is_recipe_admin() then raise exception 'Accès administrateur requis'; end if;
  return public.save_community_recipe(payload, recipe_id);
end; $$;
revoke all on function public.edit_pending_recipe(text,jsonb) from public;
grant execute on function public.edit_pending_recipe(text,jsonb) to authenticated;
create or replace function public.review_recipe(recipe_id text, decision text, note text default '') returns void
language plpgsql security definer set search_path = '' as $$ begin
  if not public.is_recipe_admin() then raise exception 'Accès administrateur requis'; end if;
  if decision is null or decision not in ('approved','rejected') or length(coalesce(note,'')) > 1000
    or (decision = 'rejected' and length(btrim(coalesce(note,''))) = 0) then raise exception 'Un commentaire est requis pour un refus'; end if;
  update public.recipes set moderation_status = decision, moderation_note = btrim(coalesce(note,'')),
    reviewed_by = auth.uid(), reviewed_at = now()
    where id = recipe_id and source = 'community' and moderation_status = 'pending';
  if not found then raise exception 'Recette déjà traitée ou introuvable'; end if;
end; $$;

-- Durable outbox, inaccessible to browser credentials; retries do not resubmit recipes.
create table public.recipe_review_notifications (
  recipe_id text primary key references public.recipes(id) on delete cascade,
  created_at timestamptz not null default now(), sent_at timestamptz,
  claimed_at timestamptz, attempts integer not null default 0, last_error text
);
alter table public.recipe_review_notifications enable row level security;
revoke all on public.recipe_review_notifications from anon, authenticated;
grant all on public.recipe_review_notifications to service_role;
grant all on public.recipe_admin_emails to service_role;
create function public.queue_recipe_review() returns trigger language plpgsql security definer set search_path = '' as $$ begin
  if new.source = 'community' and new.moderation_status = 'pending' then
    insert into public.recipe_review_notifications(recipe_id) values(new.id) on conflict do nothing;
  end if;
  return new;
end; $$;
create trigger queue_recipe_review after insert on public.recipes for each row execute function public.queue_recipe_review();
insert into public.recipe_review_notifications(recipe_id) select id from public.recipes where source='community' and moderation_status='pending';
create function public.claim_recipe_notifications(target_id text default null) returns setof public.recipe_review_notifications
language sql security definer set search_path = '' as $$
  update public.recipe_review_notifications set claimed_at = now(), attempts = attempts + 1
  where recipe_id in (select n.recipe_id from public.recipe_review_notifications n
    join public.recipes r on r.id = n.recipe_id
    where n.sent_at is null and (n.claimed_at is null or n.claimed_at < now() - interval '5 minutes')
      and r.moderation_status = 'pending' and (target_id is null or n.recipe_id = target_id)
    order by n.created_at limit 20 for update of n skip locked)
  returning *;
$$;
revoke all on function public.claim_recipe_notifications(text) from public, anon, authenticated;
grant execute on function public.claim_recipe_notifications(text) to service_role;
