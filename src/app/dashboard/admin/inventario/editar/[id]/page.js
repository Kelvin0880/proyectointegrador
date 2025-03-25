// src/app/dashboard/admin/inventario/editar/[id]/page.js
'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditarItem() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  
  const [departamentos, setDepartamentos] = useState([]);
  const [loadingDepartamentos, setLoadingDepartamentos] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    departamento_id: '',
    cantidad_total: 1,
    cantidad_disponible: 1,
    estado: 'Disponible'
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
  
  // Efecto separado para cargar el item
  useEffect(() => {
    const fetchItem = async () => {
      if (!id || !session) return;
      
      try {
        setLoading(true);
        console.log('Fetching item with ID:', id);
        const response = await fetch(`/api/items/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Item no encontrado');
          } else {
            throw new Error('Error al cargar el item');
          }
        }
        
        const data = await response.json();
        console.log('Item data received:', data);
        
        if (!data || !data.nombre) {
          throw new Error('Datos del item incompletos');
        }
        
        setFormData({
          nombre: data.nombre || '',
          descripcion: data.descripcion || '',
          departamento_id: data.departamento_id ? data.departamento_id.toString() : '',
          cantidad_total: data.cantidad_total || 1,
          cantidad_disponible: data.cantidad_disponible || 1,
          estado: data.estado || 'Disponible'
        });
        
        setError('');
      } catch (err) {
        console.error('Error al cargar item:', err);
        setError(err.message || 'Error al cargar el item. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    if (session && id) {
      fetchItem();
    }
  }, [session, id]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Convertir a número para campos numéricos
    if (name === 'cantidad_total' || name === 'cantidad_disponible') {
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
      setError('La cantidad total debe ser al menos 1');
      return;
    }
    
    if (formData.cantidad_disponible > formData.cantidad_total) {
      setError('La cantidad disponible no puede ser mayor que la cantidad total');
      return;
    }
    
    if (formData.cantidad_disponible < 0) {
      setError('La cantidad disponible no puede ser negativa');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      
      const response = await fetch(`/api/items/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar el equipo');
      }
      
      setSuccess('Equipo actualizado correctamente');
      
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
  
  if (status === "loading" || loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700 mb-4"></div>
          <p className="text-gray-600">{loading ? 'Cargando datos del equipo...' : 'Verificando sesión...'}</p>
        </div>
      </div>
    );
  }
  
  if (status === "unauthenticated" || (session && session.user.role !== 'admin')) {
    return null; // El useEffect ya redirige
  }
  
  // Mostrar un mensaje más descriptivo cuando hay un error y no se ha cargado el nombre
  if (error && (!formData.nombre || formData.nombre === '')) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
            <p className="font-bold">Error al cargar el equipo:</p>
            <p>{error}</p>
            <p className="mt-2 text-sm">ID del equipo: {id}</p>
          </div>
          <div className="mt-5">
            <Link
              href="/dashboard/admin/inventario"
              className="inline-flex items-center rounded-md bg-green-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            >
              Volver al Inventario
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Editar Equipo
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Actualiza la información del equipo
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link
            href="/dashboard/admin/inventario"
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Cancelar
          </Link>
        </div>
      </div>
      
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">Información del Equipo</h3>
              
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="nombre" className="block text-sm font-bold text-gray-900">
                    Nombre del Equipo
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="nombre"
                      id="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm text-gray-900"
                      placeholder="Ej: Cable HDMI"
                      required
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-6">
                  <label htmlFor="descripcion" className="block text-sm font-bold text-gray-900">
                    Descripción
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="descripcion"
                      name="descripcion"
                      rows={3}
                      value={formData.descripcion}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm text-gray-900"
                      placeholder="Describe el equipo y sus características"
                      required
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Incluye detalles relevantes como marca, modelo, características, etc.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">Detalles del Inventario</h3>
              
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="departamento_id" className="block text-sm font-bold text-gray-900">
                    Departamento
                  </label>
                  <div className="mt-1">
                    <select
                      id="departamento_id"
                      name="departamento_id"
                      value={formData.departamento_id}
                      onChange={handleChange}
                      disabled={loadingDepartamentos || submitting}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm text-gray-900 font-medium"
                      required
                    >
                      {departamentos.map((departamento) => (
                        <option key={departamento.id} value={departamento.id} className="text-gray-900">
                          {departamento.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  {loadingDepartamentos && <p className="mt-1 text-sm text-gray-600">Cargando departamentos...</p>}
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="estado" className="block text-sm font-bold text-gray-900">
                    Estado
                  </label>
                  <div className="mt-1">
                    <select
                      id="estado"
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm text-gray-900 font-medium"
                      required
                    >
                      <option value="Disponible">Disponible</option>
                      <option value="Agotado">Agotado</option>
                      <option value="En mantenimiento">En mantenimiento</option>
                    </select>
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="cantidad_total" className="block text-sm font-bold text-gray-900">
                    Cantidad Total
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="cantidad_total"
                      id="cantidad_total"
                      min="1"
                      value={formData.cantidad_total}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm text-gray-900"
                      required
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Número total de unidades de este equipo.
                  </p>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="cantidad_disponible" className="block text-sm font-bold text-gray-900">
                    Cantidad Disponible
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="cantidad_disponible"
                      id="cantidad_disponible"
                      min="0"
                      max={formData.cantidad_total}
                      value={formData.cantidad_disponible}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm text-gray-900"
                      required
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Número de unidades disponibles actualmente.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Link
                href="/dashboard/admin/inventario"
                className="rounded-md bg-white py-2.5 px-4 text-sm font-semibold text-gray-800 shadow-sm border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 mr-3"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-green-700 py-2.5 px-5 text-sm font-semibold text-white shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {submitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}