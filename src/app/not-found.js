import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-green-50">
      <div className="text-center py-10 px-6">
        <h1 className="text-9xl font-bold text-green-700">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mt-4">Página no encontrada</h2>
        <p className="text-gray-600 mt-4 mb-8">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <div className="mt-6">
          <Link 
            href="/" 
            className="px-6 py-3 bg-green-700 text-white font-medium rounded-md hover:bg-green-600 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}