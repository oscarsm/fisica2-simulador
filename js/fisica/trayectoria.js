import { numeroValido, positivo } from './constantes.js';
import { vector, suma, escalar } from './vector.js';

function estadoValido(estado) {
  if (!estado?.posicion || !estado?.velocidad) throw new TypeError('El estado requiere posición y velocidad');
  return {
    posicion: vector(estado.posicion.x, estado.posicion.y, estado.posicion.z),
    velocidad: vector(estado.velocidad.x, estado.velocidad.y, estado.velocidad.z)
  };
}

export function avanzar(estado, campo, carga, masa, tiempo) {
  const actual = estadoValido(estado);
  const dt = numeroValido(tiempo, 'tiempo');
  if (dt < 0) throw new RangeError('tiempo no puede ser negativo');
  const aceleracion = escalar(vector(campo.x, campo.y, campo.z), numeroValido(carga, 'carga') / positivo(masa, 'masa'));
  return {
    posicion: suma(actual.posicion, escalar(actual.velocidad, dt)),
    velocidad: suma(actual.velocidad, escalar(aceleracion, dt))
  };
}

export function simularTrayectoria(estadoInicial, campo, carga, masa, paso, pasos) {
  const dt = numeroValido(paso, 'paso');
  const total = numeroValido(pasos, 'pasos');
  if (dt <= 0 || !Number.isInteger(total) || total < 0) throw new RangeError('paso debe ser positivo y pasos un entero no negativo');
  const trayectoria = [estadoValido(estadoInicial)];
  for (let indice = 0; indice < total; indice += 1) {
    trayectoria.push(avanzar(trayectoria[indice], campo, carga, masa, dt));
  }
  return trayectoria;
}

export default { avanzar, simularTrayectoria };
