// @vitest-environment node
// Pruebas de integración de la API: cada ruta se ejecuta contra una base SQLite temporal.
import fs from 'node:fs';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { call, FUTURE_DATE, loginAs, USERS } from './helpers';

const dbFile = vi.hoisted(() => {
  const file = `${process.env.TEMP || process.env.TMPDIR || '/tmp'}/unphu-api-test-${process.pid}-${Date.now()}.db`;
  process.env.DATABASE_FILE = file;
  return file;
});

vi.mock('next-auth/next', () => ({ getServerSession: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

let routes;
let db;

beforeAll(async () => {
  routes = {
    items: await import('@/app/api/items/route'),
    item: await import('@/app/api/items/[id]/route'),
    solicitudes: await import('@/app/api/solicitudes/route'),
    solicitud: await import('@/app/api/solicitudes/[id]/route'),
    solicitudesAdmin: await import('@/app/api/solicitudes/admin/route'),
    stats: await import('@/app/api/solicitudes/stats/route'),
    departamentos: await import('@/app/api/departamentos/route'),
    departamento: await import('@/app/api/departamentos/[id]/route'),
    departamentoItems: await import('@/app/api/departamentos/[id]/items/route'),
    register: await import('@/app/api/auth/register/route'),
    usuarios: await import('@/app/api/usuarios/route'),
    usuario: await import('@/app/api/usuarios/[id]/route'),
    perfil: await import('@/app/api/perfil/route'),
    password: await import('@/app/api/perfil/password/route'),
    informes: await import('@/app/api/informes/route'),
    resumen: await import('@/app/api/admin/resumen/route'),
  };
  db = await import('@/lib/db');
});

afterAll(() => {
  globalThis.__unphuDb?.close();
  delete globalThis.__unphuDb;
  for (const suffix of ['', '-wal', '-shm']) fs.rmSync(dbFile + suffix, { force: true });
});

const item = async (id) => (await db.queryOne('SELECT * FROM items WHERE id = ?', [id]));

describe('base de datos', () => {
  it('se crea con los datos iniciales', async () => {
    const [{ total }] = await db.query('SELECT COUNT(*) AS total FROM usuarios');
    expect(total).toBe(4);
    expect(fs.existsSync(dbFile)).toBe(true);
  });

  it('las transacciones se revierten si hay un error', async () => {
    expect(() =>
      db.transaction((q) => {
        q("UPDATE items SET nombre = 'Cambiado' WHERE id = 1");
        throw new Error('fallo intencional');
      })
    ).toThrow('fallo intencional');
    expect((await item(1)).nombre).toBe('Cable HDMI');
  });

  it('actualiza updated_at automáticamente', async () => {
    await db.query("UPDATE departamentos SET descripcion = 'x' WHERE id = 1");
    const dep = await db.queryOne('SELECT updated_at FROM departamentos WHERE id = 1');
    expect(dep.updated_at).not.toBe('2025-03-20T03:24:02Z');
  });

  it('devuelve fechas en formato ISO', async () => {
    const sol = await db.queryOne('SELECT fecha_solicitud, fecha_uso FROM solicitudes WHERE id = 4');
    expect(sol.fecha_solicitud).toBe('2025-03-20T18:06:10Z');
    expect(sol.fecha_uso).toBe('2025-03-21T00:00:00');
  });
});

describe('autenticación y permisos', () => {
  it('rechaza peticiones sin sesión', async () => {
    loginAs(null);
    const res = await call(routes.items.GET, 'GET', '/api/items');
    expect(res.status).toBe(401);
  });

  it('impide a un usuario normal usar rutas de administrador', async () => {
    loginAs(USERS.estudiante);
    expect((await call(routes.solicitudesAdmin.GET, 'GET', '/api/solicitudes/admin')).status).toBe(403);
    expect((await call(routes.items.POST, 'POST', '/api/items', { body: {} })).status).toBe(403);
    expect((await call(routes.usuarios.GET, 'GET', '/api/usuarios')).status).toBe(403);
    expect((await call(routes.resumen.GET, 'GET', '/api/admin/resumen')).status).toBe(403);
    expect((await call(routes.informes.GET, 'GET', '/api/informes')).status).toBe(403);
  });

  it('valida el JSON del cuerpo', async () => {
    loginAs(USERS.admin);
    const res = await routes.items.POST(new Request('http://localhost/api/items', { method: 'POST', body: '{malo' }), {});
    expect(res.status).toBe(400);
  });
});

describe('registro e inicio de sesión', () => {
  it('valida los campos', async () => {
    const res = await call(routes.register.POST, 'POST', '/api/auth/register', { body: { matricula: '', password: '1' } });
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveProperty('matricula');
    expect(res.body.details).toHaveProperty('password');
  });

  it('registra un usuario nuevo con la contraseña cifrada', async () => {
    const res = await call(routes.register.POST, 'POST', '/api/auth/register', {
      body: { matricula: 'TS99-0001@unphu.edu.do', nombre: 'Test', apellido: 'Usuario', password: 'clave123' },
    });
    expect(res.status).toBe(201);
    const user = await db.queryOne("SELECT * FROM usuarios WHERE matricula = 'ts99-0001'");
    expect(user.email).toBe('ts99-0001@unphu.edu.do');
    expect(user.rol).toBe('usuario');
    expect(user.password).not.toBe('clave123');
  });

  it('no permite matrículas duplicadas', async () => {
    const res = await call(routes.register.POST, 'POST', '/api/auth/register', {
      body: { matricula: 'ts99-0001', nombre: 'Otro', apellido: 'Usuario', password: 'clave123' },
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/ya está registrada/);
  });

  it('authorize valida credenciales', async () => {
    const { authOptions } = await import('@/lib/auth-options');
    const authorize = authOptions.providers[0].options.authorize;
    expect(await authorize({ email: 'admin', password: 'admin123' })).toMatchObject({ matricula: 'admin', role: 'admin' });
    expect(await authorize({ email: 'ADMIN@unphu.edu.do', password: 'admin123' })).toMatchObject({ id: '1' });
    expect(await authorize({ email: 'admin', password: 'incorrecta' })).toBeNull();
    expect(await authorize({ email: 'noexiste', password: 'admin123' })).toBeNull();
  });
});

describe('equipos', () => {
  let nuevoId;

  it('lista y filtra equipos', async () => {
    loginAs(USERS.estudiante);
    const all = await call(routes.items.GET, 'GET', '/api/items');
    expect(all.body).toHaveLength(9);
    expect(all.body[0]).toHaveProperty('departamento_nombre');
    const filtered = await call(routes.items.GET, 'GET', '/api/items?q=hdmi&departamento_id=1');
    expect(filtered.body.every((i) => i.departamento_id === 1 && /hdmi/i.test(i.nombre + i.descripcion))).toBe(true);
    const escaped = await call(routes.items.GET, 'GET', '/api/items?q=%25');
    expect(escaped.body).toHaveLength(0);
  });

  it('crea un equipo (admin)', async () => {
    loginAs(USERS.admin);
    const bad = await call(routes.items.POST, 'POST', '/api/items', { body: { nombre: '', cantidad_total: 0 } });
    expect(bad.status).toBe(400);
    const missingDep = await call(routes.items.POST, 'POST', '/api/items', {
      body: { nombre: 'X', descripcion: 'Y', departamento_id: 999, cantidad_total: 1 },
    });
    expect(missingDep.status).toBe(400);

    const res = await call(routes.items.POST, 'POST', '/api/items', {
      body: { nombre: 'Proyector Epson', descripcion: 'Proyector portátil', departamento_id: 1, cantidad_total: '1' },
    });
    expect(res.status).toBe(201);
    nuevoId = res.body.id;
    expect(await item(nuevoId)).toMatchObject({ cantidad_total: 1, cantidad_disponible: 1, estado: 'Disponible' });
  });

  it('actualiza un equipo y recalcula su estado', async () => {
    const res = await call(routes.item.PATCH, 'PATCH', `/api/items/${nuevoId}`, { id: nuevoId, body: { cantidad_disponible: 0 } });
    expect(res.status).toBe(200);
    expect(res.body.item.estado).toBe('Agotado');
    const back = await call(routes.item.PATCH, 'PATCH', `/api/items/${nuevoId}`, { id: nuevoId, body: { cantidad_disponible: '1' } });
    expect(back.body.item.estado).toBe('Disponible');
    const invalid = await call(routes.item.PATCH, 'PATCH', `/api/items/${nuevoId}`, { id: nuevoId, body: { cantidad_disponible: 5 } });
    expect(invalid.status).toBe(400);
  });

  it('respeta el estado de mantenimiento', async () => {
    const res = await call(routes.item.PATCH, 'PATCH', '/api/items/9', { id: 9, body: { estado: 'En mantenimiento' } });
    expect(res.body.item.estado).toBe('En mantenimiento');
    loginAs(USERS.estudiante);
    const sol = await call(routes.solicitudes.POST, 'POST', '/api/solicitudes', {
      body: { item_id: 9, fecha_uso: FUTURE_DATE, hora_inicio: '08:00', hora_fin: '09:00', motivo: 'Clase de prueba' },
    });
    expect(sol.status).toBe(400);
    expect(sol.body.error).toMatch(/mantenimiento/);
    loginAs(USERS.admin);
    await call(routes.item.PATCH, 'PATCH', '/api/items/9', { id: 9, body: { estado: 'Disponible' } });
  });

  it('devuelve 404 para equipos inexistentes e ids inválidos', async () => {
    expect((await call(routes.item.GET, 'GET', '/api/items/999', { id: 999 })).status).toBe(404);
    expect((await call(routes.item.GET, 'GET', '/api/items/abc', { id: 'abc' })).status).toBe(400);
  });

  it('elimina un equipo sin historial', async () => {
    const created = await call(routes.items.POST, 'POST', '/api/items', {
      body: { nombre: 'Temporal', descripcion: 'Para borrar', departamento_id: 2, cantidad_total: 2 },
    });
    const res = await call(routes.item.DELETE, 'DELETE', `/api/items/${created.body.id}`, { id: created.body.id });
    expect(res.body.status).toBe('delete');
    expect(await item(created.body.id)).toBeNull();
  });

  it('marca como agotado un equipo con historial', async () => {
    const res = await call(routes.item.DELETE, 'DELETE', '/api/items/7', { id: 7 });
    expect(res.body.status).toBe('soft_delete');
    expect(await item(7)).toMatchObject({ estado: 'Agotado', cantidad_disponible: 0 });
  });

  it('expone el id del equipo creado para los siguientes casos', () => {
    expect(nuevoId).toBeGreaterThan(9);
    globalThis.__testItemId = nuevoId;
  });
});

describe('solicitudes y control de existencias', () => {
  const base = { fecha_uso: FUTURE_DATE, hora_inicio: '10:00', hora_fin: '12:00', motivo: 'Presentación de tesis' };
  let s1;
  let s2;

  it('valida la solicitud', async () => {
    loginAs(USERS.estudiante);
    const past = await call(routes.solicitudes.POST, 'POST', '/api/solicitudes', { body: { ...base, item_id: 1, fecha_uso: '2000-01-01' } });
    expect(past.status).toBe(400);
    const hours = await call(routes.solicitudes.POST, 'POST', '/api/solicitudes', { body: { ...base, item_id: 1, hora_fin: '09:00' } });
    expect(hours.body.details.hora_fin).toMatch(/posterior/);
    const missing = await call(routes.solicitudes.POST, 'POST', '/api/solicitudes', { body: { ...base, item_id: 999 } });
    expect(missing.status).toBe(400);
  });

  it('crea solicitudes y las lista solo para su dueño', async () => {
    const id = globalThis.__testItemId;
    s1 = (await call(routes.solicitudes.POST, 'POST', '/api/solicitudes', { body: { ...base, item_id: id } })).body.id;
    s2 = (await call(routes.solicitudes.POST, 'POST', '/api/solicitudes', { body: { ...base, item_id: id, motivo: 'Segunda solicitud' } })).body.id;
    expect(s1).toBeDefined();
    const mine = await call(routes.solicitudes.GET, 'GET', '/api/solicitudes?estado=Pendiente');
    expect(mine.body.map((s) => s.id)).toEqual(expect.arrayContaining([s1, s2]));
    expect(mine.body.every((s) => s.usuario_id === 5)).toBe(true);

    loginAs(USERS.juan);
    expect((await call(routes.solicitud.GET, 'GET', `/api/solicitudes/${s1}`, { id: s1 })).status).toBe(403);
    expect((await call(routes.solicitud.DELETE, 'DELETE', `/api/solicitudes/${s1}`, { id: s1 })).status).toBe(403);
  });

  it('las estadísticas cuentan por estado', async () => {
    loginAs(USERS.estudiante);
    const res = await call(routes.stats.GET, 'GET', '/api/solicitudes/stats');
    expect(res.body).toMatchObject({ pendientes: 2, finalizadas: 0, total: 2 });
  });

  it('solo un admin puede cambiar el estado', async () => {
    const res = await call(routes.solicitud.PATCH, 'PATCH', `/api/solicitudes/${s1}`, { id: s1, body: { estado: 'Aprobada' } });
    expect(res.status).toBe(403);
  });

  it('aprobar descuenta una unidad y agota el equipo', async () => {
    loginAs(USERS.admin);
    const res = await call(routes.solicitud.PATCH, 'PATCH', `/api/solicitudes/${s1}`, { id: s1, body: { estado: 'Aprobada', comentarios: 'Retirar en el aula 3' } });
    expect(res.status).toBe(200);
    expect(res.body.solicitud).toMatchObject({ estado: 'Aprobada', comentarios: 'Retirar en el aula 3' });
    expect(await item(globalThis.__testItemId)).toMatchObject({ cantidad_disponible: 0, estado: 'Agotado' });
  });

  it('no permite aprobar sin unidades ni transiciones inválidas', async () => {
    const noStock = await call(routes.solicitud.PATCH, 'PATCH', `/api/solicitudes/${s2}`, { id: s2, body: { estado: 'Aprobada' } });
    expect(noStock.status).toBe(409);
    const twice = await call(routes.solicitud.PATCH, 'PATCH', `/api/solicitudes/${s1}`, { id: s1, body: { estado: 'Aprobada' } });
    expect(twice.status).toBe(400);
    const invalid = await call(routes.solicitud.PATCH, 'PATCH', `/api/solicitudes/${s1}`, { id: s1, body: { estado: 'Borrada' } });
    expect(invalid.status).toBe(400);
  });

  it('no permite reducir el total por debajo de las unidades prestadas', async () => {
    const id = globalThis.__testItemId;
    const res = await call(routes.item.PATCH, 'PATCH', `/api/items/${id}`, { id, body: { cantidad_total: 0, cantidad_disponible: 0 } });
    expect(res.status).toBe(400);
    const del = await call(routes.item.DELETE, 'DELETE', `/api/items/${id}`, { id });
    expect(del.status).toBe(400);
  });

  it('finalizar devuelve la unidad al inventario', async () => {
    const res = await call(routes.solicitud.PATCH, 'PATCH', `/api/solicitudes/${s1}`, { id: s1, body: { estado: 'Finalizada' } });
    expect(res.body.solicitud.estado).toBe('Finalizada');
    expect(await item(globalThis.__testItemId)).toMatchObject({ cantidad_disponible: 1, estado: 'Disponible' });
    const reopen = await call(routes.solicitud.PATCH, 'PATCH', `/api/solicitudes/${s1}`, { id: s1, body: { estado: 'Aprobada' } });
    expect(reopen.status).toBe(400);
  });

  it('rechazar una aprobada también devuelve la unidad', async () => {
    await call(routes.solicitud.PATCH, 'PATCH', `/api/solicitudes/${s2}`, { id: s2, body: { estado: 'Aprobada' } });
    expect((await item(globalThis.__testItemId)).cantidad_disponible).toBe(0);
    await call(routes.solicitud.PATCH, 'PATCH', `/api/solicitudes/${s2}`, { id: s2, body: { estado: 'Rechazada', comentarios: 'Cancelada por mantenimiento' } });
    expect((await item(globalThis.__testItemId)).cantidad_disponible).toBe(1);
  });

  it('el dueño solo puede cancelar solicitudes pendientes', async () => {
    loginAs(USERS.estudiante);
    expect((await call(routes.solicitud.DELETE, 'DELETE', `/api/solicitudes/${s1}`, { id: s1 })).status).toBe(400);
    const pending = (await call(routes.solicitudes.POST, 'POST', '/api/solicitudes', { body: { ...base, item_id: 1 } })).body.id;
    const res = await call(routes.solicitud.DELETE, 'DELETE', `/api/solicitudes/${pending}`, { id: pending });
    expect(res.status).toBe(200);
    expect(await db.queryOne('SELECT id FROM solicitudes WHERE id = ?', [pending])).toBeNull();
  });

  it('un admin que elimina una solicitud aprobada repone la unidad', async () => {
    const id = (await call(routes.solicitudes.POST, 'POST', '/api/solicitudes', { body: { ...base, item_id: 1 } })).body.id;
    loginAs(USERS.admin);
    await call(routes.solicitud.PATCH, 'PATCH', `/api/solicitudes/${id}`, { id, body: { estado: 'Aprobada' } });
    expect((await item(1)).cantidad_disponible).toBe(19);
    await call(routes.solicitud.DELETE, 'DELETE', `/api/solicitudes/${id}`, { id });
    expect((await item(1)).cantidad_disponible).toBe(20);
  });

  it('el listado de administración filtra y busca', async () => {
    const res = await call(routes.solicitudesAdmin.GET, 'GET', '/api/solicitudes/admin?estado=Rechazada&q=miliano');
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((s) => s.estado === 'Rechazada' && s.usuario_apellido === 'Miliano')).toBe(true);
  });
});

describe('departamentos', () => {
  it('lista con resumen de inventario', async () => {
    loginAs(USERS.estudiante);
    const res = await call(routes.departamentos.GET, 'GET', '/api/departamentos');
    expect(res.body[0]).toHaveProperty('total_items');
    expect(res.body[0]).toHaveProperty('unidades_disponibles');
    const items = await call(routes.departamentoItems.GET, 'GET', '/api/departamentos/1/items', { id: 1 });
    expect(items.body.every((i) => i.departamento_id === 1)).toBe(true);
  });

  it('crea, edita y elimina (admin)', async () => {
    loginAs(USERS.admin);
    const dup = await call(routes.departamentos.POST, 'POST', '/api/departamentos', { body: { nombre: 'audiovisual' } });
    expect(dup.status).toBe(400);
    const created = await call(routes.departamentos.POST, 'POST', '/api/departamentos', { body: { nombre: 'Laboratorio', descripcion: 'Equipos de laboratorio' } });
    expect(created.status).toBe(201);
    const id = created.body.id;
    const edited = await call(routes.departamento.PATCH, 'PATCH', `/api/departamentos/${id}`, { id, body: { nombre: 'Laboratorio de Física' } });
    expect(edited.status).toBe(200);
    expect((await call(routes.departamento.GET, 'GET', `/api/departamentos/${id}`, { id })).body.nombre).toBe('Laboratorio de Física');
    expect((await call(routes.departamento.DELETE, 'DELETE', `/api/departamentos/${id}`, { id })).status).toBe(200);
  });

  it('no elimina departamentos con equipos', async () => {
    const res = await call(routes.departamento.DELETE, 'DELETE', '/api/departamentos/1', { id: 1 });
    expect(res.status).toBe(400);
  });
});

describe('usuarios y perfil', () => {
  it('lista usuarios con su actividad', async () => {
    loginAs(USERS.admin);
    const res = await call(routes.usuarios.GET, 'GET', '/api/usuarios?q=miliano');
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ matricula: 'jm18-0990' });
    expect(res.body[0]).not.toHaveProperty('password');
  });

  it('cambia roles con protecciones', async () => {
    const self = await call(routes.usuario.PATCH, 'PATCH', '/api/usuarios/1', { id: 1, body: { rol: 'usuario' } });
    expect(self.status).toBe(400);
    const promote = await call(routes.usuario.PATCH, 'PATCH', '/api/usuarios/4', { id: 4, body: { rol: 'admin' } });
    expect(promote.status).toBe(200);
    const demote = await call(routes.usuario.PATCH, 'PATCH', '/api/usuarios/4', { id: 4, body: { rol: 'usuario' } });
    expect(demote.status).toBe(200);
    expect((await call(routes.usuario.PATCH, 'PATCH', '/api/usuarios/4', { id: 4, body: { rol: 'jefe' } })).status).toBe(400);
  });

  it('actualiza el perfil propio', async () => {
    loginAs(USERS.estudiante);
    const res = await call(routes.perfil.PATCH, 'PATCH', '/api/perfil', { body: { nombre: 'Mario Andrés', apellido: 'Mesa' } });
    expect(res.body.perfil.nombre).toBe('Mario Andrés');
    expect(res.body.perfil).not.toHaveProperty('password');
    expect((await call(routes.perfil.PATCH, 'PATCH', '/api/perfil', { body: { nombre: '', apellido: 'X' } })).status).toBe(400);
  });

  it('cambia la contraseña verificando la actual', async () => {
    loginAs(USERS.admin);
    const wrong = await call(routes.password.PATCH, 'PATCH', '/api/perfil/password', { body: { actual: 'mala', nueva: 'nueva123' } });
    expect(wrong.status).toBe(400);
    expect(wrong.body.details).toHaveProperty('actual');
    const ok = await call(routes.password.PATCH, 'PATCH', '/api/perfil/password', { body: { actual: 'admin123', nueva: 'nueva123' } });
    expect(ok.status).toBe(200);
    const { authOptions } = await import('@/lib/auth-options');
    expect(await authOptions.providers[0].options.authorize({ email: 'admin', password: 'nueva123' })).not.toBeNull();
  });
});

describe('informes y resumen', () => {
  it('genera el informe completo', async () => {
    loginAs(USERS.admin);
    const res = await call(routes.informes.GET, 'GET', '/api/informes?periodo=1y&tipo=completo');
    expect(res.status).toBe(200);
    expect(res.body.meta).toMatchObject({ periodo: '1y', tipo: 'completo' });
    expect(res.body.equipos.length).toBeGreaterThan(0);
    expect(res.body.usuarios.length).toBeGreaterThan(0);
    expect(res.body.resumen.total).toBe(Object.values(res.body.resumen.porEstado).reduce((a, b) => a + b, 0));
  });

  it('usa valores por defecto con parámetros inválidos', async () => {
    const res = await call(routes.informes.GET, 'GET', '/api/informes?periodo=xx&tipo=yy');
    expect(res.body.meta).toMatchObject({ periodo: '24h', tipo: 'completo' });
  });

  it('el resumen del panel incluye todas las secciones', async () => {
    const res = await call(routes.resumen.GET, 'GET', '/api/admin/resumen');
    expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['solicitudes', 'inventario', 'usuarios', 'departamentos', 'pendientesRecientes', 'stockBajo']));
    expect(res.body.usuarios.total).toBe(5);
  });
});
