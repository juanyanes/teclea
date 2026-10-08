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

## Bloqueado: teclea.yanes.me no resuelve (2026-10-08)

El deploy engancha `teclea.yanes.me (custom domain)` y Cloudflare emite el certificado, pero el registro DNS
no aparece en ningun nameserver. Causa: la zona `yanes.me` de la cuenta Citadelta (id d95a4941...) esta en
estado **moved** (modificada el 2026-10-04) con nameservers asignados nadia/wesley, mientras el registro .me
publica josephine/aarav. La zona que de verdad sirve `yanes.me` no la ve el login de wrangler de mjolnir
(solo ve Citadelta y la cuenta personal, y ninguna tiene otra zona `yanes.me`). taleny.yanes.me sigue
resolviendo, pero una zona en "moved" se borra a los dias: revisar en el panel de Cloudflare > yanes.me
que la zona vuelva a "active" (o crear el registro en la zona viva). Despues, `make publicar` otra vez.

Probado en Chrome el 2026-10-08 (perfil, linea con error corregido, resultado, logros, progreso) sin errores en consola.

## Pendiente / ideas

- Modo "teclas debiles": lineas cargadas con las teclas que mas fallan del perfil.
- Nivel de numeros y simbolos de programacion.
- Mas frases en `curioso` (hoy 38) y revisar con Max cuales le gustan.
- Las pseudopalabras del nivel 1 en latam meten muchas enies; bajar su frecuencia.
- Service worker para usar sin red; sincronizacion entre maquinas (hoy, exportar/importar).
- Sonido o animacion al completar una linea (para Max).
- Dibujar el Colemak latam (Juan usa `latam+colemak` en GNOME) si el teclado en pantalla no coincide.
