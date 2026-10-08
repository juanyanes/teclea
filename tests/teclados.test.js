import { test } from "node:test";
import assert from "node:assert/strict";
import { dedoDeColumna, teclasPara } from "../sitio/js/teclados.js";

test("teclasPara resuelve letras, mayusculas, simbolos y acentos", () => {
  assert.deepEqual(teclasPara("a", "qwerty"), { tecla: "a", shift: false, muerta: null });
  assert.deepEqual(teclasPara("A", "qwerty"), { tecla: "a", shift: true, muerta: null });
  assert.deepEqual(teclasPara("?", "qwerty"), { tecla: "/", shift: true, muerta: null });
  assert.deepEqual(teclasPara("?", "latam"), { tecla: "'", shift: true, muerta: null });
  assert.deepEqual(teclasPara("é", "latam"), { tecla: "e", shift: false, muerta: "´" });
  assert.deepEqual(teclasPara("ü", "latam"), { tecla: "u", shift: false, muerta: "¨" });
  assert.deepEqual(teclasPara("É", "colemak"), { tecla: "e", shift: true, muerta: null });
  assert.deepEqual(teclasPara("ñ", "latam"), { tecla: "ñ", shift: false, muerta: null });
  assert.deepEqual(teclasPara(" ", "colemak"), { tecla: " ", shift: false, muerta: null });
});

test("dedo por columna", () => {
  assert.deepEqual(dedoDeColumna(2, 0), { dedo: "meñique", mano: "izq" });
  assert.deepEqual(dedoDeColumna(2, 4), { dedo: "índice", mano: "izq" });
  assert.deepEqual(dedoDeColumna(2, 5), { dedo: "índice", mano: "der" });
  assert.deepEqual(dedoDeColumna(2, 11), { dedo: "meñique", mano: "der" });
  assert.deepEqual(dedoDeColumna(0, 1), { dedo: "meñique", mano: "izq" });
  assert.deepEqual(dedoDeColumna(0, 0), { dedo: "meñique", mano: "izq" });
});
