// Consultas SQL reutilizadas por varias rutas de la API.

export const SOLICITUD_SELECT = `
  SELECT s.*,
         i.nombre AS item_nombre,
         i.departamento_id,
         d.nombre AS departamento_nombre,
         u.nombre AS usuario_nombre,
         u.apellido AS usuario_apellido,
         u.matricula,
         u.email AS usuario_email
  FROM solicitudes s
  INNER JOIN items i ON s.item_id = i.id
  INNER JOIN departamentos d ON i.departamento_id = d.id
  INNER JOIN usuarios u ON s.usuario_id = u.id
`;

export const ITEM_SELECT = `
  SELECT i.*, d.nombre AS departamento_nombre
  FROM items i
  INNER JOIN departamentos d ON i.departamento_id = d.id
`;

// Ajusta el estado del equipo según su disponibilidad (respeta "En mantenimiento")
export const SYNC_ITEM_ESTADO = `
  UPDATE items SET estado = CASE
    WHEN estado = 'En mantenimiento' THEN estado
    WHEN cantidad_disponible <= 0 THEN 'Agotado'
    ELSE 'Disponible'
  END
  WHERE id = ?
`;

/** Transiciones de estado permitidas para una solicitud */
export const SOLICITUD_TRANSICIONES = {
  Pendiente: ['Aprobada', 'Rechazada'],
  Aprobada: ['Finalizada', 'Rechazada'],
  Rechazada: [],
  Finalizada: [],
};

/** Escapa un texto para usarlo dentro de un LIKE ... ESCAPE '\' */
export function likePattern(text) {
  return `%${String(text).replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}
