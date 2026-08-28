import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

// Corte al backend nuevo: editar ubicación responde 204 y problem+json en error (axios lanza).
const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

// Corte al backend nuevo: mapea el DTO enriquecido (GET /api/expedientes/inventario-ai) a la forma que
// esperan las tablas del módulo. El valor documental y el destino final (disposición) ya se resuelven en
// el backend tras el backfill expediente→disposición (por clave sección/serie/subserie). Las fechas de
// recepción/término de concentración el dominio nuevo no las modela → null. El año sale del último
// segmento de la clave.
function mapFilaInventarioAi(e) {
  const partes = (e.claveClasificacion || '').split('/')
  return {
    id: e.id,
    encabezado_Id: e.encabezadoId,
    seccion: e.seccion,
    serie: e.serie,
    sub_Serie: e.subSerie,
    nombre_Expediente: e.nombreExpediente,
    clave_Clasificacion: e.claveClasificacion,
    no_Expediente_Interno: partes.length > 3 ? partes[3] : null,
    descripcion: e.descripcion,
    area_Responsable: e.areaResponsable,
    area_Responsable_Id: e.areaResponsableId,
    area_Generadora: e.areaGeneradora,
    area_Generadora_Id: e.areaGeneradoraId,
    ubicacion_AI: e.ubicacion,
    ubicacion_Fisica_Id: e.ubicacionFisicaId,
    valor_Documental: e.valorDocumental,
    vigencia_Concentracion: e.vigenciaConcentracion,
    vigencia_Tramite: null,
    vigencia_Completa: null,
    disposicion_Documental: e.destinoFinal,
    fecha_Inicio: e.fechaInicio,
    fecha_Termino: e.fechaTermino,
    fecha_Recepcion_Transferencia_Primaria: null,
    fecha_Termino_Concentracion: null,
    estatus: e.estatus,
    fase: e.fase,
    clasificado: e.clasificado,
    clasificado_Texto: e.clasificado ? 'Clasificado' : 'No clasificado',
    total_Paginas: e.totalPaginas,
    anio: parseInt(partes[partes.length - 1])
  }
}

export const useInventarioAreaAIStore = defineStore('inventarioAreaAI', {
  state: () => ({
    modal: false,
    isEditar: false,
    isLoadingConcentracion: false,
    isLoadingHistorico: false,
    // Auditoría PERF-003: la tabla ya no tiene el acervo completo en memoria -- estas listas son LA PÁGINA
    // que se está mostrando. `total*` es el número de expedientes que cumplen el filtro (lo cuenta el
    // servidor) y es lo que necesita q-table para dibujar el paginador. `consulta*` recuerda el último
    // filtro/página pedidos, para poder recargar tras editar sin devolver al usuario al principio.
    inventariosConcentracion: [],
    totalConcentracion: 0,
    consultaConcentracion: { pagina: 1, tamanoPagina: 25, areaGeneradoraId: null, anio: null, busqueda: null },
    inventariosHistorico: [],
    totalHistorico: 0,
    consultaHistorico: { pagina: 1, tamanoPagina: 25, areaGeneradoraId: null, anio: null, busqueda: null },
    // Horizonte-3 #DF-8: etiqueta QR + escaneo de código.
    modalQr: false,
    qrUrl: null,
    qrClave: null,
    qrNombre: null,
    inventario: {
      id: null,
      seccion: null,
      serie: null,
      sub_Serie: null,
      disposicion_Documental: null,
      nombre_Expediente: null,
      clave_Clasificacion: null,
      no_Expediente_Interno: null,
      descripcion: null,
      fecha_Inicio: null,
      fecha_Termino: null,
      ubicacion_AI: null,
      ubicacion_Fisica_Id: null,
      vigencia_Tramite: null,
      vigencia_Concentracion: null,
      vigencia_Completa: null,
      valor_Documental: null,
      clasificado: false,
      clasificado_Texto: null,
      total_Paginas: null,
      area_Responsable: null,
      area_Generadora: null,
      fecha_Recepcion_Transferencia_Primaria: null,
      fecha_Termino_Concentracion: null
    }
  }),
  actions: {

    initInventario() {
      this.inventario.id = null
      this.inventario.seccion = null
      this.inventario.serie = null
      this.inventario.sub_Serie = null
      this.inventario.disposicion_Documental = null
      this.inventario.nombre_Expediente = null
      this.inventario.clave_Clasificacion = null
      this.inventario.no_Expediente_Interno = null
      this.inventario.descripcion = null
      this.inventario.fecha_Inicio = null
      this.inventario.fecha_Termino = null
      this.inventario.ubicacion_AI = null
      this.inventario.ubicacion_Fisica_Id = null
      this.inventario.vigencia_Tramite = null
      this.inventario.vigencia_Concentracion = null
      this.inventario.vigencia_Completa = null
      this.inventario.valor_Documental = null
      this.inventario.clasificado = false
      this.inventario.clasificado_Texto = null
      this.inventario.total_Paginas = null
      this.inventario.area_Responsable = null
      this.inventario.area_Generadora = null
      this.inventario.fecha_Recepcion_Transferencia_Primaria = null
      this.inventario.fecha_Termino_Concentracion = null
    },

    // Auditoría PERF-003: una PÁGINA del inventario de la fase, con los filtros resueltos en el servidor.
    // Antes se pedía el acervo completo (6.48 MB / 7 622 expedientes en concentración) y se filtraba en
    // memoria; el filtrado en memoria deja de ser viable en cuanto la tabla ya no tiene todo el conjunto.
    async pedirPaginaInventarioAi(fase, consulta) {
      const params = { fase, pagina: consulta.pagina, tamanoPagina: consulta.tamanoPagina }
      if (consulta.areaGeneradoraId) params.areaGeneradoraId = consulta.areaGeneradoraId
      if (consulta.anio) params.anio = consulta.anio
      if (consulta.busqueda) params.busqueda = consulta.busqueda
      const resp = await api.get('/expedientes/inventario-ai', { params })
      if (resp.status != 200 || !resp.data || !Array.isArray(resp.data.items)) {
        return null
      }
      return { filas: resp.data.items.map(mapFilaInventarioAi), total: resp.data.total }
    },

    // MIGRADO al backend nuevo (corte de clientes): GET /api/expedientes/inventario-ai?fase=Concentracion
    // (ámbito global -> todas las áreas; usuario de área -> la suya) con nombres resueltos + ubicación física.
    async loadInventariosConcentracion(consulta) {
      try {
        this.isLoadingConcentracion = true
        if (consulta) this.consultaConcentracion = { ...this.consultaConcentracion, ...consulta }
        const pagina = await this.pedirPaginaInventarioAi('Concentracion', this.consultaConcentracion)
        this.isLoadingConcentracion = false
        if (!pagina) {
          return { success: false, data: "Respuesta inesperada del servidor." }
        }
        this.inventariosConcentracion = pagina.filas
        this.totalConcentracion = pagina.total
        return { success: true }
      } catch (e) {
        this.isLoadingConcentracion = false
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo (corte de clientes): GET /api/expedientes/inventario-ai?fase=Historico.
    async loadInventariosHistorico(consulta) {
      try {
        this.isLoadingHistorico = true
        if (consulta) this.consultaHistorico = { ...this.consultaHistorico, ...consulta }
        const pagina = await this.pedirPaginaInventarioAi('Historico', this.consultaHistorico)
        this.isLoadingHistorico = false
        if (!pagina) {
          return { success: false, data: "Respuesta inesperada del servidor." }
        }
        this.inventariosHistorico = pagina.filas
        this.totalHistorico = pagina.total
        return { success: true }
      } catch (e) {
        this.isLoadingHistorico = false
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // Años con expedientes en la fase (GET .../inventario-ai/anios). Antes el desplegable se rellenaba con
    // TODOS los años de 1992 a hoy, ofreciera o no resultados.
    async loadAniosInventario(fase) {
      try {
        const resp = await api.get('/expedientes/inventario-ai/anios', { params: { fase } })
        if (resp.status == 200 && Array.isArray(resp.data)) {
          return { success: true, data: resp.data }
        }
        return { success: false, data: [] }
      } catch (e) {
        console.error(e)
        return { success: false, data: [] }
      }
    },

    // El listado a Excel debe seguir exportando TODO lo que cumple el filtro, no solo la página visible:
    // se recorren las páginas del servidor con el mismo filtro. El tope por página es el máximo que admite
    // la API (200), así que son pocas peticiones incluso para el área más grande.
    async descargarInventarioAiCompleto(fase, consulta) {
      try {
        const filas = []
        for (let pagina = 1; ; pagina++) {
          const resp = await this.pedirPaginaInventarioAi(fase, { ...consulta, pagina, tamanoPagina: 200 })
          if (!resp) {
            return { success: false, data: "Respuesta inesperada del servidor." }
          }
          filas.push(...resp.filas)
          if (filas.length >= resp.total || resp.filas.length === 0) break
        }
        return { success: true, data: filas }
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo (corte de clientes): el backend nuevo NO expone GET-por-id; el expediente
    // se toma del listado ya cargado (concentración o histórico) buscando por id (edit-from-list). Se usa
    // para abrir el modal de editar ubicación física.
    async loadInventario(id) {
      try {
        this.initInventario()
        const encontrado = (this.inventariosConcentracion || []).find(x => x.id == id)
          || (this.inventariosHistorico || []).find(x => x.id == id)
        if (encontrado) {
          this.inventario = { ...this.inventario, ...encontrado }
          return { success: true }
        }
        return { success: false, data: "No se encontró el expediente en el listado." }
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo: PATCH /api/expedientes/{id}/ubicacion { ubicacion } -> 204. Solo aplica a
    // expedientes en concentración/histórico (lo valida el dominio). Recarga ambas vistas al terminar.
    async updateUbicacion(id, ubicacion) {
      try {
        const resp = await api.patch(`/expedientes/${id}/ubicacion`, { ubicacion: ubicacion || null })
        if (resp.status === 204 || resp.status === 200) {
          this.loadInventariosConcentracion()
          this.loadInventariosHistorico()
          return { success: true, data: "Ubicación actualizada con éxito" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    // Horizonte-2 #ES-16: PATCH /api/expedientes/{id}/ubicacion-fisica { ubicacionFisicaId } -> 204.
    // Vínculo estructurado adicional al texto libre de arriba (updateUbicacion), que se conserva.
    async updateUbicacionFisica(id, ubicacionFisicaId) {
      try {
        const resp = await api.patch(`/expedientes/${id}/ubicacion-fisica`, { ubicacionFisicaId: ubicacionFisicaId || null })
        if (resp.status === 204 || resp.status === 200) {
          this.loadInventariosConcentracion()
          this.loadInventariosHistorico()
          return { success: true, data: "Ubicación física actualizada con éxito" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    actualizarModal(valor) {
      this.modal = valor
    },

    // Horizonte-3 #DF-8: etiqueta QR del expediente (identificador opaco). Revoca la URL de blob
    // anterior antes de generar una nueva, para no acumular objetos sin liberar en la sesión.
    async obtenerQr(id, clave, nombre) {
      try {
        const resp = await api.get(`/expedientes/${id}/qr`, { responseType: 'blob' })
        if (resp.status === 200) {
          if (this.qrUrl) window.URL.revokeObjectURL(this.qrUrl)
          const blob = new window.Blob([resp.data], { type: 'image/png' })
          this.qrUrl = window.URL.createObjectURL(blob)
          this.qrClave = clave
          this.qrNombre = nombre
          this.modalQr = true
          return { success: true }
        }
        return { success: false, data: "No se pudo generar el código QR." }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    actualizarModalQr(valor) {
      this.modalQr = valor
    },

    // Horizonte-3 #DF-8: resuelve un código escaneado (lectora física o entrada manual) al expediente
    // correspondiente. GET /api/expedientes/resolver-codigo?codigo=... (aislado por área en el backend).
    async resolverCodigo(codigo) {
      try {
        const resp = await api.get('/expedientes/resolver-codigo', { params: { codigo } })
        if (resp.status === 200) {
          return { success: true, data: resp.data }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (e) {
        return { success: false, data: mensajeError(e) }
      }
    },

    // Horizonte-3 #DF-8: prepara el editor de ubicación física existente (ModalComp) desde un código
    // escaneado. Carga primero la lista de la fase correspondiente (si aún no está en memoria) para que
    // `inventario` quede con TODOS sus datos -- en particular la ubicación de texto libre ya existente --
    // antes de abrir el modal; sin esto, "Guardar ubicación" la sobreescribiría con null (loadInventario
    // solo busca en las listas ya cargadas, no expone un GET-por-id).
    async prepararEdicionDesdeCodigo(resuelto) {
      if (resuelto.fase === 'Concentracion') {
        if (this.inventariosConcentracion.length === 0) await this.loadInventariosConcentracion()
      } else if (resuelto.fase === 'Historico') {
        if (this.inventariosHistorico.length === 0) await this.loadInventariosHistorico()
      } else {
        return { success: false, data: "Este expediente está en trámite; la ubicación física estructurada solo aplica en concentración o histórico." }
      }
      const resultado = await this.loadInventario(resuelto.id)
      if (!resultado.success) return resultado
      this.actualizarModal(true)
      return { success: true }
    },

  },
});
