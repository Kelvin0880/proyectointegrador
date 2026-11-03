import {
  Boxes, Building2, ChartNoAxesColumn, CircleUserRound, ClipboardCheck, ClipboardList, ClipboardPlus, LayoutDashboard, Users,
} from 'lucide-react';

/**
 * Menú lateral del panel. Para agregar una sección nueva basta con añadirla aquí.
 * `adminOnly` oculta la sección a usuarios sin rol de administrador.
 * `badge` indica que el elemento muestra un contador (ver AppShell).
 */
export const NAVIGATION = [
  {
    title: 'General',
    items: [
      { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard, exact: true },
      { href: '/dashboard/nueva-solicitud', label: 'Nueva solicitud', icon: ClipboardPlus },
      { href: '/dashboard/solicitudes', label: 'Mis solicitudes', icon: ClipboardList },
    ],
  },
  {
    title: 'Administración',
    adminOnly: true,
    items: [
      { href: '/dashboard/admin/solicitudes', label: 'Solicitudes', icon: ClipboardCheck, badge: 'pendientes' },
      { href: '/dashboard/admin/inventario', label: 'Inventario', icon: Boxes },
      { href: '/dashboard/admin/departamentos', label: 'Departamentos', icon: Building2 },
      { href: '/dashboard/admin/usuarios', label: 'Usuarios', icon: Users },
      { href: '/dashboard/admin/informes', label: 'Informes', icon: ChartNoAxesColumn },
    ],
  },
  {
    title: 'Cuenta',
    items: [{ href: '/dashboard/perfil', label: 'Mi perfil', icon: CircleUserRound }],
  },
];

export function isActivePath(pathname, item) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function navigationFor(role) {
  return NAVIGATION.filter((section) => !section.adminOnly || role === 'admin');
}
