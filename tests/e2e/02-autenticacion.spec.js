import { expect, test } from '@playwright/test';
import { ADMIN, login, logout, shot } from './helpers';

const NUEVO = { matricula: 'ab24-0001', nombre: 'Ana', apellido: 'Bautista', password: 'clave123' };

test.describe('Registro e inicio de sesión', () => {
  test('el registro valida los campos', async ({ page }) => {
    await page.goto('/auth/register');
    await page.getByRole('button', { name: 'Crear cuenta' }).click();
    await expect(page.getByText('La matrícula es obligatoria').first()).toBeVisible();
    await expect(page.getByText('El nombre es obligatorio')).toBeVisible();

    await page.getByLabel('Matrícula').fill('x y');
    await page.getByLabel('Contraseña', { exact: true }).fill('123');
    await page.getByLabel('Confirmar contraseña').fill('456');
    await page.getByRole('button', { name: 'Crear cuenta' }).click();
    await expect(page.getByText(/Usa entre 3 y 20 caracteres/).first()).toBeVisible();
    await expect(page.getByText('La contraseña debe tener al menos 6 caracteres')).toBeVisible();
    await expect(page.getByText('Las contraseñas no coinciden')).toBeVisible();
    await shot(page, 'auth-01-registro-validacion', { fullPage: false });
  });

  test('registra un usuario y lo lleva al inicio de sesión', async ({ page }) => {
    await page.goto('/auth/register');
    await page.getByLabel('Matrícula').fill(NUEVO.matricula.toUpperCase());
    await page.getByLabel('Nombre', { exact: true }).fill(NUEVO.nombre);
    await page.getByLabel('Apellido').fill(NUEVO.apellido);
    await page.getByLabel('Contraseña', { exact: true }).fill(NUEVO.password);
    await page.getByLabel('Confirmar contraseña').fill(NUEVO.password);
    await page.getByRole('button', { name: 'Crear cuenta' }).click();

    await expect(page).toHaveURL(/\/auth\/login\?registered=true/);
    await expect(page.getByText('Cuenta creada correctamente')).toBeVisible();
    await expect(page.getByLabel('Matrícula')).toHaveValue(NUEVO.matricula);
    await shot(page, 'auth-02-registro-exitoso', { fullPage: false });

    await page.getByLabel('Contraseña', { exact: true }).fill(NUEVO.password);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Ana');
  });

  test('no permite registrar una matrícula repetida', async ({ page }) => {
    await page.goto('/auth/register');
    await page.getByLabel('Matrícula').fill(NUEVO.matricula);
    await page.getByLabel('Nombre', { exact: true }).fill('Otra');
    await page.getByLabel('Apellido').fill('Persona');
    await page.getByLabel('Contraseña', { exact: true }).fill('otraclave');
    await page.getByLabel('Confirmar contraseña').fill('otraclave');
    await page.getByRole('button', { name: 'Crear cuenta' }).click();
    await expect(page.getByText('Esta matrícula ya está registrada').first()).toBeVisible();
  });

  test('muestra un error con credenciales incorrectas', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByLabel('Matrícula').fill('admin');
    await page.getByLabel('Contraseña', { exact: true }).fill('incorrecta');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page.getByText(/Matrícula o contraseña incorrecta/)).toBeVisible();
    await shot(page, 'auth-03-login-error', { fullPage: false });
  });

  test('la contraseña se puede mostrar u ocultar', async ({ page }) => {
    await page.goto('/auth/login');
    const input = page.getByLabel('Contraseña', { exact: true });
    await input.fill('secreta');
    await expect(input).toHaveAttribute('type', 'password');
    await page.getByRole('button', { name: 'Mostrar contraseña' }).click();
    await expect(input).toHaveAttribute('type', 'text');
  });

  test('inicia y cierra sesión; con sesión activa /auth redirige al panel', async ({ page }) => {
    await login(page, ADMIN);
    await expect(page.getByRole('heading', { name: 'Panel de administración' })).toBeVisible();
    await page.goto('/auth/login');
    await expect(page).toHaveURL(/\/dashboard$/);
    await logout(page);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('vuelve a la página solicitada después de iniciar sesión', async ({ page }) => {
    await page.goto('/dashboard/admin/informes');
    await page.getByLabel('Matrícula').fill(ADMIN.matricula);
    await page.getByLabel('Contraseña', { exact: true }).fill(ADMIN.password);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL(/\/dashboard\/admin\/informes$/);
  });
});
