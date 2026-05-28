import { useState } from 'react';
import type { UsuarioDetalle, Role, TrabajadorPerfil, InteresadoPerfil, VendedorPerfil } from '../../../types/usuario';
import '../../../styles/App.scss';

type Seccion = 'datos' | 'perfiles' | 'acceso';

interface Props {
  usuario: UsuarioDetalle;
  loading: boolean;
  onCerrar: () => void;
  onActualizar: (id: number, data: Partial<UsuarioDetalle>) => Promise<void>;
  onEliminar: (id: number) => Promise<void>;
}

export const DetalleUsuarioModal = ({ usuario, loading, onCerrar, onActualizar, onEliminar }: Props) => {
  const [seccion, setSeccion] = useState<Seccion>('datos');
  const [guardando, setGuardando] = useState(false);

  // Estado local de edición
  const [datosBase, setDatosBase] = useState<Partial<UsuarioDetalle>>({
    nombre: usuario.nombre, apellidos: usuario.apellidos,
    email: usuario.email, telefono: usuario.telefono,
    dni: usuario.dni, origen: usuario.origen,
  });
  const [acceso, setAcceso] = useState({ role: usuario.role, cuentaActivada: usuario.cuentaActivada, cambiarPasswd: usuario.cambiarPasswd });

  // Sub-perfiles — se editan localmente y se envían al guardar
  const [trabajador, setTrabajador] = useState<Partial<TrabajadorPerfil>>(usuario.trabajador ?? {});
  const [interesado, setInteresado] = useState<Partial<InteresadoPerfil>>(usuario.interesado ?? {});
  const [vendedor, setVendedor] = useState<Partial<VendedorPerfil>>(usuario.vendedor ?? {});

  const [perfilesAbiertos, setPerfilesAbiertos] = useState<Record<string, boolean>>({
    trabajador: !!usuario.trabajador, interesado: false, vendedor: false,
  });

  if (loading) return (
    <div className="form-modal show">
      <div className="form-modal__content">
        <p className="text-soft">Cargando...</p>
      </div>
    </div>
  );

  const togglePerfil = (key: string) =>
    setPerfilesAbiertos(p => ({ ...p, [key]: !p[key] }));

  const guardarDatosBase = async () => {
    setGuardando(true);
    try { await onActualizar(usuario.id, datosBase); }
    finally { setGuardando(false); }
  };

  const guardarAcceso = async () => {
    setGuardando(true);
    try { await onActualizar(usuario.id, acceso); }
    finally { setGuardando(false); }
  };

  const guardarPerfil = async (tipo: 'trabajador' | 'interesado' | 'vendedor') => {
    const payloads = { trabajador: trabajador, interesado: interesado, vendedor: vendedor };
    const update: Partial<UsuarioDetalle> = { [tipo]: payloads[tipo] };
    setGuardando(true);
    try { await onActualizar(usuario.id, update); }
    finally { setGuardando(false); }
  };

  const desvincularPerfil = async (tipo: 'trabajador' | 'interesado' | 'vendedor') => {
    if (!confirm(`¿Desvincular el perfil de ${tipo}? El usuario mantendrá su cuenta.`)) return;
    const update: Partial<UsuarioDetalle> = {};
    if (tipo === 'trabajador') update.trabajadorId = undefined;
    if (tipo === 'interesado') update.interesadoId = undefined;
    if (tipo === 'vendedor') update.vendedorId = undefined;
    await onActualizar(usuario.id, update);
  };

  return (
    <div className="form-modal show">
      <div className="form-modal__content">

        {/* Header */}
        <div className="modal-header">
            <h2 className="modal-title">{usuario.nombre} {usuario.apellidos}</h2>
            <div className="modal-badges">
              <Badge text={usuario.role} color="blue" />
              {usuario.cuentaActivada
                ? <Badge text="Activa" color="green" />
                : <Badge text="Inactiva" color="gray" />}
            </div>
        </div>

        {/* Nav por secciones */}
        <div className="tabs" role="tablist">
          {(['datos', 'perfiles', 'acceso'] as Seccion[]).map(s => (
            <button key={s} onClick={() => setSeccion(s)} className={`tab ${seccion === s ? 'active' : ''}`}>
              {{ datos: 'Datos básicos', perfiles: 'Perfiles asociados', acceso: 'Acceso y rol' }[s]}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="form-modal__body">

          {/* ── Datos básicos ── */}
          {seccion === 'datos' && (
            <>
              <div className="form-row">
                <Field label="Nombre"><input value={datosBase.nombre ?? ''} onChange={e => setDatosBase(p => ({ ...p, nombre: e.target.value }))} /></Field>
                <Field label="Apellidos"><input value={datosBase.apellidos ?? ''} onChange={e => setDatosBase(p => ({ ...p, apellidos: e.target.value }))} /></Field>
              </div>
              <div className="form-row">
                <Field label="Email"><input type="email" value={datosBase.email ?? ''} onChange={e => setDatosBase(p => ({ ...p, email: e.target.value }))} /></Field>
                <Field label="Teléfono"><input value={datosBase.telefono ?? ''} onChange={e => setDatosBase(p => ({ ...p, telefono: e.target.value }))} /></Field>
              </div>
              <div className="form-row">
                <Field label="DNI"><input value={datosBase.dni ?? ''} onChange={e => setDatosBase(p => ({ ...p, dni: e.target.value }))} /></Field>
                <Field label="Origen">
                  <select value={datosBase.origen} onChange={e => setDatosBase(p => ({ ...p, origen: e.target.value as any }))}>
                    <option value="AUTOREGISTRO">Autoregistro</option>
                    <option value="OAUTH">OAuth (Social)</option>
                    <option value="CRM_TRABAJADOR">CRM Trabajador</option>
                    <option value="WEB_CITA">Web Cita</option>
                    <option value="WEB_VENTA">Web Venta</option>
                  </select>
                </Field>
              </div>
              <div className="form-actions">
                <button onClick={guardarDatosBase} disabled={guardando} className="btn btn-primary">
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </>
          )}

          {/* ── Perfiles asociados ── */}
          {seccion === 'perfiles' && (
            <>
              <PerfilBlock
                titulo="Trabajador" icon="💼"
                asignado={!!usuario.trabajadorId || !!usuario.trabajador}
                abierto={perfilesAbiertos.trabajador}
                onToggle={() => togglePerfil('trabajador')}
                onDesasignar={() => desvincularPerfil('trabajador')}
                onGuardar={() => guardarPerfil('trabajador')}
                guardando={guardando}
              >
                <div className="form-row">
                  <Field label="Cargo"><input value={trabajador.cargo ?? ''} onChange={e => setTrabajador(p => ({ ...p, cargo: e.target.value }))} /></Field>
                  <Field label="DNI corporativo"><input value={trabajador.dni ?? ''} onChange={e => setTrabajador(p => ({ ...p, dni: e.target.value }))} /></Field>
                </div>
                <div className="form-row">
                  <Field label="Fecha inicio">
                    <input type="date" value={trabajador.fechaInicioContrato ?? ''} onChange={e => setTrabajador(p => ({ ...p, fechaInicioContrato: e.target.value }))} />
                  </Field>
                  <Field label="Fecha fin">
                    <input type="date" value={trabajador.fechaFinContrato ?? ''} onChange={e => setTrabajador(p => ({ ...p, fechaFinContrato: e.target.value }))} />
                  </Field>
                </div>
                <Field label="Activo">
                  <select value={trabajador.activo ? 'si' : 'no'} onChange={e => setTrabajador(p => ({ ...p, activo: e.target.value === 'si' }))}>
                    <option value="si">Sí</option><option value="no">No</option>
                  </select>
                </Field>
                <Field label="Observaciones laborales">
                  <textarea value={trabajador.observacionesLaborales ?? ''} onChange={e => setTrabajador(p => ({ ...p, observacionesLaborales: e.target.value }))} className="textarea-large" />
                </Field>
              </PerfilBlock>

              <PerfilBlock
                titulo="Interesado" icon="🔍"
                asignado={!!usuario.interesadoId || !!usuario.interesado}
                abierto={perfilesAbiertos.interesado}
                onToggle={() => togglePerfil('interesado')}
                onDesasignar={() => desvincularPerfil('interesado')}
                onGuardar={() => guardarPerfil('interesado')}
                guardando={guardando}
              >
                {(!usuario.interesadoId && !usuario.interesado) && (
                  <div className="info-box">
                    Este usuario no tiene perfil de interesado. Al guardar se creará el registro.
                  </div>
                )}
                <div className="form-row">
                  <Field label="Presupuesto máximo (€)"><input type="number" value={interesado.presupuestoMaximo ?? ''} onChange={e => setInteresado(p => ({ ...p, presupuestoMaximo: Number(e.target.value) }))} /></Field>
                  <Field label="Zona de interés"><input value={interesado.zonaInteres ?? ''} onChange={e => setInteresado(p => ({ ...p, zonaInteres: e.target.value }))} /></Field>
                </div>
                <div className="form-row">
                  <Field label="Habitaciones mín."><input type="number" min={0} value={interesado.habitacionesMinimas ?? ''} onChange={e => setInteresado(p => ({ ...p, habitacionesMinimas: Number(e.target.value) }))} /></Field>
                  <Field label="Baños mín."><input type="number" min={0} value={interesado.banosMinimos ?? ''} onChange={e => setInteresado(p => ({ ...p, banosMinimos: Number(e.target.value) }))} /></Field>
                </div>
                <div className="form-row">
                  <Field label="Tipo búsqueda">
                    <select value={interesado.tipoBusqueda ?? 'VENTA'} onChange={e => setInteresado(p => ({ ...p, tipoBusqueda: e.target.value as any }))}>
                      <option value="VENTA">Venta</option><option value="ALQUILER">Alquiler</option><option value="CUALQUIERA">Cualquiera</option>
                    </select>
                  </Field>
                  <Field label="Requiere hipoteca">
                    <select value={interesado.requiereHipoteca ? 'si' : 'no'} onChange={e => setInteresado(p => ({ ...p, requiereHipoteca: e.target.value === 'si' }))}>
                      <option value="no">No</option><option value="si">Sí</option>
                    </select>
                  </Field>
                </div>
                <Field label="Observaciones">
                  <textarea value={interesado.observaciones ?? ''} onChange={e => setInteresado(p => ({ ...p, observaciones: e.target.value }))} className="textarea-large" />
                </Field>
              </PerfilBlock>

              <PerfilBlock
                titulo="Vendedor" icon="🏠"
                asignado={!!usuario.vendedorId || !!usuario.vendedor}
                abierto={perfilesAbiertos.vendedor}
                onToggle={() => togglePerfil('vendedor')}
                onDesasignar={() => desvincularPerfil('vendedor')}
                onGuardar={() => guardarPerfil('vendedor')}
                guardando={guardando}
              >
                {(!usuario.vendedorId && !usuario.vendedor) && (
                  <div className="info-box">
                    Este usuario no tiene perfil de vendedor. Al guardar se creará el registro.
                  </div>
                )}
                <Field label="Observaciones">
                  <textarea value={vendedor.observaciones ?? ''} onChange={e => setVendedor({ observaciones: e.target.value })} className="textarea-large" />
                </Field>
              </PerfilBlock>
            </>
          )}

          {/* ── Acceso y rol ── */}
          {seccion === 'acceso' && (
            <>
              <Field label="Rol de sistema">
                <select value={acceso.role} onChange={e => setAcceso(p => ({ ...p, role: e.target.value as Role }))}>
                  <option value="ROLE_NOROL">Sin rol</option>
                  <option value="ROLE_TRABAJADOR">Trabajador</option>
                  <option value="ROLE_INTERESADO">Interesado</option>
                  <option value="ROLE_VENDEDOR">Vendedor</option>
                  <option value="ROLE_AMBOS">Ambos</option>
                  <option value="ROLE_ADMIN">Admin</option>
                </select>
              </Field>
              <div className="form-row">
                <Field label="Cuenta activada">
                  <select value={acceso.cuentaActivada ? 'si' : 'no'} onChange={e => setAcceso(p => ({ ...p, cuentaActivada: e.target.value === 'si' }))}>
                    <option value="si">Sí</option><option value="no">No</option>
                  </select>
                </Field>
                <Field label="Forzar cambio de contraseña">
                  <select value={acceso.cambiarPasswd ? 'si' : 'no'} onChange={e => setAcceso(p => ({ ...p, cambiarPasswd: e.target.value === 'si' }))}>
                    <option value="no">No</option><option value="si">Sí</option>
                  </select>
                </Field>
              </div>
              <div className="alert alert-warning">
                ⚠️ Cambiar el rol no crea ni elimina los sub-perfiles. Usa la pestaña "Perfiles asociados" para gestionar los registros en las tablas trabajador, interesado y vendedor.
              </div>
              <div className="form-actions">
                <button onClick={guardarAcceso} disabled={guardando} className="btn btn-primary">
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={async () => { if (confirm('¿Eliminar este usuario permanentemente?')) { await onEliminar(usuario.id); onCerrar(); } }} className="btn btn-danger">
            🗑 Eliminar usuario
          </button>
          <button onClick={onCerrar} className="btn btn-ghost">Cerrar</button>
        </div>
      </div>
    </div>
  )
};

// --- Componente reutilizable de bloque de perfil ---
interface PerfilBlockProps {
  titulo: string; icon: string; asignado: boolean;
  abierto: boolean; onToggle: () => void;
  onDesasignar: () => void; onGuardar: () => void;
  guardando: boolean; children: React.ReactNode;
}

const PerfilBlock = ({ titulo, icon, asignado, abierto, onToggle, onDesasignar, onGuardar, guardando, children }: PerfilBlockProps) => (
  <div className="perfil-block">
    <div onClick={onToggle} className="perfil-header">
      <span className="perfil-header__title">
        {icon} {titulo}
        <Badge text={asignado ? 'Asignado' : 'No asignado'} color={asignado ? 'blue' : 'gray'} />
      </span>
      <span className={`perfil-toggle ${abierto ? 'open' : ''}`}>▾</span>
    </div>
    {abierto && (
      <div className="perfil-body">
        {children}
        <div className="perfil-actions">
          {asignado
            ? <span onClick={onDesasignar} className="perfil-desasignar">Desvincular perfil</span>
            : <span />}
          <button onClick={onGuardar} disabled={guardando} className="btn btn-primary btn-sm">
            {guardando ? 'Guardando...' : asignado ? 'Guardar cambios' : `Crear perfil ${titulo.toLowerCase()}`}
          </button>
        </div>
      </div>
    )}
  </div>
);

const Badge = ({ text, color }: { text: string; color: 'blue' | 'green' | 'amber' | 'gray' }) => {
  const colors = {
    blue: { background: '#E6F1FB', color: '#185FA5' },
    green: { background: '#EAF3DE', color: '#3B6D11' },
    amber: { background: '#FAEEDA', color: '#854F0B' },
    gray: { background: '#F1EFE8', color: '#5F5E5A' },
  };
  return <span className={`badge badge--${color}`}>{text}</span>;
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="form-field">
    <label className="form-field__label">{label}</label>
    {children}
  </div>
);