import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DICCIONARIOS, IDIOMAS, aplicarTraducciones, fijarIdioma, idioma, idiomaInicial, t } from "../sitio/js/i18n.js";
import { LOGROS } from "../sitio/js/logros.js";
import { niveles } from "../sitio/js/lecciones.js";
import { CORPUS } from "../sitio/js/textos.js";
import { DISTRIBUCIONES } from "../sitio/js/teclados.js";

test("los dos diccionarios tienen exactamente las mismas claves", () => {
  const es = Object.keys(DICCIONARIOS.es).sort();
  const en = Object.keys(DICCIONARIOS.en).sort();
  assert.deepEqual(en, es);
  assert.ok(es.length > 80);
});

test("ningun texto queda vacio y los parametros coinciden entre idiomas", () => {
  for (const clave of Object.keys(DICCIONARIOS.es)) {
    const params = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    assert.ok(DICCIONARIOS.es[clave].trim() && DICCIONARIOS.en[clave].trim(), clave);
    assert.deepEqual(params(DICCIONARIOS.en[clave]), params(DICCIONARIOS.es[clave]), clave);
  }
});

test("todo lo que el HTML marca con data-i18n existe en el diccionario", () => {
  const html = readFileSync(new URL("../sitio/index.html", import.meta.url), "utf8");
  const claves = [...html.matchAll(/data-i18n(?:-placeholder)?="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(claves.length > 40);
  for (const c of claves) assert.ok(c in DICCIONARIOS.es, `falta ${c}`);
});

test("logros, niveles, corpus y distribuciones tienen traduccion", () => {
  for (const l of LOGROS) {
    assert.ok(`logro.${l.id}.nombre` in DICCIONARIOS.es, l.id);
    assert.ok(`logro.${l.id}.desc` in DICCIONARIOS.es, l.id);
  }
  for (const n of niveles("qwerty")) assert.ok(n.clave in DICCIONARIOS.es, n.clave);
  for (const k of Object.keys(CORPUS)) assert.ok(`corpus.${k}` in DICCIONARIOS.es, k);
  for (const k of Object.keys(DISTRIBUCIONES)) assert.ok(`dist.${k}` in DICCIONARIOS.es, k);
});

test("t sustituye parametros y cae al espanol si falta la clave", () => {
  fijarIdioma("en");
  assert.equal(t("stats.progresoDe", { nombre: "Max" }), "Max's progress");
  assert.equal(t("clave.inexistente"), "clave.inexistente");
  fijarIdioma("es");
  assert.equal(t("practica.deIntentos", { errores: 1, intentos: 4 }), "1 de 4");
  assert.throws(() => fijarIdioma("fr"));
  assert.equal(idioma(), "es");
});

test("idioma inicial: guardado, luego navegador, luego ingles", () => {
  assert.equal(idiomaInicial("en", "es-MX"), "en");
  assert.equal(idiomaInicial(null, "es-MX"), "es");
  assert.equal(idiomaInicial("xx", "en-US"), "en");
  assert.equal(idiomaInicial(null, ""), "en");
  assert.deepEqual(IDIOMAS, ["es", "en"]);
});

test("aplicarTraducciones escribe texto y placeholder", () => {
  const nodos = [
    { dataset: { i18n: "nav.practicar" }, textContent: "" },
    { dataset: { i18nPlaceholder: "perfiles.tuNombre" }, placeholder: "" },
  ];
  const raiz = {
    documentElement: { setAttribute(k, v) { this[k] = v; } },
    querySelectorAll: (sel) => nodos.filter((n) => (sel === "[data-i18n]" ? "i18n" in n.dataset : "i18nPlaceholder" in n.dataset)),
  };
  fijarIdioma("en");
  aplicarTraducciones(raiz);
  assert.equal(nodos[0].textContent, "Practice");
  assert.equal(nodos[1].placeholder, "Your name");
  assert.equal(raiz.documentElement.lang, "en");
  fijarIdioma("es");
});
