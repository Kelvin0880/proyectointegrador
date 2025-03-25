// src/app/dashboard/solicitudes/page.js
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import SolicitudModal from '../../components/SolicitudModal/SolicitudModal';

export default function Solicitudes() {
  const searchParams = useSearchParams();
  const estadoFilter = searchParams.get('estado') || '';
  
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para el modal
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        setLoading(true);
        let url = '/api/solicitudes';
        if (estadoFilter) {
          url += `?estado=${estadoFilter}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Error al cargar solicitudes');
        }
        
        const data = await response.json();
        setSolicitudes(data);
        setError('');
      } catch (err) {
        console.error('Error:', err);
        setError('Error al cargar las solicitudes. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSolicitudes();
  }, [estadoFilter]);
  
  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Aprobada':
        return 'bg-green-100 text-green-800';
      case 'Rechazada':
        return 'bg-red-100 text-red-800';
      case 'Finalizada':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  const formatTime = (timeString) => {
    return timeString.substring(0, 5); // HH:MM format
  };
  
  const handleOpenModal = async (solicitudId) => {
    try {
      console.log("Abriendo modal para solicitud ID:", solicitudId);
      setLoading(true);
      const response = await fetch(`/api/solicitudes/${solicitudId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Solicitud no encontrada');
        } else {
          throw new Error(`Error al cargar la solicitud: ${response.status}`);
        }
      }
      
      const data = await response.json();
      console.log("Datos de solicitud recibidos:", data);
      setSelectedSolicitud(data);
      setIsModalOpen(true);
      setError('');
    } catch (err) {
      console.error('Error al cargar detalles de solicitud:', err);
      setError(`Error al cargar los detalles de la solicitud: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Esperar a que se complete la animación antes de limpiar los datos
    setTimeout(() => {
      setSelectedSolicitud(null);
    }, 300);
  };
  
  const handleDeleteSolicitud = (solicitudId) => {
    // Actualizar el estado local eliminando la solicitud
    setSolicitudes(solicitudes.filter(solicitud => solicitud.id !== solicitudId));
  };
  
  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl sm:truncate">
              Mis Solicitudes
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Gestiona tus solicitudes de equipos
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Link
              href="/dashboard/nueva-solicitud"
              className="ml-3 inline-flex items-center rounded-md bg-green-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            >
              Nueva Solicitud
            </Link>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm">
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
        
        <div className="bg-white shadow-sm rounded-lg mb-8 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              <Link
                href="/dashboard/solicitudes"
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-base ${
                  !estadoFilter
                    ? 'border-green-700 text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Todas
              </Link>
              <Link
                href="/dashboard/solicitudes?estado=Pendiente"
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-base ${
                  estadoFilter === 'Pendiente'
                    ? 'border-green-700 text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pendientes
              </Link>
              <Link
                href="/dashboard/solicitudes?estado=Aprobada"
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-base ${
                  estadoFilter === 'Aprobada'
                    ? 'border-green-700 text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Aprobadas
              </Link>
              <Link
                href="/dashboard/solicitudes?estado=Rechazada"
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-base ${
                  estadoFilter === 'Rechazada'
                    ? 'border-green-700 text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Rechazadas
              </Link>
              <Link
                href="/dashboard/solicitudes?estado=Finalizada"
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-base ${
                  estadoFilter === 'Finalizada'
                    ? 'border-green-700 text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Finalizadas
              </Link>
            </nav>
          </div>
        </div>
        
        {loading && !solicitudes.length ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700 mb-4"></div>
            <p className="text-gray-500">Cargando solicitudes...</p>
          </div>
        ) : error && !solicitudes.length ? (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-12 sm:px-6 text-center">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg leading-6 font-medium text-gray-900">No hay solicitudes</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500 mx-auto">
                <p>
                  {estadoFilter
                    ? `No tienes solicitudes con estado "${estadoFilter}".`
                    : 'No has realizado ninguna solicitud todavía.'}
                </p>
              </div>
              <div className="mt-8">
                <Link
                  href="/dashboard/nueva-solicitud"
                  className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 transition-colors duration-200"
                >
                  Crear nueva solicitud
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Departamento / Item
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Fecha de Uso
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Fecha de Solicitud
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {solicitudes.map((solicitud) => (
                    <tr key={solicitud.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{solicitud.departamento_nombre}</div>
                        <div className="text-sm text-gray-500">{solicitud.item_nombre}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(solicitud.fecha_uso)}</div>
                        <div className="text-sm text-gray-500">
                          {formatTime(solicitud.hora_inicio)} - {formatTime(solicitud.hora_fin)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoClass(solicitud.estado)}`}>
                          {solicitud.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(solicitud.fecha_solicitud)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleOpenModal(solicitud.id)} 
                          className="text-green-600 hover:text-green-900 font-medium"
                        >
                          Ver detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de detalles de solicitud */}
      {/* Pasar el onDelete para actualizar la lista tras eliminar */}
      <SolicitudModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        solicitud={selectedSolicitud}
        onDelete={handleDeleteSolicitud}
      />
    </div>
  );
}