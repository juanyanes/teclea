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
- Entrada: textarea oculta; caracteres por `input` (sirve con teclas muertas), retroceso/Escape/Enter por `keydown`;
  pegar se ignora.
- Publicacion: Worker con estaticos `teclea` en la cuenta Citadelta (`make publicar` = `npx wrangler deploy`,
  config en `wrangler.jsonc`). Viva en https://teclea.teclea.workers.dev desde el 2026-10-08.

## Bloqueado: teclea.yanes.me (2026-10-08)

La zona viva de `yanes.me` esta en OTRA cuenta de Cloudflare de Juan (movida el 2026-10-04), que el login de
wrangler de mjolnir no ve (solo ve Citadelta y la cuenta de yanes.juan@gmail.com). El Worker `teclea` se
desplego en Citadelta y por eso su dominio propio no obtiene registro DNS: la zona de Citadelta es el cascaron
en estado "moved". Para resolverlo: token de API de la cuenta buena en `.env` (ver `.env.example`) y
`make publicar`; despues borrar el Worker de Citadelta (`CLOUDFLARE_ACCOUNT_ID=d20bb391... npx wrangler delete`).
Mientras, la app vive en https://teclea.teclea.workers.dev.

## Pendiente / ideas

- Modo "teclas debiles": lineas cargadas con las teclas que mas fallan del perfil.
- Nivel de numeros y simbolos de programacion.
- Mas frases en `curioso` (hoy 38) y revisar con Max cuales le gustan.
- Las pseudopalabras del nivel 1 en latam meten muchas enies; bajar su frecuencia.
- Service worker para usar sin red; sincronizacion entre maquinas (hoy, exportar/importar).
- Sonido o animacion al completar una linea (para Max).
- Dibujar el Colemak latam (Juan usa `latam+colemak` en GNOME) si el teclado en pantalla no coincide.
