begin;

-- Ingrédients référencés
insert into public.ingredients (name, category, aliases)
values
  ('chicken thighs', 'Viandes, poissons et protéines', array['chicken thigh']),
  ('orzo', 'Féculents, pains et céréales', array['risoni']),
  ('leek', 'Fruits, légumes et légumineuses', array['leeks', 'poireau']),
  ('tarragon', 'Épices et herbes aromatiques', array['estragon']),
  ('heavy cream', 'Crèmerie et produits laitiers', array['cream', 'crème entière']),
  ('chicken stock', 'Épicerie, condiments et produits sucrés', array['bouillon de volaille']),
  ('dry white wine', 'Épicerie, condiments et produits sucrés', array['white wine', 'vin blanc sec']),
  ('lemon juice', 'Fruits, légumes et légumineuses', array['jus de citron']),
  ('olive oil', 'Épicerie, condiments et produits sucrés', array['huile d''olive']),
  ('butter', 'Crèmerie et produits laitiers', array['beurre']),
  ('garlic powder', 'Épices et herbes aromatiques', array['ail en poudre']),
  ('black pepper', 'Épices et herbes aromatiques', array['poivre noir'])
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
  'instagram-one-pan-creamy-dreamy-orzo-chicken-dvvsteqakwa',
  'One Pan Creamy And Dreamy Orzo With Chicken',
  'Poulet croustillant sur peau accompagné d’orzo crémeux aux poireaux et à l’estragon dans une sauce au vin blanc. Une recette complète réalisée dans une seule poêle.',
  'été',
  'août',
  8,
  null,
  null,
  'déjeuner/dîner',
  'salé',
  'one-pan',
  '5 à 6 portions',
  50,
  'facile',
  null,
  '[
    {"name":"chicken thighs","quantity":"6","unit":"pieces","canonical":true},
    {"name":"black pepper","quantity":"2","unit":"tsp","canonical":true},
    {"name":"garlic powder","quantity":"2","unit":"tbsp","canonical":true},
    {"name":"olive oil","quantity":"6","unit":"tbsp","canonical":true},
    {"name":"butter","quantity":"0.25","unit":"stick","canonical":true},
    {"name":"leek","quantity":"1","unit":"piece","canonical":true},
    {"name":"orzo","quantity":"8","unit":"oz","canonical":true},
    {"name":"dry white wine","quantity":"0.5","unit":"cup","canonical":true},
    {"name":"heavy cream","quantity":"1","unit":"cup","canonical":true},
    {"name":"chicken stock","quantity":"0.5","unit":"cup","canonical":true},
    {"name":"lemon juice","quantity":"1","unit":"tbsp","canonical":true},
    {"name":"tarragon","quantity":"1","unit":"handful","canonical":true}
  ]'::jsonb,
  '[
    "Mélanger le poivre noir et l’ail en poudre puis assaisonner le poulet. Laisser reposer au réfrigérateur au moins une heure.",
    "Chauffer l’huile et le beurre dans une grande poêle. Faire dorer le poulet côté peau 6 à 8 minutes puis retourner et cuire 5 minutes supplémentaires.",
    "Retirer le poulet. Faire revenir les poireaux à feu moyen-doux quelques minutes puis ajouter l’orzo et le torréfier une minute.",
    "Déglacer avec le vin blanc puis ajouter la crème, le bouillon de volaille, l’estragon, du poivre noir et éventuellement du piment.",
    "Remettre le poulet dans la poêle et poursuivre la cuisson à feu doux pendant environ 15 à 20 minutes jusqu’à ce que l’orzo soit tendre et le poulet complètement cuit.",
    "Ajouter le jus de citron, garnir d’estragon frais et servir."
  ]'::jsonb,
  'Pour une peau bien croustillante, laisser le poulet assaisonné découvert au réfrigérateur pendant au moins une heure avant cuisson.',
  false,
  true,
  'instagram',
  'https://www.instagram.com/p/DVvsTeqAKWa/',
  null,
  array['sans-four'],
  array['chicken thighs','orzo','leek','tarragon'],
  array['grande poêle','spatule','couteau','planche à découper'],
  'verified'
);

commit;