type SubmissionError = { status?: number; statusCode?: string | number; code?: string }

// Expose only a bounded status/code, never the server message or request payload.
export function recipeSubmissionErrorMessage(error: SubmissionError, stage: 'photo' | 'recipe'): string {
  const status = Number(error.status ?? error.statusCode)
  const code = /^[A-Za-z0-9_]{1,40}$/.test(error.code ?? '') ? error.code : undefined
  const reference = code ?? (status >= 400 && status <= 599 ? String(status) : 'reseau')
  const suffix = ` (référence : ${stage === 'photo' ? 'photo' : 'recette'}/${reference}).`
  if (status === 401 || code === 'InvalidJWT' || code === 'PGRST301') {
    return 'Ta session n’est plus valide. Reconnecte-toi avant de réessayer' + suffix
  }
  if (stage === 'photo') {
    if (status === 413 || code === 'EntityTooLarge' || code === 'PayloadTooLarge') {
      return 'La photo est trop volumineuse. Choisis une image de 5 Mo maximum' + suffix
    }
    if (code === 'InvalidMimeType') return 'Choisis une photo JPG, PNG ou WebP' + suffix
    if (status === 403 || code === 'AccessDenied' || code === '42501') {
      return 'Le stockage a refusé l’envoi de la photo. Réessaie après reconnexion ; si le refus persiste, transmets cette référence' + suffix
    }
    return 'L’envoi de la photo a échoué. Vérifie ta connexion puis réessaie' + suffix
  }
  return 'La recette n’a pas pu être enregistrée. Vérifie les champs puis réessaie ; si l’erreur persiste, transmets cette référence' + suffix
}
