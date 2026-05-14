create extension if not exists pgcrypto;

create table if not exists public.recipes (
  id text primary key,
  nom text not null,
  description text,
  saison text not null check (saison in ('hiver', 'printemps', 'été', 'automne')),
  mois text not null,
  mois_numero integer not null check (mois_numero between 1 and 12),
  semaine integer,
  jour text,
  tag text not null,
  categorie text not null check (categorie in ('salé', 'sucré')),
  theme_special text,
  portions text not null,
  estimated_time integer,
  difficulty text check (difficulty in ('très facile', 'facile', 'intermédiaire')),
  image_url text,
  ingredients jsonb not null default '[]'::jsonb,
  instructions jsonb not null default '[]'::jsonb,
  astuce text,
  cuisson_micro_ondes boolean not null default false,
  sans_four boolean not null default false,
  source text not null default 'crous' check (source in ('crous', 'broco-chou')),
  source_pdf text,
  source_page integer,
  dietary_tags text[] not null default '{}',
  main_ingredients text[] not null default '{}',
  equipment text[] not null default '{}',
  canonical_ingredients_status text not null default 'verified' check (canonical_ingredients_status in ('verified', 'partial', 'unknown')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null,
  aliases text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists recipes_saison_idx on public.recipes (saison);
create index if not exists recipes_mois_numero_idx on public.recipes (mois_numero);
create index if not exists recipes_categorie_idx on public.recipes (categorie);
create index if not exists recipes_source_idx on public.recipes (source);
create index if not exists recipes_dietary_tags_idx on public.recipes using gin (dietary_tags);
create index if not exists recipes_main_ingredients_idx on public.recipes using gin (main_ingredients);
create index if not exists recipes_ingredients_idx on public.recipes using gin (ingredients);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_recipes_updated_at on public.recipes;
create trigger set_recipes_updated_at
before update on public.recipes
for each row
execute function public.set_updated_at();

alter table public.recipes enable row level security;
alter table public.ingredients enable row level security;

drop policy if exists "Recipes are readable with publishable key" on public.recipes;
create policy "Recipes are readable with publishable key"
on public.recipes
for select
to anon, authenticated
using (true);

drop policy if exists "Ingredients are readable with publishable key" on public.ingredients;
create policy "Ingredients are readable with publishable key"
on public.ingredients
for select
to anon, authenticated
using (true);
