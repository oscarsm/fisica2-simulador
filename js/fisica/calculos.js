// Funciones puras reutilizables del simulador.
// No acceden al DOM: reciben valores, aplican el algoritmo y devuelven resultados.

export const EPSILON_0 = 8.854e-12;

/** Limita un valor al intervalo indicado para evitar estados físicos inválidos. */
export function limitar(valor, minimo, maximo) {
  return Math.min(maximo, Math.max(minimo, valor));
}

/**
 * Algoritmo de placas paralelas:
 * C = kappa * epsilon_0 * A / d
 * A se recibe en cm² y d en mm para coincidir con los controles de la interfaz.
 */
export function calcularCapacitancia(areaCm2, distanciaMm, dielectrico = 1) {
  const areaM2 = Number(areaCm2) / 10000;
  const distanciaM = Number(distanciaMm) / 1000;
  if (areaM2 <= 0 || distanciaM <= 0 || dielectrico <= 0) return 0;
  return dielectrico * EPSILON_0 * areaM2 / distanciaM;
}

/** Algoritmo de energía electrostática almacenada: U = 1/2 * C * V². */
export function calcularEnergia(capacitanciaF, voltajeV) {
  return 0.5 * Number(capacitanciaF) * Number(voltajeV) ** 2;
}

/** Algoritmo de ley de Ohm para dos resistencias conectadas en serie. */
export function calcularCorrienteSerie(voltajeV, resistencia1Ohm, resistencia2Ohm) {
  const resistenciaTotal = Number(resistencia1Ohm) + Number(resistencia2Ohm);
  return resistenciaTotal > 0 ? Number(voltajeV) / resistenciaTotal : 0;
}

/** Algoritmo de ley de Ohm para una resistencia: I = V / R. */
export function calcularCorriente(voltajeV, resistenciaOhm) {
  const resistencia = Number(resistenciaOhm);
  return resistencia > 0 ? Number(voltajeV) / resistencia : 0;
}
