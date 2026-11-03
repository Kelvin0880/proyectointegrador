import { query, queryOne } from '@/lib/db';
import { handler, ok, readJson, requireAdmin, badRequest, notFound, parseId } from '@/lib/server/http';

// Cambia el rol de un usuario (solo administradores)
export const PATCH = handler(async (req, { params }) => {
  const admin = await requireAdmin();
  const id = parseId((await params).id);
  const { rol } = await readJson(req);

  if (rol !== 'admin' && rol !== 'usuario') throw badRequest('Rol no válido');
  const usuario = await queryOne('SELECT id, rol FROM usuarios WHERE id = ?', [id]);
  if (!usuario) throw notFound('Usuario no encontrado');

  if (String(id) === String(admin.id) && rol !== 'admin') {
    throw badRequest('No puedes quitarte a ti mismo los permisos de administrador');
  }
  if (usuario.rol === 'admin' && rol !== 'admin') {
    const { total } = await queryOne("SELECT COUNT(*) AS total FROM usuarios WHERE rol = 'admin'");
    if (total <= 1) throw badRequest('Debe quedar al menos un administrador en el sistema');
  }

  await query('UPDATE usuarios SET rol = ? WHERE id = ?', [rol, id]);
  return ok({ message: rol === 'admin' ? 'El usuario ahora es administrador' : 'El usuario ahora tiene rol de usuario' });
});
