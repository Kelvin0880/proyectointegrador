import { query } from '@/lib/db';
import { handler, ok, requireUser } from '@/lib/server/http';
import { SOLICITUD_ESTADOS } from '@/lib/constants';

// Cantidad de solicitudes del usuario actual por estado
export const GET = handler(async () => {
  const user = await requireUser();
  const rows = await query('SELECT estado, COUNT(*) AS total FROM solicitudes WHERE usuario_id = ? GROUP BY estado', [user.id]);
  const byEstado = Object.fromEntries(SOLICITUD_ESTADOS.map((e) => [e, 0]));
  for (const row of rows) byEstado[row.estado] = row.total;

  return ok({
    pendientes: byEstado.Pendiente,
    aprobadas: byEstado.Aprobada,
    rechazadas: byEstado.Rechazada,
    finalizadas: byEstado.Finalizada,
    total: rows.reduce((sum, r) => sum + r.total, 0),
  });
});
