import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { descargarReporte } from 'src/helpers/descargar_reporte';

const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

// Horizonte-2 #ES-11: candidatos a baja (vigencia total prescrita, no clasificados).
export const useCandidatosBajaStore = defineStore('CandidatosBajaStore', {
  state: () => ({
    candidatos: [],
  }),
  actions: {
    async loadCandidatos() {
      try {
        this.candidatos = []
        const resp = await api.get('/expedientes/candidatos-baja')
        if (resp.status === 200 && Array.isArray(resp.data)) {
          this.candidatos = resp.data
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    async descargarBorradorDictamen() {
      return await descargarReporte('/reportes/borrador-dictamen-baja', 'Borrador_Dictamen_Baja.pdf')
    },
  },
});
