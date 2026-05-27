import { useState } from 'react';
import type { NuevoUsuario } from '../../../types/usuario';

type RolPerfil = 'ninguno' | 'trabajador' | 'interesado' | 'vendedor' | 'ambos';

interface DatosTrabajador {
  dni: string;
  cargo: string;
  fechaInicioContrato: string;
  fechaFinContrato?: string;
  observacionesLaborales?: string;
}

interface DatosInteresado {
  presupuestoMaximo?: number;
  zonaInteres?: string;
  habitacionesMinimas?: number;
  banosMinimos?: number;
  tipoBusqueda?: 'VENTA' | 'ALQUILER' | 'CUALQUIERA';
  requiereHipoteca?: boolean;
  observaciones?: string;
}

interface DatosVendedor {
  observaciones?: string;
}

export interface NuevoUsuarioConPerfil extends NuevoUsuario {
  rol: RolPerfil;
  datosTrabajador?: DatosTrabajador;
  datosInteresado?: DatosInteresado;
  datosVendedor?: DatosVendedor;
}

interface Props {
  onCrear: (usuario: NuevoUsuarioConPerfil) => Promise<void>;
  onCancelar: () => void;
}

const ROLES: { value: RolPerfil; label: string; desc: string; icon: string }[] = [
  { value: 'trabajador', label: 'Trabajador', desc: 'Empleado de la inmobiliaria', icon: '💼' },
  { value: 'interesado', label: 'Interesado', desc: 'Busca comprar o alquilar', icon: '🔍' },
  { value: 'vendedor', label: 'Vendedor', desc: 'Propietario que vende/alquila', icon: '🏠' },
  { value: 'ambos', label: 'Ambos', desc: 'Interesado y vendedor', icon: '👥' },
];

export const FormUsuarioModal = ({ onCrear, onCancelar }: Props) => {
  const [form, setForm] = useState<NuevoUsuario>({
    nombre: '', apellidos: '', email: '', telefono: '', password: '', dni: '',
  });
  const [rol, setRol] = useState<RolPerfil>('ninguno');
  const [datosTrabajador, setDatosTrabajador] = useState<DatosTrabajador>({
    dni: '', cargo: '', fechaInicioContrato: '',
  });
  const [datosInteresado, setDatosInteresado] = useState<DatosInteresado>({
    tipoBusqueda: 'VENTA', requiereHipoteca: false,
  });
  const [datosVendedor, setDatosVendedor] = useState<DatosVendedor>({});
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre) return alert('El nombre es obligatorio');
    if (rol === 'trabajador' && !datosTrabajador.dni)
      return alert('El DNI es obligatorio para trabajadores');
    if (rol === 'trabajador' && !datosTrabajador.fechaInicioContrato)
      return alert('La fecha de inicio de contrato es obligatoria');

    setGuardando(true);
    try {
      await onCrear({
        ...form,
        rol,
        datosTrabajador: ['trabajador'].includes(rol) ? datosTrabajador : undefined,
        datosInteresado: ['interesado', 'ambos'].includes(rol) ? datosInteresado : undefined,
        datosVendedor: ['vendedor', 'ambos'].includes(rol) ? datosVendedor : undefined,
      });
      onCancelar();
    } finally {
      setGuardando(false);
    }
  };

  const f = (field: keyof NuevoUsuario) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div style={styles.backdrop}>
      <form onSubmit={handleSubmit} style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Registrar nuevo usuario</h2>
          <button type="button" onClick={onCancelar} style={styles.btnIcon}>✕</button>
        </div>

        <div style={styles.body}>
          <p style={styles.sectionTitle}>Datos básicos</p>
          <div style={styles.row2}>
            <Field label="Nombre *"><input required value={form.nombre} onChange={f('nombre')} placeholder="Ej: Carlos" style={styles.input} /></Field>
            <Field label="Apellidos"><input value={form.apellidos ?? ''} onChange={f('apellidos')} placeholder="Ej: López Ruiz" style={styles.input} /></Field>
          </div>
          <div style={styles.row2}>
            <Field label="Email"><input type="email" value={form.email ?? ''} onChange={f('email')} placeholder="email@ejemplo.com" style={styles.input} /></Field>
            <Field label="Teléfono"><input type="tel" value={form.telefono ?? ''} onChange={f('telefono')} placeholder="+34 600 000 000" style={styles.input} /></Field>
          </div>
          <div style={styles.row2}>
            <Field label="DNI"><input value={form.dni ?? ''} onChange={f('dni')} placeholder="12345678A" style={styles.input} /></Field>
            <Field label="Contraseña temporal"><input type="password" value={form.password ?? ''} onChange={f('password')} placeholder="Mínimo 8 caracteres" style={styles.input} /></Field>
          </div>

          <p style={styles.sectionTitle}>Asignar perfil (opcional)</p>
          <div style={styles.roleGrid}>
            {ROLES.map(r => (
              <label key={r.value} style={{ ...styles.roleCard, ...(rol === r.value ? styles.roleCardActive : {}) }}>
                <input type="radio" name="rol" value={r.value} checked={rol === r.value}
                  onChange={() => setRol(r.value)} style={{ display: 'none' }} />
                <span style={styles.roleName}>{r.icon} {r.label}</span>
                <span style={styles.roleDesc}>{r.desc}</span>
              </label>
            ))}
          </div>
          {rol !== 'ninguno' && (
            <button type="button" onClick={() => setRol('ninguno')} style={styles.clearRol}>
              Quitar perfil asignado ×
            </button>
          )}

          {(rol === 'trabajador') && (
            <CamposTrabajador datos={datosTrabajador} onChange={setDatosTrabajador} />
          )}
          {(rol === 'interesado' || rol === 'ambos') && (
            <CamposInteresado datos={datosInteresado} onChange={setDatosInteresado} />
          )}
          {(rol === 'vendedor' || rol === 'ambos') && (
            <CamposVendedor datos={datosVendedor} onChange={setDatosVendedor} />
          )}
        </div>

        <div style={styles.footer}>
          <button type="button" onClick={onCancelar} style={styles.btn}>Cancelar</button>
          <button type="submit" disabled={guardando} style={styles.btnPrimary}>
            {guardando ? 'Guardando...' : '+ Guardar usuario'}
          </button>
        </div>
      </form>
    </div>
  );
};

// --- Sub-formularios de perfil ---

const CamposTrabajador = ({ datos, onChange }: { datos: DatosTrabajador; onChange: (d: DatosTrabajador) => void }) => {
  const u = (field: keyof DatosTrabajador) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange({ ...datos, [field]: e.target.value });
  return (
    <>
      <p style={styles.sectionTitle}>Datos de trabajador</p>
      <div style={styles.row2}>
        <Field label="Cargo"><input value={datos.cargo} onChange={u('cargo')} placeholder="Ej: Agente comercial" style={styles.input} /></Field>
        <Field label="DNI corporativo *"><input required value={datos.dni} onChange={u('dni')} placeholder="12345678A" style={styles.input} /></Field>
      </div>
      <div style={styles.row2}>
        <Field label="Fecha inicio contrato *"><input required type="date" value={datos.fechaInicioContrato} onChange={u('fechaInicioContrato')} style={styles.input} /></Field>
        <Field label="Fecha fin (opcional)"><input type="date" value={datos.fechaFinContrato ?? ''} onChange={u('fechaFinContrato')} style={styles.input} /></Field>
      </div>
      <Field label="Observaciones laborales">
        <textarea value={datos.observacionesLaborales ?? ''} onChange={u('observacionesLaborales')} placeholder="Notas internas..." style={{ ...styles.input, minHeight: '70px', resize: 'vertical' }} />
      </Field>
    </>
  );
};

const CamposInteresado = ({ datos, onChange }: { datos: DatosInteresado; onChange: (d: DatosInteresado) => void }) => {
  const u = (field: keyof DatosInteresado) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    onChange({ ...datos, [field]: e.target.type === 'number' ? Number(e.target.value) : e.target.value });
  return (
    <>
      <p style={styles.sectionTitle}>Preferencias de búsqueda (interesado)</p>
      <div style={styles.row2}>
        <Field label="Presupuesto máximo (€)"><input type="number" value={datos.presupuestoMaximo ?? ''} onChange={u('presupuestoMaximo')} placeholder="200000" style={styles.input} /></Field>
        <Field label="Zona de interés"><input value={datos.zonaInteres ?? ''} onChange={u('zonaInteres')} placeholder="Ej: Centro, Nervión..." style={styles.input} /></Field>
      </div>
      <div style={styles.row2}>
        <Field label="Habitaciones mínimas"><input type="number" min={0} value={datos.habitacionesMinimas ?? ''} onChange={u('habitacionesMinimas')} placeholder="2" style={styles.input} /></Field>
        <Field label="Baños mínimos"><input type="number" min={0} value={datos.banosMinimos ?? ''} onChange={u('banosMinimos')} placeholder="1" style={styles.input} /></Field>
      </div>
      <div style={styles.row2}>
        <Field label="Tipo búsqueda">
          <select value={datos.tipoBusqueda} onChange={u('tipoBusqueda')} style={styles.input}>
            <option value="VENTA">Venta</option>
            <option value="ALQUILER">Alquiler</option>
            <option value="CUALQUIERA">Cualquiera</option>
          </select>
        </Field>
        <Field label="Requiere hipoteca">
          <select value={datos.requiereHipoteca ? 'si' : 'no'}
            onChange={e => onChange({ ...datos, requiereHipoteca: e.target.value === 'si' })}
            style={styles.input}>
            <option value="no">No</option>
            <option value="si">Sí</option>
          </select>
        </Field>
      </div>
      <Field label="Observaciones">
        <textarea value={datos.observaciones ?? ''} onChange={u('observaciones')} placeholder="Notas sobre sus preferencias..." style={{ ...styles.input, minHeight: '70px', resize: 'vertical' }} />
      </Field>
    </>
  );
};

const CamposVendedor = ({ datos, onChange }: { datos: DatosVendedor; onChange: (d: DatosVendedor) => void }) => (
  <>
    <p style={styles.sectionTitle}>Datos de vendedor</p>
    <Field label="Observaciones">
      <textarea value={datos.observaciones ?? ''} onChange={e => onChange({ observaciones: e.target.value })}
        placeholder="Notas sobre sus propiedades o condiciones..." style={{ ...styles.input, minHeight: '70px', resize: 'vertical' }} />
    </Field>
  </>
);

// --- Helpers de UI ---
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '12px' }}>
    <label style={styles.label}>{label}</label>
    {children}
  </div>
);

const styles: Record<string, React.CSSProperties> = {
  backdrop: { background: 'rgba(0,0,0,0.4)', position: 'fixed', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: '12px', width: '540px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' },
  header: { padding: '20px 24px 16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '16px', fontWeight: 600, margin: 0 },
  body: { padding: '20px 24px', overflowY: 'auto', flex: 1 },
  footer: { padding: '16px 24px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between' },
  sectionTitle: { fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  label: { display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: 500 },
  input: { width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const },
  roleGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' },
  roleCard: { border: '1px solid #e0e0e0', borderRadius: '8px', padding: '10px 12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '3px', transition: 'all 0.12s' },
  roleCardActive: { border: '2px solid #185FA5', background: '#E6F1FB' },
  roleName: { fontSize: '13px', fontWeight: 500 },
  roleDesc: { fontSize: '11px', color: '#888' },
  clearRol: { background: 'none', border: 'none', fontSize: '12px', color: '#999', cursor: 'pointer', marginBottom: '8px', padding: 0 },
  btn: { padding: '8px 18px', borderRadius: '8px', border: '1px solid #e0e0e0', background: '#fff', cursor: 'pointer', fontSize: '13px' },
  btnPrimary: { padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#111', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 500 },
  btnIcon: { background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#666', padding: '4px' },
};