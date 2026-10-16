import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Confidentialité — Broco-Chou' }
export default function Privacy() {
  return <main className="mx-auto max-w-3xl space-y-6 px-6 py-12 leading-relaxed">
    <Link className="underline" href="/">Retour à Broco-Chou</Link>
    <h1 className="text-3xl font-bold text-deep-plum">Politique de confidentialité</h1>
    <p>Dernière mise à jour : 16 octobre 2026.</p>
    <p className="rounded-xl border p-4"><strong>À compléter avant publication :</strong> identité et coordonnées du responsable, contact pour exercer les droits, calendrier de conservation, bases légales définitives et garanties des transferts. Cette politique décrit le code de l’application ; sa validation juridique et la vérification des services activés restent nécessaires.</p>
    <section><h2 className="text-xl font-semibold">L’application et son responsable</h2>
      <p>Broco-Chou permet de découvrir des recettes, organiser ses repas et proposer des recettes à la communauté. Responsable du traitement et adresse de contact : <strong>À compléter avant publication</strong>.</p></section>
    <section><h2 className="text-xl font-semibold">Données utilisées et finalités</h2>
      <p>Supabase Auth gère l’adresse e-mail, l’identifiant du compte, le mot de passe sous forme protégée, les sessions et les événements d’authentification. Ces données permettent la connexion, la confirmation d’adresse et la récupération du compte. Google peut fournir une identité et des informations de profil lorsque cette connexion est activée.</p>
      <p>Les recettes, ingrédients, instructions, photos, identifiants d’auteur et décisions de modération sont conservés dans Supabase. Les recettes en attente ou refusées sont accessibles à leur auteur et aux administrateurs ; les recettes validées deviennent publiques. Une notification de modération peut transmettre le nom de la recette et un lien à l’administrateur.</p>
      <p>Les préférences alimentaires, favoris, choix de recettes, planning, historique et liste de courses restent sur votre navigateur, dans un espace distinct par compte. Ils ne sont pas synchronisés entre appareils. Évitez de saisir des informations sensibles dans les champs libres ou les photos.</p>
      <p>Bases légales envisagées, à confirmer avant publication : exécution du service demandé pour les comptes et recettes ; intérêt légitime pour la sécurité et la modération, après examen de sa proportionnalité. Les traitements facultatifs nécessitant un consentement doivent être identifiés séparément. Aucune case de consentement global n’est imposée.</p></section>
    <section><h2 className="text-xl font-semibold">Prestataires et destinataires</h2>
      <p>Vercel héberge le site. Supabase fournit l’authentification, la base et le stockage des photos. Mailjet est prévu pour acheminer les e-mails transactionnels après configuration ; les notifications applicatives sont activables séparément. Google OAuth et Cloudflare Turnstile interviennent seulement si activés. Turnstile traite des informations techniques de connexion pour lutter contre les abus. Les prestataires d’hébergement peuvent traiter des adresses IP et journaux techniques.</p>
      <p>Le code active Vercel Web Analytics en production sur les pages ordinaires, pour mesurer la fréquentation. Les pages de retour d’authentification en sont exclues. La configuration distante et les durées de rétention doivent être vérifiées avant publication.</p></section>
    <section><h2 className="text-xl font-semibold">Stockage sur votre appareil</h2>
      <p>Le navigateur conserve la session Supabase et les données de planification dans localStorage, notamment sous les clés broco-chou-storage et broco-chou-account suivies de l’identifiant du compte. Se déconnecter retire la session mais ne supprime pas le planning local. Effacer les données du site dans le navigateur supprime ces informations sur cet appareil. Une intention temporaire de création de recette peut être conservée dans sessionStorage durant la connexion.</p></section>
    <section><h2 className="text-xl font-semibold">Conservation et transferts</h2>
      <p>Aucune purge automatique générale des comptes et recettes n’est actuellement prévue par le code. Les données locales restent jusqu’à leur suppression par l’utilisateur ou le navigateur. Les durées et procédures applicables aux comptes inactifs, recettes, photos, journaux, files de notification et sauvegardes sont <strong>À compléter avant publication</strong>.</p>
      <p>Selon les régions d’hébergement et prestataires choisis, des traitements hors de l’Espace économique européen peuvent avoir lieu. Les régions effectives, destinataires, accords de traitement et garanties applicables (notamment clauses contractuelles types lorsqu’elles conviennent) sont <strong>À compléter avant publication</strong>. Aucune localisation ni garantie contractuelle non vérifiée n’est affirmée ici.</p></section>
    <section><h2 className="text-xl font-semibold">Vos droits</h2>
      <p>Selon les conditions prévues par le RGPD, vous pouvez demander l’accès, la rectification, l’effacement, la limitation, la portabilité ou vous opposer à certains traitements. Vous pouvez retirer un consentement pour les traitements qui en dépendent et saisir l’autorité de contrôle compétente, notamment la CNIL en France. Contact et procédure de demande d’accès ou de suppression : <strong>À compléter avant publication</strong>. La suppression d’un compte n’est pas proposée en libre-service dans cette version.</p></section>
  </main>
}
