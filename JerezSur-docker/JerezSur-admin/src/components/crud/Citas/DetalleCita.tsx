import { useState } from 'react';
import type { Cita } from '../../../types/cita';
import {
  formatearFechaHora,
  citaYaPasada,
  traducirEstado,
} from '../../../utils/calendario';
import '../../../styles/App.scss';

type SeccionCita = 'informacion' | 'gestion';

interface DetalleCitaModalProps {
  cita: Cita;
  loading?: boolean; // Añadido para igualar al patrón de referencia
  onCerrar: () => void;
  onAceptar: (id: number) => Promise<void>;
  onCompletar: (id: number) => Promise<void>;
  onCancelar: (id: number) => Promise<void>;
  onNoPresentado: (id: number) => Promise<void>;
}

export const DetalleCitaModal = ({
  cita,
  loading = false,
  onCerrar,
  onAceptar,
  onCompletar,
  onCancelar,
  onNoPresentado,
}: DetalleCitaModalProps) => {
  const [seccion, setSeccion] = useState<SeccionCita>('informacion');
  const [procesandoAction, setProcesandoAction] = useState(false);

  const pasada = citaYaPasada(cita);

  // --- Estado de Badge Inteligente ---
  const mapearBadgeColor = (estado: string): 'blue' | 'green' | 'amber' | 'gray' => {
    switch (estado) {
      case 'CONFIRMADA': return 'green';
      case 'PENDIENTE_ASIGNACION': return 'amber';
      case 'COMPLETADA': return 'blue';
      default: return 'gray'; // CANCELADA, NO_PRESENTADO
    }
  };

  const abrirWhatsApp = () => {
    const telefono = cita.telefonoCliente.replace(/[^0-9]/g, '');
    const mensaje = `Hola ${cita.nombreCliente}, contactamos de JerezSur Inmobiliaria con relación a su cita agendada.`;
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const llamar = () => {
    window.location.href = `tel:${cita.telefonoCliente}`;
  };

  // Wrapper para controlar la asincronía en las acciones del footer/gestiones
  const ejecutarAccion = async (callback: (id: number) => Promise<void>) => {
    setProcesandoAction(true);
    try {
      await callback(cita.id);
    } finally {
      setProcesandoAction(false);
    }
  };

  // Estado de carga inicial idéntico al del componente de referencia
  if (loading) return (
    <div className="form-modal show">
      <div className="form-modal__content">
        <p className="text-soft">Cargando detalles del expediente...</p>
      </div>
    </div>
  );

  return (
    <div className="form-modal show" role="dialog" aria-modal="true">
      <div className="form-modal__content">
        
        {/* Header con Badges de Estado */}
        <div className="modal-header">
          <h2 className="modal-title">Cita #{cita.id}</h2>
          <div className="modal-badges">
            <Badge text={traducirEstado(cita.estado)} color={mapearBadgeColor(cita.estado)} />
            {pasada && cita.estado === 'CONFIRMADA' && (
              <Badge text="Vencida / Pendiente cierre" color="gray" />
            )}
          </div>
        </div>

        {/* Sistema de Navegación por Pestañas */}
        <div className="tabs" role="tablist">
          {(['informacion', 'gestion'] as SeccionCita[]).map(s => (
            <button 
              key={s} 
              onClick={() => setSeccion(s)} 
              className={`tab ${seccion === s ? 'active' : ''}`}
            >
              {{ informacion: 'Detalles del cliente', gestion: 'Flujo del expediente' }[s]}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="form-modal__body">
          
          {/* ── SECCIÓN 1: INFORMACIÓN Y CONTACTO DIRECTO ── */}
          {seccion === 'informacion' && (
            <>
              <p className="section-title">Datos Personales y de Contacto</p>
              <div className="form-row">
                <Field label="Cliente / Titular">
                  <input type="text" readOnly value={cita.nombreCliente} />
                </Field>
                <Field label="Fecha y Hora Programada">
                  <input type="text" readOnly value={formatearFechaHora(cita.fechaHora)} />
                </Field>
              </div>

              <div className="form-row">
                <Field label="Canales de Contacto Directo">
                  <div className="action-buttons-group" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <input type="text" readOnly value={cita.telefonoCliente} style={{ flexGrow: 1 }} />
                    <button type="button" onClick={llamar} className="btn btn-sm">
                      📞 Llamar
                    </button>
                    <button type="button" onClick={abrirWhatsApp} className="btn btn-sm btn-success-whatsapp">
                      💬 WhatsApp
                    </button>
                  </div>
                </Field>
              </div>

              <p className="section-title">Asignación Logística</p>
              <div className="form-row">
                <Field label="Agente / Asesor Inmobiliario">
                  <input type="text" readOnly value={cita.nombreTrabajador || 'Sin agente asignado aún'} />
                </Field>
                <Field label="Inmueble de Referencia">
                  <input type="text" readOnly value={cita.direccionInmueble || 'Consulta general en oficina'} />
                </Field>
              </div>

              {cita.motivo && (
                <Field label="Notas operativas del motivo">
                  <textarea readOnly value={cita.motivo} className="textarea-large" rows={3} />
                </Field>
              )}
            </>
          )}

          {/* ── SECCIÓN 2: CONTROL DE FLUJO Y RESOLUCIÓN ── */}
          {seccion === 'gestion' && (
            <div className="workflow-management">
              <p className="section-title">Cambios de Estado y Resolución Legal</p>
              
              <div className="alert alert-info">
                {cita.estado === 'PENDIENTE_ASIGNACION' && 'Esta solicitud entró a través de canales externos o web y requiere confirmación de agenda.'}
                {cita.estado === 'CONFIRMADA' && 'El cliente y el agente tienen agendado este bloque. Puede resolver el expediente abajo.'}
                {(cita.estado === 'COMPLETADA' || cita.estado === 'CANCELADA' || cita.estado === 'NO_PRESENTADO') && 'Este expediente se encuentra archivado. Las citas cerradas no admiten modificaciones ulteriores.'}
              </div>

              <div className="workflow-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                
                {cita.estado === 'PENDIENTE_ASIGNACION' && (
                  <button 
                    disabled={procesandoAction} 
                    onClick={() => ejecutarAccion(onAceptar)} 
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    ✓ Validar y Aceptar esta cita
                  </button>
                )}

                {cita.estado === 'CONFIRMADA' && (
                  <>
                    <button 
                      disabled={procesandoAction} 
                      onClick={() => ejecutarAccion(onCompletar)} 
                      className="btn btn-primary"
                    >
                      ✓ Marcar como COMPLETADA exitosamente
                    </button>
                    
                    <div className="form-row">
                      <button 
                        disabled={procesandoAction} 
                        onClick={() => ejecutarAccion(onNoPresentado)} 
                        className="btn btn-warning"
                        style={{ flexGrow: 1 }}
                      >
                        ⚠ Cliente NO presentado
                      </button>
                      <button 
                        disabled={procesandoAction} 
                        onClick={() => ejecutarAccion(onCancelar)} 
                        className="btn btn-danger"
                        style={{ flexGrow: 1 }}
                      >
                        ✕ Cancelar Cita
                      </button>
                    </div>
                  </>
                )}

                {/* Si está cerrada */}
                {['COMPLETADA', 'CANCELADA', 'NO_PRESENTADO'].includes(cita.estado) && (
                  <div className="info-box text-center" style={{ padding: '2rem', background: 'var(--bg-soft)', borderRadius: 'var(--radius)' }}>
                    🔒 <strong>Expediente de Cita Archivado</strong>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      Cerrado bajo la resolución de tipo: <span className="text-strong">{traducirEstado(cita.estado)}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer global unificado */}
        <div className="modal-footer">
          <span className="text-muted" style={{ marginRight: 'auto', fontSize: '0.85rem' }}>
            JerezSur Inmobiliaria
          </span>
          <button onClick={onCerrar} className="btn btn-ghost">
            Cerrar ventana
          </button>
        </div>

      </div>
    </div>
  );
};

// --- Subcomponentes compartidos alineados con la UI de referencia ---
const Badge = ({ text, color }: { text: string; color: 'blue' | 'green' | 'amber' | 'gray' }) => (
  <span className={`badge badge--${color}`}>{text}</span>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="form-field">
    <label className="form-field__label">{label}</label>
    {children}
  </div>
);