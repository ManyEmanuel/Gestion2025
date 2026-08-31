import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

// Auditoría P2: búsqueda global de expedientes. Antes, para llegar a uno de los 11 733 expedientes había
// que saber de antemano su área y su año y navegar hasta el encabezado. Esto busca por lo único que la
// gente recuerda —nombre, clave o descripción— en todas las fases y de una vez.
//
// El ámbito lo resuelve el servidor: un usuario de área solo encuentra lo suyo.

/// La API devuelve una página; se mapea a la forma que consume la tabla.
function mapResultado(r) {
  return {
    id: r.id,
    encabezado_Id: r.encabezadoId,
    anio: r.anio,
    clave_Clasificacion: r.claveClasificacion,
    nombre_Expediente: r.nombreExpediente,
    descripcion: r.descripcion,
    seccion: r.seccion,
    serie: r.serie,
    sub_Serie: r.subSerie,
    area_Generadora: r.areaGeneradora,
    area_Generadora_Id: r.areaGeneradoraId,
    fase: r.fase,
    estatus: r.estatus,
    clasificado: r.clasificado,
    clasificado_Texto: r.clasificado ? 'Clasificado' : 'Público',
  }
}

export const useBusquedaStore = defineStore('Busqueda', {
  state: () => ({
    cargando: false,
    // `resultados` es LA PÁGINA visible; `total` los expedientes que coinciden (lo cuenta el servidor).
    resultados: [],
    total: 0,
    consulta: { texto: '', pagina: 1, tamanoPagina: 25 },
    // Se distingue "todavía no se ha buscado nada" de "se buscó y no hubo resultados": la tabla dice
    // cosas distintas en cada caso.
    seHaBuscado: false,
  }),
  actions: {
    async buscar(consulta) {
      try {
        this.cargando = true
        if (consulta) this.consulta = { ...this.consulta, ...consulta }

        const texto = (this.consulta.texto || '').trim()
        if (texto.length < 2) {
          // Mismo mínimo que valida el backend; se comprueba aquí para no gastar una petición ni mostrar
          // un error del servidor por algo que el cliente ya sabe.
          this.cargando = false
          this.resultados = []
          this.total = 0
          this.seHaBuscado = false
          return { success: false, data: 'Escriba al menos 2 caracteres para buscar.' }
        }

        const resp = await api.get('/expedientes/buscar', {
          params: { texto, pagina: this.consulta.pagina, tamanoPagina: this.consulta.tamanoPagina }
        })
        this.cargando = false

        if (resp.status !== 200 || !resp.data || !Array.isArray(resp.data.items)) {
          return { success: false, data: 'Respuesta inesperada del servidor.' }
        }

        this.resultados = resp.data.items.map(mapResultado)
        this.total = resp.data.total
        this.seHaBuscado = true
        return { success: true }
      } catch (e) {
        this.cargando = false
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    limpiar() {
      this.resultados = []
      this.total = 0
      this.consulta = { texto: '', pagina: 1, tamanoPagina: 25 }
      this.seHaBuscado = false
    },
  },
});
