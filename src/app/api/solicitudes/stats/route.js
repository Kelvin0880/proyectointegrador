// src/app/api/solicitudes/stats/route.js
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    
    console.log('API Stats - Sesión:', session ? `Activa (${session.user.matricula})` : 'No activa');
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado. Por favor inicie sesión.' },
        { status: 401 }
      );
    }
    
    // Obtener el id del usuario
    const usuarios = await query(
      'SELECT id FROM usuarios WHERE matricula = ?',
      [session.user.matricula]
    );
    
    if (usuarios.length === 0) {
      console.error(`Usuario no encontrado: ${session.user.matricula}`);
      return NextResponse.json(
        { error: 'Usuario no encontrado en la base de datos' },
        { status: 404 }
      );
    }
    
    const usuario_id = usuarios[0].id;
    console.log(`ID de usuario encontrado: ${usuario_id}`);
    
    // Obtener estadísticas de solicitudes
    const pendientes = await query(
      'SELECT COUNT(*) as count FROM solicitudes WHERE usuario_id = ? AND estado = ?',
      [usuario_id, 'Pendiente']
    );
    
    const aprobadas = await query(
      'SELECT COUNT(*) as count FROM solicitudes WHERE usuario_id = ? AND estado = ?',
      [usuario_id, 'Aprobada']
    );
    
    const rechazadas = await query(
      'SELECT COUNT(*) as count FROM solicitudes WHERE usuario_id = ? AND estado = ?',
      [usuario_id, 'Rechazada']
    );
    
    const finalizadas = await query(
      'SELECT COUNT(*) as count FROM solicitudes WHERE usuario_id = ? AND estado = ?',
      [usuario_id, 'Finalizada']
    );
    
    const stats = {
      pendientes: pendientes[0].count || 0,
      aprobadas: aprobadas[0].count || 0,
      rechazadas: rechazadas[0].count || 0,
      finalizadas: finalizadas[0].count || 0
    };
    
    console.log('Estadísticas calculadas:', stats);
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas: ' + error.message },
      { status: 500 }
    );
  }
}