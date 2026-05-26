import React, { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Profile.scss';

// --- TIPOS ---

type Perfil = '' | 'interesado' | 'propietario' | 'ambos';
type TipoOperacion = '' | 'VENTA' | 'ALQUILER' | 'CUALQUIERA';

interface ProfileFormData {
  nombre: string;
  apellidos: string;
  dni: string;
  telefono: string;
  email: string;
  imagenPerfilUrl: string;

  // Cambio de contraseña (opcional)
  passwordActual: string;
  nuevaPassword: string;
  confirmarPassword: string;

  // Datos de interesado
  presupuestoMaximo: string;
  habitacionesMinimas: string;
  banosMinimos: string;
  zonaInteres: string;
  tipoOperacion: TipoOperacion;
  observacionesInteresado: string;

  // Datos de propietario
  observacionesVendedor: string;
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

const INITIAL_FORM: ProfileFormData = {
  nombre: '',
  apellidos: '',
  dni: '',
  telefono: '',
  email: '',
  imagenPerfilUrl: '',
  passwordActual: '',
  nuevaPassword: '',
  confirmarPassword: '',
  presupuestoMaximo: '',
  habitacionesMinimas: '',
  banosMinimos: '',
  zonaInteres: '',
  tipoOperacion: '',
  observacionesInteresado: '',
  observacionesVendedor: '',
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
  if (!v.trim()) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
};

const roleToPerfil = (role: string): Perfil => {
  if (role === 'ROLE_INTERESADO') return 'interesado';
  if (role === 'ROLE_VENDEDOR') return 'propietario';
  if (role === 'ROLE_AMBOS') return 'ambos';
  return '';
};

const perfilToRole = (p: Perfil): string => {
  if (p === 'interesado') return 'ROLE_INTERESADO';
  if (p === 'propietario') return 'ROLE_VENDEDOR';
  if (p === 'ambos') return 'ROLE_AMBOS';
  return 'ROLE_NOROL';
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

const Profile: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);

  const [perfil, setPerfil] = useState<Perfil>('');
  const [formData, setFormData] = useState<ProfileFormData>(INITIAL_FORM);
  const [serverData, setServerData] = useState<UsuarioPerfil | null>(null);

  const esInteresado = perfil === 'interesado' || perfil === 'ambos';
  const esPropietario = perfil === 'propietario' || perfil === 'ambos';

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
        // Validar si falta información importante
        const faltaNombre = !data.nombre || data.nombre.trim() === '';
        const faltaApellidos = !data.apellidos || data.apellidos.trim() === '';
        const faltaDni = !data.dni || data.dni.trim() === '';
        const faltaTelefono = !data.telefono || data.telefono.trim() === '';
        const faltaPerfil = data.role === 'ROLE_NOROL';
        const faltaPassword = data.cambiarPasswd === true;

        if (faltaNombre || faltaApellidos || faltaDni || faltaTelefono || faltaPerfil || faltaPassword) {
            navigate('/onboarding');
            return;
        }

        setServerData(data);

        // Pre-rellenar el formulario con los datos actuales
        setPerfil(roleToPerfil(data.role));

        setFormData({
          nombre: data.nombre ?? '',
          apellidos: data.apellidos ?? '',
          dni: data.dni ?? '',
          telefono: data.telefono ?? '',
          email: data.email ?? '',
          imagenPerfilUrl: data.imagenPerfilUrl ?? '',
          passwordActual: '',
          nuevaPassword: '',
          confirmarPassword: '',
          presupuestoMaximo: data.presupuestoMaximo ?? '',
          habitacionesMinimas: data.habitacionesMinimas?.toString() ?? '',
          banosMinimos: data.banosMinimos?.toString() ?? '',
          zonaInteres: data.zonaInteres ?? '',
          tipoOperacion: (data.tipoBusqueda as TipoOperacion) ?? '',
          observacionesInteresado: data.observacionesInteresado ?? '',
          observacionesVendedor: data.observacionesVendedor ?? '',
        });
      } catch {
        setSubmitError('Error al cargar tu perfil. Inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- LIMPIAR MENSAJES AL EDITAR ---

  useEffect(() => {
    if (submitError) setSubmitError('');
    if (submitSuccess) setSubmitSuccess('');
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
        observacionesInteresado: '',
      }),
      ...(!['propietario', 'ambos'].includes(p) && {
        observacionesVendedor: '',
      }),
    }));
  };

  const handleToggleChangePassword = () => {
    setChangePasswordMode((prev) => !prev);
    setFormData((prev) => ({
      ...prev,
      passwordActual: '',
      nuevaPassword: '',
      confirmarPassword: '',
    }));
  };

  // --- VALIDACIÓN ---

  const validate = (): string | null => {
    if (!trim(formData.nombre)) return 'El nombre es obligatorio.';
    if (!trim(formData.apellidos)) return 'Los apellidos son obligatorios.';

    if (!normalizeDni(formData.dni)) return 'El DNI/NIE es obligatorio.';
    if (!validateDniNie(formData.dni)) return 'El DNI/NIE no es válido.';

    if (!normalizePhone(formData.telefono)) return 'El teléfono es obligatorio.';
    if (!validatePhone(formData.telefono)) return 'Formato de teléfono no válido (ej: 600123456).';

    if (formData.email.trim() && !validateEmail(formData.email)) {
      return 'El formato del email no es válido.';
    }

    if (changePasswordMode) {
      if (!formData.passwordActual) return 'Debes introducir tu contraseña actual.';
      if (!formData.nuevaPassword) return 'Debes establecer una nueva contraseña.';
      if (formData.nuevaPassword.length < 8) return 'La nueva contraseña debe tener al menos 8 caracteres.';
      if (formData.nuevaPassword !== formData.confirmarPassword) return 'Las contraseñas no coinciden.';
    }

    if (!perfil) return 'Debes seleccionar un perfil.';

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
    setSubmitSuccess('');

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
      perfil,
      role: perfilToRole(perfil),

      nombre: trim(formData.nombre),
      apellidos: trim(formData.apellidos),
      telefono: normalizePhone(formData.telefono),
      email: formData.email.trim() ? formData.email.trim().toLowerCase() : null,
      dni: normalizeDni(formData.dni),
      imagenPerfilUrl: emptyToNull(formData.imagenPerfilUrl),

      // Solo enviar contraseñas si está en modo cambio
      passwordActual: changePasswordMode ? formData.passwordActual : null,
      nuevaPassword: changePasswordMode ? formData.nuevaPassword : null,

      // Datos de interesado
      presupuestoMaximo: esInteresado ? toNullableNum(formData.presupuestoMaximo) : null,
      zonaInteres: esInteresado ? emptyToNull(formData.zonaInteres) : null,
      habitacionesMinimas: esInteresado ? toNullableInt(formData.habitacionesMinimas) : null,
      banosMinimos: esInteresado ? toNullableInt(formData.banosMinimos) : null,
      tipoOperacion: esInteresado ? (formData.tipoOperacion || null) : null,
      observacionesInteresado: esInteresado ? emptyToNull(formData.observacionesInteresado) : null,

      // Datos de propietario
      observacionesVendedor: esPropietario ? emptyToNull(formData.observacionesVendedor) : null,
    };

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/usuarios/${userId}`, {
        method: 'PUT',
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

      // Actualizar localStorage con los nuevos datos
      const updatedUser = {
        ...user,
        nombre: trim(formData.nombre),
        apellidos: trim(formData.apellidos),
        telefono: normalizePhone(formData.telefono),
        ...(formData.email.trim() && { email: formData.email.trim().toLowerCase() }),
        role: perfilToRole(perfil),
      };

      localStorage.setItem('usuario', JSON.stringify(updatedUser));

      setSubmitSuccess('Perfil actualizado correctamente.');
      setChangePasswordMode(false);
      setFormData((prev) => ({
        ...prev,
        passwordActual: '',
        nuevaPassword: '',
        confirmarPassword: '',
      }));

      // Recargar datos del servidor
      const refreshed = await fetch(`${API_BASE}/usuarios/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (refreshed.ok) {
        const refreshedData: UsuarioPerfil = await refreshed.json();
        setServerData(refreshedData);
      }
    } catch {
      setSubmitError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- LOGOUT ---

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    navigate('/');
  };

  // --- ELIMINAR CUENTA ---

  const handleDeleteAccount = async () => {
    const user = getStoredUser();
    if (!user?.id) return;

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/usuarios/${user.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const msg = await getApiError(res);
        setSubmitError(msg);
        setShowDeleteConfirm(false);
        return;
      }

      localStorage.removeItem('usuario');
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      navigate('/');
    } catch {
      setSubmitError('Error al eliminar la cuenta. Inténtalo de nuevo.');
      setShowDeleteConfirm(false);
    }
  };

  // --- RENDER ---

  if (loading) {
    return (
      <main data-header-transparent data-footer-hidden>
        <div className="profile-container">
          <p>Cargando tu perfil...</p>
        </div>
      </main>
    );
  }

  return (
    <main data-header-transparent data-footer-hidden className="profile-section">
      <div className="profile-section__container">

        {/* BOTÓN VOLVER (ESTILO GHOST DE TU SISTEMA) */}
        <Link to="/" className="btn--ghost">
          <i className="fas fa-arrow-left"></i> Volver
        </Link>

        {/* HEADER DE USUARIO */}
        <header className="profile-header">
          <div className="profile-header__avatar">
            <img
              src={
                serverData?.imagenPerfilUrl ||
                'https://api.dicebear.com/7.x/bottts/svg?seed=default'
              }
              alt="Avatar"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://api.dicebear.com/7.x/bottts/svg?seed=default';
              }}
            />
          </div>
          <div className="profile-header__info">
            <h1>Mi Perfil</h1>
            <p>Gestiona tu información personal y tus preferencias.</p>
          </div>
        </header>

        {/* FORMULARIO PRINCIPAL */}
        <form onSubmit={handleSubmit} className="profile-form" noValidate>

          {/* DATOS PERSONALES */}
          <fieldset className="profile-card">
            <legend>Datos de Contacto</legend>

            <div className="profile-card__row">
              <div className="profile-card__group">
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

              <div className="profile-card__group">
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
            </div>

            <div className="profile-card__row">
              <div className="profile-card__group">
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

              <div className="profile-card__group">
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
            </div>

            <div className="profile-card__row">
              <div className="profile-card__group">
                <label htmlFor="email">Email</label>
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

              <div className="profile-card__group">
                <label htmlFor="imagenPerfilUrl">URL de Avatar</label>
                <input
                  id="imagenPerfilUrl"
                  type="text"
                  name="imagenPerfilUrl"
                  value={formData.imagenPerfilUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
            </div>
          </fieldset>

          {/* CAMBIO DE CONTRASEÑA */}
          <fieldset className="profile-card">
            <legend>Seguridad</legend>

            {!changePasswordMode ? (
              <button
                type="button"
                className="btn btn--secondary"
                onClick={handleToggleChangePassword}
              >
                🔒 Cambiar contraseña
              </button>
            ) : (
              <div className="fade-in">
                <div className="profile-card__row--full">
                  <div className="profile-card__group">
                    <label htmlFor="passwordActual">Contraseña actual *</label>
                    <input
                      id="passwordActual"
                      type="password"
                      name="passwordActual"
                      value={formData.passwordActual}
                      onChange={handleChange}
                      placeholder="Tu contraseña actual"
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <div className="profile-card__row">
                  <div className="profile-card__group">
                    <label htmlFor="nuevaPassword">Nueva contraseña *</label>
                    <input
                      id="nuevaPassword"
                      type="password"
                      name="nuevaPassword"
                      minLength={8}
                      value={formData.nuevaPassword}
                      onChange={handleChange}
                      placeholder="Mínimo 8 caracteres"
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="profile-card__group">
                    <label htmlFor="confirmarPassword">Confirmar contraseña *</label>
                    <input
                      id="confirmarPassword"
                      type="password"
                      name="confirmarPassword"
                      minLength={8}
                      value={formData.confirmarPassword}
                      onChange={handleChange}
                      placeholder="Repite la nueva contraseña"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={handleToggleChangePassword}
                  style={{ marginTop: '1rem' }}
                >
                  Cancelar cambio de contraseña
                </button>
              </div>
            )}
          </fieldset>

          {/* SELECCIÓN DE PERFIL */}
          <div className="profile-card__group main-select">
            <label htmlFor="perfil">Tu perfil en la plataforma *</label>
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

          {/* CAMPOS DINÁMICOS */}
          {perfil && (
            <div className="dynamic-fields">

              {/* INTERESADO */}
              {esInteresado && (
                <fieldset className="profile-card fade-in">
                  <legend>Lo que buscas</legend>

                  <div className="profile-card__row">
                    <div className="profile-card__group">
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

                    <div className="profile-card__group">
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
                  </div>

                  <div className="profile-card__row">
                    <div className="profile-card__group">
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

                    <div className="profile-card__row" style={{ margin: 0, padding: 0 }}>
                      <div className="profile-card__group">
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

                      <div className="profile-card__group">
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
                  </div>

                  <div className="profile-card__row--full">
                    <div className="profile-card__group">
                      <label htmlFor="observacionesInteresado">Observaciones</label>
                      <textarea
                        id="observacionesInteresado"
                        name="observacionesInteresado"
                        value={formData.observacionesInteresado}
                        onChange={handleChange}
                        placeholder="Cualquier nota adicional sobre lo que buscas..."
                      />
                    </div>
                  </div>
                </fieldset>
              )}

              {/* PROPIETARIO */}
              {esPropietario && (
                <fieldset className="profile-card fade-in">
                  <legend>Tu propiedad</legend>
                  <div className="profile-card__row--full">
                    <div className="profile-card__group">
                      <label htmlFor="observacionesVendedor">Detalles de tu propiedad</label>
                      <textarea
                        id="observacionesVendedor"
                        name="observacionesVendedor"
                        value={formData.observacionesVendedor}
                        onChange={handleChange}
                        placeholder="Ej: Piso en el centro, 3 habitaciones, terraza..."
                      />
                    </div>
                  </div>
                </fieldset>
              )}
            </div>
          )}

          {/* MENSAJES DE RESPUESTA */}
          {submitError && (
            <div className="form-message form-message--error">
              <p>{submitError}</p>
            </div>
          )}

          {submitSuccess && (
            <div className="form-message form-message--success">
              <p>{submitSuccess}</p>
            </div>
          )}

          {/* BOTONES PRINCIPALES */}
          <div className="profile-card__actions">
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>

        {/* ZONA DE PELIGRO */}
        <div className="profile-card profile-danger">
          <h2>Zona de Peligro</h2>
          <div className="profile-danger__actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>

            {!showDeleteConfirm ? (
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Eliminar cuenta
              </button>
            ) : (
              <div className="delete-confirm-box">
                <p>¿Estás seguro? Esta acción no se puede deshacer.</p>
                <div className="confirm-actions">
                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    onClick={handleDeleteAccount}
                  >
                    Sí, eliminar
                  </button>
                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}

export default Profile;