import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

export const useTransferenciaPrimariaEncabezadoStore = defineStore('TransferenciaPrimariaEncabezado', {
  state: () => ({
    isLoading: false,
    isEditar: false,
    modal: false,
    modalAI: false,
    encabezados: [],
    encabezadosFiltro: [],
    encabezadosAi: [],
    encabezadosAiFiltro: [],
    inventarios: [],
    encabezado: {
      id: null,
      area_Responsable_Id: null,
      area_Responsable: null,
      area_Generadora_Id: null,
      area_Generadora: null,
      enlace_Id: null,
      enlace: null,
      puesto_Enlace: null,
      valida_Area_Id: null,
      valida_Area: null,
      puesto_Valida_Area: null,
      coteja_Id: null,
      coteja: null,
      puesto_Coteja: null,
      valida_Id: null,
      valida: null,
      puesto_Valida: null,
      nombre: null,
      numero_Transferencia: null,
      total_Cajas: null,
      total_Expedientes: null,
      peso_Total: null,
      fecha_Antigua: null,
      fecha_Reciente: null,
      estatus: null,
      fecha_Transferencia: null,
      secciones: null,
      conteo_Cajas: null,
      conteo_Hojas: null,
      // fecha_Transferencia: null
    },
    listaAreasGeneradoras: [],
  }),
  actions: {

    initEncabezado() {
      // this.encabezado.area_Responsable_Id = null;
      // this.encabezado.area_Responsable = null;
      // this.encabezado.area_Generadora_Id = null;
      // this.encabezado.area_Generadora = null;
      // this.encabezado.enlace_Id = null;
      // this.encabezado.enlace = null;
      // this.encabezado.Valida_Area_Id = null;
      // this.encabezado.valida_Area = null;
      // this.encabezado.Valida_Id = null;
      // this.encabezado.valida = null;
      // this.encabezado.coteja_Id = null;
      // this.encabezado.coteja = null;
      this.encabezado.nombre = null;
      this.encabezado.numero_Transferencia = null;
      // this.encabezado.seccion_Id = null;
      this.encabezado.total_Cajas = null;
      this.encabezado.total_Expedientes = null;
      this.encabezado.peso_Total = null;
      this.encabezado.fecha_Antigua = null;
      this.encabezado.fecha_Reciente = null;
      this.encabezado.estatus = null;
      this.encabezado.secciones = null;
      // this.encabezado.fecha_Transferencia = null;
    },

    async loadArea() {
      try {
        const resp = await api.get("/Areas/AreaByUsuario")
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              const { area_Id, area, area_Padre_Id, area_Padre } = data;
              this.encabezado.area_Generadora_Id = area_Id;
              this.encabezado.area_Generadora = area;
              this.encabezado.area_Responsable_Id = area_Padre_Id;
              this.encabezado.area_Responsable = area_Padre;
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

    async loadEnlace() {
      try {
        const resp = await api.get("/Archivo/Enlace/ByUsuario")
        if (resp.status == 200) {
          const { success, id, enlace } = resp.data
          if (success === true) {
            this.encabezado.enlace_Id = id
            this.encabezado.enlace = enlace
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

    async loadRespArchivo() {
      try {
        const resp = await api.get("/Archivo/InventariosGeneralesAreasEncabezado/GetRespArchivo")
        if (resp.status == 200) {
          const { success, id, empleado } = resp.data
          if (success === true) {
            this.encabezado.coteja_Id = id
            this.encabezado.coteja = empleado
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

    async loadResponsableArea() {
      try {
        const resp = await api.get("/ResponsablesAreas/ResposableByUsuario")
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              const { empleado_Id, empleado } = data;
              this.encabezado.valida_Area_Id = empleado_Id;
              this.encabezado.valida_Area = empleado;
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

    async loadValida() {
      try {
        const resp = await api.get("/Archivo/InventariosGeneralesAreasEncabezado/GetSupervisa")
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              const { empleado_Id, empleado } = data;
              this.encabezado.valida_Id = empleado_Id;
              this.encabezado.valida = empleado;
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

    async loadEncabezados() {
      try {
        this.isLoading = true
        const resp = await api.get('Archivo/TransferenciasPrimariasEncabezados')
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (data) {
            this.encabezados = []
            let areas = []
            const encabezadosArray = data.map((enc) => {
              areas.push(enc.area_Generadora)
              return {
                id: enc.id,
                area_Responsable_Id: enc.area_Responsable_Id,
                area_Responsable: enc.area_Responsable,
                fecha_Registro: enc.fecha_Registro,
                area_Generadora_Id: enc.area_Generadora_Id,
                area_Generadora: enc.area_Generadora,
                enlace_Id: enc.enlace_Id,
                enlace: enc.enlace,
                puesto_Enlace: enc.puesto_Enlace,
                valida_Area_Id: enc.valida_Area_Id,
                valida_Area: enc.valida_Area,
                puesto_Valida_Area: enc.puesto_Valida_Area,
                coteja_Id: enc.coteja_Id,
                coteja: enc.coteja,
                puesto_Coteja: enc.puesto_Coteja,
                valida_Id: enc.valida_Id,
                valida: enc.valida,
                puesto_Valida: enc.puesto_Valida,
                nombre: enc.nombre,
                numero_Transferencia: enc.numero_Transferencia,
                total_Cajas: enc.total_Cajas,
                total_Expedientes: enc.total_Expedientes,
                peso_Total: enc.peso_Total,
                fecha_Antigua: enc.fecha_Antigua,
                fecha_Reciente: enc.fecha_Reciente,
                estatus: enc.estatus,
                conteo_Cajas: enc.conteo_Cajas,
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

    async loadEncabezadosAi() {
      try {
        this.isLoading = true
        const resp = await api.get('Archivo/TransferenciasPrimariasEncabezadosAI')
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (data) {
            this.encabezadosAi = []
            let areas = []
            const encabezadosArray = data.map((enc) => {
              areas.push(enc.area_Generadora)
              return {
                id: enc.id,
                area_Responsable_Id: enc.area_Responsable_Id,
                area_Responsable: enc.area_Responsable,
                fecha_Registro: enc.fecha_Registro,
                area_Generadora_Id: enc.area_Generadora_Id,
                area_Generadora: enc.area_Generadora,
                enlace_Id: enc.enlace_Id,
                enlace: enc.enlace,
                valida_Area_Id: enc.valida_Area_Id,
                valida_Area: enc.valida_Area,
                coteja_Id: enc.coteja_Id,
                coteja: enc.coteja,
                valida_Id: enc.valida_Id,
                valida: enc.valida,
                nombre: enc.nombre,
                numero_Transferencia: enc.numero_Transferencia,
                total_Cajas: enc.total_Cajas,
                total_Expedientes: enc.total_Expedientes,
                peso_Total: enc.peso_Total,
                fecha_Antigua: enc.fecha_Antigua,
                fecha_Reciente: enc.fecha_Reciente,
                estatus: enc.estatus,
              }
            })
            this.encabezadosAi = encabezadosArray
            this.encabezadosAiFiltro = encabezadosArray
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

    async loadEncabezadosAiFiltro(area) {
      try {
        if (area == "Ver todos") {
          this.encabezadosAiFiltro = this.encabezadosAi
        } else {
          this.encabezadosAiFiltro = this.encabezadosAi.filter(enc => enc.area_Generadora == area)
        }
      } catch (error) {
        console.error(error)
      }
    },

    async loadInventarios(id) {
      try {
        const resp = await api.get(`Archivo/TransferenciasPrimariasEncabezados/GetDataAnexo9/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success) {
            this.inventarios = data
          } else {
            return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (error) {
        this.isLoading = false
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadEncabezado(id) {
      try {
        this.isLoading = true
        const resp = await api.get(`Archivo/TransferenciasPrimariasEncabezados/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (data) {
            this.encabezado.id = data.id;
            this.encabezado.area_Responsable_Id = data.area_Responsable_Id;
            this.encabezado.area_Responsable = data.area_Responsable;
            this.encabezado.fecha_Registro = data.fecha_Registro;
            this.encabezado.area_Generadora_Id = data.area_Generadora_Id;
            this.encabezado.area_Generadora = data.area_Generadora;
            this.encabezado.enlace_Id = data.enlace_Id;
            this.encabezado.enlace = data.enlace;
            this.encabezado.puesto_Enlace = data.puesto_Enlace;
            this.encabezado.valida_Id = data.valida_Id;
            this.encabezado.valida = data.valida;
            this.encabezado.puesto_Valida = data.puesto_Valida;
            this.encabezado.valida_Area_Id = data.valida_Area_Id;
            this.encabezado.valida_Area = data.valida_Area;
            this.encabezado.puesto_Valida_Area = data.puesto_Valida_Area
            this.encabezado.coteja = data.coteja;
            this.encabezado.coteja_Id = data.coteja_Id
            this.encabezado.puesto_Coteja = data.puesto_Coteja
            this.encabezado.nombre = data.nombre;
            this.encabezado.numero_Transferencia = data.numero_Transferencia;
            this.encabezado.total_Cajas = data.total_Cajas;
            this.encabezado.total_Expedientes = data.total_Expedientes;
            this.encabezado.fecha_Antigua = data.fecha_Antigua;
            this.encabezado.fecha_Reciente = data.fecha_Reciente;
            this.encabezado.estatus = data.estatus;
            this.encabezado.fecha_Transferencia = data.fecha_Transferencia
            this.encabezado.secciones = data.secciones
            this.encabezado.peso_Total = data.peso_Total
            this.encabezado.conteo_Cajas = data.conteo_Cajas
            this.encabezado.conteo_Hojas = data.conteo_Hojas
            // this.encabezado.fecha_Transferencia = data.fecha_Transferencia;
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async createTransferenciaPrimariaEncabezado(encabezado) {
      try {
        const resp = await api.post('Archivo/TransferenciasPrimariasEncabezados', encabezado)
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

    async updateTransferenciaPrimariaEncabezado(id, encabezado) {
      try {
        if (encabezado.fecha_Antigua == 'Sin registro') {
          encabezado.fecha_Antigua = null
        }

        if (encabezado.fecha_Reciente == 'Sin registro') {
          encabezado.fecha_Reciente = null
        }
        const resp = await api.put(`Archivo/TransferenciasPrimariasEncabezados/${id}`, encabezado)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success == true) {
            this.loadEncabezados();
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

    async deleteTransferenciaPrimariaEncabezado(id) {
      try {
        const resp = await api.delete(`Archivo/TransferenciasPrimariasEncabezados/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            this.loadEncabezados();
            return { success, data }
          } else {
            return { success, data }
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo" }
        }
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async enviarTransferencia(id) {
      try {
        const resp = await api.get(`/Archivo/TransferenciasPrimariasEncabezados/Transferir/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          return { success, data }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo" }
        }
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async aprobarMasivo(id) {
      try {
        const resp = await api.get(`/Archivo/TransferenciasPrimariasEncabezadosAI/AprobarMasivo/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          return { success, data }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo" }
        }
      } catch (e) {
        console.error(e);
        return { success: false, data: "Ocurrio un error, intentelo de nuevo" }
      }
    },

    async afectarTransferencia(id) {
      try {
        const resp = await api.get(`/Archivo/TransferenciasPrimariasEncabezadosAI/Afectar/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          return { success, data }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo" }
        }
      } catch (e) {
        console.error(e);
        return { success: false, data: "Ocurrio un error, intentelo de nuevo" }
      }
    },

    actualizarModal(valor) {
      this.modal = valor;
    },

    actualizarModalAI(valor) {
      this.modalAI = valor;
    },

    updateEditar(valor) {
      this.isEditar = valor;
    },

  },
});
