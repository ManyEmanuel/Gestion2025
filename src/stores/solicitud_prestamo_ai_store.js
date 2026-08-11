import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

// Corte al backend nuevo (corte de clientes): el backend UNIFICÓ los dos sistemas legacy de préstamo
// (cédulas de Trámite y Solicitudes de Concentración/AI) en un solo modelo Prestamo. Estas lecturas
// apuntan a los endpoints unificados /api/prestamos (bandeja del área responsable), /mis-solicitudes
// (lo que el usuario solicitó) y /{id} + /{id}/detalle. Muchos campos legados (responsable del área
// solicitante, puestos, correo/teléfono, tipología, nº de legajos, folio de solicitud aparte) NO los
// modela el dominio nuevo -> van en null. El folio unificado se muestra en la columna folio_Solicitud.
const soloFecha = (iso) => (iso ? String(iso).substring(0, 10) : null)
const formatoTexto = (fisico, digital) =>
  fisico && digital ? "Físico y Digital" : fisico ? "Físico" : digital ? "Digital" : ""
const mapFilaSolicitudAI = (p) => ({
  id: p.id,
  folio: p.folio,
  folio_Solicitud: p.folio,
  area_Responsable_Id: p.areaResponsableId,
  area_Responsable: p.areaResponsable,
  area_Solicitante_Id: p.areaSolicitanteId,
  area_Solicitante: p.areaSolicitante,
  responsable_Area_Solicitante: null,
  puesto_Responsable_Area: null,
  solicitante_Id: p.solicitanteId,
  solicitante: p.solicitante,
  puesto_Solicitante: null,
  fecha_Solicitada: soloFecha(p.fechaPrestamo),
  fecha_Posible_Devolucion: soloFecha(p.fechaDevolucion),
  fecha_Devolucion: soloFecha(p.fechaDevolucion),
  fecha_Accion: null,
  estatus: p.estatus,
  observaciones: p.observaciones,
  fisico: p.fisico,
  digital: p.digital,
  formato: formatoTexto(p.fisico, p.digital),
  correo: null,
  telefono: null,
  tipologia_Documental: null,
  num_Exp_legajos: p.totalExpedientes,
  descripcion_Expediente: null,
  motivo_Rechazo: p.motivoRechazo,
  clasificado: p.clasificado,
  fecha_Registro: null
})

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

    // MIGRADO al backend nuevo: GET /api/prestamos ("Solicitudes al área": préstamos donde el área del
    // usuario es la responsable; ámbito global ⇒ todas). Array directo, camelCase, nombres resueltos.
    async loadSolicitudes() {
      try {
        this.isLoading = true
        const resp = await api.get('/prestamos')
        this.isLoading = false
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.misSolicitudes = resp.data.map(mapFilaSolicitudAI)
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        this.isLoading = false
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo: GET /api/prestamos/mis-solicitudes (préstamos que el usuario, como
    // empleado, solicitó). `habil` se calcula de las fechas (hoy dentro del rango solicitado..devolución).
    async loadMisSolicitudes() {
      try {
        this.isLoading = true
        const resp = await api.get('/prestamos/mis-solicitudes')
        this.isLoading = false
        if (resp.status == 200 && Array.isArray(resp.data)) {
          const hoy = new Date()
          this.misSolicitudes = resp.data.map((p) => {
            const fila = mapFilaSolicitudAI(p)
            let habil = false
            if (p.fechaPrestamo && p.fechaDevolucion) {
              const desde = new Date(String(p.fechaPrestamo).substring(0, 10) + "T00:00:00")
              const hasta = new Date(String(p.fechaDevolucion).substring(0, 10) + "T23:59:59")
              habil = hoy >= desde && hoy <= hasta
            }
            return { ...fila, habil }
          })
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        this.isLoading = false
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo: la bandeja de revisión es GET /api/prestamos (préstamos donde el área
    // del usuario es la responsable), filtrada por estatus del lado del cliente. Pendientes = Solicitado.
    async loadPendientes() {
      try {
        this.isLoading = true
        const resp = await api.get('/prestamos')
        this.isLoading = false
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.solicitudes = resp.data.filter((p) => p.estatus == 'Solicitado').map(mapFilaSolicitudAI)
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        this.isLoading = false
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo: bandeja GET /api/prestamos filtrada por estatus. Aprobadas = Autorizado.
    async loadAprobadas() {
      try {
        this.isLoading = true
        const resp = await api.get('/prestamos')
        this.isLoading = false
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.solicitudes = resp.data.filter((p) => p.estatus == 'Autorizado').map(mapFilaSolicitudAI)
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        this.isLoading = false
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo: bandeja GET /api/prestamos filtrada por estatus. Rechazadas = Rechazado.
    async loadRechazadas() {
      try {
        this.isLoading = true
        const resp = await api.get('/prestamos')
        this.isLoading = false
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.solicitudes = resp.data.filter((p) => p.estatus == 'Rechazado').map(mapFilaSolicitudAI)
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        this.isLoading = false
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo: GET /api/prestamos/{id} (encabezado con nombres resueltos). Los campos
    // legados sin equivalente (responsable del área, puestos, correo/teléfono, tipología, nº legajos,
    // descripción, folio de solicitud aparte) van en null; el folio unificado se usa en folio_Solicitud.
    // Se retiró el enriquecimiento de anexo (/Empleados + /ResponsablesAreas), que no está en el backend
    // nuevo (el recibo/anexo se completará al migrar esos catálogos como reporte).
    async loadSolicitud(id) {
      try {
        const resp = await api.get(`/prestamos/${id}`)
        if (resp.status != 200 || !resp.data) {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
        const data = resp.data
        this.solicitud.id = data.id
        this.solicitud.folio = data.folio
        this.solicitud.folio_Solicitud = data.folio
        this.solicitud.area_Responsable_Id = data.areaResponsableId
        this.solicitud.area_Responsable = data.areaResponsable
        this.solicitud.area_Solicitante_Id = data.areaSolicitanteId
        this.solicitud.area_Solicitante = data.areaSolicitante
        this.solicitud.responsable_Area_Solicitante_Id = null
        this.solicitud.responsable_Area_Solicitante = null
        this.solicitud.puesto_Responsable_Area_Id = null
        this.solicitud.puesto_Responsable_Area = null
        this.solicitud.solicitante_Id = data.solicitanteId
        this.solicitud.solicitante = data.solicitante
        this.solicitud.puesto_Solicitante_Id = null
        this.solicitud.puesto_Solicitante = null
        this.solicitud.fecha_Solicitada = soloFecha(data.fechaPrestamo)
        this.solicitud.fecha_Posible_Devolucion = soloFecha(data.fechaDevolucion)
        this.solicitud.observaciones = data.observaciones
        this.solicitud.fisico = data.fisico
        this.solicitud.digital = data.digital
        this.solicitud.correo = null
        this.solicitud.telefono = null
        this.solicitud.tipologia_Documental = null
        this.solicitud.num_Exp_legajos = data.totalExpedientes
        this.solicitud.descripcion_Expediente = null
        this.solicitud.motivo_Rechazo = data.motivoRechazo
        this.solicitud.clasificado = data.clasificado
        this.solicitud.responsable_Area_Responsable_Id = null
        this.solicitud.responsable_Area_Responsable = null
        this.solicitud.puesto_Responsable_Area_Responsable_Id = null
        this.solicitud.puesto_Responsable_Area_Responsable = null
        return { success: true }
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
