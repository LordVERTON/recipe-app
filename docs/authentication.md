# Authentification Broco-Chou

État au 16 octobre 2026 : **READY_FOR_CONFIGURATION**, pas encore validé en production.

## Audit initial

Dépôt propre sur `main`, branche de travail `feat/auth-email-readiness`. Versions installées : Next 16.2.6, React 19, Supabase JS/Auth 2.117.3, CLI Supabase 2.120.0, Vercel CLI 59.20.0. Aucun changement préexistant à préserver. Les utilisateurs, migrations et politiques RLS ne sont pas modifiés.

Déjà présents : client navigateur partagé, sessions persistées et rafraîchies par Supabase, séparation du planning par compte, inscription avec confirmation, renvoi temporisé, connexion, déconnexion, rôles et modération. Manquaient : récupération, retours dédiés, Google, CAPTCHA, confidentialité. Les retours utilisaient directement `window.location.origin`. Le build ignorait TypeScript : cette option est désormais désactivée.

GitHub et Vercel sont authentifiés (vérifiés hors réseau sandbox). Projet Vercel vérifié : `vertondan-9283s-projects/recipe-app`, ID `prj_bBvX0VCnS3DWAXxvASNKwRa4Ieuw`, runtime configuré Node 24. Variables de production observées, noms seulement : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_RECIPES_TABLE`, `RESEND_API_KEY`. Cette dernière n'est pas utilisée par le nouveau transport et n'a pas été supprimée. Lecture des réglages publics Auth Cloud vérifiée : e-mail activé, inscriptions autorisées, confirmation obligatoire, Google désactivé. SMTP, templates, changement d'adresse sécurisé, CAPTCHA et allow-list Cloud non vérifiés pendant cette intervention. Les anciennes vérifications datées du guide local ne prouvent pas l'état actuel.

## Architecture et retours

Le client `lib/supabase-client.ts` conserve le flow implicite officiel, sans serveur d'échange PKCE ni nouvelle identité. Supabase consomme le fragment URL et stocke la session. Aucun jeton ne doit être journalisé. Les pages `/auth/complete` et `/auth/reset-password` suppriment les paramètres après traitement ; pas d'Analytics sur `/auth/*`, métadonnée `no-referrer`.

`authReturnUrl` accepte uniquement l'origine HTTPS exacte de `NEXT_PUBLIC_SITE_URL` (production par défaut). Localhost/127.0.0.1 sont acceptés en développement. Une preview doit avoir sa propre valeur HTTPS exacte et être autorisée dans Supabase ; aucune confiance dans un suffixe `vercel.app` ou un paramètre `next`. Une preview non configurée refuse l'opération. Le retour local depuis un mobile sur IP LAN n'est volontairement pas autorisé actuellement : utiliser localhost pour les tests Auth.

Dans [Supabase URL Configuration](https://supabase.com/dashboard/project/cbwrvcifxcqyrgtcpvbd/auth/url-configuration), vérifier le projet puis définir Site URL à `https://recipe-app-alpha-wine.vercel.app`. Autoriser les URLs exactes suivantes (préférées aux jokers) :

```text
https://recipe-app-alpha-wine.vercel.app
https://recipe-app-alpha-wine.vercel.app/auth/complete
https://recipe-app-alpha-wine.vercel.app/auth/reset-password
http://localhost:3000
http://localhost:3000/auth/complete
http://localhost:3000/auth/reset-password
http://127.0.0.1:3000/auth/complete
http://127.0.0.1:3000/auth/reset-password
```

Ne pas appliquer globalement le profil local à Cloud. `supabase/config.toml` prépare séparément les deux environnements ; modifier le fichier ne modifie ni le service local en cours ni Cloud. Ne pas exécuter un `config push` sans revoir son diff complet : il pourrait affecter d'autres réglages.

## Inscription et récupération

La confirmation reste obligatoire dans Supabase. L'inscription ne déclenche aucun deuxième envoi automatique. Les messages de renvoi et récupération n'affirment pas qu'un compte existe. Une minute entre demandes dans le formulaire complète les limites serveur ; elle ne remplace pas le rate limiting Supabase. Les erreurs sont traduites via une liste de codes, jamais affichées brutes.

La récupération appelle `resetPasswordForEmail`, puis `updateUser` sur la page dédiée. Le formulaire exige l'événement SDK `PASSWORD_RECOVERY` pour le jeton courant, une identité validée et un JWT vérifié portant une méthode `otp` récente (< 1 heure). **Supabase local produit `otp`, pas `recovery`, dans AMR** : vérifié par le test local. Une session ordinaire ou un simple accès à la route ne suffit pas. Le marqueur reste en mémoire ; après rechargement, expiration ou rafraîchissement du jeton, demander un nouveau lien. Supabase reste l'autorité côté serveur : ce contrôle UI ne redéfinit pas les permissions natives `updateUser` d'un utilisateur authentifié.

Le lien de retour ouvre l'espace de compte ; l'intention « Ajouter ma recette » est conservée en sessionStorage durant une navigation OAuth. Aucun paramètre de redirection libre n'est accepté.

## Google OAuth — activation en attente

1. Dans [Google Auth Platform](https://console.cloud.google.com/auth/clients), choisir/créer le projet, renseigner Branding (nom Broco-Chou, contact support et développeur réels), Audience et Data Access. Utiliser les scopes d'identité minimaux (openid, e-mail, profil). En mode test, ajouter explicitement les comptes de test.
2. Créer un client OAuth de type **Application Web**. Origine JavaScript de production : `https://recipe-app-alpha-wine.vercel.app`. Ajouter `http://localhost:3000` seulement pour le développement concerné. Ne jamais revendiquer la propriété du domaine partagé `vercel.app` ; si Google exige une vérification de domaine indisponible avec les URLs partagées, noter ce blocage avant publication.
3. URI de redirection autorisé : `https://cbwrvcifxcqyrgtcpvbd.supabase.co/auth/v1/callback`. C'est le callback Google → Supabase, distinct du retour Supabase → application `/auth/complete`. Pour Supabase local, un client/configuration séparés sont nécessaires avec `http://127.0.0.1:54321/auth/v1/callback`.
4. Dans [Supabase Providers](https://supabase.com/dashboard/project/cbwrvcifxcqyrgtcpvbd/auth/providers), activer Google et saisir Client ID et Client Secret directement. Aucun secret Google dans Next.js.
5. Une fois le fournisseur configuré, définir `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true` dans l'environnement Vercel voulu puis reconstruire après approbation. Compléter `/privacy` avant de la fournir à Google. Publier l'audience selon les exigences affichées par Google, sans prétendre que le mode test permet une ouverture publique.
6. Vérifier un nouveau compte Google puis un compte e-mail existant avec adresse vérifiée. Comparer son UUID, ses recettes et son rôle avant/après, tester connexion/déconnexion. Supabase assure la liaison officielle des identités ; ne jamais fusionner en SQL. Le comportement exact de ces comptes **n'a pas été testé contre Google** ; vérifier également une adresse non confirmée et les refus de consentement.

## Turnstile — activation coordonnée

Créer un widget Managed dans [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile), autoriser `recipe-app-alpha-wine.vercel.app`. Utiliser un widget distinct pour localhost ; les clés de test ne doivent jamais protéger la production. Le composant `@marsidev/react-turnstile` remet le token à zéro après soumission, expiration, erreur et nouvelle tentative. Le bouton d'actualisation permet de relancer un widget en échec réseau.

Les signatures de Supabase Auth 2.117.3 confirment `options.captchaToken` pour signUp, signInWithPassword, resend et resetPasswordForEmail. Google n'attend pas de challenge frontend. La vérification du token est réalisée par Supabase, pas par une API maison.

Ordre : préparer `NEXT_PUBLIC_TURNSTILE_SITE_KEY` et `NEXT_PUBLIC_TURNSTILE_REQUIRED=true` → tester une version déployable → approuver le déploiement → vérifier le widget → saisir la Secret Key exclusivement dans la protection CAPTCHA Supabase → activer → vérifier les quatre opérations avec tokens valides, absents, expirés et invalides. Aucun changement distant réalisé ici. Avec REQUIRED=true et sans clé, l'UI bloque et explique l'indisponibilité. Si Supabase exige un CAPTCHA mais que les deux variables sont omises, Supabase refuse toujours l'opération et l'UI traduit l'erreur ; les deux configurations doivent être coordonnées.

## Matrice de validation

| Scénarios | Vérification |
|---|---|
| Inscription, confirmation requise, connexion refusée avant confirmation, lien réel et Mailpit | `node scripts/verify-local-mailpit.mjs` |
| Connexion, rafraîchissement, déconnexion, rôle non-admin et photo privée via proxy | `node scripts/verify-local-auth.mjs` (Next local démarré) |
| Récupération, événement SDK, JWT otp, nouveau mot de passe, refus ancien et lien réutilisé | `node scripts/verify-local-recovery.mjs` |
| Retours HTTPS, localhost, origine hostile, preview explicite, transport et drapeaux | `node scripts/verify-auth-email.mjs` (mocks, aucun réseau) |
| Propriété, RLS, modération, API, file et doublons locaux | `TEST_APP_URL=http://localhost:3000` puis `node scripts/verify-personal-recipes.mjs` |
| Lien expiré/invalide, session absente, récupération UI, confidentialité | Test navigateur et checklist ci-dessous |
| Google nouveau/existant, Turnstile valide/expiré/absent, quotas SMTP, e-mail externe, rôle admin existant Cloud | NON EXÉCUTÉ : configuration et/ou accord d'envoi/déploiement nécessaires |

Recette manuelle avant ouverture : tester mobile/clavier, doubles clics, conservation des champs, mauvais mot de passe, réseau interrompu, renvoi avant/après minute, lien expiré et déjà utilisé dans une session neuve puis existante ; vérifier les retours de confirmation et récupération dans chaque environnement. Comparer les UUID et droits des comptes existants sans supprimer ni recréer ces comptes.

### Résultats exécutés le 16 octobre 2026

- `npm run lint` : succès, zéro erreur, quatre avertissements préexistants `no-img-element`.
- `npx tsc --noEmit` (binaire local) : succès. `npm run build` : succès avec validation TypeScript désormais activée, les trois nouvelles pages sont générées.
- `verify-auth-email.mjs` : succès (origines hostiles, local, preview, drapeaux, succès/erreurs Mailjet, déduplication stable et Mailpit simulé ; zéro appel externe).
- `verify-local-mailpit.mjs` : succès, véritable message local et lien de confirmation.
- `verify-local-recovery.mjs` : succès, événement SDK, méthode `otp`, mot de passe changé, ancien refusé, nouveau accepté, token réutilisé refusé.
- `verify-local-auth.mjs` : succès après démarrage de Next (premier essai : serveur absent/ECONNREFUSED).
- `verify-personal-recipes.mjs` avec `TEST_APP_URL` local : succès, API authentifiée, Mailpit et déduplication, propriété et photos privées, RLS, droits admin, édition, refus commenté, approbation et décisions concurrentes.
- `verify-auth-browser.mjs` : succès sur Chromium, viewport 390×844 ; confidentialité, session absente, erreur de retour, nettoyage du fragment, récupération valide, confirmation de mot de passe, changement réel et entrée « Mot de passe oublié ».
- Une première hypothèse de test `amr=recovery` a échoué ; le SDK/serveur fournit `otp`. Le code a été corrigé et les tests ont été relancés avec succès.
- `npm audit` : échec du critère sécurité, 12 vulnérabilités dont 1 critique ; voir le guide e-mails. Pas de validation production globale.

Le test navigateur injecte une session issue d'un vrai token de récupération local dans le fragment de retour ; il ne valide pas l'allow-list du service local en cours. Les nouvelles routes du fichier TOML nécessitent une reprise de configuration locale sans reset, puis un test du lien de récupération réellement reçu. Aucun test Google/Turnstile réel ni e-mail Cloud effectué.

Sources : [Supabase Google](https://supabase.com/docs/guides/auth/social-login/auth-google), [CAPTCHA](https://supabase.com/docs/guides/auth/auth-captcha), [liaison des identités](https://supabase.com/docs/guides/auth/auth-identity-linking), [Turnstile React](https://github.com/marsidev/react-turnstile).
