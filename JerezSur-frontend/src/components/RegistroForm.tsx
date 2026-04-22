// src/components/propietarios/RegisterForm.tsx
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AuthForms.scss';

type RegisterData = {
  name: string;
  email: string;
  phone: string;
  propertyType: string;
  address: string;
  message: string;
  consent: boolean;
};

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onRegisterSuccess?: () => void;
}

const RegisterForm = ({ onSwitchToLogin, onRegisterSuccess }: RegisterFormProps) => {
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    phone: '',
    propertyType: '',
    address: '',
    message: '',
    consent: false,
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');

    // Simulación de registro - Aquí irá tu lógica real
    setTimeout(() => {
      console.log('Register:', formData);
      setFormStatus('success');
      
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }

      setFormData({
        name: '',
        email: '',
        phone: '',
        propertyType: '',
        address: '',
        message: '',
        consent: false,
      });

      setTimeout(() => setFormStatus('idle'), 5000);
    }, 1500);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form__header">
        <h2>Solicita tu cuenta de propietario</h2>
        <p>Rellena el formulario y te crearemos tu acceso personalizado</p>
      </div>

      <div className="auth-form__group">
        <label htmlFor="name">Nombre completo *</label>
        <div className="auth-form__input-wrapper">
          <svg className="auth-form__input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Tu nombre y apellidos"
            autoComplete="name"
          />
        </div>
      </div>

      <div className="auth-form__group">
        <label htmlFor="register-email">Email *</label>
        <div className="auth-form__input-wrapper">
          <svg className="auth-form__input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <input
            type="email"
            id="register-email"
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
        <label htmlFor="phone">Teléfono *</label>
        <div className="auth-form__input-wrapper">
          <svg className="auth-form__input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="000 000 000"
            autoComplete="tel"
          />
        </div>
      </div>

      <div className="auth-form__group">
        <label htmlFor="propertyType">Tipo de inmueble *</label>
        <div className="auth-form__input-wrapper">
          <svg className="auth-form__input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <select
            id="propertyType"
            name="propertyType"
            value={formData.propertyType}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Selecciona un tipo</option>
            <option value="Piso">Piso</option>
            <option value="Casa">Casa / Chalet</option>
            <option value="Ático">Ático</option>
            <option value="Dúplex">Dúplex</option>
            <option value="Local">Local comercial</option>
            <option value="Parcela">Parcela / Terreno</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
      </div>

      <div className="auth-form__group">
        <label htmlFor="address">Dirección del inmueble *</label>
        <div className="auth-form__input-wrapper">
          <svg className="auth-form__input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            placeholder="Calle, número, zona..."
            autoComplete="street-address"
          />
        </div>
      </div>

      <div className="auth-form__group">
        <label htmlFor="message">Información adicional (opcional)</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={3}
          placeholder="Cuéntanos más sobre tu inmueble: habitaciones, estado, si está alquilado..."
        ></textarea>
      </div>

      <div className="auth-form__group auth-form__group--checkbox">
        <label className="auth-form__checkbox">
          <input
            type="checkbox"
            name="consent"
            checked={formData.consent}
            onChange={handleChange}
            required
          />
          <span>
            He leído y acepto la <Link to="/privacidad">política de privacidad</Link> y el tratamiento de mis datos.
          </span>
        </label>
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
            Enviando solicitud...
          </>
        ) : (
          'Solicitar acceso'
        )}
      </button>

      {formStatus === 'success' && (
        <div className="auth-form__message auth-form__message--success">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Solicitud enviada. Te contactaremos en menos de 24h para crear tu acceso.
        </div>
      )}

      {formStatus === 'error' && (
        <div className="auth-form__message auth-form__message--error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          Ha ocurrido un error. Por favor, inténtalo de nuevo.
        </div>
      )}

      <div className="auth-form__divider">
        <span>o</span>
      </div>

      <p className="auth-form__footer">
        ¿Ya tienes cuenta? 
        <button 
          type="button" 
          onClick={onSwitchToLogin} 
          className="auth-form__link"
        >
          Inicia sesión
        </button>
      </p>
    </form>
  );
};

export default RegisterForm;