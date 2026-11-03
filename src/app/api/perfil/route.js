import { query, queryOne } from '@/lib/db';
import { handler, ok, readJson, requireUser, badRequest, notFound } from '@/lib/server/http';

async function findPerfil(id) {
  const perfil = await queryOne(
    'SELECT id, matricula, email, nombre, apellido, rol, created_at FROM usuarios WHERE id = ?',
    [id]
  );
  if (!perfil) throw notFound('Usuario no encontrado');
  return perfil;
}

export const GET = handler(async () => {
  const user = await requireUser();
  return ok(await findPerfil(user.id));
});

// Actualiza nombre y apellido del usuario actual
export const PATCH = handler(async (req) => {
  const user = await requireUser();
  const { nombre, apellido } = await readJson(req);
  const errors = {};
  if (!nombre?.trim()) errors.nombre = 'El nombre es obligatorio';
  if (!apellido?.trim()) errors.apellido = 'El apellido es obligatorio';
  if (nombre?.trim().length > 100) errors.nombre = 'El nombre es demasiado largo';
  if (apellido?.trim().length > 100) errors.apellido = 'El apellido es demasiado largo';
  if (Object.keys(errors).length) throw badRequest(Object.values(errors)[0], errors);

  await query('UPDATE usuarios SET nombre = ?, apellido = ? WHERE id = ?', [nombre.trim(), apellido.trim(), user.id]);
  return ok({ message: 'Perfil actualizado correctamente', perfil: await findPerfil(user.id) });
});
