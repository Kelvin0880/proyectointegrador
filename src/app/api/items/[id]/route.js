// src/app/api/items/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { query } from '@/lib/db';

// Obtener un item específico
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
    
    console.log('API: Retrieving item with ID:', id);
    
    const items = await query(
      `SELECT i.*, d.nombre as departamento_nombre 
       FROM items i
       INNER JOIN departamentos d ON i.departamento_id = d.id
       WHERE i.id = ?`,
      [id]
    );
    
    if (items.length === 0) {
      return NextResponse.json(
        { error: 'Item no encontrado' },
        { status: 404 }
      );
    }
    
    const item = items[0];
    console.log('API: Item found:', item);
    
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error al obtener item:', error);
    return NextResponse.json(
      { error: 'Error al obtener item' },
      { status: 500 }
    );
  }
}

// Actualizar un item (solo admin)
export async function PATCH(req, context) {
  try {
    const session = await getServerSession();
    console.log('API PATCH: Sesión actual:', JSON.stringify(session));
    
    // Comprobar si el usuario es administrador - verificar tanto 'role' como 'rol'
    // para mayor compatibilidad
    const isAdmin = session?.user && (
      session.user.role === 'admin' || 
      session.user.rol === 'admin' ||
      session.user.email === 'superadmin@unphu.edu.do'
    );
    
    console.log('API PATCH: ¿Es admin?', isAdmin);
    console.log('API PATCH: Email de usuario:', session?.user?.email);
    console.log('API PATCH: Rol de usuario:', session?.user?.role || session?.user?.rol);
    
    if (!session || !isAdmin) {
      return NextResponse.json(
        { error: 'No autorizado para actualizar items' },
        { status: 401 }
      );
    }
    
    // Extraer el ID de los parámetros de contexto de manera asincrónica
    const { id } = await context.params;
    const { nombre, descripcion, departamento_id, cantidad_total, cantidad_disponible, estado } = await req.json();
    
    // Verificar que el item existe
    const items = await query(
      'SELECT * FROM items WHERE id = ?',
      [id]
    );
    
    if (items.length === 0) {
      return NextResponse.json(
        { error: 'Item no encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar que el departamento existe si se va a actualizar
    if (departamento_id) {
      const departamentos = await query(
        'SELECT * FROM departamentos WHERE id = ?',
        [departamento_id]
      );
      
      if (departamentos.length === 0) {
        return NextResponse.json(
          { error: 'El departamento seleccionado no existe' },
          { status: 400 }
        );
      }
    }
    
    // Validar cantidad disponible
    if (cantidad_disponible !== undefined && cantidad_total !== undefined) {
      if (cantidad_disponible > cantidad_total) {
        return NextResponse.json(
          { error: 'La cantidad disponible no puede ser mayor que la cantidad total' },
          { status: 400 }
        );
      }
    } else if (cantidad_disponible !== undefined && cantidad_total === undefined) {
      // Si solo se actualiza cantidad_disponible, verificar contra cantidad_total existente
      if (cantidad_disponible > items[0].cantidad_total) {
        return NextResponse.json(
          { error: 'La cantidad disponible no puede ser mayor que la cantidad total' },
          { status: 400 }
        );
      }
    }
    
    // Construir la consulta de actualización
    let updateFields = [];
    const updateValues = [];
    
    if (nombre !== undefined) {
      updateFields.push('nombre = ?');
      updateValues.push(nombre);
    }
    
    if (descripcion !== undefined) {
      updateFields.push('descripcion = ?');
      updateValues.push(descripcion);
    }
    
    if (departamento_id !== undefined) {
      updateFields.push('departamento_id = ?');
      updateValues.push(departamento_id);
    }
    
    if (cantidad_total !== undefined) {
      updateFields.push('cantidad_total = ?');
      updateValues.push(cantidad_total);
    }
    
    if (cantidad_disponible !== undefined) {
      updateFields.push('cantidad_disponible = ?');
      updateValues.push(cantidad_disponible);
    }
    
    if (estado !== undefined) {
      updateFields.push('estado = ?');
      updateValues.push(estado);
    }
    
    // Si no hay campos para actualizar
    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No se proporcionaron campos para actualizar' },
        { status: 400 }
      );
    }
    
    // Añadir campo updated_at
    updateFields.push('updated_at = NOW()');
    
    // Ejecutar la actualización
    const updateQuery = `UPDATE items SET ${updateFields.join(', ')} WHERE id = ?`;
    updateValues.push(id);
    
    console.log('API PATCH: Ejecutando actualización:', updateQuery, updateValues);
    
    await query(updateQuery, updateValues);
    
    return NextResponse.json({ message: 'Item actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar item:', error);
    return NextResponse.json(
      { error: 'Error al actualizar item: ' + error.message },
      { status: 500 }
    );
  }
}

// Eliminar un item (solo admin)
export async function DELETE(req, context) {
  try {
    const session = await getServerSession();
    console.log('API DELETE: Sesión actual:', JSON.stringify(session));
    
    // Comprobar si el usuario es administrador - verificar tanto 'role' como 'rol'
    // para mayor compatibilidad
    const isAdmin = session?.user && (
      session.user.role === 'admin' || 
      session.user.rol === 'admin' ||
      session.user.email === 'superadmin@unphu.edu.do'
    );
    
    console.log('API DELETE: ¿Es admin?', isAdmin);
    console.log('API DELETE: Email de usuario:', session?.user?.email);
    console.log('API DELETE: Rol de usuario:', session?.user?.role || session?.user?.rol);
    
    if (!session || !isAdmin) {
      return NextResponse.json(
        { error: 'No autorizado para eliminar items' },
        { status: 401 }
      );
    }
    
    // Extraer el ID de los parámetros de contexto de manera asincrónica
    const { id } = await context.params;
    
    // Verificar que el item existe
    const items = await query(
      'SELECT * FROM items WHERE id = ?',
      [id]
    );
    
    if (items.length === 0) {
      return NextResponse.json(
        { error: 'Item no encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar si el item tiene solicitudes activas (no finalizadas)
    const solicitudesActivas = await query(
      'SELECT COUNT(*) as count FROM solicitudes WHERE item_id = ? AND estado != "Finalizada" AND estado != "Rechazada"',
      [id]
    );
    
    if (solicitudesActivas[0].count > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un equipo con solicitudes activas asociadas' },
        { status: 400 }
      );
    }
    
    // Verificar si hay solicitudes históricas (finalizadas o rechazadas)
    const solicitudesHistoricas = await query(
      'SELECT COUNT(*) as count FROM solicitudes WHERE item_id = ? AND (estado = "Finalizada" OR estado = "Rechazada")',
      [id]
    );
    
    // Si hay solicitudes históricas, no eliminamos el equipo sino que lo marcamos como "Agotado"
    // para mantener integridad referencial en el historial, ya que "Eliminado" no es un estado válido en la BD
    if (solicitudesHistoricas[0].count > 0) {
      console.log(`API DELETE: El item ${id} tiene ${solicitudesHistoricas[0].count} solicitudes históricas. Marcando como "Agotado" en lugar de borrar.`);
      
      await query(
        'UPDATE items SET estado = "Agotado", cantidad_disponible = 0, updated_at = NOW() WHERE id = ?',
        [id]
      );
      
      return NextResponse.json({ 
        message: 'Item marcado como agotado. Se mantiene en la base de datos para referencias históricas.',
        status: 'soft_delete'
      });
    }
    
    // Si no tiene solicitudes, eliminamos el item completamente
    await query('DELETE FROM items WHERE id = ?', [id]);
    
    return NextResponse.json({ message: 'Item eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar item:', error);
    return NextResponse.json(
      { error: 'Error al eliminar item' },
      { status: 500 }
    );
  }
}