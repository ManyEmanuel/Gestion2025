import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
export const useCedulaPrestamoStore = defineStore('CedulaPrestamo', {
  state: () => ({
    isLoading: false,
    isEditar: false,
    modal: false,
    modalEditar: false,
    modalVer: false,
    registro: {
      id: null,
      folio: null,
      folio_Solicitud: null,
      area_Responsable_Id: null,
      area_Responsable: null,
      area_Solicitante_Id: null,
      area_Solicitante: null,
      solicitante_Id: null,
      solicitante: null,
      fecha_Prestamo: null,
      fecha_Devolucion: null,
      observaciones: null,
      fisico: false,
      digital: false,
      detalle: null,
      clasificado: false
    },
    complementoAnexo: {
      puesto: null,
      responsable: null,
      titular: null,
    },
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
    misSolicitudes: [],
    solicitudesArea: [],

  }),
  actions: {

    initRegistro() {
      this.registro.id = null;
      this.registro.area_Responsable_Id = null;
      this.registro.area_Responsable = null;
      this.registro.area_Solicitante_Id = null;
      this.registro.area_Solicitante = null;
      this.registro.solicitante_Id = null;
      this.registro.solicitante = null;
      this.registro.fecha_Prestamo = null;
      this.registro.fecha_Devolucion = null;
      this.registro.observaciones = null;
      this.registro.detalle = null;
      this.registro.digital = false;
      this.registro.fisico = false
    },

    async loadMisSolicitudes(clasificado) {
      try {
        this.isLoading = true
        let resp = null;
        if (clasificado == true) {
          resp = await api.get('/Archivo/CedulasPrestamosExpedientes/MisSolicitudesClasificados')
        } else {
          resp = await api.get('/Archivo/CedulasPrestamosExpedientes/MisSolicitudes')
        }
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              this.misSolicitudes = []
              let misSolicitudesArray = data.map((prestamo) => {
                return {
                  id: prestamo.id,
                  area_Responsable_Id: prestamo.area_Responsable_Id,
                  area_Responsable: prestamo.area_Responsable,
                  area_Solicitante_Id: prestamo.area_Solicitante_Id,
                  area_Solicitante: prestamo.area_Solicitante,
                  solicitante_Id: prestamo.solicitante_Id,
                  solicitante: prestamo.solicitante,
                  empleado_Registro_Id: prestamo.empleado_Registro_Id,
                  empleado_Registro: prestamo.empleado_Registro,
                  fecha_Prestamo: prestamo.fecha_Prestamo,
                  fecha_Devolucion: prestamo.fecha_Devolucion,
                  folio: prestamo.folio,
                  folio_Solicitud: prestamo.folio_Solicitud,
                  estatus: prestamo.estatus,
                  fisico: prestamo.fisico,
                  digital: prestamo.digital
                }
              })
              this.misSolicitudes = misSolicitudesArray;
              this.isLoading = false
            }
          } else {
            this.isLoading = false
            return { success, data }
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

    async loadSolicitudesAreas(clasificado) {
      try {
        this.isLoading = true
        let resp = null;
        if (clasificado == true) {
          resp = await api.get('/Archivo/CedulasPrestamosExpedientes/SolicitudesAreaClasificados')
        } else {
          resp = await api.get('/Archivo/CedulasPrestamosExpedientes/SolicitudesArea')
        }
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              this.solicitudesArea = []
              let solicitudesAreasArray = data.map((prestamo) => {
                return {
                  id: prestamo.id,
                  area_Responsable_Id: prestamo.area_Responsable_Id,
                  area_Responsable: prestamo.area_Responsable,
                  area_Solicitante_Id: prestamo.area_Solicitante_Id,
                  area_Solicitante: prestamo.area_Solicitante,
                  solicitante_Id: prestamo.solicitante_Id,
                  solicitante: prestamo.solicitante,
                  empleado_Registro_Id: prestamo.empleado_Registro_Id,
                  empleado_Registro: prestamo.empleado_Registro,
                  fecha_Prestamo: prestamo.fecha_Prestamo,
                  fecha_Devolucion: prestamo.fecha_Devolucion,
                  folio: prestamo.folio,
                  folio_Solicitud: prestamo.folio_Solicitud,
                  estatus: prestamo.estatus,
                  fisico: prestamo.fisico,
                  digital: prestamo.digital

                }
              })
              this.solicitudesArea = solicitudesAreasArray;
              this.isLoading = false
            }
          } else {
            this.isLoading = false
            return { success, data }
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

    async loadPrestamosGrales() {
      try {
        this.isLoading = true
        const resp = await api.get('/Archivo/CedulasPrestamosExpedientes/GetAll')
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              this.prestamos = []
              let prestamosArray = data.map((prestamo) => {
                return {
                  id: prestamo.id,
                  area_Responsable_Id: prestamo.area_Responsable_Id,
                  area_Responsable: prestamo.area_Responsable,
                  area_Solicitante_Id: prestamo.area_Solicitante_Id,
                  area_Solicitante: prestamo.area_Solicitante,
                  solicitante_Id: prestamo.solicitante_Id,
                  solicitante: prestamo.solicitante,
                  empleado_Registro_Id: prestamo.empleado_Registro_Id,
                  empleado_Registro: prestamo.empleado_Registro,
                  fecha_Prestamo: prestamo.fecha_Prestamo,
                  fecha_Devolucion: prestamo.fecha_Devolucion,
                  folio: prestamo.folio,
                  estatus: prestamo.estatus,
                  fisico: prestamo.fisico,
                  digital: prestamo.digital
                }
              })
              this.prestamos = prestamosArray;
              this.isLoading = false
            }
          } else {
            this.isLoading = false
            return { success, data }
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

    async loadPrestamo(id) {
      try {
        const resp = await api.get(`/Archivo/CedulasPrestamosExpedientes/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success == true) {
            if (data) {
              this.registro.id = data.id
              this.registro.folio = data.folio
              this.registro.folio_Solicitud = data.folio_Solicitud
              this.registro.area_Responsable_Id = data.area_Responsable_Id
              this.registro.area_Responsable = data.area_Responsable
              this.registro.area_Solicitante_Id = data.area_Solicitante_Id
              this.registro.area_Solicitante = data.area_Solicitante
              this.registro.solicitante_Id = data.solicitante_Id
              this.registro.solicitante = data.solicitante
              this.registro.fecha_Prestamo = data.fecha_Prestamo
              this.registro.fecha_Devolucion = data.fecha_Devolucion
              this.registro.observaciones = data.observaciones
              this.registro.fisico = data.fisico
              this.registro.digital = data.digital
              this.registro.clasificado = data.clasificado

              let respSolicitante = await api.get(`/Empleados`)
              let solicitante = respSolicitante.data.data
              let respResponsable = await api.get(`/ResponsablesAreas/ResposableByArea/${data.area_Responsable_Id}`)
              let responsable = respResponsable.data.data

              let filtroSolicitante = solicitante.find(x => x.id == data.solicitante_Id)
              let filtroTitularArchivo = solicitante.find(x => x.puesto_Id == 63)
              this.complementoAnexo.puesto = filtroSolicitante.puesto
              this.complementoAnexo.responsable = responsable.empleado
              this.complementoAnexo.titular = filtroTitularArchivo.nombre_Completo.split(" -")[0]

            }
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

    async createSolicitudPrestamo(solicitud) {
      try {
        const resp = await api.post('/Archivo/CedulasPrestamosExpedientes/GenerarSolicitudPrestamo', solicitud)
        if (resp.status == 200) {
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

    async createCedulaPrestamo(cedulaPrestamo) {
      try {
        const resp = await api.post('/Archivo/CedulasPrestamosExpedientes/RegistrarPrestamo', cedulaPrestamo)
        if (resp.status == 200) {
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

    async updateCedulaPrestamo(id, cedulaPrestamo) {
      try {
        const resp = await api.put(`/Archivo/CedulasPrestamosExpedientes/${id}`, cedulaPrestamo)
        if (resp.status == 200) {
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

    async deleteCedulaPrestamo(id) {
      try {
        const resp = await api.delete(`/Archivo/CedulasPrestamosExpedientes/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            this.loadMisSolicitudes();
            this.loadSolicitudesAreas();
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

    async aprobar(id, clasificado) {
      try {
        const resp = await api.get(`/Archivo/CedulasPrestamosExpedientes/Aprobar/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            this.loadSolicitudesAreas(clasificado);
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

    async rechazar(id, motivo, clasificado) {
      try {
        console.log(motivo)
        const resp = await api.post(`/Archivo/CedulasPrestamosExpedientes/Rechazar/${id}`, { motivo })
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            this.loadSolicitudesAreas(clasificado);
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

    actualizarModal(valor) {
      this.modal = valor;
    },

    actualizarModalGral(valor) {
      this.modalGral = valor;
    },

    actualizarModalVer(valor) {
      this.modalVer = valor;
    },

    actualizarModalEditar(valor) {
      this.modalEditar = valor;
    },

    updateEditar(valor) {
      this.isEditar = valor;
    }
  },
});
