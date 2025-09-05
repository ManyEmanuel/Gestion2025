import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

export const useSeccionStore = defineStore('SeccionStore', {
  state: () => ({
    modal: false,
    seccionesC: [],
    seccionesS: [],
    seccionId: null,
    seccion: {
      id: null,
      codigo: null,
      descripcion: null,
      tipo: null
    },
    isEditar: false,
    listaSecciones: [],
  }),
  getters: {

  },
  actions: {

    initSeccion() {
      this.seccion.id = null
      this.seccion.tipo = null
      this.seccion.codigo = null
      this.seccion.descripcion = null
    },

    async loadSecciones() {
      try {
        this.secciones = [];
        const resp = await api.get('/Archivo/Secciones')
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              const secciones = data.map((element) => {
                return {
                  id: element.id,
                  codigo: element.codigo,
                  descripcion: element.descripcion,
                  tipo: element.tipo,
                  compuesto: element.compuesto
                }
              })
              this.seccionesC = secciones.filter(x => x.tipo == "C")
              this.seccionesS = secciones.filter(x => x.tipo == "S")
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

    async loadListaSecciones() {
      try {
        this.listaSecciones = [];
        const resp = await api.get('/Archivo/Secciones')

        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {

              this.listaSecciones = data.map((element) => {
                return {
                  value: element.id,
                  label: `${element.compuesto}-${element.descripcion}`
                }
              })
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

    async loadSeccion(id) {
      try {
        this.initSeccion()
        const resp = await api.get(`/Archivo/Secciones/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              this.seccion.id = data.id
              this.seccion.codigo = data.codigo
              this.seccion.descripcion = data.descripcion
              this.seccion.tipo = data.tipo
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

    async createSeccion(seccion) {
      try {
        const resp = await api.post("/Archivo/Secciones", seccion)
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

    async updateSeccion(seccion, id) {
      try {
        const resp = await api.put(`/Archivo/Secciones/${id}`, seccion)
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

    async deleteSeccion(id) {
      try {
        const resp = await api.delete(`/Archivo/Secciones/${id}`)
        if (resp.status == 200) {
          let { success, data } = resp.data
          if (success === true) {
            this.loadSecciones()
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

    setSeccionId(id) {
      this.seccionId = id
    },

    initSecciones() {
      this.listaSecciones = []
    }

  },
});
