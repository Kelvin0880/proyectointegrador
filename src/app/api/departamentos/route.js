// src/app/api/departamentos/route.js
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { query } from '@/lib/db';

// Obtener todos los departamentos
export async function GET() {
  try {
    const session = await getSession();
    
    // Permitir acceso a los departamentos incluso sin sesión
    // para que funcionen las páginas públicas
    console.log('Obteniendo departamentos, sesión:', session ? 'Activa' : 'No activa');
    
    const departamentos = await query(
      'SELECT * FROM departamentos ORDER BY nombre ASC'
    );
    
    console.log(`Encontrados ${departamentos.length} departamentos`);
    return NextResponse.json(departamentos);
  } catch (error) {
    console.error('Error al obtener departamentos:', error);
    return NextResponse.json(
      { error: 'Error al obtener departamentos: ' + error.message },
      { status: 500 }
    );
  }
}

// Crear un nuevo departamento (solo admin)
export async function POST(req) {
  try {
    const session = await getSession();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado. Se requieren permisos de administrador.' },
        { status: 401 }
      );
    }
    
    const { nombre, descripcion } = await req.json();
    
    // Validaciones
    if (!nombre) {
      return NextResponse.json(
        { error: 'El nombre es obligatorio' },
        { status: 400 }
      );
    }
    
    // Verificar que no exista un departamento con el mismo nombre
    const existentes = await query(
      'SELECT * FROM departamentos WHERE nombre = ?',
      [nombre]
    );
    
    if (existentes.length > 0) {
      return NextResponse.json(
        { error: 'Ya existe un departamento con ese nombre' },
        { status: 400 }
      );
    }
    
    // Crear el departamento
    const result = await query(
      'INSERT INTO departamentos (nombre, descripcion) VALUES (?, ?)',
      [nombre, descripcion || null]
    );
    
    return NextResponse.json(
      { id: result.insertId, message: 'Departamento creado correctamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear departamento:', error);
    return NextResponse.json(
      { error: 'Error al crear departamento: ' + error.message },
      { status: 500 }
    );
  }
}