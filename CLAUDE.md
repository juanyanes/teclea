# teclea

Entrenador de mecanografia en el navegador. Estaticos puros en `sitio/` (HTML, CSS, modulos ES), sin build ni dependencias.

- `make check` corre `node --check` y `node --test`; es la condicion para "probado".
- La logica (sesion, lecciones, teclados, registro, logros) no toca el DOM y vive separada de la vista; los tests van ahi.
- El registro recibe el almacen inyectado (`almacenEnMemoria()` en tests); nunca se toca localStorage desde los tests.
- Se publica con `make publicar` (Cloudflare Pages, proyecto `teclea`, dominio teclea.yanes.me).
- El estado del proyecto vive en `docs/ESTADO.md`.
