import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

import { useAuthNuevoStore } from 'src/stores/auth_nuevo_store'

// Área del usuario (para el selector de expedientes de la caja de transferencia, que en el legado era
// por el área del usuario). Horizonte-1 #F7: antes decodificaba el JWT de localStorage; el token ahora
// vive en una cookie httpOnly que JS no puede leer -- se lee del estado ya cargado por auth_nuevo_store
// (GET /api/auth/me).
function areaUsuarioToken() {
  return useAuthNuevoStore().areaId
}

// Empleado del usuario — quien aprueba/rechaza expedientes.
function empleadoUsuarioToken() {
  return useAuthNuevoStore().empleadoId
}

// Corte al backend nuevo: las escrituras REST responden 201/204 y problem+json en error (axios lanza).
const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

export const useInventarioAreaStore = defineStore('InventarioArea', {
  state: () => ({
    modal: false,
    modalVer: false,
    modalAmpliacion: false,
    modalVerAmpliacion: false,
    modalEditar: false,
    isEditar: false,
    loading: false,
    listaAnios: [],
    inventarios: [],
    inventariosOpt: [],
    inventariosOptFiltro: [],
    aniosFiltro: [],
    inventariosArea: [],
    inventariosAreaFiltro: [],
    // Id del encabezado resuelto por loadInventariosByAreaYear (área+año), para recargar/aprobar/
    // rechazar sin depender de un prop de componente que nunca se poblaba (Horizonte-0 #1/#10).
    encabezadoAreaAnioId: null,
    inventario: {
      id: null,
      seccion_Id: null,
      seccion: null,
      serie_Id: null,
      serie: null,
      sub_Serie_Id: null,
      sub_Serie: null,
      disposicion_Documental_Id: null,
      disposicion_Documental: null,
      nombre_Expediente: null,
      clave_Clasificacion: null,
      descripcion: null,
      fecha_Inicio: null,
      fecha_Termino: null,
      ubicacion: null,
      vigencia_Tramite: null,
      vigencia_Concentracion: null,
      vigencia_Completa: null,
      fecha_Clasificacion: null,
      fecha_Desclasificacion: null,
      fecha_Ampliacion: null,
      valor_Documental: null,
      clasificado: false,
      clasificado_Texto: null,
      total_Paginas: null,
      total_Ampliacion: null,
    }
  }),
  getters: {
  },
  actions: {
    initInventario() {
      this.inventario.id = null;
      this.inventario.seccion_Id = null;
      this.inventario.seccion = null;
      this.inventario.serie_Id = null;
      this.inventario.serie = null;
      this.inventario.sub_Serie_Id = null;
      this.inventario.sub_Serie = null;
      this.inventario.disposicion_Documental_Id = null;
      this.inventario.nombre_Expediente = null;
      this.inventario.clave_Clasificacion = null;
      this.inventario.descripcion = null;
      this.inventario.fecha_Inicio = null;
      this.inventario.fecha_Termino = null;
      this.inventario.ubicacion = null;
      this.inventario.vigencia_Tramite = null;
      this.inventario.vigencia_Concentracion = null;
      this.inventario.vigencia_Completa = null;
      this.inventario.fecha_Clasificacion = null;
      this.inventario.fecha_Desclasificacion = null;
      this.inventario.fecha_Ampliacion = null;
      this.inventario.valor_Documental = null;
      this.inventario.vigencia_Tramite = null;
      this.inventario.vigencia_Concentracion = null;
      this.inventario.vigencia_Completa = null;
      this.inventario.clasificado = false;
      this.inventario.clasificado_Texto = null;
      this.inventario.disposicion_Documental = null;
    },

    // MIGRADO al backend nuevo (corte de clientes): GET /api/expedientes/por-encabezado/{id}
    // devuelve un array (aislado por el área del encabezado) con nombres de clasificación
    // resueltos. Se remapea a la forma de la tabla; los campos que el dominio nuevo no modela
    // (valor documental, empleado, ubicación, ampliaciones, disposición-por-id) van en null.
    async loadInventarios(encabezadoId) {
      try {
        this.loading = true
        this.inventarios = []
        const resp = await api.get(`/expedientes/por-encabezado/${encabezadoId}`)
        this.loading = false
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.inventarios = resp.data.map((e) => ({
            id: e.id,
            inventario_General_Area_Encabezado_Id: e.encabezadoId,
            seccion_Id: e.seccionId, seccion: e.seccionClave,
            serie_Id: e.serieId, serie: e.serieClave,
            sub_Serie_Id: e.subSerieId, sub_Serie: e.subSerieClave,
            disposicion_Documental_Id: null, empleado: null,
            nombre_Expediente: e.nombreExpediente,
            clave_Clasificacion: e.claveClasificacion,
            descripcion: e.descripcion,
            fecha_Inicio: e.fechaInicio, fecha_Termino: e.fechaTermino,
            ubicacion: null, valor_Documental: null,
            vigencia_Tramite: e.vigenciaTramite, vigencia_Concentracion: e.vigenciaConcentracion,
            vigencia_Completa: e.vigenciaTotal,
            disposicion_Documental: null,
            fecha_Clasificacion: null, fecha_Desclasificacion: null, fecha_Ampliacion: null,
            estatus: e.estatus, motivo_Rechazo: e.motivoRechazo,
            clasificado: e.clasificado,
            clasificado_Texto: e.clasificado ? 'Clasificado' : 'Público',
            total_Paginas: e.totalPaginas, total_Ampliacion: null,
            Seleccion: false
          }))
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        this.loading = false
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo (Horizonte-0 #1/#10): la ruta legada /Archivo/InventariosGneralesAreas/
    // GetByArea/{area}/{year} ya no existe (404 siempre). Dos pasos contra el backend nuevo: 1) resolver
    // el encabezado del área para el año buscado (GET /encabezados/por-area/{areaId}, filtrando por
    // `ano`), 2) listar sus expedientes (GET /expedientes/por-encabezado/{id}, mismo endpoint que ya usa
    // loadInventarios). El id del encabezado resuelto se guarda en `encabezadoAreaAnioId` para que la UI
    // pueda recargar correctamente tras aprobar/rechazar (antes dependía de un prop nunca poblado).
    async loadInventariosByAreaYear(area, year) {
      try {
        this.loading = true
        this.inventariosArea = []
        this.encabezadoAreaAnioId = null
        const encResp = await api.get(`/encabezados/por-area/${area}`)
        if (encResp.status !== 200 || !Array.isArray(encResp.data)) {
          this.loading = false
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
        const encabezado = encResp.data.find((e) => e.ano == year)
        if (!encabezado) {
          this.loading = false
          return { success: true }
        }
        this.encabezadoAreaAnioId = encabezado.id
        const resp = await api.get(`/expedientes/por-encabezado/${encabezado.id}`)
        this.loading = false
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.inventariosArea = resp.data.map((e) => ({
            id: e.id,
            inventario_General_Area_Encabezado_Id: e.encabezadoId,
            seccion_Id: e.seccionId, seccion: e.seccionClave,
            serie_Id: e.serieId, serie: e.serieClave,
            sub_Serie_Id: e.subSerieId, sub_Serie: e.subSerieClave,
            disposicion_Documental_Id: null, disposicion_Documental: null, empleado: null,
            nombre_Expediente: e.nombreExpediente,
            clave_Clasificacion: e.claveClasificacion,
            descripcion: e.descripcion,
            fecha_Inicio: e.fechaInicio, fecha_Termino: e.fechaTermino,
            ubicacion: null, valor_Documental: null,
            vigencia_Tramite: e.vigenciaTramite, vigencia_Concentracion: e.vigenciaConcentracion,
            vigencia_Completa: e.vigenciaTotal,
            fecha_Clasificacion: null, fecha_Desclasificacion: null, fecha_Ampliacion: null,
            estatus: e.estatus, motivo_Rechazo: e.motivoRechazo,
            clasificado: e.clasificado,
            clasificado_Texto: e.clasificado ? 'Clasificado' : 'Público',
            total_Paginas: e.totalPaginas,
          }))
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        this.loading = false
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadInventariosByArea() {
      try {
        this.loading = true
        this.inventariosArea = []
        const resp = await api.get('/Archivo/InventariosGneralesAreas/ByArea')
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success == true) {
            if (data) {
              data.forEach(element => {
                const { id, inventario_General_Area_Encabezado_Id, seccion_Id, seccion, serie_Id, serie, sub_Serie_Id, sub_Serie,
                  disposicion_Documental_Id, empleado, nombre_Expediente, clave_Clasificacion,
                  descripcion, fecha_Inicio, fecha_Termino, ubicacion, valor_Documental, vigencia_Tramite, vigencia_Concentracion
                  , vigencia_Completa, disposicion_Documental, fecha_Clasificacion, fecha_Desclasificacion, fecha_Ampliacion, estatus, motivo_Rechazo,
                  clasificado, clasificado_Texto
                } = element;
                const obj = {
                  id, inventario_General_Area_Encabezado_Id, seccion_Id, seccion, serie_Id, serie, sub_Serie_Id, sub_Serie,
                  disposicion_Documental_Id, empleado, nombre_Expediente, clave_Clasificacion,
                  descripcion, fecha_Inicio, fecha_Termino, ubicacion, valor_Documental, vigencia_Tramite, vigencia_Concentracion
                  , vigencia_Completa, disposicion_Documental, fecha_Clasificacion, fecha_Desclasificacion, fecha_Ampliacion, estatus, motivo_Rechazo,
                  clasificado, clasificado_Texto
                }
                this.inventariosArea.push(obj)
              });
            }
            this.loading = false
          } else {
            this.loading = false
            return { success, data }
          }
        }
      } catch (error) {
        this.loading = false
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }

    },

    // MIGRADO al backend nuevo: selector de expedientes de la caja. GET /api/expedientes/por-area/
    // {área del usuario}?fase=Tramite (el filtro server-side por sección/año del legado se relaja; el
    // q-select tiene búsqueda). El filtro ?fase=Tramite es clave: la transferencia primaria solo puede
    // afectar expedientes en trámite; sin él, el picker ofrecería expedientes ya en concentración
    // (ya transferidos) y "afectar" devolvería 409 "El expediente no está en trámite". Se excluyen
    // además los expedientes ya capturados en las cajas existentes (vía el detalle migrado
    // /transferenciasprimarias/cajas/{id}/detalle). Los params sección/año se conservan por
    // compatibilidad de firma pero ya no filtran server-side.
    async loadInventariosAreaOpt(secciones, year_Inicio, year_Fin, cajas) {
      try {
        this.inventariosOpt = []
        const areaId = areaUsuarioToken()
        if (!areaId) {
          return { success: false, data: "Tu usuario no tiene área asociada." }
        }
        const clavesCapturadas = new Set()
        for (const caja of (cajas || [])) {
          if (!caja || !caja.id) continue
          try {
            const r = await api.get(`/transferenciasprimarias/cajas/${caja.id}/detalle`)
            if (r.status == 200 && Array.isArray(r.data)) {
              r.data.forEach((d) => clavesCapturadas.add(d.claveClasificacion))
            }
          } catch (err) { console.warn('detalle caja', err && err.message) }
        }
        const resp = await api.get(`/expedientes/por-area/${areaId}?fase=Tramite`)
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.inventariosOpt = resp.data
            .filter((e) => !clavesCapturadas.has(e.claveClasificacion))
            .map((e) => ({
              label: `${e.claveClasificacion}-${e.nombreExpediente}`,
              value: e.id,
              clave: e.claveClasificacion,
              nombre: e.nombreExpediente,
              fechaInicio: e.fechaInicio,
              fechaTermino: e.fechaTermino,
              totalPaginas: e.totalPaginas
            }))
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // Corte: reemplaza a loadInventario (endpoint legado compartido) en el detalle de la caja de
    // transferencia: pobla `inventario` desde la opción del picker ya cargada. Los campos que el DTO
    // de expedientes-por-área no trae (valor documental, vigencia, disposición, nº interno) quedan en
    // null (son solo de despliegue local; el backend solo recibe id/descripción/signatura/páginas).
    seleccionarInventarioOptLocal(id) {
      this.initInventario()
      const opt = this.inventariosOpt.find((x) => x.value == id)
      if (opt) {
        this.inventario.id = opt.value
        this.inventario.clave_Clasificacion = opt.clave
        this.inventario.nombre_Expediente = opt.nombre
        this.inventario.fecha_Inicio = opt.fechaInicio
        this.inventario.fecha_Termino = opt.fechaTermino
        this.inventario.total_Paginas = opt.totalPaginas
      }
    },

    // Corte al backend nuevo (corte de clientes): opciones del picker para armar cajas de BAJA
    // documental. Igual que loadInventariosAreaOpt (transferencias) pero excluye las claves ya
    // capturadas en las cajas de la BAJA (/bajasdocumentales/cajas/{id}/detalle). Pide
    // ?fase=Concentracion&fase=Historico: la baja (DarDeBaja) solo procede desde esas fases, así que sin
    // el filtro el picker ofrecería expedientes en trámite y "afectar" devolvería 409 "Solo se da de baja
    // desde concentración o histórico". Enriquece cada opción (clave/nombre/fechas/totalPaginas + anio
    // derivado de la clave) para que seleccionarInventarioOptLocal pueble `inventario` y el filtro por año
    // del RegistroDetalle funcione (el label termina en el nombre, no en el año). Área generadora = área del JWT.
    async loadInventariosBajaOpt(cajas) {
      try {
        this.inventariosOpt = []
        const areaId = areaUsuarioToken()
        if (!areaId) {
          return { success: false, data: "Tu usuario no tiene área asociada." }
        }
        const clavesCapturadas = new Set()
        for (const caja of (cajas || [])) {
          if (!caja || !caja.id) continue
          try {
            const r = await api.get(`/bajasdocumentales/cajas/${caja.id}/detalle`)
            if (r.status == 200 && Array.isArray(r.data)) {
              r.data.forEach((d) => clavesCapturadas.add(d.claveClasificacion))
            }
          } catch (err) { console.warn('detalle caja baja', err && err.message) }
        }
        const resp = await api.get(`/expedientes/por-area/${areaId}?fase=Concentracion&fase=Historico`)
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.inventariosOpt = resp.data
            .filter((e) => !clavesCapturadas.has(e.claveClasificacion))
            .map((e) => {
              const partes = (e.claveClasificacion || '').split('/')
              return {
                label: `${e.claveClasificacion}-${e.nombreExpediente}`,
                value: e.id,
                clave: e.claveClasificacion,
                nombre: e.nombreExpediente,
                fechaInicio: e.fechaInicio,
                fechaTermino: e.fechaTermino,
                totalPaginas: e.totalPaginas,
                anio: partes.length ? partes[partes.length - 1] : null
              }
            })
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // Corte al backend nuevo (corte de clientes): opciones del picker para armar cajas de TRANSFERENCIA
    // SECUNDARIA (concentración -> histórico). Igual que loadInventariosBajaOpt pero excluye las claves
    // ya capturadas en las cajas de la SECUNDARIA (/transferenciassecundarias/cajas/{id}/detalle) y pide
    // ?fase=Concentracion: la afectación secundaria (TransferirAHistorico) solo procede desde concentración,
    // así que sin el filtro el picker ofrecería expedientes en trámite/histórico y "afectar" devolvería 409.
    // Enriquece cada opción para que seleccionarInventarioOptLocal pueble `inventario` y el filtro por año
    // del RegistroDetalle funcione. Área generadora = área del JWT.
    async loadInventariosSecundariaOpt(cajas) {
      try {
        this.inventariosOpt = []
        const areaId = areaUsuarioToken()
        if (!areaId) {
          return { success: false, data: "Tu usuario no tiene área asociada." }
        }
        const clavesCapturadas = new Set()
        for (const caja of (cajas || [])) {
          if (!caja || !caja.id) continue
          try {
            const r = await api.get(`/transferenciassecundarias/cajas/${caja.id}/detalle`)
            if (r.status == 200 && Array.isArray(r.data)) {
              r.data.forEach((d) => clavesCapturadas.add(d.claveClasificacion))
            }
          } catch (err) { console.warn('detalle caja secundaria', err && err.message) }
        }
        const resp = await api.get(`/expedientes/por-area/${areaId}?fase=Concentracion`)
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.inventariosOpt = resp.data
            .filter((e) => !clavesCapturadas.has(e.claveClasificacion))
            .map((e) => {
              const partes = (e.claveClasificacion || '').split('/')
              return {
                label: `${e.claveClasificacion}-${e.nombreExpediente}`,
                value: e.id,
                clave: e.claveClasificacion,
                nombre: e.nombreExpediente,
                fechaInicio: e.fechaInicio,
                fechaTermino: e.fechaTermino,
                totalPaginas: e.totalPaginas,
                anio: partes.length ? partes[partes.length - 1] : null
              }
            })
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadInventarioOptAi() {
      try {
        const resp = await api.get(`/Archivo/InventariosAreasAI/GetLista`)
        if (resp.status == 200) {
          const { success, data } = resp.data

          if (success) {
            if (data) {
              this.inventariosOpt = data.map((element) => {
                const { label, value } = element
                return {
                  label, value
                }
              })
            }
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (error) {
        console.log(error)
      }
    },

    async loadInventarioOptAiHistorico(historico) {
      try {
        const respArea = await api.get("/Areas/AreaByUsuario")
        let area = respArea.data.data.area
        let resp = null
        if (historico) {
          resp = await api.get(`/Archivo/InventariosAreasAI/Historico`)
        }
        else {
          resp = await api.get(`/Archivo/InventariosAreasAI/Concentracion`)
        }

        if (resp.status == 200) {
          this.aniosFiltro = []
          this.inventariosOpt = []
          this.inventariosOptFiltro = []
          const { success, data } = resp.data
          let resultados = data.filter(x => x.area_Generadora == area)
          if (success) {
            let anios = []
            if (data) {

              this.inventariosOpt = resultados.map((element) => {
                const { clave_Clasificacion, nombre_Expediente, id } = element
                anios.push(clave_Clasificacion.split("/")[clave_Clasificacion.split("/").length - 1])
                return {
                  label: clave_Clasificacion + " - " + nombre_Expediente, value: id, anio: parseInt(clave_Clasificacion.split("/")[clave_Clasificacion.split("/").length - 1])
                }
              })
            }
            if (this.inventariosOpt.length > 0) {
              let aniosUnicos = [...new Set(anios)]
                .map(Number) // Convertir a enteros
                .sort((a, b) => a - b); // Ordenar de menor a mayor
              this.aniosFiltro = aniosUnicos
            }
          }
          if (this.inventariosOpt.length > 0) { await this.loadFiltroAnio(this.aniosFiltro[0]) }

        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (error) {
        console.log(error)
      }
    },

    async loadFiltroAnio(anio) {
      try {
        this.inventariosOptFiltro = this.inventariosOpt.filter(x => x.anio == anio)
      } catch (error) {
        console.log(error)
      }
    },

    // MIGRADO al backend nuevo (corte): GET /api/expedientes/por-area/{areaId}?clasificado=false ->
    // expedientes NO clasificados del área para el selector de préstamo. La opción lleva la fecha de
    // término y la clave (para poblar el detalle sin llamar a loadInventario). El año se deriva de la clave.
    async loadInventariosArea(areaId) {
      try {
        this.inventariosArea = []
        const resp = await api.get(`/expedientes/por-area/${areaId}?clasificado=false`)
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.inventariosArea = resp.data.map((e) => this.__opcionExpediente(e))
          const anios = this.inventariosArea.map(x => x.anio).filter(a => !isNaN(a))
          this.listaAnios = [...new Set(anios)].sort((a, b) => a - b)
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // Arma la opción del picker de expediente desde el DTO nuevo (id, claveClasificacion,
    // nombreExpediente, fechaTermino). El año sale del último segmento de la clave (…/AAAA).
    __opcionExpediente(e) {
      const clave = e.claveClasificacion || ''
      const partes = clave.split('/')
      const anio = parseInt(partes[partes.length - 1])
      return {
        label: `${clave}-${e.nombreExpediente}`,
        value: e.id,
        clave,
        anio,
        fechaTermino: e.fechaTermino
      }
    },

    // Corte: pobla `inventario` (que la pantalla de préstamo liga) desde la opción ya cargada, en vez
    // de llamar a loadInventario (endpoint legado compartido). El expediente no trae ubicación en el
    // backend nuevo, así que la ubicación (signatura) queda vacía para que el usuario la capture.
    seleccionarInventarioLocal(id) {
      this.initInventario()
      const opt = this.inventariosArea.find((x) => x.value == id)
      if (opt) {
        this.inventario.clave_Clasificacion = opt.clave
        this.inventario.fecha_Termino = opt.fechaTermino
        this.inventario.ubicacion = null
        this.inventario.no_Expediente_Interno = null
      }
    },

    async loadInventariosAreaAnio(anio) {
      try {
        this.inventariosAreaFiltro = this.inventariosArea.filter(x => x.anio == anio)

      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo: GET /api/expedientes/por-area/{areaId}?clasificado=true (expedientes
    // clasificados del área) para el selector del préstamo clasificado.
    async loadInventariosAreaClasificado(areaId) {
      try {
        this.inventariosArea = []
        const resp = await api.get(`/expedientes/por-area/${areaId}?clasificado=true`)
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.inventariosArea = resp.data.map((e) => this.__opcionExpediente(e))
          const anios = this.inventariosArea.map(x => x.anio).filter(a => !isNaN(a))
          this.listaAnios = [...new Set(anios)].sort((a, b) => a - b)
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // Corte al backend nuevo (corte de clientes): picker de expedientes para el ALTA de préstamo de
    // Archivo Institucional (Concentración/Histórico). Igual que loadInventariosArea (préstamo de Trámite)
    // pero pide ?fase=Concentracion&fase=Historico: el préstamo AI es sobre expedientes ya en el archivo
    // institucional. Comparte el estado (inventariosArea/listaAnios) y los helpers __opcionExpediente/
    // seleccionarInventarioLocal/loadInventariosAreaAnio con el picker de Trámite. Área = la seleccionada
    // en el modal (área responsable/dueña del expediente).
    async loadInventariosAreaAi(areaId) {
      try {
        this.inventariosArea = []
        const resp = await api.get(`/expedientes/por-area/${areaId}?fase=Concentracion&fase=Historico`)
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.inventariosArea = resp.data.map((e) => this.__opcionExpediente(e))
          const anios = this.inventariosArea.map(x => x.anio).filter(a => !isNaN(a))
          this.listaAnios = [...new Set(anios)].sort((a, b) => a - b)
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadInventario(id) {
      try {
        this.initInventario()
        const resp = await api.get(`/Archivo/InventariosGneralesAreas/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {

              this.inventario.id = data.id
              this.inventario.seccion_Id = data.seccion_Id
              this.inventario.seccion = data.seccion
              this.inventario.serie_Id = data.serie_Id
              this.inventario.serie = data.serie
              this.inventario.sub_Serie_Id = data.sub_Serie_Id
              this.inventario.sub_Serie = data.sub_Serie
              this.inventario.disposicion_Documental_Id = data.disposicion_Documental_Id
              this.inventario.disposicion_Documental = data.disposicion_Documental
              this.inventario.nombre_Expediente = data.nombre_Expediente
              this.inventario.clave_Clasificacion = data.clave_Clasificacion
              this.inventario.descripcion = data.descripcion
              this.inventario.fecha_Inicio = data.fecha_Inicio
              this.inventario.fecha_Termino = data.fecha_Termino
              this.inventario.ubicacion = data.ubicacion
              this.inventario.fecha_Clasificacion = data.fecha_Clasificacion
              this.inventario.fecha_Desclasificacion = data.fecha_Desclasificacion
              this.inventario.fecha_Ampliacion = data.fecha_Ampliacion
              this.inventario.valor_Documental = data.valor_Documental
              this.inventario.vigencia_Tramite = data.vigencia_Tramite
              this.inventario.vigencia_Concentracion = data.vigencia_Concentracion
              this.inventario.vigencia_Completa = data.vigencia_Completa
              this.inventario.clasificado = data.clasificado
              this.inventario.total_Paginas = data.total_Paginas
              this.inventario.disposicion_Documental = data.disposicion_Documental
              this.inventario.total_Ampliacion = data.total_Ampliacion
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

    setInventario(id) {
      try {
        const inventarioSeleccionado = this.inventarios.find(element => element.id == id);
        this.inventario.id = inventarioSeleccionado.id
        this.inventario.clave_Clasificacion = inventarioSeleccionado.clave_Clasificacion
        this.inventario.total_Ampliacion = inventarioSeleccionado.total_Ampliacion
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo (corte de clientes): POST /api/expedientes (201 { id }, estado
    // SinEnviar). Se mapea el objeto rico del form al comando; sub_Serie/disposición son opcionales;
    // las vigencias vienen de la disposición seleccionada. Ubicación/valor documental/ampliaciones no
    // los modela el alta del dominio nuevo (se omiten).
    async createInventario(inventario, encabezado_id) {
      try {
        const num = (v) => (v != null && v !== '' ? Number(v) : null)
        const resp = await api.post('/expedientes', {
          encabezadoId: encabezado_id,
          seccionId: inventario.seccion_Id,
          serieId: inventario.serie_Id,
          subSerieId: inventario.sub_Serie_Id || null,
          disposicionDocumentalId: inventario.disposicion_Documental_Id || null,
          consecutivo: num(inventario.consecutivo),
          claveClasificacion: inventario.clave_Clasificacion || null,
          nombreExpediente: inventario.nombre_Expediente || null,
          descripcion: inventario.descripcion || null,
          fechaInicio: inventario.fecha_Inicio || null,
          fechaTermino: inventario.fecha_Termino || null,
          vigenciaTramite: Number(inventario.vigencia_Tramite) || 0,
          vigenciaConcentracion: Number(inventario.vigencia_Concentracion) || 0,
          totalPaginas: num(inventario.total_Paginas)
        })
        if (resp.status === 201 || resp.status === 200) {
          this.loadInventarios(encabezado_id)
          return { success: true, data: "Expediente registrado con éxito", id: resp.data && resp.data.id }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    // MIGRADO al backend nuevo (Horizonte-0 #3): la ruta legada /Archivo/InventariosGneralesAreas/{id}
    // (PUT) no existe -> 404 garantizado. PATCH /expedientes/{id} (solo datos capturables; el backend
    // rechaza la edición si el expediente ya no está en trámite sin enviar/rechazado).
    async updateInventario(inventario, id, encabezado_Id) {
      try {
        const num = (v) => (v != null && v !== '' ? Number(v) : null)
        const resp = await api.patch(`/expedientes/${id}`, {
          seccionId: inventario.seccion_Id,
          serieId: inventario.serie_Id,
          subSerieId: inventario.sub_Serie_Id || null,
          disposicionDocumentalId: inventario.disposicion_Documental_Id || null,
          nombreExpediente: inventario.nombre_Expediente || null,
          descripcion: inventario.descripcion || null,
          fechaInicio: inventario.fecha_Inicio || null,
          fechaTermino: inventario.fecha_Termino || null,
          vigenciaTramite: Number(inventario.vigencia_Tramite) || 0,
          vigenciaConcentracion: Number(inventario.vigencia_Concentracion) || 0,
          totalPaginas: num(inventario.total_Paginas)
        })
        if (resp.status === 204 || resp.status === 200) {
          this.loadInventarios(encabezado_Id)
          return { success: true, data: "Expediente actualizado con éxito" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    async deleteInventario(id, encabezado_Id) {
      try {
        const resp = await api.delete(`/Archivo/InventariosGneralesAreas/${id}`)
        if (resp.status == 200) {
          let { success, data } = resp.data
          if (success === true) {
            this.loadInventarios(encabezado_Id);
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

    // MIGRADO al backend nuevo: el expediente nace SinEnviar; aprobar exige Enviado. El legado no
    // tenía paso "enviar", así que aprobar hace POST /expedientes/{id}/enviar y luego
    // POST /expedientes/{id}/aprobar { empleadoAproboId } en secuencia. El aprobador es el usuario
    // actual (claim empleado_id del JWT). Si ya estaba enviado, enviar falla silenciosamente y aprobar
    // procede; si aprobar falla, se surface su error.
    async aprobarInventario(id, encabezadoId) {
      const empleadoAproboId = empleadoUsuarioToken()
      if (!empleadoAproboId) {
        return { success: false, data: "Tu usuario no tiene un empleado asociado para aprobar." }
      }
      try {
        await api.post(`/expedientes/${id}/enviar`)
      } catch (e) {
        console.warn('enviar (aprobar)', e && e.message)
      }
      try {
        const resp = await api.post(`/expedientes/${id}/aprobar`, { empleadoAproboId })
        if (resp.status === 204 || resp.status === 200) {
          this.loadInventarios(encabezadoId)
          return { success: true, data: "Expediente aprobado" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (e) {
        return { success: false, data: mensajeError(e) }
      }
    },

    // MIGRADO al backend nuevo: igual que aprobar, rechazar exige Enviado -> enviar + rechazar.
    async rechazarInventario(id, encabezadoId, motivo) {
      try {
        await api.post(`/expedientes/${id}/enviar`)
      } catch (e) {
        console.warn('enviar (rechazar)', e && e.message)
      }
      try {
        const resp = await api.post(`/expedientes/${id}/rechazar`, { motivo })
        if (resp.status === 204 || resp.status === 200) {
          this.loadInventarios(encabezadoId)
          return { success: true, data: "Expediente rechazado" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (e) {
        return { success: false, data: mensajeError(e) }
      }
    },

    // MIGRADO al backend nuevo (Horizonte-0 #2): conecta la clasificación LGTAIP (reservado/confidencial)
    // al endpoint que ya existía en el backend pero nunca se llamaba desde la UI. `nivel` es el entero del
    // enum NivelClasificacion (1=Publica -> usar Desclasificar, 2=Reservada, 3=Confidencial); el backend no
    // usa un JsonStringEnumConverter, así que se envía como número, no como texto.
    async clasificarInventario(id, nivel, fundamento, plazoReservaAnios, encabezadoId) {
      try {
        const resp = await api.patch(`/expedientes/${id}/clasificacion`, {
          nivel,
          fundamento: fundamento || null,
          plazoReservaAnios: plazoReservaAnios != null && plazoReservaAnios !== '' ? Number(plazoReservaAnios) : null,
        })
        if (resp.status === 204 || resp.status === 200) {
          this.loadInventarios(encabezadoId)
          return { success: true, data: "Clasificación actualizada" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    // Horizonte-3 #DF-6: alerta no bloqueante de posibles CURP/RFC en nombre/descripción. Falla
    // silenciosa (no interrumpe la captura): es una ayuda, no un requisito para guardar.
    async detectarDatosSensibles(nombreExpediente, descripcion) {
      try {
        const resp = await api.post('/expedientes/detectar-datos-sensibles', {
          nombreExpediente: nombreExpediente || null, descripcion: descripcion || null
        })
        if (resp.status === 200) {
          return { success: true, data: resp.data }
        }
        return { success: false, data: [] }
      } catch (e) {
        console.warn('detectar-datos-sensibles', e && e.message)
        return { success: false, data: [] }
      }
    },

    // Horizonte-3 #DF-1: hasta 3 sugerencias de Sección/Serie/Subserie por similitud de nombre con
    // expedientes ya aprobados del área. Solo sugiere -- el usuario decide si aplicarla.
    async sugerirClasificacion(nombreExpediente) {
      try {
        const resp = await api.post('/expedientes/sugerir-clasificacion', { nombreExpediente })
        if (resp.status === 200) {
          return { success: true, data: resp.data }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    // Horizonte-3 #DF-5 v1: posibles duplicados por similitud de nombre/metadatos dentro de la misma
    // área. Solo lista candidatos -- no fusiona nada.
    async listarPosiblesDuplicados(id) {
      try {
        const resp = await api.get(`/expedientes/${id}/posibles-duplicados`)
        if (resp.status === 200) {
          return { success: true, data: resp.data }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    async ampliarVigencia(id, ampliacion, encabezadoId) {
      try {
        const resp = await api.post(`/Archivo/InventariosGneralesAreas/Ampliar/${id}`, ampliacion, {
          headers: {
            'Conten-Type': 'multipart/form-data'
          }
        }
        )
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success == true) {
            this.loadInventarios(encabezadoId);
            return { success, data }
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

    actualizarModal(valor) {
      this.modal = valor
    },

    actualizarModalEditar(valor) {
      this.modalEditar = valor
    },

    actualizarModalVer(valor) {
      this.modalVer = valor
    },

    actualizarModalAmpliacion(valor) {
      this.modalAmpliacion = valor
    },

    actualizarModalVerAmpliacion(valor) {
      this.modalVerAmpliacion = valor
    },

    updateEditar(valor) {
      this.isEditar = valor
    },

  },
});
