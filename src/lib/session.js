// Obtiene la sesión del usuario actual en componentes de servidor y rutas de la API.
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';

export async function getSession() {
  try {
    return await getServerSession(authOptions);
  } catch (error) {
    console.error('Error al obtener la sesión:', error);
    return null;
  }
}
