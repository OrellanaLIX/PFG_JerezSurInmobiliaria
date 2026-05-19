import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

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
        <Route path="/acceder" element={<Auth />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/perfil" element={<Profile />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;