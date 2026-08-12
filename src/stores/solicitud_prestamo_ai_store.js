import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

// Corte al backend nuevo (corte de clientes): el backend UNIFICÓ los dos sistemas legacy de préstamo
// (cédulas de Trámite y Solicitudes de Concentración/AI) en un solo modelo Prestamo. Estas lecturas
// apuntan a los endpoints unificados /api/prestamos (bandeja del área responsable), /mis-solicitudes
// (lo que el usuario solicitó) y /{id} + /{id}/detalle. Muchos campos legados (responsable del área
// solicitante, puestos, correo/teléfono, tipología, nº de legajos, folio de solicitud aparte) NO los
// modela el dominio nuevo -> van en null. El folio unificado se muestra en la columna folio_Solicitud.
// Corte al backend nuevo: las escrituras REST responden 201/204 y problem+json en error (axios lanza).
const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto
// Empleado y área del usuario autenticado, de los claims del JWT (solicitante registro + área solicitante
// del alta de préstamo AI).
function datosUsuarioToken() {
  try {
    const token = localStorage.getItem('key')
    if (!token) return {}
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(decodeURIComponent(escape(atob(base64))))
    return { empleadoId: payload.empleado_id || null, areaId: payload.area || null }
  } catch (e) {
    console.error(e)
    return {}
  }
}
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

    // MIGRADO al backend nuevo (corte de clientes): el ALTA que el legado hacía en UN POST (cabecera +
    // expedientes embebidos) se DESCOMPONE en Crear préstamo (POST /api/prestamos, estado Solicitado) +
    // un AgregarExpediente (POST /api/prestamos/{id}/expedientes) por cada expediente del detalle. El
    // modelo de préstamo es UNIFICADO (mismo que Trámite): área solicitante y empleado de registro salen
    // del JWT; área responsable y solicitante los elige el usuario en el modal; los expedientes vienen del
    // picker de Concentración/Histórico. clasificado=false (el préstamo AI no es de expedientes clasificados).
    async create(solicitud) {
      try {
        const usuario = datosUsuarioToken()
        if (!usuario.empleadoId || !usuario.areaId) {
          return { success: false, data: "Tu usuario no tiene empleado/área asociada para registrar la solicitud." }
        }
        // 1) Crear la cabecera del préstamo.
        const respCrear = await api.post('/prestamos', {
          areaResponsableId: solicitud.area_Responsable_Id,
          areaSolicitanteId: usuario.areaId,
          solicitanteId: solicitud.solicitante_Id,
          empleadoRegistroId: usuario.empleadoId,
          fechaDevolucionCompromiso: solicitud.fecha_Posible_Devolucion,
          fisico: solicitud.fisico === true,
          digital: solicitud.digital === true,
          folio: solicitud.folio || null,
          observaciones: solicitud.observaciones || null,
          clasificado: false
        })
        const prestamoId = respCrear && respCrear.data && respCrear.data.id
        if (!prestamoId) {
          return { success: false, data: "No se pudo crear la solicitud." }
        }
        // 2) Agregar cada expediente del detalle embebido.
        for (const d of (solicitud.detalle || [])) {
          await api.post(`/prestamos/${prestamoId}/expedientes`, {
            inventarioGeneralId: d.inventario_Id,
            ubicacion: d.ubicacion || null,
            descripcion: d.descripcion || null,
            observaciones: d.observaciones || null
          })
        }
        this.loadSolicitudes()
        return { success: true, data: "Solicitud registrada con éxito" }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },

    // Corte al backend nuevo: el préstamo es INMUTABLE en el modelo unificado (no hay update/delete de
    // solicitud). La edición/eliminación están deshabilitadas en la UI; estos stubs solo blindan
    // referencias residuales de componentes legados inalcanzables (ModalAIComp/detallePrestamo).
    async update() {
      return { success: false, data: "La edición de solicitudes no está disponible (el préstamo es inmutable)." }
    },

    async delete() {
      return { success: false, data: "La eliminación de solicitudes no está disponible (el préstamo es inmutable)." }
    },

    // MIGRADO al backend nuevo: POST /api/prestamos/{id}/autorizar { autorizaId } -> 204. El backend
    // exige que el autorizador sea un visto bueno vigente (autorizaId = EmpleadoId del visto bueno) y
    // que el préstamo tenga ≥1 expediente. El autorizador lo elige el usuario en el diálogo de aprobar.
    async aprobar(id, autorizaId) {
      try {
        const resp = await api.post(`/prestamos/${id}/autorizar`, { autorizaId })
        if (resp.status === 204 || resp.status === 200) {
          return { success: true, mensaje: "Solicitud aprobada con éxito" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },

    // MIGRADO al backend nuevo: POST /api/prestamos/{id}/rechazar { motivo } -> 204.
    async cancelar(id, motivo) {
      try {
        const resp = await api.post(`/prestamos/${id}/rechazar`, { motivo })
        if (resp.status === 204 || resp.status === 200) {
          return { success: true, mensaje: "Solicitud rechazada con éxito" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
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
