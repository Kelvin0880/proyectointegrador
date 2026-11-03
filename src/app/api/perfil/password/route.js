import bcrypt from 'bcryptjs';
import { query, queryOne } from '@/lib/db';
import { handler, ok, readJson, requireUser, badRequest } from '@/lib/server/http';
import { validatePassword } from '@/lib/validation';

// Cambia la contraseña del usuario actual
export const PATCH = handler(async (req) => {
  const user = await requireUser();
  const { actual, nueva } = await readJson(req);

  if (!actual) throw badRequest('Ingresa tu contraseña actual', { actual: 'Ingresa tu contraseña actual' });
  const error = validatePassword(nueva);
  if (error) throw badRequest(error, { nueva: error });
  if (actual === nueva) throw badRequest('La nueva contraseña debe ser diferente a la actual', { nueva: 'Debe ser diferente a la actual' });

  const row = await queryOne('SELECT password FROM usuarios WHERE id = ?', [user.id]);
  if (!row || !(await bcrypt.compare(actual, row.password))) {
    throw badRequest('La contraseña actual no es correcta', { actual: 'La contraseña actual no es correcta' });
  }

  await query('UPDATE usuarios SET password = ? WHERE id = ?', [await bcrypt.hash(nueva, 10), user.id]);
  return ok({ message: 'Contraseña actualizada correctamente' });
});
