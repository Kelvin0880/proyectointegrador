
// src/app/components/layout/Footer.js
export default function Footer() {
    return (
      <footer className="bg-green-800 text-white py-6 mt-auto">
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
    );
  }