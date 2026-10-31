// Thin fetch wrapper around the backend, mirroring the original app.js `api()` helper.
// Every call hits /api/<path>, sends the session cookie, and throws a plain
// Error(message) on failure so callers can do: catch (error) { show(error.message) }
const BASE_URL = '/api'

export async function api(path, options = {}) {
  const res = await fetch(BASE_URL + path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  let data = null
  try {
    data = await res.json()
  } catch (_) {
    // no JSON body
  }

  if (!res.ok) {
    throw new Error((data && data.message) || `Request failed (${res.status})`)
  }

  return data
}
