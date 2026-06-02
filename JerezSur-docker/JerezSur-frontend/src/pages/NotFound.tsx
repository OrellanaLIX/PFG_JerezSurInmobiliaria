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
        <span className="not-found__code">404</span>
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
