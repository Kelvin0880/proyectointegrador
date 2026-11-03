import { useState } from 'react';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Package } from 'lucide-react';
import {
  Alert, Badge, Button, ConfirmDialog, DataTable, EmptyState, ErrorState, Field, FilterTabs, Input, PasswordInput,
  ProgressBar, SearchInput, StatCard, ToastProvider, useToast,
} from '@/components/ui';
import { ItemEstadoBadge, RolBadge, SolicitudEstadoBadge } from '@/components/domain/StatusBadges';
import { SolicitudTimeline } from '@/components/domain/SolicitudDetails';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('Button', () => {
  it('ejecuta onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Guardar</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('se deshabilita mientras carga', () => {
    render(<Button loading>Guardar</Button>);
    const button = screen.getByRole('button', { name: 'Guardar' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('se renderiza como enlace con href', () => {
    render(<Button href="/dashboard">Ir</Button>);
    expect(screen.getByRole('link', { name: 'Ir' })).toHaveAttribute('href', '/dashboard');
  });
});

describe('Field e inputs', () => {
  it('asocia etiqueta, ayuda y error al control', () => {
    render(
      <Field label="Nombre" error="Obligatorio" required>
        {({ id, describedBy }) => <Input id={id} aria-describedby={describedBy} error="Obligatorio" />}
      </Field>
    );
    const input = screen.getByLabelText(/Nombre/);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Obligatorio');
    expect(screen.getByRole('alert')).toHaveTextContent('Obligatorio');
  });

  it('PasswordInput permite mostrar y ocultar la contraseña', async () => {
    render(<PasswordInput aria-label="Contraseña" defaultValue="secreta" />);
    const input = screen.getByLabelText('Contraseña');
    expect(input).toHaveAttribute('type', 'password');
    await userEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(input).toHaveAttribute('type', 'text');
    await userEvent.click(screen.getByRole('button', { name: 'Ocultar contraseña' }));
    expect(input).toHaveAttribute('type', 'password');
  });
});

describe('Badges de estado', () => {
  it('muestra cada estado de solicitud con texto', () => {
    render(
      <>
        <SolicitudEstadoBadge estado="Pendiente" />
        <SolicitudEstadoBadge estado="Aprobada" />
        <ItemEstadoBadge estado="En mantenimiento" />
        <RolBadge rol="admin" />
        <Badge tone="red">Personalizado</Badge>
      </>
    );
    for (const text of ['Pendiente', 'Aprobada', 'En mantenimiento', 'Administrador', 'Personalizado']) {
      expect(screen.getByText(text)).toBeInTheDocument();
    }
  });
});

describe('DataTable', () => {
  const columns = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'cantidad', header: 'Cantidad', render: (r) => `${r.cantidad} u.` },
  ];
  const rows = [
    { id: 1, nombre: 'Proyector', cantidad: 3 },
    { id: 2, nombre: 'Cable', cantidad: 10 },
  ];

  it('renderiza encabezados y filas', () => {
    render(<DataTable columns={columns} rows={rows} />);
    expect(screen.getByRole('columnheader', { name: 'Nombre' })).toBeInTheDocument();
    expect(screen.getByText('Proyector')).toBeInTheDocument();
    expect(screen.getByText('10 u.')).toBeInTheDocument();
  });

  it('notifica el clic en una fila', async () => {
    const onRowClick = vi.fn();
    render(<DataTable columns={columns} rows={rows} onRowClick={onRowClick} />);
    await userEvent.click(screen.getByText('Cable'));
    expect(onRowClick).toHaveBeenCalledWith(rows[1]);
  });

  it('muestra el estado vacío y el de carga', () => {
    const { rerender } = render(<DataTable columns={columns} rows={[]} empty={<p>Nada por aquí</p>} />);
    expect(screen.getByText('Nada por aquí')).toBeInTheDocument();
    rerender(<DataTable columns={columns} rows={null} loading />);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('usa tarjetas en móvil cuando se define renderMobile', () => {
    render(<DataTable columns={columns} rows={rows} renderMobile={(r) => <span>Tarjeta {r.nombre}</span>} />);
    expect(screen.getByText('Tarjeta Proyector')).toBeInTheDocument();
  });
});

describe('Filtros', () => {
  it('FilterTabs marca la pestaña activa y muestra contadores', async () => {
    const onChange = vi.fn();
    render(<FilterTabs options={[{ value: '', label: 'Todas', count: 5 }, { value: 'Pendiente', label: 'Pendientes', count: 2 }]} value="" onChange={onChange} />);
    expect(screen.getByRole('tab', { name: /Todas/ })).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(screen.getByRole('tab', { name: /Pendientes/ }));
    expect(onChange).toHaveBeenCalledWith('Pendiente');
  });

  it('SearchInput espera a que el usuario deje de escribir', async () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    function Wrapper() {
      const [value, setValue] = useState('');
      return (
        <SearchInput
          value={value}
          onChange={(v) => {
            onChange(v);
            setValue(v);
          }}
          delay={300}
        />
      );
    }
    render(<Wrapper />);
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'hd' } });
    fireEvent.change(input, { target: { value: 'hdmi' } });
    expect(onChange).not.toHaveBeenCalled();
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('hdmi');
    vi.useRealTimers();
  });
});

describe('Componentes de retroalimentación', () => {
  it('EmptyState y ErrorState', async () => {
    const onRetry = vi.fn();
    render(
      <>
        <EmptyState icon={Package} title="Sin equipos" description="Agrega uno" />
        <ErrorState message="Falló la red" onRetry={onRetry} />
      </>
    );
    expect(screen.getByText('Sin equipos')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Reintentar/ }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('Alert se puede cerrar', async () => {
    const onDismiss = vi.fn();
    render(<Alert tone="error" title="Error" onDismiss={onDismiss}>Detalle</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('Detalle');
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar aviso' }));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('ProgressBar expone su valor', () => {
    render(<ProgressBar value={3} max={10} label="Disponibilidad" />);
    const bar = screen.getByRole('progressbar', { name: 'Disponibilidad' });
    expect(bar).toHaveAttribute('aria-valuenow', '3');
    expect(bar).toHaveAttribute('aria-valuemax', '10');
  });

  it('StatCard muestra valor y enlace', () => {
    render(<StatCard label="Pendientes" value={4} href="/x" />);
    expect(screen.getByRole('link')).toHaveTextContent('Pendientes4');
  });

  it('ConfirmDialog confirma y cancela', async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(<ConfirmDialog open title="Eliminar equipo" description="¿Seguro?" confirmLabel="Eliminar" onConfirm={onConfirm} onClose={onClose} />);
    expect(await screen.findByRole('dialog')).toHaveTextContent('Eliminar equipo');
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(onConfirm).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('ToastProvider muestra notificaciones', async () => {
    function Trigger() {
      const toast = useToast();
      return <button onClick={() => toast.success('Guardado', 'Todo bien')}>Mostrar</button>;
    }
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>
    );
    await userEvent.click(screen.getByRole('button', { name: 'Mostrar' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Guardado'));
  });
});

describe('SolicitudTimeline', () => {
  const base = { fecha_solicitud: '2025-03-20T10:00:00Z', updated_at: '2025-03-20T12:00:00Z' };

  it('muestra los pasos completados de una solicitud finalizada', () => {
    render(<SolicitudTimeline solicitud={{ ...base, estado: 'Finalizada' }} />);
    expect(screen.getByText('Solicitud enviada')).toBeInTheDocument();
    expect(screen.getByText('Aprobada')).toBeInTheDocument();
    expect(screen.getByText('Equipo devuelto')).toBeInTheDocument();
    expect(screen.queryByText('Pendiente')).not.toBeInTheDocument();
  });

  it('una solicitud rechazada termina en el rechazo', () => {
    render(<SolicitudTimeline solicitud={{ ...base, estado: 'Rechazada' }} />);
    expect(screen.getByText('Rechazada')).toBeInTheDocument();
    expect(screen.queryByText('Equipo devuelto')).not.toBeInTheDocument();
  });
});
