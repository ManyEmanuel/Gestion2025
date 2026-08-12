import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

// Corte al backend nuevo: editar ubicación responde 204 y problem+json en error (axios lanza).
const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

// Corte al backend nuevo: mapea el DTO enriquecido (GET /api/expedientes/inventario-ai) a la forma que
// esperan las tablas del módulo. El valor documental y el destino final (disposición) ya se resuelven en
// el backend tras el backfill expediente→disposición (por clave sección/serie/subserie). Las fechas de
// recepción/término de concentración el dominio nuevo no las modela → null. El año sale del último
// segmento de la clave.
function mapFilaInventarioAi(e) {
  const partes = (e.claveClasificacion || '').split('/')
  return {
    id: e.id,
    encabezado_Id: e.encabezadoId,
    seccion: e.seccion,
    serie: e.serie,
    sub_Serie: e.subSerie,
    nombre_Expediente: e.nombreExpediente,
    clave_Clasificacion: e.claveClasificacion,
    no_Expediente_Interno: partes.length > 3 ? partes[3] : null,
    descripcion: e.descripcion,
    area_Responsable: e.areaResponsable,
    area_Responsable_Id: e.areaResponsableId,
    area_Generadora: e.areaGeneradora,
    area_Generadora_Id: e.areaGeneradoraId,
    ubicacion_AI: e.ubicacion,
    valor_Documental: e.valorDocumental,
    vigencia_Concentracion: e.vigenciaConcentracion,
    vigencia_Tramite: null,
    vigencia_Completa: null,
    disposicion_Documental: e.destinoFinal,
    fecha_Inicio: e.fechaInicio,
    fecha_Termino: e.fechaTermino,
    fecha_Recepcion_Transferencia_Primaria: null,
    fecha_Termino_Concentracion: null,
    estatus: e.estatus,
    fase: e.fase,
    clasificado: e.clasificado,
    clasificado_Texto: e.clasificado ? 'Clasificado' : 'No clasificado',
    total_Paginas: e.totalPaginas,
    anio: parseInt(partes[partes.length - 1])
  }
}

export const useInventarioAreaAIStore = defineStore('inventarioAreaAI', {
  state: () => ({
    modal: false,
    isEditar: false,
    isLoadingConcentracion: false,
    isLoadingHistorico: false,
    inventariosConcentracion: [],
    inventariosConcentracionFiltro: [],
    inventariosHistorico: [],
    inventariosHistoricoFiltro: [],
    inventario: {
      id: null,
      seccion: null,
      serie: null,
      sub_Serie: null,
      disposicion_Documental: null,
      nombre_Expediente: null,
      clave_Clasificacion: null,
      no_Expediente_Interno: null,
      descripcion: null,
      fecha_Inicio: null,
      fecha_Termino: null,
      ubicacion_AI: null,
      vigencia_Tramite: null,
      vigencia_Concentracion: null,
      vigencia_Completa: null,
      valor_Documental: null,
      clasificado: false,
      clasificado_Texto: null,
      total_Paginas: null,
      area_Responsable: null,
      area_Generadora: null,
      fecha_Recepcion_Transferencia_Primaria: null,
      fecha_Termino_Concentracion: null
    }
  }),
  actions: {

    initInventario() {
      this.inventario.id = null
      this.inventario.seccion = null
      this.inventario.serie = null
      this.inventario.sub_Serie = null
      this.inventario.disposicion_Documental = null
      this.inventario.nombre_Expediente = null
      this.inventario.clave_Clasificacion = null
      this.inventario.no_Expediente_Interno = null
      this.inventario.descripcion = null
      this.inventario.fecha_Inicio = null
      this.inventario.fecha_Termino = null
      this.inventario.ubicacion_AI = null
      this.inventario.vigencia_Tramite = null
      this.inventario.vigencia_Concentracion = null
      this.inventario.vigencia_Completa = null
      this.inventario.valor_Documental = null
      this.inventario.clasificado = false
      this.inventario.clasificado_Texto = null
      this.inventario.total_Paginas = null
      this.inventario.area_Responsable = null
      this.inventario.area_Generadora = null
      this.inventario.fecha_Recepcion_Transferencia_Primaria = null
      this.inventario.fecha_Termino_Concentracion = null
    },

    // MIGRADO al backend nuevo (corte de clientes): GET /api/expedientes/inventario-ai?fase=Concentracion
    // (ámbito global -> todas las áreas; usuario de área -> la suya) con nombres resueltos + ubicación física.
    async loadInventariosConcentracion() {
      try {
        this.isLoadingConcentracion = true
        this.inventariosConcentracion = []
        const resp = await api.get('/expedientes/inventario-ai?fase=Concentracion')
        this.isLoadingConcentracion = false
        if (resp.status == 200 && Array.isArray(resp.data)) {
          const arr = resp.data.map(mapFilaInventarioAi)
          this.inventariosConcentracion = arr
          this.inventariosConcentracionFiltro = arr
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) {
        this.isLoadingConcentracion = false
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadInventariosConcentracionFiltro(area, anio) {
      try {
        if (area == 'Ver todos') {
          if (anio == 'Ver todos') {
            this.inventariosConcentracionFiltro = this.inventariosConcentracion
          } else {
            this.inventariosConcentracionFiltro = this.inventariosConcentracion.filter(x => x.anio == anio)
          }
        } else {
          if (anio == 'Ver todos') {
            this.inventariosConcentracionFiltro = this.inventariosConcentracion.filter(x => x.area_Generadora == area)
          } else {
            this.inventariosConcentracionFiltro = this.inventariosConcentracion.filter(x => x.anio == anio && x.area_Generadora == area)
          }
        }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo (corte de clientes): GET /api/expedientes/inventario-ai?fase=Historico.
    async loadInventariosHistorico() {
      try {
        this.isLoadingHistorico = true
        this.inventariosHistorico = []
        const resp = await api.get('/expedientes/inventario-ai?fase=Historico')
        this.isLoadingHistorico = false
        if (resp.status == 200 && Array.isArray(resp.data)) {
          const arr = resp.data.map(mapFilaInventarioAi)
          this.inventariosHistorico = arr
          this.inventariosHistoricoFiltro = arr
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) {
        this.isLoadingHistorico = false
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadInventariosHistoricoFiltro(area, anio) {
      try {
        if (area == 'Ver todos') {
          if (anio == 'Ver todos') {
            this.inventariosHistoricoFiltro = this.inventariosHistorico
          } else {
            this.inventariosHistoricoFiltro = this.inventariosHistorico.filter(x => x.anio == anio)
          }
        } else {
          if (anio == 'Ver todos') {
            this.inventariosHistoricoFiltro = this.inventariosHistorico.filter(x => x.area_Generadora == area)
          } else {
            this.inventariosHistoricoFiltro = this.inventariosHistorico.filter(x => x.anio == anio && x.area_Generadora == area)
          }
        }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo (corte de clientes): el backend nuevo NO expone GET-por-id; el expediente
    // se toma del listado ya cargado (concentración o histórico) buscando por id (edit-from-list). Se usa
    // para abrir el modal de editar ubicación física.
    async loadInventario(id) {
      try {
        this.initInventario()
        const encontrado = (this.inventariosConcentracion || []).find(x => x.id == id)
          || (this.inventariosHistorico || []).find(x => x.id == id)
        if (encontrado) {
          this.inventario = { ...this.inventario, ...encontrado }
          return { success: true }
        }
        return { success: false, data: "No se encontró el expediente en el listado." }
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo: PATCH /api/expedientes/{id}/ubicacion { ubicacion } -> 204. Solo aplica a
    // expedientes en concentración/histórico (lo valida el dominio). Recarga ambas vistas al terminar.
    async updateUbicacion(id, ubicacion) {
      try {
        const resp = await api.patch(`/expedientes/${id}/ubicacion`, { ubicacion: ubicacion || null })
        if (resp.status === 204 || resp.status === 200) {
          this.loadInventariosConcentracion()
          this.loadInventariosHistorico()
          return { success: true, data: "Ubicación actualizada con éxito" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    actualizarModal(valor) {
      this.modal = valor
    }

  },
});
