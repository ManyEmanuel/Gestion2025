import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

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

    async loadDetalles(cedulaId) {
      try {
        const resp = await api.get(`/Archivo/DetalleCedulaPrestamoExpedientes/ObtenTodos/${cedulaId}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          console.log("Esto es detalle de prestamo", data)
          if (success === true) {
            if (data) {
              this.detalles = []
              let detalleArray = data.map((detalle) => {
                return {
                  id: detalle.id,
                  cedula_Prestamo_Id: detalle.cedula_Prestamo_Id,
                  inventario_Id: detalle.inventario_Id,
                  inventario_Clave_Clasificacion: detalle.inventario_Clave_Clasificacion,
                  inventario_No_Expediente_Interno: detalle.inventario_No_Expediente_Interno,
                  empleado_Id: detalle.empleado_Id,
                  ubicacion: detalle.ubicacion,
                  descripcion: detalle.descripcion,
                  observaciones: detalle.observaciones,
                  fecha_Inicio_Conclusion: detalle.fecha_Inicio_Conclusion
                }
              })
              this.detalles = detalleArray;
            }
          }
        }
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

    async createDetalle(cedulaId, detalle) {
      try {
        const resp = await api.post(`/Archivo/DetalleCedulaPrestamoExpedientes/${cedulaId}`, detalle)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            return { success, data }
          } else {
            return { success, data }
          }
        }
        else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
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
