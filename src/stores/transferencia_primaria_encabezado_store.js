import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

// Corte al backend nuevo: las escrituras REST responden 201/204 y problem+json en error (axios lanza).
const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

import { useAuthNuevoStore } from 'src/stores/auth_nuevo_store'

// Empleado y área del usuario autenticado (para el área generadora y el enlace del alta de transferencia).
// Horizonte-1 #F7: antes decodificaba el JWT de localStorage; el token ahora vive en una cookie httpOnly
// que JS no puede leer -- se lee del estado ya cargado por auth_nuevo_store (GET /api/auth/me).
function datosUsuarioToken() {
  const { areaId, empleadoId } = useAuthNuevoStore()
  return { empleadoId, areaId }
}

export const useTransferenciaPrimariaEncabezadoStore = defineStore('TransferenciaPrimariaEncabezado', {
  state: () => ({
    isLoading: false,
    isEditar: false,
    modal: false,
    modalAI: false,
    encabezados: [],
    encabezadosFiltro: [],
    areaFiltroActiva: "Ver todos",
    encabezadosAi: [],
    encabezadosAiFiltro: [],
    inventarios: [],
    encabezado: {
      id: null,
      area_Responsable_Id: null,
      area_Responsable: null,
      area_Generadora_Id: null,
      area_Generadora: null,
      enlace_Id: null,
      enlace: null,
      puesto_Enlace: null,
      valida_Area_Id: null,
      valida_Area: null,
      puesto_Valida_Area: null,
      coteja_Id: null,
      coteja: null,
      puesto_Coteja: null,
      valida_Id: null,
      valida: null,
      puesto_Valida: null,
      nombre: null,
      numero_Transferencia: null,
      total_Cajas: null,
      total_Expedientes: null,
      peso_Total: null,
      fecha_Antigua: null,
      fecha_Reciente: null,
      estatus: null,
      fecha_Transferencia: null,
      secciones: null,
      conteo_Cajas: null,
      conteo_Hojas: null,
      // fecha_Transferencia: null
    },
    listaAreasGeneradoras: [],
  }),
  actions: {

    initEncabezado() {
      // this.encabezado.area_Responsable_Id = null;
      // this.encabezado.area_Responsable = null;
      // this.encabezado.area_Generadora_Id = null;
      // this.encabezado.area_Generadora = null;
      // this.encabezado.enlace_Id = null;
      // this.encabezado.enlace = null;
      // this.encabezado.Valida_Area_Id = null;
      // this.encabezado.valida_Area = null;
      // this.encabezado.Valida_Id = null;
      // this.encabezado.valida = null;
      // this.encabezado.coteja_Id = null;
      // this.encabezado.coteja = null;
      this.encabezado.nombre = null;
      this.encabezado.numero_Transferencia = null;
      // this.encabezado.seccion_Id = null;
      this.encabezado.total_Cajas = null;
      this.encabezado.total_Expedientes = null;
      this.encabezado.peso_Total = null;
      this.encabezado.fecha_Antigua = null;
      this.encabezado.fecha_Reciente = null;
      this.encabezado.estatus = null;
      this.encabezado.secciones = null;
      // this.encabezado.fecha_Transferencia = null;
    },

    async loadArea() {
      try {
        // MIGRADO al backend nuevo: el área generadora es el área del usuario (claim `area` del JWT);
        // el nombre se resuelve desde /api/areas. El área RESPONSABLE ya no se deriva del área padre
        // (la jerarquía no está poblada) — el usuario la elige con un selector en el modal.
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

    // MIGRADO al backend nuevo: el enlace ("Elaboró") es el del empleado del usuario, buscado en
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
            this.encabezado.enlace_Id = enlace.id
            this.encabezado.enlace = enlace.empleado
          }
        }
        return { success: true }
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo (corte de clientes): GET /api/transferenciasprimarias devuelve
    // un array scoped por el usuario (ámbito global -> todas; usuario de área -> la suya), con
    // áreas y enlace resueltos. Los roles de firma (valida/coteja) y pesos/fechas extremas, que
    // el dominio nuevo no modela, van en null.
    async loadEncabezados() {
      try {
        this.isLoading = true
        const resp = await api.get('/transferenciasprimarias')
        this.isLoading = false
        if (resp.status == 200 && Array.isArray(resp.data)) {
          let areas = []
          const encabezadosArray = resp.data.map((enc) => {
            areas.push(enc.areaGeneradora)
            return {
              id: enc.id,
              area_Responsable_Id: enc.areaResponsableId,
              area_Responsable: enc.areaResponsable,
              fecha_Registro: null,
              area_Generadora_Id: enc.areaGeneradoraId,
              area_Generadora: enc.areaGeneradora,
              enlace_Id: enc.enlaceId,
              enlace: enc.enlace,
              puesto_Enlace: null,
              valida_Area_Id: null, valida_Area: null, puesto_Valida_Area: null,
              coteja_Id: null, coteja: null, puesto_Coteja: null,
              valida_Id: null, valida: null, puesto_Valida: null,
              nombre: enc.nombre,
              numero_Transferencia: enc.numeroTransferencia,
              total_Cajas: enc.totalCajas,
              total_Expedientes: enc.totalExpedientes,
              peso_Total: null,
              fecha_Antigua: null,
              fecha_Reciente: null,
              estatus: enc.estatus,
              conteo_Cajas: enc.totalCajas,
            }
          })
          this.encabezados = encabezadosArray
          // Respeta el filtro por área activo tras recargar (p.ej. al crear una transferencia).
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

    // MIGRADO al backend nuevo (corte de clientes): la vista AI (afectar) se COLAPSÓ — el backend
    // gatea todo por área generadora, no hay recepción por área de concentración. La bandeja AI
    // refleja las transferencias del usuario (GET /api/transferenciasprimarias, scoped), igual que
    // loadEncabezados; el afectar solo aplica a las que están 'Enviada'. Roles legados
    // (valida/coteja) y pesos/fechas extremas van en null.
    async loadEncabezadosAi() {
      try {
        this.isLoading = true
        const resp = await api.get('/transferenciasprimarias')
        this.isLoading = false
        if (resp.status == 200 && Array.isArray(resp.data)) {
          let areas = []
          const encabezadosArray = resp.data.map((enc) => {
            areas.push(enc.areaGeneradora)
            return {
              id: enc.id,
              area_Responsable_Id: enc.areaResponsableId,
              area_Responsable: enc.areaResponsable,
              fecha_Registro: null,
              area_Generadora_Id: enc.areaGeneradoraId,
              area_Generadora: enc.areaGeneradora,
              enlace_Id: enc.enlaceId,
              enlace: enc.enlace,
              valida_Area_Id: null, valida_Area: null,
              coteja_Id: null, coteja: null,
              valida_Id: null, valida: null,
              nombre: enc.nombre,
              numero_Transferencia: enc.numeroTransferencia,
              total_Cajas: enc.totalCajas,
              total_Expedientes: enc.totalExpedientes,
              peso_Total: null,
              fecha_Antigua: null,
              fecha_Reciente: null,
              estatus: enc.estatus,
            }
          })
          this.encabezadosAi = encabezadosArray
          this.encabezadosAiFiltro = encabezadosArray
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

    async loadEncabezadosAiFiltro(area) {
      try {
        if (area == "Ver todos") {
          this.encabezadosAiFiltro = this.encabezadosAi
        } else {
          this.encabezadosAiFiltro = this.encabezadosAi.filter(enc => enc.area_Generadora == area)
        }
      } catch (error) {
        console.error(error)
      }
    },

    // MIGRADO al backend nuevo (Horizonte-0 #9): la ruta legada Archivo/TransferenciasPrimariasEncabezados/
    // GetDataAnexo9/{id} no existe en el backend nuevo (404 siempre) -> el Anexo 9 se generaba con datos
    // vacíos/obsoletos sin avisar. GET /transferenciasprimarias/{id}/anexo9 devuelve un array plano (no el
    // envoltorio legado {success,data}) con serie/subserie/valor documental/destino ya resueltos.
    async loadInventarios(id) {
      try {
        const resp = await api.get(`/transferenciasprimarias/${id}/anexo9`)
        if (resp.status !== 200 || !Array.isArray(resp.data)) {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
        this.inventarios = resp.data.map((e) => {
          const partes = (e.claveClasificacion || '').split('/')
          return {
            serie_Sub_Serie: e.serieSubSerie,
            nombre_Expediente: e.nombreExpediente,
            clave_Clasificacion: e.claveClasificacion,
            no_Expediente_Interno: partes.length >= 2 ? partes[partes.length - 2] : null,
            descripcion: e.descripcion,
            fecha_Inicio: e.fechaInicio,
            fecha_Termino: e.fechaTermino,
            caja: e.noCaja,
            valor_Documental: e.valorDocumental,
            concentracion: e.vigenciaConcentracion,
            historico_Baja: e.destinoFinal,
            signatura_Topografica: e.signaturaTopografica,
          }
        })
        return { success: true }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },

    // MIGRADO al backend nuevo (corte de clientes): el backend nuevo NO expone GET-por-id; el
    // encabezado se toma del listado ya scoped (GET /api/transferenciasprimarias) buscando por id
    // (patrón edit-from-list). Los roles legados de firma (valida/coteja/puestos) y pesos/fechas
    // extremas, que el dominio nuevo no modela, van en null.
    async loadEncabezado(id) {
      try {
        this.isLoading = true
        const resp = await api.get('/transferenciasprimarias')
        this.isLoading = false
        if (resp.status == 200 && Array.isArray(resp.data)) {
          const enc = resp.data.find((e) => e.id == id)
          if (enc) {
            this.encabezado.id = enc.id;
            this.encabezado.area_Responsable_Id = enc.areaResponsableId;
            this.encabezado.area_Responsable = enc.areaResponsable;
            this.encabezado.fecha_Registro = null;
            this.encabezado.area_Generadora_Id = enc.areaGeneradoraId;
            this.encabezado.area_Generadora = enc.areaGeneradora;
            this.encabezado.enlace_Id = enc.enlaceId;
            this.encabezado.enlace = enc.enlace;
            this.encabezado.puesto_Enlace = null;
            this.encabezado.valida_Id = null;
            this.encabezado.valida = null;
            this.encabezado.puesto_Valida = null;
            this.encabezado.valida_Area_Id = null;
            this.encabezado.valida_Area = null;
            this.encabezado.puesto_Valida_Area = null;
            this.encabezado.coteja = null;
            this.encabezado.coteja_Id = null;
            this.encabezado.puesto_Coteja = null;
            this.encabezado.nombre = enc.nombre;
            this.encabezado.numero_Transferencia = enc.numeroTransferencia;
            this.encabezado.total_Cajas = enc.totalCajas;
            this.encabezado.total_Expedientes = enc.totalExpedientes;
            this.encabezado.fecha_Antigua = null;
            this.encabezado.fecha_Reciente = null;
            this.encabezado.estatus = enc.estatus;
            this.encabezado.fecha_Transferencia = null;
            this.encabezado.secciones = null;
            this.encabezado.peso_Total = null;
            this.encabezado.conteo_Cajas = enc.totalCajas;
            this.encabezado.conteo_Hojas = null;
          }
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo: POST /api/transferenciasprimarias (201 { id }, estado Borrador). Los
    // roles legados (valida/coteja/valida_Area) no los modela el backend y se omiten.
    async createTransferenciaPrimariaEncabezado(encabezado) {
      try {
        const resp = await api.post('/transferenciasprimarias', {
          areaGeneradoraId: encabezado.area_Generadora_Id,
          areaResponsableId: encabezado.area_Responsable_Id,
          enlaceId: encabezado.enlace_Id || null,
          nombre: encabezado.nombre,
          numeroTransferencia: encabezado.numero_Transferencia
        })
        if (resp.status === 201 || resp.status === 200) {
          this.loadEncabezados();
          return { success: true, data: "Transferencia registrada con éxito", id: resp.data && resp.data.id }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },

    async updateTransferenciaPrimariaEncabezado(id, encabezado) {
      try {
        if (encabezado.fecha_Antigua == 'Sin registro') {
          encabezado.fecha_Antigua = null
        }

        if (encabezado.fecha_Reciente == 'Sin registro') {
          encabezado.fecha_Reciente = null
        }
        const resp = await api.put(`Archivo/TransferenciasPrimariasEncabezados/${id}`, encabezado)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success == true) {
            this.loadEncabezados();
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

    async deleteTransferenciaPrimariaEncabezado(id) {
      try {
        const resp = await api.delete(`Archivo/TransferenciasPrimariasEncabezados/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            this.loadEncabezados();
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

    // MIGRADO al backend nuevo: POST /api/transferenciasprimarias/{id}/enviar -> 204 (Borrador->Enviada).
    async enviarTransferencia(id) {
      try {
        const resp = await api.post(`/transferenciasprimarias/${id}/enviar`)
        if (resp.status === 204 || resp.status === 200) {
          return { success: true, data: "Transferencia enviada" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo" }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    async aprobarMasivo(id) {
      try {
        const resp = await api.get(`/Archivo/TransferenciasPrimariasEncabezadosAI/AprobarMasivo/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          return { success, data }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo" }
        }
      } catch (e) {
        console.error(e);
        return { success: false, data: "Ocurrio un error, intentelo de nuevo" }
      }
    },

    // MIGRADO al backend nuevo: POST /api/transferenciasprimarias/{id}/afectar -> 204 (Enviada->Afectada).
    async afectarTransferencia(id) {
      try {
        const resp = await api.post(`/transferenciasprimarias/${id}/afectar`)
        if (resp.status === 204 || resp.status === 200) {
          return { success: true, data: "Transferencia afectada" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo" }
      } catch (e) {
        console.error(e);
        return { success: false, data: mensajeError(e) }
      }
    },

    actualizarModal(valor) {
      this.modal = valor;
    },

    actualizarModalAI(valor) {
      this.modalAI = valor;
    },

    updateEditar(valor) {
      this.isEditar = valor;
    },

  },
});
