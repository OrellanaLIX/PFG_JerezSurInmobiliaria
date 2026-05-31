import React, { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Onboarding.scss';

// --- TIPOS ---

type Perfil = '' | 'interesado' | 'propietario' | 'ambos';
type TipoOperacion = '' | 'VENTA' | 'ALQUILER' | 'CUALQUIERA';

interface OnboardingFormData {
  nombre: string;
  apellidos: string;
  dni: string;
  telefono: string;
  email: string;
  nuevaPassword: string;
  confirmarPassword: string;
  presupuestoMaximo: string;
  habitacionesMinimas: string;
  banosMinimos: string;
  zonaInteres: string;
  tipoOperacion: TipoOperacion;
  detallesPropiedad: string;
  comentariosExtra: string;
}

interface UsuarioPerfil {
  id: number;
  email: string | null;
  telefono: string | null;
  nombre: string | null;
  apellidos: string | null;
  dni: string | null;
  imagenPerfilUrl: string | null;
  role: string;
  cambiarPasswd: boolean;
  interesadoId: number | null;
  vendedorId: number | null;
  zonaInteres: string | null;
  presupuestoMaximo: string | null;
  habitacionesMinimas: number | null;
  banosMinimos: number | null;
  tipoBusqueda: string | null;
  observacionesInteresado: string | null;
  observacionesVendedor: string | null;
}

interface StoredUser {
  id?: number | string;
  [key: string]: unknown;
}

// --- CONSTANTES ---

const API_BASE = 'http://localhost:8080/api';

const INITIAL_FORM: OnboardingFormData = {
  nombre: '',
  apellidos: '',
  dni: '',
  telefono: '',
  email: '',
  nuevaPassword: '',
  confirmarPassword: '',
  presupuestoMaximo: '',
  habitacionesMinimas: '',
  banosMinimos: '',
  zonaInteres: '',
  tipoOperacion: '',
  detallesPropiedad: '',
  comentariosExtra: '',
};

// --- HELPERS ---

const trim = (v: string): string => v.trim();

const normalizeDni = (v: string): string =>
  v.trim().toUpperCase().replace(/\s/g, '');

const normalizePhone = (v: string): string =>
  v.trim().replace(/[\s\-()]/g, '');

const emptyToNull = (v: string): string | null => {
  const c = v.trim();
  return c === '' ? null : c;
};

const toNullableNum = (v: string): number | null => {
  const c = v.trim();
  if (c === '') return null;
  const n = Number(c);
  return Number.isNaN(n) || n < 0 ? null : n;
};

const toNullableInt = (v: string): number | null => {
  const c = v.trim();
  if (c === '') return null;
  const n = parseInt(c, 10);
  return Number.isNaN(n) || n < 0 ? null : n;
};

const validateDniNie = (raw: string): boolean => {
  const v = normalizeDni(raw);
  const L = 'TRWAGMYFPDXBNJZSQVHLCKE';

  if (/^\d{8}[A-Z]$/.test(v)) {
    return L[parseInt(v.slice(0, 8), 10) % 23] === v[8];
  }

  if (/^[XYZ]\d{7}[A-Z]$/.test(v)) {
    const m: Record<string, string> = { X: '0', Y: '1', Z: '2' };
    return L[parseInt(m[v[0]] + v.slice(1, 8), 10) % 23] === v[8];
  }

  return false;
};

const validatePhone = (raw: string): boolean => {
  const v = normalizePhone(raw);
  return /^(\+34)?[6789]\d{8}$/.test(v);
};

const validateEmail = (v: string): boolean => {
  if (!v.trim()) return true; // es opcional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
};

const getStoredUser = (): StoredUser | null => {
  const json = localStorage.getItem('usuario');
  if (!json) return null;
  try {
    return JSON.parse(json) as StoredUser;
  } catch {
    return null;
  }
};

const getToken = (): string =>
  localStorage.getItem('token') ||
  localStorage.getItem('accessToken') ||
  '';

const getApiError = async (res: Response): Promise<string> => {
  const ct = res.headers.get('content-type') || '';
  try {
    if (ct.includes('application/json')) {
      const d = await res.json();
      return d?.error || d?.message || 'Error desconocido.';
    }
    return (await res.text()) || 'Error desconocido.';
  } catch {
    return 'No se pudo leer la respuesta del servidor.';
  }
};

// --- COMPONENTE ---

const Onboarding: React.FC = () => {
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState<Perfil>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState<OnboardingFormData>(INITIAL_FORM);

  // Datos del servidor: qué campos ya tiene rellenos
  const [serverData, setServerData] = useState<UsuarioPerfil | null>(null);

  // Campos que necesitan rellenarse
  const [needsPassword, setNeedsPassword] = useState(false);
  const [needsNombre, setNeedsNombre] = useState(false);
  const [needsApellidos, setNeedsApellidos] = useState(false);
  const [needsDni, setNeedsDni] = useState(false);
  const [needsTelefono, setNeedsTelefono] = useState(false);
  const [needsEmail, setNeedsEmail] = useState(false); // email sin rellenar (opcional)
  const [needsPerfil, setNeedsPerfil] = useState(false);

  const esInteresado = perfil === 'interesado' || perfil === 'ambos';
  const esPropietario = perfil === 'propietario' || perfil === 'ambos';

  // Determina si hay algo que mostrar en el onboarding
  const needsAnything =
    needsPassword || needsNombre || needsApellidos ||
    needsDni || needsTelefono || needsPerfil || needsEmail;

  // --- CARGA INICIAL ---

  useEffect(() => {
    const loadProfile = async () => {
      const user = getStoredUser();
      if (!user?.id) {
        navigate('/acceder');
        return;
      }

      try {
        const token = getToken();
        const res = await fetch(`${API_BASE}/usuarios/${user.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
          navigate('/acceder');
          return;
        }

        const data: UsuarioPerfil = await res.json();
        setServerData(data);

        // Determinar qué campos faltan
        const faltaNombre = !data.nombre || data.nombre.trim() === '';
        const faltaApellidos = !data.apellidos || data.apellidos.trim() === '';
        const faltaDni = !data.dni || data.dni.trim() === '';
        const faltaTelefono = !data.telefono || data.telefono.trim() === '';
        const faltaEmail = !data.email || data.email.trim() === '';
        const faltaPerfil = data.role === 'ROLE_NOROL';
        const faltaPassword = data.cambiarPasswd === true;

        setNeedsNombre(faltaNombre);
        setNeedsApellidos(faltaApellidos);
        setNeedsDni(faltaDni);
        setNeedsTelefono(faltaTelefono);
        setNeedsEmail(faltaEmail);
        setNeedsPerfil(faltaPerfil);
        setNeedsPassword(faltaPassword);

        // Si no falta nada, redirigir al dashboard
        if (!faltaNombre && !faltaApellidos && !faltaDni &&
            !faltaTelefono && !faltaPerfil && !faltaPassword) {
          redirectToDashboard(data.role);
          return;
        }

        // Pre-rellenar el perfil si ya tiene rol
        if (!faltaPerfil) {
          if (data.role === 'ROLE_INTERESADO') setPerfil('interesado');
          else if (data.role === 'ROLE_VENDEDOR') setPerfil('propietario');
          else if (data.role === 'ROLE_AMBOS') setPerfil('ambos');
        }
      } catch {
        setSubmitError('Error al cargar tu perfil. Inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const redirectToDashboard = (role: string) => {
    if (role === 'ROLE_VENDEDOR') {
      navigate('/propietario');
    } else {
      navigate('/inmuebles');
    }
  };

  // --- LIMPIAR ERROR AL EDITAR ---

  useEffect(() => {
    if (submitError) setSubmitError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, perfil]);

  // --- HANDLERS ---

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePerfilChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const p = e.target.value as Perfil;
    setPerfil(p);

    setFormData((prev) => ({
      ...prev,
      ...(!['interesado', 'ambos'].includes(p) && {
        presupuestoMaximo: '',
        habitacionesMinimas: '',
        banosMinimos: '',
        zonaInteres: '',
        tipoOperacion: '' as TipoOperacion,
      }),
      ...(!['propietario', 'ambos'].includes(p) && {
        detallesPropiedad: '',
      }),
    }));
  };

  // --- VALIDACIÓN ---

  const validate = (): string | null => {
    if (needsNombre && !trim(formData.nombre)) {
      return 'El nombre es obligatorio.';
    }

    if (needsApellidos && !trim(formData.apellidos)) {
      return 'Los apellidos son obligatorios.';
    }

    if (needsDni) {
      if (!normalizeDni(formData.dni)) return 'El DNI/NIE es obligatorio.';
      if (!validateDniNie(formData.dni)) return 'El DNI/NIE no es válido.';
    }

    if (needsTelefono) {
      if (!normalizePhone(formData.telefono)) return 'El teléfono es obligatorio.';
      if (!validatePhone(formData.telefono)) return 'Formato de teléfono no válido (ej: 600123456).';
    }

    if (formData.email.trim() && !validateEmail(formData.email)) {
      return 'El formato del email no es válido.';
    }

    if (needsPassword) {
      if (!formData.nuevaPassword) return 'Debes establecer una nueva contraseña.';
      if (formData.nuevaPassword.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
      if (formData.nuevaPassword !== formData.confirmarPassword) return 'Las contraseñas no coinciden.';
    }

    if (needsPerfil && !perfil) {
      return 'Debes seleccionar qué vienes a hacer.';
    }

    if (esInteresado && !formData.tipoOperacion) {
      return 'Indica si buscas compra, alquiler o cualquiera.';
    }

    const p = formData.presupuestoMaximo.trim();
    if (p && toNullableNum(p) === null) {
      return 'El presupuesto debe ser un número positivo.';
    }

    const h = formData.habitacionesMinimas.trim();
    if (h && toNullableInt(h) === null) {
      return 'Las habitaciones deben ser un número positivo.';
    }

    const b = formData.banosMinimos.trim();
    if (b && toNullableInt(b) === null) {
      return 'Los baños deben ser un número positivo.';
    }

    return null;
  };

  // --- ENVÍO ---

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const err = validate();
    if (err) {
      setSubmitError(err);
      return;
    }

    const user = getStoredUser();
    if (!user?.id) {
      setSubmitError('Sesión no válida. Inicia sesión de nuevo.');
      return;
    }

    const userId = Number(user.id);
    if (!Number.isFinite(userId)) {
      setSubmitError('ID de usuario no válido.');
      return;
    }

    setSubmitting(true);

    const payload = {
      usuarioId: userId,
      perfil: needsPerfil ? perfil : null,

      nombre: needsNombre ? trim(formData.nombre) : null,
      apellidos: needsApellidos ? trim(formData.apellidos) : null,
      telefono: needsTelefono ? normalizePhone(formData.telefono) : null,
      email: formData.email.trim() ? formData.email.trim().toLowerCase() : null,
      dni: needsDni ? normalizeDni(formData.dni) : null,

      nuevaPassword: needsPassword ? formData.nuevaPassword : null,

      presupuestoMaximo: esInteresado ? toNullableNum(formData.presupuestoMaximo) : null,
      zonaInteres: esInteresado ? emptyToNull(formData.zonaInteres) : null,
      habitacionesMinimas: esInteresado ? toNullableInt(formData.habitacionesMinimas) : null,
      banosMinimos: esInteresado ? toNullableInt(formData.banosMinimos) : null,
      tipoOperacion: esInteresado ? (formData.tipoOperacion || null) : null,

      detallesPropiedad: esPropietario ? emptyToNull(formData.detallesPropiedad) : null,
      comentariosExtra: emptyToNull(formData.comentariosExtra),
    };

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/usuarios/completar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await getApiError(res);
        setSubmitError(msg);
        return;
      }

      // Determinar nuevo rol
      let nuevoRol: string;
      if (needsPerfil) {
        if (perfil === 'ambos') nuevoRol = 'ROLE_AMBOS';
        else if (perfil === 'interesado') nuevoRol = 'ROLE_INTERESADO';
        else nuevoRol = 'ROLE_VENDEDOR';
      } else {
        nuevoRol = serverData?.role || 'ROLE_NOROL';
      }

      // Actualizar localStorage
      const updatedUser = {
        ...user,
        ...(needsNombre && { nombre: trim(formData.nombre) }),
        ...(needsApellidos && { apellidos: trim(formData.apellidos) }),
        ...(needsTelefono && { telefono: normalizePhone(formData.telefono) }),
        ...(formData.email.trim() && { email: formData.email.trim().toLowerCase() }),
        role: nuevoRol,
        onboardingCompletado: true,
      };

      localStorage.setItem('usuario', JSON.stringify(updatedUser));
      redirectToDashboard(nuevoRol);
    } catch {
      setSubmitError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      'Hola, me gustaría concertar una cita en persona para dar de alta mi perfil en JerezSur Inmobiliaria.'
    );
    window.open(`https://wa.me/34600000000?text=${msg}`, '_blank');
  };

  // --- RENDER ---

  if (loading) {
    return (
      <main data-header-transparent data-footer-hidden>
        <div className="onboarding-container">
          <p>Cargando tu perfil...</p>
        </div>
      </main>
    );
  }

  if (!needsAnything) {
    return null; // Se redirige en el useEffect
  }

  return (
    <main data-header-transparent data-footer-hidden>
      <Link to="/" className="btn--ghost">
        <i className="fas fa-arrow-left"></i> Volver
      </Link>

      <div className="onboarding-container">
        <header className="onboarding-header">
          <h2>¡Bienvenido a JerezSur!</h2>
          <p>Completa tu perfil para que podamos ayudarte mejor.</p>
        </header>

        <form onSubmit={handleSubmit} className="onboarding-form" noValidate>

          {/* CAMBIO DE CONTRASEÑA */}
          {needsPassword && (
            <fieldset className="fade-in">
              <legend>Establece tu contraseña</legend>
              <p>Por seguridad, debes establecer una nueva contraseña.</p>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nuevaPassword">Nueva contraseña *</label>
                  <input
                    id="nuevaPassword"
                    type="password"
                    name="nuevaPassword"
                    required
                    minLength={8}
                    value={formData.nuevaPassword}
                    onChange={handleChange}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmarPassword">Confirmar contraseña *</label>
                  <input
                    id="confirmarPassword"
                    type="password"
                    name="confirmarPassword"
                    required
                    minLength={8}
                    value={formData.confirmarPassword}
                    onChange={handleChange}
                    placeholder="Repite la contraseña"
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </fieldset>
          )}

          {/* DATOS PERSONALES: solo campos que faltan */}
          {(needsNombre || needsApellidos || needsDni || needsTelefono || needsEmail) && (
            <fieldset>
              <legend>Tus Datos de Contacto</legend>

              {(needsNombre || needsApellidos) && (
                <div className="form-row">
                  {needsNombre && (
                    <div className="form-group">
                      <label htmlFor="nombre">Nombre *</label>
                      <input
                        id="nombre"
                        type="text"
                        name="nombre"
                        required
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Tu nombre"
                        autoComplete="given-name"
                      />
                    </div>
                  )}

                  {needsApellidos && (
                    <div className="form-group">
                      <label htmlFor="apellidos">Apellidos *</label>
                      <input
                        id="apellidos"
                        type="text"
                        name="apellidos"
                        required
                        value={formData.apellidos}
                        onChange={handleChange}
                        placeholder="Tus apellidos"
                        autoComplete="family-name"
                      />
                    </div>
                  )}
                </div>
              )}

              {(needsDni || needsTelefono) && (
                <div className="form-row">
                  {needsDni && (
                    <div className="form-group">
                      <label htmlFor="dni">DNI / NIE *</label>
                      <input
                        id="dni"
                        type="text"
                        name="dni"
                        required
                        maxLength={9}
                        value={formData.dni}
                        onChange={handleChange}
                        placeholder="12345678X"
                        autoComplete="off"
                      />
                    </div>
                  )}

                  {needsTelefono && (
                    <div className="form-group">
                      <label htmlFor="telefono">Teléfono *</label>
                      <input
                        id="telefono"
                        type="tel"
                        name="telefono"
                        required
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="600 000 000"
                        autoComplete="tel"
                      />
                    </div>
                  )}
                </div>
              )}

              {needsEmail && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email (opcional)</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="tu@email.com"
                      autoComplete="email"
                    />
                  </div>
                </div>
              )}
            </fieldset>
          )}

          {/* SELECCIÓN DE PERFIL */}
          {needsPerfil && (
            <div className="form-group main-select">
              <label htmlFor="perfil">¿Qué vienes a hacer hoy? *</label>
              <select
                id="perfil"
                value={perfil}
                onChange={handlePerfilChange}
                required
              >
                <option value="">Selecciona una opción...</option>
                <option value="interesado">Busco comprar o alquilar</option>
                <option value="propietario">Quiero poner mi casa en el mercado</option>
                <option value="ambos">Ambas cosas</option>
              </select>
            </div>
          )}

          {/* ERROR */}
          {submitError && (
            <div className="form-group">
              <p>{submitError}</p>
            </div>
          )}

          {/* CAMPOS DINÁMICOS DE PERFIL */}
          {(needsPerfil ? perfil : true) && (
            <div className="dynamic-fields">

              {/* INTERESADO */}
              {esInteresado && needsPerfil && (
                <fieldset className="fade-in">
                  <legend>Lo que buscas</legend>

                  <div className="form-group">
                    <label htmlFor="tipoOperacion">Tipo de operación *</label>
                    <select
                      id="tipoOperacion"
                      name="tipoOperacion"
                      value={formData.tipoOperacion}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecciona una opción...</option>
                      <option value="VENTA">Compra</option>
                      <option value="ALQUILER">Alquiler</option>
                      <option value="CUALQUIERA">Compra o alquiler</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="presupuestoMaximo">Presupuesto Máximo (€)</label>
                    <input
                      id="presupuestoMaximo"
                      type="number"
                      name="presupuestoMaximo"
                      min="0"
                      step="0.01"
                      value={formData.presupuestoMaximo}
                      onChange={handleChange}
                      placeholder="Ej: 200000"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="zonaInteres">Zona de interés</label>
                    <input
                      id="zonaInteres"
                      type="text"
                      name="zonaInteres"
                      value={formData.zonaInteres}
                      onChange={handleChange}
                      placeholder="Ej: Chapín, Centro, El Puerto..."
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="habitacionesMinimas">Habitaciones mín.</label>
                      <input
                        id="habitacionesMinimas"
                        type="number"
                        name="habitacionesMinimas"
                        min="0"
                        value={formData.habitacionesMinimas}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="banosMinimos">Baños mín.</label>
                      <input
                        id="banosMinimos"
                        type="number"
                        name="banosMinimos"
                        min="0"
                        value={formData.banosMinimos}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </fieldset>
              )}

              {/* PROPIETARIO */}
              {esPropietario && needsPerfil && (
                <fieldset className="fade-in">
                  <legend>Tu propiedad</legend>
                  <div className="form-group">
                    <label htmlFor="detallesPropiedad">Cuéntanos un poco sobre el inmueble</label>
                    <textarea
                      id="detallesPropiedad"
                      name="detallesPropiedad"
                      value={formData.detallesPropiedad}
                      onChange={handleChange}
                      placeholder="Ej: Piso en el centro, 3 habitaciones, terraza..."
                    />
                  </div>
                </fieldset>
              )}

              {/* COMENTARIOS */}
              {needsPerfil && perfil && (
                <div className="form-group">
                  <label htmlFor="comentariosExtra">¿Alguna nota adicional?</label>
                  <textarea
                    id="comentariosExtra"
                    name="comentariosExtra"
                    value={formData.comentariosExtra}
                    onChange={handleChange}
                    placeholder="Cualquier otra cosa que debamos saber..."
                  />
                </div>
              )}

              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? 'Procesando...' : 'Finalizar y empezar'}
              </button>
            </div>
          )}
        </form>

        <div className="onboarding-footer">
          <p>¿Prefieres que lo hagamos por ti?</p>
          <button onClick={handleWhatsApp} className="btn-whatsapp" type="button">
            <span>💬</span> Concertar cita presencial
          </button>
        </div>
      </div>
    </main>
  );
};

export default Onboarding;