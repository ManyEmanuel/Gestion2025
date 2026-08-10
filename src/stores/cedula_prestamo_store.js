import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

// Corte al backend nuevo: los endpoints REST devuelven fechas ISO y camelCase. Estos helpers
// adaptan una fila de préstamo del backend nuevo a la forma que ya consume la UI del cliente.
// Las escrituras responden 204 (o 201) y problem+json en error (axios lanza en no-2xx).
const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

// Empleado y área del usuario autenticado, leídos de los claims del JWT (el backend nuevo los exige
// al crear un préstamo: empleadoRegistroId = quien registra; areaSolicitanteId = su área).
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

const mapFilaPrestamo = (p) => ({
  id: p.id,
  area_Responsable_Id: p.areaResponsableId,
  area_Responsable: p.areaResponsable,
  area_Solicitante_Id: p.areaSolicitanteId,
  area_Solicitante: p.areaSolicitante,
  solicitante_Id: p.solicitanteId,
  solicitante: p.solicitante,
  empleado_Registro_Id: p.empleadoRegistroId,
  empleado_Registro: p.empleadoRegistro,
  fecha_Prestamo: soloFecha(p.fechaPrestamo),
  fecha_Devolucion: soloFecha(p.fechaDevolucion),
  folio: p.folio,
  folio_Solicitud: null, // el modelo nuevo unifica el folio; el legado tenía uno de solicitud aparte
  estatus: p.estatus,
  fisico: p.fisico,
  digital: p.digital
})

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

    // MIGRADO al backend nuevo: GET /api/prestamos/mis-solicitudes?clasificado= (préstamos que el
    // usuario, como empleado, solicitó). Array directo, Guid, camelCase; nombres resueltos.
    async loadMisSolicitudes(clasificado) {
      try {
        this.isLoading = true
        this.misSolicitudes = []
        const resp = await api.get(`/prestamos/mis-solicitudes?clasificado=${clasificado === true}`)
        this.isLoading = false
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.misSolicitudes = resp.data.map(mapFilaPrestamo)
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        this.isLoading = false
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo: GET /api/prestamos?clasificado= ("Solicitudes al área": préstamos donde
    // el área del usuario es la responsable; ámbito global ⇒ todas). Array directo, camelCase, resuelto.
    async loadSolicitudesAreas(clasificado) {
      try {
        this.isLoading = true
        this.solicitudesArea = []
        const resp = await api.get(`/prestamos?clasificado=${clasificado === true}`)
        this.isLoading = false
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.solicitudesArea = resp.data.map(mapFilaPrestamo)
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
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

    // MIGRADO al backend nuevo: GET /api/prestamos/{id} (encabezado con nombres resueltos). Acceso
    // permitido al solicitante o a quien accede al área responsable.
    async loadPrestamo(id) {
      try {
        const resp = await api.get(`/prestamos/${id}`)
        if (resp.status != 200 || !resp.data) {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
        const data = resp.data
        this.registro.id = data.id
        this.registro.folio = data.folio
        this.registro.folio_Solicitud = null
        this.registro.area_Responsable_Id = data.areaResponsableId
        this.registro.area_Responsable = data.areaResponsable
        this.registro.area_Solicitante_Id = data.areaSolicitanteId
        this.registro.area_Solicitante = data.areaSolicitante
        this.registro.solicitante_Id = data.solicitanteId
        this.registro.solicitante = data.solicitante
        this.registro.fecha_Prestamo = soloFecha(data.fechaPrestamo)
        this.registro.fecha_Devolucion = soloFecha(data.fechaDevolucion)
        this.registro.observaciones = data.observaciones
        this.registro.fisico = data.fisico
        this.registro.digital = data.digital
        this.registro.clasificado = data.clasificado

        // El complemento del Anexo 7/8 (puesto del solicitante, responsable y titular del archivo) usa
        // /Empleados y /ResponsablesAreas, que aún NO están en el backend nuevo. Se aísla para no romper
        // el detalle; el recibo PDF se completará al migrar esos catálogos.
        try {
          const respSolicitante = await api.get(`/Empleados`)
          const solicitante = respSolicitante.data.data
          const respResponsable = await api.get(`/ResponsablesAreas/ResposableByArea/${data.areaResponsableId}`)
          const responsable = respResponsable.data.data
          const filtroSolicitante = solicitante.find(x => x.id == data.solicitanteId)
          const filtroTitularArchivo = solicitante.find(x => x.puesto_Id == 63)
          this.complementoAnexo.puesto = filtroSolicitante ? filtroSolicitante.puesto : null
          this.complementoAnexo.responsable = responsable ? responsable.empleado : null
          this.complementoAnexo.titular = filtroTitularArchivo ? filtroTitularArchivo.nombre_Completo.split(" -")[0] : null
        } catch (errAnexo) {
          console.warn("Complemento de anexo no disponible (catálogos aún no migrados):", errAnexo?.message)
        }
        return { success: true }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo: el alta que el legado hacía en UN POST (cabecera + expedientes
    // embebidos) se DESCOMPONE en Crear préstamo (POST /api/prestamos, estado Solicitado) + un
    // AgregarExpediente (POST /api/prestamos/{id}/expedientes) por cada expediente del detalle.
    // empleadoRegistro y áreaSolicitante salen del JWT del usuario autenticado.
    async createSolicitudPrestamo(solicitud) {
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
          fechaDevolucionCompromiso: solicitud.fecha_Devolucion,
          fisico: solicitud.fisico === true,
          digital: solicitud.digital === true,
          folio: solicitud.folio || null,
          observaciones: solicitud.observaciones || null,
          clasificado: solicitud.clasificado === true
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
        return { success: true, data: "Solicitud registrada con éxito" }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
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

    // MIGRADO al backend nuevo: POST /api/prestamos/{id}/autorizar { autorizaId } -> 204. El backend
    // exige que el autorizador sea un visto bueno vigente (autorizaId = EmpleadoId del visto bueno) y
    // que el préstamo tenga ≥1 expediente. El autorizador lo elige el usuario en el diálogo de aprobar.
    async aprobar(id, autorizaId, clasificado) {
      try {
        const resp = await api.post(`/prestamos/${id}/autorizar`, { autorizaId })
        if (resp.status === 204 || resp.status === 200) {
          this.loadSolicitudesAreas(clasificado);
          return { success: true, data: "Solicitud aprobada" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo" }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    // MIGRADO al backend nuevo: POST /api/prestamos/{id}/rechazar { motivo } -> 204.
    async rechazar(id, motivo, clasificado) {
      try {
        const resp = await api.post(`/prestamos/${id}/rechazar`, { motivo })
        if (resp.status === 204 || resp.status === 200) {
          this.loadSolicitudesAreas(clasificado);
          return { success: true, data: "Solicitud rechazada" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo" }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
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
