import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Confidentialité — Broco-Chou' }

export default function PrivacyPage() {
  return <main className="mx-auto max-w-3xl space-y-6 px-6 py-12 leading-relaxed text-charcoal-soft">
    <Link className="underline" href="/">Retour à Broco-Chou</Link>
    <h1 className="text-3xl font-bold">Confidentialité et données personnelles</h1>
    <p>Dernière mise à jour : 3 novembre 2026. Cette page décrit les données utilisées par Broco-Chou et les commandes disponibles pour les gérer.</p>
    <section className="space-y-2"><h2 className="text-xl font-semibold">Responsable et contact</h2>
      <p>Le responsable du traitement des données est Daniel VERTON. Pour une question concernant tes données ou l’exercice de tes droits, écris à <a className="break-all underline" href="mailto:vertondan@gmail.com">vertondan@gmail.com</a>.</p>
    </section>
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
      <p>Les données locales restent jusqu’à leur suppression sur l’appareil. La règle retenue pour les comptes est une revue manuelle après six mois d’inactivité. Ce délai déclenche une revue, pas une suppression automatique : il n’existe actuellement aucune purge automatique générale des comptes, recettes ou photos.</p>
      <p>Lors de la fermeture d’un compte, les recettes déjà publiées sont destinées à être conservées après anonymisation. Celle-ci doit retirer les liens et informations permettant d’identifier leur auteur, y compris dans le contenu ou les photos. Cette opération reste manuelle ; elle n’est pas réalisée par une commande de l’application.</p>
      <p>Tu peux demander l’accès, la rectification, l’effacement ou la limitation du traitement de tes données et, selon les conditions applicables, leur portabilité ou t’opposer à leur traitement. Adresse ta demande à <a className="break-all underline" href="mailto:vertondan@gmail.com">vertondan@gmail.com</a> en précisant l’adresse de ton compte. Ne transmets jamais ton mot de passe ni un lien de connexion. Les demandes sont examinées manuellement ; il n’existe pas encore de commande d’export ou de suppression complète du compte dans l’application.</p>
      <p>Pour en savoir plus sur tes droits ou introduire une réclamation, consulte le <a className="underline" href="https://www.cnil.fr/fr/les-droits-pour-maitriser-vos-donnees-personnelles" target="_blank" rel="noopener noreferrer">site de la CNIL</a>.</p>
    </section>
  </main>
}
