import pytest

from teclea.sesion import RETROCESO, Sesion


class Reloj:
    """Reloj falso: cada llamada avanza `paso` segundos."""

    def __init__(self, paso=0.2):
        self.t = 0.0
        self.paso = paso

    def __call__(self):
        self.t += self.paso
        return self.t


def teclear_todo(sesion, teclas):
    for t in teclas:
        sesion.teclear(t)


def test_texto_vacio_no_se_acepta():
    with pytest.raises(ValueError):
        Sesion("")


def test_termina_al_llegar_al_final_y_mide_ppm():
    # 10 caracteres = 2 palabras; 10 teclas con 0.2 s entre ellas = 1.8 s de la primera a la ultima.
    sesion = Sesion("hola mundo", reloj=Reloj(0.2))
    assert not sesion.iniciada
    teclear_todo(sesion, "hola mundo")
    assert sesion.terminada
    r = sesion.resultado()
    assert r.segundos == pytest.approx(1.8)
    assert r.precision == 1.0
    assert r.errores_sin_corregir == 0
    assert r.ppm_bruto == pytest.approx(2 / (1.8 / 60))
    assert r.ppm_neto == r.ppm_bruto


def test_error_corregido_con_retroceso_cuenta_como_error_pero_no_penaliza_neto():
    sesion = Sesion("ab", reloj=Reloj())
    teclear_todo(sesion, ["x", RETROCESO, "a", "b"])
    r = sesion.resultado()
    assert r.tecleos == 3  # el retroceso no es un tecleo
    assert r.errores == 1
    assert r.errores_sin_corregir == 0
    assert r.precision == pytest.approx(2 / 3)
    assert r.ppm_neto == r.ppm_bruto
    assert r.teclas["a"].errores == 1
    assert r.teclas["a"].intentos == 2


def test_error_sin_corregir_resta_del_neto():
    sesion = Sesion("abcde", reloj=Reloj())
    teclear_todo(sesion, "abcdx")
    r = sesion.resultado()
    assert r.errores_sin_corregir == 1
    assert r.ppm_neto == pytest.approx(r.ppm_bruto - 1 / r.minutos)


def test_no_termina_si_el_ultimo_caracter_esta_mal():
    sesion = Sesion("ab", reloj=Reloj())
    teclear_todo(sesion, ["a", "x"])
    assert not sesion.terminada
    teclear_todo(sesion, [RETROCESO, "b"])
    assert sesion.terminada
    assert sesion.resultado().errores == 1


def test_estado_por_caracter():
    sesion = Sesion("abc", reloj=Reloj())
    teclear_todo(sesion, ["a", "x"])
    assert [sesion.estado(i) for i in range(3)] == ["bien", "mal", "pendiente"]


def test_retroceso_al_inicio_no_rompe_y_no_tecleo_tras_terminar():
    sesion = Sesion("a", reloj=Reloj())
    sesion.teclear(RETROCESO)
    assert sesion.pos == 0
    sesion.teclear("a")
    sesion.teclear("b")  # ya termino; se ignora
    assert sesion.pos == 1
    assert sesion.resultado().tecleos == 1


def test_teclas_debiles_ordena_por_tasa_de_error_y_latencia():
    sesion = Sesion("aabb", reloj=Reloj())
    teclear_todo(sesion, ["a", "a", "x", RETROCESO, "b", "b"])
    debiles = sesion.resultado().teclas_debiles(1)
    assert debiles[0][0] == "b"
