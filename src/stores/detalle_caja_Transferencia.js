import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

export const useDetalleCajaTransferenciaStore = defineStore('DetalleCajaTransferenciaStore', {
  state: () => ({
    isLoading: false,
    isEditar: false,
    detalles: [],
    detallesAI: [],
    arrayDetalles: [],
    detalle: {
      id: null,
      nombre_Expediente: null,
      inventario_Area_Id: null,
      clave_Clasificacion: null,
      no_Expediente_Interno: null,
      fecha_Inicio: null,
      fecha_Termino: null,
      valor_Documental: null,
      vigencia_Concentracion: null,
      destino_Final: null,
      descripcion: null,
      signatura_Topografica: null,
      total_Paginas: null,
    },
  }),
  actions: {

    initDetalle() {
      this.detalle.id = null
      this.detalle.nombre_Expediente = null
      this.detalle.inventario_Area_Id = null
      this.detalle.clave_Clasificacion = null
      this.detalle.no_Expediente_Interno = null
      this.detalle.fecha_Inicio = null
      this.detalle.fecha_Termino = null
      this.detalle.valor_Documental = null
      this.detalle.vigencia_Concentracion = null
      this.detalle.destino_Final = null
      this.detalle.descripcion = null
      this.detalle.signatura_Topografica = null
      this.detalle.total_Paginas = null
    },

    initArrayDetalle() {
      this.arrayDetalles = []
    },

    async loadDetalles(cajaId, ubicacion) {
      try {
        const resp = await api.get(`/DetallesCajasTrasnferencias/${cajaId}/GetAll`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            console.log("informacion de detallesCajas", data)
            if (data) {
              this.detalles = []
              let detalleArray = data.map((detalle) => {
                return {
                  id: detalle.id,
                  nombre_Expediente: detalle.nombre_Expediente,
                  caja_Id: detalle.caja_Id,
                  inventario_Area_Id: detalle.inventario_Area_Id,
                  clave_Clasificacion: detalle.clave_Clasificacion,
                  no_Expediente_Interno: detalle.no_Expediente_Interno,
                  destino_Final: detalle.destino_Final,
                  vigencia_Concentracion: detalle.vigencia_Concentracion,
                  descripcion: detalle.descripcion,
                  signatura_Topografica: detalle.signatura_Topografica,
                  total_Paginas: detalle.total_Paginas,
                  fecha_Inicio: detalle.fecha_Inicio,
                  fecha_Termino: detalle.fecha_Termino,
                  valor_Documental: detalle.valor_Documental,
                  estatus: detalle.estatus,
                  motivo_Rechazo: detalle.motivo_Rechazo,
                  ubicacion: ubicacion || detalle.ubicacion
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

    async loadDetallesAI(transferenciaId) {
      try {
        this.isLoading = true;
        const resp = await api.get(`/DetallesCajasTrasnferencias/0/ByTransferencia/${transferenciaId}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              this.detallesAI = []
              let detalleArray = data.map((detalle) => {
                return {
                  id: detalle.id,
                  nombre_Expediente: detalle.nombre_Expediente,
                  caja_Id: detalle.caja_Id,
                  inventario_Area_Id: detalle.inventario_Area_Id,
                  clave_Clasificacion: detalle.clave_Clasificacion,
                  no_Expediente_Interno: detalle.no_Expediente_Interno,
                  destino_Final: detalle.destino_Final,
                  vigencia_Concentracion: detalle.vigencia_Concentracion,
                  descripcion: detalle.descripcion,
                  signatura_Topografica: detalle.signatura_Topografica,
                  total_Paginas: detalle.total_Paginas,
                  fecha_Inicio: detalle.fecha_Inicio,
                  fecha_Termino: detalle.fecha_Termino,
                  valor_Documental: detalle.valor_Documental,
                  estatus: detalle.estatus
                }
              })
              this.detallesAI = detalleArray;
              this.isLoading = false;
            }
          }
        } else {
          this.isLoading = false;
        }
      } catch (error) {
        this.isLoading = false;
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async createDetalle(cajaId, detalle) {
      try {
        const resp = await api.post(`/DetallesCajasTrasnferencias/${cajaId}`, detalle)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            this.loadDetalles(cajaId)
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

    async deleteDetalle(cajaId, id) {
      try {
        const resp = await api.delete(`/DetallesCajasTrasnferencias/${cajaId}/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            this.loadDetalles(cajaId)
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

    async aprobarDetalle(id, cajaId, ubicacion) {
      try {
        const resp = await api.post(`/DetallesCajasTrasnferencias/${cajaId}/Aprobar/${id}`, { ubicacion })
        if (resp.status == 200) {
          const { success, data } = resp.data
          return { success, data }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo" }
        }
      } catch (e) {
        console.log(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async rechazar(id, cajaId, motivo) {
      try {
        const resp = await api.post(`/DetallesCajasTrasnferencias/${cajaId}/Rechazar/${id}`, { motivo })
        if (resp.status == 200) {
          const { success, data } = resp.data
          return { success, data }
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
