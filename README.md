# Broco-Chou

Broco-Chou est une application de planification de repas pensée pour les étudiants, inspirée des calendriers de recettes du Crous de Lyon. L'objectif est simple : transformer une ressource utile mais statique en version numérique, personnalisable, rapide à prendre en main et vraiment pratique au quotidien.

Le projet reprend l'esprit des calendriers du Crous de Lyon : des recettes de saison, peu coûteuses, faciles, rapides, réalisables avec peu de matériel, accompagnées de listes de courses et de conseils d'organisation. Broco-Chou ajoute une couche interactive : choix des recettes par swipe, génération automatique d'un planning hebdomadaire, score d'équilibre, remplacement de repas, suivi des repas cuisinés et liste de courses regroupée par catégories.

Source d'inspiration principale : [Le plein d'idées recettes - Crous Lyon](https://www.crous-lyon.fr/se-restaurer/idees-recettes-a-refaire-chez-soi/).

## Vision du projet

Les calendriers recettes du Crous de Lyon sont déjà très adaptés à la vie étudiante : ils proposent des idées de repas par saison, des recettes salées, sucrées, des petits-déjeuners, des listes de courses et des astuces pour cuisiner avec peu de moyens. Le site du Crous indique notamment que ces calendriers contiennent des recettes de saison, simples, rapides, peu coûteuses, réalisables avec peu de matériel, ainsi que des listes de courses hebdomadaires pour s'organiser et faire des économies.

Broco-Chou reprend cette logique et la rend plus actionnable :

- au lieu de feuilleter un calendrier, l'étudiant choisit les recettes qui l'intéressent ;
- au lieu de composer sa semaine à la main, l'application génère un planning ;
- au lieu de recopier les ingrédients, elle produit une liste de courses ;
- au lieu d'avoir un calendrier identique pour tout le monde, elle tient compte des préférences, du matériel disponible, de la saison et des répétitions ;
- au lieu d'être seulement une source d'idées, elle devient un outil d'organisation.

Le projet se positionne donc comme une version numérique augmentée du calendrier des repas du Crous de Lyon : économique, utile, mobile-first et pensée pour des étudiants qui veulent manger correctement sans exploser leur budget ni passer deux heures à planifier.

## Public cible

Broco-Chou vise principalement :

- les étudiants en résidence universitaire ou en studio ;
- les étudiants avec un budget alimentaire serré ;
- les personnes qui disposent de peu de matériel de cuisine ;
- les utilisateurs qui veulent limiter les achats inutiles ;
- les personnes qui cherchent des recettes simples, de saison et répétables ;
- les étudiants qui veulent organiser leur semaine sans se prendre la tête.

Le projet est particulièrement adapté à un usage mobile : on peut choisir ses recettes dans les transports, vérifier son repas du soir avant de rentrer, puis ouvrir la liste de courses directement au supermarché.

## Fonctionnalités principales

### Onboarding

Au premier lancement, l'application présente rapidement le concept :

- recettes de saison ;
- planning automatique sur 7 jours ;
- liste de courses intégrée ;
- logique anti-répétition ;
- recettes issues des calendriers du Crous.

L'onboarding est volontairement court : l'objectif est que l'utilisateur puisse commencer immédiatement à préparer sa semaine.

### Tableau de bord

L'écran d'accueil sert de point de contrôle :

- message d'accueil ;
- état du planning en cours ;
- nombre de repas cuisinés dans la semaine ;
- accès rapide au swipe ;
- accès rapide à la liste de courses ;
- suggestion du jour ;
- suggestions pour compléter la semaine ;
- statistiques simples sur les plats et desserts prévus.

Le tableau de bord oriente l'utilisateur vers l'action la plus utile selon son état actuel : commencer une sélection, consulter son planning, compléter ses repas ou ouvrir ses courses.

### Sélection de recettes par swipe

Le swipe deck permet de parcourir les recettes une par une, dans un format très direct :

- swipe à droite pour accepter une recette ;
- swipe à gauche pour la refuser pour cette semaine ;
- bouton favori ;
- bouton d'annulation du dernier choix ;
- progression dans la base de recettes ;
- compteur de plats principaux ;
- compteur de desserts ;
- accès à la fiche complète de la recette.

Chaque carte recette affiche les informations essentielles :

- image ;
- source Crous ou Broco-Chou ;
- saison et mois ;
- type de repas ;
- temps estimé ;
- portions ;
- difficulté ;
- tags alimentaires ;
- compatibilité sans four ;
- compatibilité micro-ondes ;
- ingrédients principaux.

L'approche par swipe rend la planification plus légère qu'un formulaire classique : l'étudiant décide vite, selon ses envies, son budget, son matériel et son temps.

### Fiche recette détaillée

Chaque recette dispose d'une fiche complète sous forme de panneau :

- titre ;
- source ;
- saison ;
- temps de préparation estimé ;
- portions ;
- difficulté ;
- tags alimentaires ;
- image ;
- liste d'ingrédients ;
- étapes de préparation ;
- astuce éventuelle ;
- source PDF et page lorsque l'information existe ;
- ajout au planning.

La fiche permet aussi de cocher les ingrédients et les étapes pendant la préparation. C'est utile dans une petite cuisine, sur téléphone, quand on cuisine avec peu de place.

### Génération du planning hebdomadaire

Après avoir sélectionné suffisamment de recettes, Broco-Chou génère un planning sur 7 jours. La logique actuelle :

- construit une semaine du lundi au dimanche ;
- place principalement les repas du soir ;
- ajoute des desserts si la préférence utilisateur l'autorise ;
- évite de répéter immédiatement les mêmes recettes ;
- limite les répétitions d'ingrédients principaux ;
- favorise les recettes de saison ;
- favorise les recettes du mois courant ;
- calcule un score d'équilibre.

Chaque repas planifié peut ensuite être :

- consulté ;
- marqué comme cuisiné ;
- remplacé par une recette compatible ;
- sauté ;
- intégré à la liste de courses.

### Score d'équilibre

Le score d'équilibre donne un retour rapide sur la variété de la semaine. Il prend en compte :

- la saisonnalité ;
- la diversité des ingrédients principaux ;
- la diversité des sources de protéines ;
- la présence de légumes ;
- la distribution des desserts ;
- la non-répétition des plats.

Ce score n'a pas vocation à remplacer un conseil nutritionnel professionnel. Il sert surtout d'indicateur simple pour éviter une semaine monotone composée toujours des mêmes bases.

### Liste de courses automatique

La liste de courses est générée à partir du planning actif. Elle :

- regroupe les ingrédients de tous les repas non sautés ;
- fusionne les ingrédients identiques ou proches ;
- affiche les quantités quand elles existent ;
- classe les produits par catégories ;
- permet de cocher les articles achetés ;
- affiche la progression des achats ;
- peut être copiée dans le presse-papiers ;
- masque ou affiche les basiques du placard.

Les catégories utilisées sont :

- fruits, légumes et légumineuses ;
- crèmerie et produits laitiers ;
- viandes, poissons et protéines ;
- féculents, pains et céréales ;
- épicerie, condiments et produits sucrés ;
- épices et herbes aromatiques.

La logique des basiques du placard évite de surcharger la liste avec des produits que l'étudiant possède souvent déjà : sel, poivre, huile, vinaigre, farine, sucre, moutarde, beurre, ail, oignon.

### Profil et suivi

La page profil regroupe :

- nombre de semaines planifiées ;
- nombre de recettes cuisinées ;
- nombre de favoris ;
- aperçu des recettes favorites ;
- ingrédients les plus utilisés ;
- accès aux préférences ;
- historique prévu ;
- réinitialisation des swipes pour revoir les recettes refusées.

Le profil donne une dimension de suivi personnel, utile pour comprendre ses habitudes et éviter de refaire toujours les mêmes repas.

### Préférences utilisateur

Le store prévoit des préférences personnalisables :

- régime alimentaire : omnivore, végétarien, pescetarien, sans porc, sans poisson ;
- ingrédients exclus ;
- ingrédients favoris ;
- types de repas à planifier ;
- inclusion ou non des desserts ;
- inclusion éventuelle des petits-déjeuners ;
- répétition maximale par mois ;
- équipement disponible ;
- niveau de budget ;
- niveau de difficulté accepté.

Ces préférences servent à adapter la recommandation et la planification. Le profil étudiant est le réglage par défaut, avec une priorité donnée aux recettes accessibles.

## Logique de recommandation

La recommandation repose sur un score attribué à chaque recette. Une recette peut gagner ou perdre des points selon plusieurs critères.

Pénalités :

- recette déjà cuisinée récemment ;
- ingrédient principal déjà trop présent dans la sélection ;
- type de repas trop fréquent ;
- recette hors saison ;
- recette refusée plusieurs fois ;
- incompatibilité avec le régime alimentaire ;
- présence d'un ingrédient exclu ;
- besoin d'un four si l'utilisateur n'en possède pas ;
- difficulté trop élevée par rapport au niveau choisi.

Bonus :

- recette du mois courant ;
- recette de la saison courante ;
- recette validée comme source Crous ;
- ingrédients canoniques vérifiés ;
- diversité des protéines ;
- présence d'ingrédients favoris ;
- recette sans four pour profil étudiant ;
- compatibilité micro-ondes.

Cette logique correspond bien à la réalité étudiante : ce n'est pas seulement "qu'est-ce qui est bon ?", mais aussi "qu'est-ce qui est faisable ce soir, avec mon matériel, mon budget et ce qu'il me reste d'énergie ?".

## Données métier

Le type principal est `Recipe`. Une recette contient notamment :

- `id` : identifiant unique ;
- `nom` : nom de la recette ;
- `description` : description optionnelle ;
- `saison` : hiver, printemps, été ou automne ;
- `mois` et `mois_numero` : rattachement temporel ;
- `semaine` et `jour` : placement éventuel dans un calendrier source ;
- `tag` : type de repas ;
- `categorie` : salé ou sucré ;
- `portions` : nombre ou indication de portions ;
- `estimatedTime` : temps estimé ;
- `difficulty` : très facile, facile ou intermédiaire ;
- `imageUrl` : image associée ;
- `ingredients` : liste structurée d'ingrédients ;
- `instructions` : étapes de préparation ;
- `astuce` : conseil pratique ;
- `cuisson_micro_ondes` : compatibilité micro-ondes ;
- `sans_four` : recette réalisable sans four ;
- `source` : Crous ou Broco-Chou ;
- `source_pdf` et `source_page` : traçabilité de la source ;
- `dietary_tags` : tags alimentaires ;
- `main_ingredients` : ingrédients principaux ;
- `equipment` : matériel nécessaire ;
- `canonical_ingredients_status` : niveau de vérification des ingrédients.

Les autres objets importants :

- `PlannedMeal` : repas placé dans un jour et un créneau ;
- `WeeklyPlan` : planning complet de la semaine ;
- `RecipeHistory` : historique des recettes cuisinées ou sautées ;
- `UserPreferences` : préférences utilisateur ;
- `GroceryItem` : article de liste de courses ;
- `GroceryList` : liste de courses générée.

## Architecture technique

Le projet est une application Next.js moderne, construite avec React, TypeScript et une interface mobile-first.

### Stack principale

- Next.js 16 ;
- React 19 ;
- TypeScript ;
- Tailwind CSS 4 ;
- Zustand pour l'état client ;
- Zustand Persist pour conserver les données localement ;
- Framer Motion pour les transitions et les interactions de swipe ;
- Radix UI pour les primitives d'interface ;
- Lucide React pour les icônes ;
- Supabase comme source de données distante optionnelle ;
- Vercel Analytics prévu dans les dépendances.

### Organisation des dossiers

```txt
app/
  layout.tsx            Layout global Next.js
  page.tsx              Point d'entrée de l'application
  globals.css           Styles globaux côté app

components/
  broco-chou-app.tsx        Orchestrateur principal des écrans
  onboarding.tsx        Première prise en main
  home-dashboard.tsx    Tableau de bord
  swipe-deck.tsx        Sélection des recettes
  weekly-calendar.tsx   Planning hebdomadaire
  grocery-list.tsx      Liste de courses
  profile-page.tsx      Profil utilisateur
  recipe-detail-sheet.tsx
                         Fiche recette détaillée
  bottom-navigation.tsx Navigation mobile
  ui/                   Composants UI réutilisables

lib/
  types.ts              Types métier
  store.ts              Store Zustand persistant
  recipe-logic.ts       Scoring, équilibre, anti-répétition
  supabase-recipes.ts   Chargement des recettes Supabase
  mock-recipes.ts       Données locales de secours
  recipe-images.ts      Résolution des images de recettes
  utils.ts              Utilitaires UI

supabase/
  migrations/           Schéma SQL
  seed.sql              Données de seed
  config.toml           Configuration Supabase locale

scripts/
  generate-supabase-seed.mjs
  generate_supabase_seed_from_sources.py
  inspect_xlsx_xml.py
```

### Flux applicatif

1. L'utilisateur arrive sur l'onboarding.
2. Une fois l'onboarding validé, l'application affiche le tableau de bord.
3. Au chargement, l'application tente de récupérer les recettes depuis Supabase.
4. Si Supabase n'est pas configuré ou indisponible, les recettes locales sont utilisées.
5. L'utilisateur swipe des recettes.
6. Les recettes acceptées sont stockées localement.
7. Broco-Chou génère un planning hebdomadaire.
8. L'utilisateur ajuste son planning si besoin.
9. L'application génère la liste de courses.
10. Les choix, favoris, préférences, planning et courses persistent dans le navigateur.

## Persistance locale

Le store Zustand est persisté sous la clé `broco-chou-storage`. Les données conservées localement incluent :

- actions de swipe ;
- recettes acceptées ;
- recettes refusées ;
- recettes favorites ;
- planning hebdomadaire ;
- historique ;
- préférences ;
- liste de courses ;
- état de complétion de l'onboarding.

Cette persistance rend l'application pratique au quotidien : l'utilisateur peut fermer l'onglet, revenir plus tard et retrouver son planning.

## Supabase

Supabase sert de source de données distante pour les recettes. L'application lit une table configurable via variable d'environnement.

Variables attendues :

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_RECIPES_TABLE=recipes
```

### Import de recettes Instagram (développement)

La page `/admin/import` permet de créer une recette à partir du texte d'une publication ou d'un Reel Instagram, puis de choisir une image Pexels. Ajoutez ces variables uniquement dans `.env.local` :

```env
PEXELS_API_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

La clé de service est utilisée côté serveur uniquement pour enregistrer la recette et ne doit jamais être préfixée par `NEXT_PUBLIC_`.

### Ajout de données avec la CLI Supabase

La CLI Supabase permet aussi d'ajouter ou de vérifier des données SQL. La cible dépend de la commande utilisée :

```bash
# Exécute un script SQL sur le projet Supabase lié (peut être la production)
npx supabase db query --linked --file chemin/vers/import.sql

# Vérifie les données sur le projet lié
npx supabase db query --linked "select id, nom from public.recipes limit 10;"
```

Avant toute écriture, vérifier que le projet lié est bien celui attendu avec `supabase/.temp/linked-project.json`. Les scripts d'import de production doivent être ciblés, transactionnels, et ne doivent pas utiliser `truncate` sauf si le remplacement complet des données est volontaire.

Les commandes locales de la CLI, notamment `npx supabase start`, utilisent Docker pour générer une base locale de développement à partir des migrations et du seed. Cette base locale est distincte de la production : elle peut être réinitialisée sans modifier le projet Supabase distant. Ne pas confondre `--local` (développement Docker) et `--linked` (projet Supabase distant).

#### Ajout d'une recette en production (projet Supabase lié)

1. Créer un fichier SQL temporaire contenant une transaction ciblée, par exemple `supabase/import-recipe.sql`.
2. Exécuter le fichier sur le projet lié :

```bash
npx supabase db query --linked --file supabase/import-recipe.sql
```

3. Vérifier la recette ajoutée avec une requête de lecture :

```bash
npx supabase db query --linked "select id, nom, source, portions from public.recipes where id = 'recipe-id';"
```

4. Supprimer le fichier SQL temporaire s'il ne doit pas être conservé dans le dépôt.

Si une nouvelle valeur est nécessaire pour une contrainte (par exemple une nouvelle `source`), créer d'abord une migration dans `supabase/migrations/`, puis l'appliquer explicitement :

```bash
npx supabase db push --linked --yes
```

Ne jamais utiliser `supabase db reset` contre la production : cette commande réinitialise les données. Pour la production, utiliser des `insert` ciblés et éviter `truncate`.

#### Ajout d'une recette dans les seeds de développement (Docker)

La base Docker locale est construite à partir des migrations et de `supabase/seed.sql`. Pour ajouter une recette au jeu de données de développement, modifier ou régénérer ce fichier de seed, puis réinitialiser uniquement la base locale.

```bash
# Démarre les services Supabase locaux dans Docker
npx supabase start

# Régénère le seed depuis les sources du projet, si nécessaire
py scripts/generate_supabase_seed_from_sources.py

# Recrée la base Docker locale, applique les migrations puis supabase/seed.sql
npx supabase db reset --local
```

`supabase/seed.sql` peut contenir `truncate` car il est destiné à reconstruire la base de développement locale. Cette commande avec `--local` ne modifie jamais le projet Supabase de production. Ne pas utiliser `--linked` pour un seed destructif.

#### Modèle SQL complet

Ce modèle ajoute les ingrédients manquants sans écraser ceux qui existent déjà, puis ajoute une recette avec tous les attributs de `public.recipes`. Remplacer les valeurs d'exemple avant exécution.

```sql
begin;

insert into public.ingredients (name, category, aliases)
values
  ('ingrédient principal', 'Fruits, légumes et légumineuses', array['alias éventuel'])
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
  'instagram-nom-recette-identifiant',
  'Nom de la recette',
  'Description courte.',
  'été',
  'juin',
  6,
  null,
  null,
  'déjeuner/dîner',
  'salé',
  null,
  '2 personnes',
  30,
  'facile',
  'https://images.pexels.com/photos/exemple.jpeg',
  '[{"name":"ingrédient principal","quantity":"200","unit":"g","canonical":true}]'::jsonb,
  '["Première étape.","Deuxième étape."]'::jsonb,
  'Astuce facultative.',
  false,
  true,
  'instagram',
  'https://www.instagram.com/p/identifiant/',
  null,
  array['végétarien'],
  array['ingrédient principal'],
  array['saladier', 'poêle'],
  'partial'
);

commit;
```

Les colonnes `id`, `created_at` et `updated_at` de `public.ingredients` sont générées automatiquement. Les colonnes `created_at` et `updated_at` de `public.recipes` sont également générées automatiquement. Les valeurs actuellement acceptées pour `source` sont `crous`, `lumora`, `broco-chou` et `instagram`.

`NEXT_PUBLIC_SUPABASE_RECIPES_TABLE` est optionnelle. Si elle n'est pas définie, l'application utilise `recipes`.

### Schéma principal

La migration crée deux tables :

- `public.recipes` : recettes complètes ;
- `public.ingredients` : référentiel d'ingrédients.

La table `recipes` contient :

- identifiant texte ;
- nom ;
- description ;
- saison ;
- mois ;
- semaine et jour ;
- catégorie ;
- portions ;
- temps estimé ;
- difficulté ;
- image ;
- ingrédients en JSONB ;
- instructions en JSONB ;
- astuce ;
- indicateurs micro-ondes et sans four ;
- source ;
- PDF et page source ;
- tags alimentaires ;
- ingrédients principaux ;
- équipement ;
- statut de vérification canonique ;
- dates de création et de mise à jour.

Des index sont prévus sur la saison, le mois, la catégorie, la source, les tags alimentaires, les ingrédients principaux et les ingrédients JSONB.

La Row Level Security est activée, avec des politiques de lecture pour les rôles `anon` et `authenticated`.

## Installation

Prérequis :

- Node.js récent compatible avec Next.js 16 ;
- pnpm recommandé, car le projet contient un `pnpm-lock.yaml` ;
- un projet Supabase si l'on veut utiliser la base distante.

Installer les dépendances :

```bash
pnpm install
```

Lancer le serveur de développement :

```bash
pnpm dev
```

L'application est ensuite disponible sur :

```txt
http://localhost:3000
```

Construire pour la production :

```bash
pnpm build
```

Démarrer la version de production :

```bash
pnpm start
```

Lancer le lint :

```bash
pnpm lint
```

## Scripts disponibles

Dans `package.json` :

- `dev` : démarre Next.js en développement ;
- `build` : compile l'application ;
- `start` : démarre l'application compilée ;
- `lint` : lance ESLint sur le projet.

Dans `scripts/` :

- `generate-supabase-seed.mjs` : génération de seed Supabase côté Node ;
- `generate_supabase_seed_from_sources.py` : génération de seed depuis des sources de données ;
- `inspect_xlsx_xml.py` : inspection de fichiers XLSX/XML.

Ces scripts servent à préparer ou analyser les données recettes utilisées par Supabase.

## Expérience utilisateur prévue

Le parcours idéal tient en quelques minutes :

1. L'étudiant ouvre l'application.
2. Il passe l'onboarding.
3. Il swipe les recettes qui lui donnent envie.
4. Il garde au moins quelques plats principaux et desserts.
5. Broco-Chou génère une semaine.
6. Il remplace un repas s'il ne lui convient pas.
7. Il génère la liste de courses.
8. Il coche les articles au fur et à mesure.
9. Il suit les étapes de recette le soir venu.

Ce parcours répond à trois problèmes fréquents :

- manque d'idées ;
- manque d'organisation ;
- achats non optimisés.

## Pourquoi c'est utile pour un étudiant

Broco-Chou est pensé autour de contraintes très concrètes :

- petit budget alimentaire ;
- peu d'ustensiles ;
- parfois pas de four ;
- peu de temps entre les cours, le travail et les transports ;
- envie de manger autre chose que des pâtes tous les soirs ;
- besoin de courses simples et groupées ;
- fatigue décisionnelle en fin de journée.

L'application aide à décider une fois pour toute la semaine. Elle réduit les achats impulsifs, évite les doublons, encourage les recettes de saison et facilite la cuisine en studio.

## Relation avec le Crous de Lyon

Ce projet n'est pas un service officiel du Crous de Lyon. Il s'agit d'une application inspirée par les calendriers et idées recettes publiés par le Crous de Lyon, avec une approche numérique et personnalisable.

Le Crous de Lyon met en avant :

- des calendriers par saison ;
- des recettes salées ;
- des recettes sucrées ;
- des petits-déjeuners ;
- des listes de courses ;
- des conseils nutritionnels ;
- des astuces ;
- des recettes pensées pour être peu coûteuses ;
- des recettes adaptées à peu de matériel ;
- des recettes sans four dans certains contenus vidéo.

Broco-Chou transforme ces principes en expérience interactive : choix, recommandation, planning, courses et suivi.

## Limites actuelles

Le projet est déjà fonctionnel, mais certaines limites existent :

- la page de préférences est prévue mais pas encore entièrement développée comme écran de configuration complet ;
- l'historique est présent dans le modèle et le profil, mais l'ajout automatique après cuisine peut être enrichi ;
- la combinaison des quantités reste simple et concatène parfois les valeurs ;
- la reconnaissance d'ingrédients similaires repose sur une normalisation basique ;
- le planning cible surtout les dîners et desserts ;
- les petits-déjeuners sont prévus dans les types, mais pas encore centraux dans le parcours ;
- l'authentification utilisateur n'est pas encore intégrée ;
- les données personnelles sont persistées localement dans le navigateur.

## Améliorations possibles

Pistes fonctionnelles :

- écran complet de préférences ;
- filtres par budget, matériel, durée, régime et saison ;
- génération de planning pour déjeuner et dîner ;
- gestion des restes ;
- estimation de coût par recette ;
- mode "j'ai déjà ces ingrédients" ;
- favoris mieux intégrés au planning ;
- export ou partage de la liste de courses ;
- historique détaillé des semaines ;
- notation des recettes ;
- suggestions anti-gaspillage ;
- mode batch cooking étudiant ;
- remplacement intelligent selon le temps disponible.

Pistes techniques :

- authentification Supabase ;
- synchronisation multi-appareils ;
- tests unitaires sur `recipe-logic.ts` ;
- tests d'intégration sur la génération de planning ;
- amélioration du parsing des quantités ;
- référentiel d'ingrédients plus robuste ;
- recherche plein texte ;
- pagination ou chargement progressif des recettes ;
- cache côté client ;
- dashboard d'administration des recettes ;
- pipeline d'import depuis les sources Crous.

## Licence et attribution

Les recettes et l'inspiration éditoriale proviennent des contenus publics du Crous de Lyon. Le projet doit conserver une attribution claire vers la source et ne pas se présenter comme une application officielle du Crous.

Source : [Crous Lyon - Le plein d'idées recettes](https://www.crous-lyon.fr/se-restaurer/idees-recettes-a-refaire-chez-soi/). et [Manger mieux](https://www.mangerbouger.fr/manger-mieux )

## Résumé

Broco-Chou est une application étudiante de planification alimentaire. Elle rend les calendriers de recettes du Crous de Lyon plus faciles à utiliser au quotidien grâce à une expérience mobile, personnalisable et orientée action.

Elle aide à répondre à une question très simple : qu'est-ce que je mange cette semaine, sans dépenser trop, sans perdre du temps et sans refaire toujours la même chose ?
