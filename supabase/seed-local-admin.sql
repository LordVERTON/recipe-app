-- Local seed only. Never apply this file to a hosted database.
insert into public.recipe_admin_emails(email) values ('admin@brocochou.com') on conflict do nothing;
