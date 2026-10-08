"""Interfaz curses: muestra el texto, pinta cada caracter segun se teclea y reporta al final.

Es la unica parte que toca la terminal; recibe una `Sesion` ya construida y la alimenta.
"""

from __future__ import annotations

import curses
import textwrap

from teclea.sesion import RETROCESO, Resultado, Sesion

TECLAS_RETROCESO = {curses.KEY_BACKSPACE, 127, 8}
ESCAPE = 27


class Abandonada(Exception):
    """El usuario salio con Escape antes de terminar."""


def _lineas(texto: str, ancho: int) -> list[tuple[int, str]]:
    """Parte el texto en lineas de `ancho` y devuelve (indice del primer caracter, linea)."""
    lineas = []
    indice = 0
    for linea in textwrap.wrap(texto, width=ancho, drop_whitespace=False, break_long_words=True):
        lineas.append((indice, linea))
        indice += len(linea)
    return lineas


def _pintar(pantalla, sesion: Sesion, titulo: str) -> None:
    pantalla.erase()
    alto, ancho = pantalla.getmaxyx()
    margen = 2
    pantalla.addstr(0, margen, titulo[: ancho - margen - 1], curses.A_BOLD)
    pantalla.addstr(1, margen, "Escape para salir; retroceso corrige."[: ancho - margen - 1], curses.A_DIM)
    fila_cursor, col_cursor = 3, margen
    for fila, (inicio, linea) in enumerate(_lineas(sesion.texto, ancho - 2 * margen), start=3):
        if fila >= alto - 1:
            break
        for j, car in enumerate(linea):
            i = inicio + j
            estado = sesion.estado(i)
            atributo = {"bien": curses.color_pair(1), "mal": curses.color_pair(2) | curses.A_UNDERLINE}.get(
                estado, curses.A_NORMAL
            )
            if estado == "mal" and car == " ":
                car = "_"
            if i == sesion.pos:
                fila_cursor, col_cursor = fila, margen + j
            try:
                pantalla.addstr(fila, margen + j, car, atributo)
            except curses.error:
                pass
    pantalla.move(fila_cursor, col_cursor)
    pantalla.refresh()


def _leer_tecla(pantalla) -> str | None:
    """Devuelve el caracter tecleado, RETROCESO, o None si la tecla no interesa. Escape aborta."""
    tecla = pantalla.get_wch()
    if tecla == ESCAPE or tecla == "\x1b":
        raise Abandonada
    if isinstance(tecla, int):
        return RETROCESO if tecla in TECLAS_RETROCESO else None
    if tecla in ("\x7f", "\b"):
        return RETROCESO
    if tecla in ("\n", "\r", "\t"):
        return None
    return tecla if tecla.isprintable() else None


def _correr(pantalla, sesion: Sesion, titulo: str) -> None:
    curses.use_default_colors()
    curses.init_pair(1, curses.COLOR_GREEN, -1)
    curses.init_pair(2, curses.COLOR_RED, -1)
    pantalla.keypad(True)
    while not sesion.terminada:
        _pintar(pantalla, sesion, titulo)
        tecla = _leer_tecla(pantalla)
        if tecla is not None:
            sesion.teclear(tecla)
    _pintar(pantalla, sesion, titulo)


def practicar(sesion: Sesion, titulo: str) -> Resultado:
    """Corre la sesion en pantalla completa y devuelve el resultado. Lanza Abandonada con Escape."""
    curses.wrapper(_correr, sesion, titulo)
    return sesion.resultado()
