# Broco-Chou — Roadmap et journal

**Objectif :** Tenir un suivi unique des livraisons, dettes, imports, décisions et vérifications.
**Dernière mise à jour :** 2026-10-17
**Statut :** Roadmap consolidée ; les DONE correspondent à une preuve de code ou un test identifié, pas à une garantie de déploiement Cloud.
**Documents liés :** [PRD](PRD.md), [TRD](TRD.md), [Parcours](APP_FLOW.md), [Design](DESIGN_BRIEF.md), [Backend](BACKEND_SCHEMA.md), [Décisions](DECISIONS.md).

## Règles de suivi et synthèse d'audit

Priorités : P0 = sécurité/fiabilité ou prérequis à une ouverture publique ; P1 = amélioration utile ; P2 = évolution exploratoire. Statuts : `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`, `CANCELLED`. `BLOCKED` identifie un prérequis concret. Chaque ligne indique dépendances et critères d'acceptation ; un DONE prouve le périmètre écrit seulement. Les cibles non livrées sont À FAIRE ou HORS PÉRIMÈTRE de la mission actuelle.

Base de l'audit initial : `main = origin/main = e89d109`, après fetch, état initial propre sur `feat/auth-email-readiness` ; branche de travail `chore/main-documentation-cleanup` créée depuis main, aucun merge expérimental. Auth et données de production préservées. Lecture Cloud initiale : SMTP intégré, confirmations obligatoires, région `eu-west-1`, migration `20261016180000` alors absente. Cet écart a depuis été corrigé par DB-01, comme consigné au journal. Lecture Vercel initiale : variable Resend candidate au retrait, pas supprimée. Les preuves locales n'autorisent pas à qualifier tout le workflow enrichi de TESTÉ en production.

### Correspondance des demandes Notion — revue du 2026-10-17

Lors de la revue initiale, les demandes ci-dessous provenaient du prompt du propriétaire ; la To Do List Notion elle-même n'avait pas été relue ni modifiée. Le propriétaire a confirmé que [To Eat List](https://app.notion.com/p/To-Eat-List-4d3b60cd4d4442d5b4f1ff0fa0b2a9b0) est le référentiel demandé et que « recipe app » désigne ce dépôt. Le complément ci-dessous distingue les trois fiches relues ensuite. Cette roadmap reste l'unique suivi : les sous-tâches sont placées dans leurs thèmes, sans seconde roadmap.

Pour cette revue, `[x]` signifie que le périmètre précis de la case a une vérification technique indiquée ; `[ ]` signifie absent, incomplet ou **À vérifier**. Une présence dans les sources ou un ancien DONE ne suffit pas à cocher un parcours complet. Les DONE historiques gardent leur périmètre et leurs preuves datées ; les vérifications manquantes sont explicites ci-dessous.

| Demande | État réel retenu | Suivi canonique |
| --- | --- | --- |
| A — Recherche et planning manuel | Partiel : logique et rendu vérifiés en mémoire ; amélioration UX et parcours mobile/ordinateur à valider | CAT-01, ALG-02, UX-09 |
| B — Validation administrateur | Implémentée dans l'UI et les RPC/RLS ; rendu vérifié ici, tests SQL complets non rejoués et vérification visuelle de production restante | COM-02, COM-06, SEC-03 ; détail B en section 6 |
| C — Texte, voix, photo | Partiel : formulaire texte et fichier photo existants ; voix absente, capture mobile et tests complets à faire | COM-01, COM-07, COM-08 |
| D — To Eat List comme référentiel durable | Stockages identifiés et schémas Notion lus ; aucune synchronisation applicative trouvée, restauration non prouvée | DB-05, DB-06 |
| E — Plats des menus de la semaine | Partiel côté artefacts : import historique de 11 recettes ; source active et semaine cible à confirmer avant maintenance | IMP-07, distinct de l'automatisation IMP-04 |
| F — Développement local/hors ligne | Applicabilité confirmée par le propriétaire ; pile locale configurée, autonomie complète non validée | OPS-01, OPS-05, DEBT-01 |

### Complément Notion — création personnelle, import par lien et Haleon

Les trois fiches ont été lues via le connecteur Notion le 2026-10-17, sans écriture dans Notion. Audit du dépôt propre sur `main = origin/main = 01c6520`, référence GitHub confirmée en lecture seule ; branche documentaire `docs/notion-recipe-roadmap-20261017` dérivée de main. Aucun import utilisateur par URL, cible de partage PWA, traitement vocal ou import Haleon trouvé dans le code audité.

| Fiche produit | État retenu et suivi unique |
| --- | --- |
| [Ajouter ses recettes par texte, voix et photo](https://app.notion.com/p/3fc173c57e0481699bc4f58ebe434b31) | Socle manuel existant et testé localement historiquement : COM-01 reste DONE pour ce seul périmètre. Contrôles complémentaires TODO sous COM-01 ; voix COM-07 et capture mobile COM-08 restent TODO |
| [Importer depuis un lien ou le partage mobile](https://app.notion.com/p/3fc173c57e0481e1bebbfabef18af206) | IMP-08 créé en P1/TODO ; distinct d'IMP-03, outil manuel de développement existant |
| [Importer les recettes Haleon dans Supabase](https://app.notion.com/p/3fc173c57e048118b492e60b29d5d9de) | IMP-09 créé en P2/TODO, priorité à réévaluer après identification de la source ; prérequis « Source Haleon exacte à confirmer » |

**Disponibilité et preuves :** lecture API Vercel de l'alias public le 2026-10-17 : déploiement `dpl_6R3XFWhkziiXtd9hPCgLFGD9omZA`, projet `recipe-app`, cible `production`, branche `main`, SHA `01c6520`, état `READY`. Le code manuel et l'interface de modération audités sont donc déployés. Les huit migrations Cloud et les droits administrateur ont été vérifiés lors de DB-01/COM-06 ; cet historique SQL n'est pas relu ici. Les PASS locaux de soumission/Storage/RLS/migrations restent ceux du journal de fusion ; aucun nouveau test métier ou parcours navigateur de production exécuté pour cette mission documentaire. Le parcours complet actuel mobile/ordinateur reste À VÉRIFIER, sans soumission ni décision sur des données de production.

**Ordre recommandé pour ces demandes :** (1) finaliser les contrôles manuels TODO de COM-01 et les vérifications de modération COM-02/06/SEC-03 ; (2) réaliser IMP-08, d'abord collage d'URL puis partage mobile selon compatibilité ; (3) réaliser IMP-09 après confirmation de la source et des droits Haleon. COM-07/08 restent des améliorations distinctes, sans bloquer le collage d'URL. Cet ordre ne remplace pas les prérequis P0 de sécurité et d'ouverture publique.

## 1. Produit et expérience utilisateur

| ID | Description | Priorité | Statut | Dépendances | Critères d'acceptation / preuve |
| --- | --- | --- | --- | --- | --- |
| UX-01 | Présentation rapide et chemin vers découverte/planning | P1 | DONE | Aucune | Onboarding en trois étapes, bouton de complétion et états vides ; `onboarding.tsx`, `broco-chou-app.tsx` |
| UX-02 | Expliquer l'effet des préférences et fournir une configuration complète | P1 | TODO | ALG-03 | Écran régime/équipement/budget réellement accessible, options reliées aux résultats ; bouton actuel retourne à l'accueil |
| UX-03 | Mieux comparer les sélections et chercher avant le swipe | P2 | TODO | CAT-01 | Recherche/filtres dans la découverte et aperçu comparatif distinct de l'éditeur |
| UX-04 | Afficher plage de dates et aujourd'hui sans couleur seule | P1 | DONE | ALG-01 | Accueil et calendrier utilisent dates réelles et texte/aria ; `home-dashboard.tsx`, `weekly-calendar.tsx` |
| UX-05 | Uniformiser prévention des actions destructives | P1 | TODO | ALG-02 | Retrait avec confirmation/annulation déjà livré ; étendre au recommencement swipe et remplacement lors d'un déplacement. Ancienne case globale cochée, requalifiée partielle |
| UX-06 | Mesurer activation, sélection et retours utilisateurs | P2 | TODO | SEC-04 | Définitions du PRD validées, collecte minimisée et événements testés ; aucun KPI métier mesuré actuellement |
| UX-07 | Compléter les plats/desserts manquants après avoir parcouru toutes les recettes | P1 | DONE | ALG-04 | EXISTANT dans [swipe-deck.tsx](../components/swipe-deck.tsx) : si les quotas ne sont pas atteints et des candidats restent disponibles, bouton « Compléter les … manquants » avec nombres/types manquants ; relance les cartes de swipe avec les recettes non sélectionnées, y compris refusées, des seuls types déficitaires (plats, desserts et petits-déjeuners si activés). Conserve les choix acceptés et les favoris, sans doublon d'acceptation. Preuve : lecture du code le 2026-10-17 ; parcours navigateur ciblé non exécuté. Limite actuelle : un seul passage de complément par montage du composant |
| UX-08 | Garder « Recommencer la sélection » discret en bas à gauche, comme une action « Annuler » | P1 | DONE | UX-07 | EXISTANT dans [swipe-deck.tsx](../components/swipe-deck.tsx) : bouton secondaire `ghost`, taille `sm`, texte `text-xs` gris ; aligné à gauche dans la zone basse pendant le swipe et positionné `bottom-2 left-2` sur les écrans de fin. L'action principale reste le complément ou la génération du planning. Preuve : lecture du code le 2026-10-17 ; placement visuel mobile/desktop à vérifier en navigateur. La confirmation du recommencement reste à traiter dans UX-05 |
| UX-09 | Améliorer la lisibilité de la recherche et valider le parcours de sélection manuelle | P1 | TODO | CAT-01, ALG-02 | Réutiliser l'éditeur existant ; valider recherche, résultats, état vide, choix de date/créneau, ajout/remplacement et persistance sur mobile et ordinateur, ainsi que l'ergonomie avec le propriétaire. Aucun second éditeur à créer |

### Demande A — recherche et planification manuelle

- [x] Rechercher parmi les recettes du catalogue par titre, sans sensibilité à la casse ni aux espaces périphériques, et afficher les résultats/nombre ou zéro résultat : rendu React de [WeeklyPlanEditor](../components/weekly-plan-editor.tsx) avec catalogue fictif et deux requêtes, vérifié en mémoire durant cette revue.
- [x] Créer un planning vide puis ajouter manuellement une recette à une date et un créneau, remplacer ce plat et refuser son doublon ailleurs : actions réelles de [store.ts](../lib/store.ts) exécutées en mémoire ; aucun swipe ni générateur requis.
- [x] Sérialiser le planning modifié dans l'adaptateur de persistance : contenu JSON vérifié dans un stockage fictif en mémoire. Cela ne prouve pas une synchronisation Cloud ni un rechargement du navigateur.
- [ ] UX-09 — confirmer une interface épurée et des résultats lisibles avec le propriétaire ; la recherche actuelle alimente les menus déroulants par créneau, sans liste globale de cartes. Les filtres existants restent CAT-01 ; une recherche avant swipe relève de UX-03.
- [ ] UX-09 — vérifier les interactions, le rechargement et le rendu réel sur mobile et ordinateur, clavier inclus. Le rendu React isolé n'exécute pas les événements du navigateur et ne valide pas le responsive.

## 2. Recettes et catalogue

| ID | Description | Priorité | Statut | Dépendances | Critères d'acceptation / preuve |
| --- | --- | --- | --- | --- | --- |
| CAT-01 | Recherche/filtres dans le sélecteur de recette du planning | P1 | DONE | Catalogue | Titre, saison, durée, végétarien/poisson, équipement cumulables ; `weekly-plan-editor.tsx` |
| CAT-02 | Relecture culinaire City Café et images approximatives | P1 | TODO | IMP-01 | Relire en priorité lots 05–09 : sauces, ingrédients caractéristiques, proportions et étapes ; traiter anomalies photo détaillées ci-dessous |
| CAT-03 | Déduplication avancée et référentiel plus robuste | P2 | TODO | DB-03 | Noms/alias, variantes et catégories contrôlés sans fusion destructive ; préserver les ID source et relations |
| CAT-04 | Recettes selon ingrédients disponibles, anti-gaspillage, restes et batch cooking | P2 | TODO | UX-02, GRO-01 | Scénarios métier validés avant développement ; pas de promesse de coût/stock automatique |
| CAT-05 | Favoris mieux intégrés et gestion complète | P2 | TODO | UX-03 | Gestion au-delà de l'aperçu des cinq favoris, accès au planning explicite |

## 3. Algorithme de planification

| ID | Description | Priorité | Statut | Dépendances | Critères d'acceptation / preuve |
| --- | --- | --- | --- | --- | --- |
| ALG-01 | Fenêtre de sept dates commençant aujourd'hui, accueil cohérent | P0 | DONE | Aucune | `startOfDay`, `weekEnd=J+6`, comparaisons par date ; `store.ts`, accueil/calendrier/éditeur. Anciennes tâches « plan dependable » et « date-based » préservées |
| ALG-02 | Création/édition manuelle, ajout/remplacement/retrait | P0 | DONE | ALG-01 | Plan vide possible, sauvegarde immédiate, unicité recette, confirmation et annulation du retrait ; code store/éditeur |
| ALG-03 | Faire respecter tous les choix alimentaires déclarés | P0 | TODO | UX-02 | Clarifier budget/difficulté/exclusions/répétition et éviter une promesse de sécurité alimentaire non garantie. Helpers `scoreRecipe` non branchés sur le swipe |
| ALG-04 | Générateur aligné avec les créneaux, déjeuners et petits-déjeuners | P1 | DONE | ALG-01 | Exigences de 7 recettes par créneau, aucune répétition, uniquement les acceptées ; `swipe-deck.tsx`, `store.ts`. Remplace les anciennes idées limitées au dîner |
| ALG-05 | Sauter et déplacer les repas | P1 | DONE | ALG-02 | Actions calendrier et méthode `moveMeal`, invalidation des courses sur ces changements. La destination peut être remplacée : protection dans UX-05 |
| ALG-06 | Renforcer tests du calcul et cohérence du score | P1 | TODO | ALG-03 | Tests de dates/DST, unicité, types de recettes et score ; distinguer helpers inutilisés du générateur. Aucun runner unitaire actuellement |
| ALG-07 | Remplacement intelligent selon temps disponible, annulation étendue et duplication | P2 | TODO | ALG-02, UX-05 | Comportement testé sans violer unicité ; duplication de recette nécessite décision métier préalable |

## 4. Liste de courses

| ID | Description | Priorité | Statut | Dépendances | Critères d'acceptation / preuve |
| --- | --- | --- | --- | --- | --- |
| GRO-01 | Normaliser quantités, unités et portions | P0 | TODO | Décision base de portions | Multiplication et addition de mêmes suffixes déjà présentes ; conversion g/kg et ml/l absente, portions source ignorées. Ancienne case entièrement cochée requalifiée partielle |
| GRO-02 | Invalider et régénérer sans conserver une liste périmée | P0 | TODO | ALG-02 | Ajout/remplacement/retrait/saut/déplacement invalident déjà ; compléter génération automatique d'un nouveau plan, retour d'un repas sauté et changement de convives. Ancienne tâche d'invalidation partiellement réalisée |
| GRO-03 | Conserver les coches quand le plan change | P1 | TODO | GRO-02 | Préserver les achats compatibles après changement ; actuellement possible seulement si liste encore présente lors de génération, perdu après `[]` |
| GRO-04 | Copie, partage natif et impression des courses | P1 | DONE | Liste générée | `navigator.share`, repli copie, `window.print`, `.print-grocery` ; `grocery-list.tsx`, CSS. L'ancienne case « plan et courses » est scindée avec UXD-04 |
| GRO-05 | Catégories et basiques fiables, erreur de copie visible | P1 | TODO | GRO-01 | Tester les six catégories, sous-chaînes des basiques et feedback ; définir si basiques masqués doivent figurer dans l'export |

## 5. Comptes et authentification

| ID | Description | Priorité | Statut | Dépendances | Critères d'acceptation / preuve |
| --- | --- | --- | --- | --- | --- |
| AUTH-01 | Conserver e-mail/mot de passe, confirmation, renvoi et sessions | P0 | DONE | Supabase | Code inchangé ; tests locaux `mailpit:check`, `verify-local-auth`, `verify-local-jwt` réussis cette session. Tests manuels de production rapportés par le propriétaire |
| AUTH-02 | Séparer les espaces locaux par identité | P0 | DONE | AUTH-01 | `switchPlanningAccount`, clés visiteur/uid et adaptateur sans écriture pendant reset ; preuve de code, pas un chiffrement |
| AUTH-03 | Préparer inscription publique sans modifier SMTP à l'aveugle | P0 | TODO | Audit quota/destinataires | SMTP intégré confirmé, quota 2/h ; vérifier membres autorisés et décider capacité réelle avant ouverture. Aucun nouveau SMTP installé |
| AUTH-04 | Récupération de mot de passe et gestion complète de compte | P2 | TODO | SEC-04 | Besoin produit à valider ; pas de parcours UI actuel. Ne pas importer automatiquement les pages expérimentales |
| AUTH-05 | Google OAuth / Turnstile de la branche expérimentale | P2 | CANCELLED | Nouvelle décision explicite requise | Exclus de la version actuelle par demande ; aucune fusion |

## 6. Recettes communautaires et modération

| ID | Description | Priorité | Statut | Dépendances | Critères d'acceptation / preuve |
| --- | --- | --- | --- | --- | --- |
| COM-01 | Soumission privée, photo, ingrédients canoniques et planning auteur — socle livré | P0 | DONE | Migrations initiales | Test local personnel réussi, bucket/RPC initiales observés dans Cloud ; `personal-recipe-form.tsx`, `personal-recipes.tsx`. [Demande Notion](https://app.notion.com/p/3fc173c57e0481699bc4f58ebe434b31) : conserver ce DONE historique ; compléments de vérification TODO détaillés sous « Demande C », sans garantie de parcours complet en production |
| COM-02 | Édition pending admin, refus commenté et concurrence | P0 | DONE | Migration 20261016180000 locale | Tests RPC et navigateur mobile réussis localement ; auteur/statut préservés, commentaire requis, une seule décision. Déploiement Cloud séparé DB-01 |
| COM-03 | Notifications Mailpit facultatives sans appel voué à échouer en production | P1 | DONE | COM-01 | Garde développement loopback ajoutée au formulaire ; test API/Mailpit et déduplication réussis. Outbox/RPC historiques conservées |
| COM-04 | Modification par l'auteur après soumission et espace de modération enrichi | P2 | TODO | Décision de cycle de révision | Aucune édition auteur aujourd'hui ; définir droits, retour pending et traçabilité avant implémentation |
| COM-05 | Notifications applicatives ou e-mails de décision en production | P2 | TODO | AUTH-03, décision produit | Aucun transport/cron actuel ; à concevoir seulement si besoin confirmé, sans dépendance ajoutée ici |
| COM-06 | Rétablir les deux comptes administrateurs attendus en production | P0 | DONE | DB-01, autorisation distante reçue | Deux comptes reconnus par `is_recipe_admin()` après livraison ; lecture sous rôle SQL `authenticated` de la soumission existante et des auteurs réussie pour chacun, visiteurs exclus. Confirmation visuelle dans les sessions personnelles à effectuer par le propriétaire |
| COM-07 | Créer une recette par saisie vocale, notamment pour San | P1 | TODO | Socle COM-01 et ses contrôles restants, choix de transcription et validation utilisateur | [Demande Notion](https://app.notion.com/p/3fc173c57e0481699bc4f58ebe434b31). Aucun enregistrement/transcription/préremplissage vocal trouvé. Définir appareils/langues, traitement local ou distant et conservation de l'audio ; relire/corriger le texte et les champs avant la soumission existante ; tester succès, refus microphone, erreur, annulation et repli texte sans perte de saisie |
| COM-08 | Vérifier et compléter la prise de photo sur mobile | P1 | TODO | Socle COM-01 et ses contrôles restants, appareils iOS/Android cibles | [Demande Notion](https://app.notion.com/p/3fc173c57e0481699bc4f58ebe434b31). Fichier JPG/PNG/WebP avec aperçu existant ; ni interface de capture dédiée ni attribut `capture`. Définir galerie/appareil, tester capture réelle, refus/annulation, orientation, formats non acceptés, aperçu/retrait et réaffichage privé ; conserver le choix de fichier sur ordinateur. Extraction d'une recette depuis une photo à confirmer séparément |

### Demande B — validation des recettes par les administrateurs

- [x] Afficher les soumissions pending et les actions « Valider et publier » / « Ne pas publier » pour un compte administrateur, les masquer pour un compte ordinaire : rendu de [PersonalRecipes](../components/personal-recipes.tsx) vérifié avec les deux rôles fictifs durant cette revue.
- [ ] **À vérifier sur la pile réelle** : relire le rôle via `is_recipe_admin`, exécuter une décision et relire son statut persistant, contrôler les lectures auteur/visiteur et les refus d'un compte non autorisé. Le raccordement est présent dans [AccountProvider](../components/account-provider.tsx), le composant et les migrations [recettes privées](../supabase/migrations/20261007190000_personal_recipes.sql) / [workflow](../supabase/migrations/20261016180000_recipe_review_workflow.sql) : identité confirmée, garde SQL administrateur, décision sur pending, RLS et écritures directes révoquées. Il ne faut pas recréer cette logique.
- [ ] SEC-03 — recontrôler les droits effectifs et gardes côté base : les grants `EXECUTE` hérités peuvent différer des seules migrations. L'inspection SQL locale en lecture seule n'a pas abouti ici, Docker Desktop Linux étant indisponible ; aucune migration ni fixture exécutée.
- [ ] Vérification visuelle de production restant dans COM-06 : recharger les sessions autorisées et contrôler l'accès aux actions ; aucune décision réelle n'a été exécutée par cette mission.

Tests associés relus : [verify-personal-recipes.mjs](../scripts/verify-personal-recipes.mjs) (soumission, confidentialité, droits, décision persistante et concurrence), [verify-recipe-review-browser.mjs](../scripts/verify-recipe-review-browser.mjs) (mobile, édition/refus) et [verify-recipe-review-migrations.mjs](../scripts/verify-recipe-review-migrations.mjs) (mise à niveau et droits). Les PASS locaux et contrôles Cloud antérieurs restent dans leur entrée de journal ; ces tests ne sont pas rejoués car ils créent, modifient et nettoient des données, voire appliquent des migrations. Leur présence ne valide pas une nouvelle exécution. La validation navigateur de publication et la couverture ordinateur sont à compléter.

### Demande C — gestion des recettes et saisie multimodale

État global **partiellement implémenté**. La mention Notion « en cours » de la revue initiale reste un contexte historique, sans déclarer la voix IN_PROGRESS : aucun code vocal n'a été trouvé. La [fiche relue](https://app.notion.com/p/3fc173c57e0481699bc4f58ebe434b31) demande de confirmer le parcours manuel existant ; elle ne justifie ni un second formulaire ni une nouvelle modération.

- [x] Fournir le formulaire texte et les champs existants nom, ingrédients/quantités/unités, étapes, portions, durée, saison et type de repas : lecture et rendu de [PersonalRecipeForm](../components/personal-recipe-form.tsx) vérifiés, avec l'entrée de fichier photo JPG/PNG/WebP.
- [x] Mapper ingrédients/quantités/unités, instructions, statut et chemin photo vers une recette applicative : [mapRecipeRow](../lib/supabase-recipes.ts) exécuté sur une ligne fictive durant cette revue.
- [ ] **COM-01 — TODO, parcours manuel complet mobile/ordinateur** : sur Supabase/Mailpit locaux avec comptes fictifs, saisir puis relire nom, description, ingrédients, quantités/unités, portions, durée et étapes de préparation ; corriger avant enregistrement, avec et sans photo. Vérifier navigation tactile/clavier, validation des bornes, chargement, messages et absence de double soumission. Garder le DONE du socle et consigner les preuves de ce complément séparément.
- [ ] **COM-01 — TODO, prévisualisation** : vérifier l'aperçu/retrait de photo et la correction de chaque champ avant `submit_recipe`. Le code propose un aperçu de l'image et des champs éditables, sans écran de prévisualisation complète de la fiche ; définir puis compléter cet aperçu de fiche dans le formulaire existant et tester le retour à la correction sans perte de champs. L'édition par l'auteur après soumission reste COM-04.
- [ ] **COM-01 — TODO, persistance et médias** : comparer les champs saisis à la ligne Supabase puis à la fiche après rafraîchissement/reconnexion ; vérifier le chemin auteur du bucket privé, les limites JPG/PNG/WebP ≤5 Mio et les lectures signées autorisées. Simuler échecs des suggestions, upload et RPC, coupure réseau et nouvelle tentative : erreur visible, champs conservés, aucune recette dupliquée ; vérifier le nettoyage de la photo non référencée sans masquer l'erreur (orphelins : SEC-05).
- [ ] **COM-01 avec COM-02/06 et SEC-03 — TODO, droits et publication** : tester localement auteur, autre compte, visiteur et administrateur confirmé ; recette `community/pending` et photo privées avant décision, aucun droit de publication directe ou d'auto-validation ordinaire, correction admin sans publication, publication après validation uniquement et refus motivé restant privé. Rejouer les tests RPC/RLS et le parcours navigateur de création puis publication sur mobile et ordinateur, avec gardes loopback et nettoyage des fixtures. Les preuves locales antérieures ne terminent pas cette matrice complète.
- [ ] **COM-01 — TODO, confirmation de production** : rapprocher les versions frontend/SQL livrées des résultats locaux ; contrôler en lecture seule les écrans et autorisations avec les sessions autorisées (COM-06). Une création, un upload ou une décision en production nécessitera une autorisation explicite distincte. Consigner environnement, appareil, rôle, résultat et limites avant de déclarer le parcours complet validé en production.
- [ ] COM-07 — ajouter microphone, transcription puis construction/préremplissage éditable de la recette ; confirmer le fonctionnement attendu avec San, puis tester les différents modes et erreurs. La dictée du clavier du système ne constitue pas une intégration vocale développée dans l'application.
- [ ] COM-08 — vérifier la prise de photo réelle sur les appareils cibles et compléter le parcours si nécessaire. Ne pas assimiler téléversement d'une illustration, prise de photo et extraction automatique des informations ; cette dernière n'est ni démontrée ni automatiquement incluse.
- [ ] COM-07/08 — couvrir séparément texte, voix, galerie et appareil photo, limites taille/MIME, permissions, erreurs réseau, absence de doublon à la soumission et conservation des champs avant nouvelle tentative.

## 7. Base de données / Supabase

| ID | Description | Priorité | Statut | Dépendances | Critères d'acceptation / preuve |
| --- | --- | --- | --- | --- | --- |
| DB-01 | Traiter l'écart Cloud/versionné du workflow enrichi | P0 | DONE | Revue SQL, sauvegarde et autorisation distante reçue | `db push --linked --skip-vault --yes` : `20261016180000` puis `20261017120000` appliquées ; huit versions présentes et simulation finale à jour. Empreintes recettes/ingrédients/anciens admins/identités Auth/photos identiques avant-après ; détails et limites au journal |
| DB-02 | Sauvegarde et restauration base + photos | P0 | TODO | Accès exploitation | Export ciblé public + historique réalisé avant DB-01 dans dossier local protégé ; compléter sauvegarde complète/objets Storage, rétention et restauration testée sur cible isolée. Aucun reset distant |
| DB-03 | Diagnostiquer catégorie locale de `tomate` | P1 | TODO | Aucune | Contrôle sync 2026-10-17 : locale « Épicerie, condiments et produits sucrés », Cloud « Fruits, légumes et légumineuses ». Ligne locale datée 2026-10-08, antérieure aux tests ; ne pas corriger Cloud |
| DB-04 | Synchronisation multi-appareil des plans/favoris/préférences | P2 | TODO | Décision produit et conflits | HORS PÉRIMÈTRE actuel ; définir modèle, RLS et migration des données navigateur |
| DB-05 | Synchroniser les recettes dans les deux sens avec To Eat List, référentiel durable | P1 | TODO | Contrat de données et accès Notion applicatif, COM-01/02, SEC-04 | Exigence confirmée par le propriétaire ; page et schémas Notion lus, aucun connecteur applicatif trouvé. Définir mapping complet, identités stables, priorité Notion, doublons/conflits, mises à jour/suppressions protégées, reprise et tests aller-retour. Les accès du connecteur de cet audit ne sont pas une configuration de l'application |
| DB-06 | Récupérer les recettes et médias depuis To Eat List indépendamment de Broco-Chou | P0 | TODO | DB-05 (contrat et copie durable), DB-02 | Démontrer restauration isolée depuis Notion et médias conservés, sans base ni déploiement Broco-Chou ; prouver que désinstallation/abandon/suppression de l'application n'efface pas le référentiel. Aucune suppression destructive propagée automatiquement ; un export ponctuel seul ne termine pas DB-05 |

### Demande D — synchronisation et sauvegarde avec To Eat List

- [x] Identifier les systèmes : PostgreSQL/Auth/Storage Supabase pour les recettes/photos et navigateur pour les plans ; page To Eat List et bases Notion Recettes/Ingrédients/Meal Plan accessibles en lecture. Preuves de schémas et écarts dans le [TRD](TRD.md#to-eat-list--état-observé-et-contrat-à-définir), avec liens vers les sources.
- [ ] DB-05 — établir le contrat de données : titre, portions, ingrédients et quantités par recette, instructions dans le corps des pages, photos et métadonnées. Associer `recipes.id` à l'identifiant de page Notion ; l'échantillon possède un ID dans le corps, sans propriété dédiée d'ID Broco-Chou dans le schéma lu. Définir le mapping avant tout import réel.
- [ ] DB-05 — implémenter puis vérifier Broco-Chou → Notion **et** Notion → Broco-Chou : créations, modifications, reprises sur erreur et répétition idempotente. Aucun client, endpoint, webhook, tâche planifiée ou test To Eat List trouvé dans le dépôt ; les imports SQL et le connecteur de recherche de cette session ne sont pas une synchronisation applicative.
- [ ] DB-05 — formaliser la priorité demandée de Notion comme source de vérité ; définir version/horodatage, résolution explicite des conflits, déduplication par ID et rapprochement contrôlé des anciens titres, sans fusion automatique. Préserver auteurs, états de modération et confidentialité des recettes non publiées.
- [ ] DB-05/06 — traiter explicitement modifications, archivage et suppressions : ne pas propager la disparition de Broco-Chou vers Notion ; définir les suppressions autorisées et leur restauration avant tout mécanisme destructif. Les effets Notion → application doivent aussi préserver les choix/plans existants ou signaler leur invalidation.
- [ ] DB-06 — conserver durablement les fichiers photo et pas seulement une URL signée Supabase ou distante ; vérifier la complétude des instructions et des quantités. La page recette échantillonnée utilise une image Pexels distante et des informations dans ses blocs : aucune garantie de sauvegarde complète n'est démontrée.
- [ ] DB-06 — tester sauvegarde/restauration depuis To Eat List sur cible isolée, perte de l'application/base, doublons, conflits, erreurs et suppressions protégées ; prouver la récupération complète sans dépendre d'un service Broco-Chou restant actif.

## 8. Intégrations et imports

| ID | Description | Priorité | Statut | Dépendances | Critères d'acceptation / preuve |
| --- | --- | --- | --- | --- | --- |
| IMP-01 | Dix lots City Café, 158 intitulés consolidés en 157 recettes | P1 | DONE | Artefacts JSON/SQL | Manifeste conservé, 157/157 IDs et champs métier identiques vérifiés en lecture seule cette session ; catégorie globale tomate séparée DB-03 |
| IMP-02 | Compléter et contrôler les 157 images City Café | P1 | DONE | IMP-01 | Correction historique du 2026-09-27, 157 attributions/IDs photo uniques et URLs non NULL dans les deux bases ; HTTP 200 historique, pas entièrement rejoué ici |
| IMP-03 | Préserver import Instagram manuel et ses sources | P1 | DONE | API import | Parser de légende collée, sélection de fichiers locaux et sauvegarde développement ; aucune extraction réseau Instagram ni Pexels à l'exécution de l'API images. Ce DONE ne couvre ni import utilisateur depuis une URL ni réception du partage mobile (IMP-08) ; la sauvegarde privilégiée actuelle ne suit pas la modération communautaire |
| IMP-04 | Import périodique des menus Odélis / pipeline sources Crous | P2 | TODO | Droits sources, périmètre produit | HORS PÉRIMÈTRE ; aucun cron ni pipeline exécuté dans `main`. Définir fréquence, déduplication, sources et validation humaine |
| IMP-05 | Génération automatisée de recettes | P2 | TODO | CAT-02, validation éditoriale | Aucune intégration LLM actuelle ; distinguer reconstruction manuelle et génération automatisée |
| IMP-06 | Installer Resend pour les invitations de production | P2 | CANCELLED | ADR-007 | Ancien échec `integration_terms_acceptance_required` conservé comme historique ; ne pas reprendre le provisionnement |
| IMP-07 | Maintenir les plats des menus hebdomadaires — données/contenus, opération récurrente | P1 | BLOCKED | Semaine cible et source active à confirmer ; DB-05 pour contrôle de synchronisation | Un import historique de 11 recettes et une base Notion Meal Plan sont identifiés. Pour chaque période : récupérer le menu daté, rapprocher les recettes existantes, compléter uniquement les manquantes, vérifier disponibilité au planning et état To Eat List. Aucun ajout de données pendant cette mission ; ne dépend pas d'un pipeline Odélis automatique |
| IMP-08 | Import utilisateur depuis une URL et, si compatible, le partage mobile | P1 | TODO | Contrôles manuels COM-01, workflow COM-02/DB-01, revue SEC-02/03, droits sources et étude PWA | [Demande Notion](https://app.notion.com/p/3fc173c57e0481e1bebbfabef18af206). Collage toujours disponible ; extraction publique autorisée, fiche préremplie modifiable sans invention, provenance/déduplication, photos sûres et soumission `community/pending` via workflow existant. Critères techniques et matrice plateformes ci-dessous ; aucune fonctionnalité URL/partage livrée |
| IMP-09 | Préparer l'import idempotent des recettes Haleon dans Supabase | P2 | TODO | Source Haleon exacte à confirmer ; droits textes/images, inventaire Supabase, DB-02, revue du schéma/provenance | [Demande Notion](https://app.notion.com/p/3fc173c57e048118b492e60b29d5d9de). Priorité à réévaluer après identification de la source. Inventaire, mapping, simulation sans écriture, rapports, import répété sans doublon et restauration validés uniquement en local avant proposition de livraison ; aucun import réel pendant cette mission |

### IMP-08 — import depuis un lien et partage mobile (P1, TODO)

**Périmètre :** Instagram, Facebook et sites de recettes pour leurs seuls contenus publics accessibles et réutilisables. S'inspirer du parcours ReciMe (lien → relecture → soumission), sans copier interface ni code. IMP-03 reste un outil manuel distinct : sa page [admin/import](../app/admin/import/page.tsx) exige une légende collée ; [parse](../app/api/recipe-import/parse/route.ts) ne charge pas l'URL et [save](../app/api/recipe-import/save/route.ts) utilise un accès privilégié, bloqué en production. Ne pas ouvrir ce dernier aux utilisateurs.

**Sous-tâches et critères d'acceptation — tous TODO :**

- [ ] **Entrée et continuité de session** : champ de collage d'URL accessible sur mobile et ordinateur, validation claire et lancement explicite de l'analyse. Le lien partagé ou collé conduit au même formulaire existant prérempli ; si une connexion est nécessaire, conserver le brouillon de façon isolée par compte et permettre reprise/annulation sans publication automatique.
- [ ] **Étude PWA/Web Share Target** : documenter installation, contexte HTTPS, manifest `share_target`, traitement des paramètres `url`/`text`/`title` et réception du partage depuis Instagram, Facebook et un navigateur. Une application émettrice peut placer le lien dans le texte ; valider et faire confirmer le lien retenu si plusieurs sont présents. Aucune écriture déclenchée par la seule ouverture du partage ; l'enregistrement exige une confirmation utilisateur.
- [ ] **Matrice des plateformes** : tester sur appareils réels Android/Chrome avec PWA installée puis sans installation, iOS/Safari avec et sans ajout à l'écran d'accueil, et navigateurs ordinateur retenus. Consigner versions, application émettrice, apparition dans le menu Partager, paramètres reçus et résultat. L'installation est nécessaire à Web Share Target et son support n'est pas universel ; ne pas promettre une cible native sur iOS sur la seule base d'une PWA. Pour toute plateforme non compatible, la copie puis le collage d'URL doit réussir. Ne pas confondre partage sortant `navigator.share` et réception entrante. Références consultées le 2026-10-17 : [Chrome — Web Share Target](https://developer.chrome.com/docs/capabilities/web-apis/web-share-target), [MDN — share_target et compatibilité](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/share_target) ; recontrôler les supports au moment de l'étude. Aucun manifest/service worker de réception livré dans le dépôt ; pas de garantie hors ligne implicite.
- [ ] **Collecte et extraction** : analyser côté serveur uniquement les pages publiques autorisées, HTML structuré, JSON-LD `Recipe`, Open Graph et métadonnées accessibles. Réutiliser les parties pertinentes du parseur de légende après revue, sans supposer qu'une URL sociale contient ingrédients ou étapes ; aucune authentification auprès des plateformes ni contournement des protections, aucun besoin LLM présumé. Sur fixtures locales autorisées, extraire nom, description, photo, ingrédients/quantités/unités, portions, temps, étapes et provenance lorsqu'ils existent ; signaler explicitement chaque champ manquant.
- [ ] **Relecture et mapping** : rendre les champs préremplis modifiables et prévisualisables, conserver les corrections, demander de compléter les champs obligatoires avant soumission. Ne pas présenter les valeurs par défaut du formulaire ou de `mapRecipeRow` comme des informations extraites ; durée, portions, catégorie et saison inconnues exigent une confirmation explicite. Tester source complète, métadonnées seules et contenu partiel, sans fabriquer les informations absentes.
- [ ] **Provenance et droits** : conserver URL d'origine, URL canonique validée, auteur/attribution et conditions de réutilisation des textes/photos ; permettre un import sans photo si ses droits sont inconnus. Le schéma limite `source` à `crous/broco-chou/instagram/community` et `submit_recipe` impose `community` sans enregistrer de provenance externe. Définir le mapping durable URL/attribution et les éventuels compléments RPC/SQL additifs, à tester localement sans affaiblir auteurs/RLS/modération. Références techniques actuelles dans [BACKEND_SCHEMA](BACKEND_SCHEMA.md), contrats futurs à y consigner lors de leur conception ; aucun nouveau schéma décidé ici.
- [ ] **Médias** : appliquer aussi aux URLs d'images les protections de chargement ci-dessous ; contrôler type réel, taille et droits avant stockage privé via le flux existant. Ne pas conserver seulement une URL temporaire ni exposer une photo pending ; tester image expirée, contenu non image, fichier trop lourd et échec d'upload. Réutiliser COM-01 et SEC-05 pour stockage et orphelins.
- [ ] **Déduplication et reprise** : comparer URL canonique validée, titre normalisé et signature ingrédients/étapes aux recettes accessibles ; proposer la recette existante sans fusion ni écrasement automatique. Définir une protection contre double clic, reprise après timeout et requêtes concurrentes ; ne pas révéler de recettes privées d'autres auteurs. Tester variantes de liens, doublon existant, nouvelle variante légitime et nouvelle tentative après réponse perdue : au plus une soumission pour la même opération.
- [ ] **Erreurs et limites sociales** : couvrir URL invalide/expirée, page privée, authentification requise, accès refusé/403, quota/429, timeout et contenu incomplet ; message clair et possibilité de corriger le lien ou compléter manuellement, sans perte du brouillon. Un lien Instagram/Facebook valide peut rester inaccessible au serveur : aucune promesse d'import universel, ni récupération de contenu privé. Respecter les conditions propres à chaque source avant activation.
- [ ] **Sécurité du chargement** : définir protocoles/ports autorisés, rejeter identifiants intégrés et schémas non HTTP(S), destinations loopback/privées/link-local/métadonnées Cloud en IPv4 et IPv6 ; vérifier résolution DNS et destination effective, chaque redirection et rebinding, avec limites de redirections, durée, taille téléchargée/décompressée et types acceptés. Ne transmettre ni cookies ni en-têtes d'authentification aux sources, ne pas exécuter leur HTML/scripts ; assainir l'affichage. Prévoir Auth, quotas par compte et limites de concurrence côté serveur avant exposition (SEC-02/03). Tests réseau simulés localement : refus des destinations internes avant toute connexion, redirection vers réseau interdit bloquée, timeout/taille/abus traités sans fuite de secret.
- [ ] **Validation de bout en bout** : sur Supabase/Mailpit locaux uniquement, fixtures publiques autorisées ou simulées, vérifier collage sur mobile/ordinateur et partage sur plateformes retenues → correction → sauvegarde → recette `community/pending` privée → décision admin → lecture publique uniquement après approbation. Tester visiteur, autre auteur, auteur et admin, RLS/photos, doublons et erreurs ci-dessus avec nettoyage des fixtures. Une plateforme sans réception native est acceptable si la limitation est documentée et le repli collage testé. Joindre les preuves avant DONE ; livraison frontend/SQL séparée à autoriser ultérieurement.

### IMP-09 — recettes Haleon (P2 à réévaluer, TODO)

**Prérequis : Source Haleon exacte à confirmer.** La fiche Notion ne fournit ni catalogue précis ni preuve d'API. Ne déduire aucune URL du nom « Haleon ». Cette tâche concerne un import de catalogue contrôlé, distinct d'IMP-08, de la maintenance des menus IMP-07 et de la synchronisation Notion DB-05 ; ces fonctions ne sont pas des prérequis automatiques entre elles.

**Sous-tâches et critères d'acceptation — tous TODO :**

- [ ] **Source et droits** : obtenir du propriétaire le site, les documents, fichiers, menus ou exports exacts et leur version/date ; vérifier accès autorisé, périmètre et droits de réutilisation séparés pour textes et images. Documenter restrictions/attributions et exclusions ; absence de droits ou source non identifiée interdit de lancer l'import. Réévaluer P2 selon volume, qualité, utilité et effort constatés.
- [ ] **Inventaire et rapprochement** : recenser chaque recette, identifiant source, champs et médias disponibles puis comparer au catalogue Supabase actuel par identifiant, provenance, titre normalisé et signature de contenu. Lecture seule pour un inventaire Cloud éventuel, comptes/données privés exclus des rapports. Classer nouvelles recettes, doublons/variantes, conflits, erreurs et données manquantes ; ne pas réimporter les lots existants ni fusionner automatiquement.
- [ ] **Mapping culinaire** : préparer nom, description, ingrédients canoniques/alias, quantités et unités, portions, temps, étapes, astuces, photos et attributions ; respecter catégories/saisons/types de repas et structure JSON actuels. Conserver les informations source et signaler les inconnues plutôt que produire des valeurs inventées. Tester lecture réelle dans l'application : `mapRecipeRow` fournit des valeurs par défaut et le catalogue filtre les recettes sans ingrédients, ce qui peut masquer un import incomplet.
- [ ] **Provenance et compatibilité** : étudier une valeur de `source` appropriée sans choisir arbitrairement `crous` ou `instagram`. La contrainte SQL et le mapping TypeScript n'acceptent pas actuellement `haleon` ; une nouvelle valeur demanderait une migration additive et l'adaptation des types/mapping, ou un autre contrat de provenance explicite. Évaluer la nécessité, documenter ce contrat dans BACKEND_SCHEMA/TRD et une ADR si l'architecture change ; ne réécrire aucune migration appliquée. Aucun changement de schéma ni de code pendant cette mission.
- [ ] **Plan d'import idempotent et dry-run** : établir une correspondance stable identifiant source → `recipes.id`, préserver les identifiants déjà présents et leurs relations ; ne pas générer un nouvel ID à chaque exécution ni écraser les corrections existantes. Simulation sans aucune écriture DB ou Storage, produisant nombres et listes des ajouts proposés, doublons, conflits, erreurs et champs/médias manquants. Même entrée et même état de référence : même rapport ; aucune action destructive ou publication implicite.
- [ ] **Médias et rapport** : vérifier droits, formats, taille, intégrité et disponibilité des images ; copie durable autorisée, attribution et correspondance recette/photo, sans URL signée temporaire comme sauvegarde. Produire un rapport avant/après et un manifeste d'IDs/opérations permettant d'expliquer chaque ajout, exclusion ou conflit. Signaler les recettes incomplètes pour correction humaine avant import.
- [ ] **Essai local et reprise** : sur Supabase local uniquement, gardes loopback et fixtures fictives ou autorisées, exécuter dry-run puis import d'essai ; relancer deux fois et après interruption : zéro doublon, IDs et corrections préservés, erreurs isolées/rapportées. Vérifier quantités/unités, catégories/saisons, provenance, photos et rendu catalogue/planning ; éprouver toute migration additive localement. Définir et tester la validation éditoriale/publication sans modifier le workflow communautaire. Nettoyer les fixtures et joindre les rapports ; aucun de ces essais exécuté par cette mission documentaire.
- [ ] **Sauvegarde, restauration et future livraison** : avant toute proposition de production, plan DB-02 couvrant données concernées, ingrédients/relations, historique et octets Storage, conservation protégée et test de restauration sur cible isolée. Définir arrêt sur anomalie, transaction/lot, restauration des seules modifications de l'import et validation avant/après (comptages, IDs, empreintes, médias et lecture applicative). Pas de reset, truncate ni seed local sur Cloud. Le passage à DONE du travail local ne prouve aucune disponibilité Cloud ; import réel, migrations distantes et déploiement exigent une autorisation explicite ultérieure.

### Demande E — données, contenus et opérations récurrentes

- [x] Retrouver les artefacts existants : [weekly-plan-recipes.sql](../supabase/new-import/weekly-plan-recipes.sql) contient 11 ID distincts, tous retrouvés dans [seed.sql](../supabase/seed.sql) ; [le générateur Python](../scripts/generate_supabase_seed_from_sources.py) reprend cet import. Contrôle statique exécuté, aucun SQL appliqué ; le `ON CONFLICT(id) DO UPDATE` n'assure pas la déduplication des titres ni la préservation de modifications récentes.
- [x] Identifier une source candidate : base [Meal Plan de To Eat List](https://app.notion.com/p/0015f4cce9f84dfb90c4a5bcc753b5ef), schéma et échantillon de huit jours datés lus, avec Déjeuner/Dîner en texte. Cela ne confirme pas qu'elle constitue le menu actif demandé.
- [ ] IMP-07 — confirmer la semaine (dates de début/fin) et la source faisant autorité : Meal Plan, menu personnel fourni ou autre. Aucun menu actuel n'est déduit du seul nom du fichier SQL ou des anciens calendriers Crous. La requête Notion ciblant le 17–23 octobre 2026 n'a pas été exécutée, le quota Query Data Source étant épuisé.
- [ ] IMP-07 — récupérer tous les plats de cette période, comparer identifiants/titres/variantes au catalogue effectivement accessible, faire relire puis préparer uniquement les recettes manquantes avec ingrédients, étapes et sources. Pas de plats inventés ni d'import effectué ici.
- [ ] IMP-07 — vérifier après une future livraison autorisée la lecture du catalogue et le choix des plats dans le planning ; contrôler DB-05 si la synchronisation existe, ou signaler explicitement la divergence tant qu'elle est absente. Consigner pour chaque période source, dates, ID rapprochés/ajoutés, contrôles et état Notion.

## 9. Sécurité

| ID | Description | Priorité | Statut | Dépendances | Critères d'acceptation / preuve |
| --- | --- | --- | --- | --- | --- |
| SEC-01 | Analyser/corriger les alertes npm, dont Next critique | P0 | TODO | Branche distincte et non-régression | `npm audit` 2026-10-17 : 12 (1 moderate, 10 high, 1 critical). Examiner applicabilité et correctifs officiels, pas de `audit fix --force` aveugle |
| SEC-02 | Protéger import privilégié en développement | P0 | TODO | Choix d'accès | Garde d'environnement seule insuffisante : limiter cible locale, exposition réseau, Auth/rôle et valider payload/taille avant tout élargissement |
| SEC-03 | Auditer les grants effectifs, endpoints et protections anti-abus | P0 | TODO | DB-01 | Comparer ACL réelles aux intentions, garder les gardes internes, tester refus anonymes, confirmer quotas ; aucune garantie de rate limiting applicatif |
| SEC-04 | Information et cycle de vie des données personnelles | P1 | TODO | Contact et décisions propriétaire | Définir durée de conservation, export/suppression, médias, Analytics et information ; vérifier le droit applicable, pas de conformité présumée |
| SEC-05 | Nettoyer fichiers photo orphelins sans pertes | P1 | TODO | COM-04, SEC-04 | Diagnostic lecture seule, stratégie après échec upload ou remplacement admin, aucune purge automatique de photos référencées |

## 10. Performances et accessibilité

| ID | Description | Priorité | Statut | Dépendances | Critères d'acceptation / preuve |
| --- | --- | --- | --- | --- | --- |
| UXD-01 | Noms accessibles, focus, zoom, cibles tactiles et mouvement réduit | P1 | TODO | Design | Focus global/labels partiels livrés ; boutons swipe sans nom, zoom bloqué, réduction animations absente. Ancienne case cochée requalifiée |
| UXD-02 | Contrastes et états perceptibles sans couleur | P1 | TODO | UXD-01 | Texte/aria sur jours déjà présent ; mesurer contrastes, sauge et couleurs transparentes, rapport de validation. Ancienne coche non considérée comme audit global |
| UXD-03 | Vue planning tablette/desktop complète | P2 | TODO | ALG-01 | Éditeur deux colonnes présent, mais pas de grille compacte sept jours. Ancienne coche requalifiée partielle |
| UXD-04 | Partage/export de plan | P2 | TODO | ALG-02 | Les courses sont partageables ; aucun partage/impression dédié du plan. Ancienne tâche combinée scindée |
| UXD-05 | Historique, notes et « Refaire » | P1 | DONE | ALG-05 | Entrées lors de cuisine, six dernières dans profil, note 1–5 ; `store.ts`, `profile-page.tsx`. Pas d'archive des semaines |
| UXD-06 | Performance et référencement | P2 | TODO | Mesures initiales | Lighthouse/Core Web Vitals, images, chargement progressif/cache/recherche plein texte et SEO à prioriser selon mesures ; aucun résultat chiffré actuel |
| UXD-07 | Évolutions visuelles | P2 | TODO | Recherche UX | Pistes distinctes dans DESIGN_BRIEF ; aucune refonte pendant cette mission |

## 11. Déploiement et exploitation

| ID | Description | Priorité | Statut | Dépendances | Critères d'acceptation / preuve |
| --- | --- | --- | --- | --- | --- |
| OPS-01 | Pile locale, Mailpit, proxy LAN et correctif JWT | P0 | DONE | Docker | Démarrage, env, Mailpit et Auth/JWT vérifiés cette session ; PostgREST v14.18. Téléphone réel non rejoué |
| OPS-02 | Supprimer uniquement `RESEND_API_KEY` Vercel Production/Preview | P1 | BLOCKED | Autorisation distante explicite | Usage code absent et SMTP intégré vérifiés ; recontrôler cibles/config avant retrait. Aucune valeur exportée, variable encore présente |
| OPS-03 | Isoler Preview et documenter livraison/retour arrière | P0 | TODO | DB-02 | Branche Git `main` et déploiement `f1d500e` servis en production vérifiés le 2026-10-17 ; restent cibles Supabase par environnement et procédure de retour arrière, sans staging supposé |
| OPS-04 | Ajouter des contrôles CI et du monitoring utile | P1 | TODO | SEC-01 | Lint/TypeScript/build et intégration locale sécurisée, erreurs observables sans secrets ; aucun workflow CI versionné actuellement |
| OPS-05 | Vérifier le développement local sans Internet de recipe-app/Broco-Chou | P1 | TODO | OPS-01, DEBT-01, dépendances npm et images Docker déjà disponibles | Applicabilité confirmée par le propriétaire. Démarrage frontend et Supabase/Mailpit locaux sans WAN, parcours essentiels testés et dépendances réseau inventoriées ; distinguer poste préparé et première installation. Aucun démarrage, reset ou migration dans cet audit ; moteur Docker local indisponible |
| OPS-06 | Intégrer les branches validées et publier main | P1 | DONE | Revue des branches et autorisation du propriétaire | Cinq commits de `fix/production-recipe-admins` fusionnés sans conflit dans `4f4d704`, publié sur `origin/main` le 2026-10-17 ; branche documentaire déjà incluse. Lint, TypeScript, build, tests SQL et API locaux réussis. Exclusion de `feat/auth-email-readiness` explicitement confirmée ; bilan de livraison dans le journal ci-dessous |

### Demande F — développement local et hors ligne, périmètre confirmé

- [x] Confirmer l'identité : réponse explicite du propriétaire « recipe app désigne bien ce repo », cohérente avec le lien GitHub du README et `project_id = "recipe-app"` dans [config.toml](../supabase/config.toml). Le volet est donc applicable.
- [x] Identifier les commandes et configurations locales Supabase CLI, Auth, Storage et Mailpit : [package.json](../package.json), [script de démarrage](../scripts/start-local-supabase.mjs) et configuration lus. Ce constat CONFIGURÉ n'est pas un nouveau démarrage réussi.
- [x] Exécuter la recherche/rendu et les actions de planification en mémoire sans réseau et sans SDK Supabase actif, avec recettes fictives ; cela ne valide pas le lancement complet du frontend hors ligne.
- [ ] OPS-05 — démarrer le frontend sans Internet sur un poste préparé, avec dépendances npm et images Docker présentes, puis vérifier les parcours avec Supabase/Mailpit locaux et des gardes loopback. Le moteur Docker Desktop Linux n'est pas joignable ici ; la pile n'a pas été démarrée.
- [ ] DEBT-01 — rendre les ressources nécessaires autonomes et rejouer `npm.cmd run offline:check` : **FAIL préexistant confirmé** sur les URLs Pexels distantes du seed et de 12 imports SQL. Conserver les attributions ; la résolution des fichiers locaux contrôlés par le script a passé avant cet échec.
- [ ] OPS-05 — tester réellement découverte, recherche, planning, courses, Auth/confirmation et recettes/photos locales avec WAN coupé, documenter les limites. Première installation/téléchargements npm/Docker, Supabase Cloud, photos distantes, Vercel et future synchronisation Notion restent liés au réseau ; inventaire dans le [TRD](TRD.md#autonomie-hors-ligne--périmètre-de-vérification). Aucune PWA ni synchronisation différée hors ligne n'est revendiquée.

## 12. Documentation et dette technique

| ID | Description | Priorité | Statut | Dépendances | Critères d'acceptation / preuve |
| --- | --- | --- | --- | --- | --- |
| DOC-01 | Consolider les quatre guides et le README | P1 | DONE | Audit complet | Sept documents, README/AGENTS/.env.example, inventaire de reprise, 121 liens locaux et dix diagrammes validés ; anciens guides supprimés après contrôle |
| DOC-02 | Journal et décisions maintenus après chaque tâche | P1 | DONE | AGENTS | Contrat racine et ADR formalisés, modèle ci-dessous ; statut futur à tenir à jour |
| DOC-03 | Renommer le suivi canonique en ROADMAP.md | P1 | DONE | DOC-02 | Fichier renommé avec contenu antérieur conservé, références README/AGENTS/sept documents et inventaire du vérificateur actualisés ; contrôle documentaire et `git diff --check` réussis le 2026-10-17 |
| DEBT-01 | Ressources hors ligne cohérentes avec les seeds | P1 | TODO | CAT-02 | `offline:check` échoue sur URL Pexels dans seed/imports. Ne pas effacer les attributions ni changer les sources pour masquer l'échec |
| DEBT-02 | Évaluer code non branché et doublons de style/hooks | P2 | TODO | ALG-06, UXD-01 | `recipe-logic` avancé, planning-summary et CSS générique à qualifier avant retrait ; ne pas supprimer sur seul nom |
| DEBT-03 | Sortir `ignoreBuildErrors` et consolider les validations | P1 | TODO | CI et typage vert | Build ne doit plus masquer TypeScript après décision/tests ; aucune modification de cette option dans cette mission |
| DEBT-04 | Portabilité et nettoyage des scripts de tests/imports | P1 | TODO | Tests locaux | Playwright externe documenté, tests local-only et nettoyage des fixtures vérifié ; quantités/ingrédients ajoutés par fixtures à surveiller, sources de génération non portables |

## Historique des imports City Café

Historique repris intégralement pour sa substance depuis `docs/roadmap.md`, confirmé par les JSON/SQL et le [manifeste](../supabase/new-import/city-cafe-manifest.json). Les mentions de validations passées sont historiques ; le journal indique les contrôles rejoués aujourd'hui. Les lots synchronisés ne doivent pas être réimportés hors correction documentée.

| Lot | Intitulés source | Thème | Recettes uniques / suivi |
| --- | --- | --- | --- |
| 01 | 1–9 | Quiches et tartes | 9, historique synchronisé local/production |
| 02 | 10–21 | Bagels, sandwichs, paninis et pains | 12, synchronisé |
| 03 | 22–36 | Pâtes, gnocchis, raviolis et risotto | 15, synchronisé |
| 04 | 37–41 | Pizzas | 5, synchronisé |
| 05 | 42–67 | Végétarien, œufs, brunch et légumes | 26, synchronisé |
| 06 | 68–77 | Poulet et dinde | 10, synchronisé |
| 07 | 78–87 | Bœuf | 10, synchronisé |
| 08 | 88–107 | Porc, veau, agneau, canard et gibier | 20, synchronisé |
| 09 | 108–146 | Poissons et fruits de mer | 38, item 133 fusionné avec 34 |
| 10 | 147–158 | Desserts et cookies | 12, synchronisé |

158/158 intitulés traités, 157 recettes uniques. La fusion des spaghettis frais aux gambas (34) et « Gambas ail et persil avec spaghettis frais » (133) conserve l'ID `city-cafe-spaghetti-gambas-ail-persil`.

### Lots 01–02 : interprétations et anomalies conservées

- Lot 02 dimensionné pour deux personnes, ingrédients canoniques vérifiés ; contrôle historique de 12 recettes dans chaque base, champs métier identiques et zéro référence canonique manquante. Les neuf recettes du lot 01 restaient présentes localement.
- Berliner : viande « kebab » non spécifiée, interprétée comme bœuf épicé façon kebab et documentée dans la recette. Hirata : pain bao plié vapeur ; astuce de pains du commerce.
- Images Pexels approximatives : bagel avocat sans bœuf visible, panini sans saumon visible, sandwich rosette sans bagel, roast-beef sans présentation en bagel. Conserver les [attributions](../supabase/new-import/city-cafe-pexels-attribution.json).
- Lot 01 : lien photographe suspect dans une attribution et quiche fromage/épinards approximative pour thon-curry-fromage frais. Non modifiés par le lot 02 ; à revoir éditorialement.

### Lot 03 : consolidation et substitutions

- Quinze recettes des items 22–36 synchronisées, champs métier identiques et ingrédients présents ; 30 nouveaux noms canoniques ajoutés historiquement.
- Fusion 34/133 conservée au manifeste. Casarecce à la sicilienne interprétées avec thon/olives/câpres/tomate, distinctes des fusilli alla Norma à l'aubergine ; variantes siciliennes variables selon sources.
- Formats spécialisés achetés prêts à l'emploi : malloreddus, casarecce, triangoli, agnolotti, tagliatelles vertes, ravioli, cannelloni, crozets. Astuces de substitution pour ingrédients rares lorsque adaptées.
- Photos approximatives : cannelloni épinards/fromage plutôt que potimarron/chèvre, pastitsio illustré par un gratin proche. Contrôle historique des 15 liens HTTP 200, photos distinctes des lots précédents, zéro référence manquante.

### Lots 04–10 : clôture et corrections

- 122 items traités, 158 au total avec les premiers lots ; 157 IDs dans les deux bases, zéro écart métier/référence/catégorie lors du contrôle final historique.
- Première clôture : 154 images Pexels attribuées et trois recettes du lot 09 avec `image_url=NULL` faute de photo acceptable. API officielle utilisée, aucun contournement antibot. Cet état est historique, remplacé par le contrôle du 2026-09-27.
- Catégories canoniques « Pâte à pizza » et « Poivre » corrigées dans les deux bases, champ `category` ajouté aux ingrédients JSON. Lots SQL 04–10 séparés et idempotents ; lots 05/06 resynchronisés après normalisation de « Huile d'olive ».
- Aucun lot restant à importer. Relire en priorité lots 05–09 pour sauces/proportions/étapes reconstruites à partir de titres courts. Revoir photos approximatives, dont lot 01 ; conserver NULL si aucune image représentative n'est trouvée.

### Contrôle des images du 2026-09-27

Les trois images manquantes (flétan en papillote, filets de perche et bar rôti aux herbes) ont été trouvées via l'API Pexels officielle. [city-cafe-images-completion.sql](../supabase/new-import/city-cafe-images-completion.sql) appliqué historiquement aux deux bases ; 157 URLs non NULL et identiques, 157 réponses HTTP 200 et 157 IDs photo uniques. Les attributions et approximations restantes sont conservées. Ne pas présenter les 154 images de la clôture antérieure comme l'état final.

### Contrôle du 2026-10-17

`verify-city-cafe-sync.mjs` : 157 recettes dans chaque base, 0 différence sur les champs métier, 0 référence canonique absente, 157 attributions/IDs photo uniques et 157 URLs renseignées dans chaque base. Échec global car une catégorie du référentiel local diffère : `tomate`. Diagnostic lecture seule : ligne locale créée le 2026-10-08 à 10:36:43 UTC et zéro recette y faisant référence exactement ; anomalie antérieure aux fixtures de cette session. Aucune correction des bases effectuée. Les URLs HTTP ne sont pas toutes recontrôlées aujourd'hui.

## Inventaire de migration documentaire

Tous les anciens documents ont été lus intégralement avant réorganisation. L'historique Git `e89d109` garde leur texte original ; le contenu utile ci-dessous est redistribué sans conserver une seconde référence concurrente.

| Source ancienne / contenu | Destination canonique | Ajustement fondé sur le code |
| --- | --- | --- |
| README : vision, étudiant, contraintes, inspiration et indépendance Crous | PRD, README | Distinguer objectif de budget et prix effectivement calculés |
| README : écrans et fonctionnalités | PRD, APP_FLOW | Pas d'onboarding de préférences ni de suggestions autonomes à l'accueil |
| README : types métier et SQL complet | TRD, BACKEND_SCHEMA | Pas de `ingredients.updated_at`, source finale sans `lumora` |
| README : moteur de recommandation | TRD | Helpers avancés conservés comme non branchés ; ne pas les annoncer actifs |
| README : installation, téléphone, ports et pare-feu | README, TRD | Adresse LAN illustrative, proxy local et redémarrage conservés |
| README : imports, CLI liée, seeds et transaction SQL | BACKEND_SCHEMA, TRD | Opérations distantes privilégiées préservées comme procédure soumise à accord, pas exécutées |
| README : scripts, limites et idées futures | TRD, présente roadmap | Fonctions devenues existantes distinguées des idées : déjeuners, notes, filtres et partage des courses |
| README : licences et attributions | README, PRD, artefacts | Aucun droit de réutilisation inventé ; sources Crous/Pexels conservées |
| app-workflows : états, catalogue, édition, cuisine/courses et propriété des données | APP_FLOW, TRD | Onboarding ouvre l'accueil ; catalogue côté client direct, pas API de lecture inventée |
| recipe-moderation : rôle SQL, seed admin, polling, correction/refus | APP_FLOW, BACKEND_SCHEMA | Refus commenté obligatoire dans schéma final ; écart Cloud explicite |
| recipe-moderation : outbox, Mailpit, liens review, reprise GET et tests | APP_FLOW, BACKEND_SCHEMA, TRD | Resend non provisionné abandonné ; maintien des fonctions locales |
| roadmap : toutes les tâches cochées et opportunités de l'audit UX | Thèmes 1–12 ci-dessus | Coches partielles requalifiées avec justification, pas effacées |
| roadmap : lots, fusion 34/133, interprétations, corrections et images | Historique ci-dessus et new-import inchangé | Distinguer 154 puis 157 images et ne pas promettre zéro écart actuel de catégorie |
| supabase-local-development : prérequis, démarrage, lien distant masqué, env et téléphone | TRD | Pas de SMTP externe déduit du seul TOML ; inspection Cloud effective |
| supabase-local-development : JWT 14.18, diagnostics, Storage, migrations et volumes | TRD, BACKEND_SCHEMA | Préférer migration locale additive ; reset destructif local seulement si voulu |
| supabase-local-development : méthodes de confirmation, tests et historique du 09 octobre | TRD, journal | Token admin consommé distinct de livraison Mailpit ; anciennes observations non rejouées signalées |
| .env.local.example | .env.example, TRD | Un seul modèle, scripts vérifiés ; aucune variable Google/Turnstile/Mailjet/Resend |

## Dette technique et points non vérifiés

Priorités immédiates : SEC-01 (avis npm), AUTH-03 (capacité d'inscription publique), SEC-02/03 (import et grants), DB-02 (restauration complète), GRO-01/02 (calculs et péremption courses). DB-01 et COM-06 sont clos après livraison SQL autorisée ; la décision de publier la recette existante reste à faire dans l'interface. Les autres dettes sont traçables dans les thèmes ci-dessus : accessibilité, styles/hooks inutilisés, statistiques non littérales, Playwright externe, portabilité des générateurs, photos orphelines et absence de restauration testée. Ne pas généraliser un test local réussi aux accès, e-mails ou données de production.

Évolutions futures explicitement non réalisées par cette mission : Odélis périodique, génération automatisée, déduplication avancée, notifications publiques, SEO, cache/chargement progressif, synchronisation multi-appareil et refonte visuelle. Les propositions de l'ancien README (restes, coût par recette, stock disponible, batch cooking, favoris avancés, remplacement selon temps) restent dans le backlog.

### Ordre conseillé pour les demandes A–F restantes

1. Rétablir le moteur Docker local et préparer le poste (OPS-05), puis revalider les parcours texte/photo/modération existants et les permissions SEC-03 sans les recréer ; vérifier A sur mobile/ordinateur avec UX-09. Les autres P0 de l'audit restent prioritaires selon leur risque.
2. Définir le contrat To Eat List DB-05, les règles de confidentialité/conflits/suppressions et une copie durable des médias ; obtenir une restauration isolée DB-06 avant d'annoncer une sauvegarde ou une intégration complète. Formaliser le futur choix d'architecture par ADR avant son implémentation.
3. Développer et tester les flux de synchronisation des deux côtés, reprises et cas limites DB-05. En parallèle, lever le blocage source/semaine IMP-07 et préparer le rapprochement des plats ; la maintenance peut rester manuelle avec état Notion explicitement suivi tant que le connecteur manque.
4. Ajouter la voix COM-07 avec San et compléter la capture mobile COM-08 en réutilisant formulaire, stockage et modération existants. Traiter les ressources DEBT-01 puis terminer la validation sans WAN OPS-05 avant de promettre une autonomie complète.

## Journal de session

### 2026-10-17 — Audit de main, nettoyage minimal et consolidation

**Objectif :** Décrire la production de référence et préparer une documentation cohérente sans écriture ni déploiement distant.

**Travaux réalisés :** Vérification Git/fetch et création de branche depuis `e89d109`, lecture du code et des quatre guides/README, reconstruction SQL, audit Cloud/Vercel en lecture seule, identification migration absente et SMTP intégré, garde locale sur appel de notification, redistribution documentaire et contrôle de l'historique d'import.

**Fichiers modifiés :** `components/personal-recipe-form.tsx`, README ; nouveaux sept documents, AGENTS, `.env.example`, `scripts/verify-documentation.mjs`. Anciens quatre guides et `.env.local.example` supprimés après inventaire de reprise et validation des liens/diagrammes. Aucune migration ni donnée source modifiée.

**Tests exécutés :** Tableau ci-dessous. Les scripts créent des comptes, recettes et photos fictifs locaux et les suppriment. Aucun e-mail à utilisateur réel ; seules lectures de métadonnées et catalogue d'import en Cloud.

| Commande / contrôle | Environnement | Résultat et correction / reste à vérifier |
| --- | --- | --- |
| `git status`, branches/log, `git fetch origin`, comparaison main/origin | Git local + lecture origin | Propre initialement, `e89d109`, aucun retard/avance ; droits Git sandbox requis pour fetch/branche |
| `npm ci` | Machine locale, lockfile main | PASS après EPERM module Next verrouillé ; serveur de dev existant identifié, arrêté puis relancé. Aucun changement de lockfile |
| `npm run lint` | Sources main + garde | PASS, quatre warnings `<img>` existants, zéro erreur |
| `npx tsc --noEmit` | Local | Premier échec : `.next/types` de branche expérimentale ; après build régénérant les routes : PASS |
| `npm run build` | Build local production, `.env.local` | PASS, sept routes/page système attendues ; annonce explicitement validation types ignorée par config. Aucune exécution d'envoi ni déploiement |
| `npm run supabase:start` | Docker local | PASS après escalade pour cache/télémétrie CLI hors workspace ; démarrage depuis backup, aucun reset |
| `npm run supabase:env` | Local seulement | PASS, `.env.development.local` régénéré sans affichage des clés ni modification `.env.local` |
| `npm run mailpit` | Local seulement | PASS, inbox 54324 prête |
| `npm run mailpit:check` | Local seulement | PASS : inscription, connexion bloquée avant confirmation, livraison et consommation du lien réel, redirection localhost et connexion |
| `node scripts/verify-local-jwt.mjs` | Local direct | PASS : confirmation obligatoire, JWT connexion/refresh, cinq refresh et 15 lectures concurrentes, rôle et logout ; compte supprimé |
| `node scripts/verify-local-auth.mjs` | Next localhost → proxy → Supabase local | PASS : visiteur, inscription, confirmation par token réel généré admin, connexion/refresh, identité, rôle, upload/photo signée et logout. Ce test ne prouve pas lui-même la livraison inbox |
| `node scripts/verify-personal-recipes.mjs` | Local direct | PASS : soumission privée, photo, ingrédients, gardes, édition admin, refus commenté, approbation/concurrence, droits e-mail et outbox |
| Même script avec `TEST_APP_URL=http://localhost:3000` | API locale + Mailpit | PASS supplémentaire : Auth endpoint, livraison, lien de recette et absence de doublon sur répétition |
| `node scripts/verify-recipe-review-browser.mjs` | Chromium headless, viewport 390×844, localhost | Module absent du projet au premier essai ; rejoué avec `PLAYWRIGHT_MODULE` vers le cache existant : PASS, lien review, correction/refus et persistance, zéro erreur navigateur |
| Harness local `.temp/verify-reference-submission.mjs` | Formulaire développement et bundle production local sur 3001 | PASS : création réelle privée par le formulaire, invitation Mailpit en développement ; zéro appel notification avec bundle production, sauvegarde et outbox conservées. Tous les appels Supabase Cloud du navigateur interceptés vers la seule base locale, fixtures supprimées, aucune écriture Cloud. Harness de session non versionné |
| `npm run offline:check` | Artefacts locaux | FAIL préexistant : URLs Pexels distantes dans seed et imports. Aucune suppression pour masquer l'échec ; DEBT-01 |
| `node scripts/verify-city-cafe-sync.mjs` | Lectures local + Cloud | FAIL global : catégorie locale tomate différente ; 157 recettes et champs métier identiques, références valides, 157 images/attributions. DB-03 |
| `npm audit --json` | Registre npm, lecture | 12 alertes (1 moderate, 10 high, 1 critical dont Next), aucune correction automatique ; SEC-01 |
| API de gestion Auth + schéma + historique migrations | Cloud lecture seule | SMTP intégré, 2/h, confirmation et URL publiques correctes ; six migrations, septième absente ; policies Storage/recettes et bucket concordants avec base initiale |
| API Vercel variables, `decrypt=false` | Production/Preview lecture seule | Variables publiques Supabase + Resend présentes, valeurs masquées ; pas de changement |
| Parse/rendu Mermaid dans Chromium | Documentation locale, outillage temporaire dans `.temp` ignoré | PASS : 10 diagrammes parsés et rendus ; correction d'un point-virgule dans une note de séquence. Aucun ajout de dépendance applicative |
| `node scripts/verify-documentation.mjs`, `git diff --check` | Documentation locale | PASS : exactement sept documents, métadonnées, blocs Markdown, 121 liens locaux et modèle d'environnement. Contrôle de diff sans erreur ; aucun changement de manifests, Auth, migrations ni configuration de production |

**Décisions :** ADR-001 à 010 ; appel d'invitation réservé au local, Auth/RLS/migrations conservées, provisioning Resend annulé. Retrait de variable seulement proposé.

**Blocages :** Autorisation de retrait Vercel et déploiement Cloud non demandés ; aucune restauration ni inscription publique réelle testée. Les échecs offline/catégorie sont conservés comme dettes distinctes, pas réparés par une migration de données implicite.

**Prochaines actions :** Relire la branche avant fusion, sans push automatique ; traiter SEC-01 et préparer la livraison contrôlée DB-01 avec sauvegarde/accord, confirmer la capacité Auth publique, puis les quantités et l'accessibilité. À la fin de l'audit initial, les modifications avaient été laissées non commitées pour revue ; leur découpage est consigné dans l'entrée suivante. Le serveur de développement local a été relancé ; le serveur de test du bundle sur 3001 a été arrêté.

### 2026-10-17 — Commits séparés des modifications auditées

**Objectif :** Enregistrer les modifications en cours dans des commits locaux cohérents au format Conventional Commits, à la demande du propriétaire.

**Travaux réalisés :** Séparation de la correction fonctionnelle (`fix(notifications)`), de la consolidation documentaire (`docs(reference)`) et du nouvel outil de vérification (`feat(docs)`). Aucun changement de comportement supplémentaire, push ni déploiement.

**Fichiers modifiés :** `scripts/verify-documentation.mjs` ajouté dans son propre commit avec cette entrée de journal ; les autres modifications sont dans les deux commits précédents.

**Tests exécutés :** `node scripts/verify-documentation.mjs` réussi (sept documents, métadonnées, blocs Markdown, 121 liens locaux et modèle d'environnement) ; `node --check scripts/verify-documentation.mjs` réussi ; vérifications du diff et de l'index sans erreur. Les validations applicatives de l'audit précédent restent la référence ; aucun code applicatif supplémentaire modifié.

**Décisions :** Commits locaux sur `chore/main-documentation-cleanup` : `31f676b` pour la correction des invitations, `8480b1f` pour la documentation, puis un commit distinct pour le vérificateur documentaire. Aucune nouvelle ADR nécessaire.

**Blocages :** Aucun pour les commits ; les dettes et décisions de production précédemment documentées restent ouvertes.

**Prochaines actions :** Relire les commits puis décider d'un éventuel push ou d'une fusion ; aucune opération distante autorisée par la seule demande de commit.

### 2026-10-17 — Intégration sur main et déploiement Vercel autorisés

**Objectif :** Pousser tous les commits sur `main` et suivre le déploiement de production, conformément à la demande explicite du propriétaire.

**Travaux réalisés :** Fetch et vérification d'un arbre propre ; intégration en avance rapide des trois commits depuis `chore/main-documentation-cleanup`, puis push de `e89d109` à `f1d500e`. Vercel a construit le commit attendu de `main` sur le projet `recipe-app` de l'équipe `vertondan-9283s-projects`. Déploiement `dpl_BrJBdMCv3v3JL8NaN9hCou3zPniV` confirmé `READY`, cible production, URL publique `https://recipe-app-alpha-wine.vercel.app` présente dans ses alias. Build Vercel terminé en 37 s. Un commit documentaire complémentaire consigne ce résultat et suit la même livraison Git.

**Fichiers modifiés :** README (statut de livraison), TRD (distinction audit initial/livraison autorisée), présent journal et critère OPS-03. Aucun code applicatif, variable Vercel, réglage Auth ou migration Supabase modifié pendant cette livraison.

**Tests exécutés :** Vérificateur documentaire réussi avant push ; build Vercel réussi. Harness de session `.temp/verify-production-deployment.mjs` exécuté sur l'URL publique avec Chromium mobile : onboarding, accueil, swipe, création d'un planning local, courses et profil réussis ; 473 recettes publiques chargées, zéro erreur JavaScript. Les requêtes Supabase du navigateur sont limitées à GET/OPTIONS, sans inscription, envoi d'e-mail ni écriture de données Cloud. HTTP : accueil 200, notifications POST/GET sans autorisation 401, import save en production 403, images locales 200. Aucun événement error/fatal retourné pour ce déploiement sur les 30 dernières minutes ; demande initiale de fenêtre 1 h refusée par la rétention Hobby, corrigée en 30 min. Aucun drain de logs configuré, donc observation ponctuelle uniquement.

**Décisions :** Autorisation explicite reçue pour push sur `main` et déploiement frontend ; aucune application implicite de la migration SQL manquante ni suppression de la variable Resend. Aucun nouveau choix architectural.

**Blocages :** Aucun pour cette livraison. Les dettes de sécurité et l'écart de schéma Cloud restent ceux de l'audit ; les tests de production n'exercent pas les parcours nécessitant une écriture réelle ou un compte personnel.

**Prochaines actions :** Traiter SEC-01, préparer séparément DB-01 avec sauvegarde et autorisation dédiée, puis finaliser l'isolation Preview et la restauration. Le suivi du dernier commit documentaire est communiqué dans le rapport de livraison.

### 2026-10-17 — Diagnostic des administrateurs de production et correction préparée

**Objectif :** Expliquer l'absence de validation dans les espaces des deux comptes signalés et préparer un correctif sûr.

**Travaux réalisés :** Arbre initial propre ; `main` local et distant vérifiés à `3014530` par `git ls-remote`, branche `fix/production-recipe-admins` créée depuis main. Audit Cloud ciblé via API de gestion, `read_only=true`, `begin read only` et `rollback` : les deux comptes existent et sont confirmés, aucun membership `recipe_admins`, une recette pending de l'auteur signalé ; six migrations présentes, workflow et table des e-mails absents. La migration historique autorise déjà le second administrateur et le Proton du propriétaire, mais pas son compte Gmail actuel. Nouvelle migration additive/idempotente ajoutant le Gmail, sans modification de l'ancienne migration. Test de mise à niveau depuis le schéma initial, sans copie de données de production.

**Fichiers modifiés :** `supabase/migrations/20261017120000_add_recipe_moderator_email.sql`, `scripts/verify-recipe-review-migrations.mjs`, BACKEND_SCHEMA, TRD et présente roadmap/journal. Diagnostics de session dans `supabase/.temp` ignoré ; aucun secret exporté ni versionné. Aucun code d'interface ni dépendance modifié.

**Tests exécutés :**

| Contrôle | Environnement | Résultat |
| --- | --- | --- |
| Audit ciblé comptes, compteurs, schéma et historique | Cloud, lecture seule | Cause confirmée ; recette existante toujours pending, aucune décision de modération exécutée |
| `node scripts/verify-recipe-review-migrations.mjs` | Base éphémère dans Docker local, contrats Auth/Storage réduits | PASS après correction d'une interpolation dans l'assertion du nouveau script ; migration atomique des six versions initiales vers les deux nouvelles, ligne recette inchangée, rattrapage outbox, anciens administrateurs conservés, ajout idempotent, confirmation obligatoire, visibilité inter-comptes et approbation ; base supprimée dans les deux exécutions |
| `node scripts/verify-personal-recipes.mjs` | Supabase Auth/Storage/API locaux réels, gardes loopback et fixtures fictives nettoyées | PASS : soumission, photo, vie privée, édition, refus motivé, décision concurrente, droits e-mail et file |
| `npx supabase migration up --local` | Supabase local uniquement | PASS : seule `20261017120000` appliquée, aucune réinitialisation ni seed |
| `npm run lint` | Local | PASS, quatre avertissements `<img>` préexistants, aucune erreur |
| `npm run build` puis `npx tsc --noEmit` séparé | Local, build de production | PASS pour les deux ; aucune livraison Vercel |
| `node --check scripts/verify-recipe-review-migrations.mjs`, `node scripts/verify-documentation.mjs`, `git diff --check` | Local | PASS ; sept documents conservés, diagrammes inchangés |

**Décisions :** Conserver les droits existants et ajouter une adresse plutôt que réécrire une migration ; aucune nouvelle architecture ni ADR nécessaire. La correction d'interface n'est pas nécessaire : la validation est déjà conditionnée au rôle SQL. Pas de publication automatique de la recette personnelle. Les tests n'emploient jamais les comptes réels comme fixtures.

**Blocages :** Application des deux migrations et vérification des nouveaux droits en production à autoriser explicitement selon AGENTS ; sauvegarde sécurisée préalable encore à réaliser. COM-06 et DB-01 restent TODO. L'audit ne constitue pas une connexion avec les sessions personnelles ni un test de restauration Cloud.

**Prochaines actions :** Après accord dédié, sauvegarder les éléments concernés et appliquer `20261016180000` puis `20261017120000` au seul projet Cloud attendu avec suivi de versions ; vérifier les droits/recette en lecture seule, puis recharger le profil et valider ensemble dans l'interface. La synchronisation Git et tout déploiement frontend demeurent des opérations distinctes à autoriser.

### 2026-10-17 — Application autorisée des migrations de modération en production

**Objectif :** Appliquer les deux migrations testées, selon la demande explicite du propriétaire après connexion à la CLI Supabase, puis vérifier les droits des deux comptes.

**Travaux réalisés :** Projet lié confirmé `cbwrvcifxcqyrgtcpvbd`, préfixe de six migrations et simulation listant exclusivement `20261016180000` puis `20261017120000`. Export par `supabase db dump --linked` du schéma public et des données `public,supabase_migrations`, dans `supabase/.temp/production-review-backup-20261017`, ignoré par Git et ACL limitée au compte Windows. Dumps terminés avec code 0 ; présence des objets, recettes et historique vérifiée, tailles et SHA-256 relevés sans afficher les données. Empreintes de contrôle avant application. Push autorisé exécuté avec `npx supabase db push --linked --skip-vault --yes` : deux migrations appliquées, aucun seed/rôle additionnel ni changement Vault. Pas de push Git ni de redéploiement frontend.

**Fichiers modifiés :** README, AGENTS (état du déploiement SQL), BACKEND_SCHEMA, APP_FLOW, TRD, DECISIONS (conséquences des décisions inchangées) et présente roadmap/journal. Les migrations et le test local préparés précédemment sont inchangés. Harness et sauvegardes de session uniquement sous `supabase/.temp`, aucun secret ou dump ajouté à Git.

**Tests exécutés :**

| Contrôle | Environnement | Résultat |
| --- | --- | --- |
| `db push --linked --dry-run` avant livraison | Cloud, simulation | Exactement les deux migrations autorisées ; six versions initiales confirmées |
| Exports schéma et données/historique, contrôle fichiers et exclusion Git | Cloud lecture seule → fichiers locaux protégés | PASS ; export ciblé, pas de copie des octets Storage ni de restauration complète. L'assertion initiale du marqueur de fin a été adaptée : les commentaires du dump de schéma sont retirés par défaut, sa présence n'est pas un critère valide |
| `db push --linked --skip-vault --yes` | Supabase production | PASS, deux versions appliquées dans l'ordre ; aucune publication de recette |
| Empreintes et compteurs avant/après | Cloud, transactions en lecture seule | PASS : 474 recettes dont une pending ; recettes, ingrédients, anciens memberships, identités Auth (id/e-mail/confirmation) et métadonnées des photos inchangés |
| `is_recipe_admin()` et SELECT recettes/auteurs, identité SQL des deux comptes sous rôle `authenticated` | Cloud, `begin read only` et `rollback` | PASS pour les deux comptes, recette de l'auteur attendu visible. Premier essai refusé car le rôle de l'API `read_only=true` ne peut pas faire `SET ROLE` ; rejoué via connexion normale, toujours en transaction SQL explicitement READ ONLY, sans écriture |
| Lecture sous rôle `anon`, RLS des nouvelles tables, privilèges helper, rattrapage file | Cloud, lecture seule | PASS : admin faux et zéro pending pour visiteurs ; RLS active ; helper interne inaccessible à anon/authenticated ; une entrée pending non envoyée |
| `db push --linked --skip-vault --dry-run` final | Cloud, simulation | PASS : `upToDate=true`, aucune migration restante ; huit versions présentes |
| `node scripts/verify-documentation.mjs`, `git diff --check` | Documentation locale | PASS ; sept documents conservés, diagrammes inchangés. Tests applicatifs, lint, TypeScript et build réussis lors de la préparation précédente, sans changement de code depuis |

**Décisions :** Autorisation explicite limitée à la livraison SQL reçue et exécutée ; DB-01/COM-06 passent DONE sur preuves Cloud. Aucun nouveau choix architectural. Notifications de production toujours sans transport, la recette reste à modérer dans l'interface. Les sauvegardes ciblées ne clôturent pas DB-02 (restauration complète et photos).

**Blocages :** Aucun pour les migrations et les droits SQL. Pas de test navigateur utilisant les sessions personnelles ni de décision réelle de modération automatisée.

**Prochaines actions :** Recharger le profil de production et examiner/valider la recette depuis l'un des deux comptes ; conserver les changements locaux pour revue et intégration Git séparée. Poursuivre SEC-01 et DB-02 dans des tâches distinctes.

### 2026-10-17 — Suivi du complément de sélection et du recommencement discret

**Objectif :** Ajouter à la roadmap la demande de complément des plats/desserts après épuisement des cartes et de recommencement discret en bas à gauche, après vérification de l'existant.

**Travaux réalisés :** Lecture des références produit, techniques, parcours et design, de `components/swipe-deck.tsx` et des actions du store. Les deux comportements sont déjà implémentés dans les sources ; ajout des lignes UX-07/UX-08 avec preuve de code, conditions et limites, sans développement supplémentaire. Les recettes déjà acceptées sont exclues du complément et la sélection est conservée ; le recommencement est une action distincte qui efface acceptations/refus mais conserve les favoris.

**Fichiers modifiés :** `docs/ROADMAP.md` uniquement pour cette tâche ; changements non sauvegardés préexistants préservés sur `fix/production-recipe-admins`.

**Tests exécutés :** Lecture statique du composant et du store ; `node scripts/verify-documentation.mjs` et `git diff --check` en local : PASS. Sept documents conservés, métadonnées et liens vérifiés, diagrammes inchangés. Aucun code applicatif modifié ; lint, TypeScript, build et tests navigateur non exécutés pour cette tâche documentaire.

**Décisions :** Consigner l'existant avec statut DONE sur preuve de code, conformément aux règles de suivi ; aucune nouvelle architecture ni ADR. Aucun push, déploiement ou changement de configuration distante effectué.

**Blocages :** Aucun pour le suivi documentaire. Le complément n'est proposé qu'avant le premier passage de complément et s'il existe des candidats ; la position réellement affichée et le comportement en production ne sont pas validés par cette lecture.

**Prochaines actions :** Vérifier en navigateur mobile/desktop l'épuisement des cartes avec plats/desserts manquants, la conservation des choix, l'absence de doublons et la visibilité du recommencement ; poursuivre UX-05 pour sa confirmation.

### 2026-10-17 — Synchronisation documentaire des demandes Notion A–F

**Objectif :** Rapprocher les cinq demandes transmises et le volet hors ligne conditionnel de l'état réel du dépôt, sans développer ni modifier des données.

**Travaux réalisés :** Lecture des références canoniques, Git, composants, store, client/mapping Supabase, imports et scripts de vérification. Maintien de la roadmap unique et des anciens ID ; ajout de UX-09, COM-07/08, DB-05/06, IMP-07 et OPS-05 avec sous-tâches cochées seulement sur une vérification précisée. Réponse du propriétaire : To Eat List est la page Notion indiquée, recipe-app désigne ce dépôt ; F inclus après cette confirmation. Lecture seule de cette page, des schémas Recettes/Ingrédients/Meal Plan, de deux lignes de recettes, d'une fiche détaillée et de huit jours de menus échantillonnés. Aucun accès ni changement de la To Do List d'origine. Compétence `notion:notion-research-documentation` appliquée pour relier les preuves Notion et locales ; aucune écriture Notion.

**Fichiers modifiés :** `docs/ROADMAP.md`, `docs/PRD.md`, `docs/TRD.md`. Les modifications antérieures, y compris UX-07/08 et le suivi de modération, sont conservées sur `fix/production-recipe-admins` ; aucune branche de production créée ni fichier applicatif modifié.

**Tests exécutés :**

| Contrôle | Environnement | Résultat / limite |
| --- | --- | --- |
| Harness Node transmis sur stdin : transpilation TS/TSX en mémoire et rendu React | Modules actuels ; recettes/comptes fictifs, hook de rendu lié à un état figé, SDK Supabase neutralisé | PASS : recherche titre/casse/espaces et résultat vide ; actions du store ajout/remplacement/anti-doublon et JSON persistant ; actions admin affichées seulement pour rôle fictif ; champs texte/photo et mapping quantités/étapes/statut/chemin. Premier essai du harness en échec car l'adaptateur Zustand requiert `window.localStorage` ; corrigé dans le harness seulement. Aucun navigateur, RPC, fichier ou stockage réel écrit |
| Vérification Node sur stdin des artefacts de menus | Lecture des SQL, seed et générateur Python | PASS : 11 ID distincts, présents au seed, import repris par le générateur ; aucun SQL exécuté, aucun rapprochement avec une base active ni un menu actuel validé |
| Recherche des intégrations et lecture des tests existants | Dépôt local | Aucun connecteur Notion/To Eat List ni code vocal trouvé ; tests de soumission/modération existants relus mais non exécutés car mutation/nettoyage de fixtures et/ou migrations. Aucune dépendance ajoutée |
| Métadonnées SQL en transaction READ ONLY via `docker exec` | Supabase local attendu uniquement | NON EXÉCUTÉ côté SQL : accès Docker refusé en sandbox puis nouvel essai autorisé hors sandbox ; moteur Docker Desktop Linux introuvable. Aucun démarrage, migration, seed, reset ni mutation |
| `npm.cmd run offline:check` | Artefacts locaux | FAIL préexistant confirmé : URLs Pexels dans le seed et 12 imports, dont weekly-plan-recipes. Premier appel `npm` bloqué par ExecutionPolicy PowerShell, relancé via `npm.cmd` ; aucun changement de configuration |
| Fetch Notion et lectures d'échantillons | Connecteur Notion, lecture seule | Schémas et contenu d'une recette identifiés ; échantillons limités, aucun inventaire complet ni synchronisation prouvée. Fetch des pages étiqueté « as of 2026-05-14 » par l'outil : fraîcheur de ces instantanés non garantie |
| Requête Meal Plan sur le 17–23 octobre 2026 | Notion, lecture seule | NON EXÉCUTÉE : quota Query Data Source atteint ; aucune relance automatique ni souscription. Période utilisée comme sonde, pas comme semaine cible validée par le propriétaire |
| `node scripts/verify-documentation.mjs`, revue Markdown et `git diff --check` | Documentation locale | PASS : sept documents, métadonnées/blocs/liens locaux valides ; diagrammes inchangés. Aucun lint/TypeScript/build ni test navigateur rejoué pour cette mission documentaire |

**Décisions :** Préserver la structure et les tâches existantes ; ne pas assimiler une case documentaire, un rendu isolé, un import SQL, un schéma configuré ou un test historique à un parcours opérationnel de production. To Eat List comme référence durable est une exigence du propriétaire ; son contrat d'intégration reste à concevoir, sans choix architectural implémenté ni ADR Accepted supplémentaire. La saisie photo n'implique pas automatiquement de l'OCR. IMP-07 est une maintenance récurrente distincte du pipeline futur IMP-04. Les plans restent locaux par compte.

**Blocages :** Semaine cible et source active des menus non confirmées ; quota de requêtes Notion épuisé ; couverture Notion limitée et instantanés datés ; Docker local indisponible. Pas de sauvegarde/restauration To Eat List, de synchronisation applicative ou de tests des modes voix/capture réellement exécutés. Aucune garantie de production nouvelle.

**Prochaines actions :** Suivre l'ordre A–F ci-dessus : restaurer l'environnement de test, vérifier les parcours existants ; définir DB-05/06 et démontrer la récupération durable ; confirmer la période/source IMP-07 ; compléter ensuite voix/photo et autonomie hors ligne. La lecture du menu ciblé pourra être reprise après rétablissement de l'accès aux requêtes Notion. Aucun push ni déploiement réalisé.

### 2026-10-17 — Renommage du document de suivi en ROADMAP.md

**Objectif :** Renommer `IMPLEMENTATION_PLAN.md` en `ROADMAP.md` à la demande du propriétaire.

**Travaux réalisés :** Renommage dans `docs`, titre ajusté, références et libellés actualisés dans README, AGENTS et les documents canoniques ; inventaire du script de vérification documentaire adapté. Comparaison avant/après confirmant la conservation du contenu préexistant hors remplacement du nom et l'absence de modification des diagrammes. DOC-03 consigne la clôture.

**Fichiers modifiés :** `docs/ROADMAP.md` (renommage), README, AGENTS, les six autres documents de `docs` et `scripts/verify-documentation.mjs`. Changements utilisateur préexistants conservés sur la branche courante.

**Tests exécutés :** `node scripts/verify-documentation.mjs`, `node --check scripts/verify-documentation.mjs` et `git diff --check` en local : PASS ; exactement sept documents et 148 liens locaux valides, diagrammes conservés. `npm.cmd run lint` : PASS avec quatre avertissements `<img>` préexistants ; `npm.cmd run build` : PASS ; contrôle TypeScript séparé `node node_modules/typescript/bin/tsc --noEmit` : PASS. Aucun test métier ou navigateur rejoué pour ce renommage ; aucune donnée ou configuration distante modifiée.

**Décisions :** `docs/ROADMAP.md` devient le nom canonique unique du suivi ; les chemins cités dans les entrées précédentes sont actualisés vers ce nom. Aucun changement d'architecture ni ADR nécessaire.

**Blocages :** Aucun pour le renommage.

**Prochaines actions :** Utiliser `docs/ROADMAP.md` pour le suivi des prochaines tâches. Aucun push ni déploiement réalisé.

### 2026-10-17 — Commits séparés des modifications en cours

**Objectif :** Enregistrer les changements existants dans des commits conventionnels distincts, à la demande du propriétaire.

**Travaux réalisés :** Revue des changements sur `fix/production-recipe-admins` et séparation par sujet : correction SQL et test de migration, bilan documentaire Supabase, suivi du swipe, demandes produit/Notion/hors ligne, puis renommage du suivi. Contenu préexistant préservé ; seuls les détails de cette clôture sont ajoutés au journal.

**Fichiers modifiés :** Présent journal ; les autres fichiers en cours sont enregistrés dans leurs commits respectifs, sans nouvelle modification fonctionnelle.

**Tests exécutés :** `npm.cmd run lint` : PASS avec quatre avertissements `<img>` préexistants ; `npm.cmd run build` puis contrôle séparé `node node_modules/typescript/bin/tsc --noEmit` : PASS. Syntaxe des deux scripts de vérification, contrôle documentaire (sept documents, 148 liens locaux) et `git diff --check` : PASS. Test `verify-recipe-review-migrations.mjs` : premier essai bloqué par les permissions Docker de la sandbox, nouvel essai autorisé hors sandbox PASS ; mise à niveau et droits vérifiés dans une base locale éphémère, supprimée en fin de test. Aucun test navigateur ni test API Auth/Storage complet rejoué pour cette mise en commits.

**Décisions :** Conserver la branche courante et séparer les sujets dans l'historique ; aucune nouvelle architecture ni ADR. Aucun push, déploiement ou accès Cloud effectué pendant cette tâche ; l'état distant documenté provient des opérations antérieures.

**Blocages :** Aucun pour les commits locaux. Les limites et tâches métier déjà ouvertes restent inchangées.

**Prochaines actions :** Relire les commits avant une éventuelle intégration ; push et livraison restent à autoriser séparément.

### 2026-10-17 — Fusion des branches validées sur main

**Objectif :** Réunir sur `main` les derniers correctifs et mises à jour validés, puis publier sur GitHub après accord explicite du propriétaire.

**Travaux réalisés :** État initial propre sur `fix/production-recipe-admins`, récupération distante et égalité `main = origin/main = 3014530` vérifiées. `chore/main-documentation-cleanup` est déjà ancêtre de main. Création de `chore/integrate-main-20261017` depuis `origin/main` ; fusion sans conflit des cinq commits `4a6e740`, `9ef23ac`, `f3c118a`, `9a079d3` et `8b014c0` dans `4f4d704`. Avance de main par `--ff-only`, puis `git push origin main` autorisé et réussi ; lecture de la référence distante confirmant le même SHA. Aucun historique réécrit ni branche supprimée.

**Fichiers concernés :** Migration corrective administrateur, test SQL de mise à niveau, README/AGENTS, sept documents canoniques et vérificateur documentaire repris des commits existants ; seul ce journal et la ligne OPS-06 sont ajoutés pour la clôture. Aucun changement du parcours Auth, des dépendances ou de la configuration distante.

**Tests exécutés :**

| Contrôle | Environnement | Résultat / limite |
| --- | --- | --- |
| `npm.cmd run lint` | Local, résultat de fusion | PASS, quatre avertissements `<img>` préexistants |
| `npm.cmd run build` puis `node node_modules/typescript/bin/tsc --noEmit` séparé | Local | PASS ; le build seul ignore toujours les erreurs de types |
| `node scripts/verify-recipe-review-migrations.mjs` | Base Docker locale éphémère | PASS : mise à niveau, préservation recette/auteur/photo et anciens administrateurs, ajout idempotent, confirmation obligatoire, RLS et validation. Premier essai refusé par la sandbox ; relance autorisée réussie et base de test supprimée |
| `node scripts/verify-personal-recipes.mjs` | Supabase Auth/Storage/API locaux, garde loopback | PASS : soumission, photo, confidentialité, édition, refus motivé, décision concurrente, droits et file ; comptes/recette/photo de test nettoyés par le script. Premier essai bloqué par l'écriture de télémétrie CLI en sandbox, relance autorisée réussie. Option `TEST_APP_URL` non activée : endpoint Next.js et livraison Mailpit non rejoués |
| `node --check scripts/verify-recipe-review-migrations.mjs`, `node scripts/verify-documentation.mjs`, `git diff --check` | Local | PASS ; sept documents, 148 liens locaux avant ajout de cette entrée, diagrammes inchangés |
| `git ls-remote --heads origin main`, ancêtres Git | GitHub, lecture seule après push | PASS : `4f4d70408e8bff6f53ae4fc6b4e1703679ae556f` publié ; branches correctifs et documentation incluses |
| API Vercel projet/déploiement, résolution du domaine et requête HTTP HEAD | Production, lecture seule | PASS : projet `recipe-app`, équipe attendue, déploiement `dpl_7eRqeCRH4j7qKVJwrUfirY2ckjUh` en `READY`, branche `main`, SHA `4f4d704`, alias public associé et HTTP 200. Première requête HTTP bloquée en sandbox, relance autorisée réussie. Ce contrôle ne valide pas tous les parcours de production |

**Décisions :** Le propriétaire confirme explicitement le maintien de l'exclusion de `feat/auth-email-readiness` et autorise le push sur `origin/main` avec son éventuel déploiement Vercel automatique. Ses sept commits expérimentaux (Mailjet, Google OAuth, Turnstile et parcours associés) restent hors fusion, conformément aux ADR-002/006/007. Aucune nouvelle architecture ni ADR. Aucune migration Cloud appliquée pendant cette tâche : leur livraison antérieure est documentée séparément.

**Blocages et limites :** Aucun conflit. Pas de test navigateur rejoué ni de décision de modération sur une recette réelle ; les dettes et alertes déjà suivies restent ouvertes. Le commit de fusion est déployé en production ; la clôture documentaire est livrée dans un commit séparé, sans changement applicatif.

**Prochaines actions :** Poursuivre SEC-01 et les parcours mobile/ordinateur de UX-09 dans des tâches distinctes. Conserver la branche expérimentale exclue tant qu'aucune nouvelle décision explicite ne remplace les ADR concernées.

### 2026-10-17 — Roadmap des trois demandes Notion, mission documentaire

**Objectif :** Aligner le suivi canonique sur les demandes de création personnelle, import par lien/partage mobile et import Haleon, sans implémentation ni import de données.

**Travaux réalisés :** Lecture d'AGENTS, README, PRD, TRD, ROADMAP, BACKEND_SCHEMA et DECISIONS ; audit du formulaire personnel, de la liste/modération, du mapping Supabase, des trois routes d'import, des migrations communautaires/modération/grants et des scripts de vérification associés. Les trois pages Notion ont été lues sans modification ; recherche des suivis équivalents et vérification de la disponibilité des identifiants. Enrichissement COM-01/07/08 et clarification IMP-03, création IMP-08 (P1/TODO) et IMP-09 (P2/TODO), dépendances, sous-tâches et critères testables. Les preuves historiques et statuts sont conservés ; les contrôles non vérifiés restent TODO. Ordre recommandé : contrôles de création manuelle, URL/partage, puis Haleon après identification de la source.

**Fichiers modifiés :** `docs/ROADMAP.md` uniquement ; aucune seconde roadmap, aucun changement applicatif, SQL, dépendance ou configuration Vercel/Supabase. Métadonnées datées du jour et diagrammes existants conservés.

**Tests et lectures exécutés :**

| Contrôle | Environnement | Résultat / limite |
| --- | --- | --- |
| `node scripts/verify-documentation.mjs` | Local, documentation | PASS : sept documents, métadonnées, blocs Markdown, 152 liens locaux et exemple de configuration |
| `git diff --check` et relecture du diff | Local | PASS ; seul ROADMAP modifié |
| Vérification ponctuelle Node des tableaux, statuts, liens Notion et diagrammes | Local, lecture du fichier et de sa version main | PASS : 79 IDs uniques, tous les anciens statuts conservés ; seuls IMP-08/P1/TODO et IMP-09/P2/TODO ajoutés ; trois liens Notion présents et diagrammes inchangés |
| État Git, historique et `git ls-remote --heads origin main` | Local/GitHub, lecture seule | Arbre initial propre ; main et origin/main à `01c6520`, SHA distant identique ; branche `docs/notion-recipe-roadmap-20261017` créée depuis main. Lecture distante et création de branche d'abord refusées par la sandbox puis relancées avec autorisation |
| API Vercel de l'alias public et lecture des trois fiches Notion | Services distants, lecture seule | Production READY sur main/`01c6520`, déploiement `dpl_6R3XFWhkziiXtd9hPCgLFGD9omZA`. Fiches lues et liées aux IDs ; aucun parcours utilisateur de production exécuté |

**Décisions :** COM-01 reste DONE pour son socle prouvé ; ses nouveaux contrôles restent TODO, distincts des améliorations voix/capture. IMP-03 ne devient pas un import utilisateur. IMP-09 reste TODO malgré le prérequis non résolu, conformément à la demande ; aucune source ni API Haleon supposée. Étude PWA et contrats de provenance proposés, aucune décision d'architecture adoptée ni ADR nécessaire à cette mise à jour. Commit conventionnel documentaire local sur la branche dédiée ; aucun push, déploiement, migration, import ou écriture distante.

**Blocages et limites :** Source Haleon exacte et droits textes/images à confirmer avant tout essai d'import ; compatibilité du partage natif iOS/Android à étudier sur appareils réels, collage obligatoire. Provenance externe non enregistrée par la RPC communautaire actuelle, contrat à concevoir. Les tests métier ne sont pas rejoués pour cette modification documentaire : les PASS locaux de soumission/Storage/RLS et la lecture Cloud des huit migrations restent les preuves historiques du journal ; la production n'est pas déclarée validée de bout en bout. Lint, typage et build non relancés car aucun code modifié.

**Prochaines actions :** Relire le commit documentaire avant toute livraison autorisée ; traiter les contrôles TODO de COM-01 et COM-06/SEC-03, puis l'étude/implémentation IMP-08. Demander la source Haleon exacte et les droits pour préciser IMP-09 ; voix COM-07 et capture COM-08 restent suivies séparément.

### Modèle pour les futures sessions

Utiliser un titre `YYYY-MM-DD — Sujet`, puis : **Objectif**, **Travaux réalisés**, **Fichiers modifiés**, **Tests exécutés** (commande, environnement, résultat/erreur), **Décisions**, **Blocages**, **Prochaines actions**. Mettre à jour les tâches et documents affectés ; ne jamais cocher une tâche sans preuve.
