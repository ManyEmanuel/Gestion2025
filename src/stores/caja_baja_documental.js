import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

export const useCajaBajaDocumentalStore = defineStore('CajaBajaDocumental', {
  state: () => ({
    isLoading: false,
    isEditar: false,
    isCompleto: false,
    modal: false,
    cajas: [],
    caja: {
      id: null,
      no_Caja: null,
      seccion_Id: null,
      peso: null,
      total_Expedientes: null,
      total_Paginas: null,
      detalle: []
    }
  }),
  actions: {

    initCaja() {
      this.caja.id = null
      this.caja.no_Caja = null
      this.caja.seccion_Id = null
      this.caja.peso = null
      this.caja.total_Expedientes = null
      this.caja.total_Paginas = null
      this.caja.detalle = []
    },

    // MIGRADO al backend nuevo (corte de clientes): GET /api/bajasdocumentales/{id}/cajas
    // (aislado por el área de la baja). Sección/total de páginas van en null.
    async loadCajas(bajaId) {
      try {
        const resp = await api.get(`/bajasdocumentales/${bajaId}/cajas`)
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.cajas = resp.data.map((caja) => ({
            id: caja.id,
            no_Caja: caja.noCaja,
            seccion: null,
            peso: caja.peso,
            total_Expedientes: caja.totalExpedientes,
            total_Paginas: null,
            estatus: caja.estatus
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

    async loadCaja(id) {
      try {
        const resp = await api.get(`/Arhivo/CajasBajas/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            this.caja.id = data.id
            this.caja.no_Caja = data.no_Caja
            this.caja.seccion_Id = data.secciones_Id
            this.caja.peso = data.peso
            this.caja.total_Expedientes = data.total_Expedientes
            this.caja.total_Paginas = data.total_Paginas
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

    async createCaja(bajaId, caja) {
      try {
        const resp = await api.post(`/Arhivo/CajasBajas/${bajaId}`, caja)
        if (resp.status == 200) {
          console.log(resp)
          const { success, data } = resp.data
          if (success == true) {
            this.loadCajas(bajaId)
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

    async updateCaja(id, bajaId, caja) {
      try {
        const resp = await api.put(`/Archivo/CajasBajas/${id}`, caja)
        if (resp.status == 200) {
          console.log(resp)
          const { success, data } = resp.data
          if (success == true) {
            this.loadCajas(bajaId)
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

    async deleteCaja(id, bajaId) {
      try {

        const resp = await api.delete(`/Arhivo/CajasBajas/${id}`)
        if (resp.status == 200) {
          let { success, data } = resp.data
          if (success === true) {
            this.loadCajas(bajaId);
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

    async loadAnexo14(comunes, sustantivas, cajas, transferencia) {
      try {
        let SeriesEncabezado = []
        let cuerpo = []
        let encabezado = []
        let listaAnios = []
        let peso = 0
        let orden = 1
        for (let caja of cajas) {
          peso = peso + caja.peso
          const resp = await api.get(`/Archivo/DetalleCajasBajas/GetAll/${caja.id}`)
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
                "B"
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
  },
});
