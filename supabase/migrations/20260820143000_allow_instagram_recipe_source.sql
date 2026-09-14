alter table public.recipes
  drop constraint if exists recipes_source_check;

alter table public.recipes
  add constraint recipes_source_check
  check (source in ('crous', 'lumora', 'broco-chou', 'instagram'));
