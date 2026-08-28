import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

// Auditoría FUNC-001: la bitácora de trazabilidad se registraba fielmente (LGA 41 y 46-V) y NO era
// consultable desde el cliente -- la palabra «bitacora» no aparecía en ninguna parte de la aplicación.
// Este store es el acceso a `GET /api/bitacora`, que devuelve una página (auditoría PERF-003) y acepta
// filtros por entidad, tipo de entidad, usuario y rango de fechas.
//
// Es un rastro APPEND-ONLY: aquí solo hay lecturas, no existe forma de alterarlo desde la aplicación.

/// Convierte los renglones de la API a la forma que consume la tabla.
function mapRenglon(b) {
  return {
    id: b.id,
    evento: b.evento,
    entidad_Tipo: b.entidadTipo,
    entidad_Id: b.entidadId,
    usuario: b.usuario,
    area_Id: b.areaId,
    fecha: b.timestampUtc,
    fecha_Texto: b.timestampUtc ? new Date(b.timestampUtc).toLocaleString() : null,
    origen: b.origen,
    diff: b.diff,
  }
}

export const useBitacoraStore = defineStore('BitacoraStore', {
  state: () => ({
    cargando: false,
    // `renglones` es LA PÁGINA visible; `total` los renglones que cumplen el filtro (lo cuenta el servidor).
    renglones: [],
    total: 0,
    tiposEntidad: [],
    // Último filtro/página pedidos, para poder recargar sin perder el contexto del usuario.
    consulta: {
      pagina: 1,
      tamanoPagina: 25,
      entidadId: null,
      entidadTipo: null,
      usuario: null,
      desde: null,
      hasta: null,
    },
  }),
  actions: {
    // Los tipos de entidad son los nombres de las clases del dominio (Expediente, BajaDocumental...);
    // se piden al servidor para que el filtro no obligue al usuario a adivinarlos.
    async loadTiposEntidad() {
      try {
        const resp = await api.get('/bitacora/tipos-entidad')
        if (resp.status === 200 && Array.isArray(resp.data)) {
          this.tiposEntidad = resp.data
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    async pedirPagina(consulta) {
      const params = { pagina: consulta.pagina, tamanoPagina: consulta.tamanoPagina }
      if (consulta.entidadId) params.entidadId = consulta.entidadId
      if (consulta.entidadTipo) params.entidadTipo = consulta.entidadTipo
      if (consulta.usuario) params.usuario = consulta.usuario
      if (consulta.desde) params.desde = consulta.desde
      if (consulta.hasta) params.hasta = consulta.hasta
      const resp = await api.get('/bitacora', { params })
      if (resp.status !== 200 || !resp.data || !Array.isArray(resp.data.items)) {
        return null
      }
      return { filas: resp.data.items.map(mapRenglon), total: resp.data.total }
    },

    async loadBitacora(consulta) {
      try {
        this.cargando = true
        if (consulta) this.consulta = { ...this.consulta, ...consulta }
        const pagina = await this.pedirPagina(this.consulta)
        this.cargando = false
        if (!pagina) {
          return { success: false, data: "Respuesta inesperada del servidor." }
        }
        this.renglones = pagina.filas
        this.total = pagina.total
        return { success: true }
      } catch (e) {
        this.cargando = false
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    // Exportar debe sacar TODO lo que cumple el filtro, no solo la página visible: se recorren las
    // páginas del servidor con el mismo filtro, al máximo que admite la API (200 por página).
    async descargarFiltradoCompleto(consulta) {
      try {
        const filas = []
        for (let pagina = 1; ; pagina++) {
          const resp = await this.pedirPagina({ ...consulta, pagina, tamanoPagina: 200 })
          if (!resp) {
            return { success: false, data: "Respuesta inesperada del servidor." }
          }
          filas.push(...resp.filas)
          if (filas.length >= resp.total || resp.filas.length === 0) break
        }
        return { success: true, data: filas }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },
  },
});
