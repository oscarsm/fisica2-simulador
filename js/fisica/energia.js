import { numeroValido, positivo } from './constantes.js';

export function energiaCapacitor(capacitancia, voltaje) {
  return 0.5 * positivo(capacitancia, 'capacitancia') * numeroValido(voltaje, 'voltaje') ** 2;
}

export function energiaDesdeCarga(carga, capacitancia) {
  return numeroValido(carga, 'carga') ** 2 / (2 * positivo(capacitancia, 'capacitancia'));
}

export function energiaDesdeCargaYVoltaje(carga, voltaje) {
  return 0.5 * numeroValido(carga, 'carga') * numeroValido(voltaje, 'voltaje');
}

export function voltajeDesdeEnergia(energia, capacitancia) {
  return Math.sqrt(2 * positivo(energia, 'energía') / positivo(capacitancia, 'capacitancia'));
}

export function cargaDesdeEnergia(energia, capacitancia) {
  return Math.sqrt(2 * positivo(energia, 'energía') * positivo(capacitancia, 'capacitancia'));
}

export default { energiaCapacitor, energiaDesdeCarga, energiaDesdeCargaYVoltaje, voltajeDesdeEnergia, cargaDesdeEnergia };
