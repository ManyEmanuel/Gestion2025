import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { descargarReporte } from 'src/helpers/descargar_reporte';

const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

// Avisos al Archivo General por transferencia secundaria (LGA 59 / Nay 57): plazo de 45 días.
export const useAvisosStore = defineStore('AvisosStore', {
  state: () => ({
    avisos: [],
    soloPendientes: true,
  }),
  actions: {
    async loadAvisos() {
      try {
        this.avisos = []
        const resp = await api.get(`/avisostransferencia?soloPendientes=${this.soloPendientes}`)
        if (resp.status === 200 && Array.isArray(resp.data)) {
          this.avisos = resp.data
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    async marcarEnviado(id, acuse) {
      try {
        const resp = await api.post(`/avisostransferencia/${id}/marcar-enviado`, { acuse })
        if (resp.status === 204 || resp.status === 200) {
          return { success: true, data: "Aviso marcado como enviado" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo." }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    async exportarAviso(id) {
      return await descargarReporte(`/avisostransferencia/${id}/export`, `Aviso_${id}.pdf`)
    },
  },
});
