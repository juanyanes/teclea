import { test } from "node:test";
import assert from "node:assert/strict";
import { Registro, almacenEnMemoria } from "../sitio/js/registro.js";
import { LOGROS, logrosCumplidos, logrosNuevos } from "../sitio/js/logros.js";

const resultado = (extra = {}) => ({
  caracteres: 50, segundos: 10, tecleos: 52, errores: 2, sinCorregir: 0, ppmBruto: 60, ppmNeto: 60,
  precision: 50 / 52, teclas: { a: { intentos: 10, errores: 2, latenciaMs: 200 }, b: { intentos: 10, errores: 0, latenciaMs: 300 } },
  ...extra,
});

test("perfiles: crear, actualizar, borrar", () => {
  const reg = new Registro(almacenEnMemoria());
  assert.throws(() => reg.crearPerfil({ nombre: "  " }));
  const p = reg.crearPerfil({ nombre: "Max" });
  assert.equal(p.distribucion, "qwerty");
  assert.equal(p.nivel, 1);
  assert.equal(reg.perfiles().length, 1);
  reg.actualizarPerfil(p.id, { nivel: 3, distribucion: "latam" });
  assert.equal(reg.perfil(p.id).nivel, 3);
  assert.equal(reg.perfil(p.id).nombre, "Max");
  reg.borrarPerfil(p.id);
  assert.equal(reg.perfiles().length, 0);
});

test("sesiones: guardar, totales y teclas debiles acumuladas", () => {
  const reg = new Registro(almacenEnMemoria());
  const p = reg.crearPerfil({ nombre: "Juan", distribucion: "colemak" });
  for (let i = 0; i < 3; i++) reg.guardarSesion(p.id, resultado(), { nivel: 6, corpus: "es", fecha: new Date(2026, 9, 8, 10, i) });
  assert.equal(reg.sesiones(p.id).length, 3);
  const t = reg.totales(p.id);
  assert.equal(t.caracteres, 150);
  assert.equal(t.palabras, 30);
  assert.equal(t.mejorPpm, 60);
  const debiles = reg.teclasDebiles(p.id, { minimoIntentos: 20 });
  assert.equal(debiles[0].tecla, "a");
  assert.equal(debiles[0].intentos, 30);
  assert.equal(debiles[0].errores, 6);
  assert.equal(debiles[0].latenciaMs, 200);
});

test("exportar e importar mezclan sin duplicar", () => {
  const a = new Registro(almacenEnMemoria());
  const p = a.crearPerfil({ nombre: "Max" });
  a.guardarSesion(p.id, resultado(), { nivel: 1, corpus: "curioso", fecha: new Date("2026-10-08T10:00:00Z") });
  const respaldo = JSON.parse(JSON.stringify(a.exportar()));
  const b = new Registro(almacenEnMemoria());
  b.importar(respaldo);
  b.importar(respaldo);
  assert.equal(b.perfiles().length, 1);
  assert.equal(b.sesiones(p.id).length, 1);
  assert.throws(() => b.importar({ version: 7 }));
});

test("almacen corrupto no rompe", () => {
  const alm = almacenEnMemoria();
  alm.setItem("teclea:perfiles", "{no es json");
  assert.deepEqual(new Registro(alm).perfiles(), []);
});

test("logros", () => {
  const s = (extra) => ({ fecha: "2026-10-08T12:00:00", caracteres: 50, precision: 0.9, ppmNeto: 10, nivel: 1, ...extra });
  assert.deepEqual(logrosCumplidos([]), []);
  assert.deepEqual(logrosCumplidos([s()]), ["peon"]);
  assert.ok(logrosCumplidos([s({ precision: 1 })]).includes("torre"));
  assert.ok(logrosCumplidos([s({ ppmNeto: 35 })]).includes("cohete"));
  assert.ok(logrosCumplidos([s({ fecha: "2026-10-08T22:30:00" })]).includes("buho"));
  assert.ok(logrosCumplidos(Array(8).fill(s())).includes("pizza"));
  assert.ok(!logrosCumplidos(Array(7).fill(s())).includes("pizza"));
  const nuevos = logrosNuevos([s()], [s(), s({ precision: 1 })]).map((l) => l.id);
  assert.deepEqual(nuevos, ["torre"]);
  assert.equal(new Set(LOGROS.map((l) => l.id)).size, LOGROS.length);
});
