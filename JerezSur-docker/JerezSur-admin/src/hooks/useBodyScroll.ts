import { useEffect } from 'react';

/**
 * Hook que bloquea/desbloquea el scroll del body
 * Útil para modales, detalles y cualquier overlay
 */
export const useBodyScroll = (bloqueado: boolean) => {
  useEffect(() => {
    if (bloqueado) {
      // Guardar el scrollbar width antes de bloquearlo
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [bloqueado]);
};
