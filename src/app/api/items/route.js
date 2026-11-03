import { query, queryOne } from '@/lib/db';
import { handler, ok, readJson, requireAdmin, requireUser, badRequest } from '@/lib/server/http';
import { ITEM_SELECT, likePattern } from '@/lib/server/queries';
import { hasErrors, firstError, validateItem } from '@/lib/validation';
import { ITEM_ESTADOS } from '@/lib/constants';

// Filtros opcionales: departamento_id, estado, q (nombre o descripción), disponibles=1
export const GET = handler(async (req) => {
  await requireUser();
  const { searchParams } = new URL(req.url);
  const where = [];
  const params = [];

  const departamentoId = searchParams.get('departamento_id');
  if (departamentoId) {
    where.push('i.departamento_id = ?');
    params.push(Number(departamentoId));
  }
  const estado = searchParams.get('estado');
  if (estado && ITEM_ESTADOS.includes(estado)) {
    where.push('i.estado = ?');
    params.push(estado);
  }
  const q = searchParams.get('q')?.trim();
  if (q) {
    where.push("(i.nombre LIKE ? ESCAPE '\\' OR i.descripcion LIKE ? ESCAPE '\\')");
    params.push(likePattern(q), likePattern(q));
  }
  if (searchParams.get('disponibles') === '1') {
    where.push("i.cantidad_disponible > 0 AND i.estado != 'En mantenimiento'");
  }

  const sql = `${ITEM_SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY i.nombre ASC`;
  return ok(await query(sql, params));
});

export const POST = handler(async (req) => {
  await requireAdmin();
  const body = await readJson(req);
  const errors = validateItem(body);
  if (hasErrors(errors)) throw badRequest(firstError(errors), errors);

  const departamento = await queryOne('SELECT id FROM departamentos WHERE id = ?', [Number(body.departamento_id)]);
  if (!departamento) throw badRequest('El departamento seleccionado no existe', { departamento_id: 'El departamento no existe' });

  const total = Number(body.cantidad_total);
  const disponible = body.cantidad_disponible === undefined || body.cantidad_disponible === '' ? total : Number(body.cantidad_disponible);
  const estado = body.estado === 'En mantenimiento' ? 'En mantenimiento' : disponible > 0 ? 'Disponible' : 'Agotado';

  const result = await query(
    `INSERT INTO items (nombre, descripcion, departamento_id, cantidad_total, cantidad_disponible, estado)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [body.nombre.trim(), body.descripcion.trim(), Number(body.departamento_id), total, disponible, estado]
  );
  return ok({ id: result.insertId, message: 'Equipo creado correctamente' }, 201);
});
