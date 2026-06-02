// Página de recuperación de contraseña: primer paso pide el email,
// segundo paso (llegando desde el enlace del email) permite establecer la nueva contraseña.
import React, { useState, useEffect, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const API_BASE = '/api';

const RecuperarPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // ── Modo "solicitar email" vs modo "nueva contraseña con token" ──
  const [email, setEmail] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');

  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => document.body.classList.remove('auth-page');
  }, []);

  // ── Enviar solicitud de recuperación ──────────────────────────────
  const handleSolicitar = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Introduce tu email.'); return; }
    setLoading(true); setError(''); setMensaje('');
    try {
      const res = await fetch(`${API_BASE}/auth/solicitar-recuperacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje(data.message);
        setExito(true);
      } else {
        setError(data.error || 'Error al enviar el correo.');
      }
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // ── Resetear contraseña con token ─────────────────────────────────
  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    if (nuevaPassword.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; }
    if (nuevaPassword !== confirmar) { setError('Las contraseñas no coinciden.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, nuevaPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje(data.message);
        setExito(true);
      } else {
        setError(data.error || 'El enlace no es válido o ha expirado.');
      }
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth" data-header-transparent data-footer-hidden>
      <Link to="/acceder" className="btn btn--ghost">← Volver al inicio</Link>

      <div className="auth__container">
        <div className="auth__card">
          <div className="auth__tabs">
            <div className="auth__tab auth__tab--active" style={{ cursor: 'default' }}>
              {token ? 'Nueva contraseña' : 'Recuperar contraseña'}
            </div>
          </div>

          <div className="auth__content">
            {exito ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#2e9b4d', marginBottom: '1.5rem' }}>{mensaje}</p>
                <Link to="/acceder" className="btn btn--primary btn--full">
                  Ir al inicio de sesión
                </Link>
              </div>
            ) : token ? (
              // ── Formulario nueva contraseña ──
              <form className="auth-form" onSubmit={handleReset} noValidate>
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                  Escribe tu nueva contraseña.
                </p>
                <div className="auth-form__group">
                  <label htmlFor="nuevaPassword">Nueva contraseña *</label>
                  <input
                    id="nuevaPassword"
                    type="password"
                    value={nuevaPassword}
                    onChange={e => { setNuevaPassword(e.target.value); setError(''); }}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div className="auth-form__group">
                  <label htmlFor="confirmar">Confirmar contraseña *</label>
                  <input
                    id="confirmar"
                    type="password"
                    value={confirmar}
                    onChange={e => { setConfirmar(e.target.value); setError(''); }}
                    placeholder="Repite la contraseña"
                    autoComplete="new-password"
                    required
                  />
                </div>
                {error && (
                  <div className="auth-form__error">
                    <span>{error}</span>
                  </div>
                )}
                <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
                </button>
              </form>
            ) : (
              // ── Formulario solicitar email ──
              <form className="auth-form" onSubmit={handleSolicitar} noValidate>
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                  Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
                </p>
                <div className="auth-form__group">
                  <label htmlFor="email">Email *</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="tu@email.com"
                    autoComplete="email"
                    required
                  />
                </div>
                {error && (
                  <div className="auth-form__error">
                    <span>{error}</span>
                  </div>
                )}
                <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </button>
                <p className="auth-form__footer">
                  ¿Recuerdas tu contraseña?{' '}
                  <Link to="/acceder" className="auth-form__link">Inicia sesión</Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default RecuperarPassword;
