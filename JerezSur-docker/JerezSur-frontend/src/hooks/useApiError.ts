// Hook para gestionar errores de API de forma consistente en toda la app.
// Evita repetir el mismo patrón de try/catch en cada componente.
import { useState, useCallback } from 'react';

export function useApiError() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Registra un error de cualquier tipo como string legible
  const handleError = useCallback((err: unknown) => {
    if (err instanceof Error) {
      setError(err.message);
    } else if (typeof err === 'string') {
      setError(err);
    } else {
      setError('Ha ocurrido un error inesperado.');
    }
  }, []);

  // Limpia el error actual
  const clearError = useCallback(() => setError(null), []);

  // Ejecuta una función async manejando loading y errores automáticamente
  const run = useCallback(async <T>(fn: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    clearError();
    try {
      const result = await fn();
      return result;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearError, handleError]);

  return { error, loading, handleError, clearError, run };
}
