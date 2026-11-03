import { query, queryOne } from '@/lib/db';
import { handler, ok, readJson, requireAdmin, requireUser, badRequest, notFound, parseId } from '@/lib/server/http';
import { ITEM_SELECT } from '@/lib/server/queries';
import { hasErrors, firstError, validateItem } from '@/lib/validation';

async function findItem(id) {
  const item = await queryOne(`${ITEM_SELECT} WHERE i.id = ?`, [id]);
  if (!item) throw notFound('Equipo no encontrado');
  return item;
}

async function countPrestadas(id) {
  const { prestadas } = await queryOne(
    "SELECT COUNT(*) AS prestadas FROM solicitudes WHERE item_id = ? AND estado = 'Aprobada'",
    [id]
  );
  return prestadas;
}

export const GET = handler(async (req, { params }) => {
  await requireUser();
  const id = parseId((await params).id);
  const item = await findItem(id);
  return ok({ ...item, unidades_prestadas: await countPrestadas(id) });
});

export const PATCH = handler(async (req, { params }) => {
  await requireAdmin();
  const id = parseId((await params).id);
  const current = await findItem(id);
  const body = await readJson(req);

  const fields = ['nombre', 'descripcion', 'departamento_id', 'cantidad_total', 'cantidad_disponible', 'estado'];
  const data = Object.fromEntries(fields.map((f) => [f, body[f] === undefined ? current[f] : body[f]]));
  const errors = validateItem(data);
  if (hasErrors(errors)) throw badRequest(firstError(errors), errors);

  if (Number(data.departamento_id) !== current.departamento_id) {
    const departamento = await queryOne('SELECT id FROM departamentos WHERE id = ?', [Number(data.departamento_id)]);
    if (!departamento) throw badRequest('El departamento seleccionado no existe', { departamento_id: 'El departamento no existe' });
  }

  const total = Number(data.cantidad_total);
  const disponible = Number(data.cantidad_disponible);
  const prestadas = await countPrestadas(id);
  if (total < prestadas) {
    throw badRequest(`Hay ${prestadas} unidad(es) prestadas; la cantidad total no puede ser menor`, {
      cantidad_total: `Mínimo ${prestadas} (unidades prestadas actualmente)`,
    });
  }

  let estado = data.estado;
  if (estado !== 'En mantenimiento') estado = disponible > 0 ? 'Disponible' : 'Agotado';

  await query(
    `UPDATE items SET nombre = ?, descripcion = ?, departamento_id = ?, cantidad_total = ?,
       cantidad_disponible = ?, estado = ? WHERE id = ?`,
    [String(data.nombre).trim(), String(data.descripcion).trim(), Number(data.departamento_id), total, disponible, estado, id]
  );
  return ok({ message: 'Equipo actualizado correctamente', item: await findItem(id) });
});

// Si el equipo tiene historial se marca como agotado (baja lógica) para conservar los registros
export const DELETE = handler(async (req, { params }) => {
  await requireAdmin();
  const id = parseId((await params).id);
  await findItem(id);

  const { activas } = await queryOne(
    "SELECT COUNT(*) AS activas FROM solicitudes WHERE item_id = ? AND estado IN ('Pendiente', 'Aprobada')",
    [id]
  );
  if (activas > 0) {
    throw badRequest('No se puede eliminar un equipo con solicitudes pendientes o aprobadas');
  }

  const { historicas } = await queryOne('SELECT COUNT(*) AS historicas FROM solicitudes WHERE item_id = ?', [id]);
  if (historicas > 0) {
    await query("UPDATE items SET estado = 'Agotado', cantidad_disponible = 0 WHERE id = ?", [id]);
    return ok({
      message: 'El equipo tiene historial de solicitudes, así que se marcó como agotado en lugar de eliminarse',
      status: 'soft_delete',
    });
  }

  await query('DELETE FROM items WHERE id = ?', [id]);
  return ok({ message: 'Equipo eliminado correctamente', status: 'delete' });
});
