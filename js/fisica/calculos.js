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

/** Resistencia equivalente de varias resistencias conectadas en paralelo. */
export function calcularResistenciaParalelo(resistencias) {
  const valores = resistencias.map(Number).filter((resistencia) => resistencia > 0);
  if (valores.length === 0) return 0;
  return 1 / valores.reduce((total, resistencia) => total + 1 / resistencia, 0);
}

/**
 * Resuelve circuitos de dos o tres resistencias.
 * La topología mixta es R1 en serie con el paralelo R2 || R3.
 */
export function calcularCircuitoResistivo(tipo, voltajeV, resistencias) {
  const valores = resistencias.map((resistencia) => Math.max(0, Number(resistencia)));
  const voltaje = Math.max(0, Number(voltajeV));
  const [r1 = 0, r2 = 0, r3 = 0] = valores;
  let resistenciaTotal = 0;
  let corrientes = [0, 0, 0];
  let voltajes = [0, 0, 0];

  if (tipo === "paralelo") {
    resistenciaTotal = calcularResistenciaParalelo([r1, r2, r3]);
    const corrienteTotal = calcularCorriente(voltaje, resistenciaTotal);
    corrientes = valores.map((resistencia) => calcularCorriente(voltaje, resistencia));
    voltajes = valores.map(() => voltaje);
    return {
      resistenciaTotal,
      corrienteTotal,
      potenciaTotal: voltaje * corrienteTotal,
      corrientes,
      voltajes,
      potencias: corrientes.map((corriente, indice) => voltajes[indice] * corriente)
    };
  }

  if (tipo === "mixto") {
    const paralelo = calcularResistenciaParalelo([r2, r3]);
    resistenciaTotal = r1 + paralelo;
    const corrienteTotal = calcularCorriente(voltaje, resistenciaTotal);
    const voltajeParalelo = corrienteTotal * paralelo;
    corrientes = [corrienteTotal, calcularCorriente(voltajeParalelo, r2), calcularCorriente(voltajeParalelo, r3)];
    voltajes = [corrienteTotal * r1, voltajeParalelo, voltajeParalelo];
    return {
      resistenciaTotal,
      corrienteTotal,
      potenciaTotal: voltaje * corrienteTotal,
      corrientes,
      voltajes,
      potencias: corrientes.map((corriente, indice) => voltajes[indice] * corriente)
    };
  }

  resistenciaTotal = valores.reduce((total, resistencia) => total + resistencia, 0);
  const corrienteTotal = calcularCorriente(voltaje, resistenciaTotal);
  corrientes = valores.map(() => corrienteTotal);
  voltajes = valores.map((resistencia) => corrienteTotal * resistencia);
  return {
    resistenciaTotal,
    corrienteTotal,
    potenciaTotal: voltaje * corrienteTotal,
    corrientes,
    voltajes,
    potencias: corrientes.map((corriente, indice) => voltajes[indice] * corriente)
  };
}
