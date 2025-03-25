'use client';
// src/app/auth/login/page.js
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registrationSuccess = searchParams.get('registered') === 'true';
  
  const [matricula, setMatricula] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!matricula || !password) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Formatear el email con dominio de la UNPHU, normalizando a minúsculas
      const formattedMatricula = matricula.toLowerCase().trim();
      const email = `${formattedMatricula}@unphu.edu.do`;
      
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      
      if (!result) {
        throw new Error('Error de comunicación con el servidor');
      }
      
      if (result.error) {
        setError('Credenciales inválidas. Por favor, intenta de nuevo.');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      setError('Ocurrió un error al iniciar sesión. Por favor, intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Iniciar Sesión
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sistema de Inventario UNPHU
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {registrationSuccess && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
              ¡Registro exitoso! Ahora puedes iniciar sesión con tus credenciales.
            </div>
          )}
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="matricula" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  id="matricula"
                  name="matricula"
                  type="text"
                  autoComplete="username"
                  required
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  className="block w-full rounded-l-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500 sm:text-sm"
                />
                <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                  @unphu.edu.do
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">Ingresa solo tu matrícula, por ejemplo: "lc22-1392"</p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md bg-green-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">
                  ¿No tienes una cuenta?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/auth/register"
                className="flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-green-700 shadow-sm border border-green-700 hover:bg-green-50"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}