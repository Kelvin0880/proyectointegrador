'use client';
// src/app/auth/register/page.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    matricula: '',
    nombre: '',
    apellido: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.matricula || !formData.nombre || !formData.apellido || !formData.password) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    // Validar formato de la matrícula (podríamos añadir regex para un formato específico)
    if (formData.matricula.length < 3) {
      setError('La matrícula debe tener al menos 3 caracteres');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Normalizar la matrícula a minúsculas
      const formattedMatricula = formData.matricula.toLowerCase().trim();
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matricula: formattedMatricula,
          nombre: formData.nombre,
          apellido: formData.apellido,
          password: formData.password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar usuario');
      }
      
      // Redirigir a la página de inicio de sesión con indicador de registro exitoso
      router.push('/auth/login?registered=true');
    } catch (error) {
      console.error('Error de registro:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Crear cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sistema de Inventario UNPHU
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
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
                  value={formData.matricula}
                  onChange={handleChange}
                  className="block w-full rounded-l-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  placeholder="Ejemplo: lc22-1392"
                />
                <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                  @unphu.edu.do
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">Ingresa solo tu matrícula (letras y números)</p>
            </div>

            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <div className="mt-1">
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  placeholder="Tu nombre"
                />
              </div>
            </div>

            <div>
              <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">
                Apellido
              </label>
              <div className="mt-1">
                <input
                  id="apellido"
                  name="apellido"
                  type="text"
                  required
                  value={formData.apellido}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  placeholder="Tu apellido"
                />
              </div>
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  placeholder="Repite tu contraseña"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md bg-green-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50"
              >
                {loading ? 'Registrando...' : 'Registrarse'}
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
                  ¿Ya tienes una cuenta?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/auth/login"
                className="flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-green-700 shadow-sm border border-green-700 hover:bg-green-50"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}