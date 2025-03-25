// src/app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { query } from '@/lib/db';

export async function POST(req) {
  try {
    const body = await req.json();
    const { matricula, nombre, apellido, password } = body;
    
    // Validaciones
    if (!matricula || !nombre || !apellido || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }
    
    // Normalizar la matrícula a minúsculas
    const formattedMatricula = matricula.toLowerCase().trim();
    
    // Crear email con formato institucional
    const email = `${formattedMatricula}@unphu.edu.do`;
    
    // Verificar si el usuario ya existe (buscar de forma no sensible a mayúsculas/minúsculas)
    const existingUsers = await query(
      'SELECT * FROM usuarios WHERE LOWER(matricula) = ?',
      [formattedMatricula]
    );
    
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'La matrícula ya está registrada' },
        { status: 400 }
      );
    }
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Guardar usuario en la base de datos
    await query(
      'INSERT INTO usuarios (matricula, email, nombre, apellido, password) VALUES (?, ?, ?, ?, ?)',
      [formattedMatricula, email, nombre, apellido, hashedPassword]
    );
    
    return NextResponse.json(
      { message: 'Usuario registrado correctamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}