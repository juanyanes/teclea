// Dibuja el teclado en pantalla y resalta la tecla siguiente.
import { t } from "./i18n.js";
import { DISTRIBUCIONES, dedoDeColumna, teclasPara } from "./teclados.js";

const INDICE_DEDO = { "meñique": 0, anular: 1, medio: 2, "índice": 3 };

export function dibujarTeclado(contenedor, distribucion) {
  const d = DISTRIBUCIONES[distribucion];
  contenedor.replaceChildren();
  d.filas.forEach((fila, f) => {
    const div = document.createElement("div");
    div.className = "fila-teclas";
    if (f === 3) div.append(teclaAncha(t("teclado.mayus"), "shift-izq"));
    [...fila].forEach((c, col) => {
      const t = document.createElement("div");
      const { dedo } = dedoDeColumna(f, col);
      t.className = `tecla dedo-${INDICE_DEDO[dedo]}`;
      t.dataset.tecla = c;
      t.textContent = c;
      if (f === 2 && (col === 3 || col === 6)) t.classList.add("guia");
      div.append(t);
    });
    if (f === 3) div.append(teclaAncha(t("teclado.mayus"), "shift-der"));
    contenedor.append(div);
  });
  const espacio = document.createElement("div");
  espacio.className = "fila-teclas";
  const barra = document.createElement("div");
  barra.className = "tecla espacio";
  barra.dataset.tecla = " ";
  barra.textContent = t("teclado.espacio");
  espacio.append(barra);
  contenedor.append(espacio);
  const leyenda = document.createElement("div");
  leyenda.className = "leyenda-dedos";
  leyenda.replaceChildren(...["meñique", "anular", "medio", "índice"].map((d, i) => {
    const sp = document.createElement("span");
    sp.className = `d${i}`;
    sp.textContent = t(`teclado.${d}`);
    return sp;
  }));
  contenedor.append(leyenda);
}

function teclaAncha(texto, id) {
  const t = document.createElement("div");
  t.className = "tecla ancha";
  t.dataset.tecla = id;
  t.textContent = texto;
  return t;
}

export function resaltar(contenedor, caracter, distribucion) {
  for (const t of contenedor.querySelectorAll(".siguiente, .primero")) t.classList.remove("siguiente", "primero");
  if (caracter === undefined || caracter === null) return;
  const { tecla, shift, muerta } = teclasPara(caracter, distribucion);
  const objetivo = contenedor.querySelector(`[data-tecla="${CSS.escape(tecla)}"]`);
  if (objetivo) objetivo.classList.add("siguiente");
  if (muerta) {
    const m = contenedor.querySelector(`[data-tecla="${CSS.escape(muerta)}"]`);
    if (m) m.classList.add("siguiente", "primero");
  }
  if (shift) {
    // El shift lo pulsa la otra mano.
    const fila = DISTRIBUCIONES[distribucion].filas.findIndex((f) => f.includes(tecla));
    const col = fila >= 0 ? DISTRIBUCIONES[distribucion].filas[fila].indexOf(tecla) : 0;
    const { mano } = dedoDeColumna(Math.max(fila, 0), col);
    const s = contenedor.querySelector(`[data-tecla="${mano === "izq" ? "shift-der" : "shift-izq"}"]`);
    if (s) s.classList.add("siguiente");
  }
}
