import { CONSTANTE_COULOMB, numeroValido } from './constantes.js';
import { vector, suma, resta, escalar, magnitud } from './vector.js';

function validarCarga(carga) {
  const posicion = carga?.posicion ?? carga?.ubicacion;
  if (!posicion) throw new TypeError('Cada carga debe tener una posición');
  return { q: numeroValido(carga.q ?? carga.carga, 'carga'), posicion: vector(posicion.x, posicion.y, posicion.z) };
}

export function campoDeCarga(carga, punto, constante = CONSTANTE_COULOMB) {
  const fuente = validarCarga(carga);
  const observacion = vector(punto.x, punto.y, punto.z);
  const desplazamiento = resta(observacion, fuente.posicion);
  const distancia = magnitud(desplazamiento);
  if (distancia === 0) throw new RangeError('El campo no está definido en la posición de la carga');
  return escalar(desplazamiento, numeroValido(constante, 'constante') * fuente.q / distancia ** 3);
}

export function campoElectrico(cargas, punto, constante = CONSTANTE_COULOMB) {
  if (!Array.isArray(cargas)) throw new TypeError('cargas debe ser un arreglo');
  return cargas.reduce((total, carga) => suma(total, campoDeCarga(carga, punto, constante)), vector());
}

export function fuerzaElectrica(carga, campo) {
  return escalar(vector(campo.x, campo.y, campo.z), numeroValido(carga, 'carga'));
}

export default { campoDeCarga, campoElectrico, fuerzaElectrica };
