import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Home from './pages/Home';
import ScrollToTop from './components/ScrollToTop';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Contact from './pages/Contacto';
import './styles/App.scss';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contacto" element={<Contact />} />
        </Routes>
      <Footer />
    </Router>
  );
}

export default App;