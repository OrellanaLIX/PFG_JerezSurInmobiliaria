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

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contacto" element={<Contact />} />
        <Route path="/sobre-nosotros" element={<SobreNosotros />} />
        <Route path="/propietarios" element={<Vender />} />
        <Route path="/inmuebles" element={<Inmuebles />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;