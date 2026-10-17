# Broco-Chou — Plan d'implémentation et journal

**Objectif :** Tenir un suivi unique des livraisons, dettes, imports, décisions et vérifications.
**Dernière mise à jour :** 2026-10-17
**Statut :** Roadmap consolidée ; les DONE correspondent à une preuve de code ou un test identifié, pas à une garantie de déploiement Cloud.
**Documents liés :** [PRD](PRD.md), [TRD](TRD.md), [Parcours](APP_FLOW.md), [Design](DESIGN_BRIEF.md), [Backend](BACKEND_SCHEMA.md), [Décisions](DECISIONS.md).

## Règles de suivi et synthèse d'audit

Priorités : P0 = sécurité/fiabilité ou prérequis à une ouverture publique ; P1 = amélioration utile ; P2 = évolution exploratoire. Statuts : `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`, `CANCELLED`. `BLOCKED` identifie un prérequis concret. Chaque ligne indique dépendances et critères d'acceptation ; un DONE prouve le périmètre écrit seulement. Les cibles non livrées sont À FAIRE ou HORS PÉRIMÈTRE de la mission actuelle.

Base auditée : `main = origin/main = e89d109`, après fetch, état initial propre sur `feat/auth-email-readiness` ; branche de travail `chore/main-documentation-cleanup` créée depuis main, aucun merge expérimental. Auth et données de production préservées. Lecture Cloud : SMTP intégré, confirmations obligatoires, région `eu-west-1`, migration `20261016180000` absente. Lecture Vercel : variable Resend candidate au retrait, pas supprimée. Les preuves locales n'autorisent pas à qualifier tout le workflow enrichi de TESTÉ en production.

## 1. Produit et expérience utilisateur

| ID | Description | Priorité | Statut | Dépendances | Critères d'acceptation / preuve |
| --- | --- | --- | --- | --- | --- |
| UX-01 | Présentation rapide et chemin vers découverte/planning | P1 | DONE | Aucune | Onboarding en trois étapes, bouton de complétion et états vides ; `onboarding.tsx`, `broco-chou-app.tsx` |
| UX-02 | Expliquer l'effet des préférences et fournir une configuration complète | P1 | TODO | ALG-03 | Écran régime/équipement/budget réellement accessible, options reliées aux résultats ; bouton actuel retourne à l'accueil |
| UX-03 | Mieux comparer les sélections et chercher avant le swipe | P2 | TODO | CAT-01 | Recherche/filtres dans la découverte et aperçu comparatif distinct de l'éditeur |
| UX-04 | Afficher plage de dates et aujourd'hui sans couleur seule | P1 | DONE | ALG-01 | Accueil et calendrier utilisent dates réelles et texte/aria ; `home-dashboard.tsx`, `weekly-calendar.tsx` |
| UX-05 | Uniformiser prévention des actions destructives | P1 | TODO | ALG-02 | Retrait avec confirmation/annulation déjà livré ; étendre au recommencement swipe et remplacement lors d'un déplacement. Ancienne case globale cochée, requalifiée partielle |
| UX-06 | Mesurer activation, sélection et retours utilisateurs | P2 | TODO | SEC-04 | Définitions du PRD validées, collecte minimisée et événements testés ; aucun KPI métier mesuré actuellement |

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
| COM-01 | Soumission privée, photo, ingrédients canoniques et planning auteur | P0 | DONE | Migrations initiales | Test local personnel réussi, bucket/RPC initiales observés dans Cloud ; `personal-recipe-form.tsx`, `personal-recipes.tsx` |
| COM-02 | Édition pending admin, refus commenté et concurrence | P0 | DONE | Migration 20261016180000 locale | Tests RPC et navigateur mobile réussis localement ; auteur/statut préservés, commentaire requis, une seule décision. Déploiement Cloud séparé DB-01 |
| COM-03 | Notifications Mailpit facultatives sans appel voué à échouer en production | P1 | DONE | COM-01 | Garde développement loopback ajoutée au formulaire ; test API/Mailpit et déduplication réussis. Outbox/RPC historiques conservées |
| COM-04 | Modification par l'auteur après soumission et espace de modération enrichi | P2 | TODO | Décision de cycle de révision | Aucune édition auteur aujourd'hui ; définir droits, retour pending et traçabilité avant implémentation |
| COM-05 | Notifications applicatives ou e-mails de décision en production | P2 | TODO | AUTH-03, décision produit | Aucun transport/cron actuel ; à concevoir seulement si besoin confirmé, sans dépendance ajoutée ici |
| COM-06 | Rétablir les deux comptes administrateurs attendus en production | P0 | DONE | DB-01, autorisation distante reçue | Deux comptes reconnus par `is_recipe_admin()` après livraison ; lecture sous rôle SQL `authenticated` de la soumission existante et des auteurs réussie pour chacun, visiteurs exclus. Confirmation visuelle dans les sessions personnelles à effectuer par le propriétaire |

## 7. Base de données / Supabase

| ID | Description | Priorité | Statut | Dépendances | Critères d'acceptation / preuve |
| --- | --- | --- | --- | --- | --- |
| DB-01 | Traiter l'écart Cloud/versionné du workflow enrichi | P0 | DONE | Revue SQL, sauvegarde et autorisation distante reçue | `db push --linked --skip-vault --yes` : `20261016180000` puis `20261017120000` appliquées ; huit versions présentes et simulation finale à jour. Empreintes recettes/ingrédients/anciens admins/identités Auth/photos identiques avant-après ; détails et limites au journal |
| DB-02 | Sauvegarde et restauration base + photos | P0 | TODO | Accès exploitation | Export ciblé public + historique réalisé avant DB-01 dans dossier local protégé ; compléter sauvegarde complète/objets Storage, rétention et restauration testée sur cible isolée. Aucun reset distant |
| DB-03 | Diagnostiquer catégorie locale de `tomate` | P1 | TODO | Aucune | Contrôle sync 2026-10-17 : locale « Épicerie, condiments et produits sucrés », Cloud « Fruits, légumes et légumineuses ». Ligne locale datée 2026-10-08, antérieure aux tests ; ne pas corriger Cloud |
| DB-04 | Synchronisation multi-appareil des plans/favoris/préférences | P2 | TODO | Décision produit et conflits | HORS PÉRIMÈTRE actuel ; définir modèle, RLS et migration des données navigateur |

## 8. Intégrations et imports

| ID | Description | Priorité | Statut | Dépendances | Critères d'acceptation / preuve |
| --- | --- | --- | --- | --- | --- |
| IMP-01 | Dix lots City Café, 158 intitulés consolidés en 157 recettes | P1 | DONE | Artefacts JSON/SQL | Manifeste conservé, 157/157 IDs et champs métier identiques vérifiés en lecture seule cette session ; catégorie globale tomate séparée DB-03 |
| IMP-02 | Compléter et contrôler les 157 images City Café | P1 | DONE | IMP-01 | Correction historique du 2026-09-27, 157 attributions/IDs photo uniques et URLs non NULL dans les deux bases ; HTTP 200 historique, pas entièrement rejoué ici |
| IMP-03 | Préserver import Instagram manuel et ses sources | P1 | DONE | API import | Parser local, sélection de fichiers locaux et sauvegarde développement ; aucune extraction réseau Instagram ni Pexels à l'exécution de l'API images |
| IMP-04 | Import périodique des menus Odélis / pipeline sources Crous | P2 | TODO | Droits sources, périmètre produit | HORS PÉRIMÈTRE ; aucun cron ni pipeline exécuté dans `main`. Définir fréquence, déduplication, sources et validation humaine |
| IMP-05 | Génération automatisée de recettes | P2 | TODO | CAT-02, validation éditoriale | Aucune intégration LLM actuelle ; distinguer reconstruction manuelle et génération automatisée |
| IMP-06 | Installer Resend pour les invitations de production | P2 | CANCELLED | ADR-007 | Ancien échec `integration_terms_acceptance_required` conservé comme historique ; ne pas reprendre le provisionnement |

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

## 12. Documentation et dette technique

| ID | Description | Priorité | Statut | Dépendances | Critères d'acceptation / preuve |
| --- | --- | --- | --- | --- | --- |
| DOC-01 | Consolider les quatre guides et le README | P1 | DONE | Audit complet | Sept documents, README/AGENTS/.env.example, inventaire de reprise, 121 liens locaux et dix diagrammes validés ; anciens guides supprimés après contrôle |
| DOC-02 | Journal et décisions maintenus après chaque tâche | P1 | DONE | AGENTS | Contrat racine et ADR formalisés, modèle ci-dessous ; statut futur à tenir à jour |
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

Priorités immédiates : SEC-01 (avis npm), DB-01 (workflow non déployé), AUTH-03 (capacité d'inscription publique), SEC-02/03 (import et grants), GRO-01/02 (calculs et péremption courses). Les autres dettes sont traçables dans les thèmes ci-dessus : accessibilité, styles/hooks inutilisés, statistiques non littérales, Playwright externe, portabilité des générateurs, photos orphelines et absence de restauration testée. Ne pas généraliser un test local réussi aux accès, e-mails ou données de production.

Évolutions futures explicitement non réalisées par cette mission : Odélis périodique, génération automatisée, déduplication avancée, notifications publiques, SEO, cache/chargement progressif, synchronisation multi-appareil et refonte visuelle. Les propositions de l'ancien README (restes, coût par recette, stock disponible, batch cooking, favoris avancés, remplacement selon temps) restent dans le backlog.

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

### Modèle pour les futures sessions

Utiliser un titre `YYYY-MM-DD — Sujet`, puis : **Objectif**, **Travaux réalisés**, **Fichiers modifiés**, **Tests exécutés** (commande, environnement, résultat/erreur), **Décisions**, **Blocages**, **Prochaines actions**. Mettre à jour les tâches et documents affectés ; ne jamais cocher une tâche sans preuve.
