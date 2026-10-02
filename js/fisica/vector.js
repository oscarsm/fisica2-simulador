import { numeroValido } from './constantes.js';

export function vector(x = 0, y = 0, z = 0) {
  return { x: numeroValido(x, 'x'), y: numeroValido(y, 'y'), z: numeroValido(z, 'z') };
}

export function suma(a, b) {
  return vector(a.x + b.x, a.y + b.y, a.z + b.z);
}

export function resta(a, b) {
  return vector(a.x - b.x, a.y - b.y, a.z - b.z);
}

export function escalar(a, factor) {
  const valor = numeroValido(factor, 'factor');
  return vector(a.x * valor, a.y * valor, a.z * valor);
}

export function productoPunto(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function magnitud(a) {
  return Math.sqrt(productoPunto(a, a));
}

export function normalizar(a) {
  const longitud = magnitud(a);
  if (longitud === 0) throw new RangeError('No se puede normalizar el vector cero');
  return escalar(a, 1 / longitud);
}

export function distancia(a, b) {
  return magnitud(resta(a, b));
}

export function productoCruz(a, b) {
  return vector(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
}

export default { vector, suma, resta, escalar, productoPunto, magnitud, normalizar, distancia, productoCruz };
