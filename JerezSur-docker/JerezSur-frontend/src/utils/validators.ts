// Funciones de validación reutilizables en todo el frontend público de JerezSur

// Normaliza un DNI/NIE eliminando espacios y convirtiendo a mayúsculas
export function normalizeDni(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s/g, '');
}

// Normaliza un teléfono eliminando espacios, guiones y paréntesis
export function normalizePhone(raw: string): string {
  return raw.trim().replace(/[\s\-()]/g, '');
}

/**
 * Valida el formato visual del DNI/NIE (no el algoritmo matemático de la letra).
 * Acepta DNI (8 dígitos + letra) y NIE (X/Y/Z + 7 dígitos + letra).
 * La validación matemática completa es responsabilidad del backend para no duplicar lógica.
 */
export function validateDniFormat(raw: string): boolean {
  const v = normalizeDni(raw);
  return /^(\d{8}[A-Z]|[XYZ]\d{7}[A-Z])$/.test(v);
}

/**
 * Valida que el teléfono sea español: empieza por 6, 7, 8 o 9 (móvil y fijo)
 * con prefijo +34 opcional. Normalizamos antes para quitar espacios y guiones.
 */
export function validatePhone(raw: string): boolean {
  return /^(\+34)?[6789]\d{8}$/.test(normalizePhone(raw));
}

/**
 * Valida el formato de un email solo si hay valor. Si está vacío devuelve true
 * porque en varios formularios el email es opcional (el teléfono lo sustituye).
 */
export function validateEmail(v: string): boolean {
  if (!v?.trim()) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

// Valida que una contraseña tenga al menos 8 caracteres
export function validatePassword(v: string): boolean {
  return v.length >= 8;
}

// Valida que dos contraseñas coincidan
export function passwordsMatch(pass1: string, pass2: string): boolean {
  return pass1 === pass2;
}
