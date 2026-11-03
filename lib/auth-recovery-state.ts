// Capture callback intent before the SDK consumes the fragment. No token is
// stored on disk, exposed to Analytics, or logged by these helpers.
const recoveryCallback = typeof window !== 'undefined'
  && /(?:type=recovery|error=|error_code=)/.test(window.location.hash)
let recoveryAccessToken: string | undefined

export function recordRecoverySession(accessToken: string | undefined) {
  recoveryAccessToken = accessToken
}

export function isRecoverySession(accessToken: string) {
  return Boolean(recoveryAccessToken && accessToken === recoveryAccessToken)
}

export function hasRecoverySession() {
  return Boolean(recoveryAccessToken)
}

export function hasRecoveryCallback() {
  return recoveryCallback
}
