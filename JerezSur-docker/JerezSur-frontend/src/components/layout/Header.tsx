// Cabecera de la web pública: logo, navegación de escritorio y menú hamburguesa para móvil.
// Incluye acceso al login y al perfil del usuario si ya ha iniciado sesión.
import { useEffect, useState, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import logo from '../../assets/imgs/LogoAncho.png';
import '../../styles/Header.scss';
import { useAuth } from '../../context/AuthContext';

// Cabecera de la web pública con navegación responsive y lógica de scroll
const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  // isScrolled: true cuando el usuario ha bajado más de 50px (cambia el estilo del header)
  const [isScrolled, setIsScrolled] = useState(false);
  // isHidden: true cuando el hero ocupa la pantalla (el header se vuelve transparente)
  const [isHidden, setIsHidden] = useState(false);

  const location = useLocation();
  const headerRef = useRef<HTMLElement>(null);

  // Cerramos el menú móvil y subimos al inicio cada vez que cambia la ruta
  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // IntersectionObserver observa el elemento con data-header-transparent
  // Cuando ese elemento es visible (el hero), el header se oculta para no tapar la imagen
  useEffect(() => {
    const target = document.querySelector('[data-header-transparent]');
    if (!target) { setIsHidden(false); return; }
    const observer = new IntersectionObserver(
      ([entry]) => setIsHidden(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [location.pathname]);

  // Detectamos el scroll para cambiar el estilo del header (fondo sólido al bajar)
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bloqueamos el scroll del body cuando el menú móvil está abierto
  // así el usuario no puede hacer scroll mientras el menú está encima
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  }, [menuOpen]);

  // Lista de enlaces de navegación — separamos los que requieren login
  const navLinks = [
    { to: "/",              label: "Inicio",         end: true },
    { to: "/inmuebles",     label: "Inmuebles" },
    { to: "/propietarios",  label: "Vender" },
    { to: "/sobre-nosotros",label: "Sobre nosotros" },
    { to: "/contacto",      label: "Contacto" },
  ];

  const authNavLinks = [{ to: "/mis-citas", label: "Mis citas" }];

  // Construimos la clase CSS del header combinando los modificadores BEM según el estado
  const headerClasses = [
    'site-header',
    isScrolled ? 'site-header--scrolled' : '',
    isHidden && !menuOpen ? 'site-header--hidden' : '',
  ].filter(Boolean).join(' ');

  // isAuthenticated nos dice si hay un usuario logueado para mostrar "Tu Perfil" o "Acceder"
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* ── Skip link — solo visible al recibir foco con teclado ──────────
          Permite a usuarios de teclado saltar directamente al contenido
          sin pasar por toda la navegación. Requisito WCAG 2.4.1 */}
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      <header className={headerClasses} ref={headerRef} role="banner">
        <div className="site-header__container">

          <Link to="/" className="site-header__logo" onClick={() => setMenuOpen(false)}
                aria-label="JerezSur Inmobiliaria — Ir a la página de inicio">
            <img src={logo} alt="JerezSur Inmobiliaria" width="180" height="48" />
          </Link>

          {/* Navegación de escritorio */}
          <nav className="site-header__nav site-header__nav--desktop"
               aria-label="Navegación principal">
            {navLinks.map(link => (
              <NavLink key={link.to} to={link.to} end={link.end}
                       className={({ isActive }) => isActive ? 'is-active' : ''}>
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated && authNavLinks.map(link => (
              <NavLink key={link.to} to={link.to}
                       className={({ isActive }) => isActive ? 'is-active' : ''}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="site-header__actions--desktop">
            {isAuthenticated ? (
              <Link to="/perfil" className="btn btn--secondary">Tu Perfil</Link>
            ) : (
              <Link to="/acceder" className="btn btn--secondary">Acceder</Link>
            )}
          </div>

          {/* Botón hamburguesa con ARIA correcto */}
          <button
            className={`site-header__toggle ${menuOpen ? 'is-open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Overlay oscuro del menú móvil */}
      <div
        className={`site-header__overlay ${menuOpen ? 'site-header__overlay--open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Menú móvil */}
      <aside
        id="mobile-menu"
        className={`mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`}
        aria-label="Menú de navegación móvil"
        aria-hidden={!menuOpen}
      >
        <nav className="mobile-menu__nav" aria-label="Navegación móvil">
          {navLinks.map(link => (
            <NavLink key={link.to} to={link.to} end={link.end}
                     onClick={() => setMenuOpen(false)}>
              {link.label}
            </NavLink>
          ))}
          {isAuthenticated && authNavLinks.map(link => (
            <NavLink key={link.to} to={link.to} onClick={() => setMenuOpen(false)}>
              {link.label}
            </NavLink>
          ))}
          <Link to="/propietarios" className="btn btn--secondary btn--full"
                onClick={() => setMenuOpen(false)}>
            Vender tu vivienda
          </Link>
        </nav>
      </aside>
    </>
  );
};

export default Header;
