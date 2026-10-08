// Una sesion de tecleo: registra cada tecla contra el texto esperado y calcula metricas.
// No sabe nada del DOM: recibe teclas por `teclear()` y un reloj inyectable (segundos).

export const RETROCESO = "\b";

export class Sesion {
  constructor(texto, reloj = () => performance.now() / 1000) {
    if (!texto) throw new Error("el texto no puede estar vacío");
    this.texto = [...texto];
    this.reloj = reloj;
    this.escrito = [];
    this.tecleos = [];
    this.inicio = null;
    this.fin = null;
  }

  get pos() { return this.escrito.length; }
  get iniciada() { return this.inicio !== null; }
  get terminada() { return this.fin !== null; }
  get segundos() {
    if (this.inicio === null) return 0;
    return (this.fin ?? this.reloj()) - this.inicio;
  }

  teclear(tecla) {
    if (this.terminada) return;
    const ahora = this.reloj();
    if (this.inicio === null) this.inicio = ahora;
    if (tecla === RETROCESO) {
      this.escrito.pop();
      return;
    }
    const esperado = this.texto[this.pos];
    this.tecleos.push({ esperado, tecleado: tecla, instante: ahora - this.inicio });
    this.escrito.push(tecla);
    // Termina solo cuando el ultimo caracter se teclea bien; los errores anteriores se cobran en el neto.
    if (this.pos === this.texto.length && tecla === esperado) this.fin = ahora;
  }

  estado(i) {
    if (i >= this.pos) return "pendiente";
    return this.escrito[i] === this.texto[i] ? "bien" : "mal";
  }

  // Metricas parciales mientras se teclea (para mostrarlas en vivo).
  parcial() {
    const minutos = Math.max(this.segundos, 1e-9) / 60;
    const errores = this.tecleos.filter((t) => t.esperado !== t.tecleado).length;
    return {
      ppmBruto: this.pos / 5 / minutos,
      precision: this.tecleos.length ? (this.tecleos.length - errores) / this.tecleos.length : 1,
      avance: this.pos / this.texto.length,
    };
  }

  resultado() {
    if (!this.tecleos.length) throw new Error("no se tecleó nada");
    const teclas = {};
    let anterior = this.tecleos[0].instante;
    this.tecleos.forEach((t, i) => {
      const e = (teclas[t.esperado] ??= { intentos: 0, errores: 0, latencias: [] });
      e.intentos += 1;
      if (t.esperado !== t.tecleado) e.errores += 1;
      if (i > 0) e.latencias.push(t.instante - anterior);
      anterior = t.instante;
    });
    const porTecla = {};
    for (const [k, e] of Object.entries(teclas)) {
      porTecla[k] = {
        intentos: e.intentos,
        errores: e.errores,
        latenciaMs: e.latencias.length ? (1000 * e.latencias.reduce((a, b) => a + b, 0)) / e.latencias.length : null,
      };
    }
    const errores = this.tecleos.filter((t) => t.esperado !== t.tecleado).length;
    const sinCorregir = this.escrito.filter((c, i) => c !== this.texto[i]).length;
    const segundos = this.segundos;
    const minutos = Math.max(segundos, 1e-9) / 60;
    const ppmBruto = this.texto.length / 5 / minutos;
    return {
      caracteres: this.texto.length,
      segundos,
      tecleos: this.tecleos.length,
      errores,
      sinCorregir,
      ppmBruto,
      ppmNeto: Math.max(0, ppmBruto - sinCorregir / minutos),
      precision: (this.tecleos.length - errores) / this.tecleos.length,
      teclas: porTecla,
    };
  }
}

// Las teclas con peor tasa de error y, a igual tasa, mas lentas. `teclas` es el mapa del resultado.
export function teclasDebiles(teclas, n = 5) {
  return Object.entries(teclas)
    .filter(([, e]) => e.intentos > 0)
    .sort((a, b) => (b[1].errores / b[1].intentos - a[1].errores / a[1].intentos) || ((b[1].latenciaMs ?? 0) - (a[1].latenciaMs ?? 0)))
    .slice(0, n)
    .map(([tecla, e]) => ({ tecla, ...e }));
}
