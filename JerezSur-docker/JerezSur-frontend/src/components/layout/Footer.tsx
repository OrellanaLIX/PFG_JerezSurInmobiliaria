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

  // Si estamos en una ruta excluida, no renderizamos nada
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
          </ul>
        </address>
      </div>

      <div className="site-footer__bottom">
        <p>© {new Date().getFullYear()} JerezSur Inmobiliaria.</p>
        <nav aria-label="Información legal">
          <Link to="/aviso-legal">Aviso legal</Link>
          <Link to="/privacidad">Privacidad</Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
