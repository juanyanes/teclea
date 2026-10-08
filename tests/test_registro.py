from datetime import UTC, datetime

from teclea.registro import Registro
from teclea.sesion import RETROCESO, Sesion


class Reloj:
    def __init__(self):
        self.t = 0.0

    def __call__(self):
        self.t += 0.1
        return self.t


def resultado(texto, teclas):
    s = Sesion(texto, reloj=Reloj())
    for t in teclas:
        s.teclear(t)
    return s.resultado()


def test_guarda_y_lista_sesiones(tmp_path):
    reg = Registro(tmp_path / "t.db")
    assert reg.total_sesiones() == 0
    reg.guardar(resultado("abc", "abc"), nivel=2, idioma="es", ahora=datetime(2026, 10, 8, tzinfo=UTC))
    reg.guardar(resultado("abc", "abx"), nivel=6, idioma="en")
    assert reg.total_sesiones() == 2
    ultimas = reg.ultimas()
    assert [f.nivel for f in ultimas] == [6, 2]  # la mas reciente primero
    assert ultimas[1].fecha.startswith("2026-10-08")
    assert ultimas[1].precision == 1.0
    reg.cerrar()


def test_teclas_debiles_acumulan_entre_sesiones(tmp_path):
    reg = Registro(tmp_path / "t.db")
    for _ in range(6):
        reg.guardar(resultado("abab", ["a", "b", "a", "x", RETROCESO, "b"]), nivel=1, idioma="es")
    debiles = reg.teclas_debiles(n=2, minimo_intentos=5)
    assert debiles[0].tecla == "b"
    assert debiles[0].errores == 6
    assert debiles[0].intentos == 18
    assert debiles[0].tasa_error > debiles[1].tasa_error
    reg.cerrar()


def test_ruta_por_defecto_respeta_variable(tmp_path, monkeypatch):
    monkeypatch.setenv("TECLEA_DB", str(tmp_path / "x" / "y.db"))
    reg = Registro()
    assert reg.ruta == tmp_path / "x" / "y.db"
    assert reg.ruta.exists()
    reg.cerrar()
