import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

export const useCajaTransferenciaSecundariaterStore = defineStore('useCajaTransferenciaSecundariaterStore', {
  state: () => ({
    isLoading: false,
    isEditar: false,
    isCompleto: false,
    modal: false,
    cajas: [],
    ubicacion: {
      inmueble: null,
      pasillo: null,
      estante: null,
      nivel: null
    },
    caja: {
      id: null,
      no_Caja: null,
      peso: null,
      fecha_Antigua: null,
      fecha_Reciente: null,
      total_Expedientes: null,
      total_Paginas: null,
      detalle: [],
      secciones: [],
      secciones_Id: []
    }
  }),
  actions: {
    async initUbicacion() {
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
      this.caja.detalle = []
      this.caja.secciones = []
    },

    async loadCajas(trasnferenciaId) {
      try {
        const resp = await api.get(`/Archivo/CajasTransferenciasSecundarias/GetAll/${trasnferenciaId}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              let cajasArray = data.map((caja) => {
                return {
                  id: caja.id,
                  encabezado_Id: caja.encabezado_Id,
                  no_Caja: caja.no_Caja,
                  seccion: caja.seccion,
                  peso: caja.peso,
                  fecha_Antigua: caja.fecha_Antigua,
                  fecha_Reciente: caja.fecha_Reciente,
                  total_Expedientes: caja.total_Expedientes,
                  total_Paginas: caja.total_Paginas,
                  estatus: caja.estatus
                }
              })
              this.cajas = cajasArray
            }
            let filtro = this.cajas.filter((caja) => caja.estatus == "Afectado")
            if (filtro.length === this.cajas.length && this.cajas.length > 0) {
              this.isCompleto = true
            } else {
              this.isCompleto = false
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

    async loadCaja(id) {
      try {
        const resp = await api.get(`/Archivo/CajasTransferenciasSecundarias/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              this.caja.id = data.id
              this.caja.no_Caja = data.no_Caja
              this.caja.peso = data.peso
              this.caja.fecha_Antigua = data.fecha_Antigua
              this.caja.fecha_Reciente = data.fecha_Reciente
              this.caja.total_Expedientes = data.total_Expedientes
              this.caja.total_Paginas = data.total_Paginas
              this.caja.secciones_Id = data.secciones_Id
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
        const resp = await api.post(`/Archivo/CajasTransferenciasSecundarias/${transferenciaId}`, caja)
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

    async updateCaja(transferenciaId, caja) {
      try {
        const resp = await api.put(`/Archivo/CajasTransferenciasSecundarias/${caja.id}`, caja)
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

    async deleteCaja(id, transferenciaId) {
      try {
        const resp = await api.delete(`/Archivo/CajasTransferenciasSecundarias/${id}`)
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

    async loadAnexo15(comunes, sustantivas, cajas, transferencia) {
      try {
        let SeriesEncabezado = []
        let cuerpo = []
        let encabezado = []
        let listaAnios = []
        let peso = 0
        let orden = 1
        for (let caja of cajas) {
          peso = peso + caja.peso
          const resp = await api.get(`/Archivo/DetalleCajasTransferenciaSecundaria/GetAll/${caja.id}`)
          if (resp.status == 200) {
            const { success, data } = resp.data
            for (let detalle of data) {
              let filtro = ""
              let division = detalle.clave_Clasificacion.split("/")
              let serie = division[2]
              let anios = division[division.length - 1]
              listaAnios.push(parseInt(anios))
              let subSeries = serie.split(".")
              let filtroComun = comunes.find(x => x.serie == serie)
              if (filtroComun != undefined) {
                filtro = filtroComun
              } else {
                let filtroSustantiva = sustantivas.find(x => x.serie == serie)
                filtro = filtroSustantiva
              }
              cuerpo.push([
                serie,
                filtro.nombre,
                detalle.clave_Clasificacion,
                orden,
                detalle.descripcion,
                detalle.fecha_Inicio,
                detalle.fecha_Termino,
                caja.no_Caja,
                filtro.valor_Documental,
                filtro.vigencia_Archivo_Concentracion,
                "H"
              ])
              SeriesEncabezado.push(subSeries[0])
              orden = orden + 1
            }
          }
        }
        const seriesUnicas = [...new Set(SeriesEncabezado)];
        const seriesUnicasTexto = seriesUnicas.join(", ");
        listaAnios.sort((a, b) => a - b);
        encabezado.push([
          encabezado.area_Responsable = transferencia.area_Responsable,
          encabezado.area_Generadora = transferencia.area_Generadora,
          encabezado.valida_Area = transferencia.aprobo,
          encabezado.puesto_Valida_Area = transferencia.puesto_Aprobo,
          encabezado.fecha_Transferencia = transferencia.fecha_Elaboracion,
          encabezado.numero_Transferencia = transferencia.no_Transferencia,
          encabezado.secciones = seriesUnicasTexto,
          encabezado.elaboro = transferencia.elaboro,
          encabezado.puesto_Elaboro = transferencia.puesto_Elaboro,
          encabezado.valida = transferencia.valida,
          encabezado.puesto_Valida = "Enlace del archivo de trámite de la " + transferencia.area_Generadora,
          encabezado.visto_Bueno = transferencia.visto_Bueno,
          encabezado.puesto_Visto_Bueno = transferencia.puesto_Visto_Bueno,
          encabezado.aprobo = transferencia.aprobo,
          encabezado.puesto_Aprobo = transferencia.puesto_Aprobo,
          encabezado.anios = listaAnios[0] + " - " + listaAnios[listaAnios.length - 1],
          encabezado.cajas = cajas.length,
          encabezado.peso = peso
        ])

        return ({ encabezado: encabezado, cuerpo: cuerpo })
      } catch (error) {
        console.error
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
