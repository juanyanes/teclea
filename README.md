# teclea

Entrenador de mecanografía en terminal. Sin dependencias: Python 3.12+ y la stdlib (`curses`, `sqlite3`).

Pensado para aprender **Colemak** de forma progresiva: los primeros niveles usan solo la fila base y van
sumando filas; los últimos usan frases completas en español (con tildes y ñ) o inglés. Cada sesión queda
registrada para ver el progreso y qué teclas fallan más.

## Uso

```sh
uv run teclea                 # frases en español (nivel 6)
uv run teclea -n 1            # fila base de Colemak: a r s t n e i o
uv run teclea -n 6 -i en      # frases en inglés
uv run teclea stats           # progreso y teclas débiles
uv run teclea niveles         # lista los niveles
```

Con `make instalar` queda el comando `teclea` en `~/.local/bin`.

Dentro de la sesión: escribe el texto; los aciertos se ven en verde y los errores en rojo subrayado;
retroceso corrige; Escape abandona sin guardar.

## Métricas

- **PPM bruto**: caracteres / 5 por minuto, medido desde la primera tecla hasta la última.
- **PPM neto**: el bruto menos una palabra por minuto por cada error que quedó sin corregir.
- **Precisión**: tecleos correctos sobre tecleos totales (los retrocesos no cuentan).
- **Teclas débiles**: por tecla esperada, errores sobre intentos y latencia media.

Las sesiones se guardan en `~/.local/share/teclea/teclea.db` (o en `$TECLEA_DB`).

## Desarrollo

```sh
make check    # ruff + pytest
```

La lógica (`sesion.py`, `lecciones.py`, `registro.py`) no toca la terminal; solo `tui.py` usa curses.
