# Estado de teclea

Ultima actualizacion: 2026-10-08.

## Que hay

Creado el 2026-10-08 como CLI en Python; el mismo dia se reescribio como app web estatica en `sitio/`
para que la usen Juan (Colemak) y Max (9 anos, empieza; QWERTY/latam) desde cualquier navegador.

- `sitio/js/sesion.js`: tecleos contra el texto; PPM bruto/neto, precision, latencia y errores por tecla.
  La linea termina solo cuando el ultimo caracter esta bien.
- `sitio/js/teclados.js`: distribuciones colemak/qwerty/latam, dedo por columna, `teclasPara()` (shift y tecla muerta).
- `sitio/js/lecciones.js`: 6 niveles derivados de la distribucion; palabras reales del corpus que quepan en el alfabeto;
  `listoParaSubir()` (3 ultimas del nivel con >= 95 % y >= 20 PPM).
- `sitio/js/textos.js`: corpus `curioso` (temas de Max, con `{nombre}`), `es`, `en`.
- `sitio/js/registro.js`: perfiles y sesiones en localStorage (almacen inyectable); exportar/importar JSON.
- `sitio/js/logros.js`: 14 logros con tema de ajedrez, espacio y comida.
- Vista: `app.js` (perfiles, practica, progreso), `teclado-vista.js`, `grafica.js` (SVG, una serie, tooltip).
- `sitio/js/i18n.js`: interfaz en espanol e ingles (boton en la cabecera, se guarda en `teclea:idioma`; por defecto el idioma
  del navegador). Textos estaticos por `data-i18n`, dinamicos por `t()`. Las frases de practica NO se traducen: las elige el
  selector de frases. Un test exige las mismas claves en los dos diccionarios y que todo `data-i18n` del HTML exista.
- Entrada: textarea oculta; caracteres por `input` (sirve con teclas muertas), retroceso/Escape/Enter por `keydown`;
  pegar se ignora.
- Publicacion: Worker con estaticos `teclea` en la cuenta de Cloudflare de juan@yanes.me (la que tiene la zona
  `yanes.me`). `make publicar` = `wrangler deploy` con la sesion OAuth guardada en `~/.config/wrangler-yanes`
  (XDG_CONFIG_HOME aparte, para no pisar la sesion de Citadelta); `make login` la crea en otra maquina.
  Viva en https://teclea.yanes.me desde el 2026-10-08 (y https://teclea.taleny-clubes.workers.dev).

## Como esta enganchado el dominio (2026-10-08)

Ruta de zona `teclea.yanes.me/*` (en `wrangler.jsonc`) mas un registro DNS creado a mano en el panel:
`teclea` A `192.0.2.1` proxied (IP de relleno; la ruta manda al Worker antes de llegar a ningun origen).
No se uso "custom domain" porque en esta zona Cloudflare no creaba el registro DNS automatico (probado tres
veces, tambien con un hostname de control): el dominio quedaba enganchado con certificado pero sin DNS.
Si algun dia se borra ese registro A, la ruta deja de responder: recrearlo igual.

## Pendiente / ideas

- Modo "teclas debiles": lineas cargadas con las teclas que mas fallan del perfil.
- Nivel de numeros y simbolos de programacion.
- Mas frases en `curioso` (hoy 38) y revisar con Max cuales le gustan.
- Las pseudopalabras del nivel 1 en latam meten muchas enies; bajar su frecuencia.
- Service worker para usar sin red; sincronizacion entre maquinas (hoy, exportar/importar).
- Sonido o animacion al completar una linea (para Max).
- Dibujar el Colemak latam (Juan usa `latam+colemak` en GNOME) si el teclado en pantalla no coincide.
