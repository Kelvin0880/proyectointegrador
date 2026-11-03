import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api, apiFetch, withQuery } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import { isActivePath, navigationFor } from '@/components/layout/navigation';

function mockFetch(status, body) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    })
  );
}

describe('apiFetch', () => {
  afterEach(() => vi.restoreAllMocks());

  it('devuelve el JSON de una respuesta correcta', async () => {
    mockFetch(200, { ok: true });
    await expect(apiFetch('/api/x')).resolves.toEqual({ ok: true });
  });

  it('envía el cuerpo como JSON', async () => {
    const spy = mockFetch(201, { id: 1 });
    await api.post('/api/items', { nombre: 'A' });
    const [, options] = spy.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(options.body)).toEqual({ nombre: 'A' });
  });

  it('lanza ApiError con el mensaje y los detalles del servidor', async () => {
    mockFetch(400, { error: 'Dato inválido', details: { nombre: 'Requerido' } });
    const error = await apiFetch('/api/x').catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe('Dato inválido');
    expect(error.status).toBe(400);
    expect(error.details).toEqual({ nombre: 'Requerido' });
  });

  it('usa un mensaje claro cuando la sesión expira', async () => {
    mockFetch(401, {});
    await expect(apiFetch('/api/x')).rejects.toThrow(/sesión expiró/);
  });

  it('informa errores de red', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(apiFetch('/api/x')).rejects.toThrow(/conectar con el servidor/);
  });
});

describe('withQuery', () => {
  it('omite valores vacíos', () => {
    expect(withQuery('/api/items', { q: 'hdmi', estado: '', departamento_id: undefined })).toBe('/api/items?q=hdmi');
    expect(withQuery('/api/items', {})).toBe('/api/items');
  });
});

describe('cn', () => {
  it('combina clases condicionales', () => {
    expect(cn('a', false && 'b', null, ['c', { d: true, e: false }])).toBe('a c d');
  });
});

describe('navegación', () => {
  it('oculta la sección de administración a usuarios normales', () => {
    expect(navigationFor('usuario').map((s) => s.title)).not.toContain('Administración');
    expect(navigationFor('admin').map((s) => s.title)).toContain('Administración');
  });

  it('marca la ruta activa', () => {
    expect(isActivePath('/dashboard', { href: '/dashboard', exact: true })).toBe(true);
    expect(isActivePath('/dashboard/solicitudes', { href: '/dashboard', exact: true })).toBe(false);
    expect(isActivePath('/dashboard/solicitudes/4', { href: '/dashboard/solicitudes' })).toBe(true);
    expect(isActivePath('/dashboard/solicitudes-x', { href: '/dashboard/solicitudes' })).toBe(false);
  });
});
