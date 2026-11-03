import fs from 'node:fs';
import { expect, test } from '@playwright/test';
import { ADMIN, futureDate, login, registerViaApi, shot } from './helpers';

const ESTUDIANTE = { matricula: 'ef24-0003', nombre: 'Elena', apellido: 'Fernández', password: 'clave123' };

test.describe.configure({ mode: 'serial' });

test.describe('Flujo del administrador', () => {
  test.beforeAll(async ({ browser, request }) => {
    // Una estudiante crea una solicitud pendiente para revisar
    await registerViaApi(request, ESTUDIANTE);
    const page = await browser.newPage();
    await login(page, ESTUDIANTE);
    const [item] = await (await page.request.get('/api/items?q=Adaptador HDMI a VGA')).json();
    const res = await page.request.post('/api/solicitudes', {
      data: { item_id: item.id, fecha_uso: await futureDate(page, 2), hora_inicio: '08:00', hora_fin: '10:00', motivo: 'Defensa de proyecto final' },
    });
    expect(res.status()).toBe(201);
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    await login(page, ADMIN);
  });

  test('el panel muestra indicadores y la cola de revisión', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Panel de administración' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Por revisar/ })).not.toContainText(/^Por revisar0/);
    const nav = page.getByRole('navigation', { name: 'Navegación principal' });
    await expect(nav).toContainText('Administración');
    await expect(nav.getByLabel(/pendientes/)).toBeVisible();
    await expect(page.getByText('Elena Fernández').first()).toBeVisible();
    await shot(page, 'admin-01-panel');
  });

  test('aprueba una solicitud desde el panel y descuenta existencias', async ({ page }) => {
    const before = (await (await page.request.get('/api/items?q=Adaptador HDMI a VGA')).json())[0].cantidad_disponible;
    const fila = page.locator('li', { hasText: 'Elena Fernández' }).first();
    await fila.getByRole('button', { name: 'Aprobar' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Aprobar solicitud');
    await dialog.getByLabel('Comentarios').fill('Retirar en la oficina de Audiovisual a las 7:45');
    await shot(page, 'admin-02-aprobar', { fullPage: false });
    await dialog.getByRole('button', { name: 'Aprobar' }).click();
    await expect(page.getByText('Solicitud aprobada correctamente')).toBeVisible();
    const after = (await (await page.request.get('/api/items?q=Adaptador HDMI a VGA')).json())[0].cantidad_disponible;
    expect(after).toBe(before - 1);
  });

  test('gestiona solicitudes: filtra, ve el detalle y registra la devolución', async ({ page }) => {
    await page.goto('/dashboard/admin/solicitudes');
    await shot(page, 'admin-03-solicitudes');
    await page.getByRole('tab', { name: /Aprobadas/ }).click();
    await page.getByRole('searchbox', { name: 'Buscar solicitudes' }).fill('Fernández');
    await expect(page).toHaveURL(/q=Fern/);
    await page.getByRole('cell', { name: /Elena Fernández/ }).click();

    const detalle = page.getByRole('dialog');
    await expect(detalle).toContainText('Retirar en la oficina de Audiovisual');
    await expect(detalle).toContainText('ef24-0003');
    await shot(page, 'admin-04-detalle-solicitud', { fullPage: false });
    await detalle.getByRole('button', { name: 'Devolución' }).click();

    const decision = page.getByRole('dialog');
    await expect(decision).toContainText('Registrar devolución');
    await decision.getByRole('button', { name: 'Registrar devolución' }).click();
    await expect(page.getByText('Solicitud finalizada correctamente')).toBeVisible();
    await expect(page.getByText(/No hay solicitudes aprobadas|Sin resultados/)).toBeVisible();
  });

  test('rechazar exige indicar el motivo', async ({ page }) => {
    const [item] = await (await page.request.get('/api/items?q=Cables VGA')).json();
    await page.request.post('/api/solicitudes', {
      data: { item_id: item.id, fecha_uso: await futureDate(page, 5), hora_inicio: '13:00', hora_fin: '15:00', motivo: 'Prueba de rechazo' },
    });
    await page.goto('/dashboard/admin/solicitudes?estado=Pendiente');
    await page.getByRole('row', { name: /Cables VGA/ }).getByRole('button', { name: 'Rechazar' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Rechazar' }).click();
    await expect(dialog.getByText('Escribe el motivo para que el usuario sepa por qué')).toBeVisible();
    await dialog.getByLabel('Motivo del rechazo').fill('El equipo está reservado para un evento institucional');
    await dialog.getByRole('button', { name: 'Rechazar' }).click();
    await expect(page.getByText('Solicitud rechazada correctamente')).toBeVisible();
  });

  test('registra, edita y elimina un equipo', async ({ page }) => {
    await page.goto('/dashboard/admin/inventario');
    await shot(page, 'admin-05-inventario');
    await page.getByRole('link', { name: 'Nuevo equipo' }).first().click();
    await expect(page).toHaveURL(/inventario\/nuevo$/);

    await page.getByRole('button', { name: 'Registrar equipo' }).click();
    await expect(page.getByText('El nombre es obligatorio').first()).toBeVisible();

    await page.getByLabel('Nombre del equipo').fill('Micrófono inalámbrico Shure');
    await page.getByLabel('Departamento').selectOption({ label: 'Audiovisual' });
    await page.getByLabel('Descripción').fill('Micrófono de mano con receptor, ideal para conferencias.');
    await page.getByLabel('Cantidad total').fill('4');
    await shot(page, 'admin-06-nuevo-equipo');
    await page.getByRole('button', { name: 'Registrar equipo' }).click();

    await expect(page.getByText('Equipo registrado')).toBeVisible();
    await expect(page).toHaveURL(/inventario\?q=/);
    const fila = page.getByRole('row', { name: /Micrófono inalámbrico Shure/ });
    await expect(fila).toContainText('4');
    await fila.getByRole('link', { name: /Editar/ }).click();

    await expect(page).toHaveURL(/inventario\/editar\/\d+$/);
    await page.getByLabel('Cantidad disponible').fill('9');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page.getByText('No puede ser mayor que la cantidad total').first()).toBeVisible();
    await page.getByLabel('Cantidad disponible').fill('3');
    await shot(page, 'admin-07-editar-equipo');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page.getByText('Cambios guardados')).toBeVisible();

    await page.getByRole('searchbox', { name: 'Buscar equipos' }).fill('Shure');
    const editada = page.getByRole('row', { name: /Micrófono inalámbrico Shure/ });
    await expect(editada).toContainText('3');
    await editada.getByRole('button', { name: /Eliminar/ }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Eliminar' }).click();
    await expect(page.getByText('Equipo eliminado correctamente')).toBeVisible();
    await expect(page.getByText('Sin resultados')).toBeVisible();
  });

  test('filtra el inventario por departamento y estado', async ({ page }) => {
    await page.goto('/dashboard/admin/inventario');
    await page.getByRole('tab', { name: /Tecnología/ }).click();
    await expect(page).toHaveURL(/departamento=2/);
    await expect(page.getByRole('row', { name: /Cable HDMI\b/ })).toHaveCount(0);
    await page.getByLabel('Filtrar por estado').selectOption('Agotado');
    await expect(page.getByText(/Sin resultados|Ningún equipo/).first()).toBeVisible();
  });

  test('crea, edita y elimina un departamento', async ({ page }) => {
    await page.goto('/dashboard/admin/departamentos');
    await shot(page, 'admin-08-departamentos');
    await page.getByRole('button', { name: 'Nuevo departamento' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Nombre').fill('audiovisual');
    await dialog.getByRole('button', { name: 'Crear departamento' }).click();
    await expect(dialog.getByText('Ya existe un departamento con ese nombre')).toBeVisible();
    await dialog.getByLabel('Nombre').fill('Laboratorio de Física');
    await dialog.getByLabel('Descripción').fill('Equipos de medición y experimentos');
    await dialog.getByRole('button', { name: 'Crear departamento' }).click();
    await expect(page.getByText('Departamento creado correctamente')).toBeVisible();

    await page.getByRole('button', { name: 'Editar Laboratorio de Física' }).click();
    await page.getByRole('dialog').getByLabel('Nombre').fill('Laboratorio de Ciencias');
    await page.getByRole('dialog').getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page.getByRole('heading', { name: 'Laboratorio de Ciencias' })).toBeVisible();

    await page.getByRole('button', { name: 'Eliminar Laboratorio de Ciencias' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Eliminar' }).click();
    await expect(page.getByText('Departamento eliminado correctamente')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Laboratorio de Ciencias' })).toHaveCount(0);
  });

  test('cambia el rol de un usuario', async ({ page }) => {
    await page.goto('/dashboard/admin/usuarios');
    await shot(page, 'admin-09-usuarios');
    await page.getByRole('searchbox', { name: 'Buscar usuarios' }).fill('Fernández');
    const fila = page.getByRole('row', { name: /Elena Fernández/ });
    await expect(page.getByRole('row')).toHaveCount(2);
    await fila.getByRole('button', { name: 'Hacer admin' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Hacer administrador' }).click();
    await expect(page.getByText('El usuario ahora es administrador')).toBeVisible();
    await expect(fila).toContainText('Administrador');
    await fila.getByRole('button', { name: 'Quitar admin' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Quitar permisos' }).click();
    await expect(page.getByText('El usuario ahora tiene rol de usuario')).toBeVisible();
  });

  test('genera informes con gráfico, tabla y PDF', async ({ page }) => {
    await page.goto('/dashboard/admin/informes');
    await page.getByLabel('Periodo').selectOption({ label: 'Último año' });
    const equipos = page.locator('div.rounded-2xl', { has: page.getByRole('heading', { name: 'Equipos más solicitados' }) });
    await expect(equipos.getByRole('list', { name: /Ranking/ })).toBeVisible();
    await expect(equipos).toContainText('Adaptador HDMI a VGA');
    await shot(page, 'admin-10-informes');

    await equipos.getByRole('button', { name: 'Tabla' }).click();
    await expect(equipos.getByRole('columnheader', { name: 'Equipo' })).toBeVisible();

    const pdfButton = page.getByRole('link', { name: 'Descargar PDF' });
    await expect(pdfButton).toBeVisible({ timeout: 30_000 });
    const [download] = await Promise.all([page.waitForEvent('download'), pdfButton.click()]);
    expect(download.suggestedFilename()).toMatch(/^informe-unphu-1y-\d{4}-\d{2}-\d{2}\.pdf$/);
    const file = await download.path();
    const header = fs.readFileSync(file).subarray(0, 5).toString();
    expect(header).toBe('%PDF-');
    expect(fs.statSync(file).size).toBeGreaterThan(5_000);
  });
});
