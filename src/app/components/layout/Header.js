// src/app/components/layout/Header.js
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return pathname === path ? 'bg-green-800 text-white' : 'text-white hover:bg-green-800 hover:text-white';
  };

  const isAdmin = session?.user?.role === 'admin';

  return (
    <header className="bg-green-700 shadow-md">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:max-w-screen-xl 2xl:max-w-screen-2xl" aria-label="Top">
        <div className="flex w-full items-center justify-between border-b border-green-500 py-4 lg:border-none">
          <div className="flex items-center">
            <Link href={session ? '/dashboard' : '/'} className="text-white font-bold text-xl">
              UNPHU Inventario
            </Link>
            
            {/* Navegación para escritorio */}
            {session && (
              <div className="ml-10 hidden space-x-8 lg:block">
                <Link href="/dashboard" className={`rounded-md px-3 py-2 text-sm font-medium ${isActive('/dashboard')}`}>
                  Inicio
                </Link>
                <Link href="/dashboard/solicitudes" className={`rounded-md px-3 py-2 text-sm font-medium ${isActive('/dashboard/solicitudes')}`}>
                  Mis Solicitudes
                </Link>
                <Link href="/dashboard/nueva-solicitud" className={`rounded-md px-3 py-2 text-sm font-medium ${isActive('/dashboard/nueva-solicitud')}`}>
                  Nueva Solicitud
                </Link>
                {isAdmin && (
                  <>
                    <Link href="/dashboard/admin/solicitudes" className={`rounded-md px-3 py-2 text-sm font-medium ${isActive('/dashboard/admin/solicitudes')}`}>
                      Gestionar Solicitudes
                    </Link>
                    <Link href="/dashboard/admin/inventario" className={`rounded-md px-3 py-2 text-sm font-medium ${isActive('/dashboard/admin/inventario')}`}>
                      Inventario
                    </Link>
                    <Link href="/dashboard/admin/nuevo-item" className={`rounded-md px-3 py-2 text-sm font-medium ${isActive('/dashboard/admin/nuevo-item')}`}>
                      Nuevo Equipo
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="ml-10 space-x-4">
            {session ? (
              <div className="flex items-center">
                <span className="hidden md:inline-block text-white mr-4">
                  {session.user.name} 
                  {isAdmin && <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white">
                    Admin
                  </span>}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="inline-block rounded-md border border-transparent bg-white py-2 px-4 text-base font-medium text-green-700 hover:bg-gray-100"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="inline-block rounded-md border border-transparent bg-white py-2 px-4 text-base font-medium text-green-700 hover:bg-gray-100"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-block rounded-md border border-white py-2 px-4 text-base font-medium text-white hover:bg-green-600"
                >
                  Registrarse
                </Link>
              </>
            )}
            
            {/* Botón de menú móvil */}
            <div className="lg:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Abrir menú principal</span>
                {/* Icono de menú */}
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Menú móvil */}
        {mobileMenuOpen && session && (
          <div className="lg:hidden py-2 space-y-1">
            <Link
              href="/dashboard"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard')}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              href="/dashboard/solicitudes"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard/solicitudes')}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Mis Solicitudes
            </Link>
            <Link
              href="/dashboard/nueva-solicitud"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard/nueva-solicitud')}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Nueva Solicitud
            </Link>
            {isAdmin && (
              <>
                <Link
                  href="/dashboard/admin/solicitudes"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard/admin/solicitudes')}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Gestionar Solicitudes
                </Link>
                <Link
                  href="/dashboard/admin/inventario"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard/admin/inventario')}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Inventario
                </Link>
                <Link
                  href="/dashboard/admin/nuevo-item"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard/admin/nuevo-item')}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Nuevo Equipo
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}