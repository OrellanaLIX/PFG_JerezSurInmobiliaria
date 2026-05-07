import { useState } from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import RegistroForm from '../components/auth/RegistroForm';
import '../styles/Vender.scss';

type AuthMode = 'login' | 'register';

const Vender = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const handleLoginSuccess = () => {
    console.log('Login exitoso - redirigir a dashboard');
    // navigate('/propietarios/dashboard');
  };

  const handleRegistroSuccess = () => {
    console.log('Registro exitoso - mostrar mensaje');
  };

  return (
    <main className="propietarios">
      {/* HERO */}
      <section className="hero propietarios-hero">
        <div className="hero__content">
          <h1>Gestiona tus inmuebles con nosotros</h1>
          <p>Accede a tu área privada para gestionar tus propiedades, consultar estadísticas y estar al día de todo el proceso de venta.</p>
        </div>
      </section>

      {/* CONTENIDO PRINCIPAL */}
      <section className="section propietarios-content">
        <div className="propietarios-container">
          {/* COLUMNA IZQUIERDA - INFO */}
          <div className="propietarios-info">
            <div className="propietarios-info__content">
              <h2>¿Por qué ser propietario con JerezSur?</h2>
              
              <div className="propietarios-info__features">
                <div className="propietarios-info__feature">
                  <div className="propietarios-info__icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3>Gestión profesional</h3>
                    <p>Nos encargamos de todo el proceso de venta con total transparencia.</p>
                  </div>
                </div>

                <div className="propietarios-info__feature">
                  <div className="propietarios-info__icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <div>
                    <h3>Acceso 24/7</h3>
                    <p>Consulta el estado de tu inmueble cuando quieras desde tu panel.</p>
                  </div>
                </div>

                <div className="propietarios-info__feature">
                  <div className="propietarios-info__icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                  </div>
                  <div>
                    <h3>Mejor precio</h3>
                    <p>Tasación profesional y estrategia de venta para maximizar el valor.</p>
                  </div>
                </div>

                <div className="propietarios-info__feature">
                  <div className="propietarios-info__icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3>Estadísticas en tiempo real</h3>
                    <p>Visualizaciones, interesados y toda la información actualizada.</p>
                  </div>
                </div>
              </div>

              <div className="propietarios-info__stats">
                <div className="propietarios-info__stat">
                  <div className="propietarios-info__stat-number">+200</div>
                  <p>Propietarios confían en nosotros</p>
                </div>
                <div className="propietarios-info__stat">
                  <div className="propietarios-info__stat-number">30 días</div>
                  <p>Tiempo medio de venta</p>
                </div>
                <div className="propietarios-info__stat">
                  <div className="propietarios-info__stat-number">98%</div>
                  <p>Satisfacción garantizada</p>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA - LOGIN/REGISTRO */}
          <div className="propietarios-auth">
            <div className="propietarios-auth__tabs">
              <button
                className={`propietarios-auth__tab ${authMode === 'login' ? 'propietarios-auth__tab--active' : ''}`}
                onClick={() => setAuthMode('login')}
              >
                Iniciar sesión
              </button>
              <button
                className={`propietarios-auth__tab ${authMode === 'register' ? 'propietarios-auth__tab--active' : ''}`}
                onClick={() => setAuthMode('register')}
              >
                Solicitar acceso
              </button>
            </div>

            <div className="propietarios-auth__content">
              {authMode === 'login' ? (
                <LoginForm 
                  onSwitchToRegister={() => setAuthMode('register')}
                  onLoginSuccess={handleLoginSuccess}
                />
              ) : (
                <RegistroForm 
                  onSwitchToLogin={() => setAuthMode('login')}
                  onRegisterSuccess={handleRegistroSuccess}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* AYUDA / CONTACTO */}
      <section className="section section--alt propietarios-ayuda">
        <div className="propietarios-ayuda__content">
          <div className="propietarios-ayuda__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div className="propietarios-ayuda__text">
            <h2>¿Necesitas ayuda?</h2>
            <p>Si tienes problemas para acceder o quieres más información sobre cómo vender tu inmueble con nosotros, estamos aquí para ayudarte.</p>
          </div>
          <div className="propietarios-ayuda__actions">
            <Link to="/contacto" className="btn btn--primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Contactar
            </Link>
            <a href="tel:+34000000000" className="btn btn--outline">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              000 000 000
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Vender;