import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { query } from '@/lib/db';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('API Informes - Sesión:', JSON.stringify(session?.user));
    
    // Comprobar si el usuario es administrador - verificar tanto 'role' como 'rol'
    const isAdmin = session?.user && (
      session.user.role === 'admin' || 
      session.user.rol === 'admin' ||
      session.user.email === 'superadmin@unphu.edu.do'
    );
    
    if (!session || !isAdmin) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const periodo = searchParams.get('periodo') || '24h';
    const tipo = searchParams.get('tipo') || 'completo';
    
    // Determinar la fecha límite según el periodo seleccionado
    let fechaLimite;
    const ahora = new Date();
    
    switch (periodo) {
      case '24h':
        fechaLimite = new Date(ahora);
        fechaLimite.setHours(ahora.getHours() - 24);
        break;
      case '5d':
        fechaLimite = new Date(ahora);
        fechaLimite.setDate(ahora.getDate() - 5);
        break;
      case '15d':
        fechaLimite = new Date(ahora);
        fechaLimite.setDate(ahora.getDate() - 15);
        break;
      case '1m':
        fechaLimite = new Date(ahora);
        fechaLimite.setMonth(ahora.getMonth() - 1);
        break;
      case '6m':
        fechaLimite = new Date(ahora);
        fechaLimite.setMonth(ahora.getMonth() - 6);
        break;
      case '1y':
        fechaLimite = new Date(ahora);
        fechaLimite.setFullYear(ahora.getFullYear() - 1);
        break;
      default:
        fechaLimite = new Date(ahora);
        fechaLimite.setHours(ahora.getHours() - 24);
    }
    
    const fechaLimiteStr = fechaLimite.toISOString().slice(0, 19).replace('T', ' ');
    console.log('API Informes - Fecha límite:', fechaLimiteStr);
    
    const result = {};
    
    // Obtener ranking de equipos más solicitados si corresponde
    if (tipo === 'equipos' || tipo === 'completo') {
      console.log('API Informes - Obteniendo datos de equipos');
      const equiposQuery = `
        SELECT i.id, i.nombre, d.nombre as departamento_nombre, COUNT(s.id) as total_solicitudes
        FROM solicitudes s
        INNER JOIN items i ON s.item_id = i.id
        INNER JOIN departamentos d ON i.departamento_id = d.id
        WHERE s.fecha_solicitud >= ?
        GROUP BY i.id, i.nombre, d.nombre
        ORDER BY total_solicitudes DESC
        LIMIT 10
      `;
      
      result.equipos = await query(equiposQuery, [fechaLimiteStr]);
      console.log(`API Informes - Encontrados ${result.equipos.length} equipos`);
      
      // Si no hay datos, proporcionar un mensaje específico
      if (result.equipos.length === 0) {
        result.mensajeEquipos = `No hay datos de equipos solicitados en el período seleccionado (${obtenerDescripcionPeriodo(periodo)})`;
      }
    }
    
    // Obtener ranking de usuarios con más solicitudes si corresponde
    if (tipo === 'usuarios' || tipo === 'completo') {
      console.log('API Informes - Obteniendo datos de usuarios');
      const usuariosQuery = `
        SELECT u.id, u.nombre, u.apellido, u.matricula, COUNT(s.id) as total_solicitudes
        FROM solicitudes s
        INNER JOIN usuarios u ON s.usuario_id = u.id
        WHERE s.fecha_solicitud >= ?
        GROUP BY u.id, u.nombre, u.apellido, u.matricula
        ORDER BY total_solicitudes DESC
        LIMIT 10
      `;
      
      result.usuarios = await query(usuariosQuery, [fechaLimiteStr]);
      console.log(`API Informes - Encontrados ${result.usuarios.length} usuarios`);
      
      // Si no hay datos, proporcionar un mensaje específico
      if (result.usuarios.length === 0) {
        result.mensajeUsuarios = `No hay datos de usuarios que hayan realizado solicitudes en el período seleccionado (${obtenerDescripcionPeriodo(periodo)})`;
      }
    }
    
    // Información general del periodo
    result.meta = {
      periodo: periodo,
      fechaInicio: fechaLimiteStr,
      fechaFin: ahora.toISOString().slice(0, 19).replace('T', ' '),
    };
    
    // Si no hay datos en general, incluir un mensaje general
    if ((tipo === 'completo' && result.equipos.length === 0 && result.usuarios.length === 0) ||
        (tipo === 'equipos' && result.equipos.length === 0) ||
        (tipo === 'usuarios' && result.usuarios.length === 0)) {
      result.mensaje = `No hay datos disponibles para el período seleccionado (${obtenerDescripcionPeriodo(periodo)})`;
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error al generar informe:', error);
    return NextResponse.json(
      { error: 'Error al generar informe: ' + error.message },
      { status: 500 }
    );
  }
}

// Función para obtener descripciones legibles de los periodos
function obtenerDescripcionPeriodo(periodo) {
  switch (periodo) {
    case '24h': return 'últimas 24 horas';
    case '5d': return 'últimos 5 días';
    case '15d': return 'últimos 15 días';
    case '1m': return 'último mes';
    case '6m': return 'últimos 6 meses';
    case '1y': return 'último año';
    default: return periodo;
  }
}