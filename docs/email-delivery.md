# E-mails transactionnels

État : **READY_FOR_CONFIGURATION**. Aucun envoi réel, déploiement, activation distante ni achat effectué. Mailpit reste le transport local. Mailjet Auth et les notifications applicatives sont deux configurations indépendantes.

## A. Supabase Auth → SMTP Mailjet

1. Dans [Mailjet](https://app.mailjet.com/account/setup), finaliser le profil et la validation du compte. Fournir la page publique `/privacy` seulement après ses compléments et son déploiement approuvé. Vérifier que le compte est autorisé à envoyer.
2. Dans les paramètres expéditeurs, ajouter une adresse réellement accessible puis suivre le lien de validation reçu. Ne pas inventer `noreply` ni acheter de domaine. Un domaine gratuit peut limiter la délivrabilité ; seule une réception réelle autorisée permettra de conclure.
3. Dans les paramètres SMTP/API Mailjet, récupérer les identifiants dans un gestionnaire de secrets. Ne pas les copier dans une commande, un ticket ou Git.
4. Dans le projet [Supabase](https://supabase.com/dashboard/project/cbwrvcifxcqyrgtcpvbd/auth/providers), vérifier Email activé, inscriptions autorisées, confirmation obligatoire et changement d'adresse sécurisé. Dans **Authentication → Email → SMTP Settings** (ou Custom SMTP selon l'interface), saisir :

| Paramètre | Valeur |
|---|---|
| Host | `in-v3.mailjet.com` |
| Port | `587` avec STARTTLS |
| Username | API Key Mailjet |
| Password | Secret Key Mailjet |
| Sender name | `Broco-Chou` |
| Sender email | Adresse préalablement validée |

5. Sauvegarder seulement avec les identifiants réels et le compte validé. Relire l'état Custom SMTP activé et le host. Examiner les limites Auth et Mailjet ; rester dans les quotas gratuits, garder un délai entre demandes, ne pas augmenter sans justification.
6. Vérifier Site URL et les retours exacts du [guide Auth](authentication.md). Examiner les modèles : `{{ .ConfirmationURL }}` contient le lien de vérification généré ; `{{ .SiteURL }}` désigne l'URL principale ; `{{ .RedirectTo }}` le retour demandé/autorisé. Ne pas remplacer un lien de vérification par une simple URL de retour, ni modifier un template correct.
7. Après accord explicite d'envoi, créer un compte de test à adresse externe consentante, constater Mailjet dans les événements d'envoi, réception/spams, confirmation, connexion, récupération et changement d'adresse sécurisé. Ne marquer opérationnel qu'après ces vérifications et la confirmation que le SMTP intégré n'est plus utilisé. Les liens déjà envoyés ne changent pas.

Diagnostic : `email_address_not_authorized` indique généralement le mailer intégré ou une configuration non effective ; quotas → vérifier les deux fournisseurs ; erreurs SMTP → compte/expéditeur/identifiants/port ; mauvais retour → configuration Cloud et allow-list puis modèle ; liens expirés ou consommés par un scanner → demander un nouveau lien et examiner la protection du destinataire. Ne pas désactiver la confirmation. Consulter les logs Auth et Mailjet sans exporter de jetons, d'URL de vérification ni de secrets.

## B. Notifications de modération → API Mailjet

Le trigger existant crée une entrée par recette dans `recipe_review_notifications` dans la transaction d'insertion. La clé primaire déduplique la mise en attente. Le RPC `claim_recipe_notifications` réserve jusqu'à 20 tâches avec `FOR UPDATE SKIP LOCKED`, puis autorise une reprise après cinq minutes. L'acquittement vérifie aussi `claimed_at` pour éviter qu'un ancien worker écrase la réservation suivante. Aucun changement SQL ni migration distante n'a été appliqué.

`POST /api/recipe-notifications` valide le jeton auprès de Supabase puis la propriété de la recette. Le destinataire et le corps ne proviennent jamais de la requête. `GET` exige `CRON_SECRET` et n'a pas d'ordonnanceur installé automatiquement. Les erreurs restent génériques ; un échec ne resoumet pas la recette. Le débit est limité par la réservation par recette et les quotas fournisseur ; il n'existe pas de limite globale de soumissions par auteur, à surveiller avant ouverture à grande échelle.

Local : URL Supabase loopback et NODE_ENV non-production → Mailpit `127.0.0.1:54324`, adresses réservées `notifications@example.test` et `admin@example.test`. Jamais de Mailjet local dans ce chemin.

Cloud : activation explicite `RECIPE_NOTIFICATION_EMAIL_ENABLED=true`, configuration complète requise, previews Vercel refusées. L'appel HTTP v3.1 utilise Basic Auth côté serveur, timeout de dix secondes et vérifie aussi `Messages[].Status` même si HTTP réussit. Le nom de campagne est stable par projet/recette et `DeduplicateCampaign=true` protège le destinataire contre une nouvelle livraison après perte de l'acquittement. L'identifiant seul ne serait pas une garantie d'idempotence. Une réponse acceptée signifie acceptation fournisseur, pas réception : contrôler Mailjet. Une déduplication peut apparaître comme message bloqué dans ses événements. Ne pas changer arbitrairement de destinataire lors d'une reprise.

## Variables Vercel et activation

Dans [les variables du projet](https://vercel.com/vertondan-9283s-projects/recipe-app/settings/environment-variables), cibler **Production** et vérifier projet/équipe :

- Publiques : `NEXT_PUBLIC_SITE_URL=https://recipe-app-alpha-wine.vercel.app`, `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_TURNSTILE_REQUIRED`.
- Serveur : `SUPABASE_SERVICE_ROLE_KEY`, `MAILJET_API_KEY`, `MAILJET_SECRET_KEY`, `MAILJET_FROM_EMAIL`, `RECIPE_REVIEW_NOTIFICATION_TO`, `CRON_SECRET`.
- Drapeau serveur : `RECIPE_NOTIFICATION_EMAIL_ENABLED=false` tant que l'activation n'est pas approuvée.

Saisir les secrets directement dans le dashboard, sans préfixe NEXT_PUBLIC. La clé service role doit appartenir au projet de l'URL Supabase. L'adresse administrative doit être réelle et vérifiée avec son propriétaire ; aucun destinataire réel n'est codé en dur. Ne pas réutiliser la configuration Cloud pour les tests locaux. Les variables publiques nécessitent une reconstruction.

Après validation des adresses et accord explicite : déployer la version revue, vérifier qu'aucune notification n'est partie avec le drapeau faux, examiner le nombre de tâches en attente (l'activation peut traiter l'arriéré), activer et autoriser un test ciblé sur une recette. Inspecter les événements Mailjet et `sent_at`. Reprises : POST authentifié par le propriétaire ou GET avec secret cron, après cinq minutes. Un cron éventuel doit rester compatible avec l'offre gratuite et être ajouté séparément. Les tentatives actuelles ne sont pas plafonnées : désactiver le drapeau lors d'un incident durable et examiner `attempts/last_error` avant reprise. Aucun endpoint d'envoi libre n'est exposé.

## Confidentialité et blocages

`/privacy` est publique mais pas juridiquement finalisée : identité du responsable, contact, bases légales définitives, durées par catégorie et sauvegarde, localisation/garanties contractuelles restent **À compléter avant publication**. Vercel Analytics est effectivement activé en production hors retours Auth ; le planning local n'est pas supprimé par la déconnexion.

L'audit npm du 16 octobre 2026 signale **12 vulnérabilités (1 modérée, 10 élevées, 1 critique)** dans l'arbre existant après ajout des composants de test/CAPTCHA. Ne pas considérer l'application prête à ouvrir publiquement avant remédiation et nouveau contrôle. Aucun `audit fix --force` ni changement majeur non vérifié n'a été appliqué.

Sources : [Mailjet SMTP](https://dev.mailjet.com/docs/smtp-relay/configuration), [SMTP Supabase](https://supabase.com/docs/guides/auth/auth-smtp), [Send API v3.1](https://dev.mailjet.com/docs/email-api/send-api-v31/send-basic-email), [déduplication Mailjet](https://dev.mailjet.com/docs/email-api/send-api-v31/group-campaign), [information sur les droits](https://www.cnil.fr/fr/respecter-les-droits-des-personnes).
