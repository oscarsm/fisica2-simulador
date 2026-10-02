import { CONSTANTE_COULOMB, numeroValido } from './constantes.js';
import { campoElectrico } from './campoElectrico.js';
import { vector, resta, magnitud, escalar } from './vector.js';

export function potencialDeCarga(carga, punto, constante = CONSTANTE_COULOMB) {
  const posicion = carga?.posicion ?? carga?.ubicacion;
  if (!posicion) throw new TypeError('La carga debe tener una posición');
  const distancia = magnitud(resta(vector(punto.x, punto.y, punto.z), vector(posicion.x, posicion.y, posicion.z)));
  if (distancia === 0) throw new RangeError('El potencial no está definido en la posición de la carga');
  return numeroValido(constante, 'constante') * numeroValido(carga.q ?? carga.carga, 'carga') / distancia;
}

export function potencialElectrico(cargas, punto, constante = CONSTANTE_COULOMB) {
  if (!Array.isArray(cargas)) throw new TypeError('cargas debe ser un arreglo');
  return cargas.reduce((total, carga) => total + potencialDeCarga(carga, punto, constante), 0);
}

export function diferenciaPotencial(cargas, puntoInicial, puntoFinal, constante = CONSTANTE_COULOMB) {
  return potencialElectrico(cargas, puntoFinal, constante) - potencialElectrico(cargas, puntoInicial, constante);
}

export function campoDesdePotencial(gradiente) {
  return escalar(vector(gradiente.x, gradiente.y, gradiente.z), -1);
}

export { campoElectrico };
export default { potencialDeCarga, potencialElectrico, diferenciaPotencial, campoDesdePotencial, campoElectrico };
