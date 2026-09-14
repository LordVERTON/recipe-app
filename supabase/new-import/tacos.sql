begin;

insert into public.ingredients (name, category, aliases)
values
  ('bœuf haché', 'Viandes, poissons et protéines', array['viande hachée', 'boeuf haché']),
  ('oignon', 'Fruits, légumes et légumineuses', array['oignons']),
  ('fromage cheddar', 'Crèmerie et produits laitiers', array['cheddar râpé']),
  ('piment jalapeño', 'Fruits, légumes et légumineuses', array['jalapeño']),
  ('pâte à dumpling', 'Féculents, pains et céréales', array['wonton', 'feuilles de wonton', 'pâte à wonton']),
  ('sauce salsa', 'Épicerie, condiments et produits sucrés', array['salsa']),
  ('crème aigre', 'Crèmerie et produits laitiers', array['crème fraîche', 'sour cream']),
  ('coriandre fraîche', 'Épices et herbes aromatiques', array['coriandre']),
  ('assaisonnement pour tacos', 'Épices et herbes aromatiques', array['épices tacos'])
on conflict (name) do nothing;

insert into public.recipes (
  id, nom, description, saison, mois, mois_numero, semaine, jour,
  tag, categorie, theme_special, portions, estimated_time, difficulty,
  image_url, ingredients, instructions, astuce, cuisson_micro_ondes,
  sans_four, source, source_pdf, source_page, dietary_tags,
  main_ingredients, equipment, canonical_ingredients_status
)
values (
  'broco-chou-dumpling-tacos',
  'Dumpling Tacos',
  'Fusion taco-dumpling : garniture de bœuf épicée façon taco enveloppée dans des pâtes à dumpling et poêlée pour un extérieur croustillant.',
  'été',
  'juin', 6, null, null,
  'déjeuner/dîner',
  'salé',
  null,
  'POUR 2 PERSONNES',
  35,
  'facile',
  'REMPLACER_PAR_URL_IMAGE',
  '[
    {"name":"bœuf haché","quantity":"200","unit":"g","canonical":true},
    {"name":"oignon","quantity":"0.5","unit":"unité(s)","canonical":true},
    {"name":"ail","quantity":"1","unit":"gousse(s)","canonical":true},
    {"name":"assaisonnement pour tacos","quantity":"1","unit":"c. à soupe","canonical":true},
    {"name":"fromage cheddar","quantity":"60","unit":"g","canonical":true},
    {"name":"piment jalapeño","quantity":"1","unit":"unité(s)","canonical":true},
    {"name":"pâte à dumpling","quantity":"16","unit":"unité(s)","canonical":true},
    {"name":"huile végétale","quantity":"2","unit":"c. à soupe","canonical":true},
    {"name":"sauce salsa","quantity":"2","unit":"c. à soupe","canonical":true},
    {"name":"crème aigre","quantity":"2","unit":"c. à soupe","canonical":true},
    {"name":"coriandre fraîche","quantity":"0.25","unit":"tasse","canonical":true},
    {"name":"sel","quantity":"0.5","unit":"c. à café","canonical":true},
    {"name":"poivre noir","quantity":"0.25","unit":"c. à café","canonical":true}
  ]'::jsonb,
  '[
    "Faire revenir l''oignon et l''ail à feu moyen 2 minutes, puis ajouter le bœuf haché. Cuire en émiettant jusqu''à ce que la viande soit dorée, environ 6 minutes.",
    "Ajouter l''assaisonnement pour tacos, le sel, le poivre et le jalapeño. Mélanger et cuire encore 1 minute. Retirer du feu, incorporer le cheddar et laisser refroidir 5 minutes.",
    "Déposer une cuillère à café de garniture au centre de chaque pâte à dumpling. Humidifier les bords avec un peu d''eau et replier en triangle ou demi-lune en pressant bien pour sceller.",
    "Chauffer l''huile dans une poêle antiadhésive à feu moyen-vif. Déposer les dumplings sans les superposer et cuire 1 à 2 minutes jusqu''à ce que le dessous soit doré.",
    "Ajouter un peu d''eau dans la poêle, couvrir aussitôt et laisser cuire à la vapeur jusqu''à évaporation complète de l''eau, environ 4 minutes.",
    "Retirer le couvercle et laisser le fond redevenir croustillant encore 1 minute si besoin.",
    "Servir chaud, garni de salsa, de crème aigre et de coriandre."
  ]'::jsonb,
  'Se congèle très bien avant cuisson. Peut être fait avec du poulet haché ou une version végétarienne (haricots noirs écrasés + maïs).',
  false,
  true,
  'broco-chou',
  null, null,
  array[]::text[],
  array['bœuf haché', 'fromage cheddar', 'pâte à dumpling'],
  array['poêle antiadhésive'],
  'partial'
);

commit;