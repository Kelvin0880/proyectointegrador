'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function SessionDebug() {
  const { data: session, status } = useSession();
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div className="p-4 mb-4 bg-gray-100 rounded-lg">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Información de sesión</h3>
        <button
          onClick={toggleDetails}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {showDetails ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
      
      {showDetails && (
        <div className="mt-3">
          <div className="mb-2">
            <strong>Estado:</strong> {status}
          </div>
          
          {session ? (
            <div>
              <div className="mb-2">
                <strong>Usuario:</strong> {session.user?.name}
              </div>
              <div className="mb-2">
                <strong>Email:</strong> {session.user?.email}
              </div>
              <div className="mb-2">
                <strong>Matrícula:</strong> {session.user?.matricula}
              </div>
              <div className="mb-2">
                <strong>Rol:</strong> {session.user?.role}
              </div>
              <pre className="bg-gray-200 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-red-500">
              No hay sesión activa. Por favor, inicia sesión.
            </div>
          )}
        </div>
      )}
    </div>
  );
}