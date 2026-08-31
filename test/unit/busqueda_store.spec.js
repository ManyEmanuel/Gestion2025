import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useBusquedaStore } from 'src/stores/busqueda_store'
import { api } from 'src/boot/axios'

// Auditoría T-13 + búsqueda global (P2). El store decide cuándo vale la pena ir al servidor y cómo
// distingue «todavía no se buscó» de «se buscó y no hubo nada» — dos cosas que la pantalla muestra
// distinto y que no se pueden comprobar mirándola.

vi.mock('src/boot/axios', () => ({ api: { get: vi.fn() } }))

const paginaFalsa = (items, total) => ({ status: 200, data: { items, total, pagina: 1, tamanoPagina: 25 } })

describe('store de búsqueda', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    api.get.mockReset()
  })

  it('no llama al servidor con menos de 2 caracteres', async () => {
    const store = useBusquedaStore()

    const resp = await store.buscar({ texto: 'a' })

    expect(api.get).not.toHaveBeenCalled()
    expect(resp.success).toBe(false)
    expect(store.seHaBuscado).toBe(false)
  })

  it('tampoco con espacios en blanco', async () => {
    const store = useBusquedaStore()

    await store.buscar({ texto: '   ' })

    expect(api.get).not.toHaveBeenCalled()
  })

  it('busca y mapea los resultados', async () => {
    api.get.mockResolvedValue(paginaFalsa([{
      id: 'exp-1', encabezadoId: 'enc-1', anio: 2019,
      claveClasificacion: 'TJAN/AMP/1', nombreExpediente: 'Amparo directo', descripcion: null,
      seccion: 'Jurídico', serie: 'Amparos', subSerie: null,
      areaGeneradoraId: 'area-1', areaGeneradora: 'Área Amparos',
      fase: 'Concentracion', estatus: 'Aprobado', clasificado: true,
    }], 1))
    const store = useBusquedaStore()

    await store.buscar({ texto: 'amparo' })

    expect(store.total).toBe(1)
    expect(store.seHaBuscado).toBe(true)
    const fila = store.resultados[0]
    expect(fila.clave_Clasificacion).toBe('TJAN/AMP/1')
    expect(fila.encabezado_Id).toBe('enc-1')
    expect(fila.clasificado_Texto).toBe('Clasificado')
  })

  it('un expediente público se etiqueta como público', async () => {
    api.get.mockResolvedValue(paginaFalsa([{
      id: 'exp-2', encabezadoId: 'enc-2', anio: 2020,
      claveClasificacion: 'X/1', nombreExpediente: 'Otro', descripcion: null,
      seccion: null, serie: null, subSerie: null,
      areaGeneradoraId: 'area-1', areaGeneradora: 'Área',
      fase: 'Tramite', estatus: 'SinEnviar', clasificado: false,
    }], 1))
    const store = useBusquedaStore()

    await store.buscar({ texto: 'otro' })

    expect(store.resultados[0].clasificado_Texto).toBe('Público')
  })

  // Sin esta distinción la tabla diría «ningún expediente coincide» antes de que el usuario buscara nada.
  it('distingue «no se ha buscado» de «no hubo resultados»', async () => {
    const store = useBusquedaStore()
    expect(store.seHaBuscado).toBe(false)

    api.get.mockResolvedValue(paginaFalsa([], 0))
    await store.buscar({ texto: 'nada de nada' })

    expect(store.seHaBuscado).toBe(true)
    expect(store.total).toBe(0)
  })

  it('manda el texto sin espacios sobrantes y la página pedida', async () => {
    api.get.mockResolvedValue(paginaFalsa([], 0))
    const store = useBusquedaStore()

    await store.buscar({ texto: '  convenio  ', pagina: 3, tamanoPagina: 50 })

    expect(api.get).toHaveBeenCalledWith('/expedientes/buscar', {
      params: { texto: 'convenio', pagina: 3, tamanoPagina: 50 }
    })
  })

  it('un fallo del servidor devuelve su mensaje y no deja resultados a medias', async () => {
    api.get.mockRejectedValue({ response: { data: { detail: 'No tiene acceso a esa área.' } } })
    const store = useBusquedaStore()

    const resp = await store.buscar({ texto: 'algo' })

    expect(resp.success).toBe(false)
    expect(resp.data).toBe('No tiene acceso a esa área.')
    expect(store.cargando).toBe(false)
  })

  it('limpiar deja la pantalla como recién abierta', async () => {
    api.get.mockResolvedValue(paginaFalsa([{ id: 'x', encabezadoId: 'y', clasificado: false }], 1))
    const store = useBusquedaStore()
    await store.buscar({ texto: 'algo' })

    store.limpiar()

    expect(store.resultados).toEqual([])
    expect(store.total).toBe(0)
    expect(store.seHaBuscado).toBe(false)
    expect(store.consulta.texto).toBe('')
  })
})
