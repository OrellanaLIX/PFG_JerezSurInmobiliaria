import type { Cita } from '../../../types/cita';
import {
  formatearFechaHora,
  citaYaPasada,
  traducirEstado,
} from '../../../utils/calendario';
import '../../../styles/App.scss';

interface DetalleCitaProps {
  cita: Cita;
  onCerrar: () => void;
  onAceptar: (id: number) => Promise<void>;
  onCompletar: (id: number) => Promise<void>;
  onCancelar: (id: number) => Promise<void>;
  onNoPresentado: (id: number) => Promise<void>;
}

export const DetalleCita = ({
  cita,
  onCerrar,
  onAceptar,
  onCompletar,
  onCancelar,
  onNoPresentado,
}: DetalleCitaProps) => {
  const pasada = citaYaPasada(cita);

  const abrirWhatsApp = () => {
    const telefono = cita.telefonoCliente.replace(/[^0-9]/g, '');
    const mensaje = `Hola ${cita.nombreCliente}, soy de JerezSur Inmobiliaria sobre su cita.`;
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const llamar = () => {
    window.location.href = `tel:${cita.telefonoCliente}`;
  };

  return (
    <div role="dialog" aria-modal="true">
      <header>
        <h3>Detalles de la cita #{cita.id}</h3>
        <button onClick={onCerrar} aria-label="Cerrar">✕</button>
      </header>

      <dl>
        <dt>Cliente:</dt>
        <dd>{cita.nombreCliente}</dd>

        <dt>Teléfono:</dt>
        <dd>
          {cita.telefonoCliente}
          <button onClick={llamar}>📞 Llamar</button>
          <button onClick={abrirWhatsApp}>💬 WhatsApp</button>
        </dd>

        <dt>Fecha y hora:</dt>
        <dd>{formatearFechaHora(cita.fechaHora)}</dd>

        <dt>Estado:</dt>
        <dd>
          {traducirEstado(cita.estado)}
          {pasada && cita.estado === 'CONFIRMADA' && ' (vencida)'}
        </dd>

        {cita.nombreTrabajador && (
          <>
            <dt>Asignada a:</dt>
            <dd>{cita.nombreTrabajador}</dd>
          </>
        )}

        {cita.direccionInmueble && (
          <>
            <dt>Inmueble:</dt>
            <dd>{cita.direccionInmueble}</dd>
          </>
        )}

        {cita.motivo && (
          <>
            <dt>Motivo:</dt>
            <dd>{cita.motivo}</dd>
          </>
        )}
      </dl>

      {/* Acciones según estado */}
      <footer>
        {cita.estado === 'PENDIENTE_ASIGNACION' && (
          <button onClick={() => onAceptar(cita.id)}>
            ✓ Aceptar esta cita
          </button>
        )}

        {cita.estado === 'CONFIRMADA' && (
          <>
            <button onClick={() => onCompletar(cita.id)}>
              ✓ Marcar completada
            </button>
            <button onClick={() => onNoPresentado(cita.id)}>
              ⚠ No se presentó
            </button>
            <button onClick={() => onCancelar(cita.id)}>
              ✕ Cancelar
            </button>
          </>
        )}

        {(cita.estado === 'COMPLETADA' ||
          cita.estado === 'CANCELADA' ||
          cita.estado === 'NO_PRESENTADO') && (
          <p>Esta cita ya está cerrada.</p>
        )}
      </footer>
    </div>
  );
};