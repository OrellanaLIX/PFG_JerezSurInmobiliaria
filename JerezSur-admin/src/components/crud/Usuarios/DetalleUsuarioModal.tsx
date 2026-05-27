import { useState } from 'react';
import type { UsuarioDetalle, Role, Usuario, TrabajadorPerfil, InteresadoPerfil, VendedorPerfil } from '../../../types/usuario';

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
    <div style={styles.backdrop}>
      <div style={styles.modal}><p style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Cargando...</p></div>
    </div>
  );

  const initiales = `${usuario.nombre?.[0] ?? ''}${usuario.apellidos?.[0] ?? ''}`.toUpperCase();

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
    <div style={styles.backdrop}>
      <div style={styles.modal}>

        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={styles.avatar}>{initiales}</div>
            <div>
              <h2 style={styles.title}>{usuario.nombre} {usuario.apellidos}</h2>
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                <Badge text={usuario.role} color="blue" />
                {usuario.cuentaActivada
                  ? <Badge text="Activa" color="green" />
                  : <Badge text="Inactiva" color="gray" />}
              </div>
            </div>
          </div>
          <button onClick={onCerrar} style={styles.btnIcon}>✕</button>
        </div>

        {/* Nav por secciones */}
        <div style={{ padding: '12px 24px 0', display: 'flex', gap: '4px', borderBottom: '1px solid #f0f0f0' }}>
          {(['datos', 'perfiles', 'acceso'] as Seccion[]).map(s => (
            <button key={s} onClick={() => setSeccion(s)}
              style={{ ...styles.tab, ...(seccion === s ? styles.tabActive : {}) }}>
              {{ datos: 'Datos básicos', perfiles: 'Perfiles asociados', acceso: 'Acceso y rol' }[s]}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={styles.body}>

          {/* ── Datos básicos ── */}
          {seccion === 'datos' && (
            <>
              <div style={styles.row2}>
                <Field label="Nombre"><input value={datosBase.nombre ?? ''} onChange={e => setDatosBase(p => ({ ...p, nombre: e.target.value }))} style={styles.input} /></Field>
                <Field label="Apellidos"><input value={datosBase.apellidos ?? ''} onChange={e => setDatosBase(p => ({ ...p, apellidos: e.target.value }))} style={styles.input} /></Field>
              </div>
              <div style={styles.row2}>
                <Field label="Email"><input type="email" value={datosBase.email ?? ''} onChange={e => setDatosBase(p => ({ ...p, email: e.target.value }))} style={styles.input} /></Field>
                <Field label="Teléfono"><input value={datosBase.telefono ?? ''} onChange={e => setDatosBase(p => ({ ...p, telefono: e.target.value }))} style={styles.input} /></Field>
              </div>
              <div style={styles.row2}>
                <Field label="DNI"><input value={datosBase.dni ?? ''} onChange={e => setDatosBase(p => ({ ...p, dni: e.target.value }))} style={styles.input} /></Field>
                <Field label="Origen">
                  <select value={datosBase.origen} onChange={e => setDatosBase(p => ({ ...p, origen: e.target.value as any }))} style={styles.input}>
                    <option value="AUTOREGISTRO">Autoregistro</option>
                    <option value="OAUTH">OAuth (Social)</option>
                    <option value="CRM_TRABAJADOR">CRM Trabajador</option>
                    <option value="WEB_CITA">Web Cita</option>
                    <option value="WEB_VENTA">Web Venta</option>
                  </select>
                </Field>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button onClick={guardarDatosBase} disabled={guardando} style={styles.btnPrimary}>
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
                <div style={styles.row2}>
                  <Field label="Cargo"><input value={trabajador.cargo ?? ''} onChange={e => setTrabajador(p => ({ ...p, cargo: e.target.value }))} style={styles.input} /></Field>
                  <Field label="DNI corporativo"><input value={trabajador.dni ?? ''} onChange={e => setTrabajador(p => ({ ...p, dni: e.target.value }))} style={styles.input} /></Field>
                </div>
                <div style={styles.row2}>
                  <Field label="Fecha inicio">
                    <input type="date" value={trabajador.fechaInicioContrato ?? ''} onChange={e => setTrabajador(p => ({ ...p, fechaInicioContrato: e.target.value }))} style={styles.input} />
                  </Field>
                  <Field label="Fecha fin">
                    <input type="date" value={trabajador.fechaFinContrato ?? ''} onChange={e => setTrabajador(p => ({ ...p, fechaFinContrato: e.target.value }))} style={styles.input} />
                  </Field>
                </div>
                <Field label="Activo">
                  <select value={trabajador.activo ? 'si' : 'no'} onChange={e => setTrabajador(p => ({ ...p, activo: e.target.value === 'si' }))} style={styles.input}>
                    <option value="si">Sí</option><option value="no">No</option>
                  </select>
                </Field>
                <Field label="Observaciones laborales">
                  <textarea value={trabajador.observacionesLaborales ?? ''} onChange={e => setTrabajador(p => ({ ...p, observacionesLaborales: e.target.value }))} style={{ ...styles.input, minHeight: '70px', resize: 'vertical' }} />
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
                  <div style={styles.infoBox}>
                    Este usuario no tiene perfil de interesado. Al guardar se creará el registro.
                  </div>
                )}
                <div style={styles.row2}>
                  <Field label="Presupuesto máximo (€)"><input type="number" value={interesado.presupuestoMaximo ?? ''} onChange={e => setInteresado(p => ({ ...p, presupuestoMaximo: Number(e.target.value) }))} style={styles.input} /></Field>
                  <Field label="Zona de interés"><input value={interesado.zonaInteres ?? ''} onChange={e => setInteresado(p => ({ ...p, zonaInteres: e.target.value }))} style={styles.input} /></Field>
                </div>
                <div style={styles.row2}>
                  <Field label="Habitaciones mín."><input type="number" min={0} value={interesado.habitacionesMinimas ?? ''} onChange={e => setInteresado(p => ({ ...p, habitacionesMinimas: Number(e.target.value) }))} style={styles.input} /></Field>
                  <Field label="Baños mín."><input type="number" min={0} value={interesado.banosMinimos ?? ''} onChange={e => setInteresado(p => ({ ...p, banosMinimos: Number(e.target.value) }))} style={styles.input} /></Field>
                </div>
                <div style={styles.row2}>
                  <Field label="Tipo búsqueda">
                    <select value={interesado.tipoBusqueda ?? 'VENTA'} onChange={e => setInteresado(p => ({ ...p, tipoBusqueda: e.target.value as any }))} style={styles.input}>
                      <option value="VENTA">Venta</option><option value="ALQUILER">Alquiler</option><option value="CUALQUIERA">Cualquiera</option>
                    </select>
                  </Field>
                  <Field label="Requiere hipoteca">
                    <select value={interesado.requiereHipoteca ? 'si' : 'no'} onChange={e => setInteresado(p => ({ ...p, requiereHipoteca: e.target.value === 'si' }))} style={styles.input}>
                      <option value="no">No</option><option value="si">Sí</option>
                    </select>
                  </Field>
                </div>
                <Field label="Observaciones">
                  <textarea value={interesado.observaciones ?? ''} onChange={e => setInteresado(p => ({ ...p, observaciones: e.target.value }))} style={{ ...styles.input, minHeight: '60px', resize: 'vertical' }} />
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
                  <div style={styles.infoBox}>
                    Este usuario no tiene perfil de vendedor. Al guardar se creará el registro.
                  </div>
                )}
                <Field label="Observaciones">
                  <textarea value={vendedor.observaciones ?? ''} onChange={e => setVendedor({ observaciones: e.target.value })} style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }} />
                </Field>
              </PerfilBlock>
            </>
          )}

          {/* ── Acceso y rol ── */}
          {seccion === 'acceso' && (
            <>
              <Field label="Rol de sistema">
                <select value={acceso.role} onChange={e => setAcceso(p => ({ ...p, role: e.target.value as Role }))} style={styles.input}>
                  <option value="ROLE_NOROL">Sin rol</option>
                  <option value="ROLE_TRABAJADOR">Trabajador</option>
                  <option value="ROLE_INTERESADO">Interesado</option>
                  <option value="ROLE_VENDEDOR">Vendedor</option>
                  <option value="ROLE_AMBOS">Ambos</option>
                  <option value="ROLE_ADMIN">Admin</option>
                </select>
              </Field>
              <div style={styles.row2}>
                <Field label="Cuenta activada">
                  <select value={acceso.cuentaActivada ? 'si' : 'no'} onChange={e => setAcceso(p => ({ ...p, cuentaActivada: e.target.value === 'si' }))} style={styles.input}>
                    <option value="si">Sí</option><option value="no">No</option>
                  </select>
                </Field>
                <Field label="Forzar cambio de contraseña">
                  <select value={acceso.cambiarPasswd ? 'si' : 'no'} onChange={e => setAcceso(p => ({ ...p, cambiarPasswd: e.target.value === 'si' }))} style={styles.input}>
                    <option value="no">No</option><option value="si">Sí</option>
                  </select>
                </Field>
              </div>
              <div style={{ background: '#FAEEDA', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#854F0B', marginTop: '8px' }}>
                ⚠️ Cambiar el rol no crea ni elimina los sub-perfiles. Usa la pestaña "Perfiles asociados" para gestionar los registros en las tablas trabajador, interesado y vendedor.
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button onClick={guardarAcceso} disabled={guardando} style={styles.btnPrimary}>
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button onClick={async () => { if (confirm('¿Eliminar este usuario permanentemente?')) { await onEliminar(usuario.id); onCerrar(); } }} style={styles.btnDanger}>
            🗑 Eliminar usuario
          </button>
          <button onClick={onCerrar} style={styles.btn}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

// --- Componente reutilizable de bloque de perfil ---
interface PerfilBlockProps {
  titulo: string; icon: string; asignado: boolean;
  abierto: boolean; onToggle: () => void;
  onDesasignar: () => void; onGuardar: () => void;
  guardando: boolean; children: React.ReactNode;
}

const PerfilBlock = ({ titulo, icon, asignado, abierto, onToggle, onDesasignar, onGuardar, guardando, children }: PerfilBlockProps) => (
  <div style={styles.perfilBlock}>
    <div onClick={onToggle} style={styles.perfilHeader}>
      <span style={{ fontWeight: 500, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon} {titulo}
        <Badge text={asignado ? 'Asignado' : 'No asignado'} color={asignado ? 'blue' : 'gray'} />
      </span>
      <span style={{ fontSize: '12px', color: '#999', transform: abierto ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block', transition: 'transform 0.15s' }}>▾</span>
    </div>
    {abierto && (
      <div style={styles.perfilBody}>
        {children}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          {asignado
            ? <span onClick={onDesasignar} style={{ fontSize: '12px', color: '#A32D2D', cursor: 'pointer', textDecoration: 'underline' }}>Desvincular perfil</span>
            : <span />}
          <button onClick={onGuardar} disabled={guardando} style={styles.btnPrimarySmall}>
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
  return <span style={{ ...colors[color], padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500 }}>{text}</span>;
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '12px' }}>
    <label style={styles.label}>{label}</label>
    {children}
  </div>
);

const styles: Record<string, React.CSSProperties> = {
  backdrop: { background: 'rgba(0,0,0,0.4)', position: 'fixed', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: '12px', width: '560px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' },
  header: { padding: '20px 24px 16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '15px', fontWeight: 600, margin: 0 },
  body: { padding: '20px 24px', overflowY: 'auto', flex: 1 },
  footer: { padding: '16px 24px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  tab: { padding: '8px 14px', fontSize: '13px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#888', borderBottom: '2px solid transparent', marginBottom: '-1px' },
  tabActive: { color: '#111', borderBottomColor: '#111', fontWeight: 500 },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', background: '#E6F1FB', color: '#185FA5', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  label: { display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: 500 },
  input: { width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const },
  perfilBlock: { border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' },
  perfilHeader: { padding: '12px 16px', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' },
  perfilBody: { padding: '16px', borderTop: '1px solid #eee' },
  infoBox: { background: '#f8f8f8', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#888', marginBottom: '14px' },
  btn: { padding: '8px 18px', borderRadius: '8px', border: '1px solid #e0e0e0', background: '#fff', cursor: 'pointer', fontSize: '13px' },
  btnPrimary: { padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#111', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 500 },
  btnPrimarySmall: { padding: '6px 14px', borderRadius: '8px', border: 'none', background: '#111', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 500 },
  btnDanger: { padding: '8px 14px', borderRadius: '8px', border: '1px solid #F7C1C1', background: '#FCEBEB', color: '#A32D2D', cursor: 'pointer', fontSize: '13px' },
  btnIcon: { background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#666', padding: '4px' },
};