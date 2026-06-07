// src/pages/Auth.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegistroForm';
import SocialAuth from '../components/auth/SocialAuth';
import logo from '../assets/imgs/Mono.webp';

// 1. Actualizamos la interfaz con los roles correctos
interface UserData {
  id: number;
  nombre: string;
  email: string;
  role: 'ROLE_ADMIN' | 'ROLE_TRABAJADOR' | 'ROLE_NOROL' | 'ROLE_INTERESADO' | 'ROLE_VENDEDOR' | 'ROLE_AMBOS';
  provider?: string;
  token?: string;
  userId?: number;
}

type AuthMode = 'login' | 'register';

const Auth: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [socialError, setSocialError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const verificado = searchParams.get('verificado');
  const toast = useToast();

  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  // 2. Función centralizada de redirección profesional
  const redirectByUserRole = (userData: UserData) => {
    // Compatibilidad entre LoginResponseDTO (userId) y el formato del frontend (id)
    const normalizedUser = { ...userData, id: userData.id || userData.userId };

    // Guardamos en LocalStorage para que el resto de la app sepa quién ha entrado
    localStorage.setItem('usuario', JSON.stringify(normalizedUser));
    
    // GUARDAR EL TOKEN DE SEGURIDAD
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }

    switch (normalizedUser.role) {
      case 'ROLE_NOROL':
        // Si es nuevo, directos al onboarding que creamos antes
        navigate('/onboarding');
        break;

      case 'ROLE_INTERESADO':
      case 'ROLE_AMBOS':
        // Interesados o perfiles mixtos van a ver casas
        navigate('/inmuebles');
        break;

      case 'ROLE_VENDEDOR':
        // Propietarios van a la página de propietarios
        navigate('/propietarios');
        break;

      case 'ROLE_ADMIN':
      case 'ROLE_TRABAJADOR':
        navigate('/admin/dashboard');
        break;

      default:
        navigate('/');
        break;
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple', token: string): Promise<void> => {
    setSocialError('');
    try {
      const response = await fetch(`/api/usuarios/auth/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const userData: UserData = await response.json();
        redirectByUserRole(userData);
      } else {
        const data = await response.json().catch(() => ({}));
        setSocialError(data?.error || 'No se pudo completar la autenticación. Inténtalo de nuevo.');
      }
    } catch {
      setSocialError('Error de conexión. Comprueba tu red e inténtalo de nuevo.');
    }
  };

  const handleLoginSuccess = (): void => {
    const userDataJson = localStorage.getItem('usuario');
    if (!userDataJson) {
      toast.error('No se pudo recuperar la sesión. Inicia sesión de nuevo.');
      return;
    }
    const userData: UserData = JSON.parse(userDataJson);
    redirectByUserRole(userData);
  };

  const handleRegisterSuccess = (): void => {
    toast.success('¡Cuenta creada! Revisa tu email para activarla e inicia sesión.');
    setAuthMode('login');
  };

  return (
    <main className="auth" data-header-transparent data-footer-hidden>
      <div className="auth__container">

        {verificado === 'ok' && (
          <div style={{
            background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '8px',
            padding: '0.875rem 1.25rem', color: '#065f46', fontWeight: 600,
            textAlign: 'center', fontSize: '0.95rem'
          }}>
            ✅ Tu cuenta ha sido verificada correctamente. Ya puedes iniciar sesión.
          </div>
        )}
        {verificado === 'error' && (
          <div style={{
            background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px',
            padding: '0.875rem 1.25rem', color: '#991b1b', fontWeight: 600,
            textAlign: 'center', fontSize: '0.95rem'
          }}>
            ❌ El enlace de verificación no es válido o ya fue usado.
          </div>
        )}

        {/* Enlace discreto de vuelta al inicio — encima del logo, bien integrado */}
        <Link
          to="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', fontWeight: 500,
            textDecoration: 'none', alignSelf: 'flex-start',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'white')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
        >
          ← Inicio
        </Link>

        <div className="auth__logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src={logo} alt="JerezSur Inmobiliaria" />
        </div>

        <div className="auth__card">
          <div className="auth__tabs">
            <button
              type="button"
              className={`auth__tab ${authMode === 'login' ? 'auth__tab--active' : ''}`}
              onClick={() => setAuthMode('login')}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              className={`auth__tab ${authMode === 'register' ? 'auth__tab--active' : ''}`}
              onClick={() => setAuthMode('register')}
            >
              Crear cuenta
            </button>
          </div>

          <div className="auth__content">
            {authMode === 'login' ? (
              <LoginForm
                onLoginSuccess={handleLoginSuccess}
                onSwitchToRegister={() => setAuthMode('register')}
              />
            ) : (
              <RegisterForm
                onRegisterSuccess={handleRegisterSuccess}
                onSwitchToLogin={() => setAuthMode('login')}
              />
            )}
          </div>
        </div>

        {socialError && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px',
            padding: '0.75rem 1.25rem', color: '#7f1d1d', fontSize: '0.88rem',
            fontWeight: 500, textAlign: 'center',
          }}>
            ✕ {socialError}
          </div>
        )}

        <SocialAuth onSocialLogin={handleSocialLogin} />

        <div className="auth__legal">
          <p>
            Al continuar, aceptas nuestros{' '}
            <a href="/terminos">Términos</a> y{' '}
            <a href="/privacidad">Privacidad</a>.
          </p>
        </div>
      </div>
    </main>
  );
};

export default Auth;