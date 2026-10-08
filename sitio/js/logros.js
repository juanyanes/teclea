// Logros: se evaluan sobre la lista de sesiones del perfil. Cada uno devuelve true cuando se cumple.
// Nombre y descripcion viven en i18n.js como logro.<id>.nombre y logro.<id>.desc.

const mismoDia = (a, b) => a.slice(0, 10) === b.slice(0, 10);

export const LOGROS = [
  { id: "peon", emoji: "♟️", cumple: (s) => s.length >= 1 },
  { id: "caballo", emoji: "♞", cumple: (s) => s.length >= 10 },
  { id: "torre", emoji: "♜", cumple: (s) => s.some((x) => x.precision >= 1) },
  { id: "alfil", emoji: "♝",
    cumple: (s) => s.length >= 5 && s.slice(-5).every((x) => x.precision >= 0.95) },
  { id: "dama", emoji: "♛", cumple: (s) => s.length >= 50 },
  { id: "rey", emoji: "♚",
    cumple: (s) => s.some((x) => x.nivel === 6 && x.ppmNeto >= 40 && x.precision >= 0.95) },
  { id: "cohete", emoji: "🚀", cumple: (s) => s.some((x) => x.ppmNeto >= 30) },
  { id: "orbita", emoji: "🪐", cumple: (s) => s.some((x) => x.ppmNeto >= 60) },
  { id: "luz", emoji: "✨", cumple: (s) => s.some((x) => x.ppmNeto >= 100) },
  { id: "pizza", emoji: "🍕",
    cumple: (s) => s.some((x) => s.filter((y) => mismoDia(x.fecha, y.fecha)).length >= 8) },
  { id: "nuggets", emoji: "🍗",
    cumple: (s) => s.reduce((a, x) => a + x.caracteres, 0) >= 10000 },
  { id: "mil24", emoji: "🧮",
    cumple: (s) => Math.floor(s.reduce((a, x) => a + x.caracteres, 0) / 5) >= 1024 },
  { id: "buho", emoji: "🦉",
    cumple: (s) => s.some((x) => new Date(x.fecha).getHours() >= 22) },
  { id: "peluche", emoji: "🧸",
    cumple: (s) => new Set(s.map((x) => x.fecha.slice(0, 10))).size >= 7 },
];

export function logrosCumplidos(sesiones) {
  return LOGROS.filter((l) => l.cumple(sesiones)).map((l) => l.id);
}

// Logros que se cumplen con la lista nueva y no con la anterior.
export function logrosNuevos(antes, despues) {
  const previos = new Set(logrosCumplidos(antes));
  return LOGROS.filter((l) => !previos.has(l.id) && l.cumple(despues));
}
