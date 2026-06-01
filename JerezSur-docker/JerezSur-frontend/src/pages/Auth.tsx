// src/pages/Auth.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegistroForm';
import SocialAuth from '../components/auth/SocialAuth';
import logo from '../assets/imgs/Mono.png';

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
  const navigate = useNavigate();

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
        // Propietarios van a su gestión de inmuebles
        navigate('/propietario');
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
    try {
      const response = await fetch(`/api/usuarios/auth/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const userData: UserData = await response.json();
        redirectByUserRole(userData); // Aplicamos la nueva lógica
      } else {
        const errorMsg = await response.text();
        console.error(`Error en backend (${provider}):`, errorMsg);
        alert("No se pudo completar la autenticación social.");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Error de red.");
    }
  };

  const handleLoginSuccess = (): void => {
    const userDataJson = localStorage.getItem('usuario');
    if (!userDataJson) {
      console.error('Usuario no encontrado en localStorage al iniciar sesión.');
      return;
    }

    const userData: UserData = JSON.parse(userDataJson);
    console.log('Sesión iniciada:', userData);
    redirectByUserRole(userData);
  };

  const handleRegisterSuccess = (): void => {
    alert('Registro completado. Ahora puedes iniciar sesión con tus credenciales.');
    setAuthMode('login');
  };

  return (
    <main className="auth" data-header-transparent data-footer-hidden>
      <Link to="/" className='btn btn--ghost' >
        <i className="fas fa-arrow-left"></i> Volver
      </Link>

      <div className="auth__container">

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