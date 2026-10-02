/** Constantes y utilidades comunes para los módulos de Física 2. */
export const PERMITIVIDAD_VACIO = 8.8541878128e-12; // F/m
export const CONSTANTE_COULOMB = 1 / (4 * Math.PI * PERMITIVIDAD_VACIO); // N m²/C²
export const CARGA_ELEMENTAL = 1.602176634e-19; // C
export const MASA_ELECTRON = 9.1093837015e-31; // kg
export const MASA_PROTON = 1.67262192369e-27; // kg

export function numeroValido(valor, nombre = 'valor') {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) {
    throw new TypeError(`${nombre} debe ser un número finito`);
  }
  return numero;
}

export function positivo(valor, nombre = 'valor') {
  const numero = numeroValido(valor, nombre);
  if (numero <= 0) throw new RangeError(`${nombre} debe ser mayor que cero`);
  return numero;
}

export function noNegativo(valor, nombre = 'valor') {
  const numero = numeroValido(valor, nombre);
  if (numero < 0) throw new RangeError(`${nombre} no puede ser negativo`);
  return numero;
}
