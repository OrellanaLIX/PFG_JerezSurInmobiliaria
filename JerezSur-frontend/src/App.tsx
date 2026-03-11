import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.scss'; // Cambiado a .scss ya que usarás Sass

// Importaremos estos componentes a medida que los crees
import InmuebleList from './pages/InmuebleList';
// import FormularioOperacion from './pages/FormularioOperacion';
// import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* El Navbar se mantiene visible en todas las rutas */}
        <header>
          <nav className="navbar">
            <div className="logo">Jerez Sur Inmobiliaria</div>
            <ul>
              <li><a href="/">Inicio</a></li>
              <li><a href="/operaciones">Nueva Operación</a></li>
            </ul>
          </nav>
        </header>

        <main className="main-content">
          <Routes>
            {/* Ruta principal: Listado de Inmuebles */}
            <Route path="/" element={
              <section>
                <h1>Bienvenido a Jerez Sur</h1>
                <p>Cargando listado de inmuebles...</p>
                {<InmuebleList />}
              </section>
            } />

            {/* Ruta para el formulario de Alquiler/Venta */}
            <Route path="/operaciones" element={
              <section>
                <h1>Gestión de Operaciones</h1>
                <p>Aquí irá el formulario polimórfico.</p>
                {/* <FormularioOperacion /> */}
              </section>
            } />

            {/* Ruta para el login */}
            <Route path="/login" element={<h1>Acceso empleados</h1>} />
          </Routes>
        </main>

        <footer className="footer">
          <p>&copy; 2026 Jerez Sur Inmobiliaria - Gestión Profesional</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;