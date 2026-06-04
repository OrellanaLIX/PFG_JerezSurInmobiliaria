import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import '../styles/NotFound.scss';

// Esta página se muestra cuando el usuario entra a una ruta que no existe
// React Router la activa con la ruta comodín path="*" en AppRoutes.tsx
const NotFound = () => {
  // Ponemos el título de la pestaña del navegador para que el buscador no lo indexe como error
  useSEO({
    title: 'Página no encontrada | JerezSur',
    description: 'La página que buscas no existe. Vuelve al inicio o explora nuestros inmuebles.',
  });

  return (
    <main className="not-found" id="main-content">
      <div className="not-found__container">
        {/* Ilustración circular con icono de casa y pregunta */}
        <div className="not-found__illustration" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        {/* El 404 grande es decorativo; el heading real es el h1 */}
        <span className="not-found__code" aria-hidden="true">404</span>
        <h1 className="not-found__title">Página no encontrada</h1>
        <p className="not-found__text">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <div className="not-found__actions">
          <Link to="/" className="btn btn--primary">Volver al inicio</Link>
          <Link to="/inmuebles" className="btn btn--outline">Ver inmuebles</Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
