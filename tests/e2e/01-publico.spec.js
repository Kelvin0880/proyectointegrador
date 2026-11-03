import { expect, test } from '@playwright/test';
import { shot } from './helpers';

test.describe('Páginas públicas', () => {
  test('la portada muestra el logo, la propuesta y los accesos', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('UNPHU Inventario');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Sistema de Inventario UNPHU');
    await expect(page.getByAltText(/Escudo de la Universidad/)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Cómo funciona' })).toBeVisible();
    await shot(page, 'publico-01-portada');

    await page.getByRole('link', { name: 'Crear cuenta' }).first().click();
    await expect(page).toHaveURL(/\/auth\/register$/);
    await expect(page.getByRole('heading', { name: 'Crear cuenta' })).toBeVisible();
  });

  test('pantallas de inicio de sesión y registro', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page).toHaveTitle('Iniciar sesión | UNPHU Inventario');
    await expect(page.getByLabel('Matrícula')).toBeFocused();
    await shot(page, 'publico-02-login');

    await page.goto('/auth/register');
    await shot(page, 'publico-03-registro');
  });

  test('las rutas del panel exigen iniciar sesión', async ({ page }) => {
    await page.goto('/dashboard/solicitudes?estado=Pendiente');
    await expect(page).toHaveURL(/\/auth\/login\?callbackUrl=/);
    expect(decodeURIComponent(page.url())).toContain('callbackUrl=/dashboard/solicitudes?estado=Pendiente');
  });

  test('la API rechaza peticiones sin sesión', async ({ request }) => {
    const res = await request.get('/api/items');
    expect(res.status()).toBe(401);
    expect(await res.json()).toMatchObject({ error: expect.any(String) });
  });

  test('página 404 personalizada', async ({ page }) => {
    const res = await page.goto('/esta-pagina-no-existe');
    expect(res.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'Página no encontrada' })).toBeVisible();
    await shot(page, 'publico-04-404');
    await page.getByRole('link', { name: 'Volver al inicio' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('la ruta antigua de nuevo equipo redirige', async ({ page }) => {
    await page.goto('/dashboard/admin/nuevo-item');
    await expect(page).toHaveURL(/\/auth\/login/);
    expect(decodeURIComponent(page.url())).toContain('/dashboard/admin/inventario/nuevo');
  });
});
