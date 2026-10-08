"""Niveles progresivos para Colemak y generacion de lineas de practica.

Los niveles bajos usan solo las teclas ya presentadas (fila base primero) y prefieren
palabras reales del corpus que quepan en ese alfabeto; si no alcanzan, inventan
pseudopalabras. Los niveles altos usan frases completas del corpus.
"""

from __future__ import annotations

import random
import unicodedata
from dataclasses import dataclass
from importlib import resources

FILA_BASE_CENTRO = "arstneio"
FILA_BASE = "arstdhneio"
FILA_SUPERIOR = "qwfpgjluy"
FILA_INFERIOR = "zxcvbkm"
PUNTUACION = ",.;'"


@dataclass(frozen=True)
class Nivel:
    numero: int
    nombre: str
    alfabeto: str  # vacio = frases completas del corpus
    mayusculas: bool = False
    puntuacion: bool = False

    @property
    def frases(self) -> bool:
        return not self.alfabeto


NIVELES: list[Nivel] = [
    Nivel(1, "Fila base, sin indices extendidos", FILA_BASE_CENTRO),
    Nivel(2, "Fila base completa", FILA_BASE),
    Nivel(3, "Fila base y superior", FILA_BASE + FILA_SUPERIOR),
    Nivel(4, "Las tres filas de letras", FILA_BASE + FILA_SUPERIOR + FILA_INFERIOR),
    Nivel(5, "Mayusculas y puntuacion", FILA_BASE + FILA_SUPERIOR + FILA_INFERIOR, True, True),
    Nivel(6, "Frases completas del corpus", ""),
]


def nivel(numero: int) -> Nivel:
    for n in NIVELES:
        if n.numero == numero:
            return n
    raise ValueError(f"no existe el nivel {numero}; hay del 1 al {len(NIVELES)}")


def cargar_corpus(idioma: str = "es") -> list[str]:
    """Frases del corpus empaquetado, una por linea, sin lineas vacias ni comentarios."""
    try:
        texto = resources.files("teclea.textos").joinpath(f"{idioma}.txt").read_text(encoding="utf-8")
    except FileNotFoundError:
        raise ValueError(f"no hay corpus para el idioma {idioma!r}") from None
    return [ln.strip() for ln in texto.splitlines() if ln.strip() and not ln.startswith("#")]


def _sin_acentos(palabra: str) -> str:
    """Quita tildes y dieresis pero conserva la enie, que es otra letra."""
    protegida = palabra.replace("ñ", "\0").replace("Ñ", "\1")
    descompuesta = unicodedata.normalize("NFD", protegida)
    limpia = "".join(c for c in descompuesta if unicodedata.category(c) != "Mn")
    return limpia.replace("\0", "ñ").replace("\1", "Ñ")


def palabras_del_corpus(corpus: list[str], alfabeto: str) -> list[str]:
    """Palabras del corpus (sin acentos ni signos) que usan solo letras del alfabeto."""
    permitidas = set(alfabeto)
    vistas: set[str] = set()
    for frase in corpus:
        for cruda in frase.split():
            palabra = "".join(c for c in _sin_acentos(cruda).lower() if c.isalpha())
            if palabra and set(palabra) <= permitidas:
                vistas.add(palabra)
    return sorted(vistas)


def pseudopalabra(rng: random.Random, alfabeto: str) -> str:
    """Una palabra inventada de 2 a 6 letras; alterna vocal y consonante cuando puede."""
    vocales = [c for c in alfabeto if c in "aeiou"]
    consonantes = [c for c in alfabeto if c not in "aeiou"]
    largo = rng.randint(2, 6)
    letras = []
    empieza_vocal = rng.random() < 0.5
    for i in range(largo):
        grupo = vocales if (i % 2 == 0) == empieza_vocal else consonantes
        letras.append(rng.choice(grupo or list(alfabeto)))
    return "".join(letras)


def generar_linea(niv: Nivel, rng: random.Random, palabras: int = 20, corpus: list[str] | None = None) -> str:
    """Una linea de practica para el nivel: `palabras` tokens, o una frase del corpus."""
    if corpus is None:
        corpus = cargar_corpus()
    if niv.frases:
        return rng.choice(corpus)
    reales = palabras_del_corpus(corpus, niv.alfabeto)
    tokens = []
    for _ in range(palabras):
        if len(reales) >= 20 and rng.random() < 0.7:
            palabra = rng.choice(reales)
        else:
            palabra = pseudopalabra(rng, niv.alfabeto)
        if niv.mayusculas and rng.random() < 0.25:
            palabra = palabra.capitalize()
        if niv.puntuacion and rng.random() < 0.2:
            palabra += rng.choice(PUNTUACION)
        tokens.append(palabra)
    return " ".join(tokens)
