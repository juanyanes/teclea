// Grafica de linea de una sola serie en SVG, con tooltip al pasar el raton. Sin dependencias.
import { t } from "./i18n.js";

const NS = "http://www.w3.org/2000/svg";

function el(nombre, atributos = {}, texto) {
  const e = document.createElementNS(NS, nombre);
  for (const [k, v] of Object.entries(atributos)) e.setAttribute(k, v);
  if (texto !== undefined) e.textContent = texto;
  return e;
}

function pasoLimpio(rango, ticks = 4) {
  const bruto = rango / ticks;
  const pot = 10 ** Math.floor(Math.log10(bruto || 1));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * pot >= bruto) return m * pot;
  return 10 * pot;
}

// puntos: [{valor, etiqueta}] en orden; opciones: {formato, min, max}
export function dibujarLinea(contenedor, puntos, { formato = (v) => String(Math.round(v)), min = 0, max = null } = {}) {
  contenedor.replaceChildren();
  if (puntos.length < 2) {
    const p = document.createElement("p");
    p.className = "vacio";
    p.textContent = puntos.length ? t("grafica.unaMas") : t("grafica.sinLineas");
    contenedor.append(p);
    return;
  }
  const W = 600, H = 220, izq = 44, der = 16, arr = 12, aba = 28;
  const valores = puntos.map((p) => p.valor);
  const yMax = max ?? (Math.max(...valores) * 1.1 || 1);
  const yMin = min;
  const paso = pasoLimpio(yMax - yMin);
  const techo = Math.ceil(yMax / paso) * paso;
  const x = (i) => izq + (i * (W - izq - der)) / (puntos.length - 1);
  const y = (v) => arr + (H - arr - aba) * (1 - (v - yMin) / (techo - yMin));

  const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img" });
  const estilo = el("style");
  estilo.textContent = `
    .rejilla { stroke: var(--borde); stroke-width: 1; }
    .eje { fill: var(--texto-2); font: 11px system-ui, sans-serif; }
    .linea { fill: none; stroke: var(--serie); stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; }
    .area { fill: var(--serie); opacity: .1; }
    .punto { fill: var(--serie); stroke: var(--superficie); stroke-width: 2; }
    .ultimo { fill: var(--texto); font: 600 12px system-ui, sans-serif; }
    .zona { fill: transparent; }
    .zona:hover + .punto { r: 6; }`;
  svg.append(estilo);
  for (let v = yMin; v <= techo + 1e-9; v += paso) {
    svg.append(el("line", { class: "rejilla", x1: izq, x2: W - der, y1: y(v), y2: y(v) }));
    svg.append(el("text", { class: "eje", x: izq - 6, y: y(v) + 4, "text-anchor": "end" }, formato(v)));
  }
  const n = puntos.length;
  const cadaX = Math.max(1, Math.ceil(n / 6));
  puntos.forEach((p, i) => {
    if (i % cadaX === 0 || i === n - 1) {
      svg.append(el("text", { class: "eje", x: x(i), y: H - 8, "text-anchor": i === n - 1 ? "end" : i === 0 ? "start" : "middle" }, p.etiqueta));
    }
  });
  const camino = valores.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  svg.append(el("path", { class: "area", d: `${camino} L${x(n - 1).toFixed(1)},${y(yMin)} L${x(0).toFixed(1)},${y(yMin)} Z` }));
  svg.append(el("path", { class: "linea", d: camino }));
  const tooltip = document.getElementById("tooltip");
  puntos.forEach((p, i) => {
    const ancho = (W - izq - der) / (n - 1);
    const zona = el("rect", { class: "zona", x: x(i) - ancho / 2, y: arr, width: ancho, height: H - arr - aba });
    const punto = el("circle", { class: "punto", cx: x(i), cy: y(p.valor), r: n > 60 ? 2.5 : 4 });
    zona.addEventListener("mousemove", (ev) => {
      tooltip.textContent = `${p.detalle ?? p.etiqueta}: ${formato(p.valor)}`;
      tooltip.hidden = false;
      tooltip.style.left = `${ev.clientX + 12}px`;
      tooltip.style.top = `${ev.clientY - 30}px`;
    });
    zona.addEventListener("mouseleave", () => { tooltip.hidden = true; });
    svg.append(zona, punto);
  });
  const ultimo = puntos[n - 1];
  const yEtiqueta = y(ultimo.valor) - 10 < arr + 10 ? y(ultimo.valor) + 18 : y(ultimo.valor) - 10;
  svg.append(el("text", { class: "ultimo", x: x(n - 1) - 8, y: yEtiqueta, "text-anchor": "end" }, formato(ultimo.valor)));
  contenedor.append(svg);
}
