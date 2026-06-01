import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/imgs/LogoAncho.png';
import '../styles/Home.scss';

const API_BASE = '/api';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80';

type FeaturedProperty = {
  id: number;
  referencia: string;
  titulo: string;
  precio: number;
  operacion?: string;
  ciudad?: string;
  zona?: string;
  habitaciones?: number;
  banos?: number;
  superficieUtil?: number;
  imagenPortadaUrl?: string;
};

type Testimonial = {
  id: number;
  name: string;
  text: string;
};

const formatPrecio = (precio: number, operacion?: string): string => {
  const formatted = new Intl.NumberFormat('es-ES').format(precio);
  return operacion === 'ALQUILER' ? `${formatted} €/mes` : `${formatted} €`;
};

const testimonials: Testimonial[] = [
  { id: 1, name: 'María G.', text: 'obiliaria nos inspiraron mucha confianza. Estamos convencidos de que ambos le ha dado un aire fresco a la inmobiliaria. Sin duda, volveremos a contar con ellos en futuras ocasiones.' },
  { id: 2, name: 'Antonio R.', text: 'Vendimos nuestra vivienda con total tranquilidad. Nos explicaron todo muy bien y siempre estuvieron disponibles para cualquier duda.' },
  { id: 3, name: 'Lucía y Daniel', text: 'Trato cercano, rapidez y mucha transparencia. Se nota que conocen muy bien el mercado inmobiliario de Jerez.' },
  { id: 4, name: 'Carmen P.', text: 'Desde el primer momento nos transmitieron confianza. El trato fue cercano y muy profesional en todo momento.' },
];

const Home = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [destacados, setDestacados] = useState<FeaturedProperty[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/inmuebles/destacados`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setDestacados(Array.isArray(data) ? data : []))
      .catch(() => setDestacados([]));
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className="home">
      {/* HERO */}
      <section className="hero home-hero">
        <div className="hero__content">
          <img src={logo} alt="JerezSur Inmobiliaria" className="logo-hero" />
          <h1>Encuentra tu hogar ideal en Jerez de la Frontera</h1>
          <p>Compra, vende o alquila con una inmobiliaria cercana, profesional y con experiencia local.</p>

          <form className="home-search" aria-label="Buscador rápido de inmuebles">
            <select id="operation" defaultValue="compra"><option value="compra">Comprar</option><option value="alquiler">Alquilar</option></select>
            <select id="zone" defaultValue="jerez fra."><option value="jerez fra.">Jerez de la Fra.</option><option value="puerto sta.">El Puerto Sta.</option></select>
            <input id="price" type="number" placeholder="Precio maximo" />
            <Link to="/inmuebles" className="btn btn--secondary">Buscar</Link>
          </form>

          <div className="home-hero__sell-box">
            <div className="home-hero__sell-text">
              <span>¿Quieres vender tu vivienda?</span>
              <p>Solicita información o una tasación sin compromiso. Te ayudamos con una estrategia profesional y cercana.</p>
            </div>
            <Link to="/propietarios" className="btn btn--white home-hero__sell-btn">Quiero vender</Link>
          </div>

          <div className="main-actions">
            <Link to="/Contacto" className="btn btn--ghost">¿Prefieres hablar con personas?</Link>
          </div>
        </div>
      </section>

      {/* DESTACADOS */}
      <section className="section home-featured">
        <div className="section-heading">
          <div className="section-heading__text">
            <span className="section-heading__eyebrow">Selección destacada</span>
            <h2>Propiedades destacadas en Jerez</h2>
          </div>
          <Link to="/inmuebles" className="btn btn--outline">Ver todas</Link>
        </div>
        <div className="properties-grid">
          {destacados.length === 0 ? (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#6c757d' }}>
              No hay propiedades destacadas en este momento.
            </p>
          ) : (
            destacados.map((p) => {
              const tipo = p.operacion === 'ALQUILER' ? 'Alquiler' : 'Venta';
              const location = [p.zona, p.ciudad].filter(Boolean).join(', ');
              return (
                <article key={p.id} className="property-card">
                  <div className="property-card__media">
                    <img src={p.imagenPortadaUrl || DEFAULT_IMAGE} alt={p.titulo} loading="lazy" />
                    <span className="property-card__tag">{tipo}</span>
                  </div>
                  <div className="property-card__content">
                    <h3>{p.titulo}</h3>
                    <p className="property-card__location">{location || 'Jerez de la Frontera'}</p>
                    <div className="property-card__features">
                      {p.habitaciones != null && <span>{p.habitaciones} hab.</span>}
                      {p.banos != null && <span>{p.banos} baños</span>}
                      {p.superficieUtil != null && <span>{p.superficieUtil} m²</span>}
                    </div>
                    <span className="price">{formatPrecio(p.precio, p.operacion)}</span>
                    <Link to={`/inmuebles/${p.id}`} className="btn btn--primary btn--full">Ver detalles</Link>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      {/* --- CTA PROPIETARIOS (COPY MEJORADO) --- */}
      <section className="home-cta">
        <div className="section--full home-cta__container">
          <div className="section home-cta__content">
            <div className="home-cta__text">
              <h2>Vende tu vivienda en Jerez con expertos locales</h2>
              <p>Nos encargamos de todo el proceso para que vendas con tranquilidad y en las mejores condiciones. Solicita una tasación gratuita y sin compromiso.</p>
            </div>
            <Link to="/propietarios" className="btn btn--secondary">Saber más</Link>
          </div>
        </div>
      </section>

      {/* VENTAJAS */}
      <section className="section section--alt home-advantages">
        <div className="section-heading section-heading--center">
          <div className="section-heading__text">
            <span className="section-heading__eyebrow">Por qué elegirnos</span>
            <h2>Cercanía, experiencia y conocimiento local</h2>
          </div>
        </div>
        <div className="home-advantages__grid">
          <article className="home-advantages__item"><h3>Experiencia local</h3><p>Conocemos Jerez, sus zonas y el mercado inmobiliario para asesorarte con seguridad y criterio.</p></article>
          <article className="home-advantages__item"><h3>Atención cercana</h3><p>Ofrecemos un trato humano y personalizado, adaptándonos a las necesidades de cada cliente.</p></article>
          <article className="home-advantages__item"><h3>Compra y venta</h3><p>Te acompañamos tanto si buscas vivienda como si quieres vender tu inmueble con la máxima confianza.</p></article>
        </div>
      </section>

      {/* --- OPINIONES (NUEVO DISEÑO) --- */}
      <section className="home-testimonials">
        <div className="section--full home-testimonials__container">
          <div className='home-testimonials__content'>
            <div className="home-testimonials__intro">
              <span className="home-testimonials__counter">{String(activeTestimonial + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}</span>
              <h2>La confianza de nuestros clientes</h2>
              <p className='white'>Trabajamos cada operación con cercanía, claridad y profesionalidad para que cada cliente se sienta acompañado de principio a fin.</p>
            </div>
            <div className="home-testimonials__carousel">
              <div className="home-testimonials__slider">
                <div className="home-testimonials__track" style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}>
                  {testimonials.map((testimonial) => (
                    <article key={testimonial.id} className="home-testimonials__slide">
                      <div className="home-testimonials__card">
                        <span className="home-testimonials__quote">“</span>
                        <p>{testimonial.text}</p>
                        <strong>{testimonial.name}</strong>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OFICINA / UBICACIÓN */}
      <section className="section home-location">
        <div className="home-location__content">
          <div className="home-location__info">
            <span className="section-heading__eyebrow">Dónde estamos</span>
            <h2>Visítanos en nuestra oficina en Jerez</h2>
            <p>Estamos en Jerez para atenderte de forma cercana y personalizada. Si lo prefieres, también puedes contactar por teléfono o a través del formulario.</p>
            <ul className="home-location__details">
              <li><strong>Dirección:</strong> Calle Ejemplo 123, Jerez de la Frontera</li>
              <li><strong>Teléfono:</strong> 000 000 000</li>
              <li><strong>Email:</strong> info@jerezsurinmobiliaria.es</li>
              <li><strong>Horario:</strong> L-V de 9:30 a 14:00 y 17:00 a 20:00</li>
            </ul>
            <div className="home-location__actions">
              <Link to="/contacto" className="btn btn--primary">Contactar</Link>
              <a href="https://www.google.com/maps" target="_blank" rel="noreferrer" className="btn btn--outline">Cómo llegar</a>
            </div>
          </div>
          <div className="home-location__map">
            <iframe title="Ubicación de JerezSur Inmobiliaria" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3199.7070567038027!2d-6.133446524360584!3d36.68154387228122!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd0dc6ed084fd943%3A0x584914d9e5c0d582!2sJEREZSUR%20INMOBILIARIA!5e0!3m2!1ses!2ses!4v1775647158517!5m2!1ses!2ses" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;