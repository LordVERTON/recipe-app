# Product & UX/UI roadmap

This is a living, prioritized audit of Broco-Chou’s current mobile-first recipe-planning experience. Completed work is checked so the file can be used as a delivery log as well as a backlog.

## Now — make planning dependable

- [x] Let people build and edit a seven-day plan that begins today, including adding, replacing, and clearing meals.
- [x] Make every plan date-based rather than Monday-based, so the dashboard and calendar always agree on what “today” means.
- [x] Preserve a clear empty state and a low-friction route from recipe discovery into planning.
- [x] Invalidate the shopping list after a plan is changed and explain that it is refreshed when regenerated.

## Current experience audit

| Area | What works today | Main UX/UI opportunity |
| --- | --- | --- |
| Onboarding & preferences | A focused setup captures diet, equipment, and budget. | Explain how these choices affect results and make the settings easy to revisit from the profile. |
| Recipe discovery | Swipe actions make choosing feel lightweight; recipe sheets offer ingredients and steps. | Add search and filters before choice, plus a clearer way to compare selected recipes. |
| Home | The dashboard surfaces today’s meals and a clear route to the planning tab. | Show the active plan’s date range and an at-a-glance next action when the day is empty. |
| Weekly planning | A dated seven-day plan now starts today, with direct add, change, and remove controls. | Add move/duplicate, undo, and a compact desktop overview. |
| Cooking | Meal cards support recipe viewing and marking a meal cooked. | Add skip/move actions and connect “cooked” to a rating/history prompt. |
| Shopping | Ingredients are grouped, checkable, and copyable. | Normalize quantities, retain checked state across a regeneration where possible, and identify plan changes before replacing a list. |
| Navigation & visual language | The five-tab mobile navigation and warm palette are consistent. | Strengthen non-color state indicators, keyboard focus, and icon-only control labels. |

## Next — improve clarity and control

- [x] Add an explicit confirmation/undo affordance for destructive planning actions (clearing a meal or restarting a plan).
- [x] Show the plan’s seven-day date range prominently on the home card and calendar; make the active day visible without relying on color alone.
- [x] Offer filters and search in the recipe picker (diet, cooking time, season, available equipment) to reduce cognitive load in a large catalog.
- [x] Let people set which meal slots they plan, and make generator requirements match those choices rather than always requiring seven main dishes.
- [x] Support quantity scaling by household size and normalize units before combining grocery quantities; the current `“x + y”` output is understandable but not actionable.
- [x] Add a “skip / move to another day” flow, with the grocery list refreshed automatically.

## Later — deepen the product

- [x] Add accessible labels, visible keyboard focus, and larger tap-target checks across icon-only controls (copy, close, category toggles).
- [x] Check text/color contrast for muted text and status dots; status must also have a text or icon cue for color-vision accessibility.
- [x] Provide a desktop/tablet planning layout in addition to the current compact mobile view.
- [x] Add a lightweight first-week walkthrough that explains swipe, plan, and shopping-list relationships.
- [x] Add a history view with ratings and “cook again” suggestions, using existing history data.
- [x] Enable sharing/exporting a plan and shopping list with an accessible, formatted print view.

## Design system observations

The warm, food-oriented palette and rounded cards are cohesive. The next visual step should be a consistent hierarchy: one primary action per screen, supporting actions styled as secondary, and informative status labels rather than decorative dots. Reusing the existing `mauve-taupe`, `sage-mist`, and card tokens will maintain the visual identity while improving scanability.


## Catalogue City Café — suivi des imports

Cette section suit l'ajout des recettes issues de la transcription des anciens menus. Le détail des lots se trouve dans `supabase/new-import/city-cafe-import-order.md`. Les lots synchronisés ne doivent pas être réimportés sauf correction documentée.

| Lot | Items source | Thème | Avancement |
|---|---:|---|---|
| 01 | 1–9 | Quiches et tartes | Terminé : 9 recettes vérifiées en local et en production |
| 02 | 10–21 | Bagels, sandwichs, paninis et pains | Terminé : 12 recettes vérifiées en local et en production |
| 03 | 22–36 | Pâtes, gnocchis, raviolis et risotto | Terminé : 15 recettes vérifiées localement et en production |
| 04 | 37–41 | Pizzas | Terminé : 5 recettes synchronisées en local et en production |
| 05 | 42–67 | Végétarien, œufs, brunch et légumes | Terminé : 26 recettes synchronisées en local et en production |
| 06 | 68–77 | Poulet et dinde | Terminé : 10 recettes synchronisées en local et en production |
| 07 | 78–87 | Bœuf | Terminé : 10 recettes synchronisées en local et en production |
| 08 | 88–107 | Porc, veau, agneau, canard et gibier | Terminé : 20 recettes synchronisées en local et en production |
| 09 | 108–146 | Poissons et fruits de mer | Terminé : 38 recettes synchronisées en local et en production |
| 10 | 147–158 | Desserts et cookies | Terminé : 12 recettes synchronisées en local et en production |

**Progression : 158 / 158 intitulés source (100,00 %).** La fusion des items 34 et 133 reste enregistrée au manifeste.

### Lot 02 — notes à conserver

- Toutes les recettes du lot 2 sont dimensionnées pour deux personnes ; les ingrédients canoniques sont vérifiés et le lot est synchronisé dans les deux bases.
- Le type de viande du « kebab » du Berliner n'étant pas précisé, l'interprétation choisie est du bœuf épicé façon kebab, documentée dans la recette.
- « Hirata » est traité comme un pain bao plié cuit à la vapeur ; l'astuce recommande des pains Hirata du commerce.
- Certaines images Pexels sont des approximations visuelles : bagel avocat sans bœuf visible, panini sans saumon visible, sandwich rosette sans bagel et roast-beef sans présentation en bagel. Les attributions détaillées sont dans `supabase/new-import/city-cafe-pexels-attribution.json`.
- Contrôle lot 2 : 12 recettes en local et en production, champs métier identiques ; références canoniques manquantes : 0. Les 9 recettes du lot 1 restent présentes localement.
- Anomalie préexistante du lot 1 à revoir séparément : le lien photographe d'une attribution Pexels semble incorrect et une photo de quiche au fromage/épinards est approximative pour la quiche thon-curry-fromage frais. Le lot 2 n'a pas modifié ces lignes.



### Lot 03 — notes à conserver

- Les 15 recettes des items 22–36 sont synchronisées localement et en production ; leurs données métier sont identiques et les ingrédients canoniques sont présents. 30 nouveaux noms d’ingrédients ont été ajoutés.
- Les spaghettis frais aux gambas de l’item 34 sont la même recette que l’item 133 « Gambas ail et persil avec spaghettis frais » ; la fusion est faite dans `city-cafe-spaghetti-gambas-ail-persil`.
- « Casarecce à la sicilienne » est interprétée avec thon, olives, câpres et tomate, distincte des fusilli alla Norma à l’aubergine ; les variantes siciliennes diffèrent selon les sources.
- Pâtes achetées prêtes à l’emploi pour les formats spécialisés (malloreddus, casarecce, triangoli, agnolotti, tagliatelles vertes, ravioli, cannelloni, crozets). Pour les ingrédients rares, les astuces proposent des substitutions quand elles sont adaptées.
- Certaines images Pexels sont des approximations de garniture : les cannelloni photographiés sont aux épinards/fromage et non au potimarron/chèvre ; l’image du pastitsio montre un gratin de pâtes proche. Les 15 liens répondent HTTP 200 et les photos sont distinctes des lots précédents.
- Validation : 15 recettes dans chaque base, aucune différence sur les champs métier comparés, aucune référence canonique manquante.

### Lots 04–10 — clôture et contrôles

- Les 122 items source des lots 04–10 sont traités. Avec les lots 01–03, le manifeste compte 158 items source analysés et 157 recettes uniques créées; les items 34 et 133 sont fusionnés.
- Les lots 04–10 sont synchronisés en local et en production. Contrôle final : 157/157 IDs dans chaque base, aucun écart de champs métier, aucun ingrédient canonique manquant, aucune différence de catégorie canonique.
- 154 images Pexels distinctes ont une URL attribuée et sont enregistrées dans `supabase/new-import/city-cafe-pexels-attribution.json`. Trois recettes du lot 09 n’ont pas de photo acceptable et gardent `image_url = NULL`. Les appels ont utilisé l’API officielle; aucun contournement antibot.
- Correction de cohérence appliquée aux deux bases : catégories canoniques « Pâte à pizza » et « Poivre », puis ajout de l’étiquette `category` aux ingrédients JSON des recettes importées pour aligner local et production.
- Les fichiers SQL de lots 04–10 sont conservés séparément et idempotents; les lots 05 et 06 ont été resynchronisés après normalisation du nom canonique « Huile d’olive ».

### Reste à faire

- Import : aucun lot restant.
- Relecture culinaire : examiner en priorité les recettes des lots 05–09, dont plusieurs interprétations ont été reconstruites à partir d’intitulés courts. Vérifier sauces, ingrédients caractéristiques, proportions et étapes avant de considérer le catalogue éditorialement final.
- Images : revoir les attributions signalées comme approximatives dans le manifeste et les photos historiques du lot 01; conserver `NULL` si aucune photo représentative n’est disponible.

### Contrôle des images — 2026-09-27

- Les 157 recettes City Café ont une `image_url` non nulle, identique en local et en production.
- Les trois entrées auparavant sans photo représentative ont été remplacées après recherche dans l’API Pexels officielle : flétan en papillote, filets de perche et bar rôti aux herbes. Les attributions sont conservées dans `city-cafe-pexels-attribution.json`.
- Contrôles : 157 URLs Pexels vérifiées HTTP 200, 157 photo IDs uniques, 0 différence de données entre local et production.
- SQL correctif appliqué aux deux bases : `supabase/new-import/city-cafe-images-completion.sql`.
- Les autres approximations photo listées dans le manifeste restent à revoir lors de la relecture éditoriale.
