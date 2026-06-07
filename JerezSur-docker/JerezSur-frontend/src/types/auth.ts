// Tipos para los flujos de autenticación del frontend público de JerezSur

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  trabajadorId?: number;
  nombre: string;
  email: string;
  role: string;
  esTrabajador: boolean;
}

export interface RegistroRequest {
  nombre: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  password: string;
}

export interface SocialAuthRequest {
  token: string;
  email?: string;
  name?: string;
}
