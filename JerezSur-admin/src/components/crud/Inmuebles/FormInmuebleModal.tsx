import { useState, useEffect } from 'react';
import type { NuevoInmueble, TipoInmueble } from '../../../types/inmueble';
import type { Vendedor } from '../../../types/vendedor'; 
import '../../../styles/App.scss';

type TabActual = 'datos' | 'propietarios';

interface Props {
  onCrear: (inmueble: NuevoInmueble) => Promise<void>;
  onCancelar: () => void;
  error?: string | null;
}

export const FormInmuebleModal = ({ onCrear, onCancelar, error: externalError }: Props) => {
  // --- Estado de Propietarios Seleccionados (Mapa ID_Vendedor -> Porcentaje) ---
  const [propietariosPorcentaje, setPropietariosPorcentaje] = useState<Record<string, number>>({});

  // --- Estado del formulario del inmueble ---
  const [form, setForm] = useState<NuevoInmueble>({
    titulo: '',
    precio: 0,
    operacion: 'VENTA',
    estado: 'DISPONIBLE',
    tipo: 'PISO',
    superficieUtil: 0,
    mConstruidos: 0,
    habitaciones: 1,
    banos: 1,
    direccion: '',
    codigoPostal: '',
    ciudad: '',
    descripcion: '',
    propietariosPorcentaje: {} 
  });

  // --- Gestión de Pestañas ---
  const [activeTab, setActiveTab] = useState<TabActual>('datos');

  // --- 🌟 NUEVOS ESTADOS PARA PAGINACIÓN Y FILTRADO DENTRO DEL MODAL 🌟 ---
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [cargandoVendedores, setCargandoVendedores] = useState<boolean>(true);
  const [filtroBusqueda, setFiltroBusqueda] = useState<string>('');
  const [paginaActual, setPaginaActual] = useState<number>(0);
  const [totalPaginas, setTotalPaginas] = useState<number>(0);
  const TAMANO_PAGINA = 5; // Mostramos de 5 en 5 dentro del modal para que sea limpio

  const [guardando, setGuardando] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Fetch para obtener los vendedores con paginación y filtros
  useEffect(() => {
    const cargarVendedoresDesdeBackend = async () => {
      try {
        setCargandoVendedores(true);
        const token = localStorage.getItem('token');
        
        // 🌟 Construimos la URL usando la paginación nativa de tu controlador
        // Nota: Si tu backend ya acepta un parámetro 'search' o 'filtro', añádelo aquí: &buscar=${filtroBusqueda}
        let url = `http://localhost:8080/api/vendedores?page=${paginaActual}&size=${TAMANO_PAGINA}&sortBy=id&sortDir=asc`;
        
        // Si tienes filtrado genérico en el backend, puedes descomentar o adaptar esto:
        // if (filtroBusqueda) url += `&filtrar=${filtroBusqueda}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '' 
          }
        }); 
        
        if (!response.ok) {
          throw new Error('No se pudieron cargar los propietarios desde el servidor');
        }
        
        const data = await response.json();
        
        // 🌟 Guardamos el array de la página actual y el total de páginas del backend
        setVendedores(data.content || []);
        setTotalPaginas(data.totalPages || 0);
      } catch (err) {
        console.error(err);
        setLocalError('Error al conectar con el servidor para obtener los vendedores.');
      } finally {
        setCargandoVendedores(false);
      }
    };

    // Solo hacemos fetch si estamos en la pestaña de propietarios
    if (activeTab === 'propietarios') {
      cargarVendedoresDesdeBackend();
    }
  }, [paginaActual, filtroBusqueda, activeTab]);

  // Resetear a la página 0 si el usuario escribe en el buscador
  const handleBusquedaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltroBusqueda(e.target.value);
    setPaginaActual(0); 
  };

  const validarFormulario = (): string | null => {
    if (!form.titulo?.trim()) return 'El título es obligatorio';
    if (form.precio <= 0) return 'El precio debe ser mayor a 0';
    if (!form.direccion?.trim()) return 'La dirección es obligatoria';
    if (!form.codigoPostal?.trim()) return 'El código postal es obligatorio';
    if (!form.ciudad?.trim()) return 'La ciudad es obligatoria';

    const keysPropietarios = Object.keys(propietariosPorcentaje);
    if (keysPropietarios.length === 0) {
      return 'Debe asignar al menos un propietario al inmueble en la pestaña de Propietarios';
    }

    const sumaPorcentajes = Object.values(propietariosPorcentaje).reduce((a, b) => a + b, 0);
    if (sumaPorcentajes !== 100) {
      return `La suma de los porcentajes de propiedad debe ser exactamente el 100%. Actualmente es el ${sumaPorcentajes}%`;
    }

    return null;
  };

  const handleToggleVendedor = (id: number) => {
    const idStr = id.toString();
    setPropietariosPorcentaje(prev => {
      const copia = { ...prev };
      if (idStr in copia) {
        delete copia[idStr];
      } else {
        copia[idStr] = 0; 
      }
      return copia;
    });
  };

  const handlePorcentajeChange = (id: number, valor: number) => {
    setPropietariosPorcentaje(prev => ({
      ...prev,
      [id.toString()]: valor
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const validationError = validarFormulario();
    if (validationError) {
      setLocalError(validationError);
      if (Object.keys(propietariosPorcentaje).length === 0 || validationError.includes('100%')) {
        setActiveTab('propietarios');
      } else {
        setActiveTab('datos');
      }
      return;
    }

    setGuardando(true);
    try {
      const datosFinales: NuevoInmueble = {
        ...form,
        propietariosPorcentaje: propietariosPorcentaje
      };

      await onCrear(datosFinales);
      onCancelar();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido al guardar el inmueble';
      setLocalError(message);
    } finally {
      setGuardando(false);
    }
  };

  const displayError = localError || externalError;

  return (
    <div className="form-modal show">
      <form onSubmit={handleSubmit} className="form-modal__content" style={{ maxWidth: '750px' }}>
        
        <div className="form-modal__header">
          <h2>Alta de Inmueble</h2>
          <button type="button" onClick={onCancelar} className="btn">✕</button>
        </div>

        {/* NAVEGACIÓN DE PESTAÑAS */}
        <div style={{ display: 'flex', borderBottom: '1px solid #dee2e6', backgroundColor: '#f8f9fa', padding: '0.5rem 1rem 0 1rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('datos')}
            style={{
              padding: '0.75rem 1.2rem', border: 'none', background: 'none',
              borderBottom: activeTab === 'datos' ? '3px solid #007bff' : '3px solid transparent',
              color: activeTab === 'datos' ? '#007bff' : '#495057', fontWeight: activeTab === 'datos' ? '600' : 'normal', cursor: 'pointer'
            }}
          >
            🏠 Datos del Inmueble
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('propietarios')}
            style={{
              padding: '0.75rem 1.2rem', border: 'none', background: 'none',
              borderBottom: activeTab === 'propietarios' ? '3px solid #007bff' : '3px solid transparent',
              color: activeTab === 'propietarios' ? '#007bff' : '#495057', fontWeight: activeTab === 'propietarios' ? '600' : 'normal', cursor: 'pointer'
            }}
          >
            👥 Propietarios y Participación
            {Object.keys(propietariosPorcentaje).length > 0 && (
              <span style={{ marginLeft: '0.5rem', backgroundColor: '#007bff', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '10px', fontSize: '0.75rem' }}>
                {Object.keys(propietariosPorcentaje).length}
              </span>
            )}
          </button>
        </div>

        {displayError && (
          <div style={{ margin: '1rem', padding: '0.75rem 1rem', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px', color: '#c33', fontSize: '0.9rem' }}>
            {displayError}
          </div>
        )}

        <div className="form-modal__body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          
          {/* ================= PESTAÑA 1: DATOS INMUEBLE ================= */}
          {activeTab === 'datos' && (
            <>
              <p className="section-title">Datos Comerciales</p>
              <div className="form-row">
                <Field label="Título Comercial *">
                  <input type="text" placeholder="ej: Piso luminoso en el centro" required value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} />
                </Field>
              </div>

              <div className="form-row">
                <Field label="Precio (€) *">
                  <input type="number" placeholder="0" required value={form.precio || ''} onChange={e => setForm({...form, precio: Number(e.target.value)})} />
                </Field>
                <Field label="Estado">
                  <select value={form.estado} onChange={e => setForm({...form, estado: e.target.value as any})}>
                    <option value="DISPONIBLE">DISPONIBLE</option>
                    <option value="VENDIDO">VENDIDO</option>
                    <option value="RESERVADO">RESERVADO</option>
                  </select>
                </Field>
                <Field label="Operación">
                  <select value={form.operacion} onChange={e => setForm({...form, operacion: e.target.value as any})}>
                    <option value="VENTA">VENTA</option>
                    <option value="ALQUILER">ALQUILER</option>
                    <option value="CUALQUIERA">CUALQUIERA</option>
                  </select>
                </Field>
                <Field label="Tipo">
                  <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value as TipoInmueble})}>
                    <option value="PISO">Piso</option>
                    <option value="CASA">Casa</option>
                    <option value="CHALET">Chalet</option>
                    <option value="ADOSADO">Adosado</option>
                    <option value="APARTAMENTO">Apartamento</option>
                  </select>
                </Field>
              </div>

              <p className="section-title">Características Técnicas</p>
              <div className="form-row">
                <Field label="M² Útiles"><input type="number" value={form.superficieUtil || ''} onChange={e => setForm({...form, superficieUtil: Number(e.target.value)})} /></Field>
                <Field label="M² Const."><input type="number" value={form.mConstruidos || ''} onChange={e => setForm({...form, mConstruidos: Number(e.target.value)})} /></Field>
                <Field label="Habitaciones"><input type="number" min={1} value={form.habitaciones || ''} onChange={e => setForm({...form, habitaciones: Number(e.target.value)})} /></Field>
                <Field label="Baños"><input type="number" min={1} value={form.banos || ''} onChange={e => setForm({...form, banos: Number(e.target.value)})} /></Field>
              </div>

              <p className="section-title">Ubicación</p>
              <Field label="Dirección *"><input type="text" required value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} /></Field>
              <div className="form-row">
                <Field label="Código Postal *"><input type="text" required value={form.codigoPostal} onChange={e => setForm({...form, codigoPostal: e.target.value})} /></Field>
                <Field label="Ciudad *"><input type="text" required value={form.ciudad} onChange={e => setForm({...form, ciudad: e.target.value})} /></Field>
              </div>
            </>
          )}

          {/* ================= PESTAÑA 2: ASIGNACIÓN DE PROPIETARIOS CON PAGINACIÓN INTERNA ================= */}
          {activeTab === 'propietarios' && (
            <>
              <p className="section-title">Selección de Propietarios / Vendedores</p>
              
              {/* 🌟 BARRA DE BÚSQUEDA DINÁMICA 🌟 */}
              <div style={{ marginBottom: '1rem' }}>
                <input 
                  type="text" 
                  placeholder="🔍 Buscar vendedor por Nombre, Apellidos o DNI..." 
                  value={filtroBusqueda}
                  onChange={handleBusquedaChange}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }}
                />
              </div>

              {cargandoVendedores ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6c757d' }}>
                  ⏳ Buscando en el servidor...
                </div>
              ) : vendedores.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#dc3545', backgroundColor: '#fff3cd', borderRadius: '6px' }}>
                  ⚠️ No se encontraron vendedores que coincidan con la búsqueda.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {vendedores.map(vendedor => {
                    const idStr = vendedor.id.toString();
                    // 🌟 CRUCIAL: El estado "estaSeleccionado" persiste aunque cambies de página en el buscador
                    const estaSeleccionado = idStr in propietariosPorcentaje;
                    
                    const nombreMostrar = vendedor.usuario 
                      ? `${vendedor.usuario.nombre} ${vendedor.usuario.apellidos || ''}` 
                      : `Vendedor ID: ${vendedor.id}`;

                    return (
                      <div 
                        key={vendedor.id} 
                        style={{ 
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
                          padding: '0.75rem', borderRadius: '6px',
                          backgroundColor: estaSeleccionado ? '#f1f7fd' : '#ffffff',
                          border: estaSeleccionado ? '1px solid #b6d4fe' : '1px solid #dee2e6'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                          <input 
                            type="checkbox" 
                            id={`vendedor-${vendedor.id}`}
                            checked={estaSeleccionado}
                            onChange={() => handleToggleVendedor(vendedor.id)}
                            style={{ cursor: 'pointer', width: 'auto' }}
                          />
                          <label htmlFor={`vendedor-${vendedor.id}`} style={{ cursor: 'pointer', fontSize: '0.95rem', flex: 1 }}>
                            <strong>{nombreMostrar}</strong> 
                          </label>
                        </div>

                        {estaSeleccionado && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', color: '#495057' }}>Participación:</span>
                            <input 
                              type="number" min={0} max={100} placeholder="0"
                              value={propietariosPorcentaje[idStr] ?? ''}
                              onChange={e => handlePorcentajeChange(vendedor.id, Number(e.target.value))}
                              style={{ width: '80px', padding: '0.3rem', textAlign: 'right' }}
                              required
                            />
                            <span style={{ fontWeight: '600' }}>%</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 🌟 BOTONES DE PAGINACIÓN DEL BUSCADOR 🌟 */}
              {totalPaginas > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <button 
                    type="button" 
                    className="btn"
                    disabled={paginaActual === 0} 
                    onClick={() => setPaginaActual(p => Math.max(0, p - 1))}
                  >
                    ◀ Anterior
                  </button>
                  <span style={{ fontSize: '0.9rem', color: '#495057' }}>
                    Página <strong>{paginaActual + 1}</strong> de {totalPaginas}
                  </span>
                  <button 
                    type="button" 
                    className="btn"
                    disabled={paginaActual >= totalPaginas - 1} 
                    onClick={() => setPaginaActual(p => p + 1)}
                  >
                    Siguiente ▶
                  </button>
                </div>
              )}

              {/* BARRA DE TOTAL ASIGNADO ACUMULADO */}
              <div style={{ backgroundColor: '#e9ecef', padding: '1rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                <span>Total asignado (Suma global):</span>
                <span style={{ color: Object.values(propietariosPorcentaje).reduce((a,b)=>a+b, 0) === 100 ? '#198754' : '#dc3545' }}>
                  {Object.values(propietariosPorcentaje).reduce((a,b) => a+b, 0)}% / 100%
                </span>
              </div>
            </>
          )}

        </div>

        <div className="form-modal__footer">
          <button type="button" onClick={onCancelar} className="btn" disabled={guardando}>Cancelar</button>
          <button type="submit" disabled={guardando} className="btn btn-primary">
            {guardando ? '⏳ Guardando...' : '+ Dar de Alta'}
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