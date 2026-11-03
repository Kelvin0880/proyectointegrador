import { describe, expect, it } from 'vitest';
import {
  formatDate, formatNumber, formatRelative, formatShortDate, formatTime, formatTimeRange, fullName, initials, pluralize, todayISO,
} from '@/lib/format';

describe('format', () => {
  it('formatea fechas en español', () => {
    expect(formatDate('2025-03-21T00:00:00')).toMatch(/21 de marzo de 2025/);
    expect(formatShortDate('2025-03-21T00:00:00')).toMatch(/21/);
  });

  it('devuelve guion para fechas vacías o inválidas', () => {
    expect(formatDate(null)).toBe('-');
    expect(formatDate('no es fecha')).toBe('-');
    expect(formatTime(undefined)).toBe('-');
  });

  it('una fecha local "YYYY-MM-DDT00:00:00" no se corre de día', () => {
    const date = new Date('2025-12-01T00:00:00');
    expect(date.getDate()).toBe(1);
    expect(formatDate('2025-12-01T00:00:00')).toMatch(/^1 de diciembre/);
  });

  it('formatea horas y rangos', () => {
    expect(formatTime('14:26:00')).toMatch(/2:26/);
    expect(formatTime('09:05')).toMatch(/9:05/);
    expect(formatTimeRange('10:00', '12:30')).toMatch(/10:00.+-.+12:30/);
  });

  it('calcula tiempo relativo', () => {
    const now = new Date('2025-03-20T12:00:00Z');
    expect(formatRelative('2025-03-20T09:00:00Z', now)).toBe('hace 3 horas');
    expect(formatRelative('2025-03-18T12:00:00Z', now)).toBe('anteayer');
    expect(formatRelative('2025-03-20T11:59:50Z', now)).toBe('hace un momento');
  });

  it('nombres, iniciales y plurales', () => {
    expect(fullName({ nombre: 'Ana', apellido: 'Rosario' })).toBe('Ana Rosario');
    expect(initials('Ana Rosario')).toBe('AR');
    expect(initials('')).toBe('');
    expect(pluralize(1, 'equipo')).toBe('1 equipo');
    expect(pluralize(3, 'equipo')).toBe('3 equipos');
    expect(formatNumber(1234)).toMatch(/1.?234/);
  });

  it('todayISO usa la fecha local', () => {
    expect(todayISO(new Date(2025, 0, 5, 23, 30))).toBe('2025-01-05');
  });
});
