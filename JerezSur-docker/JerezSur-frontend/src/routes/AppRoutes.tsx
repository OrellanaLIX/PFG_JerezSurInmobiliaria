import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Contact from '../pages/Contacto';
import SobreNosotros from '../pages/SobreNosotros';
import Vender from '../pages/Vender';
import Inmuebles from '../pages/Inmuebles';
import InmuebleDetalle from '../pages/InmuebleDetalle';
import MisCitas from '../pages/MisCitas';
import Auth from '../pages/Auth';
import Onboarding from '../pages/Onboarding';
import Profile from '../pages/Profile';
import { PublicLayout } from '../components/layout/PublicLayout';

export const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/sobre-nosotros" element={<SobreNosotros />} />
          <Route path="/propietarios" element={<Vender />} />
          <Route path="/inmuebles" element={<Inmuebles />} />
          <Route path="/inmuebles/:id" element={<InmuebleDetalle />} />
          <Route path="/mis-citas" element={<MisCitas />} />
          <Route path="/acceder" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/perfil" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
};
