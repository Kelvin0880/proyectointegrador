// Valores de dominio compartidos por el frontend y la API.

export const INSTITUTION = {
  name: 'Universidad Nacional Pedro Henríquez Ureña',
  shortName: 'UNPHU',
  appName: 'UNPHU Inventario',
  emailDomain: 'unphu.edu.do',
};

export const ROLES = {
  ADMIN: 'admin',
  USUARIO: 'usuario',
};

export const ROLE_LABELS = {
  admin: 'Administrador',
  usuario: 'Usuario',
};

export const SOLICITUD_ESTADOS = ['Pendiente', 'Aprobada', 'Rechazada', 'Finalizada'];

export const ITEM_ESTADOS = ['Disponible', 'Agotado', 'En mantenimiento'];

export const PERIODOS_INFORME = [
  { value: '24h', label: 'Últimas 24 horas' },
  { value: '5d', label: 'Últimos 5 días' },
  { value: '15d', label: 'Últimos 15 días' },
  { value: '1m', label: 'Último mes' },
  { value: '6m', label: 'Últimos 6 meses' },
  { value: '1y', label: 'Último año' },
];

export const TIPOS_INFORME = [
  { value: 'completo', label: 'Informe completo', description: 'Equipos y usuarios' },
  { value: 'equipos', label: 'Equipos más solicitados', description: 'Ranking de equipos' },
  { value: 'usuarios', label: 'Usuarios más activos', description: 'Ranking de usuarios' },
];

export function periodoLabel(value) {
  return PERIODOS_INFORME.find((p) => p.value === value)?.label ?? value;
}

export function tipoInformeLabel(value) {
  return TIPOS_INFORME.find((t) => t.value === value)?.label ?? value;
}
