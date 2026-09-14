begin;

-- Ingrédients référencés
insert into public.ingredients (name, category, aliases)
values
  ('courgette', 'Fruits, légumes et légumineuses', array['zucchini']),
  ('viande hachée maigre', 'Viandes, poissons et protéines', array['boeuf haché maigre']),
  ('huile d''olive', 'Épicerie, condiments et produits sucrés', array['olive oil']),
  ('sauce tomate', 'Épicerie, condiments et produits sucrés', array['tomato sauce']),
  ('ail', 'Épices et herbes aromatiques', array['garlic']),
  ('poivre noir', 'Épices et herbes aromatiques', array['black pepper']),
  ('flocons de piment rouge', 'Épices et herbes aromatiques', array['red pepper flakes']),
  ('cumin', 'Épices et herbes aromatiques', array['ground cumin']),
  ('yaourt', 'Crèmerie et produits laitiers', array['yogurt']),
  ('aneth', 'Épices et herbes aromatiques', array['dill'])
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
  'instagram-spaghetti-courgettes-viande-hachee',
  'Spaghetti de courgettes à la viande hachée',
  'Une alternative légère aux pâtes classiques : des courgettes taillées en spaghetti, garnies de viande hachée épicée et d’une sauce au yaourt parfumée à l’aneth.',
  'été',
  'août',
  8,
  null,
  null,
  'déjeuner/dîner',
  'salé',
  'healthy',
  '1 personne',
  20,
  'facile',
  'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',

  '[
    {"name":"courgette","quantity":"2","unit":"pieces","canonical":true},
    {"name":"viande hachée maigre","quantity":"90","unit":"g","canonical":true},
    {"name":"huile d''olive","quantity":"1","unit":"tbsp","canonical":true},
    {"name":"sauce tomate","quantity":"1","unit":"tbsp","canonical":true},
    {"name":"ail","quantity":"1","unit":"gousse","canonical":true},
    {"name":"poivre noir","quantity":"1","unit":"pincée","canonical":true},
    {"name":"flocons de piment rouge","quantity":"1","unit":"pincée","canonical":true},
    {"name":"cumin","quantity":"1","unit":"pincée","canonical":true},
    {"name":"yaourt","quantity":"3","unit":"tbsp","canonical":true},
    {"name":"aneth","quantity":"1","unit":"pincée","canonical":true}
  ]'::jsonb,

  '[
    "Couper les courgettes en fines lamelles à l’aide d’un couteau julienne ou d’un spiraliseur.",
    "Faire revenir les courgettes dans une poêle avec un peu d’huile d’olive pendant 2 à 3 minutes afin qu’elles restent légèrement croquantes.",
    "Dans une seconde poêle, faire cuire la viande hachée jusqu’à coloration.",
    "Ajouter la sauce tomate, l’ail émincé, le poivre noir, les flocons de piment rouge et le cumin. Poursuivre la cuisson quelques minutes.",
    "Mélanger le yaourt avec l’aneth et une pincée de sel.",
    "Déposer les spaghetti de courgettes dans une assiette, ajouter la sauce au yaourt puis recouvrir du mélange à la viande hachée.",
    "Servir immédiatement."
  ]'::jsonb,

  'Ne cuisez pas trop les courgettes afin de conserver une texture proche de véritables spaghetti.',
  false,
  true,
  'instagram',
  'https://www.instagram.com/',
  null,
  array['sans-four','riche-en-proteines'],
  array['courgette','viande hachée maigre'],
  array['poêle','couteau julienne','planche à découper','bol'],
  'verified'
);

commit;