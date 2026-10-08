// Perfiles y sesiones guardadas en un almacen tipo localStorage (inyectable para los tests).
// Claves: teclea:perfiles (lista) y teclea:sesiones:<id> (lista de sesiones del perfil).

const CLAVE_PERFILES = "teclea:perfiles";
const MAX_SESIONES = 2000;

export const PERFIL_POR_DEFECTO = { distribucion: "qwerty", corpus: "curioso", palabras: 8, nivel: 1, letraGrande: true };

export class Registro {
  constructor(almacen) {
    this.almacen = almacen;
  }

  _leer(clave, porDefecto) {
    try {
      const crudo = this.almacen.getItem(clave);
      return crudo ? JSON.parse(crudo) : porDefecto;
    } catch {
      return porDefecto;
    }
  }

  _escribir(clave, valor) {
    this.almacen.setItem(clave, JSON.stringify(valor));
  }

  perfiles() {
    return this._leer(CLAVE_PERFILES, []);
  }

  perfil(id) {
    return this.perfiles().find((p) => p.id === id) ?? null;
  }

  crearPerfil(datos) {
    const nombre = (datos.nombre ?? "").trim();
    if (!nombre) throw new Error("el perfil necesita un nombre");
    const perfiles = this.perfiles();
    const id = `${nombre.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-")}-${Date.now().toString(36)}`;
    const perfil = { ...PERFIL_POR_DEFECTO, ...datos, nombre, id, creado: new Date().toISOString() };
    perfiles.push(perfil);
    this._escribir(CLAVE_PERFILES, perfiles);
    return perfil;
  }

  actualizarPerfil(id, cambios) {
    const perfiles = this.perfiles();
    const i = perfiles.findIndex((p) => p.id === id);
    if (i < 0) throw new Error("perfil inexistente");
    perfiles[i] = { ...perfiles[i], ...cambios, id };
    this._escribir(CLAVE_PERFILES, perfiles);
    return perfiles[i];
  }

  borrarPerfil(id) {
    this._escribir(CLAVE_PERFILES, this.perfiles().filter((p) => p.id !== id));
    this.almacen.removeItem(`teclea:sesiones:${id}`);
  }

  sesiones(id) {
    return this._leer(`teclea:sesiones:${id}`, []);
  }

  // Guarda el resultado de una Sesion (ver sesion.js) y devuelve la fila guardada.
  guardarSesion(id, resultado, { nivel, corpus, fecha = new Date() } = {}) {
    const lista = this.sesiones(id);
    const fila = { fecha: fecha.toISOString(), nivel, corpus, ...resultado };
    lista.push(fila);
    this._escribir(`teclea:sesiones:${id}`, lista.slice(-MAX_SESIONES));
    return fila;
  }

  totales(id) {
    const lista = this.sesiones(id);
    const caracteres = lista.reduce((a, s) => a + s.caracteres, 0);
    const mejorPpm = lista.reduce((a, s) => Math.max(a, s.ppmNeto), 0);
    const recientes = lista.slice(-10);
    const ppmReciente = recientes.length ? recientes.reduce((a, s) => a + s.ppmNeto, 0) / recientes.length : 0;
    return { sesiones: lista.length, caracteres, palabras: Math.floor(caracteres / 5), mejorPpm, ppmReciente };
  }

  // Teclas con peor tasa de error acumulada en el perfil (y mas lentas a igual tasa).
  teclasDebiles(id, { n = 8, minimoIntentos = 10 } = {}) {
    const acumulado = {};
    for (const s of this.sesiones(id)) {
      for (const [tecla, e] of Object.entries(s.teclas ?? {})) {
        const a = (acumulado[tecla] ??= { intentos: 0, errores: 0, sumaLatencia: 0, conLatencia: 0 });
        a.intentos += e.intentos;
        a.errores += e.errores;
        if (e.latenciaMs !== null && e.latenciaMs !== undefined) {
          a.sumaLatencia += e.latenciaMs * e.intentos;
          a.conLatencia += e.intentos;
        }
      }
    }
    return Object.entries(acumulado)
      .filter(([, a]) => a.intentos >= minimoIntentos)
      .map(([tecla, a]) => ({
        tecla,
        intentos: a.intentos,
        errores: a.errores,
        tasaError: a.errores / a.intentos,
        latenciaMs: a.conLatencia ? a.sumaLatencia / a.conLatencia : null,
      }))
      .sort((x, y) => (y.tasaError - x.tasaError) || ((y.latenciaMs ?? 0) - (x.latenciaMs ?? 0)))
      .slice(0, n);
  }

  exportar() {
    const datos = { version: 1, perfiles: this.perfiles(), sesiones: {} };
    for (const p of datos.perfiles) datos.sesiones[p.id] = this.sesiones(p.id);
    return datos;
  }

  // Mezcla un respaldo: perfiles nuevos se agregan; en los repetidos se agregan las sesiones que falten.
  importar(datos) {
    if (!datos || datos.version !== 1 || !Array.isArray(datos.perfiles)) throw new Error("respaldo no reconocido");
    const perfiles = this.perfiles();
    for (const p of datos.perfiles) {
      if (!perfiles.some((x) => x.id === p.id)) perfiles.push(p);
      const actuales = this.sesiones(p.id);
      const fechas = new Set(actuales.map((s) => s.fecha));
      const nuevas = (datos.sesiones?.[p.id] ?? []).filter((s) => !fechas.has(s.fecha));
      const juntas = [...actuales, ...nuevas].sort((a, b) => a.fecha.localeCompare(b.fecha));
      this._escribir(`teclea:sesiones:${p.id}`, juntas.slice(-MAX_SESIONES));
    }
    this._escribir(CLAVE_PERFILES, perfiles);
  }
}

// Almacen en memoria con la misma interfaz que localStorage (tests y navegadores sin almacenamiento).
export function almacenEnMemoria() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  };
}
