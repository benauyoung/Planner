import { auth } from '@/services/firebase'

/**
 * Wrapper around fetch that adds the Firebase auth token to API requests.
 * Falls through to regular fetch when Firebase is not configured (guest mode).
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers)

  if (auth?.currentUser) {
    const token = await auth.currentUser.getIdToken()
    headers.set('Authorization', `Bearer ${token}`)
  }

  return fetch(url, { ...options, headers })
}
