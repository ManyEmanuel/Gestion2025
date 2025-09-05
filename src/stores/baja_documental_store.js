import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';


export const useBajaDocumentalStore = defineStore('BajaDocumental', {
  state: () => ({
    isLoading: false,
    isEditar: false,
    modal: false,
    modal_ver: false,
    encabezados: [],
    encabezadosFiltro: [],
    encabezado: {
      id: null,
      area_Responsable_Id: null,
      area_Responsable: null,
      area_Generadora_Id: null,
      area_Generadora: null,
      elaboro_Id: null,
      elaboro: null,
      valida_Id: null,
      valida: null,
      visto_Bueno_Id: null,
      visto_Bueno: null,
      aprobo_Id: null,
      aprobo: null,
      fecha_Transferencia: null,
      fecha_Elaboracion: null,
      secciones: null,
      no_Transferencia: null,
      observaciones: null,
      estatus: null,
      puesto_Aprobo: null,
      puesto_Elaboro: null,
      puesto_Valida: null,
      puesto_Visto_Bueno: null,
      nombre: null,

    },
    listaAreasGeneradoras: [],
  }),
  actions: {

    initEncabezado() {
      this.encabezado.id = null
      this.encabezado.area_Responsable_Id = null
      this.encabezado.area_Responsable = null
      this.encabezado.area_Generadora_Id = null
      this.encabezado.area_Generadora = null
      this.encabezado.elaboro_Id = null
      this.encabezado.valida_Id = null
      this.encabezado.valida = null
      this.encabezado.visto_Bueno_Id = null
      this.encabezado.visto_Bueno = null
      this.encabezado.aprobo_Id = null
      this.encabezado.aprobo = null
      this.encabezado.fecha_Transferencia = null
      this.encabezado.fecha_Elaboracion = null
      this.encabezado.secciones = null
      this.encabezado.no_Transferencia = null
      this.encabezado.observaciones = null
      this.encabezado.estatus = null
      this.encabezado.puesto_Aprobo = null
      this.encabezado.puesto_Elaboro = null
      this.encabezado.puesto_Valida = null
      this.encabezado.puesto_Visto_Bueno = null
      this.encabezado.nombre = null

    },

    async loadEncabezados() {
      try {
        this.isLoading = true
        const resp = await api.get('/Archivo/BajaDocumental')
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (data) {
            this.encabezados = []
            let areas = []
            const encabezadosArray = data.map((enc) => {
              areas.push(enc.area_Generadora)
              return {
                id: enc.id,
                no_Transferencia: enc.no_Transferencia,
                area_Responsable: enc.area_Responsable,
                area_Generadora: enc.area_Generadora,
                fecha_Elaboracion: enc.fecha_Elaboracion,
                elaboro: enc.elaboro,
                valida: enc.valida,
                visto_Bueno: enc.visto_Bueno,
                aprobo: enc.aprobo,
                estatus: enc.estatus,
                nombre: enc.nombre,
              }
            })
            this.encabezados = encabezadosArray
            this.encabezadosFiltro = encabezadosArray
            this.isLoading = false
            let areasUnicas = [...new Set(areas)].sort();
            areasUnicas.unshift("Ver todos");
            this.listaAreasGeneradoras = areasUnicas
            return { success }
          }
        } else {
          this.isLoading = false
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (error) {
        this.isLoading = false
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadEncabezadosFiltro(area) {
      try {
        if (area == "Ver todos") {
          this.encabezadosFiltro = this.encabezados
        } else {
          this.encabezadosFiltro = this.encabezados.filter(enc => enc.area_Generadora == area)
        }
      } catch (error) {
        console.error(error)
      }
    },

    async loadEncabezado(id) {
      try {
        this.isLoading = true
        const resp = await api.get(`Archivo/BajaDocumental/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success == true) {
            this.encabezado.id = data.id
            this.encabezado.aprobo = data.aprobo
            this.encabezado.aprobo_Id = data.aprobo_Id
            this.encabezado.puesto_Aprobo = data.puesto_Aprobo
            this.encabezado.area_Generadora = data.area_Generadora
            this.encabezado.area_Generadora_Id = data.area_Generadora_Id
            this.encabezado.area_Responsable = data.area_Responsable
            this.encabezado.area_Responsable_Id = data.area_Responsable_Id
            this.encabezado.elaboro = data.elaboro
            this.encabezado.elaboro_Id = data.elaboro_Id
            this.encabezado.puesto_Elaboro = data.puesto_Elaboro
            this.encabezado.estatus = data.estatus
            this.encabezado.fecha_Elaboracion = data.fecha_Elaboracion
            this.encabezado.no_Transferencia = data.no_Transferencia
            this.encabezado.valida = data.valida
            this.encabezado.valida_Id = data.valida_Id
            this.encabezado.puesto_Valida = data.puesto_Valida
            this.encabezado.visto_Bueno = data.visto_Bueno
            this.encabezado.visto_Bueno_Id = data.visto_Bueno_Id
            this.encabezado.puesto_Visto_Bueno = data.puesto_Visto_Bueno
            this.encabezado.estatus = data.estatus
            this.encabezado.nombre = data.nombre
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
      }
    },

    async loadRespArchivo() {
      try {
        const resp = await api.get("/Archivo/InventariosGeneralesAreasEncabezado/GetRespArchivo")
        if (resp.status == 200) {
          const { success, id, empleado } = resp.data
          if (success === true) {
            this.encabezado.elaboro_Id = id
            this.encabezado.elaboro = empleado
            return { success }

          } else {
            return { success, data }
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadAprueba() {
      try {
        const resp = await api.get("/Archivo/InventariosGeneralesAreasEncabezado/GetSupervisa")
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              const { empleado_Id, empleado } = data;
              this.encabezado.aprobo_Id = empleado_Id;
              this.encabezado.aprobo = empleado;
              return { success }
            } else {
              return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
            }
          } else {
            return { success, data }
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadEnlace(area_id) {
      try {
        const resp = await api.get(`/Archivo/Enlace/ByArea/${area_id}`)
        if (resp.status == 200) {
          const { success, id, enlace } = resp.data
          if (success === true) {
            this.encabezado.valida_Id = id
            this.encabezado.valida = enlace
            return { success }
          } else {
            return { success, data }
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadResponsableArea(area_id) {
      try {
        const resp = await api.get(`/ResponsablesAreas/ResposableByArea/${area_id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              const { empleado_Id, empleado } = data;
              this.encabezado.visto_Bueno_Id = empleado_Id;
              this.encabezado.visto_Bueno = empleado;
              return { success }
            } else {
              return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
            }
          } else {
            return { success, data }
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async createTransferencia(encabezado) {
      try {
        const resp = await api.post('Archivo/BajaDocumental', encabezado)
        if (resp.status == 200) {
          const { success, data, id } = resp.data
          if (success == true) {
            this.loadEncabezados();
            return { success, data, id }
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

    async afectar(id) {
      try {
        const resp = await api.get(`/Archivo/BajaDocumental/Afectar/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          return { success, data }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    actualizarModal(valor) {
      this.modal = valor;
    },

    actualizarModalVer(valor) {
      this.modal_ver = valor
    },

    actualizarModalAI(valor) {
      this.modalAI = valor;
    },

    updateEditar(valor) {
      this.isEditar = valor;
    },

  },
});
