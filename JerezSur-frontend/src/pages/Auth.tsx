// src/pages/Auth.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm'; // Ajusta la ruta según tu carpeta
import RegisterForm from '../components/auth/RegistroForm';
import SocialAuth from '../components/auth/SocialAuth';
import logo from '../assets/imgs/Mono.png';

// Definimos interfaces para los datos que esperamos
interface UserData {
  id: number;
  nombre: string;
  email: string;
  role: 'ROLE_ADMIN' | 'ROLE_TRABAJADOR' | 'ROLE_INTERESADO' | 'ROLE_VENDEDOR' | 'ROLE_CLIENTE';
  provider?: string;
  // Añade aquí más campos según tu entidad Usuario de Java
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

  /**
   * Manejador para el Login Social
   * @param provider 'google' | 'facebook' | 'apple'
   * @param token El token recibido del SDK del lado del cliente
   */
  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple', token: string): Promise<void> => {
    try {
      const response = await fetch(`http://localhost:8080/api/usuarios/auth/${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const userData: UserData = await response.json();
        handleLoginSuccess(userData);
      } else {
        const errorMsg = await response.text();
        console.error(`Error en backend (${provider}):`, errorMsg);
        alert("No se pudo completar la autenticación social.");
      }
    } catch (error) {
      console.error("Error de conexión con el servidor:", error);
      alert("Error de red al intentar conectar con el servidor.");
    }
  };

  const handleLoginSuccess = (userData: UserData): void => {
    console.log('Sesión iniciada:', userData);
    
    // 1. Aquí deberías llamar a tu método de Contexto/Redux para guardar al usuario
    // authContext.setUser(userData); 

    // 2. Lógica de redirección profesional
    if (userData.role === 'ROLE_CLIENTE') {
      navigate('/seleccion-perfil');
    } else {
      // Si ya tiene un rol de negocio (Vendedor/Interesado), va a su home
      navigate('/home');
    }
  };

  const handleRegisterSuccess = (userData: UserData): void => {
    console.log('Cuenta creada:', userData);
    // Tras registro local, forzamos selección de perfil
    navigate('/seleccion-perfil');
  };

  return (
    <main className="auth" data-header-transparent data-footer-hidden>
      <div className="auth__container">
        
        {/* LOGO con retorno a inicio */}
        <div className="auth__logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src={logo} alt="JerezSur Inmobiliaria" />
        </div>

        <div className="auth__card">
          {/* TABS DE NAVEGACIÓN INTERNA */}
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

        {/* COMPONENTE DE BOTONES SOCIALES */}
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