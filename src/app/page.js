// src/app/page.js
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Barra de navegación */}
      <nav className="bg-green-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:max-w-screen-xl 2xl:max-w-screen-2xl">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                {/* Logo de la UNPHU (puedes reemplazarlo con la imagen real) */}
                <span className="font-bold text-xl">UNPHU Inventario</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth/login" 
                className="px-4 py-2 rounded-md bg-white text-green-700 font-medium hover:bg-gray-100 transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link 
                href="/auth/register" 
                className="px-4 py-2 rounded-md bg-green-600 text-white font-medium hover:bg-green-500 transition-colors"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-green-50 flex-grow">
        <div className="max-w-7xl mx-auto text-center xl:max-w-screen-xl 2xl:max-w-screen-2xl">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Sistema de Inventario UNPHU
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Gestiona de manera eficiente el inventario de equipos tecnológicos y audiovisuales de la universidad.
          </p>
          <div className="flex justify-center space-x-6">
            <Link
              href="/auth/login"
              className="px-6 py-3 rounded-md bg-green-700 text-white font-medium hover:bg-green-600 transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/auth/register"
              className="px-6 py-3 rounded-md bg-white text-green-700 border border-green-700 font-medium hover:bg-green-50 transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto xl:max-w-screen-xl 2xl:max-w-screen-2xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Características del Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg shadow-md border border-gray-100">
              <div className="h-12 w-12 bg-green-100 rounded-md flex items-center justify-center text-green-700 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestión de Inventario</h3>
              <p className="text-gray-600">
                Control completo de los equipos disponibles en los departamentos de Audiovisual y Tecnología.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md border border-gray-100">
              <div className="h-12 w-12 bg-green-100 rounded-md flex items-center justify-center text-green-700 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Solicitudes de Préstamo</h3>
              <p className="text-gray-600">
                Solicita equipos de forma fácil y rápida especificando fechas, horas y motivo de uso.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md border border-gray-100">
              <div className="h-12 w-12 bg-green-100 rounded-md flex items-center justify-center text-green-700 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aprobación de Solicitudes</h3>
              <p className="text-gray-600">
                Sistema de aprobación para administradores con seguimiento del estado de cada solicitud.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-800 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:max-w-screen-xl 2xl:max-w-screen-2xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-lg font-semibold">UNPHU - Sistema de Inventario</p>
              <p className="text-sm text-green-200">© {new Date().getFullYear()} Todos los derechos reservados</p>
            </div>
            <div>
              <p className="text-sm text-green-200">Universidad Nacional Pedro Henríquez Ureña</p>
              <p className="text-sm text-green-200">República Dominicana</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}