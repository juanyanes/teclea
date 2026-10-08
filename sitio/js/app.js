// Pega las piezas: perfiles, practica, resultados y progreso. Todo el estado vive en el Registro.
import { crearAzar } from "./azar.js";
import { dibujarLinea } from "./grafica.js";
import { generarLinea, listoParaSubir, nivel, niveles } from "./lecciones.js";
import { LOGROS, logrosCumplidos, logrosNuevos } from "./logros.js";
import { Registro, almacenEnMemoria } from "./registro.js";
import { RETROCESO, Sesion, teclasDebiles } from "./sesion.js";
import { dibujarTeclado, resaltar } from "./teclado-vista.js";
import { DISTRIBUCIONES } from "./teclados.js";
import { CORPUS } from "./textos.js";

const $ = (id) => document.getElementById(id);

function almacenDisponible() {
  try {
    localStorage.setItem("teclea:prueba", "1");
    localStorage.removeItem("teclea:prueba");
    return localStorage;
  } catch {
    return null;
  }
}

const registro = new Registro(almacenDisponible() ?? almacenEnMemoria());
let perfil = null;
let sesion = null;
let nivelActual = 1;
let corpusActual = "curioso";
let temporizador = null;
const az = crearAzar();

// ---------- navegación ----------
function ir(vista) {
  for (const v of document.querySelectorAll(".vista")) v.hidden = v.id !== `vista-${vista}`;
  $("nav").hidden = !perfil;
  if (vista === "perfiles") pintarPerfiles();
  if (vista === "practica") nuevaLinea();
  if (vista === "stats") pintarStats();
  window.scrollTo(0, 0);
}
document.body.addEventListener("click", (e) => {
  const destino = e.target.closest("[data-ir]");
  if (destino) {
    e.preventDefault();
    if (destino.dataset.ir !== "perfiles" && !perfil) return;
    ir(destino.dataset.ir);
  }
});

// ---------- perfiles ----------
function llenarCorpus(select) {
  select.replaceChildren(...Object.entries(CORPUS).map(([k, c]) => new Option(c.nombre, k)));
}

function pintarPerfiles() {
  const lista = $("lista-perfiles");
  lista.replaceChildren();
  const perfiles = registro.perfiles();
  for (const p of perfiles) {
    const b = document.createElement("button");
    b.className = "tarjeta perfil";
    const t = registro.totales(p.id);
    b.innerHTML = `<span class="nombre"></span><span class="detalle"></span><span class="detalle"></span>`;
    b.children[0].textContent = p.nombre;
    b.children[1].textContent = `${DISTRIBUCIONES[p.distribucion].nombre} · nivel ${p.nivel}`;
    b.children[2].textContent = t.sesiones ? `${t.sesiones} líneas · ${Math.round(t.ppmReciente)} PPM` : "Sin líneas todavía";
    b.addEventListener("click", () => elegirPerfil(p.id));
    lista.append(b);
  }
  $("nuevo-perfil").open = perfiles.length === 0;
}

function elegirPerfil(id) {
  perfil = registro.perfil(id);
  nivelActual = perfil.nivel;
  corpusActual = CORPUS[perfil.corpus] ? perfil.corpus : "curioso";
  $("chip-perfil").textContent = perfil.nombre;
  document.body.classList.toggle("letra-grande", !!perfil.letraGrande);
  try { localStorage.setItem("teclea:ultimo", id); } catch { /* sin almacenamiento */ }
  ir("practica");
}

$("form-perfil").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const p = registro.crearPerfil({
    nombre: f.get("nombre"),
    distribucion: f.get("distribucion"),
    corpus: f.get("corpus"),
    palabras: Number(f.get("palabras")),
    letraGrande: f.get("letraGrande") === "on",
    mostrarTeclado: f.get("mostrarTeclado") === "on",
  });
  e.target.reset();
  elegirPerfil(p.id);
});

// ---------- práctica ----------
function pintarControles() {
  const sel = $("sel-nivel");
  sel.replaceChildren(...niveles(perfil.distribucion).map((n) => new Option(`${n.numero} · ${n.nombre}`, n.numero)));
  sel.value = String(nivelActual);
  $("sel-corpus").value = corpusActual;
  const teclado = $("teclado");
  teclado.hidden = perfil.mostrarTeclado === false;
  if (!teclado.hidden) dibujarTeclado(teclado, perfil.distribucion);
}

function nuevaLinea() {
  pintarControles();
  const niv = nivel(perfil.distribucion, nivelActual);
  const texto = generarLinea(niv, az, { palabras: perfil.palabras, corpus: CORPUS[corpusActual].frases, nombre: perfil.nombre });
  sesion = new Sesion(texto);
  $("resultado").hidden = true;
  $("texto-marco").classList.remove("terminada");
  $("entrada").value = "";
  pintarTexto();
  pintarVivo();
  clearInterval(temporizador);
  temporizador = setInterval(pintarVivo, 250);
  $("entrada").focus({ preventScroll: true });
}

function pintarTexto() {
  const p = $("texto");
  p.replaceChildren(...sesion.texto.map((c, i) => {
    const s = document.createElement("span");
    s.className = sesion.estado(i);
    if (i === sesion.pos) s.classList.add("actual");
    s.textContent = c;
    return s;
  }));
  if (!$("teclado").hidden) resaltar($("teclado"), sesion.texto[sesion.pos], perfil.distribucion);
}

function pintarVivo() {
  if (!sesion) return;
  const p = sesion.parcial();
  $("vivo-ppm").textContent = sesion.iniciada ? Math.round(p.ppmBruto) : "0";
  $("vivo-precision").textContent = `${Math.round(100 * p.precision)}%`;
  $("progreso-barra").style.width = `${100 * p.avance}%`;
  $("cohete").style.left = `${100 * p.avance}%`;
}

function alimentar(tecla) {
  if (!sesion || sesion.terminada) return;
  sesion.teclear(tecla);
  pintarTexto();
  pintarVivo();
  if (sesion.terminada) terminar();
}

const entrada = $("entrada");
entrada.addEventListener("input", (e) => {
  // Los caracteres (incluidos los compuestos con tecla muerta) llegan por `input`; se vacía la caja cada vez.
  // Pegar o soltar texto no es teclear.
  if (e.inputType === "insertFromPaste" || e.inputType === "insertFromDrop") { entrada.value = ""; return; }
  if (entrada.value && !componiendo) {
    for (const c of entrada.value) alimentar(c);
    entrada.value = "";
  }
});
let componiendo = false;
entrada.addEventListener("compositionstart", () => { componiendo = true; });
entrada.addEventListener("compositionend", () => {
  componiendo = false;
  if (entrada.value) {
    for (const c of entrada.value) alimentar(c);
    entrada.value = "";
  }
});
entrada.addEventListener("keydown", (e) => {
  if (e.isComposing) return;
  if (e.key === "Backspace") { e.preventDefault(); alimentar(RETROCESO); }
  else if (e.key === "Escape") { e.preventDefault(); nuevaLinea(); }
  else if (e.key === "Enter") { e.preventDefault(); if (sesion?.terminada) nuevaLinea(); }
  else if (e.key === "Tab") { e.preventDefault(); }
});
$("texto-marco").addEventListener("click", () => entrada.focus({ preventScroll: true }));
$("btn-nueva").addEventListener("click", nuevaLinea);
$("btn-otra").addEventListener("click", nuevaLinea);
$("sel-nivel").addEventListener("change", (e) => {
  nivelActual = Number(e.target.value);
  registro.actualizarPerfil(perfil.id, { nivel: nivelActual });
  perfil = registro.perfil(perfil.id);
  nuevaLinea();
});
$("sel-corpus").addEventListener("change", (e) => {
  corpusActual = e.target.value;
  registro.actualizarPerfil(perfil.id, { corpus: corpusActual });
  perfil = registro.perfil(perfil.id);
  nuevaLinea();
});
$("btn-subir").addEventListener("click", () => {
  nivelActual = Math.min(6, nivelActual + 1);
  registro.actualizarPerfil(perfil.id, { nivel: nivelActual });
  perfil = registro.perfil(perfil.id);
  nuevaLinea();
});

function terminar() {
  clearInterval(temporizador);
  $("texto-marco").classList.add("terminada");
  const r = sesion.resultado();
  const antes = registro.sesiones(perfil.id);
  registro.guardarSesion(perfil.id, r, { nivel: nivelActual, corpus: corpusActual });
  const despues = registro.sesiones(perfil.id);

  $("res-titulo").textContent = r.precision >= 1 ? "¡Perfecto, ni un error!" : r.precision >= 0.95 ? "¡Muy bien!" : "¡Línea completa!";
  $("res-ppm").textContent = Math.round(r.ppmNeto);
  $("res-precision").textContent = `${Math.round(100 * r.precision)}%`;
  $("res-tiempo").textContent = r.segundos.toFixed(1);
  $("res-errores").textContent = r.errores;
  const debiles = teclasDebiles(r.teclas, 4).filter((t) => t.errores > 0);
  $("res-debiles").textContent = debiles.length
    ? `Se te resistieron: ${debiles.map((t) => `"${t.tecla === " " ? "espacio" : t.tecla}" (${t.errores} de ${t.intentos})`).join(", ")}`
    : "";
  const nuevos = logrosNuevos(antes, despues);
  $("res-logros").replaceChildren(...nuevos.map((l) => {
    const s = document.createElement("span");
    s.className = "logro-nuevo";
    s.textContent = `${l.emoji} Logro: ${l.nombre}`;
    s.title = l.descripcion;
    return s;
  }));
  const subir = listoParaSubir(despues, nivelActual);
  $("res-ascenso").hidden = !subir;
  $("res-siguiente").textContent = nivelActual + 1;
  $("resultado").hidden = false;
  $("btn-otra").focus();
}

// ---------- progreso ----------
const fechaCorta = (iso) => new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
const fechaLarga = (iso) => new Date(iso).toLocaleString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function pintarStats() {
  const sesiones = registro.sesiones(perfil.id);
  const t = registro.totales(perfil.id);
  $("stats-titulo").textContent = `Progreso de ${perfil.nombre}`;
  $("tot-sesiones").textContent = t.sesiones;
  $("tot-palabras").textContent = t.palabras.toLocaleString("es-MX");
  $("tot-mejor").textContent = Math.round(t.mejorPpm);
  $("tot-reciente").textContent = Math.round(t.ppmReciente);
  const ultimas = sesiones.slice(-100);
  dibujarLinea($("graf-ppm"), ultimas.map((s) => ({ valor: s.ppmNeto, etiqueta: fechaCorta(s.fecha), detalle: fechaLarga(s.fecha) })));
  dibujarLinea($("graf-precision"), ultimas.map((s) => ({ valor: 100 * s.precision, etiqueta: fechaCorta(s.fecha), detalle: fechaLarga(s.fecha) })),
    { formato: (v) => `${Math.round(v)}%`, min: 50, max: 100 });

  const debiles = registro.teclasDebiles(perfil.id).filter((d) => d.errores > 0);
  $("lista-debiles").replaceChildren(...debiles.map((d) => {
    const li = document.createElement("li");
    li.innerHTML = `<kbd></kbd><div class="barra"><i></i></div><small></small>`;
    li.querySelector("kbd").textContent = d.tecla === " " ? "␣" : d.tecla;
    li.querySelector("i").style.width = `${Math.min(100, 100 * d.tasaError / 0.5)}%`;
    li.querySelector("small").textContent = `${Math.round(100 * d.tasaError)} % de ${d.intentos}${d.latenciaMs ? ` · ${Math.round(d.latenciaMs)} ms` : ""}`;
    return li;
  }));
  if (!debiles.length) $("lista-debiles").innerHTML = '<li class="nota">Todavía no hay teclas con errores repetidos.</li>';

  const cumplidos = new Set(logrosCumplidos(sesiones));
  $("lista-logros").replaceChildren(...LOGROS.map((l) => {
    const d = document.createElement("div");
    d.className = `logro${cumplidos.has(l.id) ? "" : " bloqueado"}`;
    d.innerHTML = `<span class="emoji"></span><b></b><span></span>`;
    d.children[0].textContent = l.emoji;
    d.children[1].textContent = l.nombre;
    d.children[2].textContent = l.descripcion;
    return d;
  }));

  const cuerpo = $("tabla-sesiones").querySelector("tbody");
  cuerpo.replaceChildren(...sesiones.slice(-15).reverse().map((s) => {
    const tr = document.createElement("tr");
    tr.innerHTML = "<td></td><td class=num></td><td class=num></td><td class=num></td><td class=num></td>";
    tr.children[0].textContent = fechaLarga(s.fecha);
    tr.children[1].textContent = s.nivel;
    tr.children[2].textContent = Math.round(s.ppmNeto);
    tr.children[3].textContent = `${Math.round(100 * s.precision)} %`;
    tr.children[4].textContent = s.caracteres;
    return tr;
  }));
}

$("btn-exportar").addEventListener("click", () => {
  const datos = JSON.stringify(registro.exportar(), null, 1);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([datos], { type: "application/json" }));
  a.download = `teclea-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
});
$("inp-importar").addEventListener("change", async (e) => {
  const archivo = e.target.files[0];
  if (!archivo) return;
  try {
    registro.importar(JSON.parse(await archivo.text()));
    perfil = registro.perfil(perfil.id) ?? perfil;
    pintarStats();
  } catch (err) {
    alert(`No se pudo importar: ${err.message}`);
  }
  e.target.value = "";
});
$("btn-borrar").addEventListener("click", () => {
  if (!confirm(`¿Borrar el perfil de ${perfil.nombre} con todas sus líneas? No se puede deshacer.`)) return;
  registro.borrarPerfil(perfil.id);
  perfil = null;
  ir("perfiles");
});
$("btn-ajustes").addEventListener("click", () => {
  const f = $("form-ajustes");
  $("ajustes-nombre").textContent = perfil.nombre;
  f.distribucion.value = perfil.distribucion;
  f.palabras.value = String(perfil.palabras);
  f.letraGrande.checked = !!perfil.letraGrande;
  f.mostrarTeclado.checked = perfil.mostrarTeclado !== false;
  $("dlg-ajustes").showModal();
});
$("dlg-ajustes").addEventListener("close", () => {
  if ($("dlg-ajustes").returnValue !== "guardar") return;
  const f = $("form-ajustes");
  perfil = registro.actualizarPerfil(perfil.id, {
    distribucion: f.distribucion.value,
    palabras: Number(f.palabras.value),
    letraGrande: f.letraGrande.checked,
    mostrarTeclado: f.mostrarTeclado.checked,
  });
  document.body.classList.toggle("letra-grande", !!perfil.letraGrande);
  $("chip-perfil").textContent = perfil.nombre;
});

// ---------- arranque ----------
llenarCorpus($("form-corpus"));
llenarCorpus($("sel-corpus"));
let ultimo = null;
try { ultimo = localStorage.getItem("teclea:ultimo"); } catch { /* sin almacenamiento */ }
if (ultimo && registro.perfil(ultimo)) elegirPerfil(ultimo);
else ir("perfiles");
