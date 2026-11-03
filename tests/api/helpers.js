// Utilidades para probar las rutas de la API sin levantar el servidor.
import { getServerSession } from 'next-auth/next';

export const USERS = {
  admin: { id: '1', name: 'Administrador Sistema', email: 'admin@unphu.edu.do', matricula: 'admin', role: 'admin' },
  superadmin: { id: '3', name: 'Super Admin', email: 'superadmin@unphu.edu.do', matricula: 'superadmin', role: 'admin' },
  estudiante: { id: '5', name: 'Mario Mesa', email: 'mariomesa@unphu.edu.do', matricula: 'mariomesa', role: 'usuario' },
  juan: { id: '4', name: 'Juan Miliano', email: 'jm18-0990@unphu.edu.do', matricula: 'jm18-0990', role: 'usuario' },
};

/** Simula la sesión iniciada (o ninguna con null) */
export function loginAs(user) {
  getServerSession.mockResolvedValue(user ? { user } : null);
}

export function req(method, path, body) {
  return new Request(`http://localhost${path}`, {
    method,
    headers: body !== undefined ? { 'content-type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export const ctx = (id) => ({ params: Promise.resolve({ id: String(id) }) });

export async function call(handler, method, path, { body, id } = {}) {
  const res = await handler(req(method, path, body), id !== undefined ? ctx(id) : { params: Promise.resolve({}) });
  return { status: res.status, body: await res.json() };
}

export const FUTURE_DATE = '2099-06-15';
