'use client';
import { Fragment, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useRouter } from 'next/navigation';

export default function AdminSolicitudModal({ isOpen, onClose, solicitud, onUpdateSuccess }) {
  const cancelButtonRef = useRef(null);
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [comentarios, setComentarios] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Asegurarse de que los comentarios se inicialicen con los de la solicitud
  useState(() => {
    if (solicitud?.comentarios) {
      setComentarios(solicitud.comentarios);
    }
  }, [solicitud]);
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  const formatTime = (timeString) => {
    return timeString?.substring(0, 5) || ''; // HH:MM format
  };
  
  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'Aprobada':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'Rechazada':
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'Finalizada':
        return 'bg-gray-100 text-gray-800 border border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };
  
  const handleUpdateEstado = async (nuevoEstado) => {
    try {
      setIsUpdating(true);
      setError('');
      setSuccess('');
      
      const response = await fetch(`/api/solicitudes/${solicitud.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: nuevoEstado,
          comentarios,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Error al ${nuevoEstado === 'Aprobada' ? 'aprobar' : nuevoEstado === 'Rechazada' ? 'rechazar' : 'finalizar'} la solicitud`);
      }
      
      setSuccess(`Solicitud ${nuevoEstado === 'Aprobada' ? 'aprobada' : nuevoEstado === 'Rechazada' ? 'rechazada' : 'finalizada'} correctamente`);
      
      // Esperar un momento antes de cerrar el modal
      setTimeout(() => {
        if (onUpdateSuccess) {
          onUpdateSuccess(solicitud.id, nuevoEstado, comentarios);
        }
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (!solicitud) return null;
  
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={onClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                      <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900 flex justify-between items-center">
                        <span>Solicitud #{solicitud.id}</span>
                        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getEstadoClass(solicitud.estado)}`}>
                          {solicitud.estado}
                        </span>
                      </Dialog.Title>
                      
                      {error && (
                        <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                          {error}
                        </div>
                      )}
                      
                      {success && (
                        <div className="mt-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
                          {success}
                        </div>
                      )}
                      
                      <div className="mt-6 border-t border-gray-200 pt-5">
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Usuario</dt>
                            <dd className="mt-1 text-base font-medium text-gray-900">
                              {solicitud.usuario_nombre} {solicitud.usuario_apellido}
                            </dd>
                            <dd className="text-sm text-gray-600">{solicitud.matricula}</dd>
                          </div>
                          
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Departamento</dt>
                            <dd className="mt-1 text-base font-medium text-gray-900">{solicitud.departamento_nombre}</dd>
                          </div>
                          
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Equipo</dt>
                            <dd className="mt-1 text-base font-medium text-gray-900">{solicitud.item_nombre}</dd>
                          </div>
                          
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Fecha de Uso</dt>
                            <dd className="mt-1 text-base font-medium text-gray-900">{formatDate(solicitud.fecha_uso)}</dd>
                            <dd className="text-sm text-gray-600">
                              {formatTime(solicitud.hora_inicio)} - {formatTime(solicitud.hora_fin)}
                            </dd>
                          </div>
                          
                          <div className="col-span-full">
                            <dt className="text-sm font-medium text-gray-500">Motivo</dt>
                            <dd className="mt-1 text-base text-gray-900">{solicitud.motivo}</dd>
                          </div>
                        </dl>
                      </div>
                      
                      <div className="mt-6 border-t border-gray-200 pt-5">
                        <label htmlFor="comentarios" className="block text-sm font-medium text-gray-700">
                          Comentarios (opcional)
                        </label>
                        <div className="mt-1">
                          <textarea
                            rows={4}
                            name="comentarios"
                            id="comentarios"
                            value={comentarios}
                            onChange={(e) => setComentarios(e.target.value)}
                            className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Añade comentarios para el usuario..."
                            disabled={isUpdating || solicitud.estado === 'Finalizada' || solicitud.estado === 'Rechazada'}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  {solicitud.estado === 'Pendiente' && (
                    <>
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
                        onClick={() => handleUpdateEstado('Aprobada')}
                        disabled={isUpdating}
                      >
                        {isUpdating ? 'Procesando...' : 'Aprobar Solicitud'}
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:mt-0 sm:w-auto"
                        onClick={() => handleUpdateEstado('Rechazada')}
                        disabled={isUpdating}
                      >
                        {isUpdating ? 'Procesando...' : 'Rechazar Solicitud'}
                      </button>
                    </>
                  )}
                  
                  {solicitud.estado === 'Aprobada' && (
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 sm:ml-3 sm:w-auto"
                      onClick={() => handleUpdateEstado('Finalizada')}
                      disabled={isUpdating}
                    >
                      {isUpdating ? 'Procesando...' : 'Marcar como Finalizada'}
                    </button>
                  )}
                  
                  {(solicitud.estado === 'Rechazada' || solicitud.estado === 'Finalizada') && (
                    <p className="mt-2 text-sm text-gray-500 px-3">
                      Esta solicitud ya está {solicitud.estado.toLowerCase()} y no se puede modificar.
                    </p>
                  )}
                  
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={onClose}
                    ref={cancelButtonRef}
                  >
                    Cerrar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}