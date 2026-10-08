"""Linea de comandos: `teclea` practica, `teclea stats` muestra el progreso, `teclea niveles` los lista."""

from __future__ import annotations

import argparse
import random
import sys

from teclea import __version__, lecciones
from teclea.registro import Registro
from teclea.sesion import Resultado, Sesion


def formatear_resultado(r: Resultado) -> str:
    lineas = [
        f"PPM neto: {r.ppm_neto:5.1f}   PPM bruto: {r.ppm_bruto:5.1f}   precision: {100 * r.precision:5.1f}%",
        (
            f"{r.caracteres} caracteres en {r.segundos:.1f} s; {r.errores} errores,"
            f" {r.errores_sin_corregir} sin corregir"
        ),
    ]
    debiles = [(t, e) for t, e in r.teclas_debiles() if e.errores or (e.latencia_ms or 0) > 400]
    if debiles:
        detalle = ", ".join(
            f"{t!r} {e.errores}/{e.intentos} err {e.latencia_ms or 0:.0f} ms" for t, e in debiles
        )
        lineas.append(f"teclas debiles: {detalle}")
    return "\n".join(lineas)


def formatear_stats(reg: Registro) -> str:
    total = reg.total_sesiones()
    if not total:
        return "Sin sesiones registradas todavia."
    lineas = [f"{total} sesiones. Ultimas:", "  fecha                nivel  ppm    precision  chars"]
    for f in reg.ultimas():
        nivel = str(f.nivel) if f.nivel is not None else "-"
        lineas.append(f"  {f.fecha[:19]}  {nivel:>5}  {f.ppm_neto:5.1f}  {100 * f.precision:7.1f}%  {f.caracteres:5d}")
    debiles = reg.teclas_debiles()
    if debiles:
        lineas.append("Teclas que mas fallan (acumulado):")
        for t in debiles:
            lat = f"{t.latencia_ms:.0f} ms" if t.latencia_ms is not None else "-"
            lineas.append(f"  {t.tecla!r:6} {100 * t.tasa_error:5.1f}% de {t.intentos:4d} intentos, {lat}")
    return "\n".join(lineas)


def formatear_niveles() -> str:
    lineas = []
    for n in lecciones.NIVELES:
        teclas = f"teclas: {n.alfabeto}" if n.alfabeto else "frases del corpus (--idioma)"
        lineas.append(f"  {n.numero}  {n.nombre:35} {teclas}")
    return "\n".join(lineas)


def construir_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="teclea", description="Entrenador de mecanografia en terminal.")
    p.add_argument("--version", action="version", version=f"teclea {__version__}")
    sub = p.add_subparsers(dest="orden")
    pr = sub.add_parser("practicar", help="una linea de practica (es la orden por defecto)")
    pr.add_argument("-n", "--nivel", type=int, default=6, help="nivel 1-6 (ver `teclea niveles`); 6 por defecto")
    pr.add_argument("-i", "--idioma", default="es", choices=["es", "en"], help="corpus para los niveles de frases")
    pr.add_argument("-p", "--palabras", type=int, default=20, help="palabras por linea en niveles 1-5")
    pr.add_argument("-s", "--semilla", type=int, help="semilla para repetir la misma linea")
    pr.add_argument("--sin-guardar", action="store_true", help="no registrar la sesion")
    sub.add_parser("stats", help="progreso y teclas debiles")
    sub.add_parser("niveles", help="lista los niveles")
    return p


def main(argv: list[str] | None = None) -> int:
    argv = list(sys.argv[1:] if argv is None else argv)
    if not argv or argv[0].startswith("-") and argv[0] not in ("-h", "--help", "--version"):
        argv.insert(0, "practicar")
    args = construir_parser().parse_args(argv)
    if args.orden == "niveles":
        print(formatear_niveles())
        return 0
    if args.orden == "stats":
        reg = Registro()
        print(formatear_stats(reg))
        reg.cerrar()
        return 0

    from teclea.tui import Abandonada, practicar

    niv = lecciones.nivel(args.nivel)
    rng = random.Random(args.semilla)
    corpus = lecciones.cargar_corpus(args.idioma)
    texto = lecciones.generar_linea(niv, rng, args.palabras, corpus)
    sesion = Sesion(texto)
    try:
        resultado = practicar(sesion, f"teclea  nivel {niv.numero}: {niv.nombre}")
    except Abandonada:
        print("Sesion abandonada; no se guarda.")
        return 1
    print(formatear_resultado(resultado))
    if not args.sin_guardar:
        reg = Registro()
        reg.guardar(resultado, niv.numero, args.idioma)
        reg.cerrar()
        print(f"Guardada en {reg.ruta}")
    return 0
