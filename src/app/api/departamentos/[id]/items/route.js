import { query, queryOne } from '@/lib/db';
import { handler, ok, requireUser, notFound, parseId } from '@/lib/server/http';
import { ITEM_SELECT } from '@/lib/server/queries';

export const GET = handler(async (req, { params }) => {
  await requireUser();
  const id = parseId((await params).id);
  const departamento = await queryOne('SELECT id FROM departamentos WHERE id = ?', [id]);
  if (!departamento) throw notFound('Departamento no encontrado');
  return ok(await query(`${ITEM_SELECT} WHERE i.departamento_id = ? ORDER BY i.nombre ASC`, [id]));
});
