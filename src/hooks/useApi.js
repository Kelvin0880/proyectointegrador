'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api-client';

/**
 * Carga datos de la API y expone { data, error, loading, refetch, setData }.
 * Si `url` es null no hace la petición (útil para cargas condicionales).
 * Las respuestas obsoletas (por ejemplo, al cambiar un filtro rápido) se descartan.
 */
export function useApi(url, { initialData = null } = {}) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(Boolean(url));
  const requestId = useRef(0);

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!url) {
        setLoading(false);
        return;
      }
      const id = ++requestId.current;
      if (!silent) setLoading(true);
      setError(null);
      try {
        const result = await apiFetch(url);
        if (id === requestId.current) setData(result);
      } catch (err) {
        if (id === requestId.current) setError(err.message);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [url]
  );

  useEffect(() => {
    load();
  }, [load]);

  const refetch = useCallback(() => load({ silent: true }), [load]);

  return { data, error, loading, refetch, setData };
}

/**
 * Envuelve una acción asíncrona (crear, editar, eliminar) y controla su estado de carga.
 * Devuelve [run, loading]. `run` devuelve el resultado o lanza el error.
 */
export function useAsyncAction(action) {
  const [loading, setLoading] = useState(false);
  const actionRef = useRef(action);
  actionRef.current = action;

  const run = useCallback(async (...args) => {
    setLoading(true);
    try {
      return await actionRef.current(...args);
    } finally {
      setLoading(false);
    }
  }, []);

  return [run, loading];
}
