import { useEffect, useState, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import logo from '../../assets/imgs/LogoAncho.png';
import '../../styles/Header.scss';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const location = useLocation();
  const headerRef = useRef<HTMLElement>(null);

  // 1. Reset al cambiar de ruta
  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // 2. Observer para ocultar/mostrar según el Hero ([data-header-transparent])
  useEffect(() => {
    const target = document.querySelector('[data-header-transparent]');
    if (!target) {
      setIsHidden(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Si el Hero es visible, ocultamos el header
        setIsHidden(entry.isIntersecting);
      },
      { threshold: 0.1 } // Se activa en cuanto asoma un 10% del hero
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [location.pathname]);

  // 3. Scroll listener para estilos de "scrolled" (sombras/fondos)
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 4. Bloqueo de scroll body
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  }, [menuOpen]);

  const navLinks = [
    { to: "/", label: "Inicio", end: true },
    { to: "/inmuebles", label: "Inmuebles" },
    { to: "/propietarios", label: "Vender" },
    { to: "/sobre-nosotros", label: "Sobre nosotros" },
    { to: "/contacto", label: "Contacto" },
  ];

  const authNavLinks = [
    { to: "/mis-citas", label: "Mis citas" },
  ];

  const headerClasses = [
    'site-header',
    isScrolled ? 'site-header--scrolled' : '',
    isHidden && !menuOpen ? 'site-header--hidden' : '', // No se oculta si el menú móvil está abierto
  ].filter(Boolean).join(' ');

  const { isAuthenticated } = useAuth();

  return (
    <>
      <header className={headerClasses} ref={headerRef}>
        <div className="site-header__container">
          <Link to="/" className="site-header__logo" onClick={() => setMenuOpen(false)}>
            <img src={logo} alt="JerezSur Inmobiliaria" />
          </Link>

          <nav className="site-header__nav site-header__nav--desktop">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => isActive ? 'is-active' : ''}
              >
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated && authNavLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => isActive ? 'is-active' : ''}
              >
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

          <button
            className={`site-header__toggle ${menuOpen ? 'is-open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </header >

      {/* Mobile Menu & Overlay */}
      < div className={`site-header__overlay ${menuOpen ? 'site-header__overlay--open' : ''}`
      } onClick={() => setMenuOpen(false)} />

      < aside className={`mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`}>
        <nav className="mobile-menu__nav">
          {navLinks.map(link => (
            <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setMenuOpen(false)}>
              {link.label}
            </NavLink>
          ))}
          {isAuthenticated && authNavLinks.map(link => (
            <NavLink key={link.to} to={link.to} onClick={() => setMenuOpen(false)}>
              {link.label}
            </NavLink>
          ))}
          <Link to="/propietarios" className="btn btn--secondary btn--full" onClick={() => setMenuOpen(false)}>
            Vender tu vivienda
          </Link>
        </nav>
      </aside >
    </>
  );
};

export default Header;