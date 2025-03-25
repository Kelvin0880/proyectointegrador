import { getServerSession } from 'next-auth/next';
import { authOptions } from '../app/api/auth/[...nextauth]/route';

/**
 * Función de utilidad para obtener la sesión del usuario actual en rutas API
 * @returns {Promise<Object|null>} La sesión del usuario o null si no está autenticado
 */
export async function getSession() {
  try {
    return await getServerSession(authOptions);
  } catch (error) {
    console.error('Error al obtener la sesión:', error);
    return null;
  }
}