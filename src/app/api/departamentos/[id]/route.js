import { query, queryOne } from '@/lib/db';
import { handler, ok, readJson, requireAdmin, requireUser, badRequest, notFound, parseId } from '@/lib/server/http';
import { hasErrors, firstError, validateDepartamento } from '@/lib/validation';

async function findDepartamento(id) {
  const departamento = await queryOne('SELECT * FROM departamentos WHERE id = ?', [id]);
  if (!departamento) throw notFound('Departamento no encontrado');
  return departamento;
}

export const GET = handler(async (req, { params }) => {
  await requireUser();
  const id = parseId((await params).id);
  return ok(await findDepartamento(id));
});

export const PATCH = handler(async (req, { params }) => {
  await requireAdmin();
  const id = parseId((await params).id);
  const current = await findDepartamento(id);
  const body = await readJson(req);

  const data = { nombre: body.nombre ?? current.nombre, descripcion: body.descripcion ?? current.descripcion };
  const errors = validateDepartamento(data);
  if (hasErrors(errors)) throw badRequest(firstError(errors), errors);

  const nombre = data.nombre.trim();
  const duplicate = await queryOne('SELECT id FROM departamentos WHERE LOWER(nombre) = LOWER(?) AND id != ?', [nombre, id]);
  if (duplicate) throw badRequest('Ya existe un departamento con ese nombre', { nombre: 'Ya existe un departamento con ese nombre' });

  await query('UPDATE departamentos SET nombre = ?, descripcion = ? WHERE id = ?', [nombre, data.descripcion?.trim() || null, id]);
  return ok({ message: 'Departamento actualizado correctamente' });
});

export const DELETE = handler(async (req, { params }) => {
  await requireAdmin();
  const id = parseId((await params).id);
  await findDepartamento(id);

  const { count } = await queryOne('SELECT COUNT(*) AS count FROM items WHERE departamento_id = ?', [id]);
  if (count > 0) throw badRequest('No se puede eliminar un departamento que tiene equipos registrados');

  await query('DELETE FROM departamentos WHERE id = ?', [id]);
  return ok({ message: 'Departamento eliminado correctamente' });
});
