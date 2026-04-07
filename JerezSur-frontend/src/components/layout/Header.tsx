import { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import logo from '../../assets/imgs/LogoAncho.png';
import '../../styles/Header.scss';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}>
      <div className="site-header__container">
        <Link to="/" className="site-header__logo" onClick={closeMenu}>
          <img src={logo} alt="JerezSur Inmobiliaria" />
        </Link>

        <nav className="site-header__nav site-header__nav--desktop" aria-label="Navegación principal">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'is-active' : ''}>
            Inicio
          </NavLink>
          <NavLink to="/inmuebles" className={({ isActive }) => isActive ? 'is-active' : ''}>
            Inmuebles
          </NavLink>
          <NavLink to="/propietarios" className={({ isActive }) => isActive ? 'is-active' : ''}>
            Vender
          </NavLink>
          <NavLink to="/sobre-nosotros" className={({ isActive }) => isActive ? 'is-active' : ''}>
            Sobre nosotros
          </NavLink>
          <NavLink to="/contacto" className={({ isActive }) => isActive ? 'is-active' : ''}>
            Contacto
          </NavLink>
        </nav>

        <div className="site-header__actions site-header__actions--desktop">
          <Link to="/propietarios" className="btn btn--secondary">
            Acceder
          </Link>
        </div>

        <button
          className={`site-header__toggle ${menuOpen ? 'is-open' : ''}`}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`} id="mobile-menu">
        <nav className="mobile-menu__nav" aria-label="Navegación móvil">
          <NavLink to="/" end onClick={closeMenu}>
            Inicio
          </NavLink>
          <NavLink to="/inmuebles" onClick={closeMenu}>
            Inmuebles
          </NavLink>
          <NavLink to="/propietarios" onClick={closeMenu}>
            Propietarios
          </NavLink>
          <NavLink to="/sobre-nosotros" onClick={closeMenu}>
            Sobre nosotros
          </NavLink>
          <NavLink to="/contacto" onClick={closeMenu}>
            Contacto
          </NavLink>
          <NavLink to="/login" onClick={closeMenu}>
            Acceder
          </NavLink>

          <Link to="/propietarios" className="btn btn--secondary btn--full" onClick={closeMenu}>
            Vender tu vivienda
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;