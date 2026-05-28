// src/components/propietarios/LoginForm.tsx
import { useState, type FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/AuthForms.scss';

type LoginData = {
  identifier: string; // Email o teléfono
  password: string;
  remember: boolean;
};

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onLoginSuccess?: () => void;
}

const LoginForm = ({ onSwitchToRegister, onLoginSuccess }: LoginFormProps) => {
  const { login } = useAuth(); // Función del contexto para guardar la sesión
  
  const [formData, setFormData] = useState<LoginData>({
    identifier: '',
    password: '',
    remember: false,
  });
  
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
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
    setErrorMessage('');

    const loginPayload = {
      email: formData.identifier.trim(),
      password: formData.password,
    };

    try {
      const response = await fetch('http://localhost:8080/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginPayload),
      });

      if (!response.ok) {
        // Captura el mensaje de BusinessValidationException del back
        const errorText = await response.text();
        throw new Error(errorText || 'Credenciales incorrectas');
      }

      // El backend devuelve el objeto Usuario (sin password por el @JsonIgnore)
      const usuarioData = await response.json();
      
      // 1. Guardamos en el AuthContext (y este lo guarda en LocalStorage)
      login(usuarioData);

      setFormStatus('success');
      
      // 2. Notificamos éxito y redirigimos
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
      }, 1000);

    } catch (error: any) {
      setErrorMessage(error.message);
      setFormStatus('error');
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    alert('Funcionalidad en desarrollo: Se enviará un enlace de recuperación a su contacto.');
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form__header">
        <h2>Área de Propietarios</h2>
        <p>Accede con tu email o número de teléfono</p>
      </div>

      {/* IDENTIFICADOR */}
      <div className="auth-form__group">
        <label htmlFor="identifier">Email o Teléfono *</label>
        <div className="auth-form__input-wrapper">
          <svg className="auth-form__input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <input
            type="text"
            id="identifier"
            name="identifier"
            value={formData.identifier}
            onChange={handleChange}
            required
            placeholder="Ej: usuario@mail.com o 600123456"
            autoComplete="username"
          />
        </div>
      </div>

      {/* CONTRASEÑA */}
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
            placeholder="Introduce tu contraseña"
            autoComplete="current-password"
          />
          <button
            type="button"
            className="auth-form__toggle-password"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
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
        <button type="button" onClick={handleForgotPassword} className="auth-form__link">
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <button
        type="submit"
        className="btn btn--primary btn--full btn--large"
        disabled={formStatus === 'sending'}
      >
        {formStatus === 'sending' ? 'Verificando...' : 'Iniciar sesión'}
      </button>

      {formStatus === 'success' && (
        <div className="auth-form__message auth-form__message--success">
          ¡Bienvenido de nuevo! Accediendo...
        </div>
      )}

      {formStatus === 'error' && (
        <div className="auth-form__message auth-form__message--error">
          <svg className="mr-2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {errorMessage}
        </div>
      )}

      <p className="auth-form__footer">
        ¿Aún no tienes cuenta? 
        <button 
          type="button" 
          onClick={onSwitchToRegister} 
          className="auth-form__link"
        >
          Solicita acceso aquí
        </button>
      </p>
    </form>
  );
};

export default LoginForm;