-- Add the owner's confirmed Gmail account without revoking existing moderators.
-- is_recipe_admin() still checks auth.users.email_confirmed_at on the server.
insert into public.recipe_admin_emails (email)
values ('vertondan@gmail.com')
on conflict (email) do nothing;
