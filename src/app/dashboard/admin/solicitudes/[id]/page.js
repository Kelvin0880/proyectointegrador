// src/app/api/solicitudes/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { query } from '@/lib/db';

// Obtener una solicitud específica
export async function GET(req, context) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Extraer el ID de los parámetros de contexto de manera asincrónica
    const { id } = await context.params;
    
    console.log('API: Procesando solicitud para ID:', id);
    
    const solicitudes = await query(
      `SELECT s.*, i.nombre as item_nombre, d.nombre as departamento_nombre,
       u.nombre as usuario_nombre, u.apellido as usuario_apellido, u.matricula
       FROM solicitudes s
       INNER JOIN items i ON s.item_id = i.id
       INNER JOIN departamentos d ON i.departamento_id = d.id
       INNER JOIN usuarios u ON s.usuario_id = u.id
       WHERE s.id = ?`,
      [id]
    );
    
    if (solicitudes.length === 0) {
      console.log('API: Solicitud no encontrada para ID:', id);
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      );
    }
    
    // Verificar que la solicitud sea del usuario o que sea admin
    const solicitud = solicitudes[0];
    const isAdmin = session.user.role === 'admin';
    const isOwner = solicitud.matricula === session.user.matricula;
    
    console.log('API: Verificando permisos - Admin:', isAdmin, 'Owner:', isOwner);
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'No autorizado para ver esta solicitud' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(solicitud);
  } catch (error) {
    console.error('Error al obtener solicitud:', error);
    return NextResponse.json(
      { error: 'Error al obtener solicitud' },
      { status: 500 }
    );
  }
}

// Actualizar una solicitud (solo admin)
export async function PATCH(req, context) {
  try {
    const session = await getServerSession();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Extraer el ID de los parámetros de contexto de manera asincrónica
    const { id } = await context.params;
    const { estado, comentarios } = await req.json();
    
    if (!estado) {
      return NextResponse.json(
        { error: 'El estado es obligatorio' },
        { status: 400 }
      );
    }
    
    const solicitudes = await query('SELECT * FROM solicitudes WHERE id = ?', [id]);
    if (solicitudes.length === 0) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      );
    }
    
    // Actualizar la solicitud
    await query(
      'UPDATE solicitudes SET estado = ?, comentarios = ? WHERE id = ?',
      [estado, comentarios || null, id]
    );
    
    // Si se aprueba la solicitud, actualizar la cantidad disponible
    if (estado === 'Aprobada') {
      const solicitud = solicitudes[0];
      await query(
        'UPDATE items SET cantidad_disponible = cantidad_disponible - 1 WHERE id = ?',
        [solicitud.item_id]
      );
    }
    
    // Si se finaliza la solicitud (devuelve el ítem), actualizar la cantidad disponible
    if (estado === 'Finalizada') {
      const solicitud = solicitudes[0];
      if (solicitud.estado === 'Aprobada') {
        await query(
          'UPDATE items SET cantidad_disponible = cantidad_disponible + 1 WHERE id = ?',
          [solicitud.item_id]
        );
      }
    }
    
    return NextResponse.json({ message: 'Solicitud actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar solicitud:', error);
    return NextResponse.json(
      { error: 'Error al actualizar solicitud' },
      { status: 500 }
    );
  }
}

// Eliminar una solicitud
export async function DELETE(req, context) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Extraer el ID de los parámetros de contexto de manera asincrónica
    const { id } = await context.params;
    
    // Obtener la solicitud para verificar permisos y estado
    const solicitudes = await query(
      `SELECT s.*, u.matricula 
       FROM solicitudes s
       INNER JOIN usuarios u ON s.usuario_id = u.id
       WHERE s.id = ?`,
      [id]
    );
    
    if (solicitudes.length === 0) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      );
    }
    
    const solicitud = solicitudes[0];
    const isAdmin = session.user.role === 'admin';
    const isOwner = solicitud.matricula === session.user.matricula;
    
    // Solo el dueño o un admin puede eliminar la solicitud
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'No autorizado para eliminar esta solicitud' },
        { status: 403 }
      );
    }
    
    // Solo se pueden eliminar solicitudes pendientes
    if (solicitud.estado !== 'Pendiente' && !isAdmin) {
      return NextResponse.json(
        { error: 'Solo se pueden eliminar solicitudes en estado Pendiente' },
        { status: 400 }
      );
    }
    
    // Eliminar la solicitud
    await query('DELETE FROM solicitudes WHERE id = ?', [id]);
    
    return NextResponse.json({ message: 'Solicitud eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar solicitud:', error);
    return NextResponse.json(
      { error: 'Error al eliminar solicitud' },
      { status: 500 }
    );
  }
}