// ==========================================
// INTERFAZ DE USUARIO VINCULADO (Opcional pero común en arquitecturas Spring)
// ==========================================
export interface UsuarioVendedor {
  id: number;
  username: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  activo: boolean;
}

// ==========================================
// INTERFAZ PRINCIPAL (VENDEDOR / PROPIETARIO)
// ==========================================
export interface Vendedor {
  id: number;
  observaciones?: string;
  fechaAlta: string; // Habitualmente String formateado ISO o Date proveniente de la BD

  // 🌟 Relación con el usuario del sistema que gestiona o representa al vendedor
  usuario?: UsuarioVendedor;

  // Si en el backend manejas listas de inmuebles asociados de forma inversa:
  // inmueblesIds?: number[];
}

// ==========================================
// DTO PARA CREACIÓN / REGISTRO DE VENDEDOR
// ==========================================
export interface NuevoVendedor {
  observaciones?: string;
  
  // Si das de alta un vendedor vinculándolo a un usuario existente por ID:
  usuarioId?: number;

  // O si el formulario de alta de vendedor crea el usuario "al mismo tiempo":
  nuevoUsuario?: Omit<UsuarioVendedor, 'id' | 'activo'> & { password?: string };
}