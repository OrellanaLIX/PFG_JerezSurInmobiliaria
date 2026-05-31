import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import AdminUsuarios from '../pages/AdminUsuarios';
import AdminContactos from '../pages/AdminContactos';
import AdminInmuebles from '../pages/AdminInmuebles';
import AdminContratos from '../pages/AdminContratos';

const Login = lazy(() => import('../pages/Auth'));
const DashboardResumen = lazy(() => import('../pages/DashboardResume'));
const AdminCitas = lazy(() => import('../pages/AdminCitas'));

const PageLoader = () => <div>Cargando...</div>;

export const AppRoutes = () => {
  return (
    <BrowserRouter basename="/dashboard">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<Navigate to="/resumen" replace />} />
              <Route path="resumen" element={<DashboardResumen />} />
              <Route path="citas" element={<AdminCitas />} />
              <Route path="usuarios" element={<AdminUsuarios />} />
              <Route path="contactos" element={<AdminContactos />} />
              <Route path="inmuebles" element={<AdminInmuebles />} />
              <Route path="contratos" element={<AdminContratos />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/resumen" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};