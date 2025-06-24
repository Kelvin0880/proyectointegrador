// src/app/dashboard/admin/inventario/page.js
'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminInventario() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [departamentos, setDepartamentos] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedDepartamento, setSelectedDepartamento] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
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
        setLoading(true);
        const response = await fetch('/api/departamentos');
        
        if (!response.ok) {
          throw new Error('Error al cargar departamentos');
        }
        
        const data = await response.json();
        setDepartamentos(data);
        
        // Por defecto seleccionar el primer departamento
        if (data.length > 0 && !selectedDepartamento) {
          setSelectedDepartamento(data[0].id.toString());
        }
        
        setError('');
      } catch (err) {
        console.error('Error:', err);
        setError('Error al cargar los departamentos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    if (session) {
      fetchDepartamentos();
    }
  }, [session, router, status, selectedDepartamento]);
  
  useEffect(() => {
    const fetchItems = async () => {
      if (!selectedDepartamento) {
        setItems([]);
        return;
      }
      
      try {
        setLoading(true);
        const response = await fetch(`/api/items?departamento_id=${selectedDepartamento}`);
        
        if (!response.ok) {
          throw new Error('Error al cargar items');
        }
        
        const data = await response.json();
        setItems(data);
        setError('');
      } catch (err) {
        console.error('Error:', err);
        setError('Error al cargar los equipos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    if (selectedDepartamento) {
      fetchItems();
    }
  }, [selectedDepartamento]);
  
  const handleDepartamentoChange = (e) => {
    setSelectedDepartamento(e.target.value);
  };
  
  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'Disponible':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
      case 'Agotado':
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'En mantenimiento':
        return 'bg-amber-100 text-amber-800 border border-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };
  
  const handleDeleteClick = (itemId) => {
    setConfirmDelete(itemId);
  };
  
  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/items/${confirmDelete}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar el equipo');
      }
      
      if (data.status === 'soft_delete') {
        // Si fue una eliminación suave, no eliminamos el ítem del estado
        // sino que actualizamos su estado a "Agotado" y cantidad a 0
        setItems(items.map(item => 
          item.id === confirmDelete 
            ? { ...item, estado: 'Agotado', cantidad_disponible: 0 } 
            : item
        ));
        
        setSuccess('Equipo marcado como agotado. Se mantiene para referencias históricas.');
      } else {
        // Si fue una eliminación completa, quitamos el ítem del estado
        setItems(items.filter(item => item.id !== confirmDelete));
        setSuccess('Equipo eliminado correctamente');
      }
      
      // Limpiar el mensaje después de 3 segundos
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
      
      // Limpiar el mensaje después de 3 segundos
      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setLoading(false);
      setConfirmDelete(null);
    }
  };
  
  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };
  
  // Filtrar items por búsqueda
  const filteredItems = items.filter(item => 
    item.nombre.toLowerCase().includes(searchQuery) || 
    item.descripcion.toLowerCase().includes(searchQuery)
  );
  
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
      </div>
    );
  }
  
  if (status === "unauthenticated") {
    return null; // El useEffect ya redirige
  }
  
  if (!session || session.user.role !== 'admin') {
    return null; // El useEffect ya redirige
  }
  
  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header section */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl sm:truncate">
              Inventario
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Gestiona equipos y materiales disponibles por departamento
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Link
              href="/dashboard/admin/informes"
              className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm border border-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 transition-colors duration-200 mr-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Informes
            </Link>
            <Link
              href="/dashboard/admin/nuevo-item"
              className="inline-flex items-center rounded-md bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Equipo
            </Link>
          </div>
        </div>
        
        {/* Status messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm transition-all duration-300 ease-in-out">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-sm transition-all duration-300 ease-in-out">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{success}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Filters section */}
        <div className="bg-white shadow-sm rounded-lg mb-8 overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="departamento" className="block text-base font-bold text-gray-800 mb-2">
                  Seleccionar Departamento
                </label>
                <div className="relative">
                  <select
                    id="departamento"
                    name="departamento"
                    className="mt-1 block w-full pl-3 pr-10 py-3 text-lg font-medium border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 rounded-lg shadow-sm"
                    value={selectedDepartamento}
                    onChange={handleDepartamentoChange}
                    disabled={loading}
                  >
                    <option value="">Seleccionar departamento</option>
                    {departamentos.map((departamento) => (
                      <option key={departamento.id} value={departamento.id} className="text-lg font-medium">
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
              </div>
              
              <div>
                <label htmlFor="search" className="block text-base font-bold text-gray-800 mb-2">
                  Buscar Equipo
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    className="focus:ring-green-500 focus:border-green-500 block w-full pl-12 pr-4 py-3 text-lg border-gray-300 rounded-lg bg-white"
                    placeholder="Buscar por nombre o descripción..."
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modal de confirmación de eliminación */}
        {confirmDelete && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Eliminar equipo
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          ¿Estás seguro de que deseas eliminar este equipo? Esta acción no se puede deshacer.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleDeleteConfirm}
                  >
                    Eliminar
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleCancelDelete}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Inventory content */}
        {loading && !items.length ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700 mb-4"></div>
            <p className="text-gray-500">Cargando inventario...</p>
          </div>
        ) : selectedDepartamento && filteredItems.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-12 sm:px-6 text-center">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="mt-4 text-lg leading-6 font-medium text-gray-900">No hay equipos registrados</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500 mx-auto">
                <p>
                  {searchQuery 
                    ? 'No se encontraron equipos que coincidan con tu búsqueda.'
                    : 'Este departamento no tiene equipos registrados actualmente.'}
                </p>
              </div>
              <div className="mt-8">
                <Link
                  href="/dashboard/admin/nuevo-item"
                  className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar Equipo
                </Link>
              </div>
            </div>
          </div>
        ) : selectedDepartamento ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Nombre / Descripción
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Cantidad
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Disponibles
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{item.nombre}</div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">{item.descripcion}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoClass(item.estado)}`}>
                          {item.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                        {item.cantidad_total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 font-medium">{item.cantidad_disponible}</div>
                        {item.cantidad_total > 0 && (
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                            <div 
                              className="bg-green-600 h-1.5 rounded-full" 
                              style={{ width: `${(item.cantidad_disponible / item.cantidad_total) * 100}%` }}
                            ></div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          {item.estado !== 'Agotado' || item.cantidad_disponible > 0 ? (
                            <>
                              <Link 
                                href={`/dashboard/admin/inventario/editar/${item.id}`} 
                                className="text-green-600 hover:text-green-900 transition-colors duration-150 inline-flex items-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Editar
                              </Link>
                              <button 
                                className="text-red-600 hover:text-red-900 transition-colors duration-150 inline-flex items-center"
                                onClick={() => handleDeleteClick(item.id)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Eliminar
                              </button>
                            </>
                          ) : (
                            <span className="text-gray-400 italic">Equipo agotado (preservado por historial)</span>
                          )}
                        </div>
                        <div className="mt-1">
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-12 sm:px-6 text-center">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              <h3 className="mt-4 text-lg leading-6 font-medium text-gray-900">Selecciona un departamento</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500 mx-auto">
                <p>
                  Selecciona un departamento para ver los equipos disponibles.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}