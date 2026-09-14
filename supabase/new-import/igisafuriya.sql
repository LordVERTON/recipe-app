begin;

insert into public.ingredients (name, category, aliases)
values
  ('poulet', 'Viandes, poissons et protéines', array['poulet en morceaux', 'cuisses de poulet']),
  ('oignon', 'Fruits, légumes et légumineuses', array['oignons']),
  ('tomate', 'Fruits, légumes et légumineuses', array['tomates fraîches']),
  ('concentré de tomate', 'Épicerie, condiments et produits sucrés', array['purée de tomate']),
  ('gingembre', 'Épices et herbes aromatiques', array['gingembre frais']),
  ('poivron vert', 'Fruits, légumes et légumineuses', array['poivron']),
  ('carotte', 'Fruits, légumes et légumineuses', array['carottes']),
  ('pomme de terre', 'Fruits, légumes et légumineuses', array['pommes de terre']),
  ('huile végétale', 'Épicerie, condiments et produits sucrés', array['huile']),
  ('bouillon de poulet', 'Épicerie, condiments et produits sucrés', array['bouillon', 'cube de bouillon']),
  ('curry en poudre', 'Épices et herbes aromatiques', array['curry']),
  ('coriandre fraîche', 'Épices et herbes aromatiques', array['coriandre']),
  ('citron vert', 'Fruits, légumes et légumineuses', array['citron'])
on conflict (name) do nothing;

insert into public.recipes (
  id, nom, description, saison, mois, mois_numero, semaine, jour,
  tag, categorie, theme_special, portions, estimated_time, difficulty,
  image_url, ingredients, instructions, astuce, cuisson_micro_ondes,
  sans_four, source, source_pdf, source_page, dietary_tags,
  main_ingredients, equipment, canonical_ingredients_status
)
values (
  'broco-chou-igisafuriya',
  'Igisafuriya',
  'Ragoût de poulet rwandais mijoté à la tomate et aux épices, servi avec du riz ou de l''ugali.',
  'hiver',
  'janvier', 1, null, null,
  'déjeuner/dîner',
  'salé',
  null,
  'POUR 4 PERSONNES',
  75,
  'facile',
  'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj5w-9uWPMH9YpvoVe0hWa55ZTrmCYD-Ey0rXQ3xZ66eRLqx_vMPO7UW9R13KWNKOGpIJKbB6Yg8ohCkBTDMWqHkdWrgTO5yIkwA8WviXZ1wqw_Hqi3gTQJpI7BuJ4QLuvRc6O7WheYlcwhSws4IpIm62EXYNS_1zBF1hBBe0j96F-Mv4plDRDuoW0wy98/s16000/Google_AI_Studio_2025-08-15T12_50_06.027Z.png?auto=compress&cs=tinysrgb&h=650&w=940',
  '[
    {"name":"poulet","quantity":"1","unit":"kg","canonical":true},
    {"name":"oignon","quantity":"2","unit":"unité(s)","canonical":true},
    {"name":"tomate","quantity":"4","unit":"unité(s)","canonical":true},
    {"name":"concentré de tomate","quantity":"2","unit":"c. à soupe","canonical":true},
    {"name":"ail","quantity":"3","unit":"gousse(s)","canonical":true},
    {"name":"gingembre","quantity":"1","unit":"c. à soupe","canonical":true},
    {"name":"poivron vert","quantity":"1","unit":"unité(s)","canonical":true},
    {"name":"carotte","quantity":"2","unit":"unité(s)","canonical":true},
    {"name":"pomme de terre","quantity":"3","unit":"unité(s)","canonical":true},
    {"name":"huile végétale","quantity":"4","unit":"c. à soupe","canonical":true},
    {"name":"bouillon de poulet","quantity":"500","unit":"ml","canonical":true},
    {"name":"curry en poudre","quantity":"1","unit":"c. à café","canonical":true},
    {"name":"sel","quantity":"1","unit":"c. à café","canonical":true},
    {"name":"poivre noir","quantity":"0.5","unit":"c. à café","canonical":true},
    {"name":"coriandre fraîche","quantity":"2","unit":"c. à soupe","canonical":true},
    {"name":"citron vert","quantity":"1","unit":"unité(s)","canonical":true}
  ]'::jsonb,
  '[
    "Placer le poulet dans un saladier avec le jus du citron vert, le sel et le poivre. Bien mélanger et laisser reposer 15 minutes.",
    "Chauffer l''huile dans une grande cocotte à feu moyen. Ajouter les oignons et faire revenir jusqu''à ce qu''ils soient translucides, environ 5 minutes.",
    "Incorporer l''ail et le gingembre, cuire 1 à 2 minutes jusqu''à ce que ça embaume.",
    "Ajouter les morceaux de poulet marinés dans la cocotte et les saisir sur toutes les faces pendant environ 8 minutes.",
    "Incorporer les tomates et le concentré de tomate. Bien mélanger et laisser cuire 5 minutes pour que les tomates réduisent.",
    "Ajouter le poivron, les carottes, les pommes de terre, le curry et le bouillon. Mélanger le tout.",
    "Couvrir et laisser mijoter à feu doux environ 40 minutes, jusqu''à ce que le poulet et les légumes soient bien tendres.",
    "Goûter et ajuster l''assaisonnement. Parsemer de coriandre avant de servir chaud, avec du riz, de l''ugali ou des bananes plantains."
  ]'::jsonb,
  'Remplacer une partie du bouillon par du lait de coco pour une version plus onctueuse.',
  false,
  true,
  'broco-chou',
  null, null,
  array['sans porc'],
  array['poulet', 'tomate', 'pomme de terre'],
  array['cocotte', 'saladier'],
  'partial'
);

commit;