import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

export const useSeriesStore = defineStore('SeriesStore', {
  state: () => ({
    modal: false,
    series: [],
    serieId: null,
    serie: {
      id: null,
      seccion_Id: null,
      seccion: null,
      serie: null,
      serie_Compuestsa: null,
      descripcion: null
    },
    isEditar: false,
    listaSeries: []
  }),
  getters: {

  },
  actions: {

    initSerie() {
      this.serie.id = null
      this.serie.seccion_Id = null
      this.serie.seccion = null
      this.serie.serie = null
      this.serie.serie_Compuestsa = null
      this.serie.descripcion = null
    },

    async loadSeries(seccionId) {
      try {
        this.series = []
        const resp = await api.get(`/Archivo/Series/BySeccion/${seccionId}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              data.forEach(element => {
                const {
                  id,
                  seccion_Id,
                  seccion,
                  serie,
                  serie_Compuestsa,
                  descripcion
                } = element

                const serieItem = { id, seccion_Id, seccion, serie, serie_Compuestsa, descripcion }
                this.series.push(serieItem)
              });
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

    // MIGRADO al backend nuevo (corte): GET /api/series/por-seccion/{seccionId} -> array de
    // { id, seccionId, clave, nombre }. Se arma { value, label } para el dropdown.
    async loadListaSeries(seccionId) {
      try {
        this.listaSeries = []
        const resp = await api.get(`/series/por-seccion/${seccionId}`)
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.listaSeries = resp.data.map((element) => ({
            value: element.id,
            label: `${element.clave}-${element.nombre}`
          }))
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadSerie(id) {
      try {
        this.initSerie()
        const resp = await api.get(`/Archivo/Series/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              this.serie.id = data.id
              this.serie.descripcion = data.descripcion
              this.serie.seccion = data.seccion
              this.serie.seccion_Id = data.seccion_Id
              this.serie.serie = data.serie
              this.serie.serie_Compuestsa = data.serie_Compuestsa
            } else {
              return { success, data }
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

    async createSerie(serie) {
      try {
        const resp = await api.post("/Archivo/Series", serie)
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
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async updateSerie(serie, id) {
      try {
        const resp = await api.put(`/Archivo/Series/${id}`, serie)
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
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async deleteSerie(id) {
      try {
        const resp = await api.delete(`/Archivo/Series/${id}`)
        if (resp.status == 200) {
          let { success, data } = resp.data
          if (success === true) {
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

    actualizarModal(valor) {
      this.modal = valor
    },

    updateEditar(valor) {
      this.isEditar = valor
    },

    setSerieId(id) {

      this.serieId = id
    },

    initListaSeries() {
      this.listaSeries = []
    },

    initSeries() {
      this.series = []
    }
  }

})
