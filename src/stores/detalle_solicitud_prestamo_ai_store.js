import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

// Corte al backend nuevo: agregar expediente responde 204 y problem+json en error (axios lanza).
const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

export const useDetalleSolicitudAISotre = defineStore('detalleSolicitudAI', {
  state: () => ({
    isLoading: false,
    isEditar: false,
    modal: false,
    detalles: [],
    array_detalle: [],
    isHistrico: false,
    detalle: {
      id: null,
      inventario_Id: null,
      descripcion: null,
      observaciones: null,
      inventario_Clave_Clasificacion: null,
    }
  }),
  actions: {

    init_detalle() {
      this.detalle.id = null
      this.detalle.inventario_Id = null
      this.detalle.descripcion = null
      this.detalle.observaciones = null
      this.detalle.inventario_Clave_Clasificacion = null
    },

    init_array_detalle() {
      this.array_detalle = []
    },

    // MIGRADO al backend nuevo (corte de clientes): GET /api/prestamos/{id}/detalle (renglones con el
    // expediente resuelto). El nº interno se deriva de la clave; el nº de transferencia y el flag
    // histórico no los modela el dominio nuevo del préstamo unificado -> null/false.
    async load_detalles(solicitudId) {
      try {
        this.isLoading = true
        this.isHistrico = false
        const resp = await api.get(`/prestamos/${solicitudId}/detalle`)
        this.isLoading = false
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.detalles = resp.data.map((d) => {
            const partes = (d.claveClasificacion || '').split('/')
            return {
              id: d.id,
              inventario_Id: d.inventarioGeneralId,
              Inventario_Clave_Clasificacion: d.claveClasificacion,
              descripcion: d.descripcion,
              observaciones: d.observaciones,
              ubicacion: d.ubicacion,
              fecha_Inicio: d.fechaInicio,
              no_transferencia: null,
              no_interno: partes.length > 3 ? partes[3] : null,
              historico: false
            }
          })
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        this.isLoading = false
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo (corte de clientes): POST /api/prestamos/{solicitudId}/expedientes
    // { inventarioGeneralId, ubicacion, descripcion, observaciones } -> 204. Agrega un expediente a un
    // préstamo (mientras está Solicitado). El delete de expediente no lo modela el dominio nuevo.
    async create(solicitudId, detalle) {
      try {
        const resp = await api.post(`/prestamos/${solicitudId}/expedientes`, {
          inventarioGeneralId: detalle.inventario_Id,
          ubicacion: detalle.ubicacion || null,
          descripcion: detalle.descripcion || null,
          observaciones: detalle.observaciones || null
        })
        if (resp.status === 204 || resp.status === 200) {
          this.load_detalles(solicitudId)
          return { success: true, data: "Expediente agregado" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },

    async delete(solicitudId, id) {
      try {
        const resp = await api.delete(`/Archivo/DetalleSolicitudesPrestamosAI/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success) {
            this.load_detalles(solicitudId)
          }
          return { success, data }
        }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    add_detalle(detalle) {
      this.array_detalle.push(detalle)
    },

    delete_array(id) {
      const index = this.array_detalle.findIndex(element => {
        return element.id == id
      })
      this.array_detalle.splice(index, 1)
      return { success: true, data: "Registro eliminado con éxito" }
    }
  },
});
