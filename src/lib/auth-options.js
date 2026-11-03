// Configuración de autenticación (NextAuth con usuario y contraseña).
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { AUTH_SECRET } from '@/lib/auth-secret';
import { normalizeMatricula } from '@/lib/validation';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credenciales',
      credentials: {
        email: { label: 'Matrícula', type: 'text' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const matricula = normalizeMatricula(credentials?.email);
        const password = credentials?.password;
        if (!matricula || !password) return null;

        const [user] = await query('SELECT * FROM usuarios WHERE LOWER(matricula) = ?', [matricula]);
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return {
          id: String(user.id),
          name: `${user.nombre} ${user.apellido}`,
          email: user.email,
          matricula: user.matricula,
          role: user.rol,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.matricula = user.matricula;
        return token;
      }
      // Refrescar nombre y rol desde la base de datos para reflejar cambios
      // hechos por un administrador sin obligar a cerrar sesión.
      if (token.id) {
        try {
          const [dbUser] = await query('SELECT nombre, apellido, rol, matricula FROM usuarios WHERE id = ?', [token.id]);
          if (dbUser) {
            token.role = dbUser.rol;
            token.matricula = dbUser.matricula;
            token.name = `${dbUser.nombre} ${dbUser.apellido}`;
          } else {
            token.disabled = true;
          }
        } catch {
          // Si la base de datos no responde se mantiene el token actual
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.disabled) return { ...session, user: null };
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.matricula = token.matricula;
        session.user.name = token.name;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: AUTH_SECRET,
};
