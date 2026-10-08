-- Do not depend on environment-specific default privileges for API access.
-- Row-level policies continue to protect pending recipes and admin membership.
grant select on public.recipes, public.ingredients to anon, authenticated;
grant all on public.recipes, public.ingredients, public.recipe_admins to service_role;
