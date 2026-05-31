import { useState } from 'react';
import { toast } from 'react-toastify';

interface UseFormSubmitOptions<T> {
  submitFn: (data: T) => Promise<void>;
  onSuccess?: () => void;
  successMessage?: string;
}

export const useFormSubmit = <T>() => {
  const [guardando, setGuardando] = useState(false);

  const ejecutarEnvio = async ({ submitFn, onSuccess, successMessage }: UseFormSubmitOptions<T>, data: T) => {
    setGuardando(true);
    try {
      // Ejecuta la función de backend/servicio que le pases
      await submitFn(data);
      
      // Lanza el mensaje estético de éxito
      toast.success(successMessage || '¡Guardado correctamente!');
      
      // Si existe la función de cerrar modal o cancelar, la ejecuta
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error en formulario:", error);
      
      // Extrae de forma limpia los errores complejos de Spring Boot como el de la contraseña
      const springBootMessage = error.response?.data?.message;
      const defaultMessage = "Ocurrió un error inesperado al procesar la solicitud.";
      
      toast.error(`Error: ${springBootMessage || defaultMessage}`);
    } finally {
      setGuardando(false);
    }
  };

  return { guardando, ejecutarEnvio };
};