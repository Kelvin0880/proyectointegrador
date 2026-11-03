'use client';
import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * Lee y actualiza un parámetro de la URL (?clave=valor) sin recargar la página.
 * Así los filtros se conservan al compartir el enlace o volver atrás.
 */
export function useQueryParam(key, defaultValue = '') {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = searchParams.get(key) ?? defaultValue;

  const setValue = useCallback(
    (next) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === undefined || next === null || next === '' || next === defaultValue) params.delete(key);
      else params.set(key, next);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams, key, defaultValue]
  );

  return [value, setValue];
}
