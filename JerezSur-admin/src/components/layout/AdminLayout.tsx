import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Calendar, LogOut, Home } from 'lucide-react';
import '../../styles/layout/AdminLayout.scss';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      logout();
    }
  };

  return (
    <div className="admin-layout">
      {/* ───── SIDEBAR ───── */}
      <aside className="admin-layout__sidebar">
        <div className="admin-layout__brand" onClick={() => navigate('/resumen')}>
          <Home size={24} />
          <span>JerezSur Admin</span>
        </div>

        <nav className="admin-layout__nav">
          <NavLink 
            to="/resumen" 
            className={({ isActive }) => `admin-layout__nav-link ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
          <NavLink 
            to="/citas" 
            className={({ isActive }) => `admin-layout__nav-link ${isActive ? 'active' : ''}`}
          >
            <Calendar size={20} />
            Citas
          </NavLink>
          {/* Añadir más módulos en el futuro */}
        </nav>
      </aside>

      {/* ───── CONTENIDO PRINCIPAL ───── */}
      <div className="admin-layout__content-wrapper">
        {/* HEADER */}
        <header className="admin-layout__header">
          <div className="admin-layout__user-menu">
            {user && (
              <div className="user-info">
                <span className="name">{user.nombre}</span>
                <span className="role">{user.role?.replace('ROLE_', '').toLowerCase()}</span>
              </div>
            )}
            <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* MAIN */}
        <main className="admin-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};