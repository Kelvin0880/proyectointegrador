// src/app/api/solicitudes/admin/route.js
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { query } from '@/lib/db';

// Obtener todas las solicitudes (solo admin)
export async function GET(req) {
  try {
    const session = await getSession();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const estado = searchParams.get('estado');
    
    let sql = `
      SELECT s.*, i.nombre as item_nombre, d.nombre as departamento_nombre,
      u.nombre as usuario_nombre, u.apellido as usuario_apellido, u.matricula
      FROM solicitudes s
      INNER JOIN items i ON s.item_id = i.id
      INNER JOIN departamentos d ON i.departamento_id = d.id
      INNER JOIN usuarios u ON s.usuario_id = u.id
    `;
    const params = [];
    
    if (estado) {
      sql += ' WHERE s.estado = ?';
      params.push(estado);
    }
    
    sql += ' ORDER BY s.fecha_solicitud DESC';
    
    const solicitudes = await query(sql, params);
    
    return NextResponse.json(solicitudes);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    return NextResponse.json(
      { error: 'Error al obtener solicitudes' },
      { status: 500 }
    );
  }
}