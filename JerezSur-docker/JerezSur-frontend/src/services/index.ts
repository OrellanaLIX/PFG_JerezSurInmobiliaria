// Barrel de servicios — re-exporta todos los servicios del frontend público
// Uso: import { inmuebleService, contactoService } from '../services'
export { default as api } from './api';
export { inmuebleService } from './inmuebleService';
export { citaService }     from './citaService';
export { contactoService } from './contactoService';
export { authService }     from './authService';
export { usuarioService }  from './usuarioService';
