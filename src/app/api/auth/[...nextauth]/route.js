// src/app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { query } from '@/lib/db';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Contraseña', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Credenciales incompletas");
          return null;
        }
        
        try {
          // Extraer la matrícula del email y normalizarla a minúsculas
          const matricula = credentials.email.split('@')[0].toLowerCase().trim();
          console.log(`Intentando autenticar: ${matricula}`);
          
          const users = await query(
            'SELECT * FROM usuarios WHERE LOWER(matricula) = ?',
            [matricula]
          );
          
          if (users.length === 0) {
            console.log(`Usuario no encontrado: ${matricula}`);
            return null;
          }
          
          const user = users[0];
          console.log(`Usuario encontrado: ${user.matricula}, rol: ${user.rol}`);
          
          // Bypass de seguridad para el administrador (temporal)
          let isPasswordValid = false;
          
          if (user.matricula === 'superadmin' && credentials.password === 'admin123') {
            // Para el superadmin, comparamos directamente con la contraseña en texto plano
            console.log('Usando verificación directa para superadmin');
            isPasswordValid = true;
          } else {
            // Para usuarios normales, usamos la comparación bcrypt normal
            isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          }
          
          console.log(`Contraseña válida: ${isPasswordValid}`);
          
          if (!isPasswordValid) {
            console.log(`Contraseña inválida para usuario: ${matricula}`);
            return null;
          }
          
          console.log(`Autenticación exitosa para: ${matricula}`);
          return {
            id: String(user.id),
            name: `${user.nombre} ${user.apellido}`,
            email: user.email,
            matricula: user.matricula,
            role: user.rol
          };
        } catch (error) {
          console.error('Error de autenticación:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Añadir propiedades extra al token JWT cuando el usuario inicia sesión
      if (user) {
        token.id = user.id;
        // Usar la propiedad correcta "rol" en lugar de "role"
        token.role = user.role || user.rol;
        token.matricula = user.matricula;
        
        // Log para depuración
        console.log('JWT callback - adding user data to token:', { 
          id: user.id, 
          matricula: user.matricula, 
          role: token.role 
        });
      }
      return token;
    },
    async session({ session, token }) {
      // Añadir propiedades extra a la sesión
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.matricula = token.matricula;
        
        // Log para depuración
        console.log('Session callback - user data in session:', { 
          id: token.id, 
          matricula: token.matricula, 
          role: token.role 
        });
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET || 'unphuInventarioSecretKey',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };