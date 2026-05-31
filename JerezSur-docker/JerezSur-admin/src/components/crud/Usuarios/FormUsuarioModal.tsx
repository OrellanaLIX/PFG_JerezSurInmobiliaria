import { useState } from 'react';
import { toast } from 'react-toastify'; // Importamos toast para validaciones locales
import { useFormSubmit } from '../../../hooks/useFormSubmit'; // Importamos tu nuevo hook
import type { NuevoUsuario } from '../../../types/usuario';
import '../../../styles/App.scss';

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
  
  // Usamos nuestro hook genérico aquí
  const { guardando, ejecutarEnvio } = useFormSubmit<NuevoUsuarioConPerfil>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones del Frontend convertidas a avisos estéticos
    if (!form.nombre) return toast.warning('El nombre es obligatorio');
    if (rol === 'trabajador' && !datosTrabajador.dni)
      return toast.warning('El DNI es obligatorio para trabajadores');
    if (rol === 'trabajador' && !datosTrabajador.fechaInicioContrato)
      return toast.warning('La fecha de inicio de contrato es obligatoria');

    const payload: NuevoUsuarioConPerfil = {
      ...form,
      rol,
      datosTrabajador: ['trabajador'].includes(rol) ? datosTrabajador : undefined,
      datosInteresado: ['interesado', 'ambos'].includes(rol) ? datosInteresado : undefined,
      datosVendedor: ['vendedor', 'ambos'].includes(rol) ? datosVendedor : undefined,
    };

    // Toda la lógica pesada, los catch de Spring Boot y el onCancelar() ocurren aquí de forma automática
    await ejecutarEnvio({
      submitFn: onCrear,
      onSuccess: onCancelar, // Al terminar con éxito cerrará la ventana
      successMessage: '¡Usuario registrado con éxito!'
    }, payload);
  };

  const f = (field: keyof NuevoUsuario) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="form-modal show">
      <form onSubmit={handleSubmit} className="form-modal__content">
        <div className="form-modal__header">
          <h2>Registrar nuevo usuario</h2>
          <button type="button" onClick={onCancelar} className="btn">✕</button>
        </div>

        <div className="form-modal__body">
          <p className="section-title">Datos básicos</p>
          <div className="form-row">
            <div className="form-group"><label>Nombre *</label><input required value={form.nombre} onChange={f('nombre')} placeholder="Ej: Carlos" /></div>
            <div className="form-group"><label>Apellidos</label><input value={form.apellidos ?? ''} onChange={f('apellidos')} placeholder="Ej: López Ruiz" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Email</label><input type="email" value={form.email ?? ''} onChange={f('email')} placeholder="email@ejemplo.com" /></div>
            <div className="form-group"><label>Teléfono</label><input type="tel" value={form.telefono ?? ''} onChange={f('telefono')} placeholder="+34 600 000 000" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>DNI</label><input value={form.dni ?? ''} onChange={f('dni')} placeholder="12345678A" /></div>
            <div className="form-group"><label>Contraseña temporal</label><input type="password" value={form.password ?? ''} onChange={f('password')} placeholder="Mínimo 8 caracteres" /></div>
          </div>

          <p className="section-title">Asignar perfil (opcional)</p>
          <div className="role-grid">
            {ROLES.map(r => (
              <label key={r.value} className={`role-card ${rol === r.value ? 'active' : ''}`}>
                <input type="radio" name="rol" value={r.value} checked={rol === r.value}
                  onChange={() => setRol(r.value)} />
                <span className="role-name">{r.icon} {r.label}</span>
                <span className="role-desc">{r.desc}</span>
              </label>
            ))}
          </div>
          {rol !== 'ninguno' && (
            <button type="button" onClick={() => setRol('ninguno')} className="btn btn-ghost">
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

        <div className="form-modal__footer">
          <button type="button" onClick={onCancelar} className="btn">Cancelar</button>
          <button type="submit" disabled={guardando} className="btn btn-primary">
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
      <p className="section-title">Datos de trabajador</p>
      <div className="form-row">
        <Field label="Cargo"><input value={datos.cargo} onChange={u('cargo')} placeholder="Ej: Agente comercial" /></Field>
        <Field label="DNI corporativo *"><input required value={datos.dni} onChange={u('dni')} placeholder="12345678A" /></Field>
      </div>
      <div className="form-row">
        <Field label="Fecha inicio contrato *"><input required type="date" value={datos.fechaInicioContrato} onChange={u('fechaInicioContrato')} /></Field>
        <Field label="Fecha fin (opcional)"><input type="date" value={datos.fechaFinContrato ?? ''} onChange={u('fechaFinContrato')} /></Field>
      </div>
      <Field label="Observaciones laborales">
        <textarea className="textarea-large" value={datos.observacionesLaborales ?? ''} onChange={u('observacionesLaborales')} placeholder="Notas internas..." />
      </Field>
    </>
  );
};

const CamposInteresado = ({ datos, onChange }: { datos: DatosInteresado; onChange: (d: DatosInteresado) => void }) => {
  const u = (field: keyof DatosInteresado) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    onChange({ ...datos, [field]: e.target.type === 'number' ? Number(e.target.value) : e.target.value });
  return (
    <>
      <p className="section-title">Preferencias de búsqueda (interesado)</p>
      <div className="form-row">
        <Field label="Presupuesto máximo (€)"><input type="number" value={datos.presupuestoMaximo ?? ''} onChange={u('presupuestoMaximo')} placeholder="200000" /></Field>
        <Field label="Zona de interés"><input value={datos.zonaInteres ?? ''} onChange={u('zonaInteres')} placeholder="Ej: Centro, Nervión..." /></Field>
      </div>
      <div className="form-row">
        <Field label="Habitaciones mínimas"><input type="number" min={0} value={datos.habitacionesMinimas ?? ''} onChange={u('habitacionesMinimas')} placeholder="2" /></Field>
        <Field label="Baños mínimos"><input type="number" min={0} value={datos.banosMinimos ?? ''} onChange={u('banosMinimos')} placeholder="1" /></Field>
      </div>
      <div className="form-row">
        <Field label="Tipo búsqueda">
          <select value={datos.tipoBusqueda} onChange={u('tipoBusqueda')}>
            <option value="VENTA">Venta</option>
            <option value="ALQUILER">Alquiler</option>
            <option value="CUALQUIERA">Cualquiera</option>
          </select>
        </Field>
        <Field label="Requiere hipoteca">
          <select value={datos.requiereHipoteca ? 'si' : 'no'}
            onChange={e => onChange({ ...datos, requiereHipoteca: e.target.value === 'si' })}>
            <option value="no">No</option>
            <option value="si">Sí</option>
          </select>
        </Field>
      </div>
      <Field label="Observaciones">
        <textarea className="textarea-large" value={datos.observaciones ?? ''} onChange={u('observaciones')} placeholder="Notas sobre sus preferencias..." />
      </Field>
    </>
  );
};

const CamposVendedor = ({ datos, onChange }: { datos: DatosVendedor; onChange: (d: DatosVendedor) => void }) => (
  <>
    <p className="section-title">Datos de vendedor</p>
    <Field label="Observaciones">
      <textarea className="textarea-large" value={datos.observaciones ?? ''} onChange={e => onChange({ observaciones: e.target.value })}
        placeholder="Notas sobre sus propiedades o condiciones..." />
    </Field>
  </>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="form-group">
    <label>{label}</label>
    {children}
  </div>
);