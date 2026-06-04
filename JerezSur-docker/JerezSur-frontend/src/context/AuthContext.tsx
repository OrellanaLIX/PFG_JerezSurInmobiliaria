// Context de autenticación para el frontend público.
//
// En React, un Context permite compartir datos entre componentes sin tener que
// pasarlos como props por todos los niveles del árbol. Aquí guardamos el usuario
// logueado para que cualquier componente sepa si hay sesión activa.
//
// El AuthProvider envuelve toda la app en AppRoutes.tsx y expone:
//   - user: datos del usuario (id, nombre, email, teléfono, token)
//   - isAuthenticated: true si hay usuario logueado
//   - login / logout: funciones para gestionar la sesión

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// Datos mínimos del usuario que necesitamos en el frontend
interface User {
  id: number;
  nombre: string;
  email?: string;
  telefono?: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  login:          (userData: User) => void;
  logout:         () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Al cargar la app comprobamos si ya había una sesión guardada en localStorage.
  // Esto permite que el usuario siga logueado aunque recargue la página.
  // localStorage persiste aunque se cierre y se abra el navegador de nuevo.
  useEffect(() => {
    const savedUser = localStorage.getItem('usuario');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        // Si el JSON está corrupto, limpiamos y empezamos de cero
        localStorage.removeItem('usuario');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    // Guardamos el usuario en localStorage para que persista entre recargas
    localStorage.setItem('usuario', JSON.stringify(userData));
    // El token se guarda por separado porque se manda en cada petición a la API
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    // Forzamos recarga completa para limpiar cualquier estado en memoria
    // y garantizar que el usuario no pueda navegar atrás con datos de sesión
    window.location.href = '/acceder';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de forma limpia.
// Si se usa fuera del AuthProvider lanza un error explicativo (útil en desarrollo).
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  return context;
};
