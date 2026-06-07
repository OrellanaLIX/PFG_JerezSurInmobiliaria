import { useState } from 'react';
import { toast } from 'react-toastify';
import type { Cita, EstadoCita } from '../../../types/cita';
import { formatearFechaHora, citaYaPasada, traducirEstado } from '../../../utils/calendario';
import { useBodyScroll } from '../../../hooks/useBodyScroll';
import { Badge, Field } from '../Inmuebles/_shared';
import SearchableEntitySelect from '../../ui/SearchableEntitySelect';
import '../../../styles/App.scss';

type SeccionCita = 'cita' | 'cliente' | 'gestion';

interface DetalleCitaModalProps {
  cita: Cita;
  loading?: boolean;
  onCerrar: () => void;
  onAceptar: (id: number, trabajadorId?: number | null) => Promise<void>;
  onCompletar: (id: number) => Promise<void>;
  onCancelar: (id: number) => Promise<void>;
  onNoPresentado: (id: number) => Promise<void>;
  onActualizar?: (id: number, data: Partial<Cita>) => Promise<void>;
}

const mapTrabajadorOption = (t: any) => ({
  id: t.id as number,
  label: t.usuario
    ? `${t.usuario.nombre ?? ''} ${t.usuario.apellidos ?? ''}`.trim()
    : `Trabajador #${t.id}`,
});

const mapearBadgeColor = (estado: EstadoCita): 'blue' | 'green' | 'amber' | 'gray' | 'red' => {
  switch (estado) {
    case 'CONFIRMADA':           return 'blue';
    case 'PENDIENTE_ASIGNACION': return 'amber';
    case 'COMPLETADA':           return 'green';
    case 'CANCELADA':            return 'gray';
    case 'NO_PRESENTADO':        return 'red';
    default:                     return 'gray';
  }
};

export const DetalleCitaModal = ({
  cita, loading = false, onCerrar, onAceptar, onCompletar,
  onCancelar, onNoPresentado, onActualizar,
}: DetalleCitaModalProps) => {
  const [seccion, setSeccion] = useState<SeccionCita>('cita');
  const [guardando, setGuardando] = useState(false);
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState<number | null>(null);

  useBodyScroll(true);

  const fechaISO = cita.fechaHora.slice(0, 10);
  const horaISO  = cita.fechaHora.slice(11, 16);

  const [formCita, setFormCita] = useState({
    fecha:  fechaISO,
    hora:   horaISO,
    motivo: cita.motivo ?? '',
  });

  const pasada = citaYaPasada(cita);
  const expedienteArchivado = ['COMPLETADA', 'CANCELADA', 'NO_PRESENTADO'].includes(cita.estado);
  const pendienteAsignacion = cita.estado === 'PENDIENTE_ASIGNACION';

  const procesarAccion = async (
    accionFn: () => Promise<void>,
    msgExito: string,
    debeCerrar = false,
  ) => {
    setGuardando(true);
    try {
      await accionFn();
      toast.success(msgExito);
      if (debeCerrar) onCerrar();
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? 'No se pudo completar la acción.';
      toast.error(`Error: ${msg}`);
    } finally {
      setGuardando(false);
    }
  };

  const guardarDatosCita = () => {
    if (!formCita.fecha || !formCita.hora) return toast.warning('La fecha y hora son obligatorias.');
    if (!onActualizar) return toast.warning('Esta cita no admite edición de datos.');
    procesarAccion(
      () => onActualizar(cita.id, {
        fechaHora: `${formCita.fecha}T${formCita.hora}:00`,
        motivo: formCita.motivo,
      }),
      'Datos de la cita actualizados correctamente.',
    );
  };

  const handleAceptar      = () => procesarAccion(() => onAceptar(cita.id, trabajadorSeleccionado), 'Cita confirmada correctamente.', true);
  const handleCompletar    = () => procesarAccion(() => onCompletar(cita.id),    'Cita marcada como completada.', true);
  const handleCancelar     = () => procesarAccion(() => onCancelar(cita.id),     'Cita cancelada.', true);
  const handleNoPresentado = () => procesarAccion(() => onNoPresentado(cita.id), 'Registrado: cliente no presentado.', true);

  const abrirWhatsApp = () => {
    const telefono = cita.telefonoCliente.replace(/[^0-9]/g, '');
    const mensaje  = `Hola ${cita.nombreCliente}, le contactamos desde JerezSur Inmobiliaria en relación a su cita agendada.`;
    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank', 'noopener,noreferrer');
  };

  if (loading) return (
    <div className="form-modal show">
      <div className="form-modal__content">
        <p className="text-soft">Cargando detalles del expediente...</p>
      </div>
    </div>
  );

  const tabs: SeccionCita[] = ['cita', 'cliente', ...(pendienteAsignacion || cita.estado === 'CONFIRMADA' || expedienteArchivado ? ['gestion' as SeccionCita] : [])];

  return (
    <div className="form-modal show" role="dialog" aria-modal="true">
      <div className="form-modal__content">

        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{cita.nombreCliente}</h2>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>
              Cita #{cita.id} · {formatearFechaHora(cita.fechaHora)}
            </p>
          </div>
          <div className="modal-badges">
            <Badge text={traducirEstado(cita.estado)} color={mapearBadgeColor(cita.estado)} />
            {pasada && cita.estado === 'CONFIRMADA' && <Badge text="Vencida" color="red" />}
          </div>
        </div>

        <div className="tabs" role="tablist">
          {tabs.map(s => (
            <button key={s} onClick={() => setSeccion(s)} className={`tab ${seccion === s ? 'active' : ''}`}>
              {{ cita: 'Cita', cliente: 'Cliente', gestion: 'Gestión' }[s]}
            </button>
          ))}
        </div>

        <div className="form-modal__body">

          {/* ── CITA ── */}
          {seccion === 'cita' && (
            <>
              <div className="form-row">
                <Field label="Fecha *">
                  <input type="date" value={formCita.fecha}
                    onChange={e => setFormCita(p => ({ ...p, fecha: e.target.value }))}
                    disabled={expedienteArchivado} />
                </Field>
                <Field label="Hora *">
                  <input type="time" value={formCita.hora}
                    onChange={e => setFormCita(p => ({ ...p, hora: e.target.value }))}
                    disabled={expedienteArchivado} />
                </Field>
              </div>

              <Field label="Inmueble de referencia">
                <input type="text" readOnly
                  value={cita.direccionInmueble
                    ? `${cita.direccionInmueble}${cita.inmuebleId ? ` (ID: ${cita.inmuebleId})` : ''}`
                    : 'Consulta general en oficina'} />
              </Field>

              <Field label="Motivo de la cita">
                <textarea className="textarea-large" value={formCita.motivo} rows={4}
                  onChange={e => setFormCita(p => ({ ...p, motivo: e.target.value }))}
                  disabled={expedienteArchivado}
                  placeholder="Notas o descripción del motivo de la cita..." />
              </Field>

              {!expedienteArchivado && onActualizar && (
                <div className="form-actions">
                  <button onClick={guardarDatosCita} disabled={guardando} className="btn btn-primary">
                    {guardando ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── CLIENTE ── */}
          {seccion === 'cliente' && (
            <>
              <div className="form-row">
                <Field label="Nombre del cliente">
                  <input type="text" readOnly value={cita.nombreCliente} />
                </Field>
                <Field label="Agente asignado">
                  <input type="text" readOnly value={cita.nombreTrabajador || 'Sin agente asignado'} />
                </Field>
              </div>

              <Field label="Teléfono">
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input type="tel" readOnly value={cita.telefonoCliente} style={{ flex: 1 }} />
                  <a href={`tel:${cita.telefonoCliente}`} className="btn btn-ghost"
                    style={{ flexShrink: 0, fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}>
                    Llamar
                  </a>
                  <button type="button" onClick={abrirWhatsApp} className="btn btn-ghost"
                    style={{ flexShrink: 0, fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}>
                    WhatsApp
                  </button>
                </div>
              </Field>

              <div className="alert alert-info" style={{ marginTop: '1rem' }}>
                Los datos del cliente son de solo lectura.
              </div>
            </>
          )}

          {/* ── GESTIÓN ── */}
          {seccion === 'gestion' && (
            <>
              {pendienteAsignacion && (
                <>
                  <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
                    Selecciona el agente que atenderá esta cita y confírmala.
                  </div>
                  <SearchableEntitySelect
                    label="Agente asignado"
                    placeholder="Buscar agente por nombre..."
                    endpoint="/trabajadores"
                    mapOption={mapTrabajadorOption}
                    value={trabajadorSeleccionado}
                    onChange={id => setTrabajadorSeleccionado(id)}
                  />
                  <div className="form-actions" style={{ marginTop: '1rem' }}>
                    <button onClick={handleAceptar} disabled={guardando || !trabajadorSeleccionado} className="btn btn-primary">
                      {guardando ? 'Procesando...' : 'Confirmar cita'}
                    </button>
                    <button onClick={handleCancelar} disabled={guardando} className="btn btn-danger">
                      Cancelar cita
                    </button>
                  </div>
                </>
              )}

              {expedienteArchivado && (
                <div className="info-box" style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <strong>Expediente Archivado</strong>
                  <p style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.5rem', marginBottom: 0 }}>
                    Cerrado bajo la resolución: <strong>{traducirEstado(cita.estado)}</strong>
                  </p>
                </div>
              )}

              {cita.estado === 'CONFIRMADA' && (
                <>
                  <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
                    {!pasada
                      ? <>Cita agendada. Puedes <strong>resolver el expediente</strong> cuando se realice la visita.</>
                      : <>Cita vencida. <strong>Registra el resultado</strong> para archivar el expediente.</>}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {cita.fechaHora && (() => {
                      const dt = new Date(cita.fechaHora);
                      const pad = (n: number) => String(n).padStart(2, '0');
                      const fmt = (d: Date) =>
                        `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
                      const end = new Date(dt.getTime() + 60 * 60 * 1000);
                      const params = new URLSearchParams({
                        action: 'TEMPLATE',
                        text: `Cita: ${cita.nombreCliente || 'Cliente'}`,
                        dates: `${fmt(dt)}/${fmt(end)}`,
                        details: `Cita confirmada en JerezSur Inmobiliaria${cita.motivo ? '\n' + cita.motivo : ''}`,
                        location: 'JerezSur Inmobiliaria, Jerez de la Frontera',
                      });
                      return (
                        <a href={`https://calendar.google.com/calendar/render?${params}`}
                          target="_blank" rel="noreferrer" className="btn btn-ghost"
                          style={{ width: '100%', textAlign: 'center', textDecoration: 'none' }}>
                          Añadir a Google Calendar
                        </a>
                      );
                    })()}
                    <button disabled={guardando} onClick={handleCompletar} className="btn btn-primary" style={{ width: '100%' }}>
                      {guardando ? 'Procesando...' : 'Marcar como COMPLETADA'}
                    </button>
                    <div className="form-row">
                      <button disabled={guardando} onClick={handleNoPresentado} className="btn btn-warning" style={{ flexGrow: 1 }}>
                        Cliente NO presentado
                      </button>
                      <button disabled={guardando} onClick={handleCancelar} className="btn btn-danger" style={{ flexGrow: 1 }}>
                        Cancelar cita
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onCerrar} className="btn btn-ghost">Cerrar</button>
        </div>
      </div>
    </div>
  );
};
