import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { query } from '@/lib/db';

// Obtener todas las solicitudes del usuario
export async function GET(req) {
  try {
    const session = await getSession();
    
    if (!session) {
      console.error('No hay sesión de usuario activa');
      return NextResponse.json(
        { error: 'No autorizado. Por favor inicie sesión.' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const estado = searchParams.get('estado');
    
    let sql = `
      SELECT s.*, i.nombre as item_nombre, d.nombre as departamento_nombre 
      FROM solicitudes s
      INNER JOIN items i ON s.item_id = i.id
      INNER JOIN departamentos d ON i.departamento_id = d.id
      INNER JOIN usuarios u ON s.usuario_id = u.id
      WHERE u.matricula = ?
    `;
    const params = [session.user.matricula];
    
    if (estado) {
      sql += ' AND s.estado = ?';
      params.push(estado);
    }
    
    sql += ' ORDER BY s.fecha_solicitud DESC';
    
    console.log('Consultando solicitudes para:', session.user.matricula);
    const solicitudes = await query(sql, params);
    console.log(`Encontradas ${solicitudes.length} solicitudes`);
    
    return NextResponse.json(solicitudes);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    return NextResponse.json(
      { error: 'Error al obtener solicitudes: ' + error.message },
      { status: 500 }
    );
  }
}

// Crear una nueva solicitud
export async function POST(req) {
  try {
    const session = await getSession();
    
    if (!session) {
      console.error('No hay sesión de usuario activa');
      return NextResponse.json(
        { error: 'No autorizado. Por favor inicie sesión.' },
        { status: 401 }
      );
    }
    
    const { item_id, fecha_uso, hora_inicio, hora_fin, motivo } = await req.json();
    
    // Validaciones
    if (!item_id || !fecha_uso || !hora_inicio || !hora_fin || !motivo) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }
    
    // Verificar que el ítem existe y está disponible
    const items = await query(
      'SELECT * FROM items WHERE id = ? AND cantidad_disponible > 0',
      [item_id]
    );
    
    if (items.length === 0) {
      return NextResponse.json(
        { error: 'El ítem seleccionado no existe o no está disponible' },
        { status: 400 }
      );
    }
    
    // Obtener el id del usuario
    const usuarios = await query(
      'SELECT id FROM usuarios WHERE matricula = ?',
      [session.user.matricula]
    );
    
    if (usuarios.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado en la base de datos' },
        { status: 404 }
      );
    }
    
    const usuario_id = usuarios[0].id;
    
    // Crear la solicitud
    const result = await query(
      `INSERT INTO solicitudes 
       (usuario_id, item_id, fecha_uso, hora_inicio, hora_fin, motivo) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [usuario_id, item_id, fecha_uso, hora_inicio, hora_fin, motivo]
    );
    
    return NextResponse.json(
      { id: result.insertId, message: 'Solicitud creada correctamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    return NextResponse.json(
      { error: 'Error al crear solicitud: ' + error.message },
      { status: 500 }
    );
  }
}