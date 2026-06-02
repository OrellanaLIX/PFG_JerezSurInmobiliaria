// Fichero central de rutas del frontend público.
// Todas las rutas están envueltas en PublicLayout, que añade Header y Footer automáticamente.
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Contact from '../pages/Contacto';
import SobreNosotros from '../pages/SobreNosotros';
import Vender from '../pages/Vender';
import Inmuebles from '../pages/Inmuebles';
import InmuebleDetalle from '../pages/InmuebleDetalle';
import MisCitas from '../pages/MisCitas';
import RecuperarPassword from '../pages/RecuperarPassword';
import Auth from '../pages/Auth';
import Onboarding from '../pages/Onboarding';
import Profile from '../pages/Profile';
import NotFound from '../pages/NotFound';
import CitaAnonima from '../pages/CitaAnonima';
import { PublicLayout } from '../components/layout/PublicLayout';

export const AppRoutes = () => {
  return (
    <Router>
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
    </Router>
  );
};
