// Hook que gestiona los mensajes de contacto en el panel admin.
// Carga todos los mensajes al montarse y expone funciones para actualizar o eliminar cada uno.
import { useState, useEffect, useCallback } from 'react';
import { contactoService } from '../services/contactoService';
import type { MensajeContacto, NuevoMensajeContacto, MensajeContactoDetalle } from '../types/contacto';

export const useContactos = () => {
  const [contactos, setContactos] = useState<MensajeContacto[]>([]);
  const [contactoSeleccionado, setContactoSeleccionado] = useState<MensajeContactoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contactoService.getTodos();
      setContactos(data);
    } catch {
      setError('Error al cargar la bandeja de mensajes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const cargarDetalle = async (id: number) => {
    try {
      setLoadingDetalle(true);
      const data = await contactoService.getPorId(id);
      setContactoSeleccionado(data);
      
      // Lógica UX: Si abren el mensaje y está como no leído, lo marcamos 
      // automáticamente como leído en el backend usando nuestro PUT unificado
      if (!data.leido) {
        await contactoService.actualizar(id, { leido: true });
        await cargar(); // Refrescamos la lista de fondo para quitar el indicador de "nuevo"
      }
    } catch {
      setError('Error al abrir la consulta del cliente');
    } finally {
      setLoadingDetalle(false);
    }
  };

  const limpiarSeleccionado = () => setContactoSeleccionado(null);

  const crear = async (contacto: NuevoMensajeContacto) => {
    await contactoService.crear(contacto);
    await cargar();
  };

  const actualizar = async (id: number, contactoData: Partial<MensajeContactoDetalle>) => {
    await contactoService.actualizar(id, contactoData);
    await cargar();
    if (contactoSeleccionado?.id === id) {
      await cargarDetalle(id);
    }
  };

  const eliminar = async (id: number) => {
    await contactoService.eliminar(id);
    await cargar();
  };

  return {
    contactos,
    contactoSeleccionado,
    loading,
    loadingDetalle,
    error,
    cargar,
    cargarDetalle,
    limpiarSeleccionado,
    crear,
    actualizar,
    eliminar,
  };
};