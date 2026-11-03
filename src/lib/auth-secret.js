// Secreto para firmar las sesiones. Se comparte entre NextAuth y el middleware.
// En producción define NEXTAUTH_SECRET en el archivo .env.
export const AUTH_SECRET = process.env.NEXTAUTH_SECRET || 'unphuInventarioSecretKey';
