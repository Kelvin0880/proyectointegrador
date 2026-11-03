
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { query } from '@/lib/db';

// Obtener un departamento específico
export async function GET(req, { params }) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    
    const departamentos = await query(
      'SELECT * FROM departamentos WHERE id = ?',
      [id]
    );
    
    if (departamentos.length === 0) {
      return NextResponse.json(
        { error: 'Departamento no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(departamentos[0]);
  } catch (error) {
    console.error('Error al obtener departamento:', error);
    return NextResponse.json(
      { error: 'Error al obtener departamento' },
      { status: 500 }
    );
  }
}

// Actualizar un departamento (solo admin)
export async function PATCH(req, { params }) {
  try {
    const session = await getSession();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const { nombre, descripcion } = await req.json();
    
    // Verificar que el departamento existe
    const departamentos = await query(
      'SELECT * FROM departamentos WHERE id = ?',
      [id]
    );
    
    if (departamentos.length === 0) {
      return NextResponse.json(
        { error: 'Departamento no encontrado' },
        { status: 404 }
      );
    }
    
    let sql = 'UPDATE departamentos SET ';
    const updates = [];
    const values = [];
    
    if (nombre !== undefined) {
      // Verificar que no exista otro departamento con el mismo nombre
      const existentes = await query(
        'SELECT * FROM departamentos WHERE nombre = ? AND id != ?',
        [nombre, id]
      );
      
      if (existentes.length > 0) {
        return NextResponse.json(
          { error: 'Ya existe un departamento con ese nombre' },
          { status: 400 }
        );
      }
      
      updates.push('nombre = ?');
      values.push(nombre);
    }
    
    if (descripcion !== undefined) {
      updates.push('descripcion = ?');
      values.push(descripcion);
    }
    
    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No hay campos para actualizar' },
        { status: 400 }
      );
    }
    
    sql += updates.join(', ');
    sql += ' WHERE id = ?';
    values.push(id);
    
    await query(sql, values);
    
    return NextResponse.json({ message: 'Departamento actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar departamento:', error);
    return NextResponse.json(
      { error: 'Error al actualizar departamento' },
      { status: 500 }
    );
  }
}

// Eliminar un departamento (solo admin)
export async function DELETE(req, { params }) {
  try {
    const session = await getSession();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    
    // Verificar que el departamento existe
    const departamentos = await query(
      'SELECT * FROM departamentos WHERE id = ?',
      [id]
    );
    
    if (departamentos.length === 0) {
      return NextResponse.json(
        { error: 'Departamento no encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar que no haya items asociados a este departamento
    const items = await query(
      'SELECT COUNT(*) as count FROM items WHERE departamento_id = ?',
      [id]
    );
    
    if (items[0].count > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un departamento con items asociados' },
        { status: 400 }
      );
    }
    
    // Eliminar el departamento
    await query('DELETE FROM departamentos WHERE id = ?', [id]);
    
    return NextResponse.json({ message: 'Departamento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar departamento:', error);
    return NextResponse.json(
      { error: 'Error al eliminar departamento' },
      { status: 500 }
    );
  }
}

