// src/components/layout/Footer.tsx
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/imgs/Mono.png';
import '../../styles/Footer.scss';

const Footer = () => {
  const location = useLocation();
  const [isHiddenByHero, setIsHiddenByHero] = useState(false);

  // 1. Definimos las rutas donde el Footer NO DEBE EXISTIR (display: none)
  // Añade aquí '/acceder', '/registro', etc.
  const excludedRoutes = ['/acceder', '/registro']; 
  const isExcluded = excludedRoutes.includes(location.pathname);

  // 2. Lógica del Observer (para páginas normales donde solo quieres que se oculte al ver el Hero)
  useEffect(() => {
    if (isExcluded) return; // Si la ruta está excluida, no necesitamos el observer

    const target = document.querySelector('[data-footer-hidden]');
    if (!target) {
      setIsHiddenByHero(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHiddenByHero(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [location.pathname, isExcluded]);

  // --- REGLA DE ORO PARA DISPLAY: NONE ---
  // Si estamos en una ruta excluida, devolvemos null (el componente desaparece del mapa)
  if (isExcluded) return null;

  const footerClasses = [
    'site-footer',
    isHiddenByHero ? 'site-footer--hidden' : '',
  ].filter(Boolean).join(' ');

  return (
    <footer className={footerClasses}>
      <div className="site-footer__top">
        <div className="site-footer__brand">
          <img src={logo} alt="JerezSur Inmobiliaria" className="site-footer__logo" />
          <p>
            Tu inmobiliaria de confianza en Jerez. Te ayudamos a comprar, vender
            o encontrar la vivienda ideal con cercanía y profesionalidad.
          </p>
        </div>

        <div className="site-footer__links">
          <h4>Navegación</h4>
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/inmuebles">Inmuebles</Link></li>
            <li><Link to="/propietarios">Propietarios</Link></li>
            <li><Link to="/sobre-nosotros">Sobre nosotros</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
          </ul>
        </div>

        <div className="site-footer__links">
          <h4>Servicios</h4>
          <ul>
            <li><Link to="/inmuebles">Comprar vivienda</Link></li>
            <li><Link to="/propietarios">Vender tu vivienda</Link></li>
            <li><Link to="/propietarios">Solicitar tasación</Link></li>
            <li><Link to="/contacto">Atención personalizada</Link></li>
          </ul>
        </div>

        <div className="site-footer__contact">
          <h4>Contacto</h4>
          <ul>
            <li><strong>Tel:</strong> <a href="tel:+34000000000">000 000 000</a></li>
            <li><strong>Email:</strong> <a href="mailto:info@jerezsurinmobiliaria.es">info@jerezsurinmobiliaria.es</a></li>
            <li><strong>Horario:</strong> L-V 9:30-14:00 | 17:00-20:00</li>
          </ul>
        </div>
      </div>

      <div className="site-footer__bottom">
        <p>© {new Date().getFullYear()} JerezSur Inmobiliaria.</p>
        <div className="site-footer__legal">
          <Link to="/aviso-legal">Aviso legal</Link>
          <Link to="/privacidad">Privacidad</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;