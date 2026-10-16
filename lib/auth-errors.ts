/** Only expose actionable Auth errors; never display raw provider messages. */
export function authErrorMessage(code: string | undefined, fallback: string) {
  switch (code) {
    case 'captcha_failed':
      return 'La vérification anti-robot a échoué ou expiré. Actualise-la puis réessaie.'
    case 'otp_expired':
    case 'otp_disabled':
      return 'Ce lien est invalide, expiré ou déjà utilisé. Demande un nouveau lien.'
    case 'invalid_credentials':
      return 'Adresse e-mail ou mot de passe incorrect.'
    case 'weak_password':
      return 'Choisis un mot de passe plus robuste, avec au moins huit caractères.'
    case 'same_password':
      return 'Choisis un mot de passe différent du précédent.'
    case 'session_not_found':
    case 'session_expired':
      return 'Ta session a expiré. Connecte-toi à nouveau.'
    case 'email_not_confirmed':
      return 'Confirme ton adresse e-mail avant de te connecter. Tu peux renvoyer le mail ci-dessous.'
    case 'over_email_send_rate_limit':
      return 'La limite d’envoi des e-mails est atteinte. Réessaie plus tard.'
    case 'over_request_rate_limit':
      return 'Trop de tentatives. Patiente quelques instants avant de réessayer.'
    case 'email_address_not_authorized':
      return 'Le service d’envoi des e-mails n’est pas encore configuré pour cette adresse. Contacte l’administrateur.'
    case 'unexpected_failure':
      return 'Le service de connexion est momentanément indisponible. Réessaie plus tard ou contacte l’administrateur.'
    default:
      return fallback
  }
}
