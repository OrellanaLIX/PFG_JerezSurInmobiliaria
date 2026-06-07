// Funciones de formateo reutilizables en todo el frontend público de JerezSur

/**
 * Formatea un número como precio en euros con separador de miles en formato español.
 * Si el inmueble es de alquiler añade '/mes' porque el precio es mensual, no de compra.
 */
export function formatPrecio(precio: number, operacion?: string): string {
  const formatted = new Intl.NumberFormat('es-ES').format(precio);
  return operacion === 'ALQUILER' ? `${formatted} €/mes` : `${formatted} €`;
}

/**
 * Convierte una fecha ISO 8601 a texto legible con fecha y hora en español.
 * Usamos toLocaleString en lugar de una librería externa para no añadir dependencias.
 * El try/catch evita que un valor inválido rompa el componente que la llama.
 */
export function formatFecha(fechaISO: string): string {
  try {
    return new Date(fechaISO).toLocaleString('es-ES', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return fechaISO;
  }
}

// Formatea solo la fecha (sin hora) en español
export function formatFechaSolo(fechaISO: string): string {
  try {
    return new Date(fechaISO).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  } catch {
    return fechaISO;
  }
}

// Convierte texto a slug URL-friendly (para usar en rutas o IDs)
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Genera la URL de "añadir evento" de Google Calendar con los datos de una cita.
 * La duración del evento se fija a 1 hora porque no tenemos duración real en el modelo.
 * El formato de fechas que exige Google Calendar es YYYYMMDDTHHmmss (sin guiones ni puntos).
 */
export function buildGoogleCalendarUrl(
  titulo: string,
  descripcion: string,
  lugar: string,
  fechaHoraISO: string
): string {
  const dt = new Date(fechaHoraISO);
  const end = new Date(dt.getTime() + 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  const fmt = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const params = new URLSearchParams({
    action: 'TEMPLATE', text: titulo,
    details: descripcion, location: lugar,
    dates: `${fmt(dt)}/${fmt(end)}`,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

// Trunca un texto a un máximo de caracteres añadiendo "..."
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
