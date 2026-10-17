# Broco-Chou — Référence UI et UX

**Objectif :** Maintenir l'identité existante et distinguer composants livrés et améliorations futures.
**Dernière mise à jour :** 2026-10-17
**Statut :** EXISTANT relevé dans les sources ; conformité d'accessibilité [À CONFIRMER].
**Documents liés :** [Produit](PRD.md), [Parcours](APP_FLOW.md), [Architecture](TRD.md), [Roadmap](ROADMAP.md).

## Identité et source de vérité

Identité douce, chaleureuse et culinaire : fonds crème, surfaces arrondies, accents mauve/violet, sauge et typographie familière. L'application est conçue pour le téléphone, avec améliorations ponctuelles sur grand écran. Aucune refonte visuelle dans cette mission.

Le layout importe [app/globals.css](../app/globals.css), également déclaré dans `components.json` (shadcn `new-york`, base neutral, variables CSS). [styles/globals.css](../styles/globals.css) est un fichier générique non importé par le layout : ses tokens oklch/Geist et son mode sombre ne définissent pas la charte déployée. Ne pas mélanger les deux jeux de variables. Aucun sélecteur de thème n'est monté par le layout courant.

## Tokens réels

| Token CSS | Valeur | Usage observé |
| --- | --- | --- |
| `--linen` | `#FAF0E6` | `--background` |
| `--warm-ivory` | `#FFF9F5` | Card, popover, barre de navigation |
| `--lavender` | `#E6DAF0` | Secondary, surfaces secondaires |
| `--dusty-violet` | `#BBACD9` | Accent, ring, dégradés |
| `--mauve-taupe` | `#9B64A9` | Primary, actions et liens |
| `--charcoal-soft` | `#2B2B2B` | Foreground et texte fort |
| `--warm-gray` | `#7A746E` | Muted foreground et texte secondaire |
| `--soft-sand` | `#E7DDD4` | Muted, border et input |
| `--sage-mist` | `#C9D8C5` | Repas cuisinés, cases cochées, progression |
| `--deep-plum` | `#6E5A78` | Hover primary, détails sucrés |
| `--destructive` | `#D97474` | Erreurs/destruction ; foreground blanc |
| `--primary-foreground` | `#FFFFFF` | Texte des actions principales |

Chart 1–5 : mauve-taupe, dusty-violet, sage-mist, lavender, deep-plum. Les tokens sidebar reprennent card/primary/secondary/border. Pas de tokens sémantiques `success` ou `warning` dédiés : la sauge, les icônes, le texte et Sonner assurent ces usages. Ne pas inventer de valeurs vert/orange globales. Le `themeColor` du viewport est `#FAF8F5`, légèrement différent du fond CSS ; dette de cohérence, pas changement de cette mission.

Typography : variables historiquement nommées `--font-dm-sans` = `"Segoe UI", Arial, sans-serif`, `--font-fraunces` = `Georgia, "Times New Roman", serif`. `@theme` ajoute les noms DM Sans/Fraunces en repli mais aucun téléchargement de ces polices n'est effectué. Le body utilise sans, le titre de l'onboarding serif. Mono déclare Geist Mono et replis sans chargement de fonte. Tailles fréquentes : titres `text-2xl`/`text-lg`, onboarding `text-4xl`, corps `text-sm`/`text-base`, légendes `text-xs` et navigation `text-[10px]`.

`--radius:1rem` ; dérivés sm=12 px, md=14 px, lg=16 px, xl=20 px avec la base 16 px habituelle. Des composants emploient aussi `rounded-2xl`, `rounded-3xl`, `rounded-full`, et les cartes swipe `rounded-[28px]`. Espacements utilitaires récurrents `gap-2/3/4`, `p-3/4/6`, `px-4/6/8` ; pas d'échelle de spacing personnalisée. Ne pas créer une deuxième échelle sans besoin.

Ombre `.broco-chou-shadow` : `0 4px 20px rgba(155,100,169,0.08), 0 1px 3px rgba(0,0,0,0.04)`. Fond `.broco-chou-gradient` : `linear-gradient(135deg,#FAF0E6 0%,#FFF9F5 45%,#E6DAF0 100%)`. Actions principales utilisent aussi `from-dusty-violet to-mauve-taupe`. `.swipe-card` : `touch-action:pan-y`, `user-select:none`. `.hide-scrollbar` masque la barre, pas le défilement.

## Composants et états

| Famille | Référence / variantes et états réels |
| --- | --- |
| Button | `components/ui/button.tsx` : default, destructive, outline, secondary, ghost, link ; tailles default, sm, lg, icon, icon-sm, icon-lg. Focus visible, disabled, hover ; chargement piloté par le parent (texte et disabled), pas une prop universelle `loading` |
| Cards | Primitives `ui/card` et sections métier, surfaces card, border soft-sand, rayons/ombre. Actif par fond/icône et parfois bordure ; erreur/succès ajoutés par texte du parent |
| Inputs / textarea / select | Bord input, labels reliés ou enveloppants, focus ring. Invalidité via contraintes HTML et message `role=alert`. Les selects métier sont parfois natifs, pas systématiquement Radix |
| Dialog | Radix pour création/édition de recette : `max-h-[90dvh]`, scroll, `sm:max-w-2xl`. Ouverture depuis compte visiteur puis formulaire après connexion ; fermeture interdite pendant sauvegarde |
| Sheet recette | Panneau Framer Motion spécifique dans `recipe-detail-sheet.tsx`, fond obscurci, ouverture depuis bas, hauteur max 90vh. N'utilise pas automatiquement les garanties de focus d'un Sheet Radix ; audit clavier à faire |
| Navigation | Cinq onglets en bas fixes, labels pour quatre ; bouton Swipe rond 56 px, remonté. Indicateur ponctuel animé sur les autres onglets ; pas `aria-current` dans le code actuel, nom accessible du bouton Swipe à corriger |
| Recipe card / swipe | Image et informations essentielles, trois couches de cartes, overlays textuels d'acceptation/refus ; boutons annuler/refuser/accepter/favori. Les cartes internes du swipe ont leur rendu propre, distinct de `recipe-card.tsx` |
| Planning | Sélecteur de dates, « Aujourd'hui », nombre de repas, statut cuisiné/sauté. Éditeur : recherche, filtres et grille de créneaux, menus natifs ; confirmation et annulation du retrait |
| Courses | Six catégories repliables, cases visuelles, barre de progression, copier/partager/imprimer, bouton basiques. État coché : coche et texte barré en plus de couleur |
| Formulaire personnel | Champs désactivés pendant envoi, preview et retrait de photo, listes d'ingrédients, suggestions datalist, erreur inline, succès toast |
| Modération | Libellés pending/approved/rejected, auteur, examen, correction, commentaire obligatoire pour refus et boutons de décision ; erreurs ne ferment pas le contexte |

Les états default/hover/focus/active/disabled sont principalement des classes utilitaires. Loading/error/success sont composés par chaque écran ; ne pas annoncer un système de variantes uniforme déjà implémenté. Voir [APP_FLOW](APP_FLOW.md) pour les états vide, non connecté et erreur réseau.

## Responsive et animations

Les breakpoints Tailwind non redéfinis servent de référence : `sm` 40rem, `md` 48rem, `lg` 64rem ; pas de media query de breakpoint produit personnalisée. Avec la base habituelle 16 px : 640/768/1024 px. Usage réel : éditeur `md:grid-cols-2`, modales centrées à `sm`, import `sm:grid-cols-2 lg:grid-cols-3`, page import max-w-4xl. Le calendrier principal conserve un jour sélectionné et n'offre pas de grille desktop de sept colonnes.

Swipe : largeur `min(88vw,360px)`, hauteur `clamp(280px,52vh,500px)`, conteneur `100svh`. Navigation fixe z40, modales/panneaux z50, contenu avec marge basse pour la barre. `pb-safe` est utilisé dans la navigation sans définition dédiée trouvée : vérifier la safe area réelle sur iOS. Dialog photo/formulaire peut défiler, éviter tout bouton critique hors écran.

Animations observées : transitions d'onglet 0,2 s ; swipe rotation ±16 degrés sur ±240 px, validation au déplacement >100 px ou vitesse >500 ; sortie 0,22 s ; springs pour cartes et panneau, progression courses 0,3 s. Aucun `useReducedMotion` ni media query `prefers-reduced-motion` trouvé : réduction des animations À FAIRE.

Impression : media print met fond blanc, masque `nav`, `button`, `.pb-24`, force `.print-grocery` visible et enlève ses ombres. Vérifier le résultat complet ; certaines classes masquées d'ancêtres peuvent affecter des écrans. Seules les courses ont une action d'impression livrée ; pas d'export de plan.

## Règles UX de maintenance

Conserver une action principale identifiable par écran (commencer, générer, voir le planning, enregistrer). Actions secondaires en outline/ghost ; ne pas ajouter un nouvel accent hors palette. Microcopy en français, concrète : indiquer ce qui a été enregistré et comment reprendre après erreur. Préférer les libellés textuels de statut à des points colorés seuls.

Les retraits de repas ont confirmation et annulation. Les resets de swipes depuis Profil ont confirmation, mais le bouton « Recommencer la sélection » du swipe agit immédiatement : dette à traiter avant de promettre une protection globale. Le déplacement remplace un repas à destination sans confirmation dédiée. Les erreurs de copie presse-papiers sont seulement journalisées ; feedback d'échec utile à ajouter.

### Accessibilité : état et cible

Objectif WCAG 2.2 AA, **pas une conformité mesurée**. Focus global : outline 2 px, offset 2 px, dusty-violet pour boutons/inputs/selects/textarea/liens. Des champs sont labellisés, boutons de courses ont aria-label et min-h/min-w-11 (44 px), dates utilisent `aria-pressed`, catégories `aria-expanded`. Ces acquis sont partiels.

Lacunes observées : viewport `maximumScale:1,userScalable:false`, boutons du swipe sans nom accessible, focus/Échap à auditer sur panneaux faits maison, textes secondaires et sauge à faible contraste potentiel, aucune réduction du mouvement. Pas de mesure de contraste globale ; la vieille roadmap cochait ce sujet sans preuve exhaustive. Les cibles tactiles de 44 px sont une règle de maintenance souhaitée et existent sur plusieurs actions, pas une vérification de toutes les commandes.

Avant future modification UI : tester clavier, lecteur d'écran/noms des commandes, zoom, erreurs et états vides, contraste des associations réellement rendues (y compris transparence), focus après fermeture de modale et navigation sur petit écran. Réutiliser les primitives accessibles existantes lorsque possible. Ne pas présenter un rapport automatisé comme preuve suffisante de tous les parcours.

## Pistes d'amélioration visuelle — non implémentées

- Hiérarchie d'actions plus homogène et statuts textuels accompagnés d'icônes.
- Vue compacte de sept jours sur tablette/desktop, sans changer le modèle de dates.
- Recherche et comparaison des sélections avant swipe, préférences complètes et explication de leur effet réel.
- Réduction des animations, zoom autorisé et focus cohérent des panneaux.
- Safe areas mobiles, remplacement de destination explicite, confirmation du recommencement.
- Harmonisation des couleurs de viewport et suppression future du CSS générique seulement après vérification des imports.

Ces pistes sont HORS PÉRIMÈTRE du nettoyage actuel ; leur suivi reste dans [ROADMAP](ROADMAP.md).
