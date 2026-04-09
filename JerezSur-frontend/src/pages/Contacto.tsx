import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Contacto.scss';

type FormData = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  consent: boolean;
};

type FAQItem = {
  id: number;
  question: string;
  answer: string;
};

const faqData: FAQItem[] = [
  {
    id: 1,
    question: '¿Cuánto tarda la respuesta?',
    answer: 'Respondemos todos los mensajes en menos de 24 horas laborables. Si es urgente, te recomendamos llamar directamente a nuestro teléfono o contactarnos por WhatsApp para una atención inmediata.'
  },
  {
    id: 2,
    question: '¿La tasación es gratuita?',
    answer: 'Sí, ofrecemos tasaciones sin compromiso y totalmente gratuitas. Nuestro equipo visitará tu propiedad y te proporcionará un informe detallado del valor de mercado. Solicítala por teléfono, email o formulario.'
  },
  {
    id: 3,
    question: '¿Puedo visitaros sin cita previa?',
    answer: 'Por supuesto. Estamos en la oficina en nuestro horario habitual de lunes a viernes. No obstante, te recomendamos concertar cita previa para garantizar una atención más personalizada y dedicarte el tiempo que mereces.'
  },
  {
    id: 4,
    question: '¿Atendéis fuera de Jerez?',
    answer: 'Nos especializamos en Jerez de la Frontera y conocemos el mercado local en profundidad, pero también trabajamos en localidades cercanas como El Puerto de Santa María, Sanlúcar y Cádiz. Consúltanos tu caso sin compromiso.'
  },
  {
    id: 5,
    question: '¿Qué documentación necesito para vender?',
    answer: 'Para vender tu vivienda necesitarás: escrituras de propiedad, nota simple del registro, cédula de habitabilidad, certificado energético y IBI. No te preocupes, te asesoramos en todo el proceso y te ayudamos a gestionar la documentación necesaria.'
  },
  {
    id: 6,
    question: '¿Cuánto cobráis por vuestros servicios?',
    answer: 'Nuestros honorarios son competitivos y transparentes. No cobramos nada por adelantado: solo cobramos cuando vendemos tu vivienda. Contacta con nosotros para conocer nuestras condiciones sin compromiso.'
  }
];

const Contact = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: 'Información general',
    message: '',
    consent: false,
  });

  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

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

    // Simulación de envío
    setTimeout(() => {
      setFormStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'Información general',
        message: '',
        consent: false,
      });

      setTimeout(() => setFormStatus('idle'), 5000);
    }, 1500);
  };

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <main className="contact">
      {/* HERO */}
      <section className="hero contact-hero">
        <div className="hero__content">
          <h1>Estamos aquí para ayudarte</h1>
          <p>¿Buscas vivienda? ¿Quieres vender? ¿Necesitas asesoramiento? Contacta con nosotros y te atenderemos de forma personalizada.</p>
        </div>
      </section>

      {/* CTA PRINCIPAL - LLAMADA */}
      <section className="section contact-cta">
        <div className="contact-cta__container">
          <div className="contact-cta__content">
            
            <div className="contact-cta__text">
              <h2>¡Hablemos sin compromiso!</h2>
              <p>Llama o escríbenos ahora y te atenderemos personalmente. Estamos disponibles de lunes a viernes en horario continuo.</p>
            </div>

            <div className="contact-cta__buttons">
              <a href="tel:+34000000000" className="btn btn--primary btn--large contact-cta__button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                000 000 000
              </a>
              <a href="https://wa.me/34000000000" target="_blank" rel="noreferrer" className="btn btn--secondary btn--large contact-cta__button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                WhatsApp
              </a>
            </div>

            <div className="contact-cta__note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <p>Si contactas fuera de horario laboral, intentaremos responder lo más rápido posible.</p>
            </div>

            <span className="contact-cta__hours">Lunes a Viernes: 9:30 - 14:00 | 17:00 - 20:00</span>
          </div>
        </div>
      </section>

      {/* FORMULARIO */}
      <section className="section section--alt contact-form-section">
        <div className="contact-form-container">
          <div className="contact-form-intro">
            <span className="section-heading__eyebrow">Escríbenos</span>
            <h2>Envíanos tu consulta</h2>
            <p>Rellena el formulario y nos pondremos en contacto contigo lo antes posible. Todos los campos son obligatorios.</p>

            <div className="contact-form-features">
              <div className="contact-form-feature">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Respuesta en menos de 24h</span>
              </div>
              <div className="contact-form-feature">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Asesoramiento personalizado</span>
              </div>
              <div className="contact-form-feature">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Sin compromiso</span>
              </div>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-form__group">
              <label htmlFor="name">Nombre completo *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Tu nombre y apellidos"
              />
            </div>

            <div className="contact-form__group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="tu@email.com"
              />
            </div>

            <div className="contact-form__group">
              <label htmlFor="phone">Teléfono *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="000 000 000"
              />
            </div>

            <div className="contact-form__group">
              <label htmlFor="subject">Asunto *</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              >
                <option value="Información general">Información general</option>
                <option value="Quiero comprar">Quiero comprar</option>
                <option value="Quiero vender">Quiero vender</option>
                <option value="Quiero alquilar">Quiero alquilar</option>
                <option value="Tasación">Solicitar tasación</option>
                <option value="Consulta sobre inmueble">Consulta sobre un inmueble</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="contact-form__group contact-form__group--full">
              <label htmlFor="message">Mensaje *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Cuéntanos en qué podemos ayudarte..."
              ></textarea>
            </div>

            <div className="contact-form__group contact-form__group--full contact-form__group--checkbox">
              <label htmlFor="consent" className="contact-form__checkbox-label">
                <input
                  type="checkbox"
                  id="consent"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  required
                />
                <span>
                  He leído y acepto la <Link to="/privacidad">política de privacidad</Link> y el tratamiento de mis datos personales.
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
                  Enviando...
                </>
              ) : (
                'Enviar mensaje'
              )}
            </button>

            {formStatus === 'success' && (
              <div className="contact-form__message contact-form__message--success">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Mensaje enviado correctamente. Te responderemos pronto.
              </div>
            )}

            {formStatus === 'error' && (
              <div className="contact-form__message contact-form__message--error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                Ha ocurrido un error. Por favor, inténtalo de nuevo.
              </div>
            )}
          </form>
        </div>
      </section>

      {/* MAPA AMPLIADO */}
      <section className="contact-map section">
        <div className="contact-map__info">
          <h2>Visítanos</h2>
          <p>Estamos ubicados en el centro de Jerez, con fácil acceso en coche y transporte público. Disponemos de aparcamiento cercano.</p>

          <div className="contact-map__details">
            <div className="contact-map__detail">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
              </svg>
              <span>Aparcamiento público a 50m</span>
            </div>
            <div className="contact-map__detail">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Parada de bus: Líneas 3, 7 y 15</span>
            </div>
            <div className="contact-map__detail">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>Acceso para personas con movilidad reducida</span>
            </div>
          </div>

          <a href="https://www.google.com/maps/dir//JEREZSUR+INMOBILIARIA" target="_blank" rel="noreferrer" className="btn btn--primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            Cómo llegar
          </a>
        </div>

        <div className="contact-map__embed">
          <iframe
            title="Ubicación de JerezSur Inmobiliaria"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3199.7070567038027!2d-6.133446524360584!3d36.68154387228122!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd0dc6ed084fd943%3A0x584914d9e5c0d582!2sJEREZSUR%20INMOBILIARIA!5e0!3m2!1ses!2ses!4v1775647158517!5m2!1ses!2ses"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </section>

      {/* FAQ ACORDEÓN */}
      <section className="section section--alt contact-faq">
        <div className="section-heading section-heading--center">
          <span className="section-heading__eyebrow">Preguntas frecuentes</span>
          <h2>¿Tienes dudas?</h2>
          <p>Aquí respondemos las preguntas más comunes. Si no encuentras lo que buscas, no dudes en contactarnos.</p>
        </div>

        <div className="contact-faq__accordion">
          {faqData.map((faq) => (
            <div
              key={faq.id}
              className={`contact-faq__item ${openFAQ === faq.id ? 'contact-faq__item--open' : ''}`}
            >
              <button
                className="contact-faq__question"
                onClick={() => toggleFAQ(faq.id)}
                aria-expanded={openFAQ === faq.id}
              >
                <h3>{faq.question}</h3>
                <svg
                  className="contact-faq__icon"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div className="contact-faq__answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Contact;