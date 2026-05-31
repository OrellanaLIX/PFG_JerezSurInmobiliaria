export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  nombre: string;
  email: string;
  role: string;
  esTrabajador: boolean;
}

export interface AuthUser {
  userId: number;
  nombre: string;
  email: string;
  role: string;
}