import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

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

    async load_detalles(solicitudId) {
      try {
        this.isLoading = true
        this.isHistrico = false
        const resp = await api.get(`/Archivo/DetalleSolicitudesPrestamosAI/BySolicitud/${solicitudId}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success == true) {
            if (data) {
              this.detalles = data.map((element) => {
                return {
                  id: element.id,
                  inventario_Id: element.inventario_Id,
                  Inventario_Clave_Clasificacion: element.inventario_Clave_Clasificacion,
                  descripcion: element.descripcion,
                  observaciones: element.observaciones,
                  ubicacion: element.ubicacion,
                  fecha_Inicio: element.fecha_Inicio,
                  no_transferencia: element.numero_Transferencia.split('/')[3],
                  no_interno: element.inventario_Clave_Clasificacion.split('/')[3],
                  historico: element.historico
                }
              })
            }
            if (this.detalles.length > 0) {
              if (this.detalles[0].historico == "True") {
                this.isHistrico = true
              } else {
                this.isHistrico = false
              }
            }
            return { success }
          } else {
            return { success, data }
          }

        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } finally {
        this.isLoading = false;
      }
    },

    async create(solicitudId, detalle) {
      try {
        const resp = await api.post(`/Archivo/DetalleSolicitudesPrestamosAI/${solicitudId}`, detalle)
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
