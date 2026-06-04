// src/components/layout/Footer.tsx
// Pie de página de la web pública: navegación, servicios y datos de contacto
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/imgs/Mono.png';
import '../../styles/Footer.scss';

const Footer = () => {
  const location = useLocation();
  const [isHiddenByHero, setIsHiddenByHero] = useState(false);

  // En estas rutas no queremos mostrar el footer (páginas de autenticación a pantalla completa)
  const excludedRoutes = ['/acceder', '/registro'];
  const isExcluded = excludedRoutes.includes(location.pathname);

  // Igual que el Header, usamos IntersectionObserver para ocultar el footer
  // cuando el hero ocupa la pantalla (data-footer-hidden marca ese elemento)
  useEffect(() => {
    if (isExcluded) return;
    const target = document.querySelector('[data-footer-hidden]');
    if (!target) { setIsHiddenByHero(false); return; }
    const observer = new IntersectionObserver(
      ([entry]) => setIsHiddenByHero(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [location.pathname, isExcluded]);

  if (isExcluded) return null;

  const footerClasses = ['site-footer', isHiddenByHero ? 'site-footer--hidden' : '']
    .filter(Boolean).join(' ');

  return (
    <footer className={footerClasses} role="contentinfo"
            aria-label="Pie de página de JerezSur Inmobiliaria">
      <div className="site-footer__top">

        <div className="site-footer__brand">
          <img src={logo} alt="JerezSur Inmobiliaria" className="site-footer__logo"
               width="120" height="48" loading="lazy" />
          <p>
            Tu inmobiliaria de confianza en Jerez. Te ayudamos a comprar, vender
            o encontrar la vivienda ideal con cercanía y profesionalidad.
          </p>
          {/* Redes sociales */}
          <div className="site-footer__social" aria-label="Redes sociales">
            <a href="https://www.facebook.com/jerezsur" target="_blank" rel="noreferrer"
               className="site-footer__social-link" aria-label="Facebook de JerezSur">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a href="https://www.instagram.com/jerezsur" target="_blank" rel="noreferrer"
               className="site-footer__social-link" aria-label="Instagram de JerezSur">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a href="https://wa.me/34615061840" target="_blank" rel="noreferrer"
               className="site-footer__social-link" aria-label="WhatsApp de JerezSur">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
            </a>
          </div>
        </div>

        <nav aria-label="Páginas del sitio">
          <h4>Navegación</h4>
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/inmuebles">Inmuebles</Link></li>
            <li><Link to="/propietarios">Propietarios</Link></li>
            <li><Link to="/sobre-nosotros">Sobre nosotros</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
          </ul>
        </nav>

        <nav aria-label="Servicios ofrecidos">
          <h4>Servicios</h4>
          <ul>
            <li><Link to="/inmuebles">Comprar vivienda</Link></li>
            <li><Link to="/propietarios">Vender tu vivienda</Link></li>
            <li><Link to="/propietarios">Solicitar tasación</Link></li>
            <li><Link to="/pedir-cita">Pedir cita</Link></li>
            <li><Link to="/contacto">Atención personalizada</Link></li>
          </ul>
        </nav>

        <address className="site-footer__contact">
          <h4>Contacto</h4>
          <ul>
            <li>
              <strong>Tel:</strong>{' '}
              <a href="tel:+34615061840" aria-label="Llamar a JerezSur Inmobiliaria">
                615 061 840
              </a>
            </li>
            <li>
              <strong>Email:</strong>{' '}
              <a href="mailto:info@jerezsur.com">info@jerezsur.com</a>
            </li>
            <li><strong>Horario:</strong> L-V 9:30-14:00 | 17:00-20:00</li>
            <li>
              <strong>Dirección:</strong>{' '}
              <a href="https://maps.google.com/?q=JerezSur+Inmobiliaria" target="_blank" rel="noreferrer">
                Jerez de la Frontera, Cádiz
              </a>
            </li>
          </ul>
        </address>
      </div>

      {/* Separador elegante con gradiente */}
      <div className="site-footer__divider" aria-hidden="true" />

      <div className="site-footer__bottom">
        <p>© {new Date().getFullYear()} JerezSur Inmobiliaria. Todos los derechos reservados.</p>
        <nav className="site-footer__legal" aria-label="Información legal">
          <Link to="/aviso-legal">Aviso legal</Link>
          <Link to="/privacidad">Privacidad</Link>
          <Link to="/cookies">Cookies</Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
