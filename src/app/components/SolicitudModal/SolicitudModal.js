// src/components/SolicitudModal.js
'use client';
import { Fragment, useRef, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useRouter } from 'next/navigation';

export default function SolicitudModal({ isOpen, onClose, solicitud, onDelete }) {
  const cancelButtonRef = useRef(null);
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');
  
  // Resetear el estado de confirmación cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setConfirmDelete(false);
      setError('');
    }
  }, [isOpen]);
  
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
  
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError('');
      
      // Solo permitir eliminar solicitudes pendientes
      if (solicitud.estado !== 'Pendiente') {
        setError('Solo se pueden eliminar solicitudes en estado Pendiente');
        setIsDeleting(false);
        return;
      }
      
      console.log(`Intentando eliminar solicitud ID: ${solicitud.id}`);
      const response = await fetch(`/api/solicitudes/${solicitud.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar la solicitud');
      }
      
      const data = await response.json();
      console.log('Solicitud eliminada correctamente:', data);
      
      // Cerrar el modal y actualizar la lista de solicitudes
      onClose();
      if (onDelete) {
        onDelete(solicitud.id);
      } else {
        router.refresh();
      }
      
    } catch (err) {
      console.error('Error al eliminar solicitud:', err);
      setError(err.message);
    } finally {
      setIsDeleting(false);
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                {confirmDelete ? (
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                          Eliminar Solicitud
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            ¿Estás seguro de que deseas eliminar esta solicitud? Esta acción no se puede deshacer.
                          </p>
                          {error && (
                            <div className="mt-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                              {error}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Eliminando...' : 'Eliminar'}
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={() => setConfirmDelete(false)}
                        ref={cancelButtonRef}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Solicitud #{solicitud.id}
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                          Detalles de la solicitud
                        </p>
                      </div>
                      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getEstadoClass(solicitud.estado)}`}>
                        {solicitud.estado}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                      <dl className="sm:divide-y sm:divide-gray-200">
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Departamento</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            {solicitud.departamento_nombre}
                          </dd>
                        </div>
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Equipo</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            {solicitud.item_nombre}
                          </dd>
                        </div>
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Fecha de Uso</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            {formatDate(solicitud.fecha_uso)}
                          </dd>
                        </div>
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Horario</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            {formatTime(solicitud.hora_inicio)} - {formatTime(solicitud.hora_fin)}
                          </dd>
                        </div>
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Fecha de Solicitud</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            {formatDate(solicitud.fecha_solicitud)}
                          </dd>
                        </div>
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Motivo</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            {solicitud.motivo}
                          </dd>
                        </div>
                        {solicitud.comentarios && (
                          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Comentarios</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                              {solicitud.comentarios}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                    <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                      {solicitud.estado === 'Pendiente' && (
                        <button
                          type="button"
                          className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                          onClick={() => setConfirmDelete(true)}
                        >
                          Eliminar Solicitud
                        </button>
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
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}