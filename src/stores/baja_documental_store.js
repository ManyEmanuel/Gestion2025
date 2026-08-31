import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

// Corte al backend nuevo: las escrituras REST responden 201/204 y problem+json en error (axios lanza).
const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

import { useAuthNuevoStore } from 'src/stores/auth_nuevo_store'

// Empleado y área del usuario autenticado (para el área generadora y el enlace del alta de baja).
// Horizonte-1 #F7: antes decodificaba el JWT de localStorage; el token ahora vive en una cookie httpOnly
// que JS no puede leer -- se lee del estado ya cargado por auth_nuevo_store (GET /api/auth/me).
function datosUsuarioToken() {
  const { areaId, empleadoId } = useAuthNuevoStore()
  return { empleadoId, areaId }
}

export const useBajaDocumentalStore = defineStore('BajaDocumental', {
  state: () => ({
    isLoading: false,
    isEditar: false,
    modal: false,
    modal_ver: false,
    encabezados: [],
    encabezadosFiltro: [],
    areaFiltroActiva: "Ver todos",
    encabezado: {
      id: null,
      area_Responsable_Id: null,
      area_Responsable: null,
      area_Generadora_Id: null,
      area_Generadora: null,
      elaboro_Id: null,
      elaboro: null,
      valida_Id: null,
      valida: null,
      visto_Bueno_Id: null,
      visto_Bueno: null,
      aprobo_Id: null,
      aprobo: null,
      fecha_Transferencia: null,
      fecha_Elaboracion: null,
      secciones: null,
      no_Transferencia: null,
      observaciones: null,
      estatus: null,
      puesto_Aprobo: null,
      puesto_Elaboro: null,
      puesto_Valida: null,
      puesto_Visto_Bueno: null,
      nombre: null,

    },
    listaAreasGeneradoras: [],
  }),
  actions: {

    initEncabezado() {
      this.encabezado.id = null
      this.encabezado.area_Responsable_Id = null
      this.encabezado.area_Responsable = null
      this.encabezado.area_Generadora_Id = null
      this.encabezado.area_Generadora = null
      this.encabezado.elaboro_Id = null
      this.encabezado.valida_Id = null
      this.encabezado.valida = null
      this.encabezado.visto_Bueno_Id = null
      this.encabezado.visto_Bueno = null
      this.encabezado.aprobo_Id = null
      this.encabezado.aprobo = null
      this.encabezado.fecha_Transferencia = null
      this.encabezado.fecha_Elaboracion = null
      this.encabezado.secciones = null
      this.encabezado.no_Transferencia = null
      this.encabezado.observaciones = null
      this.encabezado.estatus = null
      this.encabezado.puesto_Aprobo = null
      this.encabezado.puesto_Elaboro = null
      this.encabezado.puesto_Valida = null
      this.encabezado.puesto_Visto_Bueno = null
      this.encabezado.nombre = null

    },

    // MIGRADO al backend nuevo (corte de clientes): GET /api/bajasdocumentales devuelve un array
    // scoped por el usuario (ámbito global -> todas; usuario de área -> la suya), con áreas y
    // enlace resueltos. Los roles de firma (valida/visto bueno/aprobó), no modelados, van en null;
    // 'elaboro' se mapea al enlace resuelto.
    async loadEncabezados() {
      try {
        this.isLoading = true
        const resp = await api.get('/bajasdocumentales')
        this.isLoading = false
        if (resp.status == 200 && Array.isArray(resp.data)) {
          let areas = []
          const encabezadosArray = resp.data.map((enc) => {
            areas.push(enc.areaGeneradora)
            return {
              id: enc.id,
              no_Transferencia: enc.numeroBaja,
              area_Responsable: enc.areaResponsable,
              area_Generadora: enc.areaGeneradora,
              fecha_Elaboracion: null,
              elaboro: enc.enlace,
              valida: null,
              visto_Bueno: null,
              aprobo: null,
              estatus: enc.estatus,
              nombre: enc.nombre,
            }
          })
          this.encabezados = encabezadosArray
          // Respeta el filtro por área activo tras recargar (p.ej. al crear una baja).
          this.encabezadosFiltro = this.areaFiltroActiva === "Ver todos"
            ? encabezadosArray
            : encabezadosArray.filter(enc => enc.area_Generadora == this.areaFiltroActiva)
          let areasUnicas = [...new Set(areas)].sort();
          areasUnicas.unshift("Ver todos");
          this.listaAreasGeneradoras = areasUnicas
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        this.isLoading = false
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadEncabezadosFiltro(area) {
      try {
        this.areaFiltroActiva = area
        if (area == "Ver todos") {
          this.encabezadosFiltro = this.encabezados
        } else {
          this.encabezadosFiltro = this.encabezados.filter(enc => enc.area_Generadora == area)
        }
      } catch (error) {
        console.error(error)
      }
    },

    // MIGRADO al backend nuevo (corte de clientes): el backend nuevo NO expone GET-por-id; el
    // encabezado se toma del listado ya scoped (GET /api/bajasdocumentales) buscando por id
    // (patrón edit-from-list). 'elaboro' = enlace resuelto; los roles legados (valida/visto bueno/
    // aprobó + puestos), que el dominio nuevo no modela, van en null.
    async loadEncabezado(id) {
      try {
        this.isLoading = true
        const resp = await api.get('/bajasdocumentales')
        this.isLoading = false
        if (resp.status == 200 && Array.isArray(resp.data)) {
          const enc = resp.data.find((e) => e.id == id)
          if (enc) {
            this.encabezado.id = enc.id
            this.encabezado.area_Generadora = enc.areaGeneradora
            this.encabezado.area_Generadora_Id = enc.areaGeneradoraId
            this.encabezado.area_Responsable = enc.areaResponsable
            this.encabezado.area_Responsable_Id = enc.areaResponsableId
            this.encabezado.elaboro = enc.enlace
            this.encabezado.elaboro_Id = enc.enlaceId
            this.encabezado.puesto_Elaboro = null
            this.encabezado.estatus = enc.estatus
            this.encabezado.fecha_Elaboracion = null
            this.encabezado.no_Transferencia = enc.numeroBaja
            this.encabezado.nombre = enc.nombre
            this.encabezado.aprobo = null; this.encabezado.aprobo_Id = null; this.encabezado.puesto_Aprobo = null
            this.encabezado.valida = null; this.encabezado.valida_Id = null; this.encabezado.puesto_Valida = null
            this.encabezado.visto_Bueno = null; this.encabezado.visto_Bueno_Id = null; this.encabezado.puesto_Visto_Bueno = null
          }
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo (corte de clientes): el área generadora es el área del usuario
    // (claim `area` del JWT); el nombre se resuelve desde /api/areas. El área RESPONSABLE ya no se
    // deriva del área padre (jerarquía no poblada) — el usuario la elige con un selector en el modal.
    async loadArea() {
      try {
        const usuario = datosUsuarioToken()
        if (!usuario.areaId) {
          return { success: false, data: "Tu usuario no tiene área asociada." }
        }
        this.encabezado.area_Generadora_Id = usuario.areaId
        const resp = await api.get("/areas")
        if (resp.status == 200 && Array.isArray(resp.data)) {
          const area = resp.data.find((a) => a.id == usuario.areaId)
          this.encabezado.area_Generadora = area ? `${area.siglas} - ${area.nombre}` : null
        }
        return { success: true }
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo: 'Elaboró' = el enlace del empleado del usuario, buscado en
    // /api/enlaces (scoped). Si el usuario no es enlace, queda vacío (el enlace es opcional al crear).
    async loadEnlace() {
      try {
        const usuario = datosUsuarioToken()
        if (!usuario.empleadoId) {
          return { success: true }
        }
        const resp = await api.get("/enlaces")
        if (resp.status == 200 && Array.isArray(resp.data)) {
          const enlace = resp.data.find((e) => e.empleadoId == usuario.empleadoId)
          if (enlace) {
            this.encabezado.elaboro_Id = enlace.id
            this.encabezado.elaboro = enlace.empleado
          }
        }
        return { success: true }
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo: POST /api/bajasdocumentales (201 { id }, estado Borrador). Área
    // generadora = área del usuario (JWT); enlace = enlace del empleado; área responsable = selector.
    // Los roles legados (valida/visto bueno/aprobó) no los modela el backend y se omiten.
    async createTransferencia(encabezado) {
      try {
        const resp = await api.post('/bajasdocumentales', {
          areaGeneradoraId: encabezado.area_Generadora_Id,
          areaResponsableId: encabezado.area_Responsable_Id,
          enlaceId: encabezado.elaboro_Id || null,
          nombre: encabezado.nombre,
          numeroBaja: encabezado.no_Transferencia,
          observaciones: encabezado.observaciones || null
        })
        if (resp.status === 201 || resp.status === 200) {
          this.loadEncabezados();
          return { success: true, data: "Baja registrada con éxito", id: resp.data && resp.data.id }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },

    // MIGRADO al backend nuevo: el legado afectaba en un paso; el backend nuevo exige Borrador->
    // Enviada->Afectada. Un solo botón "Afectar" hace enviar y luego afectar. Si enviar falla por una
    // razón real (p.ej. sin expedientes) y afectar también falla, se surface el error de enviar (más
    // específico); si la baja ya estaba enviada, enviar falla silenciosamente y afectar procede.
    // Auditoría P3: simulación previa. Afectar es irreversible; esto dice qué cambiará y qué lo impide
    // ANTES de que el usuario decida, en vez de dejarle descubrir el impedimento después de confirmar.
    // El servidor la resuelve con las MISMAS reglas que aplica la afectación real.
    async simularAfectacion(id) {
      try {
        const resp = await api.get(`/bajasdocumentales/${id}/simulacion-afectacion`)
        if (resp.status === 200 && resp.data) {
          return { success: true, data: resp.data }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    async afectar(id) {
      let enviarError = null
      try {
        await api.post(`/bajasdocumentales/${id}/enviar`)
      } catch (e) {
        enviarError = mensajeError(e)
      }
      try {
        const resp = await api.post(`/bajasdocumentales/${id}/afectar`)
        if (resp.status === 204 || resp.status === 200) {
          return { success: true, data: "Baja afectada con éxito" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (e) {
        return { success: false, data: enviarError || mensajeError(e) }
      }
    },

    actualizarModal(valor) {
      this.modal = valor;
    },

    actualizarModalVer(valor) {
      this.modal_ver = valor
    },

    actualizarModalAI(valor) {
      this.modalAI = valor;
    },

    updateEditar(valor) {
      this.isEditar = valor;
    },

  },
});
