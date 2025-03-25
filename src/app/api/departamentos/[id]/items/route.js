import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { query } from '@/lib/db';

// Obtener los items de un departamento específico
export async function GET(req, { params }) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
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
    
    // Obtener los items del departamento
    const items = await query(
      'SELECT * FROM items WHERE departamento_id = ? ORDER BY nombre ASC',
      [id]
    );
    
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error al obtener items del departamento:', error);
    return NextResponse.json(
      { error: 'Error al obtener items del departamento' },
      { status: 500 }
    );
  }
}