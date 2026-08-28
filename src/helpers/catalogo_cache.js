// Auditoría PERF-006: caché en memoria para los catálogos de solo lectura que la aplicación pide una y
// otra vez. Medido en la auditoría durante un recorrido de 24 pantallas: `/api/areas` se pidió 12 veces y
// `/api/empleados` 6, siempre con la misma respuesta.
//
// Solo debe usarse con catálogos pequeños y estables (áreas, empleados). NO con listados de expedientes ni
// con nada que dependa de filtros o de paginación.
//
// Tres cosas evitan que el caché sirva datos viejos:
//   1. Vive en memoria de la pestaña: se pierde al recargar.
//   2. Caduca por tiempo (`ttlMs`), como red de seguridad si alguien edita el catálogo en otra sesión.
//   3. Las escrituras del propio cliente invalidan su catálogo explícitamente (`invalidarCatalogo`).
//
// Además comparte la petición en vuelo: si dos componentes piden el mismo catálogo a la vez, sale UNA sola
// petición y ambos esperan su resultado.

const TTL_POR_DEFECTO_MS = 5 * 60 * 1000

const entradas = new Map()

/**
 * Devuelve el catálogo de `clave`, pidiéndolo con `cargar` solo si no está en caché, si caducó o si se
 * fuerza. `cargar` debe devolver el valor ya mapeado; si lanza, no se guarda nada.
 */
export async function obtenerCatalogo(clave, cargar, { forzar = false, ttlMs = TTL_POR_DEFECTO_MS } = {}) {
  const ahora = Date.now()
  const entrada = entradas.get(clave)

  if (!forzar && entrada) {
    if (entrada.enVuelo) return entrada.enVuelo
    if (entrada.expiraEn > ahora) return entrada.valor
  }

  const enVuelo = (async () => {
    try {
      const valor = await cargar()
      entradas.set(clave, { valor, expiraEn: Date.now() + ttlMs, enVuelo: null })
      return valor
    } catch (e) {
      entradas.delete(clave)
      throw e
    }
  })()

  entradas.set(clave, { valor: entrada ? entrada.valor : undefined, expiraEn: 0, enVuelo })
  return enVuelo
}

/** Olvida un catálogo. Se llama tras crear, editar o eliminar un elemento suyo. */
export function invalidarCatalogo(clave) {
  entradas.delete(clave)
}

/** Claves de los catálogos cacheados, para que no se escriban a mano en cada sitio. */
export const CATALOGOS = {
  areas: 'areas',
  empleados: 'empleados',
}
