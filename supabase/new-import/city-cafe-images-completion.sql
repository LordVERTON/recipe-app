UPDATE public.recipes AS recipe
SET image_url = replacement.image_url
FROM (VALUES
  ('city-cafe-fletan-en-papillote-d-ete', 'https://images.pexels.com/photos/37367757/pexels-photo-37367757.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('city-cafe-filets-de-perche-au-beurre-citron-basilic-et-pommes-frites', 'https://images.pexels.com/photos/32651690/pexels-photo-32651690.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('city-cafe-bar-roti-aux-herbes-de-provence-et-aioli', 'https://images.pexels.com/photos/37534677/pexels-photo-37534677.jpeg?auto=compress&cs=tinysrgb&h=650&w=940')
) AS replacement(id, image_url)
WHERE recipe.id = replacement.id;
