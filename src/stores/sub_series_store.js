import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

export const useSubSerieStore = defineStore('SubSerieStore', {
  state: () => ({
    modal: false,
    subSeries: [],
    isEditar: false,
    subSerie: {
      id: null,
      serie_Id: null,
      serie: null,
      subSerie: null,
      subSerie_Compuesta: null,
      descripcion: null
    },
    listaSubSeries: []
  }),

  actions: {

    initSubSerie() {
      this.subSerie.id = null
      this.subSerie.serie_Id = null
      this.subSerie.serie = null
      this.subSerie.subSerie = null
      this.subSerie.subSerie_Compuesta = null
      this.subSerie.descripcion = null
    },

    initSubSeries() {
      this.subSeries = []
    },

    async loadSubSeries(serieId) {
      try {
        this.subSeries = []
        const resp = await api.get(`/Archivo/SubSeries/BySerie/${serieId}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              data.forEach(element => {
                const {
                  id,
                  serie_Id,
                  serie,
                  subSerie,
                  subSerie_Compuesta,
                  descripcion
                } = element

                const subSerieItem = { id, serie_Id, serie, subSerie, subSerie_Compuesta, descripcion }
                this.subSeries.push(subSerieItem)
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

    // MIGRADO al backend nuevo (corte): GET /api/subseries/por-serie/{serieId} -> array de
    // { id, serieId, clave, nombre }. Se arma { value, label } para el dropdown.
    async loadListaSubSeries(serieId) {
      try {
        this.listaSubSeries = []
        const resp = await api.get(`/subseries/por-serie/${serieId}`)
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.listaSubSeries = resp.data.map((element) => ({
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

    async loadSubSerie(id) {
      try {
        this.initSubSerie()
        const resp = await api.get(`/Archivo/SubSeries/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              this.subSerie.id = data.id
              this.subSerie.serie_Id = data.serie_Id
              this.subSerie.serie = data.serie
              this.subSerie.subSerie = data.subSerie
              this.subSerie.subSerie_Compuesta = data.subSerie_Compuesta
              this.subSerie.descripcion = data.descripcion
              return { success: true }
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

    async createSubSerie(subSerie) {
      try {
        const resp = await api.post("/Archivo/SubSeries", subSerie)
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

    async updateSubserie(subSerie, id) {
      try {
        const resp = await api.put(`/Archivo/SubSeries/${id}`, subSerie)
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

    async deleteSubserie(id) {
      try {
        const resp = await api.delete(`/Archivo/SubSeries/${id}`)
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

    initListaSubSerie() {
      this.listaSubSeries = []
    },

    initSubSeries() {
      this.subSeries = []
    }

  },
});
