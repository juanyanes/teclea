import random

import pytest

from teclea import lecciones

CORPUS = ["Esta es una frase corta.", "Otra frase, con año y está.", "arte rata sarta"]


def test_niveles_son_acumulativos():
    anterior = set()
    for n in lecciones.NIVELES:
        if n.frases:
            continue
        assert anterior <= set(n.alfabeto)
        anterior = set(n.alfabeto)


def test_nivel_inexistente():
    with pytest.raises(ValueError):
        lecciones.nivel(99)


def test_corpus_empaquetado_se_carga_y_no_trae_comentarios():
    for idioma in ("es", "en"):
        frases = lecciones.cargar_corpus(idioma)
        assert len(frases) >= 10
        assert all(not f.startswith("#") for f in frases)
    with pytest.raises(ValueError):
        lecciones.cargar_corpus("xx")


def test_palabras_del_corpus_respetan_alfabeto_y_quitan_acentos():
    palabras = lecciones.palabras_del_corpus(CORPUS, "arstneio")
    assert "arte" in palabras and "rata" in palabras and "es" in palabras
    assert "esta" in palabras  # "está" sin tilde cabe en el alfabeto
    assert "ano" not in palabras  # "año" no se convierte en "ano": la enie es otra letra
    assert all(set(p) <= set("arstneio") for p in palabras)


def test_linea_de_nivel_bajo_solo_usa_sus_teclas():
    rng = random.Random(1)
    linea = lecciones.generar_linea(lecciones.nivel(1), rng, palabras=30, corpus=CORPUS)
    assert len(linea.split()) == 30
    assert set(linea) <= set("arstneio ")


def test_nivel_5_mete_mayusculas_y_puntuacion():
    rng = random.Random(7)
    linea = lecciones.generar_linea(lecciones.nivel(5), rng, palabras=60, corpus=CORPUS)
    assert any(c.isupper() for c in linea)
    assert any(c in lecciones.PUNTUACION for c in linea)


def test_nivel_de_frases_devuelve_una_frase_del_corpus():
    rng = random.Random(3)
    assert lecciones.generar_linea(lecciones.nivel(6), rng, corpus=CORPUS) in CORPUS


def test_misma_semilla_misma_linea():
    a = lecciones.generar_linea(lecciones.nivel(3), random.Random(42), corpus=CORPUS)
    b = lecciones.generar_linea(lecciones.nivel(3), random.Random(42), corpus=CORPUS)
    assert a == b
