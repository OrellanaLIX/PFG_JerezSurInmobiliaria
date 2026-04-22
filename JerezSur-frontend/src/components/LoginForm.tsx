// src/components/propietarios/LoginForm.tsx
import { useState, type FormEvent } from 'react';
import '../styles/AuthForms.scss';

type LoginData = {
  email: string;
  password: string;
  remember: boolean;
};

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onLoginSuccess?: () => void;
}

const LoginForm = ({ onSwitchToRegister, onLoginSuccess }: LoginFormProps) => {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
    remember: false,
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');

    // Simulación de login - Aquí irá tu lógica real
    setTimeout(() => {
      console.log('Login:', formData);
      setFormStatus('success');
      
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        // Redirigir al dashboard
        // navigate('/propietarios/dashboard');
      }, 1000);
    }, 1500);
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    // Aquí irá tu lógica de recuperación de contraseña
    alert('Funcionalidad de recuperación de contraseña - Por implementar');
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form__header">
        <h2>Accede a tu área privada</h2>
        <p>Introduce tus credenciales para acceder</p>
      </div>

      <div className="auth-form__group">
        <label htmlFor="email">Email *</label>
        <div className="auth-form__input-wrapper">
          <svg className="auth-form__input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="tu@email.com"
            autoComplete="email"
          />
        </div>
      </div>

      <div className="auth-form__group">
        <label htmlFor="password">Contraseña *</label>
        <div className="auth-form__input-wrapper">
          <svg className="auth-form__input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <button
            type="button"
            className="auth-form__toggle-password"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="auth-form__extras">
        <label className="auth-form__checkbox">
          <input
            type="checkbox"
            name="remember"
            checked={formData.remember}
            onChange={handleChange}
          />
          <span>Recordarme</span>
        </label>
        <button 
          type="button" 
          onClick={handleForgotPassword}
          className="auth-form__link"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <button
        type="submit"
        className="btn btn--primary btn--full btn--large"
        disabled={formStatus === 'sending'}
      >
        {formStatus === 'sending' ? (
          <>
            <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
            Accediendo...
          </>
        ) : (
          'Iniciar sesión'
        )}
      </button>

      {formStatus === 'success' && (
        <div className="auth-form__message auth-form__message--success">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Acceso correcto. Redirigiendo...
        </div>
      )}

      {formStatus === 'error' && (
        <div className="auth-form__message auth-form__message--error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          Email o contraseña incorrectos.
        </div>
      )}

      <div className="auth-form__divider">
        <span>o</span>
      </div>

      <p className="auth-form__footer">
        ¿Aún no tienes cuenta? 
        <button 
          type="button" 
          onClick={onSwitchToRegister} 
          className="auth-form__link"
        >
          Solicita acceso
        </button>
      </p>
    </form>
  );
};

export default LoginForm;