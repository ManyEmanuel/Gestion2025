import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

export const useCajaTransferenciaStore = defineStore('CajaTransferenciaStore', {
  state: () => ({
    isLoading: false,
    isEditar: false,
    modal: false,
    modalAI: false,
    isCompleto: false,
    ubicacion: {
      inmueble: null,
      pasillo: null,
      estante: null,
      nivel: null
    },
    cajas: [],
    caja: {
      id: null,
      no_Caja: null,
      peso: null,
      fecha_Antigua: null,
      fecha_Reciente: null,
      total_Expedientes: null,
      total_Paginas: null,
      seccion: null,
      year: null,
      detalle: [],
      secciones: [],
      secciones_Id: [],
      estatus: null,
      ubicacion: null
    }
  }),
  actions: {
    initUbicacion() {
      this.ubicacion.inmueble = null
      this.ubicacion.pasillo = null
      this.ubicacion.estante = null
      this.ubicacion.nivel = null
    },

    initCaja() {
      this.caja.id = null
      this.caja.no_Caja = null
      this.caja.peso = null
      this.caja.fecha_Antigua = null
      this.caja.fecha_Reciente = null
      this.caja.total_Expedientes = null
      this.caja.total_Paginas = null
      this.caja.year = null
      this.caja.detalle = []
      this.caja.secciones_Id = []
      this.caja.estatus = null
    },

    // MIGRADO al backend nuevo (corte de clientes): GET /api/transferenciasprimarias/{id}/cajas
    // devuelve un array de cajas (aislado por el área de la transferencia). Campos de secundaria
    // (sección, fechas extremas, total de páginas, año) van en null.
    async loadCajas(transferenciaId) {
      try {
        const resp = await api.get(`/transferenciasprimarias/${transferenciaId}/cajas`)
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.cajas = resp.data.map((caja) => ({
            id: caja.id,
            trasnferencia_Primaria_Encabezado_Id: caja.transferenciaId,
            trasnferencia: null,
            no_Caja: caja.noCaja,
            seccion_Id: null, seccion: null,
            peso: caja.peso,
            fecha_Antigua: null, fecha_Reciente: null,
            total_Expedientes: caja.totalExpedientes,
            total_Paginas: null,
            estatus: caja.estatus,
            year: null
          }))
          let filtro = this.cajas.filter((caja) => caja.estatus == "Afectada")
          this.isCompleto = this.cajas.length > 0 && filtro.length === this.cajas.length
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        console.log(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadCaja(transferenciaId, id) {
      try {
        const resp = await api.get(`/Archivo/CajasTransferencias/${transferenciaId}/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            console.log("Esto es el de caja", data)
            if (data) {
              this.caja.id = data.id
              this.caja.no_Caja = data.no_Caja
              this.caja.secciones_Id = data.secciones_Id
              this.caja.seccion = data.seccion
              this.caja.peso = data.peso
              this.caja.fecha_Antigua = data.fecha_Antigua
              this.caja.fecha_Reciente = data.fecha_Reciente
              this.caja.total_Expedientes = data.total_Expedientes
              this.caja.total_Paginas = data.total_Paginas
              this.caja.year = data.year
              this.caja.estatus = data.estatus
              this.caja.ubicacion = data.ubicacion
            }
          } else {
            return { success, data }
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (error) {
        console.log(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async createCaja(transferenciaId, caja) {
      try {
        const resp = await api.post(`/Archivo/CajasTransferencias/${transferenciaId}`, caja)
        if (resp.status == 200) {
          console.log(resp)
          const { success, data } = resp.data
          if (success == true) {
            this.loadCajas(transferenciaId)
            return { success, data }
          } else {
            return { success, data }
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async createUbicacion(ubicacion, caja) {
      try {
        let nuevaUbicacion = ubicacion.inmueble + "|" + ubicacion.pasillo + "|" + ubicacion.estante + "|" + ubicacion.nivel
        const resp = await api.post(`/Archivo/InventariosAreasAI/ByCaja/${caja}`, { ubicacion: nuevaUbicacion })
        if (resp.status == 200) {
          console.log(resp)
          const { success, data } = resp.data
          if (success == true) {
            return { success, data }
          } else {
            return { success, data }
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async createUbicacionHistorico(ubicacion, caja) {
      try {
        let nuevaUbicacion = ubicacion.inmueble + "|" + ubicacion.pasillo + "|" + ubicacion.estante + "|" + ubicacion.nivel
        const resp = await api.post(`/Archivo/InventariosAreasAI/ByCajaHistorico/${caja}`, { ubicacion: nuevaUbicacion })
        if (resp.status == 200) {
          console.log(resp)
          const { success, data } = resp.data
          if (success == true) {
            return { success, data }
          } else {
            return { success, data }
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async updateCaja(transferenciaId, id, caja) {
      try {
        const resp = await api.put(`/Archivo/CajasTransferencias/${transferenciaId}/${id}`, caja)
        if (resp.status == 200) {
          let { success, data } = resp.data
          if (success === true) {
            this.loadCajas(transferenciaId);
            return { success, data }
          } else {
            return { success, data }
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo" }
        }

      } catch (error) {
        console.log(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async deleteCaja(id, transferenciaId) {
      try {
        const resp = await api.delete(`/Archivo/CajasTransferencias/${transferenciaId}/${id}`)
        if (resp.status == 200) {
          let { success, data } = resp.data
          if (success === true) {
            this.loadCajas(transferenciaId);
            return { success, data }
          } else {
            return { success, data }
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo" }
        }

      } catch (error) {
        console.log(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    updateEditar(valor) {
      this.isEditar = valor
    },

    actualizarModal(valor) {
      this.modal = valor
    },

    actualizarModalAI(valor) {
      this.modalAI = valor
    }

  },
});
