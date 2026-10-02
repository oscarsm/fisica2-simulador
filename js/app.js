const K = 8.9875517923e9;
const EPSILON_0 = 8.8541878128e-12;
const cargas = [{ q: 5e-9, x: -1, y: 0 }, { q: -5e-9, x: 1, y: 0 }];
const $ = (selector) => document.querySelector(selector);
const canvasContext = (id) => { const canvas = $(id); return { canvas, ctx: canvas.getContext("2d") }; };
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
let puntoPotencialFijado = false;
let puntoPotencial = { x: 0, y: 1 };

function ajustarCanvas(canvas) {
  const escala = window.devicePixelRatio || 1;
  const ancho = canvas.clientWidth;
  const alto = canvas.clientHeight;
  if (ancho === 0 || alto === 0) return false;
  canvas.width = ancho * escala; canvas.height = alto * escala;
  canvas.getContext("2d").setTransform(escala, 0, 0, escala, 0, 0);
  return true;
}

function mapaPunto(x, y, canvas, rango = 5) {
  return { x: canvas.clientWidth / 2 + x * canvas.clientWidth / (rango * 2), y: canvas.clientHeight / 2 - y * canvas.clientWidth / (rango * 2) };
}

function campoEn(x, y) {
  return cargas.reduce((total, carga) => {
    const dx = x - carga.x; const dy = y - carga.y; const r2 = Math.max(dx * dx + dy * dy, 0.001);
    const factor = K * carga.q / Math.pow(r2, 1.5);
    return { x: total.x + factor * dx, y: total.y + factor * dy };
  }, { x: 0, y: 0 });
}

function potencialEn(x, y) {
  return cargas.reduce((total, carga) => total + K * carga.q / Math.max(Math.hypot(x - carga.x, y - carga.y), 0.001), 0);
}

function dibujarHero() {
  const { canvas, ctx } = canvasContext("#canvas-hero"); ajustarCanvas(canvas);
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  ctx.strokeStyle = "#5b806a55"; ctx.lineWidth = 1;
  for (let i = 0; i < 16; i += 1) { const a = (i / 16) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(canvas.clientWidth / 2, canvas.clientHeight / 2); ctx.lineTo(canvas.clientWidth / 2 + Math.cos(a) * canvas.clientWidth * .45, canvas.clientHeight / 2 + Math.sin(a) * canvas.clientHeight * .45); ctx.stroke(); }
  ctx.beginPath(); ctx.arc(canvas.clientWidth / 2, canvas.clientHeight / 2, canvas.clientWidth * .2, 0, Math.PI * 2); ctx.fillStyle = "#d75b4d"; ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = "white"; ctx.font = "bold 28px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("+", canvas.clientWidth / 2, canvas.clientHeight / 2);
}

function dibujarCampo() {
  const { canvas, ctx } = canvasContext("#canvas-campo"); if (!ajustarCanvas(canvas)) return;
  const ancho = canvas.clientWidth; const alto = canvas.clientHeight; ctx.clearRect(0, 0, ancho, alto);
  const escala = ancho / 10;
  if ($("#mostrar-malla").checked) { ctx.strokeStyle = "#6e817633"; ctx.lineWidth = 1; for (let x = 0; x <= 10; x += 1) { ctx.beginPath(); ctx.moveTo(x * escala, 0); ctx.lineTo(x * escala, alto); ctx.stroke(); } for (let y = 0; y <= alto / escala; y += 1) { ctx.beginPath(); ctx.moveTo(0, y * escala); ctx.lineTo(ancho, y * escala); ctx.stroke(); } }
  if ($("#mostrar-lineas").checked) { ctx.strokeStyle = "#4a806855"; ctx.lineWidth = 1; cargas.forEach((carga) => { for (let i = 0; i < 18; i += 1) { let x = carga.x + Math.cos(i * Math.PI * 2 / 18) * .22; let y = carga.y + Math.sin(i * Math.PI * 2 / 18) * .22; ctx.beginPath(); for (let paso = 0; paso < 90; paso += 1) { const p = mapaPunto(x, y, canvas); if (paso === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); const e = campoEn(x, y); const mag = Math.hypot(e.x, e.y) || 1; const sentido = carga.q > 0 ? 1 : -1; x += sentido * e.x / mag * .035; y += sentido * e.y / mag * .035; if (Math.abs(x) > 5 || Math.abs(y) > 3) break; } ctx.stroke(); } }); }
  cargas.forEach((carga) => { const p = mapaPunto(carga.x, carga.y, canvas); ctx.beginPath(); ctx.arc(p.x, p.y, 14 + Math.abs(carga.q) / 1e-9, 0, Math.PI * 2); ctx.fillStyle = carga.q > 0 ? "#d75b4d" : "#3973a8"; ctx.fill(); ctx.fillStyle = "white"; ctx.font = "bold 16px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(carga.q > 0 ? "+" : "−", p.x, p.y); });
}

function dibujarPotencial() {
  const { canvas, ctx } = canvasContext("#canvas-potencial"); if (!ajustarCanvas(canvas)) return;
  const ancho = canvas.clientWidth; const alto = canvas.clientHeight; const imagen = ctx.createImageData(ancho, alto);
  for (let py = 0; py < alto; py += 1) for (let px = 0; px < ancho; px += 1) { const x = px / ancho * 10 - 5; const y = 3 - py / alto * 6; const v = Math.tanh(potencialEn(x, y) / 100); const intensidad = Math.abs(v); const r = v > 0 ? 220 + intensidad * 35 : 36 + (1 - intensidad) * 180; const g = v > 0 ? 72 + (1 - intensidad) * 145 : 142 + (1 - intensidad) * 80; const b = v < 0 ? 205 + intensidad * 35 : 80 + (1 - intensidad) * 150; const i = (py * ancho + px) * 4; imagen.data[i] = r; imagen.data[i + 1] = g; imagen.data[i + 2] = b; imagen.data[i + 3] = 255; }
  ctx.putImageData(imagen, 0, 0); cargas.forEach((carga) => { const p = mapaPunto(carga.x, carga.y, canvas); ctx.beginPath(); ctx.arc(p.x, p.y, 19, 0, Math.PI * 2); ctx.fillStyle = carga.q > 0 ? "#ee493d" : "#1769c2"; ctx.shadowColor = carga.q > 0 ? "#ff9b82" : "#82c5ff"; ctx.shadowBlur = 18; ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = "#fff"; ctx.font = "bold 22px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(carga.q > 0 ? "+" : "−", p.x, p.y); });
  const x = Number($("#punto-x").value); const y = Number($("#punto-y").value); const p = mapaPunto(x, y, canvas); ctx.beginPath(); ctx.arc(p.x, p.y, 12, 0, Math.PI * 2); ctx.fillStyle = "#101820"; ctx.shadowColor = "#fff"; ctx.shadowBlur = 8; ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = "#fff"; ctx.font = "bold 13px system-ui"; ctx.fillText("P", p.x, p.y); $("#resultado-potencial").textContent = `${potencialEn(x, y).toFixed(2)} V`; const e = campoEn(x, y); $("#resultado-campo").textContent = `${Math.hypot(e.x, e.y).toFixed(2)} N/C`; $("#resultado-componentes").textContent = `Ex ${e.x.toFixed(1)} · Ey ${e.y.toFixed(1)}`;
}

function dibujarCapacitor() {
  const { canvas, ctx } = canvasContext("#canvas-capacitor"); if (!ajustarCanvas(canvas)) return; const w = canvas.clientWidth; const h = canvas.clientHeight; ctx.clearRect(0, 0, w, h); const d = Number($("#distancia-capacitor").value); const voltaje = Number($("#voltaje-capacitor").value); const posicion = Number($("#posicion-dielectrico").value); const sep = 70 + d * 9; const cx = w / 2; const top = h / 2 - sep / 2; ctx.fillStyle = "#3f6f5b"; ctx.fillRect(cx - 150, top - 8, 300, 16); ctx.fillRect(cx - 150, top + sep - 8, 300, 16); ctx.fillStyle = "#b27732aa"; const anchoDielectrico = 260 * posicion / 100; ctx.fillRect(cx - anchoDielectrico / 2, top + 9, anchoDielectrico, sep - 18); ctx.strokeStyle = "#e4c27e"; ctx.setLineDash([5, 7]); for (let x = cx - 120; x <= cx + 120; x += 30) { ctx.beginPath(); ctx.moveTo(x, top + 20); ctx.lineTo(x, top + sep - 20); ctx.stroke(); } ctx.setLineDash([]); ctx.fillStyle = "white"; ctx.font = "bold 18px system-ui"; ctx.textAlign = "center"; ctx.fillText("+ + + + + + + +", cx, top + 5); ctx.fillText("− − − − − − − −", cx, top + sep + 6); const area = Number($("#area-capacitor").value) / 10000; const k = Number($("#dieletrico").value); const capacitancia = (1 + (k - 1) * posicion / 100) * EPSILON_0 * area / (d / 10000); const carga = capacitancia * voltaje; const energia = .5 * capacitancia * voltaje * voltaje; const campo = voltaje / (d / 10000); $("#area-salida").textContent = `${area * 10000} cm²`; $("#distancia-salida").textContent = `${(d / 10).toFixed(1)} mm`; $("#voltaje-capacitor-salida").textContent = `${voltaje} V`; $("#posicion-dielectrico-salida").textContent = `${posicion}%`; $("#capacitancia-salida").textContent = `${(capacitancia * 1e9).toFixed(2)} nF`; $("#carga-capacitor").textContent = `${(carga * 1e6).toFixed(2)} µC`; $("#campo-capacitor").textContent = `${(campo / 1000).toFixed(1)} kV/m`; $("#energia-capacitor").textContent = `${(energia * 1e6).toFixed(2)} µJ`; $("#estado-capacitor").textContent = campo > 3000000 ? "Revisar rigidez dieléctrica" : "Campo seguro";
}

function dibujarEnergia() { const canvas = $("#canvas-energia"); if (!ajustarCanvas(canvas)) return; const ctx = canvas.getContext("2d"); const w = canvas.clientWidth; const h = canvas.clientHeight; ctx.clearRect(0, 0, w, h); ctx.strokeStyle = "#3f6f5b"; ctx.lineWidth = 3; ctx.beginPath(); for (let x = 0; x < w; x += 2) { const v = x / w * 200; const y = h - (v * v / 40000) * (h - 20) - 10; if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke(); ctx.strokeStyle = "#d9ddd5"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, h - 10); ctx.lineTo(w, h - 10); ctx.stroke(); const c = Number($("#energia-c").value) * 1e-9; const v = Number($("#energia-v").value); $("#energia-resultado").textContent = `${(.5 * c * v * v * 1e6).toFixed(2)} µJ`; }

function dibujarTrayectoria() { const { canvas, ctx } = canvasContext("#canvas-trayectoria"); if (!ajustarCanvas(canvas)) return; const w = canvas.clientWidth; const h = canvas.clientHeight; ctx.fillStyle = "#202b2a"; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = "#6a897b55"; for (let x = 30; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); } for (let y = 30; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); } const velocidad = Number($("#velocidad-inicial").value); ctx.strokeStyle = "#d9aa63"; ctx.lineWidth = 3; ctx.beginPath(); for (let x = 0; x < w; x += 3) { const t = x / w * 2; const y = h * .75 - t * t * velocidad * 18; if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke(); ctx.fillStyle = "#d75b4d"; ctx.beginPath(); ctx.arc(w * .18, h * .75, 9, 0, Math.PI * 2); ctx.fill(); }

function conectar(id, evento, fn) { $(id).addEventListener(evento, fn); }
function refrescar() { dibujarCampo(); dibujarPotencial(); dibujarCapacitor(); dibujarEnergia(); dibujarTrayectoriaDinamica(); dibujarHero(); }
conectar("#caso-cargas", "change", (e) => { const caso = e.target.value; cargas.splice(0, cargas.length, ...(caso === "uno" ? [{ q: 5e-9, x: 0, y: 0 }] : caso === "iguales" ? [{ q: 5e-9, x: -1, y: 0 }, { q: 5e-9, x: 1, y: 0 }] : [{ q: 5e-9, x: -1, y: 0 }, { q: -5e-9, x: 1, y: 0 }])); refrescar(); });
["#carga-valor","#separacion","#mostrar-lineas","#mostrar-malla"].forEach((id) => conectar(id, "input", refrescar));
conectar("#carga-valor", "input", (e) => { cargas[0].q = Number(e.target.value) * 1e-9; $("#carga-valor-salida").textContent = `${e.target.value} nC`; });
conectar("#separacion", "input", (e) => { const s = Number(e.target.value); if (cargas[1]) { cargas[0].x = -s / 2; cargas[1].x = s / 2; } $("#separacion-salida").textContent = `${s.toFixed(1)} m`; });
["#punto-x","#punto-y"].forEach((id) => conectar(id, "input", () => { puntoPotencialFijado = true; puntoPotencial = { x: Number($("#punto-x").value), y: Number($("#punto-y").value) }; $("#modo-potencial").textContent = `P fijado · (${puntoPotencial.x.toFixed(1)}, ${puntoPotencial.y.toFixed(1)})`; dibujarPotencial(); }));
["#area-capacitor","#distancia-capacitor","#voltaje-capacitor","#posicion-dielectrico"].forEach((id) => conectar(id, "input", dibujarCapacitor));
conectar("#dieletrico", "change", dibujarCapacitor);
["#energia-c","#energia-v"].forEach((id) => conectar(id, "input", dibujarEnergia));
conectar("#velocidad-inicial", "input", (e) => { $("#velocidad-salida").textContent = `${Number(e.target.value).toFixed(1)} × 10⁶ m/s`; dibujarTrayectoriaDinamica(); });
conectar("#campo-uniforme", "input", (e) => { $("#campo-salida").textContent = `${Number(e.target.value).toFixed(1)} × 10³ N/C`; });
conectar("#voltaje-capacitor", "input", dibujarCapacitor);
conectar("#mostrar-trazo", "input", dibujarTrayectoriaDinamica);
conectar("#restablecer-cargas", "click", () => { $("#caso-cargas").value = "dipolo"; $("#carga-valor").value = 5; $("#separacion").value = 2; cargas.splice(0, 2, { q: 5e-9, x: -1, y: 0 }, { q: -5e-9, x: 1, y: 0 }); refrescar(); });
conectar("#alternar-tema", "click", () => { document.body.classList.toggle("tema-oscuro"); refrescar(); });
const canvasCampo = $("#canvas-campo");
let cargaArrastrada = -1;
function posicionDesdeCanvas(evento, canvas, rango = 5) {
  const rect = canvas.getBoundingClientRect();
  return { x: (evento.clientX - rect.left - canvas.clientWidth / 2) * rango * 2 / canvas.clientWidth, y: -(evento.clientY - rect.top - canvas.clientHeight / 2) * rango * 2 / canvas.clientWidth };
}
canvasCampo.addEventListener("pointerdown", (evento) => {
  const posicion = posicionDesdeCanvas(evento, canvasCampo);
  cargaArrastrada = cargas.findIndex((carga) => Math.hypot(carga.x - posicion.x, carga.y - posicion.y) < .45);
  if (cargaArrastrada >= 0) canvasCampo.setPointerCapture(evento.pointerId);
});
canvasCampo.addEventListener("pointermove", (evento) => {
  const posicion = posicionDesdeCanvas(evento, canvasCampo);
  if (cargaArrastrada >= 0) { cargas[cargaArrastrada].x = clamp(posicion.x, -4.8, 4.8); cargas[cargaArrastrada].y = clamp(posicion.y, -2.8, 2.8); refrescar(); return; }
  const campo = campoEn(posicion.x, posicion.y); $("#lectura-campo").textContent = `P(${posicion.x.toFixed(1)}, ${posicion.y.toFixed(1)}) · |E| ${Math.hypot(campo.x, campo.y).toFixed(1)} N/C`;
});
canvasCampo.addEventListener("pointerup", (evento) => { cargaArrastrada = -1; canvasCampo.releasePointerCapture?.(evento.pointerId); });
const canvasPotencial = $("#canvas-potencial");
canvasPotencial.addEventListener("pointerdown", (evento) => {
  const posicion = posicionDesdeCanvas(evento, canvasPotencial);
  puntoPotencialFijado = true; puntoPotencial = posicion; $("#punto-x").value = posicion.x.toFixed(1); $("#punto-y").value = posicion.y.toFixed(1); $("#modo-potencial").textContent = `P fijado · (${posicion.x.toFixed(1)}, ${posicion.y.toFixed(1)})`; dibujarPotencial(); canvasPotencial.setPointerCapture(evento.pointerId);
});
canvasPotencial.addEventListener("pointermove", (evento) => {
  if (puntoPotencialFijado) return;
  const posicion = posicionDesdeCanvas(evento, canvasPotencial);
  puntoPotencial = posicion; $("#punto-x").value = posicion.x.toFixed(1); $("#punto-y").value = posicion.y.toFixed(1); $("#modo-potencial").textContent = `Vista previa · P(${posicion.x.toFixed(1)}, ${posicion.y.toFixed(1)})`; dibujarPotencial();
});
canvasPotencial.addEventListener("dblclick", () => { puntoPotencialFijado = false; $("#modo-potencial").textContent = "Vista previa · mueve el cursor y haz clic para fijar"; });
let trayectoriaActiva = false;
let trayectoriaTiempo = 0;
function animarTrayectoria() {
  if (!trayectoriaActiva) return;
  trayectoriaTiempo += .016;
  const limite = 2.5;
  if (trayectoriaTiempo > limite) trayectoriaTiempo = 0;
  $("#tiempo-trayectoria").textContent = `${trayectoriaTiempo.toFixed(2)} s`;
  const velocidad = Number($("#velocidad-inicial").value) * 1e6;
  const campo = Number($("#campo-uniforme").value) * 1e3;
  const aceleracion = campo * 1.602e-19 / 9.109e-31;
  $("#aceleracion-trayectoria").textContent = `${aceleracion.toExponential(2)} m/s²`;
  $("#rapidez-trayectoria").textContent = `${(velocidad / 1e6).toFixed(2)} × 10⁶ m/s`;
  dibujarTrayectoriaDinamica();
  requestAnimationFrame(animarTrayectoria);
}
conectar("#iniciar-trayectoria", "click", () => { trayectoriaActiva = !trayectoriaActiva; $("#iniciar-trayectoria").textContent = trayectoriaActiva ? "Pausar" : "Continuar"; $("#estado-trayectoria").textContent = trayectoriaActiva ? "En ejecución" : "En pausa"; if (trayectoriaActiva) requestAnimationFrame(animarTrayectoria); });
conectar("#reiniciar-trayectoria", "click", () => { trayectoriaActiva = false; trayectoriaTiempo = 0; $("#iniciar-trayectoria").textContent = "Iniciar"; $("#estado-trayectoria").textContent = "En pausa"; $("#tiempo-trayectoria").textContent = "0.00 s"; dibujarTrayectoriaDinamica(); });
window.addEventListener("resize", refrescar);
refrescar();

function dibujarTrayectoriaDinamica() {
  const { canvas, ctx } = canvasContext("#canvas-trayectoria"); if (!ajustarCanvas(canvas)) return;
  const w = canvas.clientWidth; const h = canvas.clientHeight; ctx.fillStyle = "#202b2a"; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#6a897b55"; ctx.lineWidth = 1;
  for (let x = 30; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 30; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  const velocidad = Number($("#velocidad-inicial").value); const campo = Number($("#campo-uniforme").value);
  const progreso = trayectoriaTiempo / 2.5; const inicioX = w * .14; const inicioY = h * .68;
  if ($("#mostrar-trazo").checked) { ctx.strokeStyle = "#d9aa63"; ctx.lineWidth = 3; ctx.beginPath(); for (let x = 0; x <= w * .75; x += 3) { const t = x / (w * .75) * 2; const y = inicioY - t * t * campo * velocidad * 1.8; if (x === 0) ctx.moveTo(inicioX + x, y); else ctx.lineTo(inicioX + x, y); } ctx.stroke(); }
  const px = inicioX + progreso * w * .75; const py = inicioY - progreso * progreso * campo * velocidad * 1.8;
  ctx.fillStyle = "#d75b4d"; ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#f3d5a3"; ctx.font = "12px system-ui"; ctx.fillText("partícula", px + 14, py - 10);
}
