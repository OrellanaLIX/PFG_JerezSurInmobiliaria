import api from './api';
import type { Usuario, NuevoUsuario, UsuarioDetalle } from '../types/usuario';

export const usuarioService = {
  getTodos: async (): Promise<Usuario[]> => {
    const { data } = await api.get<Usuario[]>('/usuarios');
    return data;
  },

  getPorId: async (id: number): Promise<UsuarioDetalle> => {
    const { data } = await api.get<UsuarioDetalle>(`/usuarios/${id}`);
    return data;
  },

  crear: async (usuario: NuevoUsuario): Promise<Usuario> => {
    const payload = {
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      email: usuario.email,
      telefono: usuario.telefono,
      password: usuario.password,
      dni: usuario.dni,
      origen: usuario.origen
    };

    const { data } = await api.post<Usuario>('/usuarios/registro', payload);
    return data;
  },

  /**
   * UNIFICADO: Este PUT se encarga de actualizar datos de perfil,
   * cambiar el rol o activar/desactivar la cuenta.
   */
  actualizar: async (id: number, usuarioData: Partial<UsuarioDetalle>): Promise<UsuarioDetalle> => {
    const payload: any = {
      nombre: usuarioData.nombre,
      apellidos: usuarioData.apellidos,
      telefono: usuarioData.telefono,
      email: usuarioData.email,
      dni: usuarioData.dni,
      imagenPerfilUrl: usuarioData.imagenPerfilUrl,
      perfil: usuarioData.role
        ? usuarioData.role.includes('AMBOS')
          ? 'ambos'
          : usuarioData.role.includes('INTERESADO')
          ? 'interesado'
          : usuarioData.role.includes('VENDEDOR')
          ? 'propietario'
          : undefined
        : undefined,
      role: usuarioData.role,
      cuentaActivada: usuarioData.cuentaActivada,
      observacionesVendedor: usuarioData.vendedor?.observaciones,
      presupuestoMaximo: usuarioData.interesado?.presupuestoMaximo,
      zonaInteres: usuarioData.interesado?.zonaInteres,
      habitacionesMinimas: usuarioData.interesado?.habitacionesMinimas,
      banosMinimos: usuarioData.interesado?.banosMinimos,
      tipoOperacion: usuarioData.interesado?.tipoBusqueda,
      observacionesInteresado: usuarioData.interesado?.observaciones
    };

    const filteredPayload = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    );

    const { data } = await api.put<UsuarioDetalle>(`/usuarios/${id}`, filteredPayload);
    return data;
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`/usuarios/${id}`);
  }
};