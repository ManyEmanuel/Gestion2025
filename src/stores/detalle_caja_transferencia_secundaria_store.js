import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

// Corte al backend nuevo: agregar expediente responde 204 y problem+json en error (axios lanza).
const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

export const useDetalleCajaTransferenciaSecundariaStore = defineStore('detalle transferencia secundaria', {
  state: () => ({
    isLoading: false,
    isEditar: false,
    detalles: [],
    detallesAI: [],
    arrayDetalles: [],
    detalle: {
      id: null,
      inventario_Area_Id: null,
      clave_Clasificacion: null,
      descripcion: null,
      total_Paginas: null,
      observaciones: null,
      signatura_Topografica: null,
      fecha_Inicio: null,
      fecha_Termino: null
    }
  }),
  actions: {

    init_detalle() {
      this.detalle.id = null
      this.detalle.inventario_Area_Id = null
      this.detalle.clave_Clasificacion = null
      this.detalle.descripcion = null
      this.detalle.total_Paginas = null
      this.detalle.observaciones = null
      this.detalle.signatura_Topografica = null
      this.detalle.fecha_Inicio = null
      this.detalle.fecha_Termino = null
    },

    init_array_detalle() {
      this.arrayDetalles = []
    },

    // MIGRADO al backend nuevo (corte de clientes): GET /api/transferenciassecundarias/cajas/{cajaId}/detalle
    // (aislado por el área de la transferencia) con datos del expediente resueltos.
    async load_detalles(caja_id) {
      try {
        const resp = await api.get(`/transferenciassecundarias/cajas/${caja_id}/detalle`)
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.detalles = resp.data.map((d) => ({
            id: d.id,
            clave_Clasificacion: d.claveClasificacion,
            descripcion: d.descripcion,
            total_Paginas: d.totalPaginas,
            observaciones: d.observaciones,
            signatura_Topografica: d.signaturaTopografica,
            fecha_Inicio: d.fechaInicio,
            fecha_Termino: d.fechaTermino
          }))
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo: POST /api/transferenciassecundarias/{transferenciaId}/expedientes
    // { cajaId, ... } -> 204. Se usa al EDITAR una caja (agregar un expediente extra); solo mientras la
    // transferencia está en Borrador. Recibe transferenciaId (lo pasa el componente por prop).
    async create(transferenciaId, caja_id, detalle) {
      try {
        const resp = await api.post(`/transferenciassecundarias/${transferenciaId}/expedientes`, {
          cajaId: caja_id,
          inventarioGeneralId: detalle.inventario_Area_Id,
          descripcion: detalle.descripcion || null,
          signaturaTopografica: detalle.signatura_Topografica || null,
          observaciones: detalle.observaciones || null,
          totalPaginas: detalle.total_Paginas != null ? Number(detalle.total_Paginas) : null
        })
        if (resp.status === 204 || resp.status === 200) {
          this.load_detalles(caja_id)
          return { success: true, data: "Expediente agregado" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    addDetalle(detalle) {
      this.arrayDetalles.push(detalle)
    },

    deleteDetalleArray(id) {
      const index = this.arrayDetalles.findIndex(element => {
        return element.id == id
      })
      this.arrayDetalles.splice(index, 1)
      return { success: true, data: "Registro eliminado con éxito" }
    }
  },
});
