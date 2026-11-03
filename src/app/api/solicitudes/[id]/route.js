import { queryOne, transaction } from '@/lib/db';
import {
  handler, ok, readJson, requireUser, requireAdmin, isAdmin,
  badRequest, notFound, forbidden, parseId, HttpError,
} from '@/lib/server/http';
import { SOLICITUD_SELECT, SOLICITUD_TRANSICIONES, SYNC_ITEM_ESTADO } from '@/lib/server/queries';
import { isValidSolicitudEstado } from '@/lib/validation';

async function findSolicitud(id) {
  const solicitud = await queryOne(`${SOLICITUD_SELECT} WHERE s.id = ?`, [id]);
  if (!solicitud) throw notFound('Solicitud no encontrada');
  return solicitud;
}

function assertCanView(user, solicitud) {
  if (!isAdmin(user) && String(solicitud.usuario_id) !== String(user.id)) {
    throw forbidden('No tienes permiso para ver esta solicitud');
  }
}

export const GET = handler(async (req, { params }) => {
  const user = await requireUser();
  const id = parseId((await params).id);
  const solicitud = await findSolicitud(id);
  assertCanView(user, solicitud);
  return ok(solicitud);
});

// Cambio de estado (solo administradores). Ajusta el inventario de forma atómica.
export const PATCH = handler(async (req, { params }) => {
  await requireAdmin();
  const id = parseId((await params).id);
  const { estado, comentarios } = await readJson(req);

  if (!isValidSolicitudEstado(estado)) throw badRequest('Estado no válido');
  if (comentarios !== undefined && comentarios !== null && String(comentarios).length > 500) {
    throw badRequest('Los comentarios no pueden superar 500 caracteres');
  }

  transaction((q) => {
    const [solicitud] = q('SELECT * FROM solicitudes WHERE id = ?', [id]);
    if (!solicitud) throw notFound('Solicitud no encontrada');

    const permitidos = SOLICITUD_TRANSICIONES[solicitud.estado] ?? [];
    if (!permitidos.includes(estado)) {
      throw badRequest(`No se puede cambiar una solicitud ${solicitud.estado.toLowerCase()} a ${estado.toLowerCase()}`);
    }

    if (estado === 'Aprobada') {
      const [item] = q('SELECT cantidad_disponible, estado FROM items WHERE id = ?', [solicitud.item_id]);
      if (!item || item.cantidad_disponible <= 0) {
        throw new HttpError(409, 'No hay unidades disponibles de este equipo para aprobar la solicitud');
      }
      if (item.estado === 'En mantenimiento') {
        throw new HttpError(409, 'El equipo está en mantenimiento');
      }
      q('UPDATE items SET cantidad_disponible = cantidad_disponible - 1 WHERE id = ?', [solicitud.item_id]);
    }

    // Una solicitud aprobada que se finaliza o se rechaza devuelve la unidad al inventario
    if (solicitud.estado === 'Aprobada') {
      q('UPDATE items SET cantidad_disponible = MIN(cantidad_total, cantidad_disponible + 1) WHERE id = ?', [solicitud.item_id]);
    }

    q(SYNC_ITEM_ESTADO, [solicitud.item_id]);
    q('UPDATE solicitudes SET estado = ?, comentarios = ? WHERE id = ?', [
      estado,
      comentarios?.trim() ? comentarios.trim() : solicitud.comentarios,
      id,
    ]);
  });

  return ok({ message: `Solicitud ${estado.toLowerCase()} correctamente`, solicitud: await findSolicitud(id) });
});

// El dueño puede cancelar sus solicitudes pendientes; un administrador puede eliminar cualquiera
export const DELETE = handler(async (req, { params }) => {
  const user = await requireUser();
  const id = parseId((await params).id);
  const solicitud = await findSolicitud(id);
  assertCanView(user, solicitud);

  if (!isAdmin(user) && solicitud.estado !== 'Pendiente') {
    throw badRequest('Solo puedes cancelar solicitudes que estén pendientes');
  }

  transaction((q) => {
    q('DELETE FROM solicitudes WHERE id = ?', [id]);
    if (solicitud.estado === 'Aprobada') {
      q('UPDATE items SET cantidad_disponible = MIN(cantidad_total, cantidad_disponible + 1) WHERE id = ?', [solicitud.item_id]);
      q(SYNC_ITEM_ESTADO, [solicitud.item_id]);
    }
  });

  return ok({ message: isAdmin(user) ? 'Solicitud eliminada correctamente' : 'Solicitud cancelada correctamente' });
});
