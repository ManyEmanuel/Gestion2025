import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

export const useDisposicionDocStore = defineStore('DisposicionDocStore', {
  state: () => ({
    modal: false,
    modalEditar: false,
    modalEditar: false,
    disposiciones: [],
    valorDocumental: [],
    NivelSeguridad: [],
    isEditar: false,
    disposicion: {
      id: null,
      seccion_Id: null,
      seccion: null,
      serie_Id: null,
      serie: null,
      subSerie_Id: null,
      subSerie: null,
      nivel_Seguridad_Id: null,
      nivel_Seguridad: null,
      valor_Documental_Id: null,
      valor_Documental: null,
      nombre: null,
      vigencia_Archivo_Tramite: null,
      vigencia_Archivo_Concentracion: null,
      eliminacion: null,
      archivo_Historico: null,
      muestreo: null,
      observaciones: null,
      sistema_Datos_Personales_Nombre: null,
      disposicion_Documental: null
    }
  }),

  actions: {
    initDisposicion() {
      this.disposicion.id = null
      this.disposicion.seccion_Id = null
      this.disposicion.seccion = null
      this.disposicion.serie_Id = null
      this.disposicion.serie = null
      this.disposicion.subSerie_Id = null
      this.disposicion.subSerie = null
      this.disposicion.nivel_Seguridad_Id = null
      this.disposicion.nivel_Seguridad = null
      this.disposicion.valor_Documental_Id = null
      this.disposicion.valor_Documental = null
      this.disposicion.nombre = null
      this.disposicion.vigencia_Archivo_Tramite = null
      this.disposicion.vigencia_Archivo_Concentracion = null
      this.disposicion.eliminacion = null
      this.disposicion.archivo_Historico = null
      this.disposicion.muestreo = null
      this.disposicion.observaciones = null
      this.disposicion.sistema_Datos_Personales_Nombre = null
      this.disposicion.disposicion_Documental = null
    },

    async loadDisposiciones(tipo) {
      try {
        this.disposiciones = []
        const resp = await api.get(`/Archivo/DisposicionesDocumentales/${tipo}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              this.disposiciones = data.map((element) => {
                return {
                  id: element.id,
                  seccion_Id: element.seccion_Id,
                  seccion: element.seccion,
                  serie_Id: element.serie_Id,
                  serie: element.serie,
                  subSerie_Id: element.subSerie_Id,
                  subSerie: element.subSerie,
                  nivel_Seguridad_Id: element.nivel_Seguridad_Id,
                  nivel_Seguridad: element.nivel_Seguridad,
                  valor_Documental_Id: element.valor_Documental_Id,
                  valor_Documental: element.valor_Documental,
                  nombre: element.nombre,
                  vigencia_Archivo_Tramite: element.vigencia_Archivo_Tramite,
                  vigencia_Archivo_Concentracion: element.vigencia_Archivo_Concentracion,
                  disposicion_Documental: element.disposicion_Documental,
                  total_Vigencia: element.total_Vigencia
                }
              })
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

    async loadValoresDocumentales() {
      try {
        this.valorDocumental = []
        const resp = await api.get("/Archivo/ValorDocumental")
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              data.forEach(element => {
                const { id, valor_Documental } = element
                const valorDoc = {
                  value: id, label: valor_Documental
                }
                this.valorDocumental.push(valorDoc)
              });
              return { success }
            }
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadNivelesSeguridad() {
      try {
        this.NivelSeguridad = []
        const resp = await api.get("/Archivo/NivelesSeguridad")
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              data.forEach(element => {
                const { id, nivel_Seguridad } = element
                const nivel = {
                  value: id, label: nivel_Seguridad
                }
                this.NivelSeguridad.push(nivel)
              });
              return { success }
            }
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadDisposicion(id) {
      try {
        this.initDisposicion()
        const resp = await api.get(`/Archivo/DisposicionesDocumentales/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              this.disposicion.id = data.id
              this.disposicion.seccion_Id = data.seccion_Id
              this.disposicion.seccion = data.seccion
              this.disposicion.serie_Id = data.serie_Id
              this.disposicion.serie = data.serie
              this.disposicion.subSerie_Id = data.subSerie_Id
              this.disposicion.subSerie = data.subSerie
              this.disposicion.nivel_Seguridad_Id = data.nivel_Seguridad_Id
              this.disposicion.nivel_Seguridad = data.nivel_Seguridad
              this.disposicion.valor_Documental_Id = data.valor_Documental_Id
              this.disposicion.valor_Documental = data.valor_Documental
              this.disposicion.nombre = data.nombre
              this.disposicion.vigencia_Archivo_Tramite = data.vigencia_Archivo_Tramite
              this.disposicion.vigencia_Archivo_Concentracion = data.vigencia_Archivo_Concentracion
              this.disposicion.eliminacion = data.eliminacion
              this.disposicion.archivo_Historico = data.archivo_Historico
              this.disposicion.muestreo = data.muestreo
              this.disposicion.observaciones = data.observaciones
              this.disposicion.sistema_Datos_Personales_Nombre = data.sistema_Datos_Personales_Nombre
              this.disposicion.disposicion_Documental = data.disposicion_Documental
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

    async loadDisposicionBySerie(seccion, serie, subserie) {
      try {
        this.initDisposicion()
        const resp = await api.get(`/Archivo/DisposicionesDocumentales/ConsultaDisposicion?Seccion_Id=${seccion}&Serie_Id=${serie}&SubSerie_Id=${subserie}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              this.disposicion.id = data.id
              this.disposicion.seccion_Id = data.seccion_Id
              this.disposicion.seccion = data.seccion
              this.disposicion.serie_Id = data.serie_Id
              this.disposicion.serie = data.serie
              this.disposicion.subSerie_Id = data.subSerie_Id
              this.disposicion.subSerie = data.subSerie
              this.disposicion.nivel_Seguridad_Id = data.nivel_Seguridad_Id
              this.disposicion.nivel_Seguridad = data.nivel_Seguridad
              this.disposicion.valor_Documental_Id = data.valor_Documental_Id
              this.disposicion.valor_Documental = data.valor_Documental
              this.disposicion.nombre = data.nombre
              this.disposicion.vigencia_Archivo_Tramite = data.vigencia_Archivo_Tramite
              this.disposicion.vigencia_Archivo_Concentracion = data.vigencia_Archivo_Concentracion
              this.disposicion.eliminacion = data.eliminacion
              this.disposicion.archivo_Historico = data.archivo_Historico
              this.disposicion.muestreo = data.muestreo
              this.disposicion.observaciones = data.observaciones
              this.disposicion.sistema_Datos_Personales_Nombre = data.sistema_Datos_Personales_Nombre
              this.disposicion.disposicion_Documental = data.disposicion_Documental
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

    async loadDisposicionBySerie(seccion, serie) {
      try {
        this.initDisposicion()
        const resp = await api.get(`/Archivo/DisposicionesDocumentales/ConsultaDisposicion?Seccion_Id=${seccion}&Serie_Id=${serie}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              this.disposicion.id = data.id
              this.disposicion.seccion_Id = data.seccion_Id
              this.disposicion.seccion = data.seccion
              this.disposicion.serie_Id = data.serie_Id
              this.disposicion.serie = data.serie
              this.disposicion.subSerie_Id = data.subSerie_Id
              this.disposicion.subSerie = data.subSerie
              this.disposicion.nivel_Seguridad_Id = data.nivel_Seguridad_Id
              this.disposicion.nivel_Seguridad = data.nivel_Seguridad
              this.disposicion.valor_Documental_Id = data.valor_Documental_Id
              this.disposicion.valor_Documental = data.valor_Documental
              this.disposicion.nombre = data.nombre
              this.disposicion.vigencia_Archivo_Tramite = data.vigencia_Archivo_Tramite
              this.disposicion.vigencia_Archivo_Concentracion = data.vigencia_Archivo_Concentracion
              this.disposicion.eliminacion = data.eliminacion
              this.disposicion.archivo_Historico = data.archivo_Historico
              this.disposicion.muestreo = data.muestreo
              this.disposicion.observaciones = data.observaciones
              this.disposicion.sistema_Datos_Personales_Nombre = data.sistema_Datos_Personales_Nombre
              this.disposicion.disposicion_Documental = data.disposicion_Documental
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

    async createDisposicion(disposicion) {
      try {
        const resp = await api.post("/Archivo/DisposicionesDocumentales", disposicion)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            return { success, data }
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

    async updateDisposicion(disposicion, id) {
      try {
        const resp = await api.put(`/Archivo/DisposicionesDocumentales/${id}`, disposicion)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            return { success, data }
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

    async deleteDisposicion(id) {
      try {
        const resp = await api.delete(`/Archivo/DisposicionesDocumentales/${id}`)
        if (resp.status == 200) {
          let { success, data } = resp.data
          if (success === true) {
            this.loadDisposiciones();
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

    actualizarModalEditar(valor) {
      this.modalEditar = valor
    },

    updateEditar(valor) {
      this.isEditar = valor
    },
  }
})
