// Utilidades para las rutas de la API: respuestas, sesión y permisos.
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { ROLES } from '@/lib/constants';

export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const badRequest = (message, details) => new HttpError(400, message, details);
export const notFound = (message = 'Recurso no encontrado') => new HttpError(404, message);
export const forbidden = (message = 'No tienes permiso para realizar esta acción') => new HttpError(403, message);
export const unauthorized = (message = 'Debes iniciar sesión') => new HttpError(401, message);

export function ok(data, status = 200) {
  return NextResponse.json(data, { status });
}

export async function getSessionUser() {
  try {
    const session = await getServerSession(authOptions);
    return session?.user ?? null;
  } catch {
    return null;
  }
}

export function isAdmin(user) {
  return user?.role === ROLES.ADMIN;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw unauthorized();
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!isAdmin(user)) throw forbidden('Se requieren permisos de administrador');
  return user;
}

export async function readJson(req) {
  try {
    return await req.json();
  } catch {
    throw badRequest('El cuerpo de la petición no es JSON válido');
  }
}

export function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw badRequest('Identificador no válido');
  return id;
}

/**
 * Envuelve un handler de ruta: convierte HttpError en respuestas JSON
 * y cualquier otro error en un 500 con un mensaje genérico.
 */
export function handler(fn) {
  return async (req, context) => {
    try {
      return await fn(req, context);
    } catch (error) {
      if (error instanceof HttpError) {
        return NextResponse.json({ error: error.message, details: error.details }, { status: error.status });
      }
      console.error(`[api] ${req.method} ${req.nextUrl?.pathname ?? ''}:`, error);
      return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
  };
}
