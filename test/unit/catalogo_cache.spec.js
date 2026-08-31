import { describe, it, expect, beforeEach, vi } from 'vitest'
import { obtenerCatalogo, invalidarCatalogo, CATALOGOS } from 'src/helpers/catalogo_cache'

// Auditoría T-13 + PERF-006. El caché de catálogos es lógica con varios filos —caducidad, invalidación,
// peticiones simultáneas, errores— y ninguno se puede comprobar mirando la pantalla. Es justo el tipo de
// código que necesitaba pruebas desde el primer día.

describe('catálogo cacheado', () => {
  beforeEach(() => {
    invalidarCatalogo(CATALOGOS.areas)
    invalidarCatalogo(CATALOGOS.empleados)
  })

  it('pide el catálogo una sola vez y reutiliza el resultado', async () => {
    const cargar = vi.fn().mockResolvedValue(['a', 'b'])

    const primero = await obtenerCatalogo(CATALOGOS.areas, cargar)
    const segundo = await obtenerCatalogo(CATALOGOS.areas, cargar)

    expect(cargar).toHaveBeenCalledTimes(1)
    expect(primero).toEqual(['a', 'b'])
    expect(segundo).toEqual(['a', 'b'])
  })

  // El caso que motivó compartir la petición en vuelo: las dos tablas de Inventario AI piden el catálogo
  // de áreas a la vez al montar. Sin esto saldrían dos peticiones idénticas.
  it('dos peticiones simultáneas producen una sola llamada', async () => {
    let resolver
    const cargar = vi.fn(() => new Promise((r) => { resolver = r }))

    const a = obtenerCatalogo(CATALOGOS.areas, cargar)
    const b = obtenerCatalogo(CATALOGOS.areas, cargar)
    resolver(['x'])

    expect(await a).toEqual(['x'])
    expect(await b).toEqual(['x'])
    expect(cargar).toHaveBeenCalledTimes(1)
  })

  it('invalidar obliga a volver a pedirlo', async () => {
    const cargar = vi.fn().mockResolvedValue(['v1'])
    await obtenerCatalogo(CATALOGOS.areas, cargar)

    invalidarCatalogo(CATALOGOS.areas)
    cargar.mockResolvedValue(['v2'])
    const despues = await obtenerCatalogo(CATALOGOS.areas, cargar)

    expect(cargar).toHaveBeenCalledTimes(2)
    expect(despues).toEqual(['v2'])
  })

  it('forzar salta el caché sin invalidarlo para los demás', async () => {
    const cargar = vi.fn().mockResolvedValue(['v1'])
    await obtenerCatalogo(CATALOGOS.areas, cargar)

    cargar.mockResolvedValue(['v2'])
    expect(await obtenerCatalogo(CATALOGOS.areas, cargar, { forzar: true })).toEqual(['v2'])
    expect(cargar).toHaveBeenCalledTimes(2)
  })

  it('caduca pasado su tiempo de vida', async () => {
    vi.useFakeTimers()
    try {
      const cargar = vi.fn().mockResolvedValue(['v1'])
      await obtenerCatalogo(CATALOGOS.areas, cargar, { ttlMs: 1000 })

      vi.advanceTimersByTime(1001)
      await obtenerCatalogo(CATALOGOS.areas, cargar, { ttlMs: 1000 })

      expect(cargar).toHaveBeenCalledTimes(2)
    } finally {
      vi.useRealTimers()
    }
  })

  // Un fallo no debe quedarse pegado: si la red falla una vez, el siguiente intento tiene que reintentar
  // de verdad, no devolver el error cacheado ni un valor a medias.
  it('un error no se cachea', async () => {
    const cargar = vi.fn()
      .mockRejectedValueOnce(new Error('red caída'))
      .mockResolvedValueOnce(['ok'])

    await expect(obtenerCatalogo(CATALOGOS.areas, cargar)).rejects.toThrow('red caída')
    expect(await obtenerCatalogo(CATALOGOS.areas, cargar)).toEqual(['ok'])
    expect(cargar).toHaveBeenCalledTimes(2)
  })

  it('cada catálogo se guarda por separado', async () => {
    const areas = vi.fn().mockResolvedValue(['area'])
    const empleados = vi.fn().mockResolvedValue(['empleado'])

    expect(await obtenerCatalogo(CATALOGOS.areas, areas)).toEqual(['area'])
    expect(await obtenerCatalogo(CATALOGOS.empleados, empleados)).toEqual(['empleado'])

    invalidarCatalogo(CATALOGOS.areas)
    await obtenerCatalogo(CATALOGOS.empleados, empleados)

    expect(empleados).toHaveBeenCalledTimes(1)
  })
})
