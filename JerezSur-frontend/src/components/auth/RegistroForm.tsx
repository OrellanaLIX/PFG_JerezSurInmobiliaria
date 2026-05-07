import { useState, type FormEvent } from 'react';
import '../../styles/AuthForms.scss';

type RegisterData = {
  name: string;
  contact: string; // Campo único para email o teléfono
  passwd: string;
  consent: boolean;
};

const RegisterForm = ({onRegisterSuccess }: any) => {
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    contact: '',
    passwd: '',
    consent: false,
  });

  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

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

    // --- LÓGICA DE VALIDACIÓN DEL CAMPO ÚNICO ---
    const input = formData.contact.trim();

    // Regex para Email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Regex para Teléfono (mínimo 9 dígitos, permite el + inicial)
    const phoneRegex = /^(\+?\d{1,3})?[\s.-]?\d{9,15}$/;

    let finalEmail = "";
    let finalPhone = "";

    if (emailRegex.test(input)) {
      finalEmail = input;
    } else if (phoneRegex.test(input.replace(/\s/g, ""))) {
      finalPhone = input.replace(/\s/g, ""); // Quitamos espacios para el back
    } else {
      setErrorMessage('Por favor, introduce un email o teléfono válido.');
      setFormStatus('error');
      return;
    }

    // --- CONSTRUCCIÓN DEL OBJETO PARA SPRING BOOT ---
    const dataToSend = {
      nombre: formData.name,
      email: finalEmail || null,     // Si no es email, se envía null
      telefono: finalPhone || null,  // Si no es teléfono, se envía null
      password: formData.passwd,
    };

    try {
      const response = await fetch('http://localhost:8080/api/usuarios/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || 'Error en el servidor');
      }

      setFormStatus('success');
      setFormData({ name: '', contact: '', passwd: '', consent: false });
      if (onRegisterSuccess) onRegisterSuccess();

    } catch (error: any) {
      setErrorMessage(error.message);
      setFormStatus('error');
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form__header">
        <h2>Solicita tu cuenta</h2>
        <p>Introduce tus datos de contacto para empezar.</p>
      </div>

      <div className="auth-form__group">
        <label>Nombre completo *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Ej: Manuel García"
        />
      </div>

      {/* CAMPO ÚNICO INTELIGENTE */}
      <div className="auth-form__group">
        <label>Email o Teléfono *</label>
        <input
          type="text" // Usamos text para permitir cualquier formato inicial
          name="contact"
          value={formData.contact}
          onChange={handleChange}
          required
          placeholder="ejemplo@mail.com o 600000000"
        />
      </div>

      <div className="auth-form__group">
        <label>Contraseña *</label>
        <input
          type="password"
          name="passwd"
          value={formData.passwd}
          onChange={handleChange}
          required
          placeholder="Mínimo 8 caracteres"
        />
      </div>

      <div className="auth-form__group auth-form__group--checkbox">
        <label className="auth-form__checkbox">
          <input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange} required />
          <span>Acepto la política de privacidad</span>
        </label>
      </div>

      <button type="submit" className="btn btn--primary btn--full" disabled={formStatus === 'sending'}>
        {formStatus === 'sending' ? 'Procesando...' : 'Solicitar acceso'}
      </button>

      {formStatus === 'error' && <div className="auth-form__message auth-form__message--error">{errorMessage}</div>}
      {formStatus === 'success' && <div className="auth-form__message auth-form__message--success">¡Registro completado!</div>}
    </form>
  );
};

export default RegisterForm;