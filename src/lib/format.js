// Utilidades de formato para mostrar datos en pantalla (español, República Dominicana).

const LOCALE = 'es-DO';

function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** 21 de marzo de 2025 */
export function formatDate(value, options = {}) {
  const date = toDate(value);
  if (!date) return '-';
  return date.toLocaleDateString(LOCALE, { day: 'numeric', month: 'long', year: 'numeric', ...options });
}

/** 21 mar 2025 */
export function formatShortDate(value) {
  const date = toDate(value);
  if (!date) return '-';
  return date.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' });
}

/** 21 mar 2025, 2:26 p. m. */
export function formatDateTime(value) {
  const date = toDate(value);
  if (!date) return '-';
  return date.toLocaleString(LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** "14:26:00" o "14:26" -> "2:26 p. m." */
export function formatTime(value) {
  if (!value || typeof value !== 'string') return '-';
  const [h, m] = value.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return value;
  const date = new Date(2000, 0, 1, h, m);
  return date.toLocaleTimeString(LOCALE, { hour: 'numeric', minute: '2-digit' });
}

export function formatTimeRange(start, end) {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

/** Tiempo relativo: "hace 3 horas", "hace 2 días" */
export function formatRelative(value, now = new Date()) {
  const date = toDate(value);
  if (!date) return '-';
  const diffSeconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const units = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['week', 60 * 60 * 24 * 7],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
  ];
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  for (const [unit, seconds] of units) {
    if (Math.abs(diffSeconds) >= seconds) {
      return rtf.format(Math.round(diffSeconds / seconds), unit);
    }
  }
  return 'hace un momento';
}

export function formatNumber(value) {
  return new Intl.NumberFormat(LOCALE).format(Number(value) || 0);
}

export function fullName(person) {
  if (!person) return '';
  return [person.nombre, person.apellido].filter(Boolean).join(' ');
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

/** Fecha local de hoy en formato YYYY-MM-DD (para inputs type="date") */
export function todayISO(now = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`;
}
