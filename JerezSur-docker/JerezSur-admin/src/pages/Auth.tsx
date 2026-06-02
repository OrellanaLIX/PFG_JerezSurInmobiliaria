// Página de login del panel de administración.
// Solo permite acceder a usuarios con perfil de Trabajador (el backend lo verifica).
import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/Auth.scss';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Si ya está logueado, redirigir
  if (isAuthenticated) {
    return <Navigate to="/resumen" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login({ email, password });
      navigate('/resumen', { replace: true });
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(mensaje);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__container">
        <h1 className="auth-page__title">JerezSur Admin</h1>
        <h2 className="auth-page__subtitle">Iniciar sesión en tu cuenta</h2>

        <form className="auth-page__form" onSubmit={handleSubmit}>
          <div className="auth-page__field">
            <label>Email o Usuario</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
              placeholder="admin@jerezsur.com"
            />
          </div>

          <div className="auth-page__field">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="auth-page__error" role="alert">{error}</p>}

          <button className="auth-page__submit" type="submit" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar al Panel'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;