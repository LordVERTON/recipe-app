# Broco-Chou — Contrat des agents IA

**Objectif :** Préserver la production et maintenir une référence documentaire fiable après chaque tâche.
**Dernière mise à jour :** 2026-10-17
**Statut :** Règles opérationnelles applicables à tout le dépôt.
**Documents liés :** [README](README.md), [PRD](docs/PRD.md), [TRD](docs/TRD.md), [Roadmap](docs/IMPLEMENTATION_PLAN.md), [Décisions](docs/DECISIONS.md).

## Démarrage obligatoire

1. Lire README, `docs/PRD.md`, `docs/TRD.md` et `docs/IMPLEMENTATION_PLAN.md`.
2. Lire la référence spécialisée : UI → `docs/DESIGN_BRIEF.md` ; données → `docs/BACKEND_SCHEMA.md` ; parcours → `docs/APP_FLOW.md` ; architecture → `docs/DECISIONS.md`.
3. Examiner `git status`, branche et historique ; préserver tous changements non sauvegardés. Vérifier l'état d'`origin/main` avant une branche issue de production.
4. Identifier ce qui est EXISTANT, TESTÉ, CONFIGURÉ, `[À CONFIRMER]`, À FAIRE ou HORS PÉRIMÈTRE. Le dépôt et les migrations sont les références ; leur présence ne prouve pas leur déploiement.

## Stabilité et sécurité

- Priorité à la stabilité de `main`. Aucune écriture de production, application de migration, modification de configuration distante, push ou déploiement sans autorisation explicite couvrant l'opération. Une lecture seule n'est pas une écriture.
- Ne jamais réinitialiser la base distante ni exécuter les seeds locaux sur Cloud. Vérifier les cibles locales des tests et ne jamais utiliser de données personnelles réelles dans les fixtures.
- Préserver `signUp`, `signInWithPassword`, `resend`, `signOut`, confirmation e-mail, sessions et rafraîchissement Supabase sauf problème concret démontré. Ne jamais désactiver la confirmation pour réparer un test.
- Réutiliser composants, services Supabase et conventions existantes ; éviter doublons et refontes inutiles. Tout changement de stack exige justification et ADR. Toute dépendance ajoutée exige nécessité démontrée.
- Ne pas réintroduire Mailjet, Resend, Google OAuth ou Turnstile sans nouvelle décision explicite. Ne pas fusionner automatiquement la branche expérimentale. Conserver Mailpit pour le local ; `supabase.auth.resend` n'est pas le service Resend.
- Ne jamais afficher, exporter dans une réponse ou versionner les secrets, JWT ou liens de session. Éviter les sorties CLI de statut contenant des clés ; filtrer avant affichage. Les clés de service restent côté serveur et ne doivent jamais être `NEXT_PUBLIC_`.
- Préserver RLS, droits administrateur, auteurs et médias. Ne pas supprimer tables/fonctions/migrations parce qu'elles semblent inutilisées. Ne pas réécrire une migration déjà appliquée ; créer une migration corrective et la tester localement.
- Le planning est local par compte ; ne pas annoncer de synchronisation Cloud inexistante. Le workflow SQL final n'est pas entièrement déployé dans Cloud au dernier audit : vérifier avant toute intervention.

## Git et revue

Travailler sur une branche propre dérivée de `main` pour les changements de production. Aucun reset/rebase destructif, suppression de branche ou cherry-pick sans justification et accord. Ne pas écraser les changements du propriétaire.

Utiliser Conventional Commits :

```text
feat(scope): description
fix(scope): description
docs(scope): description
refactor(scope): description
test(scope): description
chore(scope): description
```

Préférer de petits commits cohérents. Séparer documentation, modification fonctionnelle et refactor quand cela reste utile à la revue. Ne jamais pousser directement sur `main` sans autorisation ; un accord pour éditer localement n'est pas un accord pour livrer en production.

## Vérification et clôture de chaque tâche

1. Exécuter les contrôles adaptés. Pour un changement de code : lint, `npx tsc --noEmit` séparé (le build ignore les erreurs de types), build et tests pertinents selon le TRD.
2. Pour Auth, recettes ou Storage : utiliser Supabase/Mailpit locaux, vérifier les gardes loopback et le nettoyage des fixtures. Playwright n'est pas une dépendance du projet ; utiliser une installation externe si disponible.
3. Pour la documentation : conserver exactement sept fichiers Markdown dans `docs`, vérifier liens, métadonnées, diagrammes et `node scripts/verify-documentation.mjs`. Mettre les détails techniques à leur emplacement canonique.
4. Mettre à jour les documents affectés et la tâche correspondante dans `docs/IMPLEMENTATION_PLAN.md`, avec preuve avant passage à DONE. Ne pas cocher un test non exécuté ou un déploiement seulement prévu.
5. Ajouter au journal une entrée datée : objectif, travaux, fichiers, tests/environnements/résultats, décisions, blocages et prochaines actions. Ajouter une ADR si un choix architectural change ; une proposition reste Proposed.
6. Vérifier `git diff --check`, relire le diff et signaler les échecs sans les masquer. Un contrôle préexistant en échec doit être distingué d'une régression introduite.

## Réponses à l'utilisateur

Répondre en français avec résumé des travaux, modifications, tests et résultats, risques/limites, documentation mise à jour et prochaine tâche recommandée. Distinguer ce qui est implémenté localement, testé localement, configuré à distance et encore à déployer. Ne pas présenter une proposition, une ancienne coche de roadmap ou une compilation réussie comme une validation de production.
