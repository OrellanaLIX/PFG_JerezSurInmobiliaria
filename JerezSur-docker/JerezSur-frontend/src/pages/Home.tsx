// Página principal (Home) de JerezSur Inmobiliaria.
// Muestra el hero con buscador, inmuebles destacados y secciones informativas.
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/imgs/LogoAncho.png';
import '../styles/Home.scss';
import { useSEO } from '../hooks/useSEO';

const API_BASE = '/api';
// fm=webp → Unsplash sirve WebP (30-50% más ligero que JPEG)
// w=600 → suficiente para una tarjeta de propiedad, no necesitamos 1200px
// q=75 → calidad 75% es indistinguible visualmente y pesa mucho menos
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=75&fm=webp';

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
  const navigate = useNavigate();
  const [searchOp, setSearchOp]   = useState('compra');
  const [searchZone, setSearchZone] = useState('');
  const [searchPrice, setSearchPrice] = useState('');

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set('estado', 'DISPONIBLE');
    if (searchOp === 'alquiler')  params.set('operacion', 'ALQUILER');
    else if (searchOp === 'compra') params.set('operacion', 'VENTA');
    if (searchZone)  params.set('zona', searchZone);
    if (searchPrice) params.set('precioMax', searchPrice);
    navigate(`/inmuebles?${params.toString()}`);
  };

  useSEO({
    title: 'Inicio',
    description: 'Inmobiliaria en Jerez de la Frontera. Compra, vende o alquila tu vivienda con expertos locales. Pisos, casas, chalets y locales en Jerez y alrededores.',
    canonical: window.location.origin + '/',
    image: '/Hero.jpg',
  });

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
          {/* fetchpriority="high" le indica al navegador que esta imagen es prioritaria (LCP) */}
          <img src={logo} alt="JerezSur Inmobiliaria" className="logo-hero" fetchPriority="high" />
          <h1>Encuentra tu hogar ideal en Jerez de la Frontera</h1>
          <p>Compra, vende o alquila con una inmobiliaria cercana, profesional y con experiencia local.</p>

          {/* Los <label> ocultos visualmente pero presentes para lectores de pantalla
              Esto corrige el error de accesibilidad "select sin label" de Lighthouse */}
          <form className="home-search" aria-label="Buscador rápido de inmuebles"
                onSubmit={handleSearch}>
            <label htmlFor="operation" className="sr-only">Tipo de operación</label>
            <select id="operation" value={searchOp}
                    onChange={e => setSearchOp(e.target.value)}
                    aria-label="Tipo de operación">
              <option value="compra">Comprar</option>
              <option value="alquiler">Alquilar</option>
            </select>

            <label htmlFor="zone" className="sr-only">Zona</label>
            <select id="zone" value={searchZone}
                    onChange={e => setSearchZone(e.target.value)}
                    aria-label="Zona de Jerez">
              <option value="">Todas las zonas</option>
              <option value="Centro">Centro</option>
              <option value="Chapin">Chapín</option>
              <option value="MOPU">MOPU</option>
              <option value="La Granja">La Granja</option>
              <option value="La Cartuja">La Cartuja</option>
              <option value="Ronda">Ronda</option>
            </select>

            <label htmlFor="price" className="sr-only">Precio máximo</label>
            <input id="price" type="number" min="0" step="10000"
                   placeholder="Precio máximo (€)" aria-label="Precio máximo en euros"
                   value={searchPrice} onChange={e => setSearchPrice(e.target.value)} />
            <button type="submit" className="btn btn--secondary" aria-label="Buscar inmuebles">
              Buscar
            </button>
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
          <Link to="/inmuebles" className="btn btn--outline" aria-label="Ver todas las propiedades">Ver todas</Link>
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
                    {/* Las imágenes de las cards se cargan con lazy (no son LCP) */}
                    <img
                      src={p.imagenPortadaUrl || DEFAULT_IMAGE}
                      alt={p.titulo}
                      loading="lazy"
                      width="400"
                      height="280"
                    />
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
                    <Link
                      to={`/inmuebles/${p.id}`}
                      className="btn btn--primary btn--full"
                      aria-label={`Ver detalles de ${p.titulo}`}
                    >
                      Ver detalles
                    </Link>
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
            <Link to="/propietarios" className="btn btn--secondary" aria-label="Saber más sobre vender tu vivienda con JerezSur">Saber más</Link>
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
            {/* aria-live=”polite” anuncia el cambio de testimonio a lectores de pantalla
                sin interrumpir lo que estén leyendo */}
            <div className=”home-testimonials__carousel” role=”region”
                 aria-label=”Testimonios de clientes” aria-live=”polite”>
              <div className=”home-testimonials__slider”>
                <div className=”home-testimonials__track”
                     style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}>
                  {testimonials.map((testimonial, idx) => (
                    <article key={testimonial.id} className=”home-testimonials__slide”
                             aria-hidden={idx !== activeTestimonial}>
                      <div className=”home-testimonials__card”>
                        <span className=”home-testimonials__quote” aria-hidden=”true”>”</span>
                        <blockquote>
                          <p>{testimonial.text}</p>
                          <footer><cite>{testimonial.name}</cite></footer>
                        </blockquote>
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
            <address className="home-location__details">
              <ul>
                <li><strong>Dirección:</strong> Jerez de la Frontera, Cádiz</li>
                <li><strong>Teléfono:</strong> <a href="tel:+34615061840">615 061 840</a></li>
                <li><strong>Email:</strong> <a href="mailto:info@jerezsur.com">info@jerezsur.com</a></li>
                <li><strong>Horario:</strong> L-V de 9:30 a 14:00 y 17:00 a 20:00</li>
              </ul>
            </address>
            <div className="home-location__actions">
              <Link to="/contacto" className="btn btn--primary">Contactar</Link>
              <a href="https://www.google.com/maps/dir//JEREZSUR+INMOBILIARIA"
                 target="_blank" rel="noreferrer noopener"
                 className="btn btn--outline"
                 aria-label="Cómo llegar a JerezSur Inmobiliaria (abre Google Maps)">
                Cómo llegar
              </a>
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
