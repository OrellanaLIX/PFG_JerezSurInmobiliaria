// Fichero central de rutas del frontend público.
// Todas las rutas están envueltas en PublicLayout, que añade Header y Footer automáticamente.
// React.lazy() + Suspense divide el bundle por ruta: el usuario solo descarga lo que visita.
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';

const Home             = lazy(() => import('../pages/Home'));
const Contact          = lazy(() => import('../pages/Contacto'));
const SobreNosotros    = lazy(() => import('../pages/SobreNosotros'));
const Vender           = lazy(() => import('../pages/Vender'));
const Inmuebles        = lazy(() => import('../pages/Inmuebles'));
const InmuebleDetalle  = lazy(() => import('../pages/InmuebleDetalle'));
const MisCitas         = lazy(() => import('../pages/MisCitas'));
const RecuperarPassword = lazy(() => import('../pages/RecuperarPassword'));
const Auth             = lazy(() => import('../pages/Auth'));
const Onboarding       = lazy(() => import('../pages/Onboarding'));
const Profile          = lazy(() => import('../pages/Profile'));
const NotFound         = lazy(() => import('../pages/NotFound'));
const CitaAnonima      = lazy(() => import('../pages/CitaAnonima'));

const PageLoader = () => (
  <div style={{
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <div style={{
      width: 40,
      height: 40,
      border: '3px solid #dce8f8',
      borderTop: '3px solid #00439c',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export const AppRoutes = () => {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* PublicLayout añade Header, Footer y ScrollToTop a todas las rutas hijas */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/contacto" element={<Contact />} />
            <Route path="/sobre-nosotros" element={<SobreNosotros />} />
            <Route path="/propietarios" element={<Vender />} />
            <Route path="/inmuebles" element={<Inmuebles />} />
            {/* :id es un parámetro dinámico que se lee con useParams() en InmuebleDetalle */}
            <Route path="/inmuebles/:id" element={<InmuebleDetalle />} />
            <Route path="/mis-citas" element={<MisCitas />} />
            <Route path="/acceder" element={<Auth />} />
            <Route path="/recuperar-password" element={<RecuperarPassword />} />
            {/* Onboarding: completar el perfil tras el primer login */}
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/perfil" element={<Profile />} />
            {/* Formulario de cita para usuarios sin cuenta */}
            <Route path="/pedir-cita" element={<CitaAnonima />} />
            {/* Ruta comodín: captura cualquier URL desconocida y muestra el error 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
};
