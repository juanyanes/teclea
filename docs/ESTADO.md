# Estado de teclea

Ultima actualizacion: 2026-10-08.

## Que hay

Proyecto creado el 2026-10-08. Entrenador de mecanografia en terminal, Python puro:

- `sesion.py`: registra tecleos contra el texto esperado; PPM bruto/neto, precision, latencia y errores por tecla.
- `lecciones.py`: 6 niveles (fila base de Colemak -> tres filas -> mayusculas/puntuacion -> frases del corpus).
  Los niveles bajos prefieren palabras reales del corpus que quepan en el alfabeto del nivel.
- `registro.py`: SQLite en `~/.local/share/teclea/teclea.db` (`$TECLEA_DB` lo cambia; los tests usan tmp_path).
- `tui.py`: curses, verde/rojo por caracter, retroceso corrige, Escape abandona.
- `cli.py`: `teclea [practicar] [-n nivel] [-i es|en] [-p palabras] [-s semilla]`, `teclea stats`, `teclea niveles`.

## Pendiente / ideas

- Un modo "teclas debiles": generar lineas cargadas con las teclas que mas fallan segun el registro.
- Niveles para los simbolos de programacion (`{}[]()<>=_-`) y numeros.
- Grafica de progreso (PPM por fecha) en `stats`.
- Corpus mas grande; hoy son 30 frases en espanol y 15 en ingles, escritas a mano.
- Mostrar el teclado Colemak en pantalla con la tecla siguiente resaltada (ayuda al principio).
