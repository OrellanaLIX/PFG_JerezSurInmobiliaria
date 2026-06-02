// Servicio de usuarios del panel admin: peticiones al backend para el CRUD de usuarios.
// También gestiona la creación de perfiles de trabajador, interesado y vendedor.
import api from './api';
import type { Usuario, NuevoUsuario, UsuarioDetalle } from '../types/usuario';

type RolPerfil = 'ninguno' | 'trabajador' | 'interesado' | 'vendedor' | 'ambos';

interface DatosTrabajador {
  dni: string;
  cargo: string;
  fechaInicioContrato: string;
  fechaFinContrato?: string;
  observacionesLaborales?: string;
}

interface DatosInteresado {
  presupuestoMaximo?: number;
  zonaInteres?: string;
  habitacionesMinimas?: number;
  banosMinimos?: number;
  tipoBusqueda?: 'VENTA' | 'ALQUILER' | 'CUALQUIERA';
  requiereHipoteca?: boolean;
  observaciones?: string;
}

interface DatosVendedor {
  observaciones?: string;
}

export interface NuevoUsuarioConPerfil extends NuevoUsuario {
  rol: RolPerfil;
  datosTrabajador?: DatosTrabajador;
  datosInteresado?: DatosInteresado;
  datosVendedor?: DatosVendedor;
}

export const usuarioService = {
  getTodos: async (): Promise<Usuario[]> => {
    const { data } = await api.get<Usuario[]>('/usuarios');
    return data;
  },

  getPorId: async (id: number): Promise<UsuarioDetalle> => {
    const { data } = await api.get<UsuarioDetalle>(`/usuarios/${id}`);
    return data;
  },

  crear: async (usuario: NuevoUsuarioConPerfil): Promise<Usuario> => {
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
    const creado = data;

    if (usuario.rol && usuario.rol !== 'ninguno') {
      const perfilPayload: any = {
        role: usuario.rol === 'ambos' ? 'ROLE_AMBOS' : `ROLE_${usuario.rol.toUpperCase()}`,
        perfil:
          usuario.rol === 'trabajador' ? 'trabajador' :
          usuario.rol === 'interesado' ? 'interesado' :
          usuario.rol === 'vendedor' ? 'propietario' :
          usuario.rol === 'ambos' ? 'ambos' : undefined,
      };

      if (usuario.datosTrabajador && ['trabajador', 'ambos'].includes(usuario.rol)) {
        perfilPayload.dniTrabajador = usuario.datosTrabajador.dni;
        perfilPayload.cargo = usuario.datosTrabajador.cargo;
        perfilPayload.fechaInicioContrato = usuario.datosTrabajador.fechaInicioContrato;
        perfilPayload.fechaFinContrato = usuario.datosTrabajador.fechaFinContrato;
        perfilPayload.observacionesLaborales = usuario.datosTrabajador.observacionesLaborales;
        perfilPayload.activoTrabajador = true;
      }

      if (usuario.datosInteresado && ['interesado', 'ambos'].includes(usuario.rol)) {
        perfilPayload.presupuestoMaximo = usuario.datosInteresado.presupuestoMaximo;
        perfilPayload.zonaInteres = usuario.datosInteresado.zonaInteres;
        perfilPayload.habitacionesMinimas = usuario.datosInteresado.habitacionesMinimas;
        perfilPayload.banosMinimos = usuario.datosInteresado.banosMinimos;
        perfilPayload.tipoOperacion = usuario.datosInteresado.tipoBusqueda;
        perfilPayload.requiereHipoteca = usuario.datosInteresado.requiereHipoteca;
        perfilPayload.observacionesInteresado = usuario.datosInteresado.observaciones;
      }

      if (usuario.datosVendedor && ['vendedor', 'ambos'].includes(usuario.rol)) {
        perfilPayload.observacionesVendedor = usuario.datosVendedor.observaciones;
      }

      await api.put<UsuarioDetalle>(`/usuarios/${creado.id}`, perfilPayload);
    }

    return creado;
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