# Validation des recettes communautaires

La migration `20261016180000_recipe_review_workflow.sql` ajoute les administrateurs
`dan.verton@pm.me` et `per.pleuvry@gmail.com`. Ils doivent créer leur compte et
confirmer leur adresse e-mail. Les droits sont vérifiés dans PostgreSQL à chaque
opération, sans dépendre des métadonnées modifiables par l’utilisateur.

`supabase/seed-local-admin.sql` ajoute uniquement dans la base locale
`admin@brocochou.com`. Ce fichier fait partie du seed local et ne doit jamais être
exécuté sur la base hébergée. Il ne crée aucun compte ni mot de passe.

## Parcours

1. Un utilisateur connecté soumet une recette : elle reste privée, utilisable par
   son auteur dans son planning, et apparaît dans la liste de validation.
2. L’administrateur voit les recettes en attente sur l’accueil et dans son profil.
   La liste est actualisée toutes les 30 secondes et au retour dans la fenêtre.
3. Il peut examiner la recette, modifier ses champs et remplacer sa photo.
   L’enregistrement conserve l’auteur et le statut « en attente ».
4. La validation publie la recette. Le refus exige un commentaire visible dans
   l’espace de l’auteur. Une recette traitée ne peut plus être modifiée ni traitée
   une seconde fois par ces fonctions.

## Invitations et état de l’intégration

Chaque nouvelle soumission crée une entrée dans `recipe_review_notifications`,
dans la même transaction que la recette. Le navigateur demande ensuite l’envoi
via `POST /api/recipe-notifications`, avec son jeton de session. Seul l’auteur
peut déclencher l’envoi pour sa recette. Les appels répétés et concurrents sont
dédupliqués par une réservation de cinq minutes et un horodatage d’envoi.

En développement avec Supabase local, les invitations sont envoyées à
`admin@example.test` dans le vrai Mailpit local : http://127.0.0.1:54324.
Le lien `http://localhost:3000/?review=…` ouvre l’espace de validation et permet
de se connecter sans passer par l’accueil de présentation.

**Production non activée** : le transport Mailjet API est implémenté et testé avec mocks.
Le drapeau `RECIPE_NOTIFICATION_EMAIL_ENABLED` reste faux par défaut.
L'ancienne configuration Resend n'est pas utilisée. Voir [e-mails](email-delivery.md)
pour les secrets, la déduplication fournisseur, les limites et l'activation après accord.
Aucune migration ni activation de production n'a été effectuée.

`GET /api/recipe-notifications` traite jusqu’à 20 invitations non envoyées. Il
exige `Authorization: Bearer <CRON_SECRET>`. Cette route permet les reprises,
mais aucun ordonnanceur n’est encore configuré. En local, définir `CRON_SECRET`
côté serveur puis appeler cette route pour reprendre les envois échoués.

## Vérification locale

Avec Supabase local et Mailpit démarrés :

```powershell
node scripts/verify-personal-recipes.mjs
$env:TEST_APP_URL='http://localhost:3000'
node scripts/verify-personal-recipes.mjs
```

Le second passage vérifie aussi l’API, la livraison Mailpit, le lien et l’absence
de doublon. Les tests ne ciblent jamais la base distante et suppriment leurs
comptes, recettes et photos temporaires.

Le test `scripts/verify-recipe-review-browser.mjs` utilise Playwright installé
localement (ou indiqué par `PLAYWRIGHT_MODULE`) et vérifie le parcours mobile de
modification et de refus commenté dans le navigateur.
