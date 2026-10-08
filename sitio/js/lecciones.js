// Niveles progresivos por distribucion y generacion de lineas de practica.
import { centroFilaBase, letrasPorFila } from "./teclados.js";

export const PUNTUACION = ",.;";

export function niveles(distribucion) {
  const filas = letrasPorFila(distribucion);
  const base = filas.base;
  const tres = base + filas.superior + filas.inferior;
  return [
    { numero: 1, nombre: "Fila base, sin estirar los índices", alfabeto: centroFilaBase(distribucion) },
    { numero: 2, nombre: "Fila base completa", alfabeto: base },
    { numero: 3, nombre: "Fila base y superior", alfabeto: base + filas.superior },
    { numero: 4, nombre: "Las tres filas de letras", alfabeto: tres },
    { numero: 5, nombre: "Mayúsculas y puntuación", alfabeto: tres, mayusculas: true, puntuacion: true },
    { numero: 6, nombre: "Frases completas", alfabeto: "", frases: true },
  ];
}

export function nivel(distribucion, numero) {
  const n = niveles(distribucion).find((x) => x.numero === numero);
  if (!n) throw new Error(`no existe el nivel ${numero}`);
  return n;
}

// Quita tildes y dieresis pero conserva la enie, que es otra letra.
export function sinAcentos(palabra) {
  return palabra
    .replace(/ñ/g, "\u0000").replace(/Ñ/g, "\u0001")
    .normalize("NFD").replace(/\p{M}/gu, "")
    .replace(/\u0000/g, "ñ").replace(/\u0001/g, "Ñ");
}

// Palabras del corpus (sin acentos ni signos ni comodines) que usan solo letras del alfabeto.
export function palabrasDelCorpus(corpus, alfabeto) {
  const permitidas = new Set(alfabeto);
  const vistas = new Set();
  for (const frase of corpus) {
    for (const cruda of frase.replace(/\{[a-z]+\}/g, " ").split(/\s+/)) {
      const palabra = [...sinAcentos(cruda).toLowerCase()].filter((c) => /\p{L}/u.test(c)).join("");
      if (palabra && [...palabra].every((c) => permitidas.has(c))) vistas.add(palabra);
    }
  }
  return [...vistas].sort();
}

export function pseudopalabra(az, alfabeto) {
  const letras = [...alfabeto];
  const vocales = letras.filter((c) => "aeiou".includes(c));
  const consonantes = letras.filter((c) => !"aeiou".includes(c));
  const largo = az.entero(2, 6);
  const empiezaVocal = az.azar() < 0.5;
  const salida = [];
  for (let i = 0; i < largo; i++) {
    const grupo = (i % 2 === 0) === empiezaVocal ? vocales : consonantes;
    salida.push(az.elegir(grupo.length ? grupo : letras));
  }
  return salida.join("");
}

// Una linea de practica. `nombre` sustituye el comodin {nombre} del corpus.
export function generarLinea(niv, az, { palabras = 20, corpus, nombre = "" } = {}) {
  if (niv.frases) return az.elegir(corpus).replace(/\{nombre\}/g, nombre || "alguien");
  const reales = palabrasDelCorpus(corpus, niv.alfabeto);
  const tokens = [];
  for (let i = 0; i < palabras; i++) {
    let palabra = reales.length >= 20 && az.azar() < 0.7 ? az.elegir(reales) : pseudopalabra(az, niv.alfabeto);
    if (niv.mayusculas && az.azar() < 0.25) palabra = palabra[0].toUpperCase() + palabra.slice(1);
    if (niv.puntuacion && az.azar() < 0.2) palabra += az.elegir([...PUNTUACION]);
    tokens.push(palabra);
  }
  return tokens.join(" ");
}

// Umbrales para sugerir subir de nivel: las ultimas 3 sesiones del nivel con esta precision y PPM.
export const UMBRAL_ASCENSO = { sesiones: 3, precision: 0.95, ppm: 20 };

export function listoParaSubir(sesiones, numeroNivel) {
  if (numeroNivel >= 6) return false;
  const delNivel = sesiones.filter((s) => s.nivel === numeroNivel).slice(-UMBRAL_ASCENSO.sesiones);
  if (delNivel.length < UMBRAL_ASCENSO.sesiones) return false;
  return delNivel.every((s) => s.precision >= UMBRAL_ASCENSO.precision && s.ppmNeto >= UMBRAL_ASCENSO.ppm);
}
