// src/app/dashboard/admin/nuevo-item/page.js
'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NuevoItem() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [departamentos, setDepartamentos] = useState([]);
  const [loadingDepartamentos, setLoadingDepartamentos] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    departamento_id: '',
    cantidad_total: 1,
  });
  
  useEffect(() => {
    // Redirigir si no es admin o no está autenticado
    if (status === "unauthenticated") {
      router.push('/auth/login');
      return;
    }
    
    if (session && session.user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    const fetchDepartamentos = async () => {
      try {
        setLoadingDepartamentos(true);
        const response = await fetch('/api/departamentos');
        
        if (!response.ok) {
          throw new Error('Error al cargar departamentos');
        }
        
        const data = await response.json();
        setDepartamentos(data);
        
        if (data.length > 0) {
          setFormData(prev => ({
            ...prev,
            departamento_id: data[0].id.toString()
          }));
        }
        
        setError('');
      } catch (err) {
        console.error('Error:', err);
        setError('Error al cargar los departamentos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoadingDepartamentos(false);
      }
    };
    
    if (session) {
      fetchDepartamentos();
    }
  }, [session, router, status]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Convertir a número para campos numéricos
    if (name === 'cantidad_total') {
      const numValue = parseInt(value, 10);
      if (isNaN(numValue)) return;
      
      setFormData({
        ...formData,
        [name]: numValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.nombre) {
      setError('El nombre del equipo es obligatorio');
      return;
    }
    
    if (!formData.descripcion) {
      setError('La descripción es obligatoria');
      return;
    }
    
    if (!formData.departamento_id) {
      setError('Debes seleccionar un departamento');
      return;
    }
    
    if (formData.cantidad_total < 1) {
      setError('La cantidad debe ser al menos 1');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el equipo');
      }
      
      setSuccess('Equipo creado correctamente');
      
      // Resetear formulario
      setFormData({
        nombre: '',
        descripcion: '',
        departamento_id: departamentos[0]?.id.toString() || '',
        cantidad_total: 1,
      });
      
      // Redirigir después de un momento
      setTimeout(() => {
        router.push('/dashboard/admin/inventario');
      }, 2000);
      
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
      </div>
    );
  }
  
  if (status === "unauthenticated" || (session && session.user.role !== 'admin')) {
    return null; // El useEffect ya redirige
  }
  
  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl sm:truncate">
              Nuevo Equipo
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Agrega un nuevo equipo al inventario
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Link
              href="/dashboard/admin/inventario"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al Inventario
            </Link>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {success && (
              <div className="mb-6 rounded-md bg-green-50 p-4 border border-green-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Éxito</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>{success}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Sección de Información Básica */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Información del Equipo</h2>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="nombre" className="block text-base font-semibold text-gray-900 mb-1">
                      Nombre del Equipo
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      id="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-base text-gray-900"
                      placeholder="Ej: Cable HDMI, Proyector, Micrófono"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="descripcion" className="block text-base font-semibold text-gray-900 mb-1">
                      Descripción
                    </label>
                    <textarea
                      id="descripcion"
                      name="descripcion"
                      rows={4}
                      value={formData.descripcion}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-base text-gray-900"
                      placeholder="Describe el equipo detalladamente incluyendo marca, modelo, características, etc."
                      required
                    />
                    <p className="mt-2 text-sm text-gray-600">
                      Incluye detalles relevantes que permitan identificar fácilmente el equipo y sus características.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Sección de Detalles de Inventario */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Detalles del Inventario</h2>
                
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="departamento_id" className="block text-base font-semibold text-gray-900 mb-1">
                      Departamento
                    </label>
                    <div className="relative">
                      <select
                        id="departamento_id"
                        name="departamento_id"
                        value={formData.departamento_id}
                        onChange={handleChange}
                        disabled={loadingDepartamentos || submitting}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-base text-gray-900 font-medium pr-10 pl-3 py-2 appearance-none"
                        required
                      >
                        <option value="" disabled>Seleccionar departamento</option>
                        {departamentos.map((departamento) => (
                          <option key={departamento.id} value={departamento.id} className="text-gray-900">
                            {departamento.nombre}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    {loadingDepartamentos && (
                      <div className="mt-2 flex items-center text-sm text-gray-600">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Cargando departamentos...
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="cantidad_total" className="block text-base font-semibold text-gray-900 mb-1">
                      Cantidad Total
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <input
                        type="number"
                        name="cantidad_total"
                        id="cantidad_total"
                        min="1"
                        value={formData.cantidad_total}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-base text-gray-900 pr-12"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">und</span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Número total de unidades de este equipo disponibles para préstamos.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Botones de acción */}
              <div className="flex justify-end space-x-3 pt-5 border-t border-gray-200">
                <Link
                  href="/dashboard/admin/inventario"
                  className="py-2.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex justify-center items-center py-2.5 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Guardar Equipo
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}