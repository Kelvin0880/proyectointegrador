// Recorre todas las pantallas comprobando: sin errores de consola, sin emojis,
// sin desbordes horizontales en móvil, y genera capturas en celular.
import { expect, test } from '@playwright/test';
import { ADMIN, EMOJI_RE, login, shot, trackErrors } from './helpers';

const PUBLICAS = ['/', '/auth/login', '/auth/register'];
const PANEL = [
  '/dashboard',
  '/dashboard/nueva-solicitud',
  '/dashboard/solicitudes',
  '/dashboard/perfil',
  '/dashboard/admin/solicitudes',
  '/dashboard/admin/inventario',
  '/dashboard/admin/inventario/nuevo',
  '/dashboard/admin/inventario/editar/1',
  '/dashboard/admin/departamentos',
  '/dashboard/admin/usuarios',
  '/dashboard/admin/informes',
  '/dashboard/solicitudes/4',
];

async function checkPage(page, url, errors) {
  const res = await page.goto(url);
  expect(res.status(), url).toBeLessThan(400);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 15_000 });
  const text = await page.locator('body').innerText();
  expect(text.match(EMOJI_RE), `emoji en ${url}`).toBeNull();
  expect(errors, `errores en ${url}`).toEqual([]);
  // Todas las imágenes tienen texto alternativo
  const sinAlt = await page.locator('img:not([alt])').count();
  expect(sinAlt, `imágenes sin alt en ${url}`).toBe(0);
}

test.describe('Calidad en escritorio', () => {
  test('páginas públicas sin errores ni emojis', async ({ page }) => {
    const errors = trackErrors(page);
    for (const url of PUBLICAS) await checkPage(page, url, errors);
  });

  test('todas las pantallas del panel sin errores ni emojis', async ({ page }) => {
    await login(page, ADMIN);
    const errors = trackErrors(page);
    for (const url of PANEL) await checkPage(page, url, errors);
  });

  test('navegación lateral resalta la sección activa', async ({ page }) => {
    await login(page, ADMIN);
    await page.goto('/dashboard/admin/inventario/nuevo');
    const nav = page.getByRole('navigation', { name: 'Navegación principal' });
    await expect(nav.getByRole('link', { name: 'Inventario' })).toHaveAttribute('aria-current', 'page');
    await expect(nav.getByRole('link', { name: 'Inicio' })).not.toHaveAttribute('aria-current', 'page');
  });
});

test.describe('Diseño responsivo (celular)', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('páginas públicas en celular', async ({ page }) => {
    for (const [url, name] of [['/', 'movil-01-portada'], ['/auth/login', 'movil-02-login'], ['/auth/register', 'movil-03-registro']]) {
      await page.goto(url);
      await expectNoHorizontalOverflow(page, url);
      await shot(page, name);
    }
  });

  test('menú lateral desplegable y pantallas del panel', async ({ page }) => {
    await login(page, ADMIN);
    await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeHidden();
    await page.getByRole('button', { name: 'Abrir menú' }).click();
    const drawer = page.getByRole('dialog');
    await expect(drawer.getByRole('link', { name: 'Inventario', exact: true })).toBeVisible();
    await shot(page, 'movil-04-menu', { fullPage: false });
    await drawer.getByRole('link', { name: 'Inventario', exact: true }).click();
    await expect(page).toHaveURL(/admin\/inventario$/);
    await expect(page.getByRole('dialog')).toHaveCount(0);

    const pantallas = [
      ['/dashboard', 'movil-05-panel'],
      ['/dashboard/admin/inventario', 'movil-06-inventario'],
      ['/dashboard/admin/solicitudes', 'movil-07-solicitudes'],
      ['/dashboard/nueva-solicitud', 'movil-08-nueva-solicitud'],
      ['/dashboard/admin/informes', 'movil-09-informes'],
      ['/dashboard/perfil', 'movil-10-perfil'],
    ];
    for (const [url, name] of pantallas) {
      await page.goto(url);
      await expectNoHorizontalOverflow(page, url);
      await shot(page, name);
    }
  });

  test('en celular las tablas se muestran como tarjetas', async ({ page }) => {
    await login(page, ADMIN);
    await page.goto('/dashboard/admin/inventario');
    await expect(page.getByRole('table')).toBeHidden();
    await expect(page.getByRole('listitem').filter({ hasText: 'Cable HDMI' }).first()).toBeVisible();
  });
});

async function expectNoHorizontalOverflow(page, url) {
  await page.waitForLoadState('networkidle');
  // Se compara contra el ancho real del dispositivo (390px), no contra el viewport que
  // el navegador móvil puede ensanchar si algún elemento se desborda.
  const { width } = page.viewportSize();
  const contentWidth = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
  expect(contentWidth, `desborde horizontal en ${url}`).toBeLessThanOrEqual(width + 1);
}
