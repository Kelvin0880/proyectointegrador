import { getServerSession } from 'next-auth/next';
import { authOptions } from '../app/api/auth/[...nextauth]/route';

// Función de utilidad para obtener la sesión consistentemente en todas las rutas API
export const getSession = async () => {
  return await getServerSession(authOptions);
};