// Servicio de citas para el frontend público de JerezSur.
// Gestiona las solicitudes de visita tanto de usuarios registrados como anónimos.
import api from './api';
import type { CitaDTO, NuevaCitaUsuario, NuevaCitaAnonima } from '../types/cita';

export const citaService = {
  // Pide una cita siendo usuario registrado — usa el endpoint autenticado
  solicitarComoUsuario: (data: NuevaCitaUsuario): Promise<CitaDTO> =>
    api.post<CitaDTO>('/citas/usuario/solicitar', data),

  // Pide una cita de forma anónima (sin cuenta) — usa el endpoint público
  solicitarAnonimo: (data: NuevaCitaAnonima): Promise<CitaDTO> =>
    api.post<CitaDTO>('/citas/solicitar', data),

  // Obtiene las citas del usuario logueado (busca por ID, email y teléfono)
  misCitas: (usuarioId: number): Promise<CitaDTO[]> =>
    api.get<CitaDTO[]>(`/citas/usuario/${usuarioId}`),
};
