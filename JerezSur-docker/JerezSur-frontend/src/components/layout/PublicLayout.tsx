// Layout compartido por todas las páginas públicas del frontend.
// Envuelve el contenido de cada página con el Header, Footer y los proveedores globales.
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import { ToastProvider } from '../ui/Toast';

export const PublicLayout = () => {
  return (
    // ToastProvider hace disponible el sistema de notificaciones emergentes en toda la app
    <ToastProvider>
      {/* ScrollToTop sube la página al inicio cada vez que el usuario navega a una nueva ruta */}
      <ScrollToTop />
      <Header />
      {/* id="main-content" es el destino del skip link del Header para accesibilidad */}
      {/* tabIndex={-1} permite que el skip link enfoque este elemento con teclado */}
      <main id="main-content" tabIndex={-1}>
        {/* Outlet renderiza el componente de la ruta activa (Home, Inmuebles, etc.) */}
        <Outlet />
      </main>
      <Footer />
    </ToastProvider>
  );
};
