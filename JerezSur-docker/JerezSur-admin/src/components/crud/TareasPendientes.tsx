// Componente de tareas pendientes del dashboard del admin.
// Muestra la lista de tareas activas y el formulario para crear nuevas tareas manuales.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Tarea, NuevaTarea } from '../../types/dashboard';

interface Props {
  tareas: Tarea[];
  onCrear: (tarea: NuevaTarea) => Promise<void>;
  onCompletar: (id: number) => Promise<void>;
}

const PRIORIDAD_META: Record<string, { label: string; color: string; dot: string }> = {
  ALTA:  { label: 'Alta',  color: '#c0392b', dot: '🔴' },
  MEDIA: { label: 'Media', color: '#d97706', dot: '🟡' },
  BAJA:  { label: 'Baja',  color: '#4a9e2f', dot: '🟢' },
};

function formatFecha(raw: string) {
  const d = new Date(raw + 'T00:00:00');
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d.getTime() - hoy.getTime()) / 86400000);
  if (diff < 0)  return { txt: `Vencida hace ${Math.abs(diff)}d`, overdue: true };
  if (diff === 0) return { txt: 'Hoy', overdue: false };
  if (diff === 1) return { txt: 'Mañana', overdue: false };
  return { txt: d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }), overdue: false };
}

export const TareasPendientes = ({ tareas, onCrear, onCompletar }: Props) => {
  const navigate = useNavigate();
  const [abrirForm, setAbrirForm] = useState(false);
  const [titulo,    setTitulo]    = useState('');
  const [desc,      setDesc]      = useState('');
  const [fecha,     setFecha]     = useState(new Date().toISOString().split('T')[0]);
  const [prioridad, setPrioridad] = useState<'ALTA' | 'MEDIA' | 'BAJA'>('MEDIA');
  const [enlace,    setEnlace]    = useState('');
  const [etiqueta,  setEtiqueta]  = useState('');
  const [guardando, setGuardando] = useState(false);
  const [completando, setCompletando] = useState<number | null>(null);

  const reset = () => {
    setTitulo(''); setDesc('');
    setFecha(new Date().toISOString().split('T')[0]);
    setPrioridad('MEDIA'); setEnlace(''); setEtiqueta('');
    setAbrirForm(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;
    setGuardando(true);
    try {
      await onCrear({ titulo, descripcion: desc, fecha, prioridad,
        enlace: enlace.trim() || undefined,
        etiquetaEnlace: etiqueta.trim() || undefined });
      reset();
    } finally { setGuardando(false); }
  };

  const completar = async (id: number) => {
    setCompletando(id);
    try { await onCompletar(id); }
    finally { setCompletando(null); }
  };

  const abrirLink = (url: string) => {
    if (/^(https?:|mailto:|tel:|wa\.me)/.test(url)) {
      window.open(url, '_blank', 'noopener');
    } else {
      // Rutas internas del panel → React Router (respeta el basename /admin)
      navigate(url);
    }
  };

  // Ordenar: ALTA primero, luego MEDIA, luego BAJA, dentro de cada grupo por fecha
  const sorted = [...tareas].sort((a, b) => {
    const prio = { ALTA: 0, MEDIA: 1, BAJA: 2 };
    const pa = prio[a.prioridad as keyof typeof prio] ?? 1;
    const pb = prio[b.prioridad as keyof typeof prio] ?? 1;
    if (pa !== pb) return pa - pb;
    return a.fecha.localeCompare(b.fecha);
  });

  const alta  = sorted.filter(t => t.prioridad === 'ALTA');
  const media = sorted.filter(t => t.prioridad === 'MEDIA');
  const baja  = sorted.filter(t => t.prioridad === 'BAJA');

  return (
    <div className="tareas">

      {/* Header */}
      <div className="tareas__header">
        <div className="tareas__header-left">
          <h2 className="tareas__titulo">Agenda y tareas</h2>
          <div className="tareas__counters">
            {alta.length  > 0 && <span className="t-badge t-badge--alta">{alta.length} urgente{alta.length > 1 ? 's':''}</span>}
            {media.length > 0 && <span className="t-badge t-badge--media">{media.length} media{media.length > 1 ? 's':''}</span>}
            {baja.length  > 0 && <span className="t-badge t-badge--baja">{baja.length} baja{baja.length > 1 ? 's':''}</span>}
            {tareas.length === 0 && <span className="t-badge t-badge--ok">Todo al día ✓</span>}
          </div>
        </div>
        <button
          className={`t-btn ${abrirForm ? 't-btn--ghost' : 't-btn--primary'}`}
          onClick={() => setAbrirForm(v => !v)}
        >
          {abrirForm ? '✕ Cancelar' : '+ Nueva tarea'}
        </button>
      </div>

      {/* Formulario inline */}
      {abrirForm && (
        <form onSubmit={submit} className="tareas__form">
          <div className="t-form-row">
            <div className="t-field t-field--grow">
              <label>Título *</label>
              <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)}
                     placeholder="Describe la tarea…" required autoFocus />
            </div>
            <div className="t-field">
              <label>Vencimiento *</label>
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required />
            </div>
            <div className="t-field">
              <label>Prioridad</label>
              <select value={prioridad} onChange={e => setPrioridad(e.target.value as any)}>
                <option value="ALTA">🔴 Alta</option>
                <option value="MEDIA">🟡 Media</option>
                <option value="BAJA">🟢 Baja</option>
              </select>
            </div>
          </div>
          <div className="t-form-row">
            <div className="t-field t-field--grow">
              <label>Descripción (opcional)</label>
              <input type="text" value={desc} onChange={e => setDesc(e.target.value)}
                     placeholder="Detalles adicionales…" />
            </div>
            <div className="t-field">
              <label>Enlace (opcional)</label>
              <input type="text" value={enlace} onChange={e => setEnlace(e.target.value)}
                     placeholder="https://… o ruta interna" />
            </div>
            <div className="t-field">
              <label>Texto del botón</label>
              <input type="text" value={etiqueta} onChange={e => setEtiqueta(e.target.value)}
                     placeholder="Ver ficha" />
            </div>
          </div>
          <div className="t-form-actions">
            <button type="button" className="t-btn t-btn--ghost" onClick={reset}>Cancelar</button>
            <button type="submit" className="t-btn t-btn--primary" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar tarea'}
            </button>
          </div>
        </form>
      )}

      {/* Lista de tareas */}
      {tareas.length === 0 ? (
        <div className="tareas__empty">
          <p className="tareas__empty-icon">🎉</p>
          <p className="tareas__empty-text">No hay tareas pendientes. ¡Buen trabajo!</p>
        </div>
      ) : (
        <ul className="tareas__lista">
          {sorted.map(tarea => {
            const pm = PRIORIDAD_META[tarea.prioridad] ?? PRIORIDAD_META.MEDIA;
            const { txt: fechaTxt, overdue } = formatFecha(tarea.fecha);
            return (
              <li key={tarea.id} className={`t-card ${overdue ? 't-card--overdue' : ''}`}
                  style={{ '--p-color': pm.color } as React.CSSProperties}>
                <div className="t-card__stripe" />
                <div className="t-card__body">
                  <div className="t-card__top">
                    <span className="t-card__prio-dot">{pm.dot}</span>
                    <strong className="t-card__titulo">{tarea.titulo}</strong>
                    <span className={`t-card__fecha ${overdue ? 't-card__fecha--late' : ''}`}>
                      {overdue ? '⚠️ ' : '📅 '}{fechaTxt}
                    </span>
                  </div>
                  {tarea.descripcion && (
                    <p className="t-card__desc">{tarea.descripcion}</p>
                  )}
                </div>
                <div className="t-card__actions">
                  {tarea.enlace && (
                    <button className="t-btn t-btn--ghost t-btn--sm"
                            onClick={() => abrirLink(tarea.enlace!)}>
                      🔗 {tarea.etiquetaEnlace || 'Abrir'}
                    </button>
                  )}
                  <button
                    className="t-btn t-btn--success t-btn--sm"
                    disabled={completando === tarea.id}
                    onClick={() => completar(tarea.id)}
                  >
                    {completando === tarea.id ? '…' : '✓ Hecho'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
