import { useState } from 'react';
import type { Tarea, NuevaTarea } from '../../types/dashboard';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

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
  };

  const abrirEnlace = (url: string) => {
    if (/^(https?:|mailto:|tel:|wa\.me)/.test(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = url;
    }
  };

  return (
    <section>
      <header>
        <h2>Tareas pendientes ({tareas.length})</h2>
        <button onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? 'Cancelar' : '+ Nueva tarea'}
        </button>
      </header>

      {mostrarForm && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Descripción (opcional)"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
          <select
            value={prioridad}
            onChange={(e) =>
              setPrioridad(e.target.value as 'ALTA' | 'MEDIA' | 'BAJA')
            }
          >
            <option value="ALTA">Alta</option>
            <option value="MEDIA">Media</option>
            <option value="BAJA">Baja</option>
          </select>
          <input
            type="text"
            placeholder="Enlace (opcional)"
            value={enlace}
            onChange={(e) => setEnlace(e.target.value)}
          />
          <input
            type="text"
            placeholder="Texto del botón (opcional)"
            value={etiquetaEnlace}
            onChange={(e) => setEtiquetaEnlace(e.target.value)}
          />
          <button type="submit">Guardar</button>
        </form>
      )}

      {tareas.length === 0 ? (
        <p>No hay tareas pendientes.</p>
      ) : (
        <ul>
          {tareas.map((tarea) => (
            <li key={tarea.id}>
              <div>
                <span>[{tarea.prioridad}]</span>
                <strong>{tarea.titulo}</strong>
                {tarea.descripcion && <p>{tarea.descripcion}</p>}
                <small>{tarea.fecha}</small>
              </div>
              <div>
                {tarea.enlace && (
                  <button onClick={() => abrirEnlace(tarea.enlace!)}>
                    {tarea.etiquetaEnlace || 'Abrir'}
                  </button>
                )}
                <button onClick={() => onCompletar(tarea.id)}>✓ Hecho</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};