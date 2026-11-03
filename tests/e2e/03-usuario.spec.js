import { expect, test } from '@playwright/test';
import { futureDate, login, logout, registerViaApi, shot } from './helpers';

const ESTUDIANTE = { matricula: 'cd24-0002', nombre: 'Carlos', apellido: 'Duarte', password: 'clave123' };

test.describe.configure({ mode: 'serial' });

test.describe('Flujo del estudiante', () => {
  test.beforeAll(async ({ request }) => {
    await registerViaApi(request, ESTUDIANTE);
  });

  test.beforeEach(async ({ page }) => {
    await login(page, ESTUDIANTE);
  });

  test('el panel inicial está vacío y guía al usuario', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Carlos');
    await expect(page.getByText('Aún no tienes solicitudes')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Navegación principal' })).not.toContainText('Administración');
    await shot(page, 'usuario-01-panel-vacio');
  });

  test('no puede entrar a las secciones de administración', async ({ page }) => {
    await page.goto('/dashboard/admin/inventario');
    await expect(page).toHaveURL(/\/dashboard$/);
    const res = await page.request.get('/api/solicitudes/admin');
    expect(res.status()).toBe(403);
  });

  test('valida el formulario de nueva solicitud', async ({ page }) => {
    await page.goto('/dashboard/nueva-solicitud');
    await page.getByRole('button', { name: 'Enviar solicitud' }).click();
    await expect(page.getByText('Selecciona un equipo').first()).toBeVisible();
    await expect(page.getByText('Selecciona la fecha de uso')).toBeVisible();
    await expect(page.getByText('Describe el motivo de uso')).toBeVisible();
  });

  test('crea una solicitud de préstamo', async ({ page }) => {
    await page.goto('/dashboard/nueva-solicitud');
    await page.getByRole('tab', { name: 'Audiovisual' }).click();
    await page.getByRole('searchbox', { name: 'Buscar equipo' }).fill('Adaptador');
    const card = page.getByRole('button', { name: /Adaptador HDMI a VGA/ });
    await expect(card).toBeVisible();
    await expect(page.getByRole('button', { name: /Cable VGA/ })).toHaveCount(0);
    await card.click();
    await expect(card).toHaveAttribute('aria-pressed', 'true');

    await page.getByLabel('Fecha de uso').fill(await futureDate(page, 2));
    await page.getByLabel('Hora de inicio').fill('10:00');
    await page.getByLabel('Hora de fin').fill('09:00');
    await page.getByLabel('Motivo de uso').fill('Presentación final de la asignatura de Redes');
    await page.getByRole('button', { name: 'Enviar solicitud' }).click();
    await expect(page.getByText('La hora de fin debe ser posterior a la de inicio').first()).toBeVisible();

    await page.getByLabel('Hora de fin').fill('12:00');
    await expect(page.getByText('Adaptador HDMI a VGA').last()).toBeVisible();
    await shot(page, 'usuario-02-nueva-solicitud');
    await page.getByRole('button', { name: 'Enviar solicitud' }).click();

    await expect(page).toHaveURL(/\/dashboard\/solicitudes\/\d+$/);
    await expect(page.getByText('Solicitud enviada', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Adaptador HDMI a VGA');
    await expect(page.getByText('En espera de revisión')).toBeVisible();
    await shot(page, 'usuario-03-detalle-solicitud');
  });

  test('crea una segunda solicitud preseleccionando el equipo', async ({ page }) => {
    const items = await (await page.request.get('/api/items?q=Pizzara')).json();
    await page.goto(`/dashboard/nueva-solicitud?item=${items[0].id}`);
    await expect(page.getByRole('button', { name: /Pizzara movil/ })).toHaveAttribute('aria-pressed', 'true');
    await page.getByLabel('Fecha de uso').fill(await futureDate(page, 3));
    await page.getByLabel('Hora de inicio').fill('14:00');
    await page.getByLabel('Hora de fin').fill('16:00');
    await page.getByLabel('Motivo de uso').fill('Taller de matemáticas para primer año');
    await page.getByRole('button', { name: 'Enviar solicitud' }).click();
    await expect(page).toHaveURL(/\/dashboard\/solicitudes\/\d+$/);
  });

  test('lista, filtra y cancela solicitudes', async ({ page }) => {
    await page.goto('/dashboard/solicitudes');
    await expect(page.getByRole('tab', { name: /Pendientes/ })).toContainText('2');
    await expect(page.getByRole('row')).toHaveCount(3);
    await shot(page, 'usuario-04-mis-solicitudes');

    await page.getByRole('tab', { name: /Finalizadas/ }).click();
    await expect(page).toHaveURL(/estado=Finalizada/);
    await expect(page.getByText('No tienes solicitudes finalizadas')).toBeVisible();

    await page.getByRole('tab', { name: /Todas/ }).click();
    await page.getByRole('button', { name: 'Cancelar solicitud de Pizzara movil' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Cancelar solicitud');
    await shot(page, 'usuario-05-confirmar-cancelacion', { fullPage: false });
    await dialog.getByRole('button', { name: 'Sí, cancelar' }).click();
    await expect(page.getByText('Solicitud cancelada correctamente')).toBeVisible();
    await expect(page.getByRole('row')).toHaveCount(2);
  });

  test('el panel muestra las estadísticas actualizadas', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Pendientes/ })).toContainText('1');
    await expect(page.getByText('Adaptador HDMI a VGA')).toBeVisible();
    await shot(page, 'usuario-06-panel');
  });

  test('actualiza su perfil y su contraseña', async ({ page }) => {
    await page.goto('/dashboard/perfil');
    await shot(page, 'usuario-07-perfil');
    await page.getByLabel('Nombre', { exact: true }).fill('Carlos Manuel');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page.getByText('Perfil actualizado correctamente')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Menú de usuario' })).toContainText('Carlos Manuel Duarte');

    await page.getByLabel('Contraseña actual').fill('incorrecta');
    await page.getByLabel('Nueva contraseña', { exact: true }).fill('nuevaClave1');
    await page.getByLabel('Confirmar nueva contraseña').fill('nuevaClave1');
    await page.getByRole('button', { name: 'Actualizar contraseña' }).click();
    await expect(page.getByText('La contraseña actual no es correcta')).toBeVisible();

    await page.getByLabel('Contraseña actual').fill(ESTUDIANTE.password);
    await page.getByRole('button', { name: 'Actualizar contraseña' }).click();
    await expect(page.getByText('Contraseña actualizada correctamente')).toBeVisible();

    await logout(page);
    ESTUDIANTE.password = 'nuevaClave1';
    await login(page, ESTUDIANTE);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Carlos');
  });
});
