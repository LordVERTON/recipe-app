begin;

-- Sources des images : rechercher le titre/la description sur la page Pexels correspondante.
-- Lasagnes : https://www.pexels.com/photo/baked-lasagna-on-a-baking-dish-7768233/
-- Poêlée : https://www.pexels.com/photo/cooking-vegetables-in-bowl-15059725/
-- Purée : https://www.pexels.com/photo/delicious-creamy-mashed-potatoes-in-white-bowl-30635680/
-- Quiche : https://www.pexels.com/photo/delicious-homemade-quiche-with-crispy-crust-34318142/
-- Burger : https://www.pexels.com/photo/photo-of-a-burger-3915908/
-- Brocolis : https://www.pexels.com/photo/close-up-photo-of-broccoli-3872368/
-- Poulet crème champignons : https://www.pexels.com/photo/delicious-creamy-mushroom-chicken-dish-31233887/
-- Pizza margherita : https://www.pexels.com/photo/delicious-homemade-margherita-pizza-close-up-30666831/
-- Bagel : https://www.pexels.com/photo/healthy-avocado-and-salmon-bagel-sandwich-29843065/
-- Brunch : https://www.pexels.com/photo/delicious-avocado-toast-and-poached-eggs-brunch-28962420/
-- Croque-monsieur : https://www.pexels.com/photo/toasted-sandwich-with-cheese-and-ham-on-a-plate-4394139/

insert into public.ingredients (name, category, aliases)
values
  ('Pâte feuilletée', 'Féculents, pains et céréales', array['puff pastry']),
  ('Pâte à pizza', 'Féculents, pains et céréales', array['pizza dough'])
on conflict (name) do nothing;

insert into public.recipes (
  id, nom, description, saison, mois, mois_numero, semaine, jour, tag,
  categorie, theme_special, portions, estimated_time, difficulty, image_url,
  ingredients, instructions, astuce, cuisson_micro_ondes, sans_four, source,
  source_pdf, source_page, dietary_tags, main_ingredients, equipment,
  canonical_ingredients_status
)
values
(
  'broco-chou-lasagnes-maison', 'Lasagnes maison',
  'Lasagnes au bœuf, sauce tomate et béchamel pour deux personnes.',
  'hiver', 'janvier', 1, null, null, 'déjeuner/dîner', 'salé', null,
  '2 personnes', 60, 'facile',
  'https://images.pexels.com/photos/7768233/pexels-photo-7768233.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  '[{"name":"bœuf haché","quantity":"250","unit":"g","canonical":true},{"name":"Pâtes","quantity":"6","unit":"feuilles de lasagnes","canonical":true},{"name":"sauce tomate","quantity":"200","unit":"g","canonical":true},{"name":"oignon","quantity":"1","unit":"pièce","canonical":true},{"name":"Ail","quantity":"1","unit":"gousse","canonical":true},{"name":"Lait","quantity":"250","unit":"ml","canonical":true},{"name":"Beurre","quantity":"20","unit":"g","canonical":true},{"name":"Farine","quantity":"20","unit":"g","canonical":true},{"name":"Emmental","quantity":"50","unit":"g","canonical":true},{"name":"huile d''olive","quantity":"1","unit":"c. à soupe","canonical":true},{"name":"sel","quantity":"1","unit":"pincée","canonical":true},{"name":"poivre","quantity":"1","unit":"pincée","canonical":true}]'::jsonb,
  '["Préchauffer le four à 180 °C. Émincer l’oignon et l’ail.","Faire revenir l’oignon dans l’huile 3 minutes. Ajouter l’ail et le bœuf, puis cuire en émiettant la viande. Incorporer la sauce tomate, saler, poivrer et laisser mijoter 10 minutes.","Pour la béchamel, faire fondre le beurre dans une casserole. Ajouter la farine et mélanger 1 minute. Verser le lait progressivement en fouettant jusqu’à épaississement. Assaisonner.","Dans un petit plat, alterner une fine couche de béchamel, des feuilles de lasagnes, la sauce à la viande et de la béchamel. Répéter les couches et terminer par la béchamel et l’emmental.","Cuire 30 à 35 minutes, jusqu’à ce que le dessus soit doré et les pâtes tendres. Laisser reposer 5 minutes avant de servir."]'::jsonb,
  'Couvrir le plat de papier cuisson si le fromage dore trop vite.', false, false, 'broco-chou', null, null,
  array['protéines'], array['bœuf haché','Pâtes','sauce tomate'], array['four','plat à gratin','casserole','fouet'], 'verified'
),
(
  'broco-chou-poelee-legumes', 'Poêlée de légumes',
  'Poêlée estivale de courgette, poivron et aubergine à l’ail et aux herbes.',
  'été', 'juillet', 7, null, null, 'déjeuner/dîner', 'salé', null,
  '2 personnes', 25, 'très facile',
  'https://images.pexels.com/photos/15059725/pexels-photo-15059725.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  '[{"name":"Courgettes","quantity":"200","unit":"g","canonical":true},{"name":"Poivrons","quantity":"1","unit":"pièce","canonical":true},{"name":"Aubergines","quantity":"200","unit":"g","canonical":true},{"name":"oignon","quantity":"1","unit":"petit","canonical":true},{"name":"Ail","quantity":"1","unit":"gousse","canonical":true},{"name":"huile d''olive","quantity":"1","unit":"c. à soupe","canonical":true},{"name":"Thym","quantity":"1","unit":"c. à café","canonical":true},{"name":"sel","quantity":"1","unit":"pincée","canonical":true},{"name":"poivre","quantity":"1","unit":"pincée","canonical":true}]'::jsonb,
  '["Laver les légumes. Couper la courgette et l’aubergine en dés, le poivron en lanières et l’oignon en fines tranches.","Chauffer l’huile dans une grande poêle. Faire revenir l’oignon et l’aubergine 5 minutes.","Ajouter le poivron et la courgette. Cuire 10 à 12 minutes à feu moyen en remuant régulièrement.","Ajouter l’ail haché, le thym, le sel et le poivre. Cuire encore 2 minutes et servir."]'::jsonb,
  'Les légumes doivent dorer sans être entassés ; utiliser deux poêles si nécessaire.', false, true, 'broco-chou', null, null,
  array['végétarien','vegan'], array['Courgettes','Poivrons','Aubergines'], array['grande poêle','couteau','planche à découper'], 'verified'
),
(
  'broco-chou-puree-pommes-de-terre', 'Purée de pommes de terre',
  'Purée maison au beurre et au lait, avec une option rapide à la Mousline.',
  'hiver', 'janvier', 1, null, null, 'déjeuner/dîner', 'salé', null,
  '2 personnes', 30, 'très facile',
  'https://images.pexels.com/photos/30635680/pexels-photo-30635680.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  '[{"name":"Pommes de terre","quantity":"500","unit":"g","canonical":true},{"name":"Lait","quantity":"100","unit":"ml","canonical":true},{"name":"Beurre","quantity":"25","unit":"g","canonical":true},{"name":"Muscade","quantity":"1","unit":"pincée","canonical":true},{"name":"sel","quantity":"1","unit":"pincée","canonical":true},{"name":"poivre","quantity":"1","unit":"pincée","canonical":true}]'::jsonb,
  '["Éplucher les pommes de terre et les couper en morceaux de taille égale.","Les cuire dans une casserole d’eau salée frémissante 18 à 20 minutes, jusqu’à ce qu’elles soient tendres. Égoutter.","Écraser les pommes de terre au presse-purée. Incorporer le beurre puis le lait chaud petit à petit jusqu’à la texture souhaitée.","Assaisonner avec la muscade et le poivre. Goûter et rectifier le sel."]'::jsonb,
  'Pour une version express, préparer une purée Mousline selon les proportions indiquées sur le paquet et utiliser le lait et le beurre prévus ici.', false, true, 'broco-chou', null, null,
  array['végétarien'], array['Pommes de terre'], array['casserole','passoire','presse-purée'], 'verified'
),
(
  'broco-chou-quiche-allumettes-fumees', 'Quiche maison aux allumettes fumées',
  'Petite quiche aux allumettes fumées, crème et œufs, sur pâte feuilletée.',
  'hiver', 'février', 2, null, null, 'déjeuner/dîner', 'salé', null,
  '2 personnes', 45, 'facile',
  'https://images.pexels.com/photos/34318142/pexels-photo-34318142.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  '[{"name":"Pâte feuilletée","quantity":"1","unit":"rouleau (230 g)","canonical":true},{"name":"Lardons","quantity":"100","unit":"g","canonical":true},{"name":"Crème","quantity":"200","unit":"ml","canonical":true},{"name":"Œufs","quantity":"2","unit":"pièces","canonical":true},{"name":"Emmental","quantity":"40","unit":"g","canonical":true},{"name":"Muscade","quantity":"1","unit":"pincée","canonical":true},{"name":"poivre","quantity":"1","unit":"pincée","canonical":true}]'::jsonb,
  '["Préchauffer le four à 190 °C. Foncer un moule d’environ 22 cm avec la pâte et piquer le fond.","Faire revenir les lardons 3 à 4 minutes dans une poêle, puis les égoutter sur du papier absorbant.","Battre les œufs avec la crème. Ajouter la muscade, le poivre et l’emmental. Saler très légèrement ou pas du tout, car les lardons sont déjà salés.","Répartir les lardons sur la pâte et verser l’appareil aux œufs.","Cuire 30 à 35 minutes, jusqu’à ce que la garniture soit prise et le dessus doré. Reposer 5 minutes avant de couper."]'::jsonb,
  'Une pâte entière donne une petite quiche généreuse ; garder les restes au frais.', false, false, 'broco-chou', null, null,
  array['protéines'], array['Lardons','Œufs','Pâte feuilletée'], array['four','moule à tarte','poêle','saladier','fouet'], 'verified'
),
(
  'broco-chou-burger-maison', 'Burger maison',
  'Burger de bœuf avec cheddar, tomate, salade, oignon et sauce burger.',
  'été', 'juillet', 7, null, null, 'déjeuner/dîner', 'salé', null,
  '2 personnes', 30, 'facile',
  'https://images.pexels.com/photos/3915908/pexels-photo-3915908.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  '[{"name":"Pain","quantity":"2","unit":"pains burger","canonical":true},{"name":"bœuf haché","quantity":"300","unit":"g (2 steaks)","canonical":true},{"name":"Cheddar","quantity":"2","unit":"tranches","canonical":true},{"name":"Tomates","quantity":"1","unit":"petite","canonical":true},{"name":"Salade","quantity":"2","unit":"feuilles","canonical":true},{"name":"oignon rouge","quantity":"0.5","unit":"pièce","canonical":true},{"name":"Sauce à burger","quantity":"2","unit":"c. à soupe","canonical":true}]'::jsonb,
  '["Laver et trancher la tomate et l’oignon. Laver et sécher les feuilles de salade.","Former deux steaks avec le bœuf haché. Saler et poivrer juste avant cuisson.","Chauffer une poêle à feu moyen-vif. Cuire les steaks 3 à 4 minutes de chaque côté selon l’épaisseur. Poser une tranche de cheddar sur chacun en fin de cuisson.","Ouvrir les pains et les faire toaster côté mie dans une poêle sèche ou un grille-pain.","Tartiner les pains de sauce. Ajouter salade, steak au cheddar, tomate et oignon. Refermer et servir."]'::jsonb,
  'Ne pas trop tasser la viande en formant les steaks pour qu’ils restent moelleux.', false, true, 'broco-chou', null, null,
  array['protéines'], array['bœuf haché','Cheddar','Pain'], array['poêle','grille-pain','spatule'], 'verified'
),
(
  'broco-chou-brocolis-air-fryer', 'Brocolis surgelés au Air Fryer',
  'Brocolis surgelés rôtis directement au Air Fryer, aux bords légèrement croustillants.',
  'hiver', 'janvier', 1, null, null, 'déjeuner/dîner', 'salé', null,
  '2 personnes', 17, 'très facile',
  'https://images.pexels.com/photos/3872368/pexels-photo-3872368.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  '[{"name":"Brocoli","quantity":"400","unit":"g surgelé","canonical":true},{"name":"huile d''olive","quantity":"1","unit":"c. à soupe","canonical":true},{"name":"Ail","quantity":"0.5","unit":"c. à café en poudre","canonical":true},{"name":"Paprika","quantity":"0.5","unit":"c. à café","canonical":true},{"name":"sel","quantity":"1","unit":"pincée","canonical":true},{"name":"poivre","quantity":"1","unit":"pincée","canonical":true}]'::jsonb,
  '["Préchauffer le Air Fryer à 190 °C pendant 3 minutes.","Mélanger les brocolis encore surgelés avec l’huile, l’ail en poudre, le paprika, le sel et le poivre.","Répartir dans le panier sans trop le remplir. Cuire 12 à 15 minutes à 190 °C en secouant le panier à mi-cuisson.","Vérifier la cuisson : les bouquets doivent être tendres avec quelques pointes grillées. Ajouter 2 minutes si besoin."]'::jsonb,
  'Ne pas décongeler les brocolis ; cuire en deux fournées si le panier est petit.', false, true, 'broco-chou', null, null,
  array['végétarien','vegan'], array['Brocoli'], array['Air Fryer'], 'verified'
),
(
  'dfe15cd09fb8', 'Poulet crème champignons',
  'Filets de poulet poêlés accompagnés de champignons de Paris dans une sauce à la crème.',
  'automne', 'octobre', 10, null, null, 'déjeuner/dîner', 'salé', null,
  '2 personnes', 30, 'facile',
  'https://images.pexels.com/photos/31233887/pexels-photo-31233887.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  '[{"name":"Poulet","quantity":"300","unit":"g de filets","canonical":true},{"name":"Champignons","quantity":"200","unit":"g","canonical":true},{"name":"Crème","quantity":"20","unit":"cl","canonical":true},{"name":"oignon","quantity":"0.5","unit":"pièce","canonical":true},{"name":"Ail","quantity":"1","unit":"gousse","canonical":true},{"name":"huile d''olive","quantity":"1","unit":"c. à soupe","canonical":true},{"name":"Persil","quantity":"1","unit":"c. à soupe","canonical":true},{"name":"sel","quantity":"1","unit":"pincée","canonical":true},{"name":"poivre","quantity":"1","unit":"pincée","canonical":true}]'::jsonb,
  '["Émincer l’oignon et les champignons. Couper les filets de poulet en morceaux réguliers.","Chauffer l’huile dans une grande poêle. Faire dorer le poulet 5 à 6 minutes, en le retournant. Le réserver dans une assiette.","Dans la même poêle, faire revenir l’oignon 2 minutes. Ajouter les champignons et cuire 5 minutes, jusqu’à évaporation de leur eau. Ajouter l’ail haché.","Remettre le poulet dans la poêle. Verser la crème, saler et poivrer. Laisser mijoter 5 à 7 minutes, jusqu’à cuisson complète du poulet et épaississement de la sauce.","Parsemer de persil et servir. Vérifier que le poulet est bien cuit à cœur."]'::jsonb,
  'Servir avec du riz ou des pâtes, à préparer séparément si souhaité.', false, true, 'broco-chou', null, null,
  array['protéines'], array['Poulet','Champignons'], array['grande poêle','couteau','planche à découper'], 'verified'
),
(
  'broco-chou-pizza-maison', 'Pizza maison',
  'Pizza margherita maison à la tomate, mozzarella et basilic.',
  'été', 'juillet', 7, null, null, 'déjeuner/dîner', 'salé', null,
  '2 personnes', 25, 'facile',
  'https://images.pexels.com/photos/30666831/pexels-photo-30666831.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  '[{"name":"Pâte à pizza","quantity":"1","unit":"pièce (environ 250 g)","canonical":true},{"name":"sauce tomate","quantity":"100","unit":"g","canonical":true},{"name":"Mozzarella","quantity":"125","unit":"g","canonical":true},{"name":"Basilic","quantity":"6","unit":"feuilles","canonical":true},{"name":"huile d''olive","quantity":"1","unit":"c. à café","canonical":true}]'::jsonb,
  '["Préchauffer le four à 230 °C, ou selon les indications du paquet de pâte.","Étaler la pâte sur une plaque recouverte de papier cuisson. Étaler la sauce tomate en laissant un petit bord libre.","Égoutter et déchirer la mozzarella. La répartir sur la sauce et ajouter un filet d’huile d’olive.","Cuire 10 à 15 minutes, jusqu’à ce que le bord soit doré et le fromage fondu.","Ajouter les feuilles de basilic à la sortie du four, couper et servir."]'::jsonb,
  'La variante retenue est une margherita ; ajouter le basilic après cuisson pour préserver son parfum.', false, false, 'broco-chou', null, null,
  array['végétarien'], array['Pâte à pizza','Mozzarella','sauce tomate'], array['four','plaque de cuisson','papier cuisson'], 'verified'
),
(
  'broco-chou-bagel-truite-avocat', 'Bagel truite fumée, avocat & St Môret',
  'Bagel garni de truite fumée, concombre, avocat et fromage frais type St Môret.',
  'été', 'août', 8, null, null, 'déjeuner/dîner', 'salé', null,
  '2 personnes', 15, 'très facile',
  'https://images.pexels.com/photos/29843065/pexels-photo-29843065.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  '[{"name":"Pain","quantity":"2","unit":"bagels","canonical":true},{"name":"Truite","quantity":"120","unit":"g fumée","canonical":true},{"name":"Concombres","quantity":"100","unit":"g","canonical":true},{"name":"Avocats","quantity":"1","unit":"petit","canonical":true},{"name":"Fromage frais","quantity":"80","unit":"g (type St Môret)","canonical":true},{"name":"Citrons","quantity":"0.5","unit":"pièce","canonical":true},{"name":"Aneth","quantity":"1","unit":"c. à café","canonical":true},{"name":"poivre","quantity":"1","unit":"pincée","canonical":true}]'::jsonb,
  '["Couper les bagels en deux et les toaster légèrement.","Mélanger le fromage frais avec un filet de jus de citron, l’aneth et du poivre. Tartiner les bases des bagels.","Couper le concombre en fines rondelles et l’avocat en tranches. Les répartir sur les bases tartinées.","Ajouter la truite fumée, quelques gouttes de citron et refermer les bagels. Servir aussitôt."]'::jsonb,
  'Utiliser un avocat mûr mais encore ferme pour que les tranches gardent leur forme.', false, true, 'broco-chou', null, null,
  array['poisson'], array['Truite','Avocats','Concombres'], array['grille-pain','couteau','planche à découper'], 'verified'
),
(
  'broco-chou-brunch-maison', 'Brunch maison',
  'Assiette de brunch pour deux avec œufs brouillés, tartines, avocat, tomate et fruit.',
  'été', 'août', 8, null, null, 'petit_dejeuner', 'salé', null,
  '2 personnes', 25, 'facile',
  'https://images.pexels.com/photos/28962420/pexels-photo-28962420.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  '[{"name":"Œufs","quantity":"4","unit":"pièces","canonical":true},{"name":"Pain","quantity":"4","unit":"tranches","canonical":true},{"name":"Beurre","quantity":"15","unit":"g","canonical":true},{"name":"Avocats","quantity":"1","unit":"petit","canonical":true},{"name":"Tomates","quantity":"150","unit":"g","canonical":true},{"name":"Pommes","quantity":"1","unit":"pièce","canonical":true},{"name":"sel","quantity":"1","unit":"pincée","canonical":true},{"name":"poivre","quantity":"1","unit":"pincée","canonical":true}]'::jsonb,
  '["Laver et couper la tomate et la pomme. Couper l’avocat en deux, retirer le noyau et trancher la chair.","Faire griller les tranches de pain. Répartir l’avocat et la tomate sur les assiettes avec la pomme en quartiers.","Battre les œufs avec une pincée de sel et de poivre. Faire fondre le beurre à feu doux dans une poêle.","Verser les œufs et remuer doucement avec une spatule jusqu’à ce qu’ils soient juste pris et encore moelleux.","Servir immédiatement les œufs brouillés avec les tartines et les accompagnements."]'::jsonb,
  'Retirer les œufs du feu juste avant la cuisson souhaitée : ils continuent à cuire dans l’assiette.', false, true, 'broco-chou', null, null,
  array['végétarien'], array['Œufs','Pain','Avocats'], array['poêle','grille-pain','spatule'], 'verified'
),
(
  '696a27dabcd5', 'Croque-monsieur maison',
  'Croque-monsieur au jambon, emmental et béchamel maison, doré au four.',
  'hiver', 'février', 2, null, null, 'déjeuner/dîner', 'salé', null,
  '2 personnes', 25, 'facile',
  'https://images.pexels.com/photos/4394139/pexels-photo-4394139.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  '[{"name":"Pain","quantity":"4","unit":"tranches de pain de mie","canonical":true},{"name":"Jambon","quantity":"2","unit":"tranches","canonical":true},{"name":"Emmental","quantity":"80","unit":"g","canonical":true},{"name":"Beurre","quantity":"20","unit":"g","canonical":true},{"name":"Farine","quantity":"10","unit":"g","canonical":true},{"name":"Lait","quantity":"100","unit":"ml","canonical":true},{"name":"Muscade","quantity":"1","unit":"pincée","canonical":true},{"name":"poivre","quantity":"1","unit":"pincée","canonical":true}]'::jsonb,
  '["Préchauffer le four à 210 °C. Faire fondre 10 g de beurre dans une petite casserole, ajouter la farine et mélanger 1 minute.","Verser le lait progressivement en fouettant. Laisser épaissir 2 à 3 minutes, puis assaisonner avec poivre et muscade.","Beurrer légèrement un côté de chaque tranche de pain. Sur le côté non beurré de deux tranches, répartir un peu de béchamel, le jambon et la moitié de l’emmental. Refermer avec les deux autres tranches, côté beurré vers l’extérieur.","Étaler le reste de béchamel sur le dessus et parsemer du reste d’emmental.","Enfourner 10 à 12 minutes, puis passer 1 à 2 minutes sous le gril pour dorer. Surveiller attentivement."]'::jsonb,
  'Servir avec une salade verte pour compléter le repas.', false, false, 'broco-chou', null, null,
  array['protéines'], array['Pain','Jambon','Emmental'], array['four','casserole','fouet','plaque de cuisson'], 'verified'
)
on conflict (id) do update set
  nom = excluded.nom,
  description = excluded.description,
  saison = excluded.saison,
  mois = excluded.mois,
  mois_numero = excluded.mois_numero,
  semaine = excluded.semaine,
  jour = excluded.jour,
  tag = excluded.tag,
  categorie = excluded.categorie,
  theme_special = excluded.theme_special,
  portions = excluded.portions,
  estimated_time = excluded.estimated_time,
  difficulty = excluded.difficulty,
  image_url = excluded.image_url,
  ingredients = excluded.ingredients,
  instructions = excluded.instructions,
  astuce = excluded.astuce,
  cuisson_micro_ondes = excluded.cuisson_micro_ondes,
  sans_four = excluded.sans_four,
  source = excluded.source,
  source_pdf = excluded.source_pdf,
  source_page = excluded.source_page,
  dietary_tags = excluded.dietary_tags,
  main_ingredients = excluded.main_ingredients,
  equipment = excluded.equipment,
  canonical_ingredients_status = excluded.canonical_ingredients_status;

commit;
