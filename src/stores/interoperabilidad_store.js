import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { descargarReporte } from 'src/helpers/descargar_reporte';

const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

// Export interoperable de los instrumentos hacia el Registro Estatal (LGA 78-81 / Nay 60-61).
// Cada export es un envelope { esquema, version, generadoEn, datos }.
export const useInteroperabilidadStore = defineStore('InteroperabilidadStore', {
  state: () => ({
    indice: [],
    documento: null,   // envelope del export visualizado
    esquemaActual: null,
  }),
  actions: {
    async loadIndice() {
      try {
        const resp = await api.get('/interoperabilidad')
        if (resp.status === 200 && Array.isArray(resp.data)) {
          this.indice = resp.data
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    // Carga un export para visualizarlo. ruta relativa (sin /interoperabilidad).
    async verExport(subruta, esquema) {
      try {
        this.documento = null
        this.esquemaActual = esquema
        const resp = await api.get(`/interoperabilidad/${subruta}`)
        if (resp.status === 200) {
          this.documento = resp.data
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    async descargarExport(subruta, nombre) {
      return await descargarReporte(`/interoperabilidad/${subruta}`, nombre)
    },
  },
});
