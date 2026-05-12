import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Contact from './pages/Contacto';
import SobreNosotros from './pages/SobreNosotros';
import Vender from './pages/Vender';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/ScrollToTop';
import './styles/App.scss';
import Inmuebles from './pages/Inmuebles';
import Auth from './pages/Auth';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useEffect } from 'react';
import Onboarding from './pages/Onboarding';

const clientGGId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const clientFBId = import.meta.env.VITE_FACEBOOK_APP_ID;
const clientAPId = import.meta.env.VITE_APPLE_CLIENT_ID;

function App() {
  useEffect(() => {
    // Inicialización de Facebook SDK
    if ((window as any).FB) {
      (window as any).FB.init({
        appId      : clientFBId,
        cookie     : true,
        xfbml      : true,
        version    : 'v18.0'
      });
    }
    
    // Inicialización de Apple (AppleID.auth.init)
    if ((window as any).AppleID) {
        (window as any).AppleID.auth.init({
            clientId : 'com.jerezsur.client',
            scope : 'name email',
            redirectURI : clientAPId,
            usePopup : true
        });
    }
  }, []);

  return (
    <GoogleOAuthProvider clientId={clientGGId}>
    <Router>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contacto" element={<Contact />} />
        <Route path="/sobre-nosotros" element={<SobreNosotros />} />
        <Route path="/propietarios" element={<Vender />} />
        <Route path="/inmuebles" element={<Inmuebles />} />
        <Route path="/acceder" element={<Auth />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Routes>
      <Footer />
    </Router>
    </GoogleOAuthProvider>
  );
}

export default App;