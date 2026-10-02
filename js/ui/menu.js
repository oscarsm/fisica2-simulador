import {
  calcularCapacitancia,
  calcularCorriente,
  calcularCorrienteSerie,
  calcularEnergia
} from "../fisica/calculos.js";

// Configuración declarativa: añadir una unidad o módulo no requiere cambiar el renderizador.
const unidades = [
  { nombre: "Unidad 1 · Campo eléctrico", color: "#185FA5", icono: "ti-bolt", modulos: [
    ["cargas", "Visualizador de cargas puntuales", "Hasta 10 cargas, líneas de campo y equipotenciales en 2D/3D.", "ti-atom-2"],
    ["potencial", "Calculadora de potencial", "Potencial V en cualquier punto del espacio.", "ti-calculator"],
    ["trayectoria", "Simulador de trayectoria", "Trayectoria de una partícula cargada en un campo eléctrico.", "ti-route"]
  ]},
  { nombre: "Unidad 2 · Capacitores", color: "#0F6E56", icono: "ti-battery-charging", modulos: [
    ["capacitores", "Simulador de capacitores", "Cómo cambia C al variar área, distancia y dieléctrico.", "ti-battery-charging"],
    ["energia", "Calculadora de energía almacenada", "Energía según voltaje y capacitancia.", "ti-bulb"]
  ]},
  // { nombre: "Unidad 3 · Corriente y Ohm", color: "#BA7517", icono: "ti-plug", modulos: [
  //   ["circuitos", "Simulador de circuitos", "Resistencias en serie, paralelo y mixto.", "ti-resistor"],
  //   ["ohm", "Visualizador de ley de Ohm", "Relación entre V, I y R en tiempo real.", "ti-chart-line"]
  // ]},
  // { nombre: "Unidad 4 · Campo magnético", color: "#534AB7", icono: "ti-magnet", modulos: [
  //   ["magnetico", "Simulador de campo magnético", "Líneas de campo de imanes y corrientes.", "ti-magnet"],
  //   ["lorentz", "Simulador de fuerza de Lorentz", "Partícula en campos E y B cruzados.", "ti-rotate-clockwise"]
  // ]}
];

// Referencias de infraestructura de la SPA.
const nav = document.querySelector("#nav");
const principal = document.querySelector("#contenido-principal");
const ruta = document.querySelector("#ruta-actual");
const estilosFormulas = document.createElement("style");
estilosFormulas.textContent = ".pantalla-modulo{max-width:none;width:100%;padding:clamp(2rem,4vw,4rem) clamp(1rem,2.5vw,2.5rem)}.modulo-cuerpo{display:grid;grid-template-columns:minmax(0,1fr) 280px;align-items:start;gap:1.25rem;width:100%}.modulo-cuerpo>.experimento,.modulo-cuerpo>.tarjetas-opciones{width:100%;min-width:0}.formulas{position:sticky;top:1rem;border:1px solid var(--borde);border-radius:14px;padding:1.1rem;background:var(--superficie);box-shadow:var(--sombra)}.formulas h2{margin:0 0 .9rem;color:var(--texto);font-size:1rem}.formula{display:grid;grid-template-columns:1fr auto;gap:.3rem .5rem;border-top:1px solid var(--borde);padding:.75rem 0}.formula:first-of-type{border-top:0;padding-top:0}.formula strong{grid-column:1/-1;color:var(--muted);font-size:.7rem}.formula code{color:var(--c);font-family:Georgia,serif;font-size:.95rem;white-space:normal}.formula small{align-self:center;color:var(--muted);font-size:.65rem}.formulas p{margin:.8rem 0 0;color:var(--muted);font-size:.68rem;line-height:1.4}@media(max-width:1200px){.modulo-cuerpo{grid-template-columns:1fr}.formulas{position:static}.experimento{grid-template-columns:1fr;min-height:0}.experimento__visual{min-height:clamp(420px,55vw,620px)}.experimento__visual canvas{min-height:0}.experimento__controles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:start}.experimento__controles>.resultado:last-child{margin-top:0}}@media(max-width:850px){.formulas{display:grid;grid-template-columns:repeat(3,1fr);gap:.7rem}.formulas h2,.formulas p{grid-column:1/-1}.formula{border:1px solid var(--borde);border-radius:8px;padding:.7rem}.experimento__controles{display:flex}}@media(max-width:650px){.formulas{display:block}.formula{margin-top:.5rem}.experimento__visual{min-height:360px}}";
document.head.append(estilosFormulas);
// Estado global de navegación y simulaciones. Los cálculos puros viven en calculos.js.
let unidadAbierta = 0;
let unidadActual = unidades[0];
let estadoCargas = {
  cargas: [
    { x: 0.34, y: 0.5, signo: 1 },
    { x: 0.66, y: 0.5, signo: -1 }
  ],
  arrastrando: -1,
  configuracion: "",
  siguienteId: 3
};
const estadoVisual = {
  puntoPotencial: { x: 0.5, y: 0.33 },
  planoPotencial: "XY",
  trayectoria: { tiempo: 0, particula: "Electrón", velocidad: 2, campo: 500, carga: -1, animacion: 0 },
  energia: { fase: 0 },
  circuitos: { fase: 0, animacion: 0 },
  magnetico: { fase: 0, animacion: 0 }
};

// Algoritmo de navegación: mantiene una sola unidad abierta y un módulo activo.
function cerrarOtras(indice) {
  document.querySelectorAll(".unidad-nav").forEach((item, actual) => {
    if (actual !== indice) {
      item.classList.remove("open");
      item.classList.remove("active");
      item.querySelectorAll(".subnav__enlace.active").forEach((enlace) => enlace.classList.remove("active"));
      item.querySelector(".unidad-nav__cabecera").setAttribute("aria-expanded", "false");
    }
  });
}

// Renderizador de menú: construye la navegación desde la configuración declarativa.
function crearMenu() {
  unidades.forEach((unidad, indice) => {
    const contenedor = document.createElement("section");
    contenedor.className = "unidad-nav";
    contenedor.style.setProperty("--c", unidad.color);
    contenedor.innerHTML = `<button class="unidad-nav__cabecera" type="button" aria-expanded="false"><i class="unidad-nav__icono ti ${unidad.icono}" aria-hidden="true"></i><span class="unidad-nav__nombre">${unidad.nombre}</span><i class="unidad-nav__flecha ti ti-chevron-down" aria-hidden="true"></i></button><div class="subnav" role="menu"></div>`;
    const boton = contenedor.querySelector(".unidad-nav__cabecera");
    const subnav = contenedor.querySelector(".subnav");
    unidad.modulos.forEach(([id, titulo, descripcion, icono]) => {
      const enlace = document.createElement("a");
      enlace.className = "subnav__enlace";
      enlace.href = `#${id}`;
      enlace.innerHTML = `<i class="ti ${icono}" aria-hidden="true"></i><span><span class="subnav__texto">${titulo}</span><span class="subnav__descripcion">${descripcion}</span></span>`;
      enlace.addEventListener("click", (evento) => {
        evento.preventDefault();
        subnav.querySelectorAll(".subnav__enlace.active").forEach((activo) => activo.classList.remove("active"));
        enlace.classList.add("active");
        contenedor.classList.add("open", "active");
        boton.setAttribute("aria-expanded", "true");
        unidadAbierta = indice;
        cerrarOtras(indice);
        mostrarModulo(id, titulo, unidad);
      });
      subnav.append(enlace);
    });
    boton.addEventListener("click", () => {
      const abierto = contenedor.classList.contains("open");
      cerrarOtras(indice);
      contenedor.classList.toggle("open", !abierto);
      boton.setAttribute("aria-expanded", String(!abierto));
      unidadAbierta = indice;
    });
    nav.append(contenedor);
  });
}

// Composición de pantalla: une encabezado, experimento y fórmulas del módulo.
function pantallaBase(id, titulo, unidad, descripcion, contenido) {
  const formulas = {
    cargas: [["Campo de una carga", "E = k · |q| / r²", "N/C"], ["Superposición", "E_total = Σ Eᵢ", "N/C"], ["Constante", "k = 8.99 × 10⁹", "N·m²/C²"]],
    potencial: [["Potencial eléctrico", "V = k · q / r", "V"], ["Superposición", "V_total = Σ Vᵢ", "V"], ["Campo y potencial", "E = −∇V", "N/C"]],
    trayectoria: [["Fuerza eléctrica", "F = q · E", "N"], ["Segunda ley de Newton", "a = q · E / m", "m/s²"], ["Movimiento", "r(t) = r₀ + v₀t + ½at²", "m"]],
    capacitores: [["Capacitancia", "C = κ · ε₀ · A / d", "F"], ["Carga almacenada", "Q = C · V", "C"], ["Energía", "U = ½ · C · V²", "J"]],
    energia: [["Energía almacenada", "U = ½ · C · V²", "J"], ["Carga", "Q = C · V", "C"], ["Conversión", "1 J = 1000 mJ", "mJ"]],
    circuitos: [["Ley de Ohm", "V = I · R", "V"], ["Resistencia en serie", "R_total = R₁ + R₂", "Ω"], ["Corriente", "I = V / R_total", "A"]],
    ohm: [["Ley de Ohm", "I = V / R", "A"], ["Voltaje", "V = I · R", "V"], ["Potencia", "P = V · I", "W"]],
    magnetico: [["Campo de un conductor", "B = μ₀ · I / (2πr)", "T"], ["Permeabilidad", "μ₀ = 4π × 10⁻⁷", "T·m/A"], ["Dirección", "Regla de la mano derecha", "—"]],
    lorentz: [["Fuerza de Lorentz", "F = q · (E + v × B)", "N"], ["Fuerza eléctrica", "Fₑ = q · E", "N"], ["Fuerza magnética", "Fᵦ = q · v × B", "N"]]
  }[id] || [];
  const tarjetaFormula = `<aside class="formulas" aria-label="Fórmulas utilizadas"><h2>Fórmulas utilizadas</h2>${formulas.map(([nombre, formula, unidadFormula]) => `<div class="formula"><strong>${nombre}</strong><code>${formula}</code><small>${unidadFormula}</small></div>`).join("")}<p>Los valores se calculan en tiempo real con los controles del módulo.</p></aside>`;
  principal.innerHTML = `<section class="pantalla-modulo" id="${id}" style="--c:${unidad.color}"><div class="modulo-cabecera"><div><div class="etiqueta-unidad">${unidad.nombre}</div><h1>${titulo}</h1><p>${descripcion}</p></div><span class="chip">${unidad.modulos.length} módulos en esta unidad</span></div><div class="modulo-cuerpo">${contenido}${tarjetaFormula}</div></section>`;
  ruta.textContent = titulo;
}

// Ciclo de vida del módulo: cancela animaciones anteriores, renderiza y conecta controles.
function mostrarModulo(id, titulo, unidad) {
  cancelAnimationFrame(estadoVisual.trayectoria.animacion);
  cancelAnimationFrame(estadoVisual.circuitos.animacion);
  cancelAnimationFrame(estadoVisual.magnetico.animacion);
  unidadActual = unidad;
  const descripciones = Object.fromEntries(unidad.modulos.map(([clave, nombre, descripcion]) => [clave, descripcion]));
  const descripcion = descripciones[id];
  if (id === "cargas") pantallaBase(id, titulo, unidad, descripcion, `<div class="experimento"><div class="experimento__visual"><canvas id="canvas-modulo"></canvas></div><div class="experimento__controles"><div class="control"><label>Caso <select id="caso"><option>Dipolo eléctrico</option><option>Carga única</option><option>Cargas iguales</option><option>Cuadrupolo eléctrico</option><option>Cuatro cargas positivas</option><option>Configuración alternada</option><option>Configuración manual</option></select></label></div><div class="botones"><button class="boton" id="agregar-carga" type="button">+ Agregar carga</button><button class="boton secundario" id="quitar-carga" type="button">− Quitar última</button></div><div class="resultado"><small>Cargas activas</small><strong id="cargas-salida">2 / 10</strong></div><div class="control"><label>Magnitud <output id="magnitud-salida">5 nC</output><input id="magnitud" type="range" min="1" max="20" value="5"></label></div><div class="control"><label>Separación <output id="separacion-salida">2 m</output><input id="separacion" type="range" min="1" max="4" value="2" step=".1"></label></div><label><input id="lineas" type="checkbox" checked> Líneas de campo</label><button class="boton secundario" id="restablecer">Restablecer</button><div class="resultado"><small>Lectura</small><strong id="lectura">E = 0 N/C</strong></div></div></div><p class="nota">Arrastra las cargas dentro del plano. Puedes añadir hasta 10 cargas y elegir distintas configuraciones de campo.</p>`);
  else if (id === "potencial") pantallaBase(id, titulo, unidad, descripcion, `<div class="experimento"><div class="experimento__visual"><canvas id="canvas-modulo"></canvas></div><div class="experimento__controles"><p>Haz clic en el mapa para fijar el punto P.</p><div class="resultado"><small>Potencial en P</small><strong id="lectura">0.00 V</strong></div><div class="resultado"><small>Campo eléctrico</small><strong id="campo">0.00 N/C</strong></div><div class="control"><label>Plano <select id="plano-potencial"><option value="XY">XY</option><option value="XZ">XZ</option><option value="YZ">YZ</option></select></label></div><div class="resultado"><small>Vista activa</small><strong id="plano-lectura">Plano XY</strong></div><div class="resultado"><small>Energía del sistema</small><strong>−0.11 µJ</strong></div></div></div><p class="nota">Rojo: potencial positivo · Azul: potencial negativo · Negro: punto de observación.</p>`);
  else if (id === "trayectoria") pantallaBase(id, titulo, unidad, descripcion, `<div class="experimento"><div class="experimento__visual"><canvas id="canvas-modulo"></canvas></div><div class="experimento__controles"><div class="control"><label>Partícula <select id="particula"><option>Electrón</option><option>Protón</option><option>Personalizada</option></select></label></div><div class="control" id="control-carga-personalizada" hidden><label>Carga personalizada <output id="carga-personalizada-salida">1 e</output><input id="carga-personalizada" type="range" min="-3" max="3" value="1" step="1"></label></div><div class="control"><label>Velocidad inicial <output id="velocidad-salida">2.0 × 10⁶ m/s</output><input id="velocidad" type="range" min=".5" max="5" value="2" step=".1"></label></div><div class="control"><label>Campo uniforme <output id="campo-salida">500 N/C</output><input id="campo" type="range" min="100" max="2000" value="500" step="100"></label></div><div class="botones"><button class="boton" id="iniciar">Iniciar</button><button class="boton secundario" id="reiniciar">Reiniciar</button></div><div class="resultado"><small>Estado · tiempo</small><strong id="tiempo">En pausa · 0.00 ns</strong></div></div></div>`);
  else if (id === "capacitores") pantallaBase(id, titulo, unidad, descripcion, `<div class="experimento"><div class="experimento__visual"><canvas id="canvas-modulo"></canvas></div><div class="experimento__controles"><div class="control"><label>Área <output id="area-salida">100 cm²</output><input id="area" type="range" min="20" max="200" value="100"></label></div><div class="control"><label>Distancia <output id="distancia-salida">2 mm</output><input id="distancia" type="range" min="1" max="20" value="2"></label></div><div class="control"><label>Voltaje <output id="voltaje-salida">12 V</output><input id="voltaje" type="range" min="1" max="100" value="12"></label></div><div class="control"><label>Dieléctrico <select id="dieletrico"><option value="1">Aire · κ=1</option><option value="5">Vidrio · κ=5</option><option value="80">Agua · κ=80</option></select></label></div><div class="resultado"><small>Capacitancia · carga · energía</small><strong id="lectura">Calculando...</strong></div></div></div>`);
  else if (id === "energia") pantallaBase(id, titulo, unidad, descripcion, `<div class="experimento"><div class="experimento__visual"><canvas id="canvas-modulo"></canvas></div><div class="experimento__controles"><div class="control"><label>Capacitancia <input id="energia-c" type="number" value="100"> µF</label></div><div class="control"><label>Voltaje <input id="energia-v" type="number" value="12"> V</label></div><button class="boton" id="calcular">Calcular energía</button><div class="resultado"><small>U = ½ C V²</small><strong id="lectura">7.20 mJ</strong></div></div></div>`);
  else if (id === "circuitos") pantallaBase(id, titulo, unidad, descripcion, `<div class="experimento"><div class="experimento__visual"><canvas id="canvas-modulo"></canvas></div><div class="experimento__controles"><div class="control"><label>Resistencia R1 <output id="r1-salida">20 Ω</output><input id="r1" type="range" min="1" max="100" value="20"></label></div><div class="control"><label>Resistencia R2 <output id="r2-salida">30 Ω</output><input id="r2" type="range" min="1" max="100" value="30"></label></div><div class="control"><label>Voltaje de fuente <output id="fuente-salida">12 V</output><input id="fuente" type="range" min="1" max="24" value="12"></label></div><div class="resultado"><small>Modelo en serie · I = V/(R1+R2)</small><strong id="lectura">I = 0.24 A</strong></div></div></div><p class="nota">El circuito muestra el flujo de corriente y cambia en tiempo real al variar R1, R2 o la fuente.</p>`);
  else if (id === "ohm") pantallaBase(id, titulo, unidad, descripcion, `<div class="experimento"><div class="experimento__visual"><canvas id="canvas-modulo"></canvas></div><div class="experimento__controles"><div class="control"><label>Voltaje <output id="voltaje-salida">12 V</output><input id="voltaje" type="range" min="1" max="24" value="12"></label></div><div class="control"><label>Resistencia <output id="resistencia-salida">20 Ω</output><input id="resistencia" type="range" min="1" max="100" value="20"></label></div><div class="resultado"><small>Corriente I = V / R</small><strong id="lectura">0.60 A</strong></div></div></div>`);
  else if (id === "magnetico") pantallaBase(id, titulo, unidad, descripcion, `<div class="experimento"><div class="experimento__visual"><canvas id="canvas-modulo"></canvas></div><div class="experimento__controles"><div class="control"><label>Intensidad de corriente <output id="corriente-salida">5 A</output><input id="corriente" type="range" min="1" max="20" value="5"></label></div><div class="control"><label>Dirección <select id="direccion"><option>Entrante</option><option>Saliente</option></select></label></div><div class="resultado"><small>Campo alrededor del conductor</small><strong id="lectura">B ∝ I / r</strong></div></div></div>`);
  else pantallaBase(id, titulo, unidad, descripcion, `<div class="experimento"><div class="experimento__visual"><canvas id="canvas-modulo"></canvas></div><div class="experimento__controles"><div class="control"><label>Campo eléctrico <output id="campo-e-salida">5 N/C</output><input id="campo-e" type="range" min="1" max="20" value="5"></label></div><div class="control"><label>Campo magnético <output id="campo-b-salida">1 T</output><input id="campo-b" type="range" min="1" max="10" value="1"></label></div><div class="resultado"><small>F = q(E + v × B)</small><strong id="lectura">F = 0 N</strong></div></div></div>`);
  conectarControles(id);
  dibujar(id, unidad.color);
}

// Motor de visualización 2D. Cada rama aplica un algoritmo de dibujo independiente:
// superposición de campos, mapa de gradiente, trayectoria paramétrica o animación orbital.
function dibujar(id, color) {
  const canvas = document.querySelector("#canvas-modulo"); if (!canvas) return;
  const ctx = canvas.getContext("2d"); const w = canvas.clientWidth || 700; const h = canvas.clientHeight || 500; const escala = window.devicePixelRatio || 1; canvas.width = w * escala; canvas.height = h * escala; ctx.setTransform(escala, 0, 0, escala, 0, 0); ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#f8fbfd"; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = `${color}33`; ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 45) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); } for (let y = 0; y < h; y += 45) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  if (id === "cargas") {
    const caso = document.querySelector("#caso")?.value || "Dipolo eléctrico";
    const controlMagnitud = document.querySelector("#magnitud");
    const controlSeparacion = document.querySelector("#separacion");
    const magnitud = Number(controlMagnitud ? controlMagnitud.value : 5);
    const separacion = Number(controlSeparacion ? controlSeparacion.value : 2);
    const controlLineas = document.querySelector("#lineas");
    const mostrarLineas = !controlLineas || controlLineas.checked;
    const centro = { x: w / 2, y: h / 2 };
    const distancia = Math.min(w * 0.38, separacion / 4 * w);
    const signos = caso === "Carga única" ? [1] : caso === "Cargas iguales" ? [1, 1] : caso === "Cuadrupolo eléctrico" ? [1, -1, -1, 1] : caso === "Cuatro cargas positivas" ? [1, 1, 1, 1] : caso === "Configuración alternada" ? [1, -1, 1, -1] : caso === "Configuración manual" ? estadoCargas.cargas.map((carga) => carga.signo) : [1, -1];
    const configuracion = `${caso}:${separacion}:${signos.join(",")}`;
    estadoCargas.cargas = estadoCargas.cargas.slice(0, signos.length);
    while (estadoCargas.cargas.length < signos.length) estadoCargas.cargas.push({ x: .5, y: .5, signo: 1 });
    estadoCargas.cargas.forEach((carga, indice) => {
      carga.signo = signos[indice];
      if (estadoCargas.configuracion !== configuracion && estadoCargas.arrastrando < 0) {
        if (signos.length === 1) {
          carga.x = .5; carga.y = .5;
        } else if (signos.length === 2) {
          carga.x = (centro.x + (indice === 0 ? -distancia : distancia)) / w; carga.y = .5;
        } else {
          const angulo = -Math.PI / 2 + indice * Math.PI * 2 / signos.length;
          carga.x = .5 + Math.cos(angulo) * Math.min(.28, separacion / 8);
          carga.y = .5 + Math.sin(angulo) * Math.min(.28, separacion / 8);
        }
      }
      carga.y = carga.y || .5;
    });
    if (estadoCargas.arrastrando < 0) estadoCargas.configuracion = configuracion;
    const salidaCargas = document.querySelector("#cargas-salida");
    if (salidaCargas) salidaCargas.textContent = `${estadoCargas.cargas.length} / 10`;
    if (mostrarLineas) {
      ctx.save();
      ctx.strokeStyle = "#536b7d99";
      ctx.lineWidth = 1.5;
      const campoEn = (px, py) => estadoCargas.cargas.reduce((vector, carga) => {
        const dx = px - carga.x;
        const dy = py - carga.y;
        const r2 = Math.max(dx * dx + dy * dy, .0025);
        const factor = carga.signo / Math.pow(r2, 1.5);
        return { x: vector.x + dx * factor, y: vector.y + dy * factor };
      }, { x: 0, y: 0 });
      const positivas = estadoCargas.cargas.filter((carga) => carga.signo > 0);
      positivas.forEach((carga) => {
        for (let indice = 0; indice < 18; indice += 1) {
          let px = carga.x + Math.cos(indice * Math.PI * 2 / 18) * .055;
          let py = carga.y + Math.sin(indice * Math.PI * 2 / 18) * .055;
          ctx.beginPath(); ctx.moveTo(px * w, py * h);
          for (let paso = 0; paso < 34; paso += 1) {
            const vector = campoEn(px, py);
            const modulo = Math.max(Math.hypot(vector.x, vector.y), .001);
            px += vector.x / modulo * .014;
            py += vector.y / modulo * .014;
            if (px < .02 || px > .98 || py < .02 || py > .98) break;
            if (estadoCargas.cargas.some((otra) => otra.signo < 0 && Math.hypot(px - otra.x, py - otra.y) < .06)) break;
            ctx.lineTo(px * w, py * h);
          }
          ctx.stroke();
          const vector = campoEn(px, py);
          const modulo = Math.max(Math.hypot(vector.x, vector.y), .001);
          const puntaX = (px - vector.x / modulo * .01) * w;
          const puntaY = (py - vector.y / modulo * .01) * h;
          const angulo = Math.atan2(vector.y, vector.x);
          ctx.fillStyle = "#536b7d99";
          ctx.beginPath();
          ctx.moveTo(puntaX, puntaY);
          ctx.lineTo(puntaX - Math.cos(angulo - .5) * 7, puntaY - Math.sin(angulo - .5) * 7);
          ctx.lineTo(puntaX - Math.cos(angulo + .5) * 7, puntaY - Math.sin(angulo + .5) * 7);
          ctx.closePath();
          ctx.fill();
        }
      });
      ctx.restore();
    }
    estadoCargas.cargas.forEach((carga) => {
      const x = carga.x * w;
      const y = carga.y * h;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(20, Math.min(w, h) * .045), 0, Math.PI * 2);
      ctx.fillStyle = carga.signo > 0 ? "#df4d4d" : "#2379c7";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#fff";
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "700 22px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(carga.signo > 0 ? "+" : "−", x, y);
      ctx.font = "600 12px system-ui";
      ctx.fillText(`${magnitud} nC`, x, y + 34);
    });
    ctx.fillStyle = "#172231";
    ctx.font = "600 13px system-ui";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Arrastra una carga para moverla", 18, 18);
    return;
  }
  if (id === "potencial") {
    const plano = estadoVisual.planoPotencial;
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    if (plano === "XY") { grad.addColorStop(0, "#3e8dd4"); grad.addColorStop(.5, "#fff"); grad.addColorStop(1, "#e85858"); }
    if (plano === "XZ") { grad.addColorStop(0, "#6a48b8"); grad.addColorStop(.5, "#fff"); grad.addColorStop(1, "#e8a23e"); }
    if (plano === "YZ") { grad.addColorStop(0, "#168f7d"); grad.addColorStop(.5, "#fff"); grad.addColorStop(1, "#df4d4d"); }
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
    const fuentes = plano === "XY" ? [["#df4d4d", w * .25, h * .52], ["#2379c7", w * .75, h * .52]] : plano === "XZ" ? [["#df4d4d", w * .28, h * .4], ["#2379c7", w * .72, h * .62]] : [["#df4d4d", w * .38, h * .62], ["#2379c7", w * .62, h * .38]];
    fuentes.forEach(([c, x, y]) => { ctx.beginPath(); ctx.arc(x, y, 30, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill(); });
    ctx.save();
    ctx.strokeStyle = "#17223155";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    for (let indice = 1; indice < 6; indice += 1) {
      const x = w * indice / 6;
      const y = h * indice / 6;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.strokeStyle = "#172231aa";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w - 22, h / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w / 2, h); ctx.lineTo(w / 2, 22); ctx.stroke();
    const rangoHorizontal = plano === "YZ" ? 3 : 5;
    const rangoVertical = plano === "XY" ? 3 : 2.5;
    ctx.fillStyle = "#172231";
    ctx.font = "700 13px system-ui";
    ctx.textAlign = "right";
    ctx.fillText(plano[0], w - 8, h / 2 - 8);
    ctx.textAlign = "left";
    ctx.fillText(plano[1], w / 2 + 8, 18);
    ctx.font = "600 10px system-ui";
    ctx.textAlign = "center";
    for (let indice = -2; indice <= 2; indice += 1) {
      const posicionX = w / 2 + indice * w / 6;
      const valorX = (indice * rangoHorizontal / 2).toFixed(1).replace(".0", "");
      ctx.fillText(valorX, posicionX, h / 2 + 17);
      const posicionY = h / 2 - indice * h / 6;
      const valorY = (indice * rangoVertical / 2).toFixed(1).replace(".0", "");
      ctx.fillText(valorY, w / 2 + 22, posicionY + 3);
    }
    ctx.strokeStyle = `${color}99`;
    ctx.lineWidth = 1.5;
    for (let indice = 1; indice < 6; indice += 1) {
      ctx.beginPath();
      ctx.ellipse(w * (.15 + indice * .12), h * (.5 + (indice % 2 ? -.05 : .05)), 26 + indice * 9, 12 + indice * 7, indice % 2 ? -.25 : .25, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(estadoVisual.puntoPotencial.x * w, estadoVisual.puntoPotencial.y * h, 16, 0, Math.PI * 2); ctx.fillStyle = "#111820"; ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "700 14px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("P", estadoVisual.puntoPotencial.x * w, estadoVisual.puntoPotencial.y * h);
    ctx.fillStyle = "#172231"; ctx.font = "700 14px system-ui"; ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillText(`Plano ${plano}`, 18, 18); return;
  }
  if (id === "trayectoria") {
    const t = estadoVisual.trayectoria.tiempo;
    const velocidad = estadoVisual.trayectoria.velocidad;
    const campo = estadoVisual.trayectoria.campo;
    const signo = estadoVisual.trayectoria.carga;
    const curvatura = signo * campo / (velocidad * 900);
    ctx.strokeStyle = "#d99934"; ctx.lineWidth = 4; ctx.beginPath();
    for (let x = 0; x < w; x += 3) {
      const progreso = x / w;
      const y = h * .68 - curvatura * Math.pow(progreso, 2) * h * .22;
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
    const px = ((t * 90) % (w * .78)) + w * .1;
    const progreso = (px - w * .1) / (w * .78);
    const py = h * .68 - curvatura * Math.pow(progreso, 2) * h * .22;
    ctx.fillStyle = signo > 0 ? "#df4d4d" : "#287dcc"; ctx.beginPath(); ctx.arc(px, py, 15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "700 12px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(signo > 0 ? "+" : "−", px, py);
    ctx.fillStyle = "#172231"; ctx.font = "600 13px system-ui"; ctx.textBaseline = "alphabetic"; ctx.fillText(`${estadoVisual.trayectoria.particula} · v=${velocidad.toFixed(1)} · E=${campo}`, w / 2, h * .92); return;
  }
  if (id === "lorentz") {
    const e = Number(document.querySelector("#campo-e")?.value || 5);
    const b = Number(document.querySelector("#campo-b")?.value || 1);
    const radio = Math.max(28, Math.min(w, h) * (.12 + b * .018));
    const angulo = estadoVisual.trayectoria.tiempo * (.8 + b * .15);
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(w / 2, h / 2, radio, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "#d99934"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(w / 2, h / 2, radio, 0, angulo); ctx.stroke();
    ctx.fillStyle = "#287dcc"; ctx.beginPath(); ctx.arc(w / 2 + Math.cos(angulo) * radio, h / 2 + Math.sin(angulo) * radio, 15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#172231"; ctx.font = "600 14px system-ui"; ctx.textAlign = "center"; ctx.fillText(`F ∝ ${e + b * 2}`, w / 2, h * .12); return;
  }
  if (id === "capacitores") {
    const d = Number(document.querySelector("#distancia")?.value || 2);
    const k = Number(document.querySelector("#dieletrico")?.value || 1);
    const separacion = Math.max(1, Math.min(20, d));
    const area = Number(document.querySelector("#area")?.value || 100);
    const anchoPlacas = w * (.35 + area / 200 * .45);
    const y1 = h * .5 - (h * .34 * separacion / 20);
    const y2 = h * .5 + (h * .34 * separacion / 20);
    const inicioPlaca = (w - anchoPlacas) / 2;
    ctx.fillStyle = "#3e806b"; ctx.fillRect(inicioPlaca, y1, anchoPlacas, 16); ctx.fillRect(inicioPlaca, y2, anchoPlacas, 16);
    ctx.fillStyle = k > 1 ? "#82d6bf99" : "#ffffff55"; ctx.fillRect(w * .35, y1 + 16, w * .3, Math.max(8, y2 - y1 - 16));
    ctx.fillStyle = color; ctx.font = "bold 18px system-ui"; ctx.textAlign = "center"; ctx.fillText("+  +  +  +  +  +", w / 2, y1 - 16); ctx.fillText("−  −  −  −  −  −", w / 2, y2 + 31);
    ctx.strokeStyle = color; ctx.lineWidth = 2; const fase = (estadoVisual.energia.fase % 1) * 40;
    for (let x = w * .25 + fase; x < w * .75; x += 40) { ctx.beginPath(); ctx.moveTo(x, y1 + 24); ctx.lineTo(x, y2 - 8); ctx.stroke(); }
    ctx.fillStyle = "#172231"; ctx.font = "600 14px system-ui"; ctx.fillText(`d = ${d} mm · κ = ${k}`, w / 2, h * .9); return;
  }
  if (id === "magnetico") {
    const corriente = Number(document.querySelector("#corriente")?.value || 5);
    const direccion = document.querySelector("#direccion")?.value || "Entrante";
    const fase = estadoVisual.magnetico.fase;
    ctx.strokeStyle = color; ctx.lineWidth = 3;
    for (let r = 45; r < Math.min(w, h) / 2; r += 38) {
      ctx.beginPath(); ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2); ctx.stroke();
      for (let indice = 0; indice < 3; indice += 1) {
        const angulo = (fase * Math.PI * 2 + indice * Math.PI * 2 / 3) * (direccion === "Entrante" ? -1 : 1);
        const px = w / 2 + Math.cos(angulo) * r;
        const py = h / 2 + Math.sin(angulo) * r;
        ctx.fillStyle = corriente > 0 ? "#f59e0b" : "#94a3b8";
        ctx.beginPath(); ctx.arc(px, py, 5 + corriente * .15, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.fillStyle = "#d85858"; ctx.fillRect(w / 2 - 18, h / 2 - 65, 36, 65); ctx.fillStyle = "#3974c3"; ctx.fillRect(w / 2 - 18, h / 2, 36, 65);
    ctx.fillStyle = "#fff"; ctx.font = "700 22px system-ui"; ctx.textAlign = "center"; ctx.fillText(direccion === "Entrante" ? "×" : "•", w / 2, h / 2 + 8);
    ctx.fillStyle = "#172231"; ctx.font = "600 14px system-ui"; ctx.fillText(`I = ${corriente} A · B ∝ I/r · ${direccion}`, w / 2, h * .9); return;
  }
  if (id === "energia") {
    const capacitancia = Number(document.querySelector("#energia-c")?.value || 100);
    const voltaje = Number(document.querySelector("#energia-v")?.value || 12);
    const energia = .5 * capacitancia * 1e-6 * voltaje * voltaje;
    const radio = Math.max(22, Math.min(85, 22 + energia * 1800));
    const gradiente = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, radio);
    gradiente.addColorStop(0, "#fff7a8"); gradiente.addColorStop(.55, color); gradiente.addColorStop(1, `${color}22`);
    ctx.fillStyle = gradiente; ctx.beginPath(); ctx.arc(w / 2, h / 2, radio, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(w / 2, h / 2, radio + 12, -Math.PI / 2, -Math.PI / 2 + Math.min(Math.PI * 2, energia * 120)); ctx.stroke();
    ctx.fillStyle = "#172231"; ctx.font = "700 16px system-ui"; ctx.textAlign = "center"; ctx.fillText(`${(energia * 1000).toFixed(2)} mJ`, w / 2, h * .86);
    ctx.font = "600 13px system-ui"; ctx.fillText(`C = ${capacitancia} µF · V = ${voltaje} V`, w / 2, h * .92); return;
  }
  if (id === "circuitos" || id === "ohm") {
    const v = Number(document.querySelector("#fuente, #voltaje")?.value || 12);
    const r = Number(document.querySelector("#r1")?.value || 20) + Number(document.querySelector("#r2")?.value || 30);
    const corriente = id === "ohm" ? v / Number(document.querySelector("#resistencia")?.value || 20) : v / r;
    const puntos = [w * .1, w * .25, w * .41, w * .59, w * .75, w * .9];
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(puntos[0], h * .5); ctx.lineTo(puntos[1], h * .5); ctx.stroke();
    ctx.strokeRect(puntos[1], h * .42, w * .16, h * .16); ctx.moveTo(puntos[2], h * .5); ctx.lineTo(puntos[3], h * .5); ctx.stroke(); ctx.strokeRect(puntos[3], h * .42, w * .16, h * .16); ctx.moveTo(puntos[4], h * .5); ctx.lineTo(puntos[5], h * .5); ctx.stroke();
    if (id === "circuitos") {
      ctx.fillStyle = "#172231"; ctx.font = "600 13px system-ui"; ctx.textAlign = "center";
      ctx.fillText(`R1 ${Number(document.querySelector("#r1")?.value || 20)} Ω`, puntos[1] + w * .08, h * .38);
      ctx.fillText(`R2 ${Number(document.querySelector("#r2")?.value || 30)} Ω`, puntos[3] + w * .08, h * .38);
    } else {
      ctx.fillStyle = "#172231"; ctx.font = "600 13px system-ui"; ctx.textAlign = "center";
      ctx.fillText(`V = ${v} V`, w * .18, h * .38);
      ctx.fillText(`R = ${Number(document.querySelector("#resistencia")?.value || 20)} Ω`, w * .66, h * .38);
    }
    const fase = (id === "ohm" ? estadoVisual.circuitos.fase : estadoVisual.circuitos.fase) % 1;
    for (let indice = 0; indice < 7; indice += 1) {
      const posicion = .1 + ((fase + indice / 7) % 1) * .8;
      ctx.fillStyle = corriente > 0 ? "#f59e0b" : "#94a3b8";
      ctx.beginPath(); ctx.arc(w * posicion, h * .5, 7, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = "#172231"; ctx.font = "600 15px system-ui"; ctx.textAlign = "center"; ctx.fillText(`I = ${corriente.toFixed(2)} A · flujo de corriente`, w / 2, h * .25); return;
  }
  ctx.strokeStyle = color; ctx.lineWidth = 3; for (let i = 0; i < 10; i += 1) { ctx.beginPath(); ctx.moveTo(w * .1, h * (.1 + i * .09)); ctx.lineTo(w * .9, h * (.1 + i * .09)); ctx.stroke(); } ctx.fillStyle = color; ctx.beginPath(); ctx.arc(w / 2, h / 2, 34, 0, Math.PI * 2); ctx.fill();
}

// Adaptador DOM: transforma eventos de controles en estado, resultados y redibujos.
function conectarControles(id) {
  const actualizar = () => {
    if (id === "cargas") {
      const actualizarCarga = () => {
        const magnitud = Number(document.querySelector("#magnitud").value);
        const separacion = Number(document.querySelector("#separacion").value);
        document.querySelector("#magnitud-salida").textContent = `${magnitud} nC`;
        document.querySelector("#separacion-salida").textContent = `${separacion.toFixed(1)} m`;
        document.querySelector("#lectura").textContent = `Separación ${separacion.toFixed(1)} m · q ${magnitud} nC`;
        document.querySelector("#agregar-carga").disabled = estadoCargas.cargas.length >= 10;
        document.querySelector("#quitar-carga").disabled = estadoCargas.cargas.length <= 1;
        dibujar("cargas", unidadActual.color);
      };
      ["#magnitud", "#separacion", "#caso", "#lineas"].forEach((selector) => document.querySelector(selector).addEventListener("input", actualizarCarga));
      document.querySelector("#caso").addEventListener("change", actualizarCarga);
      const cambiarAManual = () => {
        const caso = document.querySelector("#caso");
        if (caso.value !== "Configuración manual") {
          caso.value = "Configuración manual";
          estadoCargas.configuracion = "";
        }
      };
      document.querySelector("#agregar-carga").addEventListener("click", () => {
        if (estadoCargas.cargas.length >= 10) return;
        cambiarAManual();
        const indice = estadoCargas.cargas.length;
        const angulo = -Math.PI / 2 + indice * Math.PI * 2 / (indice + 1);
        estadoCargas.cargas.push({ x: .5 + Math.cos(angulo) * .22, y: .5 + Math.sin(angulo) * .22, signo: indice % 2 === 0 ? 1 : -1 });
        estadoCargas.configuracion = "";
        actualizarCarga();
      });
      document.querySelector("#quitar-carga").addEventListener("click", () => {
        if (estadoCargas.cargas.length <= 1) return;
        cambiarAManual();
        estadoCargas.cargas.pop();
        estadoCargas.configuracion = "";
        actualizarCarga();
      });
      document.querySelector("#restablecer").addEventListener("click", () => {
        document.querySelector("#magnitud").value = "5";
        document.querySelector("#separacion").value = "2";
        document.querySelector("#caso").value = "Dipolo eléctrico";
        document.querySelector("#lineas").checked = true;
        estadoCargas.cargas = [
          { x: .34, y: .5, signo: 1 },
          { x: .66, y: .5, signo: -1 }
        ];
        estadoCargas.arrastrando = -1;
        estadoCargas.configuracion = "";
        estadoCargas.siguienteId = 3;
        actualizarCarga();
      });
      const canvas = document.querySelector("#canvas-modulo");
      const obtenerPunto = (evento) => {
        const rect = canvas.getBoundingClientRect();
        return {
          x: Math.max(0, Math.min(1, (evento.clientX - rect.left) / rect.width)),
          y: Math.max(0, Math.min(1, (evento.clientY - rect.top) / rect.height))
        };
      };
      canvas.style.cursor = "grab";
      canvas.style.touchAction = "none";
      canvas.style.userSelect = "none";
      canvas.addEventListener("pointerdown", (evento) => {
        const punto = obtenerPunto(evento);
        const distanciaMaxima = Math.max(22 / canvas.clientWidth, 0.055);
        estadoCargas.arrastrando = estadoCargas.cargas.findIndex((carga) => Math.hypot(carga.x - punto.x, carga.y - punto.y) <= distanciaMaxima);
        if (estadoCargas.arrastrando >= 0) {
          canvas.setPointerCapture(evento.pointerId);
          canvas.style.cursor = "grabbing";
          evento.preventDefault();
        }
      });
      canvas.addEventListener("pointermove", (evento) => {
        if (estadoCargas.arrastrando >= 0) {
          const punto = obtenerPunto(evento);
          estadoCargas.cargas[estadoCargas.arrastrando].x = punto.x;
          estadoCargas.cargas[estadoCargas.arrastrando].y = punto.y;
          dibujar("cargas", unidadActual.color);
          const carga = estadoCargas.cargas[estadoCargas.arrastrando];
          document.querySelector("#lectura").textContent = `Carga ${carga.signo > 0 ? "+" : "−"} · posición (${(punto.x * 10 - 5).toFixed(2)}, ${(3 - punto.y * 6).toFixed(2)})`;
          evento.preventDefault();
          return;
        }
        const punto = obtenerPunto(evento);
        document.querySelector("#lectura").textContent = `Punto (${(punto.x * 10 - 5).toFixed(2)}, ${(3 - punto.y * 6).toFixed(2)}) · selecciona y arrastra`;
      });
      const soltarCarga = (evento) => {
        if (estadoCargas.arrastrando >= 0) {
          estadoCargas.arrastrando = -1;
          canvas.style.cursor = "grab";
          if (canvas.hasPointerCapture(evento.pointerId)) canvas.releasePointerCapture(evento.pointerId);
          dibujar("cargas", unidadActual.color);
        }
      };
      canvas.addEventListener("pointerup", soltarCarga);
      canvas.addEventListener("pointercancel", soltarCarga);
      actualizarCarga();
    }
    if (id === "potencial") {
      const canvas = document.querySelector("#canvas-modulo"); const lectura = document.querySelector("#lectura"); const campo = document.querySelector("#campo");
      const plano = document.querySelector("#plano-potencial");
      const actualizarPunto = (e, fijar = false) => { const r = canvas.getBoundingClientRect(); const x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); const y = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)); if (fijar) estadoVisual.puntoPotencial = { x, y }; const coordenadas = { XY: [x * 10 - 5, 3 - y * 6], XZ: [x * 10 - 5, 2.5 - y * 5], YZ: [y * 6 - 3, 2.5 - x * 5] }[estadoVisual.planoPotencial]; const [a, b] = coordenadas; lectura.textContent = `${(a * 2.3 - b * .8).toFixed(2)} V · ${estadoVisual.planoPotencial} (${a.toFixed(2)}, ${b.toFixed(2)})`; campo.textContent = `${Math.hypot(a, b).toFixed(2)} N/C`; if (fijar) dibujar("potencial", unidadActual.color); };
      canvas.style.cursor = "crosshair"; canvas.style.touchAction = "none"; canvas.onpointermove = (e) => actualizarPunto(e); canvas.onpointerdown = (e) => { actualizarPunto(e, true); if (e.pointerId !== undefined) canvas.setPointerCapture(e.pointerId); }; canvas.onclick = (e) => actualizarPunto(e, true);
      plano.onchange = () => { estadoVisual.planoPotencial = plano.value; document.querySelector("#plano-lectura").textContent = `Plano ${plano.value}`; actualizarPunto({ clientX: canvas.getBoundingClientRect().left + canvas.getBoundingClientRect().width * estadoVisual.puntoPotencial.x, clientY: canvas.getBoundingClientRect().top + canvas.getBoundingClientRect().height * estadoVisual.puntoPotencial.y }); dibujar("potencial", unidadActual.color); };
      document.querySelector("#plano-lectura").textContent = `Plano ${estadoVisual.planoPotencial}`;
    }
    if (id === "trayectoria") {
      let ejecutando = false; let anterior = performance.now();
      const actualizarParticula = () => {
        const tipo = document.querySelector("#particula").value;
        const cargaPersonalizada = Number(document.querySelector("#carga-personalizada").value);
        estadoVisual.trayectoria.particula = tipo;
        estadoVisual.trayectoria.carga = tipo === "Electrón" ? -1 : tipo === "Protón" ? 1 : Math.sign(cargaPersonalizada || 1);
        document.querySelector("#control-carga-personalizada").hidden = tipo !== "Personalizada";
        document.querySelector("#carga-personalizada-salida").textContent = `${cargaPersonalizada} e`;
        document.querySelector("#tiempo").textContent = `${tipo} · En pausa · ${(estadoVisual.trayectoria.tiempo * 1e3).toFixed(2)} ns`;
        dibujar("trayectoria", unidadActual.color);
      };
      const actualizarParametros = () => {
        estadoVisual.trayectoria.velocidad = Number(document.querySelector("#velocidad").value);
        estadoVisual.trayectoria.campo = Number(document.querySelector("#campo").value);
        document.querySelector("#velocidad-salida").textContent = `${estadoVisual.trayectoria.velocidad.toFixed(1)} × 10⁶ m/s`;
        document.querySelector("#campo-salida").textContent = `${estadoVisual.trayectoria.campo} N/C`;
        dibujar("trayectoria", unidadActual.color);
      };
      const renderizar = (ahora) => { if (!ejecutando) return; estadoVisual.trayectoria.tiempo += Math.min((ahora - anterior) / 1000, .05); anterior = ahora; document.querySelector("#tiempo").textContent = `${estadoVisual.trayectoria.particula} · En ejecución · ${(estadoVisual.trayectoria.tiempo * 1e3).toFixed(2)} ns`; dibujar("trayectoria", unidadActual.color); estadoVisual.trayectoria.animacion = requestAnimationFrame(renderizar); };
      document.querySelector("#particula").onchange = actualizarParticula;
      document.querySelector("#carga-personalizada").oninput = actualizarParticula;
      document.querySelector("#velocidad").oninput = actualizarParametros;
      document.querySelector("#campo").oninput = actualizarParametros;
      document.querySelector("#iniciar").onclick = () => { ejecutando = !ejecutando; document.querySelector("#iniciar").textContent = ejecutando ? "Pausar" : "Continuar"; if (ejecutando) { anterior = performance.now(); cancelAnimationFrame(estadoVisual.trayectoria.animacion); estadoVisual.trayectoria.animacion = requestAnimationFrame(renderizar); } };
      document.querySelector("#reiniciar").onclick = () => { ejecutando = false; estadoVisual.trayectoria.tiempo = 0; cancelAnimationFrame(estadoVisual.trayectoria.animacion); document.querySelector("#iniciar").textContent = "Iniciar"; document.querySelector("#tiempo").textContent = `${estadoVisual.trayectoria.particula} · En pausa · 0.00 ns`; dibujar("trayectoria", unidadActual.color); };
      actualizarParticula(); actualizarParametros();
    }
    if (id === "capacitores") {
      // Algoritmo físico: C = κ ε₀ A / d; Q = C V; U = 1/2 C V².
      const calcular = () => {
        const area = Number(document.querySelector("#area").value);
        const distancia = Number(document.querySelector("#distancia").value);
        const voltaje = Number(document.querySelector("#voltaje").value);
        const dielectrico = Number(document.querySelector("#dieletrico").value);
        const capacitancia = calcularCapacitancia(area, distancia, dielectrico);
        document.querySelector("#area-salida").textContent = `${area} cm²`;
        document.querySelector("#distancia-salida").textContent = `${distancia} mm`;
        document.querySelector("#voltaje-salida").textContent = `${voltaje} V`;
        document.querySelector("#lectura").textContent = `${(capacitancia * 1e12).toFixed(1)} pF · Q ${(capacitancia * voltaje * 1e9).toFixed(2)} nC · U ${(calcularEnergia(capacitancia, voltaje) * 1e9).toFixed(2)} nJ`;
        dibujar("capacitores", unidadActual.color);
      };
      ["#area", "#distancia", "#voltaje", "#dieletrico"].forEach((selector) => document.querySelector(selector).oninput = calcular);
      calcular();
    }
    if (id === "energia") {
      // Conversión de entrada: microfaradios a faradios antes de aplicar U = 1/2 C V².
      const calcular = () => {
        const capacitancia = Number(document.querySelector("#energia-c").value) * 1e-6;
        const voltaje = Number(document.querySelector("#energia-v").value);
        document.querySelector("#lectura").textContent = `${(calcularEnergia(capacitancia, voltaje) * 1000).toFixed(2)} mJ`;
        dibujar("energia", unidadActual.color);
      };
      document.querySelector("#calcular").onclick = calcular;
      ["#energia-c", "#energia-v"].forEach((selector) => document.querySelector(selector).addEventListener("input", calcular));
      calcular();
    }
    if (id === "ohm") {
      // Algoritmo de ley de Ohm: I = V / R.
      const calc = () => {
        const voltaje = Number(document.querySelector("#voltaje").value);
        const resistencia = Number(document.querySelector("#resistencia").value);
        document.querySelector("#voltaje-salida").textContent = `${voltaje} V`;
        document.querySelector("#resistencia-salida").textContent = `${resistencia} Ω`;
        document.querySelector("#lectura").textContent = `${calcularCorriente(voltaje, resistencia).toFixed(2)} A`;
        dibujar("ohm", unidadActual.color);
      };
      ["#voltaje", "#resistencia"].forEach((selector) => document.querySelector(selector).oninput = calc);
      const animarOhm = (ahora) => { if (!document.querySelector("#ohm")) return; estadoVisual.circuitos.fase = (ahora / 1800) % 1; dibujar("ohm", unidadActual.color); estadoVisual.circuitos.animacion = requestAnimationFrame(animarOhm); };
      calc(); estadoVisual.circuitos.animacion = requestAnimationFrame(animarOhm);
    }
    if (id === "circuitos") {
      // Algoritmo de resistencias en serie: Rtotal = R1 + R2; I = V / Rtotal.
      const calc = () => { const r1 = Number(document.querySelector("#r1").value); const r2 = Number(document.querySelector("#r2").value); const fuente = Number(document.querySelector("#fuente").value); document.querySelector("#r1-salida").textContent = `${r1} Ω`; document.querySelector("#r2-salida").textContent = `${r2} Ω`; document.querySelector("#fuente-salida").textContent = `${fuente} V`; document.querySelector("#lectura").textContent = `I = ${calcularCorrienteSerie(fuente, r1, r2).toFixed(2)} A`; dibujar("circuitos", unidadActual.color); };
      ["#r1","#r2","#fuente"].forEach((s) => document.querySelector(s).oninput = calc);
      const animarCircuito = (ahora) => { if (!document.querySelector("#circuitos")) return; estadoVisual.circuitos.fase = (ahora / 1800) % 1; dibujar("circuitos", unidadActual.color); estadoVisual.circuitos.animacion = requestAnimationFrame(animarCircuito); };
      calc(); estadoVisual.circuitos.animacion = requestAnimationFrame(animarCircuito);
    }
    if (id === "magnetico") { const actualizarMagnetico = () => { const corriente = document.querySelector("#corriente").value; document.querySelector("#corriente-salida").textContent = `${corriente} A`; document.querySelector("#lectura").textContent = `B ∝ ${corriente} / r`; dibujar("magnetico", unidadActual.color); }; document.querySelector("#corriente").oninput = actualizarMagnetico; document.querySelector("#direccion").onchange = actualizarMagnetico; const animarMagnetico = (ahora) => { if (!document.querySelector("#magnetico")) return; estadoVisual.magnetico.fase = (ahora / 2400) % 1; dibujar("magnetico", unidadActual.color); estadoVisual.magnetico.animacion = requestAnimationFrame(animarMagnetico); }; actualizarMagnetico(); estadoVisual.magnetico.animacion = requestAnimationFrame(animarMagnetico); }
    if (id === "lorentz") { const calc = () => { const f = Number(document.querySelector("#campo-e").value) + Number(document.querySelector("#campo-b").value) * 2; document.querySelector("#campo-e-salida").textContent = `${document.querySelector("#campo-e").value} N/C`; document.querySelector("#campo-b-salida").textContent = `${document.querySelector("#campo-b").value} T`; document.querySelector("#lectura").textContent = `F = ${f.toFixed(1)} N`; dibujar("lorentz", unidadActual.color); }; ["#campo-e","#campo-b"].forEach((s) => document.querySelector(s).oninput = calc); calc(); }
  };
  actualizar();
}

crearMenu();
document.querySelector("[data-inicio]").addEventListener("click", (evento) => { evento.preventDefault(); principal.innerHTML = document.querySelector("#inicio").outerHTML; ruta.textContent = "Inicio"; });
document.querySelector("#alternar-tema").addEventListener("click", () => { document.body.classList.toggle("tema-oscuro"); localStorage.setItem("tema", document.body.classList.contains("tema-oscuro") ? "oscuro" : "claro"); });
document.querySelector("#abrir-menu").addEventListener("click", () => document.querySelector("#barra-lateral").classList.toggle("visible"));
if (localStorage.getItem("tema") === "oscuro") document.body.classList.add("tema-oscuro");

// Algoritmo de validación: ejecuta las fórmulas puras y presenta cada resultado
// dentro de un modal sin abandonar la simulación principal.
async function abrirModalPruebas() {
  let modal = document.querySelector("#modal-pruebas");
  if (!modal) {
    modal = document.createElement("section");
    modal.id = "modal-pruebas";
    modal.className = "modal-pruebas";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "titulo-pruebas");
    modal.innerHTML = `<div class="modal-pruebas__fondo" data-cerrar-pruebas></div><div class="modal-pruebas__panel"><button class="modal-pruebas__cerrar" type="button" aria-label="Cerrar pruebas" data-cerrar-pruebas><i class="ti ti-x" aria-hidden="true"></i></button><div class="modal-pruebas__icono"><i class="ti ti-test-pipe" aria-hidden="true"></i></div><p class="etiqueta-unidad">Validación del simulador</p><h2 id="titulo-pruebas">Pruebas sencillas de Física 2</h2><p class="modal-pruebas__descripcion">Pulsa el botón para ejecutar manualmente las validaciones de los algoritmos físicos principales.</p><div class="pruebas-estado" id="modal-pruebas-estado" role="status">Listo para iniciar. Todavía no se han ejecutado pruebas.</div><ul class="pruebas-lista" id="modal-pruebas-lista"></ul><div class="modal-pruebas__acciones"><a href="pruebas.html" target="_blank" rel="noopener">Abrir página completa</a><button class="boton" id="iniciar-pruebas" type="button"><i class="ti ti-player-play" aria-hidden="true"></i> Iniciar prueba</button></div></div>`;
    document.body.append(modal);
    modal.querySelectorAll("[data-cerrar-pruebas]").forEach((elemento) => elemento.addEventListener("click", cerrarModalPruebas));
    modal.querySelector("#iniciar-pruebas").addEventListener("click", ejecutarPruebasModal);
  }
  modal.classList.add("visible");
  document.body.classList.add("modal-abierto");
  modal.querySelector(".modal-pruebas__cerrar").focus();
  const estado = modal.querySelector("#modal-pruebas-estado");
  const lista = modal.querySelector("#modal-pruebas-lista");
  const iniciar = modal.querySelector("#iniciar-pruebas");
  estado.textContent = "Listo para iniciar. Todavía no se han ejecutado pruebas.";
  estado.className = "pruebas-estado";
  lista.innerHTML = "";
  iniciar.innerHTML = '<i class="ti ti-player-play" aria-hidden="true"></i> Iniciar prueba';
}

// Exposición controlada para que el botón HTML siga funcionando incluso si
// el navegador no propaga correctamente el evento desde el panel lateral.
window.abrirModalPruebas = abrirModalPruebas;

function cerrarModalPruebas() {
  const modal = document.querySelector("#modal-pruebas");
  if (!modal) return;
  modal.classList.remove("visible");
  document.body.classList.remove("modal-abierto");
  document.querySelector("#abrir-pruebas").focus();
}

async function ejecutarPruebasModal() {
  const estado = document.querySelector("#modal-pruebas-estado");
  const lista = document.querySelector("#modal-pruebas-lista");
  const iniciar = document.querySelector("#iniciar-pruebas");
  if (!estado || !lista) return;
  estado.textContent = "Ejecutando pruebas...";
  estado.className = "pruebas-estado ejecutando";
  if (iniciar) {
    iniciar.disabled = true;
    iniciar.innerHTML = '<i class="ti ti-loader-2" aria-hidden="true"></i> Ejecutando...';
  }
  try {
    const { calcularCapacitancia, calcularCorriente, calcularCorrienteSerie, calcularEnergia } = await import("../fisica/calculos.js");
    const pruebas = [
      ["Capacitancia de aire", Math.abs(calcularCapacitancia(100, 2) - 4.427e-11) < 1e-14],
      ["Energía almacenada", Math.abs(calcularEnergia(100e-6, 12) - 0.0072) < 1e-12],
      ["Corriente en serie", calcularCorrienteSerie(12, 20, 30) === 0.24],
      ["Ley de Ohm", calcularCorriente(12, 6) === 2]
    ];
    const fallidas = pruebas.filter(([, correcto]) => !correcto);
    lista.innerHTML = pruebas.map(([nombre, correcto]) => `<li class="${correcto ? "correcta" : "fallida"}"><i class="ti ${correcto ? "ti-circle-check" : "ti-circle-x"}" aria-hidden="true"></i><span>${nombre}</span><strong>${correcto ? "Correcta" : "Revisar"}</strong></li>`).join("");
    estado.textContent = fallidas.length === 0 ? "Todas las pruebas pasaron correctamente." : `${fallidas.length} prueba(s) requieren revisión.`;
    estado.className = `pruebas-estado ${fallidas.length === 0 ? "correcta" : "fallida"}`;
    if (iniciar) {
      iniciar.disabled = false;
      iniciar.innerHTML = '<i class="ti ti-refresh" aria-hidden="true"></i> Repetir pruebas';
    }
  } catch (error) {
    estado.textContent = `No se pudieron ejecutar las pruebas: ${error.message}`;
    estado.className = "pruebas-estado fallida";
    if (iniciar) {
      iniciar.disabled = false;
      iniciar.innerHTML = '<i class="ti ti-refresh" aria-hidden="true"></i> Reintentar prueba';
    }
  }
}

// Delegación de eventos: mantiene operativo el botón aunque el panel se regenere
// o el navegador reutilice una vista previamente cargada.
document.addEventListener("click", (evento) => {
  const botonPruebas = evento.target.closest("#abrir-pruebas");
  if (!botonPruebas) return;
  evento.preventDefault();
  abrirModalPruebas();
});
document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && document.querySelector("#modal-pruebas.visible")) cerrarModalPruebas();
});
