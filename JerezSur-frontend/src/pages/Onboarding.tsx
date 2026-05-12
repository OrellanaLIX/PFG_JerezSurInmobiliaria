import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Onboarding.scss';

// Definimos la estructura de los datos para TypeScript
interface OnboardingFormData {
  nombre: string;
  apellidos: string;
  dni: string;
  telefono: string;
  intereses: string[];
  tiposInmueble: string[];
  presupuestoMax: string;
  habitaciones: string;
  banos: string;
  zonaPreferida: string;
  detallesPropiedad: string;
  comentariosExtra: string;
}

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const [formData, setFormData] = useState<OnboardingFormData>({
    nombre: '',
    apellidos: '',
    dni: '',
    telefono: '',
    intereses: [],
    tiposInmueble: [],
    presupuestoMax: '',
    habitaciones: '',
    banos: '',
    zonaPreferida: '',
    detallesPropiedad: '',
    comentariosExtra: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      const currentArray = [...(formData[name as keyof OnboardingFormData] as string[])];

      if (target.checked) {
        currentArray.push(value);
      } else {
        const index = currentArray.indexOf(value);
        if (index > -1) currentArray.splice(index, 1);
      }
      setFormData({ ...formData, [name]: currentArray });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const userJson = localStorage.getItem('usuario');
    const user = userJson ? JSON.parse(userJson) : null;

    if (!user?.id) {
      alert("Sesión no válida. Por favor, inicia sesión de nuevo.");
      setLoading(false);
      return;
    }

    // Mapeamos los datos del form a lo que espera el OnboardingRequest de Java
    const payload = {
      usuarioId: user.id,
      perfil, // 'interesado', 'propietario' o 'ambos'
      nombre: formData.nombre,
      apellidos: formData.apellidos,
      dni: formData.dni,
      telefono: formData.telefono,
      presupuestoMaximo: parseFloat(formData.presupuestoMax) || 0,
      zonaInteres: formData.zonaPreferida,
      habitacionesMinimas: parseInt(formData.habitaciones) || 0,
      banosMinimos: parseInt(formData.banos) || 0,
      detallesPropiedad: formData.detallesPropiedad,
      comentariosExtra: formData.comentariosExtra
    };

    try {
      const response = await fetch('http://localhost:8080/api/usuarios/completar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // 1. Actualizamos el rol en el LocalStorage para que la App lo sepa
        let nuevoRol: string;
        if (perfil === 'ambos') nuevoRol = 'ROLE_AMBOS';
        else if (perfil === 'interesado') nuevoRol = 'ROLE_INTERESADO';
        else nuevoRol = 'ROLE_VENDEDOR';

        user.role = nuevoRol;
        localStorage.setItem('usuario', JSON.stringify(user));

        // 2. Redirección inteligente
        if (perfil === 'propietario') {
          navigate('/propietario');
        } else {
          // Si es interesado o ambos, a ver casas
          navigate('/inmuebles');
        }
      } else {
        const error = await response.text();
        alert("Hubo un problema al guardar tu perfil: " + error);
      }
    } catch (err) {
      console.error("Error en la petición:", err);
      alert("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const mensaje = encodeURIComponent("Hola, me gustaría concertar una cita en persona para dar de alta mi perfil en JerezSur Inmobiliaria.");
    window.open(`https://wa.me/34600000000?text=${mensaje}`, '_blank');
  };

  return (
    <main data-header-transparent data-footer-hidden>
      <Link to="/" className='btn--ghost' >
        <i className="fas fa-arrow-left"></i> Volver
      </Link>

      <div className="onboarding-container">
        <header className="onboarding-header">
          <h2>¡Bienvenido a JerezSur!</h2>
          <p>Completa tu perfil para que podamos ayudarte mejor.</p>
        </header>

        <form onSubmit={handleSubmit} className="onboarding-form">
          {/* SECCIÓN 1: DATOS PERSONALES */}
          <fieldset>
            <legend>Tus Datos de Contacto</legend>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre</label>
                <input type="text" name="nombre" required onChange={handleChange} placeholder="Tu nombre" />
              </div>
              <div className="form-group">
                <label>Apellidos</label>
                <input type="text" name="apellidos" required onChange={handleChange} placeholder="Tus apellidos" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>DNI / NIE</label>
                <input type="text" name="dni" required onChange={handleChange} placeholder="12345678X" />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input type="tel" name="telefono" required onChange={handleChange} placeholder="600 000 000" />
              </div>
            </div>
          </fieldset>

          {/* SECCIÓN 2: TIPO DE PERFIL */}
          <div className="form-group main-select">
            <label>¿Qué vienes a hacer hoy?</label>
            <select value={perfil} onChange={(e) => setPerfil(e.target.value)} required>
              <option value="">Selecciona una opción...</option>
              <option value="interesado">Busco comprar o alquilar</option>
              <option value="propietario">Quiero poner mi casa en el mercado</option>
              <option value="ambos">Ambas cosas</option>
            </select>
          </div>

          {perfil && (
            <div className="dynamic-fields">
              {/* SECCIÓN 3: INTERESES DE BÚSQUEDA */}
              {(perfil === 'interesado' || perfil === 'ambos') && (
                <fieldset className="fade-in">
                  <legend>Lo que buscas</legend>
                  <div className="form-group">
                    <label>Presupuesto Máximo (€)</label>
                    <input type="number" name="presupuestoMax" placeholder="Ej: 200000" onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Zona de interés</label>
                    <input type="text" name="zonaPreferida" placeholder="Ej: Chapín, Centro, El Puerto..." onChange={handleChange} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Habitaciones mín.</label>
                      <input type="number" name="habitaciones" min="0" onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Baños mín.</label>
                      <input type="number" name="banos" min="0" onChange={handleChange} />
                    </div>
                  </div>
                </fieldset>
              )}

              {/* SECCIÓN 4: DATOS DE PROPIEDAD */}
              {(perfil === 'propietario' || perfil === 'ambos') && (
                <fieldset className="fade-in">
                  <legend>Tu propiedad</legend>
                  <div className="form-group">
                    <label>Cuéntanos un poco sobre el inmueble</label>
                    <textarea
                      name="detallesPropiedad"
                      placeholder="Ej: Piso en el centro, 3 habitaciones, terraza..."
                      onChange={handleChange}
                    />
                  </div>
                </fieldset>
              )}

              <div className="form-group">
                <label>¿Alguna nota adicional?</label>
                <textarea
                  name="comentariosExtra"
                  placeholder="Cualquier otra cosa que debamos saber..."
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Procesando...' : 'Finalizar y empezar'}
              </button>
            </div>
          )}
        </form>

        <div className="onboarding-footer">
          <p>¿Prefieres que lo hagamos por ti?</p>
          <button onClick={handleWhatsApp} className="btn-whatsapp">
            <span>💬</span> Concertar cita presencial
          </button>
        </div>
      </div>
    </main>
  );
};

export default Onboarding;