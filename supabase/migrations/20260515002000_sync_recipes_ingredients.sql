create table if not exists public.ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null,
  aliases text[] not null default '{}',
  created_at timestamptz not null default now()
);

do $$
begin
  if to_regclass('public.ingredients_catalog') is not null then
    insert into public.ingredients (name, category, aliases)
    select name, category, aliases
    from public.ingredients_catalog
    on conflict (name) do update set
      category = excluded.category,
      aliases = excluded.aliases;
  end if;
end;
$$;

alter table public.ingredients enable row level security;

drop policy if exists "Ingredients are readable with publishable key" on public.ingredients;
create policy "Ingredients are readable with publishable key"
on public.ingredients
for select
to anon, authenticated
using (true);
