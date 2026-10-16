DELETE FROM auth.users
WHERE email = 'dan.verton@pm.me'
RETURNING id, email;
