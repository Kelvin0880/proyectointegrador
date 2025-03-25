// src/app/api/items/route.js
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { query } from '@/lib/db';

// Obtener todos los items
export async function GET(req) {
  try {
    const session = await getSession();
    
    // No requerimos sesión para obtener los items
    // para permitir el funcionamiento de páginas públicas
    console.log('Obteniendo items, sesión:', session ? 'Activa' : 'No activa');
    
    const { searchParams } = new URL(req.url);
    const departamento_id = searchParams.get('departamento_id');
    
    let sql = `
      SELECT i.*, d.nombre as departamento_nombre 
      FROM items i
      INNER JOIN departamentos d ON i.departamento_id = d.id
    `;
    const params = [];
    
    if (departamento_id) {
      sql += ' WHERE i.departamento_id = ?';
      params.push(departamento_id);
    }
    
    sql += ' ORDER BY i.nombre ASC';
    
    const items = await query(sql, params);
    console.log(`Encontrados ${items.length} items${departamento_id ? ' para el departamento ' + departamento_id : ''}`);
    
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error al obtener items:', error);
    return NextResponse.json(
      { error: 'Error al obtener items: ' + error.message },
      { status: 500 }
    );
  }
}

// Crear un nuevo item (solo admin)
export async function POST(req) {
  try {
    const session = await getSession();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado. Se requieren permisos de administrador.' },
        { status: 401 }
      );
    }
    
    const { nombre, descripcion, departamento_id, cantidad_total } = await req.json();
    
    // Validaciones
    if (!nombre || !descripcion || !departamento_id || !cantidad_total) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }
    
    // Verificar que el departamento existe
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
    
    // Crear el item
    const result = await query(
      `INSERT INTO items 
       (nombre, descripcion, departamento_id, cantidad_total, cantidad_disponible, estado) 
       VALUES (?, ?, ?, ?, ?, 'Disponible')`,
      [nombre, descripcion, departamento_id, cantidad_total, cantidad_total]
    );
    
    return NextResponse.json(
      { id: result.insertId, message: 'Item creado correctamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear item:', error);
    return NextResponse.json(
      { error: 'Error al crear item: ' + error.message },
      { status: 500 }
    );
  }
}