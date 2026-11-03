// Reglas de validación compartidas entre los formularios (cliente) y la API (servidor).
// Cada función devuelve un objeto { campo: 'mensaje de error' }; vacío si todo es válido.
import { ITEM_ESTADOS, SOLICITUD_ESTADOS } from './constants';
import { todayISO } from './format';

const MATRICULA_RE = /^[a-z0-9][a-z0-9.-]{2,19}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

const isBlank = (value) => value === undefined || value === null || String(value).trim() === '';

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}

export function firstError(errors) {
  return Object.values(errors)[0] ?? null;
}

export function normalizeMatricula(value = '') {
  return String(value).split('@')[0].trim().toLowerCase();
}

export function validatePassword(password) {
  if (isBlank(password)) return 'La contraseña es obligatoria';
  if (String(password).length < 6) return 'La contraseña debe tener al menos 6 caracteres';
  if (String(password).length > 72) return 'La contraseña no puede tener más de 72 caracteres';
  return null;
}

export function validateRegistro({ matricula, nombre, apellido, password, confirmPassword } = {}, { checkConfirm = false } = {}) {
  const errors = {};
  const mat = normalizeMatricula(matricula);
  if (!mat) errors.matricula = 'La matrícula es obligatoria';
  else if (!MATRICULA_RE.test(mat)) errors.matricula = 'Usa entre 3 y 20 caracteres: letras, números, punto o guion';
  if (isBlank(nombre)) errors.nombre = 'El nombre es obligatorio';
  else if (String(nombre).trim().length > 100) errors.nombre = 'El nombre es demasiado largo';
  if (isBlank(apellido)) errors.apellido = 'El apellido es obligatorio';
  else if (String(apellido).trim().length > 100) errors.apellido = 'El apellido es demasiado largo';
  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;
  if (checkConfirm && password !== confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden';
  return errors;
}

export function validateItem(data = {}, { partial = false } = {}) {
  const errors = {};
  const check = (field) => !partial || data[field] !== undefined;

  if (check('nombre')) {
    if (isBlank(data.nombre)) errors.nombre = 'El nombre es obligatorio';
    else if (String(data.nombre).trim().length > 100) errors.nombre = 'Máximo 100 caracteres';
  }
  if (check('descripcion') && isBlank(data.descripcion)) {
    errors.descripcion = 'La descripción es obligatoria';
  }
  if (check('departamento_id') && isBlank(data.departamento_id)) {
    errors.departamento_id = 'Selecciona un departamento';
  }

  const total = data.cantidad_total === undefined || data.cantidad_total === '' ? undefined : Number(data.cantidad_total);
  const disponible = data.cantidad_disponible === undefined || data.cantidad_disponible === '' ? undefined : Number(data.cantidad_disponible);

  if (check('cantidad_total')) {
    if (total === undefined) errors.cantidad_total = 'Indica la cantidad total';
    else if (!Number.isInteger(total) || total < 1) errors.cantidad_total = 'Debe ser un número entero mayor que 0';
    else if (total > 100000) errors.cantidad_total = 'La cantidad es demasiado grande';
  }
  if (disponible !== undefined) {
    if (!Number.isInteger(disponible) || disponible < 0) errors.cantidad_disponible = 'Debe ser un número entero de 0 o más';
    else if (total !== undefined && disponible > total) errors.cantidad_disponible = 'No puede ser mayor que la cantidad total';
  }
  if (data.estado !== undefined && !ITEM_ESTADOS.includes(data.estado)) {
    errors.estado = 'Estado no válido';
  }
  return errors;
}

export function validateSolicitud(data = {}, { today = todayISO() } = {}) {
  const errors = {};
  if (isBlank(data.item_id)) errors.item_id = 'Selecciona un equipo';
  if (isBlank(data.fecha_uso)) errors.fecha_uso = 'Selecciona la fecha de uso';
  else if (!DATE_RE.test(data.fecha_uso)) errors.fecha_uso = 'Fecha no válida';
  else if (data.fecha_uso < today) errors.fecha_uso = 'La fecha no puede estar en el pasado';

  if (isBlank(data.hora_inicio)) errors.hora_inicio = 'Indica la hora de inicio';
  else if (!TIME_RE.test(data.hora_inicio)) errors.hora_inicio = 'Hora no válida';
  if (isBlank(data.hora_fin)) errors.hora_fin = 'Indica la hora de fin';
  else if (!TIME_RE.test(data.hora_fin)) errors.hora_fin = 'Hora no válida';

  if (!errors.hora_inicio && !errors.hora_fin && data.hora_fin.slice(0, 5) <= data.hora_inicio.slice(0, 5)) {
    errors.hora_fin = 'La hora de fin debe ser posterior a la de inicio';
  }

  const motivo = String(data.motivo ?? '').trim();
  if (!motivo) errors.motivo = 'Describe el motivo de uso';
  else if (motivo.length < 5) errors.motivo = 'Describe el motivo con un poco más de detalle';
  else if (motivo.length > 500) errors.motivo = 'Máximo 500 caracteres';
  return errors;
}

export function validateDepartamento(data = {}) {
  const errors = {};
  if (isBlank(data.nombre)) errors.nombre = 'El nombre es obligatorio';
  else if (String(data.nombre).trim().length > 100) errors.nombre = 'Máximo 100 caracteres';
  return errors;
}

export function isValidSolicitudEstado(estado) {
  return SOLICITUD_ESTADOS.includes(estado);
}
