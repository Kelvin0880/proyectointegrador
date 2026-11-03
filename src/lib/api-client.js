// Cliente HTTP para consumir la API desde el navegador.
// Lanza ApiError con el mensaje que devuelve el servidor para mostrarlo al usuario.

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function apiFetch(url, { method = 'GET', body, signal } = {}) {
  let response;
  try {
    response = await fetch(url, {
      method,
      signal,
      credentials: 'include',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('No se pudo conectar con el servidor. Revisa tu conexión.', 0);
  }

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const fallback = response.status === 401
      ? 'Tu sesión expiró. Inicia sesión de nuevo.'
      : 'Ocurrió un error inesperado. Intenta de nuevo.';
    throw new ApiError(data?.error || fallback, response.status, data?.details);
  }
  return data;
}

export const api = {
  get: (url, options) => apiFetch(url, { ...options, method: 'GET' }),
  post: (url, body) => apiFetch(url, { method: 'POST', body }),
  patch: (url, body) => apiFetch(url, { method: 'PATCH', body }),
  delete: (url) => apiFetch(url, { method: 'DELETE' }),
};

/** Construye una URL con query string ignorando valores vacíos */
export function withQuery(url, params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `${url}?${qs}` : url;
}
