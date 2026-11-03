import { describe, expect, it } from 'vitest';
import {
  firstError, hasErrors, isValidSolicitudEstado, normalizeMatricula, validateDepartamento, validateItem, validatePassword,
  validateRegistro, validateSolicitud,
} from '@/lib/validation';

describe('normalizeMatricula', () => {
  it('quita el dominio, espacios y mayúsculas', () => {
    expect(normalizeMatricula('  LC22-1392@unphu.edu.do ')).toBe('lc22-1392');
    expect(normalizeMatricula(undefined)).toBe('');
  });
});

describe('validateRegistro', () => {
  const valid = { matricula: 'ab12-3456', nombre: 'Ana', apellido: 'Pérez', password: 'secreta1', confirmPassword: 'secreta1' };

  it('acepta datos válidos', () => {
    expect(validateRegistro(valid, { checkConfirm: true })).toEqual({});
  });

  it('exige todos los campos', () => {
    const errors = validateRegistro({});
    expect(Object.keys(errors).sort()).toEqual(['apellido', 'matricula', 'nombre', 'password']);
  });

  it('valida formato de matrícula, largo de contraseña y confirmación', () => {
    expect(validateRegistro({ ...valid, matricula: 'a b' }).matricula).toBeDefined();
    expect(validateRegistro({ ...valid, password: '123' }).password).toMatch(/6 caracteres/);
    expect(validateRegistro({ ...valid, confirmPassword: 'otra' }, { checkConfirm: true }).confirmPassword).toMatch(/no coinciden/);
  });

  it('validatePassword limita el largo máximo de bcrypt', () => {
    expect(validatePassword('x'.repeat(73))).toMatch(/72/);
    expect(validatePassword('abcdef')).toBeNull();
  });
});

describe('validateItem', () => {
  const valid = { nombre: 'Proyector', descripcion: 'Epson', departamento_id: 1, cantidad_total: 5, cantidad_disponible: 3 };

  it('acepta un equipo válido', () => {
    expect(validateItem(valid)).toEqual({});
  });

  it('rechaza cantidades inválidas', () => {
    expect(validateItem({ ...valid, cantidad_total: 0 }).cantidad_total).toBeDefined();
    expect(validateItem({ ...valid, cantidad_total: 2.5 }).cantidad_total).toBeDefined();
    expect(validateItem({ ...valid, cantidad_disponible: -1 }).cantidad_disponible).toBeDefined();
    expect(validateItem({ ...valid, cantidad_disponible: 9 }).cantidad_disponible).toMatch(/mayor que la cantidad total/);
  });

  it('acepta números enviados como texto', () => {
    expect(validateItem({ ...valid, cantidad_total: '5', cantidad_disponible: '5' })).toEqual({});
  });

  it('rechaza estados desconocidos', () => {
    expect(validateItem({ ...valid, estado: 'Roto' }).estado).toBeDefined();
  });
});

describe('validateSolicitud', () => {
  const today = '2025-03-20';
  const valid = { item_id: 1, fecha_uso: '2025-03-21', hora_inicio: '10:00', hora_fin: '12:00', motivo: 'Clase de redes' };

  it('acepta una solicitud válida', () => {
    expect(validateSolicitud(valid, { today })).toEqual({});
  });

  it('no permite fechas pasadas', () => {
    expect(validateSolicitud({ ...valid, fecha_uso: '2025-03-19' }, { today }).fecha_uso).toMatch(/pasado/);
  });

  it('permite la fecha de hoy', () => {
    expect(validateSolicitud({ ...valid, fecha_uso: today }, { today })).toEqual({});
  });

  it('exige que la hora de fin sea posterior', () => {
    expect(validateSolicitud({ ...valid, hora_fin: '10:00' }, { today }).hora_fin).toMatch(/posterior/);
    expect(validateSolicitud({ ...valid, hora_fin: '09:00:00' }, { today }).hora_fin).toBeDefined();
  });

  it('valida formato de hora y motivo', () => {
    expect(validateSolicitud({ ...valid, hora_inicio: '25:00' }, { today }).hora_inicio).toBeDefined();
    expect(validateSolicitud({ ...valid, motivo: 'abc' }, { today }).motivo).toBeDefined();
    expect(validateSolicitud({ ...valid, motivo: 'x'.repeat(501) }, { today }).motivo).toMatch(/500/);
  });
});

describe('utilidades', () => {
  it('hasErrors y firstError', () => {
    expect(hasErrors({})).toBe(false);
    expect(hasErrors({ a: 'x' })).toBe(true);
    expect(firstError({ a: 'uno', b: 'dos' })).toBe('uno');
    expect(firstError({})).toBeNull();
  });

  it('validateDepartamento e isValidSolicitudEstado', () => {
    expect(validateDepartamento({ nombre: '' }).nombre).toBeDefined();
    expect(validateDepartamento({ nombre: 'Audiovisual' })).toEqual({});
    expect(isValidSolicitudEstado('Aprobada')).toBe(true);
    expect(isValidSolicitudEstado('Borrada')).toBe(false);
  });
});
