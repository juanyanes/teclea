import { test } from "node:test";
import assert from "node:assert/strict";
import { crearAzar } from "../sitio/js/azar.js";
import { generarLinea, listoParaSubir, nivel, niveles, palabrasDelCorpus, sinAcentos } from "../sitio/js/lecciones.js";
import { CORPUS } from "../sitio/js/textos.js";

const CORPUS_PRUEBA = ["Esta es una frase corta.", "Otra frase, con año y está.", "arte rata sarta", "Hola {nombre}."];

test("niveles acumulativos en cada distribucion", () => {
  for (const d of ["colemak", "qwerty", "latam"]) {
    let anterior = new Set();
    for (const n of niveles(d)) {
      if (n.frases) continue;
      for (const c of anterior) assert.ok(n.alfabeto.includes(c), `${d} nivel ${n.numero} perdio ${c}`);
      anterior = new Set(n.alfabeto);
    }
  }
});

test("nivel 1 es la fila base sin los indices estirados", () => {
  assert.equal(nivel("colemak", 1).alfabeto, "arstneio");
  assert.equal(nivel("qwerty", 1).alfabeto, "asdfjkl");
  assert.equal(nivel("latam", 1).alfabeto, "asdfjklñ");
  assert.equal(nivel("colemak", 2).alfabeto, "arstdhneio");
  assert.throws(() => nivel("qwerty", 99));
});

test("sinAcentos conserva la enie", () => {
  assert.equal(sinAcentos("año más pingüino Ñu"), "año mas pinguino Ñu");
});

test("palabras del corpus respetan alfabeto, quitan acentos e ignoran comodines", () => {
  const p = palabrasDelCorpus(CORPUS_PRUEBA, "arstneio");
  assert.ok(p.includes("arte") && p.includes("rata") && p.includes("esta"));
  assert.ok(!p.includes("ano"));
  assert.ok(!p.includes("nombre"));
  assert.ok(p.every((w) => [...w].every((c) => "arstneio".includes(c))));
});

test("linea de nivel bajo solo usa sus teclas", () => {
  const linea = generarLinea(nivel("colemak", 1), crearAzar(1), { palabras: 30, corpus: CORPUS_PRUEBA });
  assert.equal(linea.split(" ").length, 30);
  assert.ok([...linea].every((c) => "arstneio ".includes(c)), linea);
});

test("nivel 5 mete mayusculas y puntuacion", () => {
  const linea = generarLinea(nivel("qwerty", 5), crearAzar(7), { palabras: 60, corpus: CORPUS_PRUEBA });
  assert.ok(/[A-Z]/.test(linea));
  assert.ok(/[,.;]/.test(linea));
});

test("nivel de frases sustituye el nombre", () => {
  const az = { elegir: () => "Hola {nombre}.", azar: () => 0, entero: () => 2 };
  assert.equal(generarLinea(nivel("qwerty", 6), az, { corpus: CORPUS_PRUEBA, nombre: "Max" }), "Hola Max.");
});

test("misma semilla, misma linea", () => {
  const a = generarLinea(nivel("latam", 3), crearAzar(42), { corpus: CORPUS.es.frases });
  const b = generarLinea(nivel("latam", 3), crearAzar(42), { corpus: CORPUS.es.frases });
  assert.equal(a, b);
});

test("los corpus empaquetados sirven para los niveles bajos", () => {
  for (const [clave, c] of Object.entries(CORPUS)) {
    assert.ok(c.frases.length >= 15, clave);
    assert.ok(palabrasDelCorpus(c.frases, nivel("qwerty", 4).alfabeto).length >= 40, clave);
  }
});

test("listoParaSubir exige tres sesiones buenas del nivel", () => {
  const buena = (nivel) => ({ nivel, precision: 0.97, ppmNeto: 25 });
  const mala = (nivel) => ({ nivel, precision: 0.9, ppmNeto: 25 });
  assert.equal(listoParaSubir([buena(1), buena(1)], 1), false);
  assert.equal(listoParaSubir([buena(1), buena(1), buena(1)], 1), true);
  assert.equal(listoParaSubir([mala(1), buena(1), buena(1), buena(1)], 1), true);
  assert.equal(listoParaSubir([buena(1), buena(1), mala(1)], 1), false);
  assert.equal(listoParaSubir([buena(2), buena(2), buena(2)], 1), false);
  assert.equal(listoParaSubir([buena(6), buena(6), buena(6)], 6), false);
});
