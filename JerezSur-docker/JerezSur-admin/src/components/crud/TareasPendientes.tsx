import { useState } from 'react';
import type { Tarea, NuevaTarea } from '../../types/dashboard';
import '../../styles/App.scss'; // Asegura la consistencia visual

interface TareasPendientesProps {
  tareas: Tarea[];
  onCrear: (tarea: NuevaTarea) => Promise<void>;
  onCompletar: (id: number) => Promise<void>;
}

export const TareasPendientes = ({
  tareas,
  onCrear,
  onCompletar,
}: TareasPendientesProps) => {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [prioridad, setPrioridad] = useState<'ALTA' | 'MEDIA' | 'BAJA'>('MEDIA');
  const [enlace, setEnlace] = useState('');
  const [etiquetaEnlace, setEtiquetaEnlace] = useState('');
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    setGuardando(true);
    try {
      await onCrear({
        titulo,
        descripcion,
        fecha,
        prioridad,
        enlace: enlace.trim() || undefined,
        etiquetaEnlace: etiquetaEnlace.trim() || undefined,
      });

      setTitulo('');
      setDescripcion('');
      setFecha(new Date().toISOString().split('T')[0]);
      setPrioridad('MEDIA');
      setEnlace('');
      setEtiquetaEnlace('');
      setMostrarForm(false);
    } finally {
      setGuardando(false);
    }
  };

  const abrirEnlace = (url: string) => {
    if (/^(https?:|mailto:|tel:|wa\.me)/.test(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = url;
    }
  };

  return (
    <section className="dashboard-card tasks-section">
      
      {/* Cabecera del bloque */}
      <header className="dashboard-card__header">
        <div className="title-group">
          <h2>Tareas pendientes</h2>
          <span className="badge badge-info">{tareas.length}</span>
        </div>
        <button 
          onClick={() => setMostrarForm(!mostrarForm)} 
          className={`btn ${mostrarForm ? 'btn-ghost' : 'btn-primary btn-sm'}`}
        >
          {mostrarForm ? 'Cancelar' : '+ Nueva Tarea'}
        </button>
      </header>

      {/* Formulario de Alta Inline (Desplegable) */}
      {mostrarForm && (
        <form onSubmit={handleSubmit} className="tasks-form-inline">
          <div className="form-row">
            <Field label="Título *">
              <input
                type="text"
                placeholder="Ej: Llamar a notaría por Juan"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
              />
            </Field>
            <Field label="Vencimiento *">
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </Field>
            <Field label="Prioridad">
              <select
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value as any)}
              >
                <option value="ALTA">🚨 Alta</option>
                <option value="MEDIA">🟡 Media</option>
                <option value="BAJA">📉 Baja</option>
              </select>
            </Field>
          </div>

          <Field label="Descripción (opcional)">
            <input
              type="text"
              placeholder="Añade detalles adicionales de la tarea..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </Field>

          <div className="form-row">
            <Field label="Enlace de Acción (opcional)">
              <input
                type="text"
                placeholder="https://... o id de cliente"
                value={enlace}
                onChange={(e) => setEnlace(e.target.value)}
              />
            </Field>
            <Field label="Texto del Botón">
              <input
                type="text"
                placeholder="Ej: Ver Ficha"
                value={etiquetaEnlace}
                onChange={(e) => setEtiquetaEnlace(e.target.value)}
              />
            </Field>
          </div>

          <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" disabled={guardando} className="btn btn-primary btn-sm">
              {guardando ? 'Guardando...' : 'Guardar Tarea'}
            </button>
          </div>
        </form>
      )}

      {/* Lista de Tareas */}
      <div className="tasks-container">
        {tareas.length === 0 ? (
          <p className="no-data-text">No tienes tareas pendientes para hoy. ¡Buen trabajo!</p>
        ) : (
          <ul className="tasks-list">
            {tareas.map((tarea) => (
              <li key={tarea.id} className="tasks-item">
                
                {/* Bloque izquierdo: Información */}
                <div className="tasks-item__content">
                  <div className="tasks-item__title-row">
                    <span className={`priority-tag priority-tag--${tarea.prioridad.toLowerCase()}`}>
                      {tarea.prioridad}
                    </span>
                    <strong>{tarea.titulo}</strong>
                  </div>
                  
                  {tarea.descripcion && (
                    <p className="tasks-item__description">{tarea.descripcion}</p>
                  )}
                  
                  <div className="tasks-item__meta">
                    <span className="meta-date">📅 {tarea.fecha}</span>
                  </div>
                </div>

                {/* Bloque derecho: Acciones de la tarea */}
                <div className="tasks-item__actions">
                  {tarea.enlace && (
                    <button 
                      onClick={() => abrirEnlace(tarea.enlace!)}
                      className="btn btn-ghost btn-sm"
                      title={tarea.enlace}
                    >
                      🔗 {tarea.etiquetaEnlace || 'Abrir'}
                    </button>
                  )}
                  <button 
                    onClick={() => onCompletar(tarea.id)}
                    className="btn btn-success btn-sm btn-done"
                  >
                    ✓ Hecho
                  </button>
                </div>

              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

// --- Helper UI Interno ---
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>{label}</label>
    {children}
  </div>
);