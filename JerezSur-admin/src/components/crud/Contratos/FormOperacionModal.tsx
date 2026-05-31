import { useState, useEffect } from 'react';
import type { NuevaOperacion, RolParticipante } from '../../../types/operacion';
import api from '../../../services/api';
import '../../../styles/App.scss';

interface Props {
  onCrear: (operacion: NuevaOperacion) => Promise<void>;
  onCancelar: () => void;
}

type Tab = 'datos' | 'inmueble' | 'interesados';

interface InteresadoResumen {
  id: number;
  estado: string;
  zonaInteres?: string;
  presupuestoMaximo?: number;
  tipoBusqueda?: string;
  usuario?: { nombre?: string; email?: string; telefono?: string };
}

const ROLES: RolParticipante[] = ['TITULAR', 'APODERADO', 'AVALISTA'];
const TAMANO_PAGINA = 5;

export const FormOperacionModal = ({ onCrear, onCancelar }: Props) => {
  const [tab, setTab] = useState<Tab>('datos');
  const [form, setForm] = useState<NuevaOperacion>({
    categoria_operacion: 'VENTA',
    precioAcordado: 0,
    inmuebleId: 0,
    interesadosRol: {},
    depositoArras: 0,
    fechaLimiteEscritura: '',
    incluyeMobiliario: false,
    fianza: 0,
    duracionMeses: 12,
    admiteMascotas: false,
  });
  const [guardando, setGuardando] = useState(false);

  // --- Estado búsqueda interesados ---
  const [interesados, setInteresados] = useState<InteresadoResumen[]>([]);
  const [cargandoInteresados, setCargandoInteresados] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  useEffect(() => {
    if (tab !== 'interesados') return;
    const cargar = async () => {
      setCargandoInteresados(true);
      try {
        const params = new URLSearchParams({
          page: String(pagina),
          size: String(TAMANO_PAGINA),
          sortBy: 'id',
          sortDir: 'asc',
          ...(busqueda ? { zona: busqueda } : {}),
        });
        const { data } = await api.get(`/interesados?${params}`);
        setInteresados(data.content ?? []);
        setTotalPaginas(data.totalPages ?? 0);
      } catch {
        setInteresados([]);
      } finally {
        setCargandoInteresados(false);
      }
    };
    cargar();
  }, [tab, pagina, busqueda]);

  const añadirInteresado = (id: number) => {
    if (form.interesadosRol[String(id)]) return; // ya está
    setForm(f => ({ ...f, interesadosRol: { ...f.interesadosRol, [String(id)]: 'TITULAR' } }));
  };

  const quitarInteresado = (id: string) => {
    const clon = { ...form.interesadosRol };
    delete clon[id];
    setForm(f => ({ ...f, interesadosRol: clon }));
  };

  const cambiarRol = (id: string, rol: RolParticipante) => {
    setForm(f => ({ ...f, interesadosRol: { ...f.interesadosRol, [id]: rol } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.precioAcordado <= 0) {
      setTab('datos');
      return alert('Indica un precio acordado válido.');
    }
    if (!form.inmuebleId) {
      setTab('inmueble');
      return alert('Indica el ID del inmueble.');
    }
    if (Object.keys(form.interesadosRol).length === 0) {
      setTab('interesados');
      return alert('Añade al menos un interesado.');
    }
    if (form.categoria_operacion === 'VENTA' && (!form.depositoArras || !form.fechaLimiteEscritura)) {
      setTab('datos');
      return alert('Para ventas añade depósito de arras y fecha límite de escritura.');
    }
    if (form.categoria_operacion === 'ALQUILER' && !form.fianza) {
      setTab('datos');
      return alert('Para alquileres indica una fianza válida.');
    }

    setGuardando(true);
    try {
      await onCrear(form);
      onCancelar();
    } finally {
      setGuardando(false);
    }
  };

  const etiquetaInteresado = (id: string): string => {
    const found = interesados.find(i => String(i.id) === id);
    if (found) {
      return found.usuario?.nombre || found.usuario?.email || `ID ${id}`;
    }
    return `ID ${id}`;
  };

  return (
    <div className="form-modal show">
      <form onSubmit={handleSubmit} className="form-modal__content">
        <div className="form-modal__header">
          <h2>Apertura de Expediente</h2>
          <button type="button" onClick={onCancelar} className="btn">✕</button>
        </div>

        <div className="form-modal__body">
          <div className="tabs" role="tablist">
            <button type="button" onClick={() => setTab('datos')} className={`tab ${tab === 'datos' ? 'active' : ''}`}>
              Datos
            </button>
            <button type="button" onClick={() => setTab('inmueble')} className={`tab ${tab === 'inmueble' ? 'active' : ''}`}>
              Inmueble
            </button>
            <button type="button" onClick={() => setTab('interesados')} className={`tab ${tab === 'interesados' ? 'active' : ''}`}>
              Interesados {Object.keys(form.interesadosRol).length > 0 && `(${Object.keys(form.interesadosRol).length})`}
            </button>
          </div>

          {/* ---- PESTAÑA DATOS ---- */}
          {tab === 'datos' && (
            <>
              <p className="section-title">Clasificación y Precio</p>
              <div className="form-row">
                <Field label="Tipo de operación">
                  <select
                    value={form.categoria_operacion}
                    onChange={e => setForm({ ...form, categoria_operacion: e.target.value as any })}
                  >
                    <option value="VENTA">Compraventa</option>
                    <option value="ALQUILER">Arrendamiento</option>
                  </select>
                </Field>
                <Field label="Precio acordado (€) *">
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.precioAcordado || ''}
                    onChange={e => setForm({ ...form, precioAcordado: Number(e.target.value) })}
                  />
                </Field>
              </div>

              <p className="section-title">
                Condiciones de {form.categoria_operacion === 'VENTA' ? 'compraventa' : 'arrendamiento'}
              </p>
              {form.categoria_operacion === 'VENTA' ? (
                <>
                  <div className="form-row">
                    <Field label="Depósito de arras (€) *">
                      <input
                        type="number"
                        min="0"
                        value={form.depositoArras || ''}
                        onChange={e => setForm({ ...form, depositoArras: Number(e.target.value) })}
                      />
                    </Field>
                    <Field label="Fecha límite escritura *">
                      <input
                        type="date"
                        value={form.fechaLimiteEscritura}
                        onChange={e => setForm({ ...form, fechaLimiteEscritura: e.target.value })}
                      />
                    </Field>
                  </div>
                  <label className="checkbox-label" style={{ marginTop: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={form.incluyeMobiliario}
                      onChange={e => setForm({ ...form, incluyeMobiliario: e.target.checked })}
                    />
                    <span>Incluye el mobiliario existente</span>
                  </label>
                </>
              ) : (
                <>
                  <div className="form-row">
                    <Field label="Fianza (€) *">
                      <input
                        type="number"
                        min="0"
                        value={form.fianza || ''}
                        onChange={e => setForm({ ...form, fianza: Number(e.target.value) })}
                      />
                    </Field>
                    <Field label="Duración (meses)">
                      <input
                        type="number"
                        min="1"
                        value={form.duracionMeses || ''}
                        onChange={e => setForm({ ...form, duracionMeses: Number(e.target.value) })}
                      />
                    </Field>
                  </div>
                  <label className="checkbox-label" style={{ marginTop: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={form.admiteMascotas}
                      onChange={e => setForm({ ...form, admiteMascotas: e.target.checked })}
                    />
                    <span>El propietario admite mascotas</span>
                  </label>
                </>
              )}
            </>
          )}

          {/* ---- PESTAÑA INMUEBLE ---- */}
          {tab === 'inmueble' && (
            <>
              <p className="section-title">Inmueble vinculado</p>
              <Field label="ID del inmueble *">
                <input
                  type="number"
                  min="1"
                  placeholder="Ej: 42"
                  value={form.inmuebleId || ''}
                  onChange={e => setForm({ ...form, inmuebleId: Number(e.target.value) })}
                />
              </Field>
              <p className="text-soft">Introduce el ID del inmueble que se vincula al expediente.</p>
            </>
          )}

          {/* ---- PESTAÑA INTERESADOS ---- */}
          {tab === 'interesados' && (
            <>
              {/* Seleccionados */}
              {Object.keys(form.interesadosRol).length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <p className="section-title">Participantes seleccionados</p>
                  {Object.entries(form.interesadosRol).map(([id, rol]) => (
                    <div key={id} className="form-row" style={{ alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ flex: 1 }}>{etiquetaInteresado(id)}</span>
                      <select
                        value={rol}
                        onChange={e => cambiarRol(id, e.target.value as RolParticipante)}
                        style={{ width: 'auto' }}
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <button type="button" className="btn btn-ghost" onClick={() => quitarInteresado(id)}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Buscador */}
              <p className="section-title">Añadir interesado</p>
              <input
                type="text"
                placeholder="Buscar por zona de interés..."
                value={busqueda}
                onChange={e => { setBusqueda(e.target.value); setPagina(0); }}
                style={{ width: '100%', marginBottom: '0.5rem' }}
              />

              {cargandoInteresados ? (
                <p className="text-soft">Cargando...</p>
              ) : interesados.length === 0 ? (
                <p className="text-soft">No se encontraron interesados.</p>
              ) : (
                <div className="data-table" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre / Email</th>
                        <th>Zona</th>
                        <th>Presupuesto</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {interesados.map(i => {
                        const yaSeleccionado = !!form.interesadosRol[String(i.id)];
                        return (
                          <tr key={i.id}>
                            <td><code>{i.id}</code></td>
                            <td>{i.usuario?.nombre || i.usuario?.email || '—'}</td>
                            <td>{i.zonaInteres || '—'}</td>
                            <td>{i.presupuestoMaximo ? `${i.presupuestoMaximo.toLocaleString('es-ES')} €` : '—'}</td>
                            <td>
                              <button
                                type="button"
                                className={`btn ${yaSeleccionado ? 'btn-ghost' : 'btn-secondary'}`}
                                onClick={() => añadirInteresado(i.id)}
                                disabled={yaSeleccionado}
                              >
                                {yaSeleccionado ? '✓' : '+ Añadir'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {totalPaginas > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="button" className="btn btn-ghost" disabled={pagina === 0} onClick={() => setPagina(p => p - 1)}>
                    ← Anterior
                  </button>
                  <span className="text-soft">Página {pagina + 1} / {totalPaginas}</span>
                  <button type="button" className="btn btn-ghost" disabled={pagina >= totalPaginas - 1} onClick={() => setPagina(p => p + 1)}>
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="form-modal__footer">
          <button type="button" onClick={onCancelar} className="btn">Cancelar</button>
          <button type="submit" disabled={guardando} className="btn btn-primary">
            {guardando ? 'Generando...' : 'Generar Expediente'}
          </button>
        </div>
      </form>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="form-group">
    <label>{label}</label>
    {children}
  </div>
);
