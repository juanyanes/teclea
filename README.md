# teclea

Entrenador de mecanografía en el navegador, para toda la familia: **https://teclea.yanes.me**.

Sin frameworks, sin build y sin servidor: HTML, CSS y JavaScript (módulos ES) servidos como estáticos.
Todo se guarda en el navegador (`localStorage`), con exportación e importación de respaldo en JSON.

## Qué hace

- **Perfiles** con su propia distribución de teclado (Colemak, QWERTY o latinoamericano con ñ), tamaño
  de línea y frases preferidas. Pensado para que un adulto en Colemak y un niño que empieza en QWERTY
  compartan la misma app.
- **Seis niveles progresivos** calculados a partir de la distribución: fila base sin estirar los índices,
  fila base completa, más la superior, las tres filas, mayúsculas y puntuación, y frases completas.
  Los niveles bajos prefieren palabras reales que quepan en las teclas ya vistas.
- **Teclado en pantalla** con los dedos por color y la tecla siguiente resaltada (incluida la de Mayús
  y la tecla muerta del acento en el teclado latinoamericano).
- **Frases por tema**: ajedrez, Pokémon, astrofísica, matemáticas, nuggets, pizza y peluches para quien
  empieza; frases generales en español; frases en inglés. `{nombre}` se sustituye por el del perfil.
- **Métricas**: PPM bruto, PPM neto (penaliza los errores sin corregir), precisión, latencia y errores
  por tecla, teclas débiles acumuladas.
- **Progreso y logros**: gráficas de PPM y precisión por línea, tabla de últimas líneas, y 14 logros
  (peón, caballo, torre, cohete, órbita, pizza entera, búho...). Sugiere subir de nivel tras tres
  líneas seguidas con 95 % de precisión y 20 PPM.

Dentro de la línea: verde acierta, rojo subrayado falla, retroceso corrige, Escape cambia la línea,
Enter al terminar da otra. Pegar texto no cuenta.

## Desarrollo

```sh
make check      # sintaxis (node --check) + tests (node --test)
make servir     # http://127.0.0.1:8766
make publicar   # make check + wrangler pages deploy sitio
```

Requiere Node 22+. La lógica (`sesion.js`, `lecciones.js`, `teclados.js`, `registro.js`, `logros.js`)
no toca el DOM y es lo que cubren los tests; `app.js`, `teclado-vista.js` y `grafica.js` son la vista.
