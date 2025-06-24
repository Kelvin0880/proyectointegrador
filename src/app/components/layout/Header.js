// src/app/components/layout/Header.js
'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAdmin = session?.user?.role === 'admin';
  
  // Cerrar menú móvil cuando cambia la ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (path) => {
    return pathname === path
      ? 'bg-green-800 text-white'
      : 'text-white hover:bg-green-800 hover:text-white';
  };

  return (
    <header className="bg-green-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y navegación principal */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <div className="h-10 w-10 flex items-center justify-center bg-white rounded-full overflow-hidden shadow-sm">
                  <Image
                    src="/next.svg"
                    alt="Logo UNPHU"
                    width={32}
                    height={32}
                    priority
                    className="object-contain"
                  />
                </div>
                <span className="ml-2 text-white font-semibold text-lg hidden sm:block">
                  UNPHU Inventario
                </span>
              </Link>
            </div>
            
            {/* Navegación de escritorio */}
            <nav className="hidden md:ml-6 md:flex md:items-center">
              {session && (
                <>
                  <Link
                    href="/dashboard"
                    className={`mx-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${isActive('/dashboard')}`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/solicitudes"
                    className={`mx-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${isActive('/dashboard/solicitudes')}`}
                  >
                    Mis Solicitudes
                  </Link>
                  <Link
                    href="/dashboard/nueva-solicitud"
                    className={`mx-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${isActive('/dashboard/nueva-solicitud')}`}
                  >
                    Nueva Solicitud
                  </Link>
                  {isAdmin && (
                    <>
                      <Link
                        href="/dashboard/admin/solicitudes"
                        className={`mx-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${isActive('/dashboard/admin/solicitudes')}`}
                      >
                        Gestión Solicitudes
                      </Link>
                      <Link
                        href="/dashboard/admin/inventario"
                        className={`mx-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${isActive('/dashboard/admin/inventario')}`}
                      >
                        Inventario
                      </Link>
                      <Link
                        href="/dashboard/admin/nuevo-item"
                        className={`mx-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${isActive('/dashboard/admin/nuevo-item')}`}
                      >
                        Nuevo Equipo
                      </Link>
                    </>
                  )}
                </>
              )}
            </nav>
          </div>
          
          {/* Opciones de usuario */}
          <div className="flex items-center">
            {session ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-medium text-white">{session.user.name}</span>
                  <span className="text-xs text-green-100 opacity-80">{session.user.matricula}</span>
                </div>
                
                {isAdmin && (
                  <span className="hidden md:inline-flex bg-white text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                    Admin
                  </span>
                )}
                
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-white py-1.5 px-3 text-sm font-medium text-green-700 shadow-sm hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-white py-1.5 px-3 text-sm font-medium text-green-700 shadow-sm hover:bg-green-50 transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center rounded-md border border-white py-1.5 px-3 text-sm font-medium text-white hover:bg-green-600 transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}
            
            {/* Botón de menú móvil */}
            <div className="flex md:hidden ml-3">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">{mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}</span>
                {mobileMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Menú móvil */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden absolute w-full bg-green-800 shadow-lg`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {session && (
            <>
              <div className="px-3 py-2 text-white flex items-center justify-between border-b border-green-600 mb-2 pb-2">
                <div>
                  <div className="font-medium">{session.user.name}</div>
                  <div className="text-xs text-green-200">{session.user.matricula}</div>
                </div>
                {isAdmin && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white text-green-800">
                    Admin
                  </span>
                )}
              </div>
              <Link
                href="/dashboard"
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard')}`}
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/solicitudes"
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard/solicitudes')}`}
              >
                Mis Solicitudes
              </Link>
              <Link
                href="/dashboard/nueva-solicitud"
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard/nueva-solicitud')}`}
              >
                Nueva Solicitud
              </Link>
              
              {isAdmin && (
                <>
                  <div className="pt-2 mt-2 border-t border-green-600">
                    <div className="px-3 py-1 text-xs font-semibold text-green-200 uppercase tracking-wider">
                      Administración
                    </div>
                  </div>
                  <Link
                    href="/dashboard/admin/solicitudes"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard/admin/solicitudes')}`}
                  >
                    Gestión Solicitudes
                  </Link>
                  <Link
                    href="/dashboard/admin/inventario"
                    className={`block px-3 py-2 rounded-md textbase font-medium ${isActive('/dashboard/admin/inventario')}`}
                  >
                    Inventario
                  </Link>
                  <Link
                    href="/dashboard/admin/nuevo-item"
                    className={`block px-3 py-2 rounded-md textbase font-medium ${isActive('/dashboard/admin/nuevo-item')}`}
                  >
                    Nuevo Equipo
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}