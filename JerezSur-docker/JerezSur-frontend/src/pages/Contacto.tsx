// Página de contacto: formulario de contacto, tarjetas de datos, mapa y FAQ.
// El mensaje se guarda en BD y se notifica al admin por WhatsApp.
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import '../styles/Contacto.scss';

/* ── Tipos ── */
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

/* ── Datos FAQ ── */
const faqData: FAQItem[] = [
  {
    id: 1,
    question: '¿Cuánto tarda la respuesta?',
    answer:
      'Respondemos todos los mensajes en menos de 24 horas laborables. Si es urgente, te recomendamos llamar directamente a nuestro teléfono o contactarnos por WhatsApp para una atención inmediata.',
  },
  {
    id: 2,
    question: '¿La tasación es gratuita?',
    answer:
      'Sí, ofrecemos tasaciones sin compromiso y totalmente gratuitas. Nuestro equipo visitará tu propiedad y te proporcionará un informe detallado del valor de mercado. Solicítala por teléfono, email o formulario.',
  },
  {
    id: 3,
    question: '¿Puedo visitaros sin cita previa?',
    answer:
      'Por supuesto. Estamos en la oficina en nuestro horario habitual de lunes a viernes. No obstante, te recomendamos concertar cita previa para garantizar una atención más personalizada y dedicarte el tiempo que mereces.',
  },
  {
    id: 4,
    question: '¿Atendéis fuera de Jerez?',
    answer:
      'Nos especializamos en Jerez de la Frontera y conocemos el mercado local en profundidad, pero también trabajamos en localidades cercanas como El Puerto de Santa María, Sanlúcar y Cádiz. Consúltanos tu caso sin compromiso.',
  },
  {
    id: 5,
    question: '¿Qué documentación necesito para vender?',
    answer:
      'Para vender tu vivienda necesitarás: escrituras de propiedad, nota simple del registro, cédula de habitabilidad, certificado energético y IBI. No te preocupes, te asesoramos en todo el proceso y te ayudamos a gestionar la documentación necesaria.',
  },
  {
    id: 6,
    question: '¿Cuánto cobráis por vuestros servicios?',
    answer:
      'Nuestros honorarios son competitivos y transparentes. No cobramos nada por adelantado: solo cobramos cuando vendemos tu vivienda. Contacta con nosotros para conocer nuestras condiciones sin compromiso.',
  },
];

/* ── Componente principal ── */
const Contacto = () => {
  useSEO({
    title: 'Contacto',
    description:
      'Contacta con JerezSur Inmobiliaria. Llámanos al 615 061 840 o escríbenos a info@jerezsur.com. Estamos en Jerez de la Frontera, Cádiz.',
  });

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');

    try {
      const res = await fetch('/api/contactos/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.name.trim(),
          email: formData.email.trim(),
          telefono: formData.phone.trim(),
          mensaje: `[${formData.subject}] ${formData.message.trim()}`,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

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
    } catch {
      setFormStatus('error');
    }
  };

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <main className="contact">
      {/* ── HERO ── */}
      <section className="contact-hero">
        <div className="hero__content">
          <h1>Estamos aquí para ayudarte</h1>
          <p>
            ¿Buscas vivienda? ¿Quieres vender? ¿Necesitas asesoramiento? Contacta con nosotros y
            te atenderemos de forma personalizada.
          </p>
        </div>
      </section>

      {/* ── TARJETAS DE CONTACTO DIRECTO ── */}
      <section className="contact-cards" aria-label="Información de contacto directo">
        <div className="container">
          <div className="contact-cards__grid">

            {/* Teléfono */}
            <article className="contact-card">
              <div className="contact-card__icon contact-card__icon--phone" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 12.5 19.79 19.79 0 0 1 1.06 3.87 2 2 0 0 1 3.05 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <span className="contact-card__label">Teléfono</span>
              <span className="contact-card__value">615 061 840</span>
              <a
                href="tel:+34615061840"
                className="contact-card__action btn btn--primary"
                aria-label="Llamar al 615 061 840"
              >
                Llamar ahora
              </a>
            </article>

            {/* Email */}
            <article className="contact-card">
              <div className="contact-card__icon contact-card__icon--email" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <span className="contact-card__label">Email</span>
              <span className="contact-card__value">info@jerezsur.com</span>
              <a
                href="mailto:info@jerezsur.com"
                className="contact-card__action btn btn--primary"
                aria-label="Enviar email a info@jerezsur.com"
              >
                Enviar email
              </a>
            </article>

            {/* WhatsApp */}
            <article className="contact-card">
              <div className="contact-card__icon contact-card__icon--whatsapp" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
              </div>
              <span className="contact-card__label">WhatsApp</span>
              <span className="contact-card__value">615 061 840</span>
              <a
                href="https://wa.me/34615061840"
                target="_blank"
                rel="noreferrer"
                className="contact-card__action btn btn--secondary"
                aria-label="Abrir conversación de WhatsApp con JerezSur Inmobiliaria"
              >
                Abrir WhatsApp
              </a>
            </article>

            {/* Horario */}
            <article className="contact-card contact-card--schedule">
              <div className="contact-card__icon contact-card__icon--schedule" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <span className="contact-card__label">Horario de atención</span>
              <div className="contact-card__schedule">
                <span className="contact-card__schedule-row">
                  <strong>Lunes – Viernes</strong>
                </span>
                <span className="contact-card__schedule-row">9:30 – 14:00</span>
                <span className="contact-card__schedule-row">17:00 – 20:00</span>
              </div>
            </article>

          </div>
        </div>
      </section>

      {/* ── LAYOUT PRINCIPAL: FORMULARIO + INFO ── */}
      <section className="section section--alt contact-main" aria-label="Formulario de contacto e información de la oficina">
        <div className="container">
          <div className="contact-main__grid">

            {/* Columna izquierda — Formulario (60%) */}
            <div className="contact-form-wrapper">
              <div className="contact-form-wrapper__header">
                <span className="section-heading__eyebrow">Escríbenos</span>
                <h2>Envíanos un mensaje</h2>
                <p>Rellena el formulario y nos pondremos en contacto contigo lo antes posible.</p>
              </div>

              <form
                className="contact-form"
                onSubmit={handleSubmit}
                role="form"
                aria-label="Formulario de contacto con JerezSur Inmobiliaria"
                noValidate
              >
                {/* Nombre */}
                <div className="contact-form__group">
                  <label className="contact-form__label" htmlFor="contact-name">
                    Nombre completo <span aria-hidden="true">*</span>
                  </label>
                  <input
                    className="contact-form__input"
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Tu nombre y apellidos"
                    aria-required="true"
                  />
                </div>

                {/* Email */}
                <div className="contact-form__group">
                  <label className="contact-form__label" htmlFor="contact-email">
                    Correo electrónico <span aria-hidden="true">*</span>
                  </label>
                  <input
                    className="contact-form__input"
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    aria-required="true"
                  />
                </div>

                {/* Teléfono */}
                <div className="contact-form__group">
                  <label className="contact-form__label" htmlFor="contact-phone">
                    Teléfono <span aria-hidden="true">*</span>
                  </label>
                  <input
                    className="contact-form__input"
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="600 000 000"
                    aria-required="true"
                  />
                </div>

                {/* Asunto */}
                <div className="contact-form__group">
                  <label className="contact-form__label" htmlFor="contact-subject">
                    Asunto <span aria-hidden="true">*</span>
                  </label>
                  <select
                    className="contact-form__input contact-form__select"
                    id="contact-subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    aria-required="true"
                  >
                    <option value="Información general">Información general</option>
                    <option value="Quiero comprar">Quiero comprar</option>
                    <option value="Quiero vender">Quiero vender</option>
                    <option value="Quiero alquilar">Quiero alquilar</option>
                    <option value="Tasación">Solicitar tasación gratuita</option>
                    <option value="Consulta sobre inmueble">Consulta sobre un inmueble</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                {/* Mensaje — ocupa ancho completo */}
                <div className="contact-form__group contact-form__group--full">
                  <label className="contact-form__label" htmlFor="contact-message">
                    Mensaje <span aria-hidden="true">*</span>
                  </label>
                  <textarea
                    className="contact-form__textarea"
                    id="contact-message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Cuéntanos en qué podemos ayudarte..."
                    aria-required="true"
                  />
                </div>

                {/* Consentimiento */}
                <div className="contact-form__group contact-form__group--full contact-form__group--consent">
                  <label className="contact-form__consent-label" htmlFor="contact-consent">
                    <input
                      id="contact-consent"
                      name="consent"
                      type="checkbox"
                      required
                      checked={formData.consent}
                      onChange={handleChange}
                      aria-required="true"
                    />
                    <span>
                      He leído y acepto la{' '}
                      <Link to="/privacidad">política de privacidad</Link> y el tratamiento de mis
                      datos personales.
                    </span>
                  </label>
                </div>

                {/* Botón de envío */}
                <div className="contact-form__group contact-form__group--full">
                  <button
                    type="submit"
                    className="btn btn--primary contact-form__submit"
                    disabled={formStatus === 'sending'}
                    aria-label={
                      formStatus === 'sending' ? 'Enviando mensaje...' : 'Enviar mensaje de contacto'
                    }
                  >
                    {formStatus === 'sending' ? (
                      <>
                        <svg
                          className="contact-form__spinner"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                        Enviando…
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                        Enviar mensaje
                      </>
                    )}
                  </button>
                </div>

                {/* Estado: éxito */}
                {formStatus === 'success' && (
                  <div
                    className="contact-form__status contact-form__status--success"
                    role="alert"
                    aria-live="polite"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Mensaje enviado correctamente. Te responderemos en menos de 24 horas.</span>
                  </div>
                )}

                {/* Estado: error */}
                {formStatus === 'error' && (
                  <div
                    className="contact-form__status contact-form__status--error"
                    role="alert"
                    aria-live="polite"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    <span>Ha ocurrido un error al enviar. Por favor, inténtalo de nuevo o llámanos directamente.</span>
                  </div>
                )}
              </form>
            </div>

            {/* Columna derecha — Información de la oficina (40%) */}
            <aside className="contact-info" aria-label="Información de la oficina">
              <h2 className="contact-info__title">Nuestra oficina</h2>

              {/* Dirección */}
              <div className="contact-info__item">
                <div className="contact-info__item-icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="contact-info__item-body">
                  <strong>Dirección</strong>
                  <span>Jerez de la Frontera, Cádiz</span>
                </div>
              </div>

              {/* Teléfono info */}
              <div className="contact-info__item">
                <div className="contact-info__item-icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 12.5 19.79 19.79 0 0 1 1.06 3.87 2 2 0 0 1 3.05 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className="contact-info__item-body">
                  <strong>Teléfono</strong>
                  <a href="tel:+34615061840" aria-label="Llamar al 615 061 840">615 061 840</a>
                </div>
              </div>

              {/* Email info */}
              <div className="contact-info__item">
                <div className="contact-info__item-icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <div className="contact-info__item-body">
                  <strong>Email</strong>
                  <a href="mailto:info@jerezsur.com" aria-label="Enviar email a info@jerezsur.com">info@jerezsur.com</a>
                </div>
              </div>

              {/* Horario info */}
              <div className="contact-info__item">
                <div className="contact-info__item-icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="contact-info__item-body">
                  <strong>Horario</strong>
                  <span>Lunes – Viernes</span>
                  <span>9:30 – 14:00 | 17:00 – 20:00</span>
                </div>
              </div>

              {/* Mapa */}
              <div className="contact-info__map">
                <iframe
                  title="Ubicación de JerezSur Inmobiliaria en Jerez de la Frontera"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3199.7070567038027!2d-6.133446524360584!3d36.68154387228122!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd0dc6ed084fd943%3A0x584914d9e5c0d582!2sJEREZSUR%20INMOBILIARIA!5e0!3m2!1ses!2ses!4v1775647158517!5m2!1ses!2ses"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>

              {/* Botón cómo llegar */}
              <a
                href="https://www.google.com/maps/dir//JEREZSUR+INMOBILIARIA"
                target="_blank"
                rel="noreferrer"
                className="btn btn--primary contact-info__directions"
                aria-label="Abrir indicaciones para llegar a JerezSur Inmobiliaria en Google Maps"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Cómo llegar
              </a>
            </aside>

          </div>
        </div>
      </section>

      {/* ── FAQ ACORDEÓN ── */}
      <section className="section contact-faq" aria-label="Preguntas frecuentes">
        <div className="container">
          <div className="section-heading section-heading--center">
            <span className="section-heading__eyebrow">Preguntas frecuentes</span>
            <h2>¿Tienes dudas?</h2>
            <p>
              Aquí respondemos las preguntas más comunes. Si no encuentras lo que buscas, no dudes
              en contactarnos.
            </p>
          </div>

          <div className="contact-faq__accordion" role="list">
            {faqData.map((faq) => (
              <div
                key={faq.id}
                className={`contact-faq__item${openFAQ === faq.id ? ' contact-faq__item--open' : ''}`}
                role="listitem"
              >
                <button
                  type="button"
                  className="contact-faq__question"
                  onClick={() => toggleFAQ(faq.id)}
                  aria-expanded={openFAQ === faq.id}
                  aria-controls={`faq-answer-${faq.id}`}
                  id={`faq-btn-${faq.id}`}
                >
                  <h3>{faq.question}</h3>
                  <svg
                    className="contact-faq__icon"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div
                  id={`faq-answer-${faq.id}`}
                  className="contact-faq__answer"
                  role="region"
                  aria-labelledby={`faq-btn-${faq.id}`}
                  hidden={openFAQ !== faq.id}
                >
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contacto;
