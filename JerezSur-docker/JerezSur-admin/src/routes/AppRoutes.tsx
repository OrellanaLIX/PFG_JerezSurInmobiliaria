// Rutas del panel de administración.
// Usa basename="/admin" para que todas las rutas empiecen por /admin (ej: /admin/resumen)
// lo que permite distinguirlas del frontend público que sirve desde la raíz /.
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import AdminUsuarios from '../pages/AdminUsuarios';
import AdminContactos from '../pages/AdminContactos';
import AdminInmuebles from '../pages/AdminInmuebles';
import AdminContratos from '../pages/AdminContratos';
import AdminDestacados from '../pages/AdminDestacados';

// lazy() carga el componente solo cuando se necesita (code splitting)
// Así el panel de login carga rápido y el resto se descarga cuando el trabajador entra
const Login = lazy(() => import('../pages/Auth'));
const DashboardResumen = lazy(() => import('../pages/DashboardResume'));
const AdminCitas = lazy(() => import('../pages/AdminCitas'));

// Componente que se muestra mientras carga un módulo lazy
const PageLoader = () => <div>Cargando...</div>;

export const AppRoutes = () => {
  return (
    // basename="/admin" → todas las rutas internas son relativas a /admin
    <BrowserRouter basename="/admin">
      {/* Suspense muestra el PageLoader mientras los módulos lazy se descargan */}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Ruta pública — accesible sin estar logueado */}
          <Route path="/login" element={<Login />} />

          {/* ProtectedRoute comprueba que hay sesión activa; si no, redirige al login */}
          <Route element={<ProtectedRoute />}>
            {/* AdminLayout añade el menú lateral y la cabecera del panel a todas las rutas hijas */}
            <Route path="/" element={<AdminLayout />}>
              {/* La ruta raíz /admin redirige automáticamente al resumen */}
              <Route index element={<Navigate to="/resumen" replace />} />
              <Route path="resumen" element={<DashboardResumen />} />
              <Route path="citas" element={<AdminCitas />} />
              <Route path="usuarios" element={<AdminUsuarios />} />
              <Route path="contactos" element={<AdminContactos />} />
              <Route path="inmuebles" element={<AdminInmuebles />} />
              <Route path="destacados" element={<AdminDestacados />} />
              <Route path="contratos" element={<AdminContratos />} />
            </Route>
          </Route>

          {/* Cualquier ruta desconocida del admin vuelve al resumen */}
          <Route path="*" element={<Navigate to="/resumen" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};