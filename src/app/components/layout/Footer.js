// src/app/components/layout/Footer.js
'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-green-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h2 className="text-lg font-bold">UNPHU - Sistema de Inventario</h2>
            <p className="mt-1 text-sm text-green-100">
              © {new Date().getFullYear()} Universidad Nacional Pedro Henríquez Ureña
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-2">Enlaces Rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/dashboard" className="text-sm text-green-100 hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/solicitudes" className="text-sm text-green-100 hover:text-white transition-colors">
                    Mis Solicitudes
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/nueva-solicitud" className="text-sm text-green-100 hover:text-white transition-colors">
                    Nueva Solicitud
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-2">Soporte</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-green-100 hover:text-white transition-colors">
                    Ayuda
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-green-100 hover:text-white transition-colors">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}