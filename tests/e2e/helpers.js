import fs from 'node:fs';
import path from 'node:path';
import { expect } from '@playwright/test';

export const ADMIN = { matricula: 'admin', password: 'admin123' };

const SCREENSHOT_DIR = path.join(process.cwd(), 'docs', 'screenshots');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

/** Guarda una captura de pantalla en docs/screenshots/<nombre>.png */
export async function shot(page, name, { fullPage = true } = {}) {
  // Esperar a que terminen las cargas (skeletons y spinners)
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 15_000 });
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${name}.png`), fullPage });
}

export async function login(page, { matricula, password }) {
  await page.goto('/auth/login');
  await page.getByLabel('Matrícula').fill(matricula);
  await page.getByLabel('Contraseña', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await page.waitForURL('**/dashboard');
}

export async function logout(page) {
  await page.getByRole('button', { name: 'Menú de usuario' }).click();
  await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click();
  await page.waitForURL('**/auth/login');
}

/** Registra un usuario directamente con la API */
export async function registerViaApi(request, user) {
  const res = await request.post('/api/auth/register', { data: user });
  expect(res.status(), await res.text()).toBe(201);
}

/** Fecha local (YYYY-MM-DD) dentro de N días, según el navegador */
export async function futureDate(page, days = 1) {
  return page.evaluate((d) => {
    const date = new Date();
    date.setDate(date.getDate() + d);
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }, days);
}

/** Recolecta errores de consola y de la página para verificar que no haya fallos */
export function trackErrors(page) {
  const errors = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });
  return errors;
}

export const EMOJI_RE = /\p{Extended_Pictographic}/u;
