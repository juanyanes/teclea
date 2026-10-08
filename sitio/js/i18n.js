// Textos de la interfaz en español e inglés. `t(clave, params)` devuelve el texto en el idioma activo.
// Las frases de práctica NO pasan por aquí: viven en textos.js y las elige el selector de frases.

export const IDIOMAS = ["es", "en"];

const ES = {
  "nav.practicar": "Practicar", "nav.progreso": "Progreso", "nav.cambiarPerfil": "Cambiar perfil",
  "idioma.cambiar": "English",
  "perfiles.quien": "¿Quién va a teclear?", "perfiles.nuevo": "➕ Nuevo perfil", "perfiles.nombre": "Nombre",
  "perfiles.tuNombre": "Tu nombre", "perfiles.teclado": "Teclado", "perfiles.frases": "Frases",
  "perfiles.palabrasPorLinea": "Palabras por línea", "perfiles.p6": "6 (muy cortas)", "perfiles.p8": "8 (cortas)",
  "perfiles.p12": "12", "perfiles.p20": "20 (largas)", "perfiles.letraGrande": "Letra grande",
  "perfiles.mostrarTeclado": "Mostrar el teclado en pantalla", "perfiles.crear": "Crear",
  "perfiles.nota": "Todo se guarda en este navegador. Desde Progreso puedes exportar un respaldo y cargarlo en otra máquina.",
  "perfiles.nivel": "nivel", "perfiles.lineas": "líneas", "perfiles.sinLineas": "Sin líneas todavía",
  "dist.latam": "Latinoamericano (con ñ)", "dist.qwerty": "QWERTY (inglés)", "dist.colemak": "Colemak",
  "corpus.curioso": "Ajedrez, Pokémon, espacio y mates", "corpus.es": "Frases en español", "corpus.en": "Frases en inglés",
  "nivel.1": "Fila base, sin estirar los índices", "nivel.2": "Fila base completa", "nivel.3": "Fila base y superior",
  "nivel.4": "Las tres filas de letras", "nivel.5": "Mayúsculas y puntuación", "nivel.6": "Frases completas",
  "practica.nivel": "Nivel", "practica.frases": "Frases", "practica.otraLinea": "Otra línea", "practica.ppm": "PPM",
  "practica.precision": "precisión", "practica.avisoFoco": "Haz clic aquí y empieza a escribir",
  "practica.pista": "Retroceso corrige · Escape cambia la línea · Enter, al terminar, da otra",
  "practica.segundos": "segundos", "practica.errores": "errores", "practica.lineaCompleta": "¡Línea completa!",
  "practica.muyBien": "¡Muy bien!", "practica.perfecto": "¡Perfecto, ni un error!",
  "practica.resistieron": "Se te resistieron: {lista}", "practica.deIntentos": "{errores} de {intentos}",
  "practica.espacio": "espacio", "practica.logro": "Logro: {nombre}",
  "practica.ascenso": "Tres líneas seguidas con buena precisión y velocidad. ¿Subimos de nivel?",
  "practica.subirAl": "Subir al nivel", "practica.otraLineaEnter": "Otra línea ⏎", "practica.alguien": "alguien",
  "teclado.mayus": "⇧ Mayús", "teclado.espacio": "espacio", "teclado.meñique": "meñique", "teclado.anular": "anular",
  "teclado.medio": "medio", "teclado.índice": "índice",
  "stats.progresoDe": "Progreso de {nombre}", "stats.lineas": "líneas", "stats.palabras": "palabras",
  "stats.mejorPpm": "mejor PPM", "stats.ppmUltimas": "PPM últimas 10", "stats.grafPpm": "Palabras por minuto, por línea",
  "stats.grafPrecision": "Precisión, por línea", "stats.teclasFallan": "Teclas que más fallan",
  "stats.sinTeclas": "Todavía no hay teclas con errores repetidos.", "stats.porcentajeDe": "{pct} % de {intentos}",
  "stats.logros": "Logros", "stats.ultimasLineas": "Últimas líneas", "stats.fecha": "Fecha", "stats.nivel": "Nivel",
  "stats.ppm": "PPM", "stats.precision": "Precisión", "stats.caracteres": "Caracteres", "stats.pct": "{pct} %",
  "stats.exportar": "Exportar respaldo", "stats.importar": "Importar respaldo", "stats.ajustes": "Ajustes del perfil",
  "stats.borrar": "Borrar este perfil", "stats.ajustesDe": "Ajustes de", "stats.guardar": "Guardar", "stats.cancelar": "Cancelar",
  "stats.confirmarBorrar": "¿Borrar el perfil de {nombre} con todas sus líneas? No se puede deshacer.",
  "stats.errorImportar": "No se pudo importar: {error}",
  "grafica.sinLineas": "Todavía no hay líneas.", "grafica.unaMas": "Con una línea más ya hay gráfica.",
  "logro.peon.nombre": "Peón", "logro.peon.desc": "Tu primera sesión.",
  "logro.caballo.nombre": "Caballo", "logro.caballo.desc": "Diez sesiones; el caballo ya salta.",
  "logro.torre.nombre": "Torre", "logro.torre.desc": "Una sesión con 100 % de precisión.",
  "logro.alfil.nombre": "Alfil", "logro.alfil.desc": "Cinco sesiones seguidas con 95 % o más.",
  "logro.dama.nombre": "Dama", "logro.dama.desc": "Cincuenta sesiones.",
  "logro.rey.nombre": "Rey", "logro.rey.desc": "Frases completas (nivel 6) a 40 PPM con 95 % de precisión.",
  "logro.cohete.nombre": "Cohete", "logro.cohete.desc": "30 palabras por minuto.",
  "logro.orbita.nombre": "En órbita", "logro.orbita.desc": "60 palabras por minuto.",
  "logro.luz.nombre": "Velocidad de la luz", "logro.luz.desc": "100 palabras por minuto.",
  "logro.pizza.nombre": "Pizza entera", "logro.pizza.desc": "Ocho sesiones en un mismo día, una por rebanada.",
  "logro.nuggets.nombre": "Caja de nuggets", "logro.nuggets.desc": "Diez mil caracteres tecleados en total.",
  "logro.mil24.nombre": "Dos elevado a diez", "logro.mil24.desc": "1024 palabras tecleadas en total.",
  "logro.buho.nombre": "Búho", "logro.buho.desc": "Una sesión después de las diez de la noche.",
  "logro.peluche.nombre": "Peluche", "logro.peluche.desc": "Practicar siete días distintos.",
};

const EN = {
  "nav.practicar": "Practice", "nav.progreso": "Progress", "nav.cambiarPerfil": "Switch profile",
  "idioma.cambiar": "Español",
  "perfiles.quien": "Who's typing?", "perfiles.nuevo": "➕ New profile", "perfiles.nombre": "Name",
  "perfiles.tuNombre": "Your name", "perfiles.teclado": "Keyboard", "perfiles.frases": "Sentences",
  "perfiles.palabrasPorLinea": "Words per line", "perfiles.p6": "6 (very short)", "perfiles.p8": "8 (short)",
  "perfiles.p12": "12", "perfiles.p20": "20 (long)", "perfiles.letraGrande": "Large text",
  "perfiles.mostrarTeclado": "Show the on-screen keyboard", "perfiles.crear": "Create",
  "perfiles.nota": "Everything is saved in this browser. From Progress you can export a backup and load it on another machine.",
  "perfiles.nivel": "level", "perfiles.lineas": "lines", "perfiles.sinLineas": "No lines yet",
  "dist.latam": "Latin American (with ñ)", "dist.qwerty": "QWERTY (US)", "dist.colemak": "Colemak",
  "corpus.curioso": "Chess, Pokémon, space and math", "corpus.es": "Spanish sentences", "corpus.en": "English sentences",
  "nivel.1": "Home row, without stretching the index fingers", "nivel.2": "Full home row", "nivel.3": "Home and top rows",
  "nivel.4": "All three letter rows", "nivel.5": "Capitals and punctuation", "nivel.6": "Full sentences",
  "practica.nivel": "Level", "practica.frases": "Sentences", "practica.otraLinea": "New line", "practica.ppm": "WPM",
  "practica.precision": "accuracy", "practica.avisoFoco": "Click here and start typing",
  "practica.pista": "Backspace fixes · Escape gets a new line · Enter, when done, gives another",
  "practica.segundos": "seconds", "practica.errores": "mistakes", "practica.lineaCompleta": "Line complete!",
  "practica.muyBien": "Well done!", "practica.perfecto": "Perfect, not a single mistake!",
  "practica.resistieron": "Tricky keys: {lista}", "practica.deIntentos": "{errores} of {intentos}",
  "practica.espacio": "space", "practica.logro": "Achievement: {nombre}",
  "practica.ascenso": "Three lines in a row with good accuracy and speed. Level up?",
  "practica.subirAl": "Go to level", "practica.otraLineaEnter": "New line ⏎", "practica.alguien": "someone",
  "teclado.mayus": "⇧ Shift", "teclado.espacio": "space", "teclado.meñique": "pinky", "teclado.anular": "ring",
  "teclado.medio": "middle", "teclado.índice": "index",
  "stats.progresoDe": "{nombre}'s progress", "stats.lineas": "lines", "stats.palabras": "words",
  "stats.mejorPpm": "best WPM", "stats.ppmUltimas": "WPM, last 10", "stats.grafPpm": "Words per minute, per line",
  "stats.grafPrecision": "Accuracy, per line", "stats.teclasFallan": "Keys you miss most",
  "stats.sinTeclas": "No keys with repeated mistakes yet.", "stats.porcentajeDe": "{pct}% of {intentos}",
  "stats.logros": "Achievements", "stats.ultimasLineas": "Latest lines", "stats.fecha": "Date", "stats.nivel": "Level",
  "stats.ppm": "WPM", "stats.precision": "Accuracy", "stats.caracteres": "Characters", "stats.pct": "{pct}%",
  "stats.exportar": "Export backup", "stats.importar": "Import backup", "stats.ajustes": "Profile settings",
  "stats.borrar": "Delete this profile", "stats.ajustesDe": "Settings for", "stats.guardar": "Save", "stats.cancelar": "Cancel",
  "stats.confirmarBorrar": "Delete {nombre}'s profile and all its lines? This cannot be undone.",
  "stats.errorImportar": "Could not import: {error}",
  "grafica.sinLineas": "No lines yet.", "grafica.unaMas": "One more line and there's a chart.",
  "logro.peon.nombre": "Pawn", "logro.peon.desc": "Your first session.",
  "logro.caballo.nombre": "Knight", "logro.caballo.desc": "Ten sessions; the knight jumps now.",
  "logro.torre.nombre": "Rook", "logro.torre.desc": "One session with 100% accuracy.",
  "logro.alfil.nombre": "Bishop", "logro.alfil.desc": "Five sessions in a row at 95% or better.",
  "logro.dama.nombre": "Queen", "logro.dama.desc": "Fifty sessions.",
  "logro.rey.nombre": "King", "logro.rey.desc": "Full sentences (level 6) at 40 WPM with 95% accuracy.",
  "logro.cohete.nombre": "Rocket", "logro.cohete.desc": "30 words per minute.",
  "logro.orbita.nombre": "In orbit", "logro.orbita.desc": "60 words per minute.",
  "logro.luz.nombre": "Speed of light", "logro.luz.desc": "100 words per minute.",
  "logro.pizza.nombre": "Whole pizza", "logro.pizza.desc": "Eight sessions in one day, one per slice.",
  "logro.nuggets.nombre": "Box of nuggets", "logro.nuggets.desc": "Ten thousand characters typed in total.",
  "logro.mil24.nombre": "Two to the tenth", "logro.mil24.desc": "1024 words typed in total.",
  "logro.buho.nombre": "Night owl", "logro.buho.desc": "A session after ten at night.",
  "logro.peluche.nombre": "Plushie", "logro.peluche.desc": "Practice on seven different days.",
};

export const DICCIONARIOS = { es: ES, en: EN };
export const LOCALES = { es: "es-MX", en: "en-US" };

let activo = "es";

export function idioma() { return activo; }

export function fijarIdioma(nuevo) {
  if (!IDIOMAS.includes(nuevo)) throw new Error(`idioma desconocido: ${nuevo}`);
  activo = nuevo;
}

// Idioma inicial: el guardado, o el del navegador si es español, o inglés.
export function idiomaInicial(guardado, navegador = "") {
  if (IDIOMAS.includes(guardado)) return guardado;
  return String(navegador).toLowerCase().startsWith("es") ? "es" : "en";
}

export function t(clave, params = {}) {
  let texto = DICCIONARIOS[activo][clave] ?? DICCIONARIOS.es[clave] ?? clave;
  for (const [k, v] of Object.entries(params)) texto = texto.replaceAll(`{${k}}`, String(v));
  return texto;
}

// Aplica el idioma a los elementos estaticos: data-i18n (texto) y data-i18n-placeholder.
export function aplicarTraducciones(raiz) {
  raiz.documentElement?.setAttribute("lang", activo);
  for (const el of raiz.querySelectorAll("[data-i18n]")) el.textContent = t(el.dataset.i18n);
  for (const el of raiz.querySelectorAll("[data-i18n-placeholder]")) el.placeholder = t(el.dataset.i18nPlaceholder);
}
