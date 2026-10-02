import {
  calcularCapacitancia,
  calcularCorriente,
  calcularCorrienteSerie,
  calcularEnergia
} from "../fisica/calculos.js";

// Pruebas sencillas de regresión para los algoritmos físicos principales.
const pruebas = [
  ["capacitancia de aire", () => Math.abs(calcularCapacitancia(100, 2) - 4.427e-11) < 1e-14],
  ["energía almacenada", () => Math.abs(calcularEnergia(100e-6, 12) - 0.0072) < 1e-12],
  ["corriente en serie", () => calcularCorrienteSerie(12, 20, 30) === 0.24],
  ["ley de Ohm", () => calcularCorriente(12, 6) === 2]
];

const resultados = pruebas.map(([nombre, prueba]) => {
  try {
    return { nombre, correcto: Boolean(prueba()) };
  } catch (error) {
    return { nombre, correcto: false, error: error.message };
  }
});

const salida = document.querySelector("#resultados-pruebas");
const fallidas = resultados.filter((resultado) => !resultado.correcto);
salida.innerHTML = resultados.map((resultado) => `
  <li class="${resultado.correcto ? "correcta" : "fallida"}">
    ${resultado.correcto ? "✓" : "✗"} ${resultado.nombre}
    ${resultado.error ? `<small>${resultado.error}</small>` : ""}
  </li>
`).join("");
document.querySelector("#estado-pruebas").textContent =
  fallidas.length === 0 ? "Todas las pruebas pasaron." : `${fallidas.length} prueba(s) fallaron.`;
document.querySelector("#estado-pruebas").className = fallidas.length === 0 ? "correcta" : "fallida";
