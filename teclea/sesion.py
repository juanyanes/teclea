"""Una sesion de tecleo: registra cada tecla contra el texto esperado y calcula metricas.

No sabe nada de la terminal: recibe teclas por `teclear()` y un reloj inyectable,
para que los tests la ejerciten sin curses ni esperas reales.
"""

from __future__ import annotations

import time
from collections import defaultdict
from dataclasses import dataclass, field

RETROCESO = "\b"


@dataclass(frozen=True)
class Tecleo:
    esperado: str
    tecleado: str
    instante: float  # segundos desde la primera tecla

    @property
    def correcto(self) -> bool:
        return self.esperado == self.tecleado


@dataclass
class EstadisticaTecla:
    intentos: int = 0
    errores: int = 0
    latencias: list[float] = field(default_factory=list)

    @property
    def latencia_ms(self) -> float | None:
        if not self.latencias:
            return None
        return 1000 * sum(self.latencias) / len(self.latencias)


@dataclass(frozen=True)
class Resultado:
    caracteres: int
    segundos: float
    tecleos: int
    errores: int
    errores_sin_corregir: int
    teclas: dict[str, EstadisticaTecla]

    @property
    def minutos(self) -> float:
        return max(self.segundos, 1e-9) / 60

    @property
    def ppm_bruto(self) -> float:
        """Palabras por minuto contando 5 caracteres por palabra."""
        return (self.caracteres / 5) / self.minutos

    @property
    def ppm_neto(self) -> float:
        """PPM bruto menos una palabra por cada error que quedo sin corregir."""
        return max(0.0, self.ppm_bruto - self.errores_sin_corregir / self.minutos)

    @property
    def precision(self) -> float:
        if self.tecleos == 0:
            return 1.0
        return (self.tecleos - self.errores) / self.tecleos

    def teclas_debiles(self, n: int = 5) -> list[tuple[str, EstadisticaTecla]]:
        """Las teclas con mas errores y, a igual error, mas lentas."""
        con_datos = [(t, e) for t, e in self.teclas.items() if e.intentos]
        con_datos.sort(key=lambda par: (-par[1].errores / par[1].intentos, -(par[1].latencia_ms or 0)))
        return con_datos[:n]


class Sesion:
    """Estado de una pasada sobre `texto`.

    Las teclas equivocadas avanzan igual (se ven en rojo) y se corrigen con retroceso,
    como en los entrenadores habituales. La sesion termina cuando el ultimo caracter se teclea
    bien; los errores anteriores sin corregir se cobran en el PPM neto.
    """

    def __init__(self, texto: str, reloj=time.monotonic):
        if not texto:
            raise ValueError("el texto no puede estar vacio")
        self.texto = texto
        self._reloj = reloj
        self.escrito: list[str] = []
        self.tecleos: list[Tecleo] = []
        self._inicio: float | None = None
        self._ultimo: float | None = None
        self._fin: float | None = None

    @property
    def pos(self) -> int:
        return len(self.escrito)

    @property
    def iniciada(self) -> bool:
        return self._inicio is not None

    @property
    def terminada(self) -> bool:
        return self._fin is not None

    @property
    def segundos(self) -> float:
        if self._inicio is None:
            return 0.0
        fin = self._fin if self._fin is not None else self._reloj()
        return fin - self._inicio

    def teclear(self, tecla: str) -> None:
        if self.terminada:
            return
        ahora = self._reloj()
        if self._inicio is None:
            self._inicio = ahora
            self._ultimo = ahora
        if tecla == RETROCESO:
            if self.escrito:
                self.escrito.pop()
            return
        esperado = self.texto[self.pos]
        self.tecleos.append(Tecleo(esperado, tecla, ahora - self._inicio))
        self.escrito.append(tecla)
        self._ultimo = ahora
        if self.pos == len(self.texto) and tecla == esperado:
            self._fin = ahora

    def estado(self, i: int) -> str:
        """'pendiente', 'bien' o 'mal' para el caracter i del texto."""
        if i >= self.pos:
            return "pendiente"
        return "bien" if self.escrito[i] == self.texto[i] else "mal"

    def resultado(self) -> Resultado:
        if not self.tecleos:
            raise ValueError("no se tecleo nada")
        teclas: dict[str, EstadisticaTecla] = defaultdict(EstadisticaTecla)
        anterior = self.tecleos[0].instante
        for i, t in enumerate(self.tecleos):
            est = teclas[t.esperado]
            est.intentos += 1
            if not t.correcto:
                est.errores += 1
            if i > 0:
                est.latencias.append(t.instante - anterior)
            anterior = t.instante
        errores = sum(1 for t in self.tecleos if not t.correcto)
        sin_corregir = sum(1 for i, c in enumerate(self.escrito) if c != self.texto[i])
        return Resultado(
            caracteres=len(self.texto),
            segundos=self.segundos,
            tecleos=len(self.tecleos),
            errores=errores,
            errores_sin_corregir=sin_corregir,
            teclas=dict(teclas),
        )
