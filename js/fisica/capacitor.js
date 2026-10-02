import { PERMITIVIDAD_VACIO, numeroValido, positivo } from './constantes.js';

export function capacitanciaPlacas(area, separacion, permitividad = PERMITIVIDAD_VACIO) {
  return numeroValido(permitividad, 'permitividad') * positivo(area, 'área') / positivo(separacion, 'separación');
}

export function capacitanciaConDielectrico(area, separacion, permitividadRelativa = 1) {
  return capacitanciaPlacas(area, separacion, PERMITIVIDAD_VACIO * positivo(permitividadRelativa, 'permitividad relativa'));
}

export function cargaCapacitor(capacitancia, voltaje) {
  return numeroValido(capacitancia, 'capacitancia') * numeroValido(voltaje, 'voltaje');
}

export function voltajeCapacitor(carga, capacitancia) {
  return numeroValido(carga, 'carga') / positivo(capacitancia, 'capacitancia');
}

export function capacitanciaEquivalenteParalelo(capacitores) {
  if (!Array.isArray(capacitores) || capacitores.length === 0) throw new TypeError('Se requiere un arreglo de capacitores');
  return capacitores.reduce((total, valor) => total + positivo(valor, 'capacitancia'), 0);
}

export function capacitanciaEquivalenteSerie(capacitores) {
  if (!Array.isArray(capacitores) || capacitores.length === 0) throw new TypeError('Se requiere un arreglo de capacitores');
  return 1 / capacitores.reduce((total, valor) => total + 1 / positivo(valor, 'capacitancia'), 0);
}

export default { capacitanciaPlacas, capacitanciaConDielectrico, cargaCapacitor, voltajeCapacitor, capacitanciaEquivalenteParalelo, capacitanciaEquivalenteSerie };
