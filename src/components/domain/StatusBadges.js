import { Ban, CheckCheck, CircleCheck, CircleX, Hourglass, PackageCheck, PackageX, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui';

export const SOLICITUD_STATUS = {
  Pendiente: { tone: 'amber', icon: Hourglass, label: 'Pendiente', description: 'En espera de revisión' },
  Aprobada: { tone: 'green', icon: CircleCheck, label: 'Aprobada', description: 'Equipo prestado' },
  Rechazada: { tone: 'red', icon: CircleX, label: 'Rechazada', description: 'No fue aprobada' },
  Finalizada: { tone: 'blue', icon: CheckCheck, label: 'Finalizada', description: 'Equipo devuelto' },
};

export const ITEM_STATUS = {
  Disponible: { tone: 'green', icon: PackageCheck },
  Agotado: { tone: 'red', icon: PackageX },
  'En mantenimiento': { tone: 'amber', icon: Wrench },
};

export function SolicitudEstadoBadge({ estado, size }) {
  const config = SOLICITUD_STATUS[estado] ?? { tone: 'gray', icon: Ban, label: estado };
  return (
    <Badge tone={config.tone} icon={config.icon} size={size}>
      {config.label}
    </Badge>
  );
}

export function ItemEstadoBadge({ estado, size }) {
  const config = ITEM_STATUS[estado] ?? { tone: 'gray', icon: Ban };
  return (
    <Badge tone={config.tone} icon={config.icon} size={size}>
      {estado}
    </Badge>
  );
}

export function RolBadge({ rol }) {
  return rol === 'admin' ? <Badge tone="brand">Administrador</Badge> : <Badge tone="gray">Usuario</Badge>;
}
