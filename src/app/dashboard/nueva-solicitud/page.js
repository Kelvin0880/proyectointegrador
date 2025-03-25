'use client';
// src/app/dashboard/nueva-solicitud/page.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NuevaSolicitud() {
  const router = useRouter();
  
  const [departamentos, setDepartamentos] = useState([]);
  const [items, setItems] = useState([]);
  const [loadingDepartamentos, setLoadingDepartamentos] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    departamento_id: '',
    item_id: '',
    fecha_uso: '',
    hora_inicio: '',
    hora_fin: '',
    motivo: '',
  });
  
  // Cargar departamentos al iniciar
  useEffect(() => {
    const fetchDepartamentos = async () => {
      try {
        setLoadingDepartamentos(true);
        const response = await fetch('/api/departamentos');
        
        if (!response.ok) {
          throw new Error('Error al cargar departamentos');
        }
        
        const data = await response.json();
        setDepartamentos(data);
        setError('');
      } catch (err) {
        console.error('Error:', err);
        setError('Error al cargar los departamentos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoadingDepartamentos(false);
      }
    };
    
    fetchDepartamentos();
  }, []);
  
  // Cargar items cuando se selecciona un departamento
  useEffect(() => {
    const fetchItems = async () => {
      if (!formData.departamento_id) {
        setItems([]);
        return;
      }
      
      try {
        setLoadingItems(true);
        const response = await fetch(`/api/items?departamento_id=${formData.departamento_id}`);
        
        if (!response.ok) {
          throw new Error('Error al cargar items');
        }
        
        const data = await response.json();
        // Filtrar solo items disponibles
        const itemsDisponibles = data.filter(item => 
          item.cantidad_disponible > 0 && item.estado === 'Disponible'
        );
        setItems(itemsDisponibles);
        setError('');
      } catch (err) {
        console.error('Error:', err);
        setError('Error al cargar los equipos disponibles. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoadingItems(false);
      }
    };
    
    if (formData.departamento_id) {
      fetchItems();
    }
  }, [formData.departamento_id]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.departamento_id || !formData.item_id || !formData.fecha_uso || 
        !formData.hora_inicio || !formData.hora_fin || !formData.motivo) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    // Validar que la fecha no sea anterior a hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(formData.fecha_uso);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setError('La fecha de uso no puede ser anterior a hoy');
      return;
    }
    
    // Validar que la hora de fin sea posterior a la hora de inicio
    if (formData.hora_inicio >= formData.hora_fin) {
      setError('La hora de fin debe ser posterior a la hora de inicio');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      
      const response = await fetch('/api/solicitudes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_id: formData.item_id,
          fecha_uso: formData.fecha_uso,
          hora_inicio: formData.hora_inicio,
          hora_fin: formData.hora_fin,
          motivo: formData.motivo,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la solicitud');
      }
      
      setSuccess('Solicitud creada correctamente');
      
      // Resetear formulario
      setFormData({
        departamento_id: '',
        item_id: '',
        fecha_uso: '',
        hora_inicio: '',
        hora_fin: '',
        motivo: '',
      });
      
      // Redirigir después de un momento
      setTimeout(() => {
        router.push('/dashboard/solicitudes');
      }, 2000);
      
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Nueva Solicitud
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Completa el formulario para solicitar un equipo
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link
            href="/dashboard/solicitudes"
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Cancelar
          </Link>
        </div>
      </div>
      
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">Selección de Equipo</h3>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="departamento_id" className="block text-sm font-bold text-gray-900">
                    Departamento
                  </label>
                  <div className="mt-1">
                    <select
                      id="departamento_id"
                      name="departamento_id"
                      value={formData.departamento_id}
                      onChange={handleChange}
                      disabled={loadingDepartamentos || submitting}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm text-gray-900 font-medium"
                    >
                      <option value="" className="text-gray-800">Selecciona un departamento</option>
                      {departamentos.map((departamento) => (
                        <option key={departamento.id} value={departamento.id} className="text-gray-900">
                          {departamento.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  {loadingDepartamentos && <p className="mt-1 text-sm text-gray-500">Cargando departamentos...</p>}
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="item_id" className="block text-sm font-bold text-gray-900">
                    Equipo
                  </label>
                  <div className="mt-1">
                    <select
                      id="item_id"
                      name="item_id"
                      value={formData.item_id}
                      onChange={handleChange}
                      disabled={!formData.departamento_id || loadingItems || submitting}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm text-gray-900 font-medium"
                    >
                      <option value="" className="text-gray-800">Selecciona un equipo</option>
                      {items.map((item) => (
                        <option key={item.id} value={item.id} className="text-gray-900">
                          {item.nombre} - Disponibles: {item.cantidad_disponible}
                        </option>
                      ))}
                    </select>
                  </div>
                  {loadingItems && <p className="mt-1 text-sm text-gray-600">Cargando equipos...</p>}
                  {!loadingItems && formData.departamento_id && items.length === 0 && (
                    <p className="mt-1 text-sm text-red-600 font-medium">No hay equipos disponibles en este departamento</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">Fecha y Horario</h3>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="fecha_uso" className="block text-sm font-bold text-gray-900">
                    Fecha de Uso
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="fecha_uso"
                      id="fecha_uso"
                      value={formData.fecha_uso}
                      onChange={handleChange}
                      disabled={submitting}
                      min={new Date().toISOString().split('T')[0]} // Fecha mínima: hoy
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm text-gray-900"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="hora_inicio" className="block text-sm font-bold text-gray-900">
                        Hora de Inicio
                      </label>
                      <div className="mt-1">
                        <input
                          type="time"
                          name="hora_inicio"
                          id="hora_inicio"
                          value={formData.hora_inicio}
                          onChange={handleChange}
                          disabled={submitting}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm text-gray-900"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="hora_fin" className="block text-sm font-bold text-gray-900">
                        Hora de Fin
                      </label>
                      <div className="mt-1">
                        <input
                          type="time"
                          name="hora_fin"
                          id="hora_fin"
                          value={formData.hora_fin}
                          onChange={handleChange}
                          disabled={submitting}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm text-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">Detalles de la Solicitud</h3>
              <div className="sm:col-span-6">
                <label htmlFor="motivo" className="block text-sm font-bold text-gray-900">
                  Motivo de la Solicitud
                </label>
                <div className="mt-1">
                  <textarea
                    id="motivo"
                    name="motivo"
                    rows={4}
                    value={formData.motivo}
                    onChange={handleChange}
                    disabled={submitting}
                    placeholder="Explica brevemente para qué necesitas el equipo..."
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm text-gray-900"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-700 font-medium">
                  Por favor, proporciona una descripción detallada del propósito para el que necesitas el equipo.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Link
                href="/dashboard/solicitudes"
                className="rounded-md bg-white py-2.5 px-4 text-sm font-semibold text-gray-800 shadow-sm border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 mr-3"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-green-700 py-2.5 px-5 text-sm font-semibold text-white shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {submitting ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}