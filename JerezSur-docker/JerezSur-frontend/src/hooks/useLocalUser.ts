// Hook para acceder al usuario guardado en localStorage.
// Alternativa al AuthContext cuando el componente no está dentro del Provider.
import { useState, useCallback } from 'react';
import { getStoredUser, updateStoredUser, clearSession } from '../utils/storage';
import type { StoredUser } from '../types/user';

export function useLocalUser() {
  const [user, setUser] = useState<StoredUser | null>(() => getStoredUser());

  // Actualiza campos específicos del usuario en localStorage y en el estado local
  const updateUser = useCallback((updates: Partial<StoredUser>) => {
    const current = getStoredUser();
    if (!current) return;
    updateStoredUser(updates);
    setUser({ ...current, ...updates });
  }, []);

  // Cierra la sesión limpiando localStorage y redirigiendo al login
  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    window.location.href = '/acceder';
  }, []);

  // Recarga el usuario desde localStorage (útil después de actualizaciones externas)
  const reload = useCallback(() => {
    setUser(getStoredUser());
  }, []);

  return { user, updateUser, logout, reload };
}
