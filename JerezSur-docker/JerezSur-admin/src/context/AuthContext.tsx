// Context de autenticación del panel de administración.
// Comparte el estado de sesión (usuario logueado, cargando, etc.) con todos los componentes
// del admin sin necesidad de pasar props por cada nivel del árbol de componentes.
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { authService } from '../services/authService';
import type { AuthUser, LoginRequest } from '../types/auth';

// Define qué datos y funciones expone el contexto a los componentes que lo usen
interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

// Creamos el contexto con null por defecto (se rellenará cuando el Provider lo envuelva)
const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Inicializamos el usuario desde localStorage para que la sesión persista al recargar
  const [user, setUser] = useState<AuthUser | null>(() => authService.getUser());
  // isLoading nos sirve para mostrar un spinner mientras esperamos la respuesta del backend
  const [isLoading, setIsLoading] = useState(false);

  // useCallback evita que la función se recree en cada render (optimización)
  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      // Guardamos en el estado solo los campos que necesitamos en el frontend
      setUser({
        userId: response.userId,
        nombre: response.nombre,
        email: response.email,
        role: response.role,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Al cerrar sesión borramos localStorage y redirigimos al login del admin
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    window.location.href = '/admin/login';
  }, []);

  // useMemo evita crear un nuevo objeto en cada render, lo que provocaría re-renders innecesarios
  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  }), [user, isLoading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto de forma limpia en cualquier componente del admin
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};