import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

export const useSolicitudPrestamoAiStore = defineStore('useSolicitudPrestamoAi', {
  state: () => ({
    isLoading: false,
    isEditar: false,
    modal: false,
    modalEditar: false,
    modalVer: false,
    isHistorico: false,
    misSolicitudes: [],
    solicitudes: [],
    solicitud: {
      id: null,
      folio: null,
      folio_Solicitud: null,
      area_Responsable_Id: null,
      area_Responsable: null,
      area_Solicitante_Id: null,
      area_Solicitante: null,
      responsable_Area_Responsable_Id: null,
      responsable_Area_Responsable: null,
      puesto_Responsable_Area_Responsable_Id: null,
      puesto_Responsable_Area_Responsable: null,
      responsable_Area_Solicitante_Id: null,
      responsable_Area_Solicitante: null,
      puesto_Responsable_Area_Id: null,
      puesto_Responsable_Area: null,
      solicitante_Id: null,
      solicitante: null,
      puesto_Solicitante_Id: null,
      puesto_Solicitante: null,
      fecha_Solicitada: null,
      fecha_Posible_Devolucion: null,
      observaciones: null,
      fisico: false,
      digital: false,
      correo: null,
      telefono: null,
      tipologia_Documental: null,
      num_Exp_legajos: null,
      descripcion_Expediente: null,
      motivo_Rechazo: null,
      detalle: []

    },
    complementoAnexo: {
      puesto: null,
      responsable: null,
      titular: null,
    },
  }),

  actions: {

    initSolicitud() {
      this.solicitud.id = null
      this.solicitud.folio = null
      this.solicitud.folio_Solicitud = null
      this.solicitud.area_Responsable_Id = null
      this.solicitud.area_Responsable = null
      this.solicitud.responsable_Area_Responsable_Id = null
      this.solicitud.responsable_Area_Responsable = null
      this.solicitud.puesto_Responsable_Area_Responsable_Id = null
      this.solicitud.puesto_Responsable_Area_Responsable = null
      this.solicitud.area_Solicitante_Id = null
      this.solicitud.area_Solicitante = null
      this.solicitud.responsable_Area_Solicitante_Id = null
      this.solicitud.responsable_Area_Solicitante = null
      this.solicitud.puesto_Responsable_Area_Id = null
      this.solicitud.puesto_Responsable_Area = null
      this.solicitud.solicitante_Id = null
      this.solicitud.solicitante = null
      this.solicitud.puesto_Solicitante_Id = null
      this.solicitud.puesto_Solicitante = null
      this.solicitud.fecha_Solicitada = null
      this.solicitud.fecha_Posible_Devolucion = null
      this.solicitud.observaciones = null
      this.solicitud.fisico = false
      this.solicitud.digital = false
      this.solicitud.correo = null
      this.solicitud.telefono = null
      this.solicitud.tipologia_Documental = null
      this.solicitud.num_Exp_legajos = null
      this.solicitud.descripcion_Expediente = null
      this.solicitud.motivo_Rechazo = null
      this.solicitud.detalle = []
    },

    async loadSolicitudes() {
      try {
        this.isLoading = true
        const resp = await api.get('/Archivo/SolicitudesPrestamosAI')
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success) {
            if (data) {
              this.misSolicitudes = data.map((element) => {
                return {
                  id: element.id,
                  folio: element.folio,
                  folio_Solicitud: element.folio_Solicitud,
                  area_Responsable: element.area_Responsable,
                  area_Solicitante: element.area_Solicitante,
                  responsable_Area_Solicitante: element.responsable_Area_Solicitante,
                  puesto_Responsable_Area: element.puesto_Responsable_Area,
                  solicitante: element.solicitante,
                  puesto_Solicitante: element.puesto_Solicitante,
                  fecha_Solicitada: element.fecha_Solicitada_Tabla,
                  fecha_Posible_Devolucion: element.fecha_Posible_Devolucion_Tabla,
                  fecha_Devolucion: element.fecha_Devolucion_Tabla,
                  fecha_Accion: element.fecha_Accion_Tabla,
                  estatus: element.estatus,
                  observaciones: element.observaciones,
                  fisico: element.fisico_String,
                  digital: element.digital_String,
                  correo: element.correo,
                  telefono: element.telefono,
                  tipologia_Documental: element.tipologia_Documental,
                  num_Exp_legajos: element.num_Exp_legajos,
                  descripcion_Expediente: element.descripcion_Expediente,
                  motivo_Rechazo: element.motivo_Rechazo,
                  clasificado: element.clasificado,
                  fecha_Registro: element.fecha_Registro_Tabla
                }
              })

            }
          } else {
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
      } finally {
        this.isLoading = false;
      }
    },

    async loadMisSolicitudes() {
      try {
        this.isLoading = true
        const resp = await api.get('/Archivo/SolicitudesPrestamosAI/MisSolicitudes')
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success) {
            if (data) {
              this.misSolicitudes = []
              this.misSolicitudes = data.map((element) => {
                const fechaSolicitada = new Date(element.fecha_Solicitada + "T00:00:00");
                const fechaPosibleDevolucion = new Date(element.fecha_Posible_Devolucion + "T23:59:59");
                const fechaActual = new Date();
                let textoFormato = ""
                if (element.fisico == true && element.digital == true) {
                  textoFormato = "Físico y Digital"
                } else if (element.fisico == true) {
                  textoFormato = "Físico"
                } else if (element.digital == true) {
                  textoFormato = "Digital"
                }
                console.log("Elemento", element)
                let isHabil = false;
                if (fechaActual >= fechaSolicitada && fechaActual <= fechaPosibleDevolucion) {
                  isHabil = true;
                }
                return {
                  id: element.id,
                  folio: element.folio,
                  folio_Solicitud: element.folio_Solicitud,
                  area_Responsable: element.area_Responsable,
                  area_Solicitante: element.area_Solicitante,
                  responsable_Area_Solicitante: element.responsable_Area_Solicitante,
                  puesto_Responsable_Area: element.puesto_Responsable_Area,
                  solicitante: element.solicitante,
                  puesto_Solicitante: element.puesto_Solicitante,
                  fecha_Solicitada: element.fecha_Solicitada_Tabla,
                  fecha_Posible_Devolucion: element.fecha_Posible_Devolucion_Tabla,
                  fecha_Devolucion: element.fecha_Devolucion_Tabla,
                  fecha_Accion: element.fecha_Accion_Tabla,
                  estatus: element.estatus,
                  observaciones: element.observaciones,
                  fisico: element.fisico_String,
                  digital: element.digital_String,
                  correo: element.correo,
                  telefono: element.telefono,
                  tipologia_Documental: element.tipologia_Documental,
                  num_Exp_legajos: element.num_Exp_legajos,
                  descripcion_Expediente: element.descripcion_Expediente,
                  motivo_Rechazo: element.motivo_Rechazo,
                  clasificado: element.clasificado,
                  fecha_Registro: element.fecha_Registro_Tabla,
                  habil: isHabil,
                  formato: textoFormato
                }
              })
            }
          } else {
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
      } finally {
        this.isLoading = false;
      }
    },

    async loadPendientes() {
      try {
        this.isLoading = true
        const resp = await api.get('/Archivo/SolicitudesPrestamosAI/Pendientes')
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success) {
            if (data) {
              this.solicitudes = []
              this.solicitudes = data.map((element) => {
                return {
                  id: element.id,
                  folio: element.folio,
                  folio_Solicitud: element.folio_Solicitud,
                  area_Responsable: element.area_Responsable,
                  area_Solicitante: element.area_Solicitante,
                  responsable_Area_Solicitante: element.responsable_Area_Solicitante,
                  puesto_Responsable_Area: element.puesto_Responsable_Area,
                  solicitante: element.solicitante,
                  puesto_Solicitante: element.puesto_Solicitante,
                  fecha_Solicitada: element.fecha_Solicitada_Tabla,
                  fecha_Posible_Devolucion: element.fecha_Posible_Devolucion_Tabla,
                  fecha_Devolucion: element.fecha_Devolucion_Tabla,
                  fecha_Accion: element.fecha_Accion_Tabla,
                  estatus: element.estatus,
                  observaciones: element.observaciones,
                  fisico: element.fisico_String,
                  digital: element.digital_String,
                  correo: element.correo,
                  telefono: element.telefono,
                  tipologia_Documental: element.tipologia_Documental,
                  num_Exp_legajos: element.num_Exp_legajos,
                  descripcion_Expediente: element.descripcion_Expediente,
                  motivo_Rechazo: element.motivo_Rechazo,
                  clasificado: element.clasificado,
                  fecha_Registro: element.fecha_Registro_Tabla
                }
              })
            }
          } else {
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
      } finally {
        this.isLoading = false;
      }
    },

    async loadAprobadas() {
      try {
        this.isLoading = true
        const resp = await api.get('/Archivo/SolicitudesPrestamosAI/Aprobadas')
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success) {
            if (data) {
              this.solicitudes = []
              this.solicitudes = data.map((element) => {
                return {
                  id: element.id,
                  folio: element.folio,
                  folio_Solicitud: element.folio_Solicitud,
                  area_Responsable: element.area_Responsable,
                  area_Solicitante: element.area_Solicitante,
                  responsable_Area_Solicitante: element.responsable_Area_Solicitante,
                  puesto_Responsable_Area: element.puesto_Responsable_Area,
                  solicitante: element.solicitante,
                  puesto_Solicitante: element.puesto_Solicitante,
                  fecha_Solicitada: element.fecha_Solicitada_Tabla,
                  fecha_Posible_Devolucion: element.fecha_Posible_Devolucion_Tabla,
                  fecha_Devolucion: element.fecha_Devolucion_Tabla,
                  fecha_Accion: element.fecha_Accion_Tabla,
                  estatus: element.estatus,
                  observaciones: element.observaciones,
                  fisico: element.fisico_String,
                  digital: element.digital_String,
                  correo: element.correo,
                  telefono: element.telefono,
                  tipologia_Documental: element.tipologia_Documental,
                  num_Exp_legajos: element.num_Exp_legajos,
                  descripcion_Expediente: element.descripcion_Expediente,
                  motivo_Rechazo: element.motivo_Rechazo,
                  clasificado: element.clasificado,
                  fecha_Registro: element.fecha_Registro_Tabla
                }
              })
            }
          } else {
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
      } finally {
        this.isLoading = false;
      }
    },

    async loadRechazadas() {
      try {
        this.isLoading = true
        const resp = await api.get('/Archivo/SolicitudesPrestamosAI/Rechazadas')
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success) {
            if (data) {
              this.solicitudes = []
              this.solicitudes = data.map((element) => {
                return {
                  id: element.id,
                  folio: element.folio,
                  folio_Solicitud: element.folio_Solicitud,
                  area_Responsable: element.area_Responsable,
                  area_Solicitante: element.area_Solicitante,
                  responsable_Area_Solicitante: element.responsable_Area_Solicitante,
                  puesto_Responsable_Area: element.puesto_Responsable_Area,
                  solicitante: element.solicitante,
                  puesto_Solicitante: element.puesto_Solicitante,
                  fecha_Solicitada: element.fecha_Solicitada_Tabla,
                  fecha_Posible_Devolucion: element.fecha_Posible_Devolucion_Tabla,
                  fecha_Devolucion: element.fecha_Devolucion_Tabla,
                  fecha_Accion: element.fecha_Accion_Tabla,
                  estatus: element.estatus,
                  observaciones: element.observaciones,
                  fisico: element.fisico_String,
                  digital: element.digital_String,
                  correo: element.correo,
                  telefono: element.telefono,
                  tipologia_Documental: element.tipologia_Documental,
                  num_Exp_legajos: element.num_Exp_legajos,
                  descripcion_Expediente: element.descripcion_Expediente,
                  motivo_Rechazo: element.motivo_Rechazo,
                  clasificado: element.clasificado,
                  fecha_Registro: element.fecha_Registro_Tabla
                }
              })
            }
          } else {
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
      } finally {
        this.isLoading = false;
      }
    },

    async loadSolicitud(id) {
      try {
        const resp = await api.get(`/Archivo/SolicitudesPrestamosAI/${id}`)
        if (resp.status == 200) {

          const { success, data } = resp.data
          if (success) {
            this.solicitud.id = data.id
            this.solicitud.folio = data.folio
            this.solicitud.folio_Solicitud = data.folio_Solicitud
            this.solicitud.area_Responsable_Id = data.area_Responsable_Id
            this.solicitud.area_Responsable = data.area_Responsable
            this.solicitud.area_Solicitante_Id = data.area_Solicitante_Id
            this.solicitud.area_Solicitante = data.area_Solicitante
            this.solicitud.responsable_Area_Solicitante_Id = data.responsable_Area_Solicitante_Id
            this.solicitud.responsable_Area_Solicitante = data.responsable_Area_Solicitante
            this.solicitud.puesto_Responsable_Area_Id = data.puesto_Responsable_Area_Id
            this.solicitud.puesto_Responsable_Area = data.puesto_Responsable_Area
            this.solicitud.solicitante_Id = data.solicitante_Id
            this.solicitud.solicitante = data.solicitante
            this.solicitud.puesto_Solicitante_Id = data.puesto_Solicitante_Id
            this.solicitud.puesto_Solicitante = data.puesto_Solicitante
            this.solicitud.fecha_Solicitada = data.fecha_Solicitada
            this.solicitud.fecha_Posible_Devolucion = data.fecha_Posible_Devolucion
            this.solicitud.observaciones = data.observaciones
            this.solicitud.fisico = data.fisico
            this.solicitud.digital = data.digital
            this.solicitud.correo = data.correo
            this.solicitud.telefono = data.telefono
            this.solicitud.tipologia_Documental = data.tipologia_Documental
            this.solicitud.num_Exp_legajos = data.num_Exp_legajos
            this.solicitud.descripcion_Expediente = data.descripcion_Expediente
            this.solicitud.motivo_Rechazo = data.motivo_Rechazo
            this.solicitud.responsable_Area_Responsable_Id = data.responsable_Area_Responsable_Id
            this.solicitud.responsable_Area_Responsable = data.responsable_Area_Responsable
            this.solicitud.puesto_Responsable_Area_Responsable_Id = data.puesto_Responsable_Area_Responsable_Id
            this.solicitud.puesto_Responsable_Area_Responsable = data.puesto_Responsable_Area_Responsable


            let respSolicitante = await api.get(`/Empleados`)
            let solicitante = respSolicitante.data.data
            let respResponsable = await api.get(`/ResponsablesAreas/ResposableByArea/${data.area_Responsable_Id}`)
            let responsable = respResponsable.data.data
            let filtroSolicitante = solicitante.find(x => x.id == data.solicitante_Id)
            let filtroTitularArchivo = solicitante.find(x => x.puesto_Id == 63)
            this.complementoAnexo.puesto = filtroSolicitante.puesto
            this.complementoAnexo.responsable = responsable.empleado
            this.complementoAnexo.titular = filtroTitularArchivo.nombre_Completo.split(" -")[0]

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

    async loadArea() {
      try {
        const resp = await api.get("/Areas/AreaByUsuario")
        if (resp.status == 200) {
          const { success, data } = resp.data
          console.log(data)
          if (success == true) {
            const { area_Id, area, area_Padre_Id, area_Padre } = data;
            this.solicitud.area_Responsable_Id = area_Padre_Id
            this.solicitud.area_Responsable = area_Padre
            this.solicitud.area_Solicitante_Id = area_Id
            this.solicitud.area_Solicitante = area
          }
        }
        const respArea = await api.get(`/Areas/${this.solicitud.area_Solicitante_Id}`)
        let areaDatos = respArea.data.data
        if (areaDatos.extension.length > 3) {
          this.solicitud.telefono = areaDatos.extension
        } else {
          this.solicitud.telefono = "3112103233 Ext. " + areaDatos.extension
        }


      } catch (error) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadEnlace() {
      try {

        const resp = await api.get("/Archivo/Enlace/ByUsuarioEmp")
        if (resp.status == 200) {
          const { success, id, enlace } = resp.data
          if (success === true) {
            this.solicitud.solicitante_Id = id
            this.solicitud.solicitante = enlace
            const respEmpleado = await api.get(`/Empleados/${this.solicitud.solicitante_Id}`)
            let datosEmpleado = respEmpleado.data.data
            this.solicitud.correo = datosEmpleado.email
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

    async create(solicitud) {
      try {
        const resp = await api.post('/Archivo/SolicitudesPrestamosAI', solicitud)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success) {
            this.loadSolicitudes()
          }
          return { success, data }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async update(solicitud) {
      try {
        const resp = await api.put(`/Archivo/SolicitudesPrestamosAI/${solicitud.id}`, solicitud)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success) {
            this.loadSolicitudes()
          }
          return { success, data }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async delete(id) {
      try {
        const resp = await api.delete(`/Archivo/SolicitudesPrestamosAI/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success) {
            this.loadSolicitudes()
          }
          return { success, data }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo" }
        }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async aprobar(id) {
      try {
        const resp = await api.get(`/Archivo/SolicitudesPrestamosAI/Aprobar/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          let mensaje = ""
          if (success) {
            this.loadSolicitudes()
            mensaje = "Solicitud aprobada con éxito"
          }
          return { success, mensaje }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async cancelar(id, motivo) {
      try {
        const resp = await api.get(`/Archivo/SolicitudesPrestamosAI/Rechazar/${id}/${motivo}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          let mensaje = ""
          if (success) {
            this.loadSolicitudes()
            mensaje = "Solicitud rechazada con éxito"
          }
          return { success, mensaje }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    actualizarModal(valor) {
      this.modal = valor;
    },

    updateEditar(valor) {
      this.isEditar = valor;
    },

    async actualizarHistorico(valor) {
      this.isHistorico = valor;
    },
  },
});
