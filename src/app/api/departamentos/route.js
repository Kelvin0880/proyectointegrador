import { query, queryOne } from '@/lib/db';
import { handler, ok, readJson, requireAdmin, requireUser, badRequest } from '@/lib/server/http';
import { hasErrors, firstError, validateDepartamento } from '@/lib/validation';

// Lista de departamentos con el resumen de su inventario
export const GET = handler(async () => {
  await requireUser();
  const departamentos = await query(`
    SELECT d.*,
           COUNT(i.id) AS total_items,
           COALESCE(SUM(i.cantidad_total), 0) AS total_unidades,
           COALESCE(SUM(i.cantidad_disponible), 0) AS unidades_disponibles
    FROM departamentos d
    LEFT JOIN items i ON i.departamento_id = d.id
    GROUP BY d.id
    ORDER BY d.nombre ASC
  `);
  return ok(departamentos);
});

export const POST = handler(async (req) => {
  await requireAdmin();
  const body = await readJson(req);
  const errors = validateDepartamento(body);
  if (hasErrors(errors)) throw badRequest(firstError(errors), errors);

  const nombre = body.nombre.trim();
  const existing = await queryOne('SELECT id FROM departamentos WHERE LOWER(nombre) = LOWER(?)', [nombre]);
  if (existing) throw badRequest('Ya existe un departamento con ese nombre', { nombre: 'Ya existe un departamento con ese nombre' });

  const result = await query('INSERT INTO departamentos (nombre, descripcion) VALUES (?, ?)', [nombre, body.descripcion?.trim() || null]);
  return ok({ id: result.insertId, message: 'Departamento creado correctamente' }, 201);
});
