import { Link } from 'react-router-dom';
import logo from '../../assets/imgs/Mono.png';
import '../../styles/Footer.scss';

const Footer = () => {
  return (
    <footer className="site-footer">
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
            <li><Link to="/reservar-cita">Reservar cita</Link></li>
            <li><Link to="/contacto">Atención personalizada</Link></li>
          </ul>
        </div>

        <div className="site-footer__contact">
          <h4>Contacto</h4>
          <ul>
            <li><strong>Teléfono:</strong> 000 000 000</li>
            <li><strong>Email:</strong> info@jerezsurinmobiliaria.es</li>
            <li><strong>Dirección:</strong> Jerez de la Frontera, Cádiz</li>
            <li><strong>Horario:</strong> L-V de 9:30 a 14:00 y 17:00 a 20:00</li>
          </ul>
        </div>
      </div>

      <div className="site-footer__bottom">
        <p>© {new Date().getFullYear()} JerezSur Inmobiliaria. Todos los derechos reservados.</p>
        <div className="site-footer__legal">
          <Link to="/aviso-legal">Aviso legal</Link>
          <Link to="/politica-privacidad">Política de privacidad</Link>
          <Link to="/politica-cookies">Política de cookies</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;