# Broco-Chou — Architecture technique

**Objectif :** Décrire les composants, environnements, conventions et limites techniques vérifiés.
**Dernière mise à jour :** 2026-11-03
**Statut :** EXISTANT audité depuis `main/e89d109` ; configuration Cloud lue sans modification.
**Documents liés :** [Produit](PRD.md), [Parcours](APP_FLOW.md), [Schéma backend](BACKEND_SCHEMA.md), [Design](DESIGN_BRIEF.md), [Roadmap et tests](ROADMAP.md), [ADR](DECISIONS.md).

## Stack et organisation

Versions résolues par [package-lock.json](../package-lock.json), qui fait foi pour `npm ci` ; les intervalles du manifeste ne sont pas des versions installées garanties.

| Technologie | Version résolue | Rôle |
| --- | --- | --- |
| Next.js | 16.4.4 | Version déjà installée par le propriétaire avant ce nettoyage ; App Router et développement Webpack |
| React / React DOM | 19.2.6 | Interface et état des composants |
| TypeScript | 5.7.3 | Typage strict, alias `@/*` vers racine |
| Tailwind CSS / `@tailwindcss/postcss` | 4.3.3 | Correctifs compatibles appliqués ensemble |
| Zustand | 5.0.13 | Store client et middleware persist |
| Framer Motion | 12.38.0 | Swipe et transitions |
| `@supabase/supabase-js` | 2.117.3 | Auth, REST, RPC, Storage |
| Supabase CLI | 3.0.0 | Version locale du propriétaire conservée et testée ; aucune restauration de v2 |
| Radix Dialog | 1.1.15 | Exemple de primitive shadcn/ui ; les versions Radix diffèrent par paquet |
| Lucide React | 0.564.0 | Icônes |
| Formulaires | FormData et validation manuelle | React Hook Form / resolvers / Zod retirés : aucun consommateur actif ni script associé |
| Vercel Analytics | 1.6.1 | Composant chargé uniquement en production |
| ESLint / typescript-eslint | 10.14.0 / 8.72.1 | Rétablissement après rétrogradation locale en 4.0.0 / 8.14.0 ; plugin Next aligné en 16.4.4 |
| PostCSS | 8.5.32 | Correctifs compatibles, ancienne installation locale 8.5.23 |

Autres dépendances actives conservées : Sonner 1.7.4, next-themes 0.4.6 (Toaster), class-variance-authority, clsx et tailwind-merge 3.6.0. Date-fns, react-day-picker, Vaul, Recharts, embla-carousel, cmdk et input-otp ne servaient qu'aux primitives jamais montées et sont retirés. Les trois Radix actifs (Dialog, Slot, Switch) restent à leurs versions existantes. Le manifeste est nommé `my-project` version `0.1.0`, privé, et annonce `npm@12.0.2`. Node ≥22.13 est maintenant déclaré dans `engines` pour ESLint ; tests sur Node 26.8.2, pas sur chaque version minimale. PostgreSQL local : major 17 ; PostgREST local `v14.18` conservé.

Ces choix sont conservés pour stabilité et coûts minimaux. Aucun nouveau framework ni SDK d'e-mail ajouté. `shadcn/ui` est du code dans `components/ui/`, pas un service distant.

| Répertoire | Responsabilité |
| --- | --- |
| `app/` | Layout, `/`, import manuel et API |
| `components/` | Orchestrateur, compte, écrans et primitives UI |
| `lib/` | Types, store, calculs, mapping Supabase, images et notifications |
| `public/` | Icônes, images locales et placeholders |
| `scripts/` | Exploitation locale, contrôles et préparation des imports |
| `supabase/` | Configuration, migrations, seeds, imports sources et snippets historiques |
| `docs/` | Sept références canoniques ; aucune seconde roadmap |

## Architecture

### Préparations et choix manuel — 2026-11-03

`WeeklyPlanEditor` conserve le store local existant : choisir date/créneau, rechercher, consulter puis ajouter le résultat. `normalizeRecipeSearch` neutralise accents, ligatures, ponctuation et casse ; chaque mot doit figurer dans le titre, indépendamment de l'ordre. Filtres repliés par défaut et cumulables, résultats alphabétiques par groupes de 20. Les recettes déjà planifiées restent visibles avec leur destination et leur choix désactivé ; un remplacement est confirmé dans Dialog avant l'appel à `setMealInPlan`. Les accès depuis une fiche et Mes recettes ouvrent ce même éditeur. Aucun service de recherche ni stockage distant ajouté.

L'audit des PDF Crous a identifié des passages en gras omis et des colonnes de recettes décalées. [crous-preparations.json](../lib/data/crous-preparations.json) conserve 300 préparations, 1 358 étapes, quatre empreintes SHA-256 des sources, les pages et les anciens textes servant de garde. Neuf listes d'ingrédients/portions associées au mauvais plat sont restaurées ; elles restent `partial`, sans prétendre à une validation canonique. Deux titres tronqués sont complétés. Cinq adaptations éditoriales explicites rendent les recettes indépendantes des restes d'un jour précédent ; les sous-titres sont replacés devant l'étape concernée.

[restoreRecipePreparation](../lib/recipe-preparation.ts) applique ces corrections uniquement aux recettes `crous` d'ID, source PDF, titre et ancien texte connus, au mapping Supabase et à la consultation d'une ancienne fiche persistée. Les ingrédients et portions ont aussi leurs gardes ; toute modification ultérieure gagne. Les recettes communautaires restent intactes. La base et les seeds ne sont pas modifiés : les autres clients, dont Notion, gardent les anciennes données tant qu'une correction durable distincte n'est pas préparée et autorisée. Ce choix est consigné dans [ADR-011](DECISIONS.md#adr-011--restaurer-les-préparations-crous-par-corrections-ciblées).

Reconstruction sans accès réseau/base : `py scripts/restore-crous-preparations.py --source-dir <dossier-des-quatre-PDF> --check` compare le fichier versionné, avec PyMuPDF installé dans l'environnement Python externe existant. Le dossier des PDF est fourni explicitement ; il n'est pas supposé présent sur chaque poste. `--catalog <export-json>` sert à la première construction depuis un export anonyme en lecture seule ; sans ce paramètre, les données d'origine du fichier versionné servent d'entrée. Aucune dépendance npm ajoutée, aucun générateur historique/seed réécrit.

Contrôles : `node scripts/verify-preparations.mjs` vérifie toutes les étapes/gardes ; `node scripts/audit-preparation-catalog.mjs` audite le catalogue local anonymement, `--remote-readonly` lit seulement le catalogue public du projet Cloud attendu. Ce dernier n'utilise jamais la clé de service. `node scripts/verify-planning-browser.mjs`, avec `PLAYWRIGHT_MODULE` vers l'installation externe, teste ordinateur et Pixel 7 émulé, réseau externe bloqué et profil visiteur vierge : recherche/filtres/vide, jour/créneau, consultation intégrale et clavier/focus, ajout/remplacement/annulation, unicité, retrait/annulation, courses et rechargement. Aucune fixture SQL ni compte créé par ce test ; seul son navigateur reçoit un plan local. Les contrôles structurels ne constituent pas une recette exécutée en cuisine ni une relecture culinaire exhaustive City Café (CAT-02).

```mermaid
flowchart LR
  U[Navigateur React] --> A[AccountProvider]
  U --> Z[Zustand]
  Z --> L[localStorage par compte]
  A --> C[Client Supabase JS]
  C --> AUTH[Supabase Auth]
  C --> REST[REST et RPC PostgreSQL]
  REST --> RLS[RLS et fonctions validées]
  C --> ST[Storage privé]
  U --> N[API Next.js]
  N --> IMP[Import manuel serveur en développement]
  N --> MAIL[Notifications Mailpit locales]
  AUTH --> SMTP[Envoi intégré Cloud ou Mailpit local]
```

`app/page.tsx` rend `BrocoChouApp`. Les onglets et panneaux sont des états React, sans route dédiée. Le navigateur lit directement Supabase avec la clé anonyme et la session. Les écritures communautaires utilisent des RPC validées et RLS ; les API Next.js ne sont pas un backend universel. Pas de `@supabase/ssr`, de middleware Auth ni de sessions serveur propres au projet.

`AccountProvider` diffère les opérations Supabase hors du callback Auth pour éviter le verrou de session ; l'identité et un numéro de génération isolent les réponses asynchrones. Il hydrate l'espace local avant de rendre les écrans. Les recettes sont paginées par 500, puis filtrées si elles n'ont aucun ingrédient ; les photos privées sont signées pour 7200 secondes. La table de lecture peut être configurée ; RPC, API d'import et modération ciblent toujours `public.recipes`.

### État local et données Cloud

| Donnée | Propriétaire / persistance |
| --- | --- |
| Compte, confirmation, sessions | Supabase Auth ; session navigateur du SDK |
| Catalogue, ingrédients, recettes personnelles, décisions | PostgreSQL avec RLS |
| Photos communautaires | Storage `recipe-photos`, accès signé selon visibilité |
| Swipe, acceptées, refusées, favoris | Zustand persist / navigateur |
| `weeklyPlan`, `recipeHistory`, `preferences`, `householdSize`, `groceryList`, onboarding | Zustand persist / navigateur |
| `recipeCatalog`, file `recipes`, index, `currentStep` | État mémoire, exclus de `partialize` |
| Onglet, modales, filtres éditeur, coches de préparation | État React éphémère |

Clé visiteur : `broco-chou-storage` ; compte : `broco-chou-account-<uuid>`. `switchPlanningAccount` utilise temporairement un adaptateur sans écriture pour ne pas écraser l'ancien compte pendant le reset, puis hydrate la nouvelle clé. Aucune migration distante ni synchronisation de plans. Les objets `Date` persistés sont des chaînes JSON ; les consommateurs doivent employer `new Date(...)` avant calcul/comparaison. Le type `GroceryList` existe mais le store persiste directement `GroceryItem[]` sans date de génération.

### To Eat List — état observé et contrat à définir

Le propriétaire a identifié [To Eat List](https://app.notion.com/p/To-Eat-List-4d3b60cd4d4442d5b4f1ff0fa0b2a9b0) comme référentiel durable demandé. Au cours de la revue du 2026-10-17, lecture seule de la page et des trois sources suivantes ; aucune écriture Notion ni configuration de connecteur dans l'application. Les accès du plugin de cette session sont distincts des capacités du code Broco-Chou.

| Source Notion | Identifiant de source | Schéma observé et écart technique |
| --- | --- | --- |
| [Recettes](https://app.notion.com/p/2e730fe88d9a4064b54fd0361bc014d4) | `c1c0afd4-a307-432e-89dc-848c69343c25` | Propriétés `Name`, `Repas`, `Tags`, `Ingrédients` (relation), `Durée totale`, `URL`, dates, favoris/essayé. Pas de propriétés dédiées portions, instructions ou ID Broco-Chou dans le schéma lu |
| [Ingrédients](https://app.notion.com/p/02e2e66e177540f99676a22dc3c40d9d) | `254e9916-b826-4576-bcd7-9665ca19fde8` | `Article`, `Catégorie`, `Rayon`, `Quantité`, relation `Recettes`, remarques et achat. La quantité portée par un ingrédient partagé ne décrit pas à elle seule la quantité par recette |
| [Meal Plan](https://app.notion.com/p/0015f4cce9f84dfb90c4a5bcc753b5ef) | `ae848e1d-de23-4643-b85b-2689d54b7154` | `Jour`, `Date`, textes `Petit-Déjeuner`, `Déjeuner`, `Dîner`, `Snacks` ; pas de relation recette dans le schéma lu. Source candidate de menus, pas preuve d'une synchronisation des plans navigateur |

Deux lignes de recettes ont été échantillonnées et [une fiche détaillée](https://app.notion.com/p/360173c57e0481f38766fbe5aa7445a6) lue : son corps contient informations culinaires, ingrédients/quantités, étapes et ID métier ; l'image est une URL Pexels externe présente aussi en couverture. Certains libellés d'étapes de cet échantillon paraissent tronqués ; qualité/complétude à contrôler avant toute reprise automatique. L'existence de ces données dans Notion ne prouve aucun transfert depuis l'application actuelle. Les réponses fetch portent une date d'instantané « as of 2026-05-14 », antérieure à cette revue : fraîcheur non garantie. L'échantillon n'est pas un audit de tout le catalogue.

Recherche dans frontend, API, scripts, migrations, dépendances et exemple de configuration : aucun client Notion, mapping d'identifiants Notion/Supabase, flux de synchronisation ni test de restauration To Eat List trouvé. Les correspondances d'ID, blocs de contenu, unités/portions, catégories, médias durables, auteurs/modération, conflits et suppressions restent un contrat à définir. **Exigence produit** : Notion fait autorité et doit rester récupérable indépendamment de Broco-Chou ; **état technique** : non implémenté. Les tâches et critères uniques sont DB-05/06 dans la [roadmap](ROADMAP.md), sans nouvelle architecture imposée ici.

### Calculs réellement appelés

Le store ordonne les suggestions par saison et mélange aléatoire. Le générateur puise exclusivement dans les recettes acceptées, exclut les doublons, pénalise un ingrédient principal utilisé ≥2 fois de 30 points, ≥3 fois de 50 points supplémentaires ; bonus saison +20, mois +10. Il remplit déjeuner, dîner, petit-déjeuner puis dessert selon préférences, pour aujourd'hui à J+6.

Le score d'équilibre du store totalise saison 20, variété d'ingrédients 20, protéines 20, légumes 15, desserts 10 et non-répétition 15. C'est un indicateur heuristique dépendant de tags et sous-chaînes. `lib/recipe-logic.ts` expose aussi score avancé, répétition à 21/30 jours, conseils et suggestions ; `scoreRecipe`, `sortRecipesForSwipe` et `preventRepetition` ne pilotent pas le swipe actuel. `planning-summary.tsx` utilise conseils/répétition mais n'est pas monté par l'orchestrateur. Ne pas présenter ces helpers comme garanties de filtrage alimentaire.

Quantités : fractions simples ou préfixes numériques, multiplication par `householdSize`, addition de mêmes suffixes d'unité ; sinon concaténation. Pas de conversion inter-unités et pas de division par portions d'origine. Voir les dettes précises dans la [roadmap](ROADMAP.md).

## Environnements et démarrage

### Local Windows / PowerShell

Prérequis : Node ≥22.13, npm, Docker Desktop démarré avec conteneurs Linux. Préparer les dépendances et images avec Internet ; la CLI est épinglée en 3.0.0, son binaire Windows doit être installé.

```powershell
npx supabase start
npm run dev
```

Première préparation avec Internet : `npm ci`, premier `npx supabase start`, puis `npm run supabase:env`. Ensuite les deux commandes ci-dessus suffisent ; Next.js peut tourner dans un second terminal. Aucun nouveau script npm de démarrage ajouté. `npm run supabase:start` reste une alternative testée ; Mailpit est déjà démarré par Supabase. Redémarrer Next.js après un changement d'environnement. Sans Supabase configuré, la découverte avec mocks reste utilisable ; le compte et la soumission sont indisponibles.

| Service local | Adresse |
| --- | --- |
| Next.js | `http://localhost:3000` |
| API | `http://127.0.0.1:54321` |
| PostgreSQL | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` — identifiants de développement locaux |
| Shadow PostgreSQL | Port 54320 |
| Studio | `http://127.0.0.1:54323` |
| Mailpit | `http://127.0.0.1:54324` |

`start-local-supabase.mjs` masque temporairement les seuls marqueurs de liaison `project-ref`, `linked-project.json`, `pooler-url` dans `.local-start-link-backup`, démarre la pile et les restaure en `finally`. Il fixe `.temp/rest-version` à `v14.18` pour corriger l'erreur intermittente `PGRST303: JWT issued at future` de PostgREST 14.5. Ce correctif est décrit dans la [release PostgREST 14.18](https://github.com/PostgREST/postgrest/releases/tag/v14.18). Ne pas réinitialiser la base pour corriger une session.

```powershell
# Pour recréer les conteneurs avec leurs volumes conservés
npm run supabase:stop
npm run supabase:start
npm run supabase:env
node scripts/verify-local-jwt.mjs
```

L'arrêt normal conserve les données ; `supabase stop --no-backup` efface des volumes locaux et n'est pas une réparation normale. `supabase login` authentifie la CLI, pas les sessions de l'application. Une sauvegarde de liaison déjà présente interrompt volontairement le démarrage : vérifier son contenu avant toute reprise.

### Configuration des fichiers et secrets

[`.env.example`](../.env.example) est l'unique modèle versionné, sans secret réel. Ne pas le charger en production avec ses valeurs vides ; `supabase:env` remplit directement le fichier local à partir de la pile en cours, vérifie l'hôte loopback et conserve les autres lignes ainsi que `.env.local`.

| Support | Usage |
| --- | --- |
| `.env.example` | Inventaire et commentaires ; copie éventuelle pour Cloud/local manuel |
| `.env.development.local` | Valeurs locales prioritaires en `npm run dev`, générées par `supabase:env` |
| `.env.local` | Valeurs de la machine, éventuellement Cloud ; également chargées au build de production local |
| Variables Vercel | Valeurs des déploiements Production/Preview/Development ; aucune exportation secrète nécessaire pour cet audit |
| `supabase/config.toml` | Ports et paramètres de services/Auth locaux, profil distant séparé ; aucun secret SMTP de production |

Priorité Next.js : environnement du processus, `.env.<mode>.local`, `.env.local` (sauf test), `.env.<mode>`, `.env`. Le build ignore `.env.development.local`, utilise les variables Production ou `.env.local` de la machine. Les scripts Node autonomes ne chargent pas ces fichiers automatiquement : examiner chacun avant usage. [Documentation Next.js](https://nextjs.org/docs/app/guides/environment-variables).

| Variable | Portée | Nécessité réelle |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Publique | Catalogue/Auth/Storage, URL locale ou Cloud |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publique | Clé anonyme ; sécurité reposant sur RLS, jamais une clé de service |
| `NEXT_PUBLIC_SUPABASE_RECIPES_TABLE` | Publique, facultative | `recipes` par défaut, seulement pour lecture catalogue |
| `SUPABASE_SERVICE_ROLE_KEY` | Serveur uniquement | Import de développement et notification Mailpit ; pas nécessaire au parcours navigateur de production |
| `CRON_SECRET` | Serveur, facultative | Autorisation GET de reprise locale ; aucun cron configuré |
| `PEXELS_API_KEY` | Script uniquement | Scripts manuels d'enrichissement/téléchargement ; pas API images de l'application |
| `SUPABASE_PROD_SERVICE_ROLE_KEY` | Script privilégié uniquement | Contrôles City Café lisant `.env.local` ; pas variable runtime, jamais à partager avec Preview/local |
| `NEXT_PUBLIC_SUPABASE_LOCAL_PROXY` | Dérivée par `next.config.mjs` | Ne pas définir manuellement ; activée seulement en développement HTTP loopback |
| `TEST_APP_URL`, `PLAYWRIGHT_MODULE` | Processus de test | Extension API du test personnel et chemin d'installation Playwright externe |

Ne jamais journaliser JWT, clés, mots de passe, liens d'Auth à session réelle ou valeurs de fichiers `.env*.local`. `.gitignore` exclut `.env*.local`, `.vercel/`, `.next/`, `.temp/`, `node_modules` et `*.tsbuildinfo`. Les paramètres publics sont incorporés au bundle ; modifier une variable Vercel ne met pas à jour un déploiement déjà construit.

### Téléphone sur le réseau local

```powershell
npm run dev:local -- --hostname 0.0.0.0
```

Cette commande exige une pile locale démarrée. Ouvrir `http://<IPv4-du-PC>:3000`, vérifier `ipconfig`, réseau privé et pare-feu Node/TCP 3000, éviter le Wi-Fi invité isolé. `allowedDevOrigins` contient actuellement `172.20.10.3` et `192.168.1.5` : adapter à l'adresse réelle. Le navigateur envoie Auth/REST/Storage à l'origine Next.js via `/__supabase` ; Next.js contacte le loopback du PC. Pas d'accès direct au loopback du téléphone ni de proxy Cloud/production. Ajouter l'origine exacte du téléphone dans `auth.additional_redirect_urls` avant redémarrage local ; les liens Mailpit peuvent sinon revenir vers localhost. Les fonctions navigateur exigeant un contexte HTTPS sécurisé peuvent manquer en HTTP LAN ; aucune PWA n'est livrée.

Pour revenir volontairement à Cloud en développement, renommer `.env.development.local` en `.env.development.disabled.local`, vérifier la cible de `.env.local` et redémarrer. Le remettre à son nom initial réactive le local. Les comptes locaux et Cloud sont distincts. Ne pas utiliser de vraies données personnelles pour les tests.

### Autonomie hors ligne — résultats du 2026-11-02

Les polices sont des piles système, sans Google Fonts/CDN obligatoire. Notion n'a aucun client ou appel au démarrage dans le code audité ; son futur chantier DB-05/06 est préservé. Le catalogue vient réellement du Supabase local configuré, sans copie automatique de Cloud. Les comptes locaux sont distincts de la production.

Test exécuté : démarrage de `npm run dev` avec le préchargement Node [restrict-external-network.mjs](../scripts/restrict-external-network.mjs), qui refuse DNS, TCP et fetch hors loopback, sans modifier Windows. Son autocontrôle rejette une adresse externe de test et laisse Mailpit local répondre. Chromium bloque séparément toutes ses requêtes hors localhost/127.0.0.1. [verify-offline-browser.mjs](../scripts/verify-offline-browser.mjs) valide 460 recettes réelles, swipe/favori, recherche et filtre de saison, planning manuel, fiche/ingrédients, courses et persistance après rechargement, sur ordinateur et Android émulé. Zéro erreur JavaScript ; les erreurs réseau Pexels provoquées sont attendues. Auth/confirmation/JWT et upload/lecture Storage passent aussi avec le préchargement Node. Les scénarios photo non-admin ordinateur/Android et modération passent avec leurs fixtures locales nettoyées.

Supabase a été arrêté proprement avec sauvegarde normale des volumes, puis redémarré via CLI 3 avec HTTP(S)_PROXY vers un port local indisponible et NO_PROXY loopback. Succès sans téléchargement d'image observé ; huit migrations et empreintes du catalogue/ingrédients/identités/photos existants préservées. Ce proxy ne bloque pas le réseau propre du moteur Docker ni tous les transports possibles du binaire CLI. **Coupure physique WAN, redémarrage Docker Desktop et sélecteur Android natif : NON TESTÉS** ; OPS-05 reste IN_PROGRESS. Aucun reset, seed ou changement de migration appliqué à la base existante.

Les 299 chemins photo locaux du seed/imports sont vérifiés par le résolveur réel. Les 168 URLs Pexels présentes dans 13 fichiers SQL sont conservées avec leurs attributions ; elles sont facultatives grâce à [RecipeImage](../components/recipe-image.tsx), commun au swipe, calendrier, fiche, photo actuelle du formulaire et import. Une erreur affiche `/placeholder.jpg` sans boucle de rechargement ; un changement d'URL essaie la nouvelle photo. Les fichiers locaux explicites gardent priorité ; aucune vraie photo ni attribution remplacée en base. L'aperçu de fichier choisi reste un Blob local via Next Image. `offline:check` vérifie ces garanties au lieu d'exiger la suppression des URLs sources ; il ne prouve pas seul un fonctionnement sans WAN.

À précharger : `node_modules` (Next/SWC, Tailwind/Oxide, Supabase CLI Windows compris), Docker Desktop et les images des services locaux. Les images effectivement utilisées peuvent être listées sans secrets par `docker ps --filter name=recipe-app --format '{{.Image}}'` ; aucune purge de celles des autres projets. `supabase/.temp/doc-tools` et l'installation Playwright externe ont été conservés pour les validations sans téléchargement. Supabase Cloud, téléchargement de photos Pexels, npm/Git distants, Vercel et la future synchronisation Notion nécessitent Internet par conception. Analytics Vercel reste limité au rendu de production et facultatif. Ni PWA, service worker, cache applicatif ni synchronisation différée ajoutés.

Pour terminer OPS-05 sur Windows : fermer les serveurs de test, garder les modules/images et `.env.development.local` loopback ; arrêter normalement Supabase, couper le WAN en conservant localhost, démarrer Docker Desktop puis `npx supabase start` et `npm run dev`. Ouvrir localhost:3000, Studio/Mailpit, rejouer les tests locaux et contrôler la console ; refaire un arrêt/redémarrage complet. Ne pas réinitialiser la base. Pour rejouer le test automatisé sans couper le WAN, définir `PLAYWRIGHT_MODULE` vers l'installation externe, puis `node scripts/verify-offline-browser.mjs` ; `TEST_MOBILE=1` sélectionne l'émulation Android. Le fichier `restrict-external-network.mjs` peut être préchargé par `NODE_OPTIONS=--import=./scripts/restrict-external-network.mjs` dans le seul terminal de test, puis retirer cette variable en fermant ce terminal.

Windows/Analytics : Vector a été observé en redémarrage répété ; le warning TCP 2375 signalé n'a pas été reproduit lors du redémarrage final. API, PostgreSQL, Auth, Storage, Studio et Mailpit ont passé indépendamment de cette collecte de logs. Aucun accès Docker TCP non authentifié activé, aucune fonctionnalité désactivée. La collecte Analytics locale complète reste À CONFIRMER.

### Production et Preview

Production : [recipe-app-alpha-wine.vercel.app](https://recipe-app-alpha-wine.vercel.app), équipe `vertondan-9283s-projects`, projet `recipe-app`, Supabase `cbwrvcifxcqyrgtcpvbd`, région observée `eu-west-1`. `vercel.json` impose `npm ci`, sans cron. Pas de workflow GitHub Actions versionné ni d'instance staging dédiée. Le branchement Git automatique et le commit effectivement servi doivent être vérifiés dans Vercel avant une livraison ; le seul contenu de `main` ne prouve pas le déploiement des migrations.

Lecture Vercel le 2026-10-17 : trois variables publiques Supabase et `RESEND_API_KEY`, chacune ciblant Production et Preview ; pas de `SUPABASE_SERVICE_ROLE_KEY` ni `CRON_SECRET` dans la liste retournée. Valeurs non déchiffrées. Preview peut donc atteindre la même configuration Cloud ; vérifier les cibles sans exporter de secret, et ne jamais supposer l'isolation de ses écritures. `NODE_ENV=production` dans Preview interdit également l'API save et l'envoi Mailpit.

Déployer seulement après revue de branche, contrôles et autorisation du propriétaire. Les migrations SQL ne sont pas exécutées par le build Vercel. L'audit initial n'a effectué aucune écriture de production ni déploiement ; la livraison ultérieure autorisée sur `main` et ses contrôles sont consignés dans le [journal de session](ROADMAP.md).

## Auth et services d'e-mail

Lecture effective de l'API de gestion Supabase le 2026-10-17, paramètres non secrets uniquement : `site_url` et `uri_allow_list` = URL Vercel ; `mailer_autoconfirm=false` ; `smtp_host/port` absents ; utilisateur et mot de passe SMTP non configurés ; `hook_send_email_enabled=false` ; `smtp_max_frequency=60` ; `rate_limit_email_sent=2`. Cela confirme actuellement l'envoi intégré, sans SMTP externe. Les fichiers versionnés seuls n'auraient pas suffi.

Le profil `[remotes.production]` garde confirmations et URL publique distinctes du local. Modifier TOML ne déploie pas ces réglages. Historique repris de l'ancien guide : profil appliqué/vérifié le 2026-10-09 ; liens temporaires générés administrativement testés sans envoi avec retour vers Vercel même pour une demande localhost ; `127.0.0.1` aurait encore été accepté hors liste explicite. Ces tests ne sont pas rejoués et ne prouvent pas la délivrabilité. Utiliser l'URL publique et un nouveau lien, car les anciens e-mails gardent leur URL d'origine. Avant toute future application de configuration, lecture seule possible avec `npx supabase config diff --project-ref cbwrvcifxcqyrgtcpvbd` : vérifier que le profil `remotes.production` est sélectionné, jamais appliquer automatiquement.

Limites officielles consultées le 2026-10-17 : le service intégré est destiné aux essais, envoie aux seules adresses préautorisées des membres de l'organisation, limite actuellement à deux messages par heure et n'offre pas de SLA de livraison. Les membres effectivement autorisés du projet sont [À CONFIRMER] ; l'allowlist administrateur de recettes n'est pas la liste des destinataires SMTP. [Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp).

Auth impose des limites serveur et des réponses 429 ; la configuration locale et l'UI imposent une minute entre demandes de confirmation. Les quotas effectifs autres que les paramètres lus restent [À CONFIRMER]. Le délai UI n'est pas une protection serveur et aucun CAPTCHA n'est ajouté. [Limites Auth](https://supabase.com/docs/guides/auth/rate-limits). Évaluer un SMTP externe seulement lors d'une décision explicite d'ouverture publique ; ne pas désactiver les confirmations.

Mailjet : aucune dépendance, variable active ou transport dans le code de `main`. Le mot `resend` dans `supabase.auth.resend` signifie renvoi de confirmation, sans rapport avec le fournisseur Resend. `RESEND_API_KEY` reste une variable distante candidate au retrait, sans consommation applicative. L'ancien projet d'installation Resend bloqué par `integration_terms_acceptance_required` est abandonné, pas une tâche à reprendre automatiquement. Plan de retrait : vérifier à nouveau projet/cibles et SMTP, faire approuver la suppression de la seule variable Production/Preview, puis contrôler la configuration ; aucune révocation de clé, modification SMTP ni installation Marketplace implicite.

Notifications de modération : transport local Mailpit, outbox durable et reprise manuelle conservés. Le formulaire sollicite désormais l'API seulement en développement avec loopback ; aucune fausse alerte d'invitation en production. Tables, RPC et endpoint sont conservés pour les tests locaux, sans service d'envoi de production.

## Sécurité et exploitation

- Auth SDK conservé : inscription, connexion mot de passe, renvoi, persistance, refresh et déconnexion locale. Pas de remplacement d'authentification.
- RLS et RPC `SECURITY DEFINER` à `search_path=''` protègent les recettes privées. Droits administrateur fondés sur données serveur ; différences Cloud/versionné dans [BACKEND_SCHEMA](BACKEND_SCHEMA.md).
- Photo : bucket privé, chemin par uid, MIME et taille limités, URL signée. Protection par type déclaré, pas preuve d'analyse antivirus ou retrait EXIF.
- Endpoints import : aucune Auth sur page/parse/images ; `save` interdit en production mais n'impose ni rôle ni cible locale en développement. Ne pas exposer le serveur de développement configuré avec une clé Cloud ; sécurisation à planifier avant extension.
- Pas de rate limiter applicatif, validation de taille globale ni schéma Zod sur API import ; payloads mal typés peuvent produire une erreur 500. Ne pas annoncer une protection inexistante.
- Pas de sauvegarde du localStorage dans Cloud ; snapshots/export/restauration des données hébergées et médias à définir et tester, sans supposer les fonctions d'une offre payante.
- Vercel Analytics activé en production via `SiteAnalytics`, sans événements produit ; exclusion des routes `/auth/` et des retours racine de récupération (fragment initial ou intention en mémoire). Pas de service d'erreurs centralisé/Sentry ni de monitoring métier prouvé. Erreurs UI/toasts et console de développement sont les mécanismes actuels.
- `/privacy` décrit les données et prestataires réels, avec liens depuis compte/footer. Conformité RGPD [À CONFIRMER] : coordonnées/contact du responsable, conservation détaillée, bases applicables, suppression/export et garanties de transferts restent à établir. La page d'information n'est pas une certification ou une politique juridique finalisée.

### Récupération de mot de passe — intégration limitée du 2026-11-03

Autorisation explicite du propriétaire : reprendre récupération et confidentialité de `feat/auth-email-readiness`, en excluant Mailjet/OAuth/Turnstile. Portage adapté de `AuthReturn` et du test local, sans fusion globale, changement de SMTP, nouvelle dépendance, migration ni modification de `config.toml`. Inscription, confirmation et redirections existantes restent identiques. Le formulaire ajoute `resetPasswordForEmail({ redirectTo: window.location.origin })`, réponse générique et verrou anti-double soumission/délai UI 60 s. Le retour racine déjà autorisé affiche le même composant que `/auth/reset-password`, ce qui évite d'élargir l'allowlist Cloud.

Le client enregistre uniquement en mémoire le jeton de l'événement `PASSWORD_RECOVERY`, effacé à la connexion ordinaire, déconnexion ou mise à jour utilisateur. [auth-recovery-state.ts](../lib/auth-recovery-state.ts) partage cette intention sans initialiser le SDK depuis Analytics ; l'écoute Auth supplémentaire existe seulement sur un retour de récupération. `AccountProvider` conserve l'initialisation des sessions ordinaires. La fiche exige cet événement, `getUser` et `getClaims` (JWT vérifié, méthode OTP récente) avant `updateUser`. Les fragments ne sont ni logués ni transmis dans les traces/captures de test ; l'URL est nettoyée. La route `/auth/reset-password` porte `noindex/nofollow` et `no-referrer`. Le retour racine est exclu d'Analytics ; après réussite, déconnexion puis rechargement vers la connexion pour effacer l'intention en mémoire. Le renouvellement d'un jeton peut imposer de redemander un lien ; aucun contournement des preuves de récupération n'est ajouté.

Références SDK vérifiées : [resetPasswordForEmail et événement PASSWORD_RECOVERY](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail), [getClaims et vérification JWT](https://supabase.com/docs/reference/javascript/auth-getclaims). Tests : `node scripts/verify-local-recovery.mjs`, puis `node scripts/verify-auth-recovery-browser.mjs` avec `PLAYWRIGHT_MODULE` externe. Gardes loopback, comptes fictifs et nettoyage ciblé des comptes/mails ; vrai e-mail Mailpit et lien consommé, aucune écriture Cloud. Les tests de confirmation/session existants restent requis. La délivrabilité distante reste soumise au SMTP Supabase actuel, sans nouveau fournisseur configuré.

## Qualité, Git et exigences non fonctionnelles

### Inventaire et nettoyage local du 2026-11-02

Inventaire récursif incluant fichiers suivis, non suivis et ignorés : environ 50 188 fichiers, **1 258 757 683 octets** au premier relevé (tailles logiques, pas allocation NTFS ni volumes Docker). 810 fichiers dans l'index Git ; ce nombre inclut les fichiers supprimés tant qu'ils ne sont pas indexés. Le relevé réexécutable [audit-workspace.mjs](../scripts/audit-workspace.mjs) ne lit jamais le contenu des secrets pour son inventaire ; il signale les dossiers illisibles et les liens non parcourus. Les candidats sans chemin d'import ne constituent pas à eux seuls une autorisation de suppression.

| Élément initial | Taille mesurée | Usage / décision et preuve |
| --- | --- | --- |
| `node_modules` | 669 481 250 o | Exécution locale/hors ligne ; conservé. Retrait ciblé des paquets inutilisés via npm, jamais de suppression globale |
| `supabase` | 180 355 386 o | Migrations, seeds, sources, diagnostics et sauvegarde protégée ; conservés |
| `.next` | 156 156 832 o au premier relevé | Généré ; 210 304 214 o mesurés après tests puis supprimés avant régénération. Les caches reconstruits ne sont pas un gain permanent à additionner |
| `public` | 146 126 890 o, 625 fichiers | Médias utiles/compatibilité historique ; tous conservés. 180 doublons binaires représentant 44 897 890 o conservés faute de preuve d'absence de référence historique en base |
| `.git` | 105 161 361 o | Historique ; conservé intégralement |
| `supabase/.temp/doc-tools` | 177 703 795 o (inclus dans supabase) | Mermaid déjà installé pour validation hors ligne ; conservé |
| Sauvegarde de production protégée | 846 602 o (incluse dans supabase) | Sauvegarde existante, non ouverte ni supprimée |
| 55 fichiers UI/hooks sans consommateur et CSS générique | 192 021 o | Supprimés : 51 primitives/hooks UI, deux hooks dupliqués, ancienne RecipeCard, ThemeProvider orphelin et `styles/globals.css`. Vérification des imports Next, scripts, chaînes et documentation ; aucune route supprimée |
| `tsconfig.tsbuildinfo` / bytecode Python de session | 129 490 / 4 986 o au nettoyage | Générés, retirés sans affecter les sources ; TypeScript peut recréer son cache |
| `planning-summary.tsx`, `recipe-logic.ts` | 8 601 / 11 083 o | Non montés mais liés aux algorithmes/backlog ALG-06 ; conservés comme incertains |
| `.env*.local`, sources d'import, migrations/seeds, volumes | Tailles non pertinentes pour une suppression | Conservés. Empreintes locales avant/après : recettes, ingrédients, identités et métadonnées photos inchangés ; tests séparés des octets des photos fictives |

Les six primitives actives sont Button, Dialog, Input, Sonner, Switch, Textarea. Aucun écran, filtre, route API, service Supabase, rôle, média ni chantier Notion retiré. La liste exhaustive des suppressions reste `git diff --name-status`. Les petits outils ajoutés utilisent les dépendances existantes ; aucune nouvelle bibliothèque de nettoyage. `agentRules:false` empêche Next 16.4 de réécrire automatiquement le contrat AGENTS au démarrage ; le bloc injecté pendant l'essai a été retiré, contrat original préservé.

| Mise à jour locale | Avant → après | Justification / limite |
| --- | --- | --- |
| ESLint | 4.0.0 → 10.14.0 | La v4 ignorait la configuration plate ; le premier succès lint était trompeur. Vérification réelle des TS/TSX rétablie |
| typescript-eslint | 8.14.0 → 8.72.1 | Compatibilité ESLint 10 et TypeScript 5.7 vérifiée dans les peerDependencies |
| Plugin ESLint Next | 16.2.6 → 16.4.4 | Alignement sur Next installé |
| Tailwind / plugin PostCSS | 4.3.0 → 4.3.3 | Correctifs compatibles, mises à jour ensemble |
| PostCSS direct | 8.5.23 → 8.5.32 | Correctifs compatibles |
| Next / React / Supabase JS / CLI | 16.4.4 / 19.2.6 / 2.117.3 / 3.0.0 inchangés pendant cette mission | Next et CLI déjà actualisés localement par le propriétaire ; pas de retour vers les versions Git historiques |
| 36 dépendances directes sans consommateur | Retirées | 25 Radix non utilisés, resolvers, Autoprefixer (Tailwind 4 fournit son traitement), cmdk, date-fns, embla, input-otp, day-picker, Hook Form, panels, Recharts, Vaul, Zod. Lockfile maintenu par npm |

Mises à jour différées : React 19.3.1, Supabase JS 2.118.0 et versions récentes des Radix actifs n'apportaient pas de correctif nécessaire à cette mission ; Framer Motion 14, Lucide 1 et TypeScript 7 impliquent une revue de compatibilité. Aucun `npm audit fix --force`. Audit initial : 17 alertes (2 low, 14 moderate, 1 high), contre 11 moderate ensuite, toutes dans l'outillage de développement autour de [minimatch / amplification des globparts](https://github.com/advisories/GHSA-g3hv-75wg-m249). `npm audit --omit=dev` : zéro vulnérabilité. Les rétrogradations ESLint 4/typescript-eslint 8.14 proposées par npm ne sont pas une correction acceptable ; pas d'override forcé vers un nouveau major transitive. SEC-01 reste IN_PROGRESS. Le lockfile a 284 entrées de paquets contre 578 initialement ; la simulation `npm ci --dry-run --offline --ignore-scripts --allow-remote=all --no-audit` passe sans réinstallation. Une simulation n'est pas une restauration depuis un cache npm vide.

CLI 3 : `status -o json` contient toujours API_URL, ANON_KEY et SERVICE_ROLE_KEY, ainsi que des clés modernes supplémentaires ; le générateur d'environnement valide le loopback HTTP et capture les sorties sans exposer un échec CLI contenant des secrets. Les variables utiles résultantes sont identiques au fichier local précédent. `start`, `stop`, statut JSON, `migration list`, wrapper et tests passent. `migration list` cible localement par défaut, même si sa colonne historique s'appelle `remote` ; le résultat testé indique explicitement `target.kind=local`. [Changements v3](https://github.com/supabase/cli/releases/tag/v3.0.0) : `--remote` sélectionne désormais l'hébergé, `--local` est accepté mais obsolète ; les commandes v2 des entrées historiques restent des preuves datées et ne doivent pas être recopiées comme procédure actuelle sans `--help`.

### Scripts historiques conservés après audit

Tous les MJS passent `node --check` et les deux Python passent l'analyse AST sans exécution ni génération. Les générateurs n'ont pas été lancés pour éviter d'écraser les artefacts ; compatibilité métier/source complète non revendiquée. Les scripts ne sont pas importés au démarrage de l'application.

| Script(s) | Rôle / références et reconstruction | Réseau / décision |
| --- | --- | --- |
| `draft-city-cafe-catalog.mjs` | Prépare les lots 05–10 depuis les intitulés, préserve les choix déjà présents dans les JSON ; chaîne générateur/manifeste | Sans fournisseur ; garder pour reconstruction, pas réexécuté |
| `generate-city-cafe-import.mjs` | JSON des lots → SQL, ingrédients et attributions, lit les autres lots | Sans réseau ; garder, génération non rejouée |
| `generate-city-cafe-category-repair.mjs` | Lots → correction des catégories canoniques ; SQL historique conservé | Sans réseau ; garder pour réparation |
| `enrich-city-cafe-pexels.mjs` | Recherche photo officielle, met à jour lots et attributions | API Pexels + clé, Internet ; garder, jamais exécuté au démarrage |
| `refine-city-cafe-desserts.mjs` | Raffinement éditorial du lot 10 avant génération SQL | Sans réseau ; garder pour reconstruction |
| `refresh-city-cafe-missing-images.mjs` | Complète les trois images du lot 09 et la correction SQL | API Pexels, Internet ; garder, pas de téléchargement massif |
| `mark-city-cafe-batch.mjs`, `reject-city-cafe-image.mjs` | Statut du manifeste/ordre et rejet contrôlé d'une sélection photo | Sans réseau ; garder pour maintenance |
| `generate-supabase-seed.mjs` | Mocks → seed local, peut remplacer le seed complet | Sans réseau ; garder, ne pas le substituer au générateur XLSX |
| `generate_supabase_seed_from_sources.py` | XLSX + ingrédients + import hebdomadaire → seed ; arguments de chemins disponibles | Sources externes au dépôt, anciens chemins Windows non portables ; garder, restauration depuis ces sources À CONFIRMER |
| `inspect_xlsx_xml.py` | Inspection XLSX/XML sans bibliothèque tierce | Fichier local requis ; garder pour diagnostic |
| `verify-city-cafe-batch.mjs` | Cohérence JSON/SQL par lot, IDs, champs et images | Sans réseau ; garde éditoriale conservée |
| `verify-city-cafe-image-urls.mjs` | HEAD des vraies images avec timeout | Internet ; garder, non rejoué sans besoin de télécharger/sonder 157 photos |
| `verify-city-cafe-sync.mjs` | Comparaison local/Cloud et attributions ; dépend de Docker et d'une clé serveur distante | Lecture réseau explicite ; garder, pas exécuté pour ce nettoyage local |
| `start-local-supabase.mjs`, `write-local-supabase-env.mjs`, `mailpit.mjs` | Démarrage, environnement et boîte locale ; référencés dans package.json | Docker/loopback, testés v3 ; garder |
| `confirm-local-test-signup.mjs`, `verify-local-auth.mjs`, `verify-local-jwt.mjs`, `verify-local-mailpit.mjs` | Contrats Auth/JWT/proxy/confirmation et nettoyage des comptes/mails fictifs | Loopback uniquement ; rejoués, garder |
| `verify-personal-recipes.mjs`, `verify-recipe-review-browser.mjs`, `verify-recipe-review-migrations.mjs`, `verify-recipe-photo-browser.mjs` | RLS, photos, modération, base éphémère et correctif Android existant | Loopback + Playwright externe ; rejoués, garder |
| `verify-documentation.mjs`, `verify-offline-assets.mjs` | Sept documents/liens et ressources locales | Sans réseau ; garder et actualiser avec le projet |

Les snippets SQL, diagnostics et sauvegardes ignorés dont l'utilité n'est pas démontrée négativement restent en place ; aucun dossier d'archives ajouté. Les commandes de synchronisation Notion et les droits/identifiants de production ne sont pas modifiés.

`tsconfig.json` active `strict` et `noEmit`. Attention : `next.config.mjs` a `typescript.ignoreBuildErrors=true` ; un build réussi ne remplace donc pas `npx tsc --noEmit`. Images `unoptimized:true` conservé ; le repli partagé concentre désormais le seul avertissement ESLint `<img>`, sans désactiver la règle. Aucun runner unitaire ni commande `test` ; scripts d'intégration Node et un test navigateur Playwright externe. Ne pas installer une nouvelle dépendance applicative pour les rejouer.

Commandes : `npm ci`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm run offline:check`, `node scripts/verify-documentation.mjs` puis tests locaux décrits dans le [journal](ROADMAP.md). Après changement de branche, les types générés sous `.next` peuvent encore mentionner les routes expérimentales : régénérer les artefacts avant d'attribuer ces erreurs au code de `main`.

Photo utilisateur : [verify-recipe-photo-browser.mjs](../scripts/verify-recipe-photo-browser.mjs) utilise une installation Playwright externe indiquée par `PLAYWRIGHT_MODULE`, `TEST_APP_URL` (défaut `http://localhost:3000`) et facultativement `TEST_SUPABASE_WORKDIR` pour une pile isolée. `TEST_MOBILE=1` active l'émulation Android/Chrome Pixel 7 ; sinon le viewport est un ordinateur 1440×1000. Les hôtes navigateur/API sont contraints au loopback ; le proxy frontend doit retourner le même ingrédient que la pile testée, et les requêtes navigateur externes sont bloquées. Aucun `.env.local` n'est chargé par le script. Il crée un compte fictif confirmé, vérifie explicitement l'absence de rôle admin, teste formats/taille, lecture de fichier refusée, refus Storage et RPC simulés, nettoyage du fichier après refus de sauvegarde, conservation des champs, nouvelle tentative, octets exacts de la photo stockée et relecture après rafraîchissement. Le transport de notification est simulé pour éviter l'envoi de mails de test vers le Mailpit codé en dur sur 54324. Compte, recettes et photos sont nettoyés en `finally`. L'émulation ne valide pas le sélecteur natif ni les permissions Android du téléphone réel. Pour un conflit de ports avec un autre projet, isoler la configuration et les migrations sur d'autres ports ; ne pas arrêter ni modifier l'autre pile.

Pour la livraison de modération DB-01/COM-06 : `node scripts/verify-recipe-review-migrations.mjs` reconstruit les six migrations initiales dans une base éphémère du conteneur Docker local, puis applique ensemble le workflow et la correction d'adresse. Il contrôle préservation des lignes, droits, confirmation obligatoire, visibilité RLS, validation par un autre compte et nettoyage de sa base. Ses contrats Auth/Storage réduits complètent le test API `verify-personal-recipes.mjs` sur la pile locale réelle ; aucune donnée Cloud n'est copiée dans les fixtures. Livraison autorisée et contrôles Cloud en lecture seule : [BACKEND_SCHEMA](BACKEND_SCHEMA.md).

Branche de travail issue de `main`, aucun merge/cherry-pick expérimental, petits Conventional Commits et revue avant fusion. Aucun push direct sur `main`. Le dépôt ne dispose pas de contrôle CI versionné exécutant automatiquement TypeScript/tests ; l'installation Vercel est la seule configuration de build explicitement définie.

| Exigence | État observé / cible |
| --- | --- |
| Performance | Pagination de transport 500 lignes, mais chargement complet ; aucune mesure Lighthouse/Core Web Vitals jointe. Cible : mesurer avant optimiser |
| SEO | Métadonnées françaises et icône ; application client et pas de page recette indexable dédiée. Cible à définir |
| Responsive | UI mobile, adaptations `sm/md/lg`, détails dans le design ; aucun audit exhaustif d'appareils |
| Accessibilité | WCAG 2.2 AA est un objectif ; zoom bloqué dans viewport, contrôles iconiques sans labels et absence de réduction des animations restent à traiter |
| Sécurité | RLS, RPC et Storage privés ; audit npm 2026-11-02 : zéro alerte de production, 11 moderate dans l'outillage de développement ; SEC-01 reste en cours, pas de correction forcée incompatible |
| Résilience | Mocks/dernier état en erreur, conservation des recettes malgré notification échouée ; pas de garantie hors ligne intégrale |
| Disponibilité | Dépend de Vercel/Supabase et de leurs offres ; aucun SLO/SLA applicatif mesuré |

## Procédure de migration et diagnostic

Créer une nouvelle migration horodatée via `npm exec -- supabase migration new describe_the_change`. Ne jamais réécrire une migration déjà appliquée. Appliquer d'abord avec `npm exec -- supabase migration up`, inspecter Studio puis les tests. `npm run supabase:reset` détruit les seules données locales et rejoue migrations, `seed.sql` et `seed-local-admin.sql` ; réservé à une reconstruction locale assumée et sauvegardée, non exécuté par cette mission.

Erreur catalogue : vérifier Docker, cible locale, `supabase:env`, migrations/grants et redémarrage Next.js ; démarrer Supabase seul ne remplace pas une URL Cloud. Storage désactivé : activer dans TOML, arrêter/redémarrer avec volumes préservés, appliquer les migrations locales. Erreur JWT après veille : PostgREST 14.18 et procédure ci-dessus, sans reset distant.

Avec CLI 3, `supabase migration list` compare par défaut les fichiers à la base locale ; `--remote` sélectionne explicitement le projet lié. Les anciens `--local`/`--linked` sont obsolètes (le premier est sans effet). L'ancienne procédure README de `db query --linked --file` et `db push --linked --yes` reste une opération privilégiée, manuelle, dépendante de la version CLI et soumise à accord ; ce n'est pas une commande d'installation locale. La livraison autorisée du 2026-10-17 a utilisé `db push --linked --skip-vault --yes` après contrôle de la cible, simulation et export sécurisé, puis vérification des données/droits et simulation finale sans migration restante. Aucune application de seed ni changement Vault. Ne jamais lancer `db reset --linked` ni un seed avec `truncate` sur Cloud.
