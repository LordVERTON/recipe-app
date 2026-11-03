import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Confidentialité — Broco-Chou' }

export default function PrivacyPage() {
  return <main className="mx-auto max-w-3xl space-y-6 px-6 py-12 leading-relaxed text-charcoal-soft">
    <Link className="underline" href="/">Retour à Broco-Chou</Link>
    <h1 className="text-3xl font-bold">Confidentialité et données personnelles</h1>
    <p>Dernière mise à jour : 3 novembre 2026. Cette page décrit les données utilisées par Broco-Chou et les commandes disponibles pour les gérer.</p>
    <section className="space-y-2"><h2 className="text-xl font-semibold">Compte et recettes</h2>
      <p>Supabase gère ton adresse e-mail, ton compte, ton mot de passe sous forme protégée et ta session. Il permet la connexion, la confirmation de ton adresse et la récupération de ton mot de passe.</p>
      <p>Les recettes que tu proposes, leurs ingrédients, étapes, photos et décisions de modération sont enregistrés dans Supabase. Une recette en attente ou refusée est accessible à son auteur et aux administrateurs. Après validation, elle devient publique. Les photos privées sont accessibles au moyen de liens temporaires.</p>
    </section>
    <section className="space-y-2"><h2 className="text-xl font-semibold">Planning conservé dans ton navigateur</h2>
      <p>Ton planning, tes favoris, tes préférences, ton historique et ta liste de courses restent sur cet appareil, séparément pour chaque compte. Ils ne sont pas synchronisés entre appareils.</p>
      <p>La déconnexion retire ta session sur ce navigateur, mais conserve ton planning local. Effacer les données du site dans les réglages du navigateur supprime les informations locales ; Supabase ne permet pas de restaurer ce planning.</p>
    </section>
    <section className="space-y-2"><h2 className="text-xl font-semibold">Hébergement et mesure de fréquentation</h2>
      <p>Vercel héberge l’application ; Supabase fournit les comptes, la base de recettes et le stockage des photos. Les hébergeurs peuvent traiter des informations techniques nécessaires au fonctionnement et à la sécurité du service.</p>
      <p>Vercel Web Analytics mesure la fréquentation du site public. Les pages de récupération de compte sont exclues de cette mesure. Certaines illustrations proviennent de Pexels : leur affichage peut contacter son serveur d’images. Une image locale est utilisée si la photo ne peut pas être chargée.</p>
    </section>
    <section className="space-y-2"><h2 className="text-xl font-semibold">Conservation et demandes concernant tes données</h2>
      <p>Les données locales restent jusqu’à leur suppression sur l’appareil. Aucune suppression automatique générale des comptes, recettes et photos n’est actuellement proposée. Il n’existe pas encore de commande permettant de supprimer ou d’exporter l’ensemble de ton compte depuis l’application.</p>
      <p>Les coordonnées du responsable, un contact dédié aux demandes et les durées de conservation détaillées restent à publier. Tu peux retrouver le responsable du projet sur le <a className="underline" href="https://github.com/LordVERTON/recipe-app" target="_blank" rel="noopener noreferrer">dépôt Broco-Chou</a>. Ne publie pas de mot de passe, de lien de connexion ni de donnée personnelle dans une discussion publique.</p>
    </section>
  </main>
}
