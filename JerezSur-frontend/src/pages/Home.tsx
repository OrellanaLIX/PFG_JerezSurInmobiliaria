import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/imgs/LogoAncho.png';
import '../styles/Home.scss';

type Property = {
  id: number;
  title: string;
  location: string;
  price: string;
  type: 'Venta' | 'Alquiler';
  image: string;
  beds: number;
  baths: number;
  area: number;
  slug: string;
};

type Testimonial = {
  id: number;
  name: string;
  text: string;
};

const featuredProperties: Property[] = [
  {
    id: 1,
    title: 'Piso luminoso en zona centro',
    location: 'Centro, Jerez de la Frontera',
    price: '185.000 €',
    type: 'Venta',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    beds: 3,
    baths: 2,
    area: 108,
    slug: 'piso-luminoso-zona-centro',
  },
  {
    id: 2,
    title: 'Casa familiar con patio',
    location: 'Zona Sur, Jerez de la Frontera',
    price: '249.000 €',
    type: 'Venta',
    image:
      'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=1200&q=80',
    beds: 4,
    baths: 2,
    area: 164,
    slug: 'casa-familiar-con-patio',
  },
  {
    id: 3,
    title: 'Ático con terraza',
    location: 'Norte, Jerez de la Frontera',
    price: '950 €/mes',
    type: 'Alquiler',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
    beds: 2,
    baths: 1,
    area: 92,
    slug: 'atico-con-terraza',
  },
];

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'María G.',
    text: 'Muy atentos y profesionales durante todo el proceso. Nos ayudaron a encontrar una vivienda que encajaba exactamente con lo que buscábamos.',
  },
  {
    id: 2,
    name: 'Antonio R.',
    text: 'Vendimos nuestra vivienda con total tranquilidad. Nos explicaron todo muy bien y siempre estuvieron disponibles para cualquier duda.',
  },
  {
    id: 3,
    name: 'Lucía y Daniel',
    text: 'Trato cercano, rapidez y mucha transparencia. Se nota que conocen muy bien el mercado inmobiliario de Jerez.',
  },
  {
    id: 4,
    name: 'Carmen P.',
    text: 'Desde el primer momento nos transmitieron confianza. El trato fue cercano y muy profesional en todo momento.',
  },
];

const Home = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

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
          <span className="hero__eyebrow">Inmobiliaria en Jerez</span>

          <img src={logo} alt="JerezSur Inmobiliaria" className="logo-hero" />

          <h1>Encuentra tu hogar ideal en Jerez de la Frontera</h1>

          <p>
            Compra, vende o alquila con una inmobiliaria cercana, profesional y con
            experiencia local. Te ayudamos a encontrar el inmueble adecuado para ti.
          </p>

          <form className="home-search" aria-label="Buscador rápido de inmuebles">
            <label className="visually-hidden" htmlFor="operation">
              Tipo de operación
            </label>
            <select id="operation" defaultValue="venta">
              <option value="venta">Comprar</option>
              <option value="alquiler">Alquilar</option>
            </select>

            <label className="visually-hidden" htmlFor="propertyType">
              Tipo de inmueble
            </label>
            <select id="propertyType" defaultValue="">
              <option value="" disabled>
                Tipo de inmueble
              </option>
              <option value="piso">Piso</option>
              <option value="casa">Casa</option>
              <option value="atico">Ático</option>
              <option value="local">Local</option>
              <option value="parcela">Parcela</option>
            </select>

            <label className="visually-hidden" htmlFor="zone">
              Zona o barrio
            </label>
            <input id="zone" type="text" placeholder="Zona o barrio" />

            <Link to="/inmuebles" className="btn btn--secondary">
              Buscar
            </Link>
          </form>

          <div className="home-hero__sell-box">
            <div className="home-hero__sell-text">
              <span>¿Quieres vender tu vivienda en Jerez?</span>
              <p>
                Solicita información o una tasación sin compromiso y te ayudamos a
                vender con una estrategia cercana, profesional y adaptada a tu inmueble.
              </p>
            </div>

            <Link to="/propietarios" className="btn btn--white home-hero__sell-btn">
              Quiero vender
            </Link>
          </div>

          <div className="main-actions">
            <Link to="/inmuebles" className="btn btn--ghost">
              Ver inmuebles destacados
            </Link>
          </div>
        </div>
      </section>

      {/* DESTACADOS */}
      <section className="section home-featured">
        <div className="section-heading">
          <div className="section-heading__text">
            <span className="section-heading__eyebrow">Selección destacada</span>
            <h2>Propiedades destacadas en Jerez</h2>
            <p>
              Descubre algunas de las oportunidades más interesantes disponibles
              actualmente en nuestra inmobiliaria.
            </p>
          </div>

          <Link to="/inmuebles" className="btn btn--outline">
            Ver todas
          </Link>
        </div>

        <div className="properties-grid">
          {featuredProperties.map((property) => (
            <article key={property.id} className="property-card">
              <div className="property-card__media">
                <img src={property.image} alt={property.title} loading="lazy" />
                <span className="property-card__tag">{property.type}</span>
              </div>

              <div className="property-card__content">
                <h3>{property.title}</h3>
                <p className="property-card__location">{property.location}</p>

                <div className="property-card__features">
                  <span>{property.beds} hab.</span>
                  <span>{property.baths} baños</span>
                  <span>{property.area} m²</span>
                </div>

                <span className="price">{property.price}</span>

                <Link to={`/inmuebles/${property.slug}`} className="btn btn--primary btn--full">
                  Ver detalles
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA PROPIETARIOS */}
      <section className="home-cta">
        <div className="section">
          <div>
            <span className="section-heading__eyebrow section-heading__eyebrow--light">
              Tasación e información sin compromiso
            </span>
            <h2>¿Quieres vender tu vivienda?</h2>
            <p>
              Si tienes una vivienda en venta en Jerez, te ayudamos a valorar tu
              inmueble y a definir la mejor estrategia para comercializarlo.
            </p>
          </div>

          <Link to="/propietarios" className="btn btn--secondary">
            Ir a propietarios
          </Link>
        </div>
      </section>

      {/* VENTAJAS */}
      <section className="section section--alt home-advantages">
        <div className="section-heading section-heading--center">
          <div className="section-heading__text">
            <span className="section-heading__eyebrow">Por qué elegirnos</span>
            <h2>Cercanía, experiencia y conocimiento local</h2>
            <p>
              En JerezSur trabajamos para ofrecerte un servicio profesional, cercano
              y adaptado a tus necesidades.
            </p>
          </div>
        </div>

        <div className="home-advantages__grid">
          <article className="home-advantages__item">
            <h3>Experiencia local</h3>
            <p>
              Conocemos Jerez, sus zonas y el mercado inmobiliario para asesorarte
              con seguridad y criterio.
            </p>
          </article>

          <article className="home-advantages__item">
            <h3>Atención cercana</h3>
            <p>
              Ofrecemos un trato humano y personalizado, adaptándonos a las
              necesidades de cada cliente.
            </p>
          </article>

          <article className="home-advantages__item">
            <h3>Ayuda en compra y venta</h3>
            <p>
              Te acompañamos tanto si buscas vivienda como si quieres vender tu
              inmueble con confianza.
            </p>
          </article>
        </div>
      </section>

      {/* OPINIONES */}
      <section className="home-testimonials">
        <div className="section home-testimonials__content">
          <div className="home-testimonials__intro">
            <span className="section-heading__eyebrow section-heading__eyebrow--light">
              Opiniones reales
            </span>
            <h2>La confianza de nuestros clientes habla por nosotros</h2>
            <p>
              En JerezSur trabajamos cada operación con cercanía, transparencia y
              profesionalidad. Estas son algunas opiniones de clientes que ya han confiado en nosotros.
            </p>
          </div>

          <div className="home-testimonials__carousel">
            <div className="home-testimonials__slider">
              <div
                className="home-testimonials__track"
                style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
              >
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

            <div className="home-testimonials__dots">
              {testimonials.map((testimonial, index) => (
                <button
                  key={testimonial.id}
                  type="button"
                  className={index === activeTestimonial ? 'is-active' : ''}
                  onClick={() => setActiveTestimonial(index)}
                  aria-label={`Ver opinión ${index + 1}`}
                />
              ))}
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
            <p>
              Estamos en Jerez de la Frontera para atenderte de forma cercana y
              personalizada. Si lo prefieres, también puedes contactar con nosotros
              por teléfono o a través del formulario.
            </p>

            <ul className="home-location__details">
              <li><strong>Dirección:</strong> Calle Ejemplo 123, Jerez de la Frontera</li>
              <li><strong>Teléfono:</strong> 000 000 000</li>
              <li><strong>Email:</strong> info@jerezsurinmobiliaria.es</li>
              <li><strong>Horario:</strong> L-V de 9:30 a 14:00 y 17:00 a 20:00</li>
            </ul>

            <div className="home-location__actions">
              <Link to="/contacto" className="btn btn--primary">
                Contactar
              </Link>
              <a
                href="https://www.google.com/maps"
                target="_blank"
                rel="noreferrer"
                className="btn btn--outline"
              >
                Cómo llegar
              </a>
            </div>
          </div>

          <div className="home-location__map">
            <iframe
              title="Ubicación de JerezSur Inmobiliaria"
              src="https://www.google.com/maps/embed?pb="
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;