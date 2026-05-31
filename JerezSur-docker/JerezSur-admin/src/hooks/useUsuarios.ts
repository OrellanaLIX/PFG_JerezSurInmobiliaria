import { useState, useEffect, useCallback } from 'react';
import { usuarioService } from '../services/usuarioService';
import type { Usuario } from '../types/usuario';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usuarioService.getTodos();
      setUsuarios(data);
    } catch {
      setError('Error al cargar la lista de usuarios');
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
      const data = await usuarioService.getPorId(id);
      setUsuarioSeleccionado(data);
    } catch {
      setError('Error al cargar el detalle');
    } finally {
      setLoadingDetalle(false);
    }
  };

  const limpiarSeleccionado = () => setUsuarioSeleccionado(null);

  const crear = async (usuario: any) => {
    await usuarioService.crear(usuario);
    await cargar();
  };

  // 👇 1. ASEGÚRATE DE QUE ESTA FUNCIÓN ESTÁ AQUÍ DEFINIDA
  const actualizar = async (id: number, usuarioData: Partial<Usuario>) => {
    await usuarioService.actualizar(id, usuarioData);
    await cargar(); // Recarga la lista general tras el PUT
    if (usuarioSeleccionado?.id === id) {
      await cargarDetalle(id); // Recarga el modal si estaba abierto
    }
  };

  const eliminar = async (id: number) => {
    await usuarioService.eliminar(id);
    await cargar();
  };

  // 👇 2. EL ERROR SE QUITARÁ AL AÑADIR "actualizar" AQUÍ ABAJO
  return {
    usuarios,
    usuarioSeleccionado,
    loading,
    loadingDetalle,
    error,
    cargar,
    cargarDetalle,
    limpiarSeleccionado,
    crear,
    actualizar, // <--- Añade esto si faltaba
    eliminar,
  };
};