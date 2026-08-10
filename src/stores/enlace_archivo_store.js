import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

export const useEnlaceArchivoStore = defineStore('enlaceArchivoStore', {
  state: () => ({
    myLocale: {
      days: "Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado".split("_"),
      daysShort: "Dom_Lun_Mar_Mié_Jue_Vie_Sáb".split("_"),
      months:
        "Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre".split(
          "_"
        ),
      monthsShort: "Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic".split("_"),
      firstDayOfWeek: 1, // 0-6, 0 - Sunday, 1 Monday, ...
      format24h: true,
      pluralDay: "dias",
    },
    modal: false,
    isEditar: false,
    loading: false,
    enlaces: [],
    listaEnlaces: [],
    listaEnlacesArea: [],
    enlaces: [],
    enlacesFiltro: [],
    enlace: {
      id: null,
      empleado_Id: null,
      empleado: null,
      area_Id: null,
      area: null,
      puesto: null,
      activo: true,
      fecha_Registro: null
    }
  }),
  getters: {
  },
  actions: {

    initEnlaces() {
      this.enlace.empleado_Id = null
      this.enlace.empleado = null
      this.enlace.area_Id = null
      this.enlace.area = null
      this.enlace.activo = true
      this.enlace.fecha_Registro = null
    },

    async loadEnlaces() {
      // MIGRADO al backend nuevo (corte de clientes): GET /api/enlaces devuelve un array scoped
      // por el usuario, con empleado/área/puesto resueltos. estatus se deriva de activo.
      try {
        const resp = await api.get('/enlaces')
        if (resp.status == 200 && Array.isArray(resp.data)) {
          let enlacesArray = resp.data.map((e) => ({
            id: e.id,
            empleado_Id: e.empleadoId,
            empleado: e.empleado,
            area_Id: e.areaId,
            area: e.area,
            puesto: e.puesto,
            fecha_Registro: "",
            estatus: e.activo ? "Activo" : "Inactivo"
          }))
          this.enlaces = enlacesArray
          this.enlacesFiltro = enlacesArray
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        console.log(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadEnlace(id) {
      try {
        const resp = await api.get(`/Archivo/Enlace/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            let fechaRegistro = ""
            if (data.fecha_Registro != null) {
              let separacionFecha = (data.fecha_Registro.split(" ")[0]).split("/")
              fechaRegistro = separacionFecha[2] + "/" + separacionFecha[1] + "/" + separacionFecha[0]
            }
            if (data) {
              this.enlace.id = data.id
              this.enlace.empleado_Id = data.empleado_Id
              this.enlace.empleado = data.empleado
              this.enlace.area_Id = data.area_Id
              this.enlace.area = data.area
              this.enlace.puesto = data.puesto
              this.enlace.fecha_Registro = fechaRegistro
              this.enlace.estatus = data.estatus
              this.enlace.activo = data.activo
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

    async loadListaEnlaces() {
      try {
        this.listaEnlaces = []
        const resp = await api.get("/Archivo/Enlace/GetLista")
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              data.forEach(element => {
                const { value, label } = element
                const valorDoc = {
                  value, label
                }
                this.listaEnlaces.push(valorDoc)
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

    async loadListaEnlacesByArea(areaId) {
      try {
        this.listaEnlacesArea = []
        const resp = await api.get(`/Archivo/Enlace/GetLista/${areaId}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              data.forEach(element => {
                const { value, label } = element
                const valorDoc = {
                  value, label
                }
                this.listaEnlacesArea.push(valorDoc)
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

    async loadInformacionAnexo(id) {
      try {
        let encabezados = []
        const resp = await api.get(`/Archivo/Enlace/${id}`)
        const { success, data } = resp.data
        const respResponsable = await api.get(`/ResponsablesAreas/ResposableByArea/${data.area_Id}`)
        const responsableInfo = respResponsable.data.data
        const respArea = await api.get(`/Areas/${data.area_Id}`)
        const areaInfo = respArea.data.data
        const meses = [
          "enero", "febrero", "marzo", "abril", "mayo", "junio",
          "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
        ];

        let fechaRegistro = "Sin registro"
        let registro = false
        if (data.fecha_Registro != null) {
          let separacionFecha = (data.fecha_Registro.split(" ")[0]).split("/")
          fechaRegistro = separacionFecha[0] + " de " + meses[(parseInt(separacionFecha[1])) - 1] + " del " + separacionFecha[2]
          registro = true
        }
        encabezados.push({
          area: areaInfo.nombre,
          responsable: responsableInfo.empleado,
          responsablePuesto: responsableInfo.puesto,
          enlace: data.empleado,
          fecha: fechaRegistro,
          registro: registro
        })

        return encabezados
      } catch (error) {
        console.log(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async createEnlace(enlace) {
      try {
        const resp = await api.post("/Archivo/Enlace", enlace)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            this.loadEnlaces()
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

    async updateEnlace(id, enlace) {
      try {
        const resp = await api.put(`/Archivo/Enlace/${id}`, enlace)
        if (resp.status == 200) {
          console.log(resp)
          const { success, data } = resp.data
          if (success === true) {
            this.loadEnlaces()
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

    async deleteEnlace(id) {
      try {
        const resp = await api.delete(`/Archivo/Enlace/${id}`)
        if (resp.status == 200) {
          let { success, data } = resp.data
          if (success === true) {
            this.loadEnlaces()
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

    initEnlaces() {
      this.listaEnlaces = []
    },

    initEnlaceArea() {
      this.listaEnlacesArea = []
    },

    updateEditar(valor) {
      this.isEditar = valor
    },

    actualizarModal(valor) {
      this.modal = valor
    }

  },
});
