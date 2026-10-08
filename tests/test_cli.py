from teclea import cli
from teclea.registro import Registro
from teclea.sesion import Sesion


class Reloj:
    def __init__(self):
        self.t = 0.0

    def __call__(self):
        self.t += 0.1
        return self.t


def test_niveles_y_stats_sin_tocar_el_home(tmp_path, monkeypatch, capsys):
    monkeypatch.setenv("TECLEA_DB", str(tmp_path / "t.db"))
    assert cli.main(["niveles"]) == 0
    assert "Fila base" in capsys.readouterr().out
    assert cli.main(["stats"]) == 0
    assert "Sin sesiones" in capsys.readouterr().out


def test_formatear_resultado_y_stats(tmp_path):
    s = Sesion("hola", reloj=Reloj())
    for t in "holx":
        s.teclear(t)
    r = s.resultado()
    texto = cli.formatear_resultado(r)
    assert "PPM neto" in texto and "1 sin corregir" in texto and "'a'" in texto
    reg = Registro(tmp_path / "t.db")
    reg.guardar(r, nivel=6, idioma="es")
    assert "1 sesiones" in cli.formatear_stats(reg)
    reg.cerrar()


def test_opciones_sueltas_se_entienden_como_practicar():
    args = cli.construir_parser().parse_args(["practicar", "-n", "2", "--sin-guardar"])
    assert args.orden == "practicar" and args.nivel == 2 and args.sin_guardar
