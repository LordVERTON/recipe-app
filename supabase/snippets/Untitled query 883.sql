DELETE FROM auth.users
WHERE email = 'benchaabouneali8@gmail.com'
RETURNING id, email;
