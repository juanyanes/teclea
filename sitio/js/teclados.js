// Distribuciones de teclado: filas fisicas para dibujar, dedo por columna y teclas con mayusculas.

export const DISTRIBUCIONES = {
  colemak: {
    nombre: "Colemak",
    filas: ["`1234567890-=", "qwfpgjluy;[]", "arstdhneio'", "zxcvbkm,./"],
    mayusculas: { "`": "~", 1: "!", 2: "@", 3: "#", 4: "$", 5: "%", 6: "^", 7: "&", 8: "*", 9: "(", 0: ")",
      "-": "_", "=": "+", "[": "{", "]": "}", ";": ":", "'": '"', ",": "<", ".": ">", "/": "?" },
  },
  qwerty: {
    nombre: "QWERTY (inglés)",
    filas: ["`1234567890-=", "qwertyuiop[]", "asdfghjkl;'", "zxcvbnm,./"],
    mayusculas: { "`": "~", 1: "!", 2: "@", 3: "#", 4: "$", 5: "%", 6: "^", 7: "&", 8: "*", 9: "(", 0: ")",
      "-": "_", "=": "+", "[": "{", "]": "}", ";": ":", "'": '"', ",": "<", ".": ">", "/": "?" },
  },
  latam: {
    nombre: "Latinoamericano (con ñ)",
    filas: ["|1234567890'¿", "qwertyuiop´+", "asdfghjklñ{", "zxcvbnm,.-"],
    mayusculas: { "|": "°", 1: "!", 2: '"', 3: "#", 4: "$", 5: "%", 6: "&", 7: "/", 8: "(", 9: ")", 0: "=",
      "'": "?", "¿": "¡", "´": "¨", "+": "*", "{": "[", ",": ";", ".": ":", "-": "_" },
  },
};

export const DEDOS = ["meñique", "anular", "medio", "índice", "índice", "índice", "índice", "medio", "anular", "meñique"];

// Dedo para la columna `col` de una fila; la fila de numeros va corrida una tecla a la izquierda.
export function dedoDeColumna(fila, col) {
  const i = fila === 0 ? col - 1 : col;
  if (i < 0) return { dedo: "meñique", mano: "izq" };
  const idx = Math.min(i, DEDOS.length - 1);
  return { dedo: DEDOS[idx], mano: idx <= 4 ? "izq" : "der" };
}

const VOCAL_BASE = { á: "a", é: "e", í: "i", ó: "o", ú: "u", ü: "u", Á: "A", É: "E", Í: "I", Ó: "O", Ú: "U", Ü: "U" };

// Teclas fisicas que hay que pulsar para producir `caracter` en la distribucion dada.
// Devuelve {tecla, shift, muerta}: `muerta` es la tecla de acento previa (solo latam).
export function teclasPara(caracter, distribucion) {
  const d = DISTRIBUCIONES[distribucion] ?? DISTRIBUCIONES.qwerty;
  if (caracter === " ") return { tecla: " ", shift: false, muerta: null };
  let muerta = null;
  let c = caracter;
  if (VOCAL_BASE[c]) {
    muerta = distribucion === "latam" ? (c === "ü" || c === "Ü" ? "¨" : "´") : null;
    c = VOCAL_BASE[c];
  }
  const baja = c.toLowerCase();
  const esLetra = baja !== c.toUpperCase();
  if (esLetra) return { tecla: baja, shift: c !== baja, muerta };
  for (const [base, alta] of Object.entries(d.mayusculas)) {
    if (alta === c) return { tecla: base, shift: true, muerta };
  }
  return { tecla: c, shift: false, muerta };
}

// Letras (solo letras) por fila: [superior, base, inferior]. La fila de numeros no cuenta.
export function letrasPorFila(distribucion) {
  const d = DISTRIBUCIONES[distribucion];
  const soloLetras = (s) => [...s].filter((c) => c.toLowerCase() !== c.toUpperCase()).join("");
  return { superior: soloLetras(d.filas[1]), base: soloLetras(d.filas[2]), inferior: soloLetras(d.filas[3]) };
}

// La fila base sin las dos teclas que exigen estirar los indices (posiciones 4 y 5).
export function centroFilaBase(distribucion) {
  const base = [...DISTRIBUCIONES[distribucion].filas[2]];
  return base.filter((c, i) => i !== 4 && i !== 5 && c.toLowerCase() !== c.toUpperCase()).join("");
}
