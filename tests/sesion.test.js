import { test } from "node:test";
import assert from "node:assert/strict";
import { RETROCESO, Sesion, teclasDebiles } from "../sitio/js/sesion.js";

function reloj(paso = 0.2) {
  let t = 0;
  return () => (t += paso);
}
const teclearTodo = (s, teclas) => { for (const t of teclas) s.teclear(t); };
const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);

test("texto vacio no se acepta", () => {
  assert.throws(() => new Sesion(""));
});

test("termina al final y mide PPM", () => {
  const s = new Sesion("hola mundo", reloj(0.2));
  assert.equal(s.iniciada, false);
  teclearTodo(s, "hola mundo");
  assert.equal(s.terminada, true);
  const r = s.resultado();
  cerca(r.segundos, 1.8);
  assert.equal(r.precision, 1);
  assert.equal(r.sinCorregir, 0);
  cerca(r.ppmBruto, 2 / (1.8 / 60));
  assert.equal(r.ppmNeto, r.ppmBruto);
});

test("error corregido con retroceso cuenta como error pero no penaliza el neto", () => {
  const s = new Sesion("ab", reloj());
  teclearTodo(s, ["x", RETROCESO, "a", "b"]);
  const r = s.resultado();
  assert.equal(r.tecleos, 3);
  assert.equal(r.errores, 1);
  assert.equal(r.sinCorregir, 0);
  cerca(r.precision, 2 / 3);
  assert.equal(r.teclas.a.errores, 1);
  assert.equal(r.teclas.a.intentos, 2);
});

test("error sin corregir resta del neto", () => {
  const s = new Sesion("abcde", reloj());
  teclearTodo(s, "abcdx");
  assert.equal(s.terminada, false);
  teclearTodo(s, [RETROCESO, "e"]);
  const r = s.resultado();
  assert.equal(r.errores, 1);
  assert.equal(r.sinCorregir, 0);
});

test("no termina si el ultimo caracter esta mal, y los anteriores sin corregir se cobran", () => {
  const s = new Sesion("abcde", reloj());
  teclearTodo(s, "xbcde");
  const r = s.resultado();
  assert.equal(s.terminada, true);
  assert.equal(r.sinCorregir, 1);
  cerca(r.ppmNeto, r.ppmBruto - 1 / (r.segundos / 60));
});

test("estado por caracter y caracteres multibyte", () => {
  const s = new Sesion("añé", reloj());
  teclearTodo(s, ["a", "x"]);
  assert.deepEqual([0, 1, 2].map((i) => s.estado(i)), ["bien", "mal", "pendiente"]);
  assert.equal(s.texto.length, 3);
});

test("retroceso al inicio no rompe y no se teclea tras terminar", () => {
  const s = new Sesion("a", reloj());
  s.teclear(RETROCESO);
  assert.equal(s.pos, 0);
  s.teclear("a");
  s.teclear("b");
  assert.equal(s.pos, 1);
  assert.equal(s.resultado().tecleos, 1);
});

test("teclas debiles ordena por tasa de error y latencia", () => {
  const s = new Sesion("aabb", reloj());
  teclearTodo(s, ["a", "a", "x", RETROCESO, "b", "b"]);
  assert.equal(teclasDebiles(s.resultado().teclas, 1)[0].tecla, "b");
});

test("parcial da avance y precision en vivo", () => {
  const s = new Sesion("abcd", reloj());
  teclearTodo(s, ["a", "x"]);
  const p = s.parcial();
  assert.equal(p.avance, 0.5);
  assert.equal(p.precision, 0.5);
});
