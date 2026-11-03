import bcrypt from 'bcryptjs';
import { query, queryOne } from '@/lib/db';
import { handler, ok, readJson, badRequest } from '@/lib/server/http';
import { hasErrors, firstError, normalizeMatricula, validateRegistro } from '@/lib/validation';
import { INSTITUTION } from '@/lib/constants';

export const POST = handler(async (req) => {
  const body = await readJson(req);
  const errors = validateRegistro(body);
  if (hasErrors(errors)) throw badRequest(firstError(errors), errors);

  const matricula = normalizeMatricula(body.matricula);
  const email = `${matricula}@${INSTITUTION.emailDomain}`;

  const existing = await queryOne('SELECT id FROM usuarios WHERE LOWER(matricula) = ? OR LOWER(email) = ?', [matricula, email]);
  if (existing) throw badRequest('Esta matrícula ya está registrada', { matricula: 'Esta matrícula ya está registrada' });

  const hash = await bcrypt.hash(body.password, 10);
  await query(
    'INSERT INTO usuarios (matricula, email, nombre, apellido, password) VALUES (?, ?, ?, ?, ?)',
    [matricula, email, body.nombre.trim(), body.apellido.trim(), hash]
  );
  return ok({ message: 'Usuario registrado correctamente' }, 201);
});
