import type { Cita } from '../types/cita';

export interface DiaCalendario {
  fecha: Date;
  diaMes: number;
  esMesActual: boolean;
  esHoy: boolean;
  citas: Cita[];
}

/**
 * Genera la matriz de días para mostrar un mes completo (incluye días de
 * meses adyacentes para completar las semanas).
 */
export const generarMesCalendario = (
  año: number,
  mes: number,
  citas: Cita[]
): DiaCalendario[] => {
  const primerDiaMes = new Date(año, mes, 1);
  const ultimoDiaMes = new Date(año, mes + 1, 0);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Día de la semana del primer día (0=domingo, 1=lunes, ..., 6=sábado)
  // Lo ajustamos para que la semana empiece en LUNES
  let diaSemanaPrimer = primerDiaMes.getDay() - 1;
  if (diaSemanaPrimer < 0) diaSemanaPrimer = 6;

  const dias: DiaCalendario[] = [];

  // 1. Días del mes anterior para rellenar la primera semana
  for (let i = diaSemanaPrimer; i > 0; i--) {
    const fecha = new Date(año, mes, 1 - i);
    dias.push({
      fecha,
      diaMes: fecha.getDate(),
      esMesActual: false,
      esHoy: esMismoDia(fecha, hoy),
      citas: filtrarCitasPorDia(citas, fecha),
    });
  }

  // 2. Días del mes actual
  for (let d = 1; d <= ultimoDiaMes.getDate(); d++) {
    const fecha = new Date(año, mes, d);
    dias.push({
      fecha,
      diaMes: d,
      esMesActual: true,
      esHoy: esMismoDia(fecha, hoy),
      citas: filtrarCitasPorDia(citas, fecha),
    });
  }

  // 3. Días del mes siguiente para completar la última semana
  const diasRestantes = (7 - (dias.length % 7)) % 7;
  for (let i = 1; i <= diasRestantes; i++) {
    const fecha = new Date(año, mes + 1, i);
    dias.push({
      fecha,
      diaMes: i,
      esMesActual: false,
      esHoy: esMismoDia(fecha, hoy),
      citas: filtrarCitasPorDia(citas, fecha),
    });
  }

  return dias;
};

const esMismoDia = (a: Date, b: Date): boolean => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const filtrarCitasPorDia = (citas: Cita[], dia: Date): Cita[] => {
  return citas.filter((cita) => {
    const fechaCita = new Date(cita.fechaHora);
    return esMismoDia(fechaCita, dia);
  });
};

export const NOMBRES_MES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export const NOMBRES_DIA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

/**
 * Comprueba si una cita ya pasó (fechaHora < ahora).
 */
export const citaYaPasada = (cita: Cita): boolean => {
  return new Date(cita.fechaHora) < new Date();
};

/**
 * Formatea una fecha ISO a hora local "HH:mm".
 */
export const formatearHora = (isoString: string): string => {
  return new Date(isoString).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formatea una fecha ISO a "dd/MM/yyyy HH:mm".
 */
export const formatearFechaHora = (isoString: string): string => {
  return new Date(isoString).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Traduce el estado a texto legible.
 */
export const traducirEstado = (estado: string): string => {
  const map: Record<string, string> = {
    PENDIENTE_ASIGNACION: 'Pendiente',
    CONFIRMADA: 'Confirmada',
    COMPLETADA: 'Completada',
    CANCELADA: 'Cancelada',
    NO_PRESENTADO: 'No se presentó',
  };
  return map[estado] ?? estado;
};