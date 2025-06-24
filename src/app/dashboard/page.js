// src/app/dashboard/page.js
'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
          await new Promise(resolve => setTimeout(resolve, 300));
          
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
      </div>
    );
  }
  
  if (status === "unauthenticated") {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso denegado</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Debes iniciar sesión para acceder al sistema de inventario y solicitudes.
        </p>
        <Link 
          href="/auth/login" 
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  // Verificar si el usuario es administrador
  const isAdmin = session?.user?.role === 'admin';
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-6 bg-gradient-to-r from-green-50 to-green-100 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="mt-1 text-sm md:text-base text-gray-600">
              Bienvenido al sistema de inventario y préstamo de equipos
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href="/dashboard/nueva-solicitud"
              className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors shadow"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Nueva Solicitud
            </Link>
          </div>
        </div>
      </div>
      
      {/* Contenido */}
      <div className="px-6 py-6">
        {/* Mensaje de error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
            <svg className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p>{error}</p>
          </div>
        )}
        
        {/* Panel de administración */}
        {isAdmin && (
          <div className="mb-10 bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6 border border-red-200 shadow-sm">
            <h2 className="text-xl font-bold text-red-800 mb-5 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Panel de Administración
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <Link href="/dashboard/admin/solicitudes" className="group">
                <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm transition duration-150 ease-in-out transform hover:-translate-y-1 hover:shadow group-hover:border-red-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-100 rounded-lg p-3 group-hover:bg-red-200 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-red-700 transition-colors">Gestionar Solicitudes</h3>
                      <p className="text-sm text-gray-600">Administra todas las solicitudes de equipos</p>
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link href="/dashboard/admin/inventario" className="group">
                <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm transition duration-150 ease-in-out transform hover:-translate-y-1 hover:shadow group-hover:border-red-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-100 rounded-lg p-3 group-hover:bg-red-200 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-red-700 transition-colors">Inventario</h3>
                      <p className="text-sm text-gray-600">Gestiona los equipos disponibles</p>
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link href="/dashboard/admin/nuevo-item" className="group">
                <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm transition duration-150 ease-in-out transform hover:-translate-y-1 hover:shadow group-hover:border-red-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-100 rounded-lg p-3 group-hover:bg-red-200 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-red-700 transition-colors">Nuevo Equipo</h3>
                      <p className="text-sm text-gray-600">Añade equipos al inventario</p>
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link href="/dashboard/admin/informes" className="group">
                <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm transition duration-150 ease-in-out transform hover:-translate-y-1 hover:shadow group-hover:border-red-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-100 rounded-lg p-3 group-hover:bg-red-200 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-red-700 transition-colors">Informes</h3>
                      <p className="text-sm text-gray-600">Genera reportes y estadísticas</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}
        
        {/* Indicadores de estado */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg p-6 h-40"></div>
            ))}
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen de Solicitudes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Pendientes */}
              <div className="bg-white overflow-hidden shadow rounded-lg border border-yellow-100">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-full p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Solicitudes Pendientes</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-bold text-gray-900">{stats.pendientes}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <Link href="/dashboard/solicitudes?estado=Pendiente" className="text-sm text-yellow-700 font-medium hover:text-yellow-900 transition-colors">
                    Ver solicitudes
                  </Link>
                </div>
              </div>

              {/* Aprobadas */}
              <div className="bg-white overflow-hidden shadow rounded-lg border border-green-100">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Solicitudes Aprobadas</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-bold text-gray-900">{stats.aprobadas}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <Link href="/dashboard/solicitudes?estado=Aprobada" className="text-sm text-green-700 font-medium hover:text-green-900 transition-colors">
                    Ver solicitudes
                  </Link>
                </div>
              </div>

              {/* Rechazadas */}
              <div className="bg-white overflow-hidden shadow rounded-lg border border-red-100">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Solicitudes Rechazadas</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-bold text-gray-900">{stats.rechazadas}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <Link href="/dashboard/solicitudes?estado=Rechazada" className="text-sm text-red-700 font-medium hover:text-red-900 transition-colors">
                    Ver solicitudes
                  </Link>
                </div>
              </div>

              {/* Finalizadas */}
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gray-100 rounded-full p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Solicitudes Finalizadas</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-bold text-gray-900">{stats.finalizadas}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <Link href="/dashboard/solicitudes?estado=Finalizada" className="text-sm text-gray-700 font-medium hover:text-gray-900 transition-colors">
                    Ver solicitudes
                  </Link>
                </div>
              </div>
            </div>

            {/* Guía rápida */}
            <div className="mt-10">
              <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-bold text-gray-900 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Guía Rápida
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-600">
                    Cómo utilizar el sistema de inventario
                  </p>
                </div>
                <div className="border-t border-gray-200">
                  <dl>
                    <div className="bg-white px-6 py-5 grid grid-cols-1 md:grid-cols-6 gap-4">
                      <dt className="text-sm font-medium text-gray-900 md:col-span-1 flex items-center">
                        <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-700 text-lg font-semibold mr-3">
                          1
                        </span>
                        Solicitar equipo
                      </dt>
                      <dd className="mt-1 text-sm text-gray-600 md:col-span-5 md:mt-0 flex items-center">
                        Dirígete a "Nueva Solicitud", selecciona el departamento, el equipo, la fecha y el motivo de uso.
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-6 py-5 grid grid-cols-1 md:grid-cols-6 gap-4">
                      <dt className="text-sm font-medium text-gray-900 md:col-span-1 flex items-center">
                        <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-700 text-lg font-semibold mr-3">
                          2
                        </span>
                        Revisar estado
                      </dt>
                      <dd className="mt-1 text-sm text-gray-600 md:col-span-5 md:mt-0 flex items-center">
                        Ve a "Mis Solicitudes" para ver el estado de tus solicitudes pendientes y el historial de préstamos.
                      </dd>
                    </div>
                    <div className="bg-white px-6 py-5 grid grid-cols-1 md:grid-cols-6 gap-4">
                      <dt className="text-sm font-medium text-gray-900 md:col-span-1 flex items-center">
                        <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-700 text-lg font-semibold mr-3">
                          3
                        </span>
                        Equipos disponibles
                      </dt>
                      <dd className="mt-1 text-sm text-gray-600 md:col-span-5 md:mt-0 flex items-center">
                        Puedes consultar la disponibilidad de equipos antes de hacer tu solicitud.
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}