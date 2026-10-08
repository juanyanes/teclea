# teclea

Entrenador de mecanografia en terminal. Python puro (stdlib), sin dependencias de ejecucion.

- `make check` corre ruff y pytest; es la condicion para "probado".
- La logica (sesion, lecciones, registro) no toca curses: todo lo que se pueda probar vive fuera de `tui.py`.
- Los tests nunca escriben en `~/.local/share/teclea`: el registro recibe la ruta de la base.
- El estado del proyecto vive en `docs/ESTADO.md`.
