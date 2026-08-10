import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

// Corte al backend nuevo: agregar expediente responde 204 y problem+json en error (axios lanza).
const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

export const useDetalleCedulaPrestamoStore = defineStore('detalleCedulaPrestamo', {
  state: () => ({
    isLoading: false,
    isEditar: false,
    modal: false,
    detalle: {
      id: null,
      inventario_Id: null,
      inventario_Clave_Clasificacion: null,
      inventario_No_Expediente_Interno: null,
      empleado_Id: null,
      ubicacion: null,
      descripcion: null,
      observaciones: null,
      fecha_Inicio_Conclusion: null,
    },
    detalles: [],
    arrayDetalles: []
  }),
  actions: {

    initDetalle() {
      this.detalle.inventario_Id = null,
        this.detalle.inventario_Clave_Clasificacion = null,
        this.detalle.inventario_No_Expediente_Interno = null,
        this.detalle.empleado_Id = null,
        this.detalle.ubicacion = null,
        this.detalle.descripcion = null,
        this.detalle.observaciones = null,
        this.detalle.fecha_Inicio_Conclusion = null
    },

    initArrayDetalle() {
      this.arrayDetalles = []
    },

    // MIGRADO al backend nuevo: GET /api/prestamos/{id}/detalle (expedientes prestados, con el
    // expediente del inventario resuelto). Array directo, camelCase.
    async loadDetalles(cedulaId) {
      try {
        const resp = await api.get(`/prestamos/${cedulaId}/detalle`)
        this.detalles = []
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.detalles = resp.data.map((detalle) => ({
            id: detalle.id,
            cedula_Prestamo_Id: detalle.prestamoId,
            inventario_Id: detalle.inventarioGeneralId,
            inventario_Clave_Clasificacion: detalle.claveClasificacion,
            inventario_No_Expediente_Interno: null,
            empleado_Id: null,
            ubicacion: detalle.ubicacion,
            descripcion: detalle.descripcion,
            observaciones: detalle.observaciones,
            fecha_Inicio_Conclusion: detalle.fechaInicio ? String(detalle.fechaInicio).substring(0, 10) : null
          }))
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadDetalle(id) {
      try {
        const resp = await api.get(`/Archivo/DetalleCedulaPrestamoExpedientes/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              this.initDetalle();
              this.detalle.id = data.id
              this.detalle.inventario_Id = data.inventario_Id
              this.detalle.empleado_Id = data.empleado_Id
              this.detalle.ubicacion = data.ubicacion
              this.detalle.descripcion = data.descripcion
              this.detalle.observaciones = data.observaciones
              this.detalle.fecha_Inicio_Conclusion = data.fecha_Inicio_Conclusion
            }
          }
        }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo: POST /api/prestamos/{cedulaId}/expedientes -> 204. Se usa al EDITAR
    // un préstamo (agregar un expediente extra); en el ALTA los expedientes van embebidos (ver
    // createSolicitudPrestamo). Solo mientras el préstamo está en estado Solicitado.
    async createDetalle(cedulaId, detalle) {
      try {
        const resp = await api.post(`/prestamos/${cedulaId}/expedientes`, {
          inventarioGeneralId: detalle.inventario_Id,
          ubicacion: detalle.ubicacion || null,
          descripcion: detalle.descripcion || null,
          observaciones: detalle.observaciones || null
        })
        if (resp.status === 204 || resp.status === 200) {
          return { success: true, data: "Expediente agregado" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },

    async updateDetalle(id, detalle) {
      try {
        const resp = await api.put(`/Archivo/DetalleCedulaPrestamoExpedientes/${id}`, detalle)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            return { success, data }
          } else {
            return { success, data }
          }
        }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async deleteDetalle(id) {
      try {
        console.log("Entro a delete en http")
        const resp = await api.delete(`/Archivo/DetalleCedulaPrestamoExpedientes/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            return { success, data }
          } else {
            return { success: false, data: "Ocurrio un error, intentelo de nuevo" }
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo" }
        }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
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
