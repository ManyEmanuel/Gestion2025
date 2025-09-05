import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

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

    async load_detalles(caja_id) {
      try {
        const resp = await api.get(`/Archivo/DetalleCajasTransferenciaSecundaria/GetAll/${caja_id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              console.log(data)
              this.detalles = []
              let detalleArray = data.map((detalle) => {
                return {
                  id: detalle.id,
                  clave_Clasificacion: detalle.clave_Clasificacion,
                  descripcion: detalle.descripcion,
                  total_Paginas: detalle.total_Paginas,
                  observaciones: detalle.observaciones,
                  fecha_Inicio: detalle.fecha_Inicio,
                  fecha_Termino: detalle.fecha_Termino
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

    async create(caja_id, detalle) {
      try {
        const resp = await api.post(`/Archivo/DetalleCajasTransferenciaSecundaria/${caja_id}`, detalle)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            this.load_detalles(caja_id)
            return { success, data }
          } else {
            return { success, data }
          }
        }
        else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },


    async deleteDetalle(caja_id, id) {
      try {
        const resp = await api.delete(`/Archivo/DetalleCajasTransferenciaSecundaria/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            this.load_detalles(caja_id)
            return { success, data }
          } else {
            return { success, data }
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo" }
        }
      } catch (e) {
        console.log(e)
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
