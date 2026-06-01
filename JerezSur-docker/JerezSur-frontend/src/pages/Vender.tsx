import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Vender.scss';

interface FormData {
  nombre: string;
  apellidos: string;
  telefono: string;
  email: string;
  detallesPropiedad: string;
}

const Vender = () => {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    apellidos: '',
    telefono: '',
    email: '',
    detallesPropiedad: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErrorEnvio('');

    try {
      const res = await fetch('/api/contactos/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: `${formData.nombre.trim()} ${formData.apellidos.trim()}`.trim(),
          email: formData.email.trim() || null,
          telefono: formData.telefono.trim(),
          mensaje: `[Quiero vender mi inmueble]\n${formData.detallesPropiedad.trim()}`,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setSubmitted(true);
    } catch {
      setErrorEnvio('Ha ocurrido un error. Inténtalo de nuevo o llámanos directamente.');
    } finally {
      setEnviando(false);
    }
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

          {/* COLUMNA DERECHA - FORMULARIO DE CONTACTO */}
          <div className="propietarios-auth">
            {submitted ? (
              <div className="propietarios-auth__content">
                <div className="propietarios-auth__success">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <h3>¡Mensaje enviado!</h3>
                  <p>Nos pondremos en contacto contigo a la mayor brevedad posible.</p>
                  <button className="btn btn--primary" onClick={() => setSubmitted(false)}>
                    Enviar otro mensaje
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="propietarios-auth__tabs">
                  <span className="propietarios-auth__tab propietarios-auth__tab--active">
                    Vende tu inmueble
                  </span>
                </div>

                <div className="propietarios-auth__content">
                  <form className="propietarios-auth__form" onSubmit={handleSubmit} noValidate>
                    <fieldset>
                      <legend>Tus datos de contacto</legend>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="nombre">Nombre *</label>
                          <input
                            id="nombre"
                            type="text"
                            name="nombre"
                            required
                            value={formData.nombre}
                            onChange={handleChange}
                            placeholder="Tu nombre"
                            autoComplete="given-name"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="apellidos">Apellidos *</label>
                          <input
                            id="apellidos"
                            type="text"
                            name="apellidos"
                            required
                            value={formData.apellidos}
                            onChange={handleChange}
                            placeholder="Tus apellidos"
                            autoComplete="family-name"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="telefono">Teléfono *</label>
                          <input
                            id="telefono"
                            type="tel"
                            name="telefono"
                            required
                            value={formData.telefono}
                            onChange={handleChange}
                            placeholder="600 000 000"
                            autoComplete="tel"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="email">Email (opcional)</label>
                          <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="tu@email.com"
                            autoComplete="email"
                          />
                        </div>
                      </div>
                    </fieldset>

                    <fieldset>
                      <legend>Tu propiedad</legend>
                      <div className="form-group">
                        <label htmlFor="detallesPropiedad">Cuéntanos un poco sobre el inmueble</label>
                        <textarea
                          id="detallesPropiedad"
                          name="detallesPropiedad"
                          value={formData.detallesPropiedad}
                          onChange={handleChange}
                          placeholder="Ej: Piso en el centro, 3 habitaciones, terraza..."
                          rows={4}
                        />
                      </div>
                    </fieldset>

                    {errorEnvio && (
                      <p style={{ color: '#d9534f', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        {errorEnvio}
                      </p>
                    )}
                    <button type="submit" className="btn btn--primary" disabled={enviando}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                      {enviando ? 'Enviando...' : 'Solicitar información'}
                    </button>
                  </form>
                </div>
              </>
            )}
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