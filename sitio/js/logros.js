// Logros: se evaluan sobre la lista de sesiones del perfil. Cada uno devuelve true cuando se cumple.

const mismoDia = (a, b) => a.slice(0, 10) === b.slice(0, 10);

export const LOGROS = [
  { id: "peon", emoji: "♟️", nombre: "Peón", descripcion: "Tu primera sesión.", cumple: (s) => s.length >= 1 },
  { id: "caballo", emoji: "♞", nombre: "Caballo", descripcion: "Diez sesiones; el caballo ya salta.", cumple: (s) => s.length >= 10 },
  { id: "torre", emoji: "♜", nombre: "Torre", descripcion: "Una sesión con 100 % de precisión.", cumple: (s) => s.some((x) => x.precision >= 1) },
  { id: "alfil", emoji: "♝", nombre: "Alfil", descripcion: "Cinco sesiones seguidas con 95 % o más.",
    cumple: (s) => s.length >= 5 && s.slice(-5).every((x) => x.precision >= 0.95) },
  { id: "dama", emoji: "♛", nombre: "Dama", descripcion: "Cincuenta sesiones.", cumple: (s) => s.length >= 50 },
  { id: "rey", emoji: "♚", nombre: "Rey", descripcion: "Frases completas (nivel 6) a 40 PPM con 95 % de precisión.",
    cumple: (s) => s.some((x) => x.nivel === 6 && x.ppmNeto >= 40 && x.precision >= 0.95) },
  { id: "cohete", emoji: "🚀", nombre: "Cohete", descripcion: "30 palabras por minuto.", cumple: (s) => s.some((x) => x.ppmNeto >= 30) },
  { id: "orbita", emoji: "🪐", nombre: "En órbita", descripcion: "60 palabras por minuto.", cumple: (s) => s.some((x) => x.ppmNeto >= 60) },
  { id: "luz", emoji: "✨", nombre: "Velocidad de la luz", descripcion: "100 palabras por minuto.", cumple: (s) => s.some((x) => x.ppmNeto >= 100) },
  { id: "pizza", emoji: "🍕", nombre: "Pizza entera", descripcion: "Ocho sesiones en un mismo día, una por rebanada.",
    cumple: (s) => s.some((x) => s.filter((y) => mismoDia(x.fecha, y.fecha)).length >= 8) },
  { id: "nuggets", emoji: "🍗", nombre: "Caja de nuggets", descripcion: "Diez mil caracteres tecleados en total.",
    cumple: (s) => s.reduce((a, x) => a + x.caracteres, 0) >= 10000 },
  { id: "mil24", emoji: "🧮", nombre: "Dos elevado a diez", descripcion: "1024 palabras tecleadas en total.",
    cumple: (s) => Math.floor(s.reduce((a, x) => a + x.caracteres, 0) / 5) >= 1024 },
  { id: "buho", emoji: "🦉", nombre: "Búho", descripcion: "Una sesión después de las diez de la noche.",
    cumple: (s) => s.some((x) => new Date(x.fecha).getHours() >= 22) },
  { id: "peluche", emoji: "🧸", nombre: "Peluche", descripcion: "Practicar siete días distintos.",
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
