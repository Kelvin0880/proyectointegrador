// src/app/api/auth/debug/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { query } from '@/lib/db';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    
    // Extraer matrícula
    const matricula = email.split('@')[0].toLowerCase().trim();
    console.log(`Intento de login para: ${matricula}`);
    
    // Buscar usuario
    const users = await query(
      'SELECT * FROM usuarios WHERE LOWER(matricula) = ?',
      [matricula]
    );
    
    if (users.length === 0) {
      console.log(`Usuario no encontrado: ${matricula}`);
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    
    const user = users[0];
    console.log(`Usuario encontrado: ${JSON.stringify({
      id: user.id,
      matricula: user.matricula,
      email: user.email,
      role: user.rol,
      password_hash_length: user.password.length
    })}`);
    
    // Verificar contraseña
    const isValid = await bcrypt.compare(password, user.password);
    console.log(`Contraseña válida: ${isValid}`);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        matricula: user.matricula,
        email: user.email,
        role: user.rol
      }
    });
  } catch (error) {
    console.error('Error de depuración:', error);
    return NextResponse.json(
      { error: 'Error en la autenticación: ' + error.message },
      { status: 500 }
    );
  }
}