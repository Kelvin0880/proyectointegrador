// src/app/dashboard/page.js
'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({
    pendientes: 0,
    aprobadas: 0,
    rechazadas: 0,
    finalizadas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Datos iniciales para mostrar mientras carga
        setStats({
          pendientes: 0,
          aprobadas: 0,
          rechazadas: 0,
          finalizadas: 0,
        });
        
        if (status === "authenticated") {
          // Esperar un poco para asegurar que la sesión se ha establecido completamente
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const response = await fetch('/api/solicitudes/stats', {
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include' // Importante para incluir las cookies de sesión
          });
          
          if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Error al cargar estadísticas: ${response.status} ${response.statusText} - ${errorData}`);
          }
          
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        setError('Error al cargar estadísticas. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    if (status === "authenticated") {
      fetchDashboardData();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, session]);
  
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
      </div>
    );
  }
  
  if (status === "unauthenticated") {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold text-gray-800">Acceso denegado</h2>
        <p className="text-gray-600 mt-4">Debes iniciar sesión para acceder a esta página.</p>
        <div className="mt-6">
          <Link 
            href="/auth/login" 
            className="px-6 py-3 bg-green-700 text-white font-medium rounded-md hover:bg-green-600 transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  // Verificar si el usuario es administrador
  const isAdmin = session?.user?.role === 'admin';
  
  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            ¡Bienvenido, {session?.user?.name || 'Usuario'}!
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Panel de control del Sistema de Inventario UNPHU
            {isAdmin && <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Administrador
            </span>}
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link
            href="/dashboard/nueva-solicitud"
            className="inline-flex items-center rounded-md bg-green-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
          >
            Nueva Solicitud
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      {/* Panel de administración */}
      {isAdmin && (
        <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-green-800 mb-3">Panel de Administración</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/dashboard/admin/solicitudes"
              className="flex items-center p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0 bg-green-100 rounded-md p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-900">Administrar Solicitudes</span>
                <span className="text-xs text-gray-500">Gestionar todas las peticiones</span>
              </div>
            </Link>
            
            <Link
              href="/dashboard/admin/inventario"
              className="flex items-center p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-900">Gestión de Inventario</span>
                <span className="text-xs text-gray-500">Administrar equipos</span>
              </div>
            </Link>
            
            <Link
              href="/dashboard/admin/nuevo-item"
              className="flex items-center p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-900">Nuevo Equipo</span>
                <span className="text-xs text-gray-500">Añadir equipos al inventario</span>
              </div>
            </Link>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Solicitudes Pendientes</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stats.pendientes}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <Link href="/dashboard/solicitudes?estado=Pendiente" className="text-sm text-green-700 font-medium hover:text-green-900">
                  Ver todas
                </Link>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Solicitudes Aprobadas</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stats.aprobadas}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <Link href="/dashboard/solicitudes?estado=Aprobada" className="text-sm text-green-700 font-medium hover:text-green-900">
                  Ver todas
                </Link>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Solicitudes Rechazadas</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stats.rechazadas}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <Link href="/dashboard/solicitudes?estado=Rechazada" className="text-sm text-green-700 font-medium hover:text-green-900">
                  Ver todas
                </Link>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gray-100 rounded-md p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Solicitudes Finalizadas</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stats.finalizadas}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <Link href="/dashboard/solicitudes?estado=Finalizada" className="text-sm text-green-700 font-medium hover:text-green-900">
                  Ver todas
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Guía Rápida</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Como utilizar el sistema de inventario
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">1. Solicitar un equipo</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    Dirígete a "Nueva Solicitud", selecciona el departamento, el equipo, la fecha y el motivo de uso.
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">2. Revisar estado</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    Ve a "Mis Solicitudes" para ver el estado de tus solicitudes pendientes y el historial.
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">3. Equipos disponibles</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    Puedes consultar la disponibilidad de equipos antes de hacer tu solicitud.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </>
      )}
    </div>
  );
}