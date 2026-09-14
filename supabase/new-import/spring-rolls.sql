begin;

insert into public.ingredients (name, category, aliases)
values
  ('papier de riz', 'Féculents, pains et céréales', array['rice paper']),
  ('blettes', 'Fruits, légumes et légumineuses', array['acelgas', 'bette']),
  ('ail', 'Épices et herbes aromatiques', array['garlic']),
  ('oeuf', 'Viandes, poissons et protéines', array['egg']),
  ('feta', 'Crèmerie et produits laitiers', array['fromage feta']),
  ('sésame grillé', 'Épices et herbes aromatiques', array['sesame seeds']),
  ('huile d''olive', 'Épicerie, condiments et produits sucrés', array['olive oil'])
on conflict (name) do nothing;

insert into public.recipes (
  id,
  nom,
  description,
  saison,
  mois,
  mois_numero,
  semaine,
  jour,
  tag,
  categorie,
  theme_special,
  portions,
  estimated_time,
  difficulty,
  image_url,
  ingredients,
  instructions,
  astuce,
  cuisson_micro_ondes,
  sans_four,
  source,
  source_pdf,
  source_page,
  dietary_tags,
  main_ingredients,
  equipment,
  canonical_ingredients_status
)
values (
  'instagram-rouleaux-riz-blettes-feta',
  'Rouleaux de papier de riz aux blettes et feta',
  'Rouleaux croustillants de papier de riz garnis de blettes fondantes, feta et œufs. Une recette légère et riche en légumes cuite à l’air fryer.',
  'été',
  'août',
  8,
  null,
  null,
  'déjeuner/dîner',
  'salé',
  'air-fryer',
  '4 portions',
  25,
  'facile',
  'https://images.pexels.com/photos/6646353/pexels-photo-6646353.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',

  '[
    {"name":"papier de riz","quantity":"8","unit":"feuilles","canonical":true},
    {"name":"blettes","quantity":"400","unit":"g","canonical":true},
    {"name":"ail","quantity":"2","unit":"gousses","canonical":true},
    {"name":"oeuf","quantity":"3","unit":"pieces","canonical":true},
    {"name":"feta","quantity":"200","unit":"g","canonical":true},
    {"name":"sésame grillé","quantity":"2","unit":"tbsp","canonical":true},
    {"name":"huile d''olive","quantity":"1","unit":"tbsp","canonical":true}
  ]'::jsonb,

  '[
    "Faire revenir l’ail haché dans une poêle avec un filet d’huile d’olive.",
    "Ajouter les blettes hachées et cuire jusqu’à ce qu’elles réduisent de volume.",
    "Dans un saladier, mélanger les blettes refroidies, la feta coupée en dés et un œuf battu. Assaisonner avec du sel et du poivre.",
    "Battre les deux œufs restants dans une assiette creuse.",
    "Hydrater rapidement les feuilles de papier de riz puis les passer dans l’œuf battu.",
    "Déposer une portion de garniture au centre puis rouler pour former des rouleaux.",
    "Saupoudrer de sésame grillé.",
    "Cuire à 180°C pendant environ 12 minutes dans un air fryer jusqu’à obtenir une texture dorée et croustillante.",
    "Servir chaud."
  ]'::jsonb,

  'Pour des rouleaux encore plus croustillants, vaporiser légèrement d’huile d’olive avant la cuisson.',
  false,
  false,
  'instagram',
  'https://www.instagram.com/',
  null,
  array['végétarien','riche-en-legumes'],
  array['blettes','feta','papier de riz'],
  array['poêle','saladier','air fryer'],
  'verified'
);

commit;