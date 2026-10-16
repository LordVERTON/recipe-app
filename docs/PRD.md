# Broco-Chou — Produit et exigences

**Objectif :** Décrire le produit réel, ses utilisateurs et ses perspectives sans confondre livraison et intention.
**Dernière mise à jour :** 2026-10-17
**Statut :** EXISTANT audité sur `main` à `e89d109`, complété par le nettoyage de cette branche.
**Documents liés :** [Parcours](APP_FLOW.md), [Architecture](TRD.md), [Roadmap](IMPLEMENTATION_PLAN.md), [Décisions](DECISIONS.md).

## Vision et périmètre

Broco-Chou aide à décider quoi cuisiner, organiser sept jours et préparer les courses. Le public initial est étudiant : studio, petit budget, peu de matériel et peu de temps. La découverte par swipe réduit l'effort de sélection ; le planning et les courses rendent ces choix utilisables au quotidien, y compris sur téléphone au supermarché.

Le projet indépendant s'inspire des [calendriers du Crous de Lyon](https://www.crous-lyon.fr/se-restaurer/idees-recettes-a-refaire-chez-soi/). Il n'est pas un service officiel du Crous. Les contraintes de saison, de simplicité et de coût sont des objectifs éditoriaux ; aucun prix réel ni budget calculé n'est fourni. L'usage par d'autres publics est une hypothèse à valider. Le score de variété n'est pas une évaluation nutritionnelle clinique.

### Convention de preuve commune

| Mention | Signification |
| --- | --- |
| EXISTANT | Confirmé dans les sources versionnées ; ne prouve pas un déploiement |
| TESTÉ | Vérifié par un test identifiable ; consulter le journal pour son environnement et son résultat |
| CONFIGURÉ | Présent dans un fichier ou observé par lecture d'un service |
| [À CONFIRMER] | Non vérifié, inconnu ou déclaration historique non rejouée |
| À FAIRE | Développement ou vérification manquant |
| HORS PÉRIMÈTRE | Évolution qui ne doit pas être implémentée par cette mission |

Les confirmations de production sont TESTÉES manuellement selon le retour du propriétaire, pour les adresses essayées seulement. Elles ne prouvent pas une ouverture publique sans restriction.

## Utilisateurs et droits

| Rôle | Besoin et accès réel | Limites |
| --- | --- | --- |
| Visiteur non connecté | Catalogue publié, swipe, favoris, planning, courses, suivi local | Pas de soumission ni de photo privée d'un autre auteur |
| Utilisateur authentifié | Parcours visiteur, création de recette, consultation de ses recettes dans tous leurs statuts et utilisation dans son planning | Aucune modification après soumission par l'auteur ; aucune auto-validation sans rôle administrateur |
| Administrateur | Lecture des soumissions et e-mails auteurs, modification des recettes `community/pending`, publication ou refus motivé | Droits SQL vérifiés avec adresse confirmée ; aucune édition ni seconde décision après traitement par ces RPC |

Les droits administrateur proviennent de `recipe_admins` ou `recipe_admin_emails`, jamais de métadonnées utilisateur. Le détail des permissions appartient au [schéma backend](BACKEND_SCHEMA.md). Aucun autre rôle applicatif n'est livré.

Personas de travail, non issus d'entretiens : étudiant sans four voulant préparer ses courses ; personne cuisinant pour plusieurs convives ; contributeur souhaitant utiliser sa recette avant publication ; administrateur contrôlant la qualité. [À CONFIRMER] fréquence d'utilisation, intérêt du swipe face à une recherche directe et efficacité de l'organisation proposée.

## Exigences fonctionnelles

Chaque ligne associe une user story, une règle et un critère vérifiable. Les cas limites explicitent les limites de la version actuelle.

| Fonction / statut | User story et comportement | Critères d'acceptation et cas limites |
| --- | --- | --- |
| Onboarding — EXISTANT | Comme visiteur, comprendre les trois étapes : choisir, planifier, acheter ; bouton « Commencer » | Enregistre `hasCompletedOnboarding` puis ouvre l'accueil ; aucune collecte de régime/budget à ce stade. `?review` permet d'accéder à la connexion/modération sans onboarding |
| Accueil — EXISTANT | Comme utilisateur, consulter la plage de dates, les repas d'aujourd'hui et le nombre de repas cuisinés | Sans plan : accès au swipe ; avec plan : accès au calendrier. Pas de moteur de suggestion du jour autonome |
| Swipe — EXISTANT | Comme utilisateur, accepter à droite, refuser à gauche, mettre en favori, annuler le dernier choix | Favori implique acceptation ; pas de doublon d'acceptation. Au bout du catalogue, compléter les types manquants ou recommencer. Le recommencement conserve les favoris, efface acceptations/refus/actions |
| Recherche et filtres — EXISTANT dans l'éditeur | Comme utilisateur, rechercher un titre et filtrer saison, durée maximale, végétarien/poisson, équipement | Filtrage cumulatif dans `WeeklyPlanEditor`. Pas de recherche dans le swipe, pas de filtre de prix ; une durée absente ne passe pas une durée maximale |
| Favoris — EXISTANT | Comme utilisateur, retrouver une sélection persistante dans le profil | Aperçu limité aux cinq premiers ; pas de page de gestion complète, pas de synchronisation distante |
| Planning automatique — EXISTANT | Comme utilisateur, remplir les créneaux choisis sur aujourd'hui à J+6 avec les recettes acceptées | Sept recettes distinctes par type/créneau requis : 14 plats pour déjeuner+dîner, 7 desserts si activés, 7 petits-déjeuners si activés. Pas de répétition d'une recette ; stock insuffisant : créneaux vides au niveau du store et invitation à compléter dans l'UI |
| Planning manuel — EXISTANT | Comme utilisateur, composer sans terminer le swipe, ajouter/remplacer/retirer des repas | Sauvegarde immédiate locale, confirmation de retrait et annulation du dernier retrait. Refuse une recette déjà présente ailleurs ; affiche tous les créneaux si aucun n'est sélectionné |
| Préférences — EXISTANT partiel | Comme utilisateur, activer les saisons, choisir les créneaux et le nombre de personnes | Profil : saison, créneaux et multiplicateur 1–12. Régime, exclusions, ingrédients favoris, équipement, budget, difficulté, répétition mensuelle existent dans les types mais n'ont pas d'écran complet. Le bouton « Préférences » retourne à l'accueil |
| Consultation / cuisine — EXISTANT | Comme utilisateur, consulter photo, portions, durée, ingrédients, étapes, astuce et source/page | Coches de préparation éphémères par recette. L'ajout depuis la fiche ajoute à la sélection et ouvre le swipe ; « Mes recettes → Ajouter au planning » ouvre l'éditeur |
| Gestion des repas — EXISTANT | Comme utilisateur, marquer cuisiné, sauter ou déplacer vers une autre date du plan | Le déplacement conserve le créneau et remplace un repas à destination. « Cuisiné » ajoute une entrée à l'historique ; « sauté » retire les ingrédients à la prochaine génération |
| Courses — EXISTANT partiel | Comme utilisateur, obtenir une liste regroupée, cocher, copier, partager ou imprimer | Exclut les repas sautés, inclut les cuisinés. Quantités de même unité additionnées ; unités différentes concaténées. Multiplie par le nombre de personnes sans diviser par les portions de la recette : correction à prévoir. Basiques masqués seulement à l'écran ; restent dans le texte partagé |
| Historique — EXISTANT | Comme utilisateur, retrouver mes six dernières préparations, noter 1–5 et « Refaire » | Stockage local ; compteur « Semaines » estimé par `ceil(history.length/7)`, pas un décompte de plans archivés. Aucune collection Cloud de semaines |
| Inscription / confirmation — EXISTANT, CONFIGURÉ | Comme contributeur, créer un compte e-mail/mot de passe et confirmer avant connexion | `signUp`, redirection vers l'origine du navigateur, pas de session avant confirmation, renvoi après délai 60 s ; ne jamais désactiver la confirmation |
| Connexion / déconnexion — EXISTANT | Comme utilisateur, retrouver mon espace de navigateur par compte | `signInWithPassword`, sessions Supabase persistées et rafraîchies, `signOut({scope:'local'})`. Pas de Google OAuth, CAPTCHA ou parcours de récupération de mot de passe dans cette UI |
| Création de recette — EXISTANT | Comme contributeur connecté, saisir les champs, 1–60 ingrédients, 1–50 étapes et une photo facultative | RPC atomique, photo JPG/PNG/WebP ≤5 Mio ; nouvelle recette `community/pending`, ingrédients rapprochés du référentiel ou créés. Erreur de suggestions : saisie manuelle possible ; fermeture bloquée pendant enregistrement |
| Modération — EXISTANT | Comme administrateur, examiner, corriger, publier/refuser une soumission | Auteur conservé, édition ne publie pas ; commentaire obligatoire pour refus, au plus 1000 caractères. Réponse concurrente : une seule décision. Auteur garde l'accès après refus ; aucune révision par l'auteur |
| Notifications — EXISTANT local seulement | Comme administrateur local, recevoir un lien d'examen dans Mailpit | Envoi facultatif après sauvegarde, file SQL durable et reprise manuelle ; aucun transport ni cron de production. Le nettoyage limite l'appel automatique au développement local sans affecter la modération |

Sources : [orchestrateur](../components/broco-chou-app.tsx), [store](../lib/store.ts), [profil](../components/profile-page.tsx), [éditeur](../components/weekly-plan-editor.tsx), [formulaire](../components/personal-recipe-form.tsx).

## Priorisation MoSCoW

| Niveau | Version livrée à préserver | Évolutions distinctes |
| --- | --- | --- |
| Must Have | Consultation, sélection, planning daté, courses, Auth confirmée, confidentialité des soumissions, modération/RLS | Corriger fiabilité des quantités et vérifier avant ouverture publique les limites e-mail et les protections d'import |
| Should Have | Filtres de l'éditeur, statut textuel, historique, photos privées | Préférences complètes, accessibilité clavier/zoom, couverture des calculs, restauration documentée |
| Could Have | Partage et impression des courses | Partage du plan, restes, batch cooking, recherche plein texte, suggestions selon ingrédients disponibles, estimation de coût |
| Won't Have pour cette version | — | Google OAuth, Turnstile, Mailjet/Resend applicatifs, refonte UI, domaine payant imposé, synchronisation multi-appareil, pipeline Odélis automatique |

Les priorités et statuts opérationnels uniques sont dans [IMPLEMENTATION_PLAN](IMPLEMENTATION_PLAN.md).

## Objectifs et KPI proposés

À FAIRE : instrumentation métier, aucune mesure revendiquée. Vercel Analytics est rendu en production, mais aucun événement métier n'est codé.

| KPI proposé | Définition à valider |
| --- | --- |
| Activation | Part des nouveaux visiteurs créant un premier planning |
| Onboarding terminé | Fin d'onboarding / affichages initiaux |
| Sélection | Recettes acceptées ou favorites par visiteur actif |
| Planning | Nombre de générations ou créations manuelles distinctes |
| Contribution | Soumissions réussies et part publiée |
| Modération | Délai `reviewed_at - created_at`, en distinguant refus et validation |
| Retour utilisateur | Retours volontaires et réutilisation hebdomadaire ; méthode de collecte à décider |

Prévoir minimisation des données, finalité et information des utilisateurs avant toute nouvelle collecte. Ne pas déduire un KPI à partir du compteur « Semaines » actuel.

## Risques et questions ouvertes

- E-mail : SMTP intégré restreint ; voir les faits et sources dans [TRD](TRD.md). Un succès sur les adresses testées ne valide pas l'inscription du grand public.
- Offres gratuites : quotas, disponibilité, stockage des photos et conservation/sauvegardes doivent être suivis ; pas de garantie chiffrée inventée.
- Catalogue : interprétations City Café, attributions d'images approximatives, ingrédients et portions hétérogènes ; historique maintenu dans la roadmap.
- Données locales : effacement navigateur ou changement d'appareil entraîne perte des plans locaux ; séparation de clés ne constitue pas un chiffrement sur appareil partagé.
- Sécurité : import de développement sans contrôle de rôle ; risque si connecté à Cloud ou exposé sur le réseau. Accessibilité et conformité RGPD non certifiées.
- [À CONFIRMER] Public réellement autorisé à s'inscrire avec le SMTP actuel et calendrier d'ouverture plus large.
- [À CONFIRMER] Base de portions canonique et comportement attendu quand le nombre de convives change.
- [À CONFIRMER] Gouvernance éditoriale et délai souhaité pour modérer ; politique de conservation/suppression et contact pour les droits des personnes.
- [À CONFIRMER] Besoin réel de synchronisation, notifications et automatisation Odélis. Ces inconnues n'empêchent pas la consolidation actuelle.
