"""Registro de sesiones en SQLite, para ver el progreso y las teclas debiles con el tiempo."""

from __future__ import annotations

import os
import sqlite3
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path

from teclea.sesion import Resultado

ESQUEMA = """
CREATE TABLE IF NOT EXISTS sesiones (
    id INTEGER PRIMARY KEY,
    fecha TEXT NOT NULL,
    nivel INTEGER,
    idioma TEXT,
    caracteres INTEGER NOT NULL,
    segundos REAL NOT NULL,
    tecleos INTEGER NOT NULL,
    errores INTEGER NOT NULL,
    errores_sin_corregir INTEGER NOT NULL,
    ppm_bruto REAL NOT NULL,
    ppm_neto REAL NOT NULL,
    precision REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS teclas (
    sesion_id INTEGER NOT NULL REFERENCES sesiones(id),
    tecla TEXT NOT NULL,
    intentos INTEGER NOT NULL,
    errores INTEGER NOT NULL,
    latencia_ms REAL
);
CREATE INDEX IF NOT EXISTS teclas_por_tecla ON teclas(tecla);
"""


def ruta_por_defecto() -> Path:
    if os.environ.get("TECLEA_DB"):
        return Path(os.environ["TECLEA_DB"])
    base = Path(os.environ.get("XDG_DATA_HOME", Path.home() / ".local" / "share"))
    return base / "teclea" / "teclea.db"


@dataclass(frozen=True)
class FilaSesion:
    fecha: str
    nivel: int | None
    ppm_neto: float
    precision: float
    caracteres: int


@dataclass(frozen=True)
class FilaTecla:
    tecla: str
    intentos: int
    errores: int
    latencia_ms: float | None

    @property
    def tasa_error(self) -> float:
        return self.errores / self.intentos if self.intentos else 0.0


class Registro:
    def __init__(self, ruta: Path | str | None = None):
        self.ruta = Path(ruta) if ruta is not None else ruta_por_defecto()
        if str(self.ruta) != ":memory:":
            self.ruta.parent.mkdir(parents=True, exist_ok=True)
        self._con = sqlite3.connect(self.ruta)
        self._con.executescript(ESQUEMA)

    def guardar(self, r: Resultado, nivel: int | None, idioma: str, ahora: datetime | None = None) -> int:
        fecha = (ahora or datetime.now(UTC)).isoformat(timespec="seconds")
        with self._con:
            cur = self._con.execute(
                "INSERT INTO sesiones (fecha, nivel, idioma, caracteres, segundos, tecleos, errores,"
                " errores_sin_corregir, ppm_bruto, ppm_neto, precision) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                (
                    fecha, nivel, idioma, r.caracteres, r.segundos, r.tecleos, r.errores,
                    r.errores_sin_corregir, r.ppm_bruto, r.ppm_neto, r.precision,
                ),
            )
            sesion_id = cur.lastrowid
            self._con.executemany(
                "INSERT INTO teclas (sesion_id, tecla, intentos, errores, latencia_ms) VALUES (?,?,?,?,?)",
                [(sesion_id, t, e.intentos, e.errores, e.latencia_ms) for t, e in r.teclas.items()],
            )
        return sesion_id

    def ultimas(self, n: int = 10) -> list[FilaSesion]:
        filas = self._con.execute(
            "SELECT fecha, nivel, ppm_neto, precision, caracteres FROM sesiones ORDER BY id DESC LIMIT ?", (n,)
        ).fetchall()
        return [FilaSesion(*f) for f in filas]

    def teclas_debiles(self, n: int = 8, minimo_intentos: int = 10) -> list[FilaTecla]:
        """Teclas con peor tasa de error acumulada (y mas lentas a igual tasa)."""
        filas = self._con.execute(
            "SELECT tecla, SUM(intentos), SUM(errores),"
            " SUM(latencia_ms * intentos) / SUM(intentos)"
            " FROM teclas WHERE latencia_ms IS NOT NULL GROUP BY tecla HAVING SUM(intentos) >= ?"
            " ORDER BY 1.0 * SUM(errores) / SUM(intentos) DESC, 4 DESC LIMIT ?",
            (minimo_intentos, n),
        ).fetchall()
        return [FilaTecla(*f) for f in filas]

    def total_sesiones(self) -> int:
        return self._con.execute("SELECT COUNT(*) FROM sesiones").fetchone()[0]

    def cerrar(self) -> None:
        self._con.close()
