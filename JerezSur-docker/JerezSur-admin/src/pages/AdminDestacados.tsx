// Página de gestión de inmuebles destacados en el panel de administración.
// Permite seleccionar hasta 3 inmuebles que aparecen en la portada de la web pública.
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useFeedback } from '../hooks/useFeedback';
import { FeedbackBanner } from '../components/layout/FeedbackBanner';
import '../styles/pages/CrudPages.scss';

interface InmuebleResumen {
  id: number;
  referencia: string;
  titulo: string;
  precio: number;
  operacion?: string;
  zona?: string;
  ciudad?: string;
  habitaciones?: number;
  superficieUtil?: number;
  imagenPortadaUrl?: string | null;
  destacado?: boolean;
}

const MAX_DESTACADOS = 3;

const formatPrecio = (p: number, op?: string) =>
  `${new Intl.NumberFormat('es-ES').format(p)} €${op === 'ALQUILER' ? '/mes' : ''}`;

const AdminDestacados = () => {
  const { feedback, showSuccess, showError, clearFeedback } = useFeedback();
  const [todos, setTodos] = useState<InmuebleResumen[]>([]);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  // Carga todos los inmuebles disponibles y los actuales destacados
  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [todosRes, destacadosRes] = await Promise.all([
        api.get('/inmuebles?size=200&sortBy=id&sortDir=desc&estado=DISPONIBLE'),
        api.get('/inmuebles/destacados'),
      ]);
      const inmuebles: InmuebleResumen[] = todosRes.data?.content ?? [];
      const destacadosIds: number[] = (destacadosRes.data ?? []).map((d: any) => d.id);
      setTodos(inmuebles);
      setSeleccionados(destacadosIds);
    } catch {
      showError('Error al cargar los inmuebles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const toggleSeleccion = (id: number) => {
    setSeleccionados(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= MAX_DESTACADOS) {
        showError(`Solo puedes tener ${MAX_DESTACADOS} inmuebles destacados. Quita uno antes de añadir otro.`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const guardar = async () => {
    setGuardando(true);
    try {
      await api.put('/inmuebles/destacados', seleccionados);
      showSuccess(`Destacados actualizados. ${seleccionados.length} de ${MAX_DESTACADOS} seleccionados.`);
      cargar();
    } catch (e: any) {
      showError(e?.response?.data?.error ?? 'Error al guardar los destacados.');
    } finally {
      setGuardando(false);
    }
  };

  const filtrados = todos.filter(i =>
    i.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    i.referencia?.toLowerCase().includes(busqueda.toLowerCase()) ||
    i.zona?.toLowerCase().includes(busqueda.toLowerCase()) ||
    i.ciudad?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="crud-page">
      {/* Cabecera */}
      <div className="crud-page__header">
        <div>
          <h1>Inmuebles destacados</h1>
          <p style={{ color: 'var(--color-text-soft)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Selecciona hasta <strong>{MAX_DESTACADOS}</strong> inmuebles que aparecerán en la portada de la web.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Contador visual */}
          <div style={{
            display: 'flex', gap: '0.4rem', alignItems: 'center',
            padding: '0.5rem 1rem',
            background: seleccionados.length === MAX_DESTACADOS
              ? 'rgba(46,155,77,0.1)' : 'rgba(0,67,156,0.06)',
            borderRadius: '999px',
            fontSize: '0.88rem', fontWeight: 700,
            color: seleccionados.length === MAX_DESTACADOS ? '#1e7a3a' : 'var(--color-primary)',
          }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                width: 12, height: 12, borderRadius: '50%',
                background: i < seleccionados.length
                  ? (seleccionados.length === MAX_DESTACADOS ? '#2e9b4d' : 'var(--color-primary)')
                  : 'var(--color-border)',
                display: 'inline-block', transition: 'background 0.2s',
              }} />
            ))}
            <span style={{ marginLeft: 4 }}>
              {seleccionados.length}/{MAX_DESTACADOS}
            </span>
          </div>
          <button
            className="btn btn--primary"
            onClick={guardar}
            disabled={guardando}
          >
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      <FeedbackBanner feedback={feedback} onDismiss={clearFeedback} />

      {/* Destacados actuales — preview */}
      {seleccionados.length > 0 && (
        <section style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '14px',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
        }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '0.9rem', textTransform: 'uppercase',
            letterSpacing: '0.06em', color: 'var(--color-text-soft)', fontWeight: 600 }}>
            Seleccionados actualmente
          </h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {seleccionados.map(id => {
              const i = todos.find(t => t.id === id);
              if (!i) return null;
              return (
                <div key={id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.5rem 0.75rem', borderRadius: '10px',
                  background: 'rgba(0,67,156,0.06)', border: '1.5px solid rgba(0,67,156,0.2)',
                  maxWidth: 280, minWidth: 200,
                }}>
                  {i.imagenPortadaUrl
                    ? <img src={i.imagenPortadaUrl} alt={i.titulo}
                        style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                    : <div style={{ width: 40, height: 40, borderRadius: 6, background: '#f1f5f9', flexShrink: 0 }} />
                  }
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {i.titulo}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-soft)' }}>
                      {i.zona || i.ciudad} · {formatPrecio(i.precio, i.operacion)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSeleccion(id)}
                    style={{ border: 'none', background: 'none', cursor: 'pointer',
                      color: 'var(--color-error)', fontSize: '1rem', marginLeft: 'auto', flexShrink: 0 }}
                    title="Quitar de destacados"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Buscador */}
      <div className="crud-page__filters" style={{ marginBottom: '1rem' }}>
        <label>
          Buscar inmueble
          <input
            type="text"
            placeholder="Título, referencia, zona o ciudad..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </label>
      </div>

      {/* Tabla de inmuebles */}
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--color-text-soft)', padding: '3rem' }}>
          Cargando inmuebles...
        </p>
      ) : (
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th style={{ width: 56 }}>★</th>
                <th style={{ width: 60 }}>Foto</th>
                <th>Inmueble</th>
                <th>Zona</th>
                <th>Precio</th>
                <th>Hab.</th>
                <th>m²</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem',
                    color: 'var(--color-text-soft)' }}>
                    No hay inmuebles disponibles
                  </td>
                </tr>
              ) : filtrados.map(i => {
                const esSeleccionado = seleccionados.includes(i.id);
                const limite = !esSeleccionado && seleccionados.length >= MAX_DESTACADOS;
                return (
                  <tr
                    key={i.id}
                    onClick={() => !limite && toggleSeleccion(i.id)}
                    style={{
                      cursor: limite ? 'not-allowed' : 'pointer',
                      opacity: limite ? 0.5 : 1,
                      background: esSeleccionado ? 'rgba(0,67,156,0.05)' : undefined,
                    }}
                  >
                    <td>
                      <span style={{
                        fontSize: '1.2rem',
                        color: esSeleccionado ? '#e6a700' : 'var(--color-border)',
                        transition: 'color 0.2s',
                      }}>
                        ★
                      </span>
                    </td>
                    <td>
                      {i.imagenPortadaUrl
                        ? <img src={i.imagenPortadaUrl} alt={i.titulo}
                            style={{ width: 44, height: 36, objectFit: 'cover', borderRadius: 6 }} />
                        : <div style={{ width: 44, height: 36, borderRadius: 6, background: '#f1f5f9' }} />
                      }
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.88rem' }}>{i.titulo}</strong>
                      <br />
                      <small style={{ color: 'var(--color-text-soft)' }}>{i.referencia}</small>
                    </td>
                    <td>{[i.zona, i.ciudad].filter(Boolean).join(', ') || '—'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                      {formatPrecio(i.precio, i.operacion)}
                    </td>
                    <td>{i.habitaciones ?? '—'}</td>
                    <td>{i.superficieUtil ? `${i.superficieUtil} m²` : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDestacados;
