import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

// Preservación digital de adjuntos (LGA 42-43 / Nay 41-42): política de formatos, verificación de
// integridad, migración de formato y reporte de estado.
export const usePreservacionStore = defineStore('PreservacionStore', {
  state: () => ({
    politica: { formatosAceptados: [] },
    estado: null,
    acciones: [],
  }),
  actions: {
    async loadPolitica() {
      try {
        const resp = await api.get('/preservacion/politica')
        if (resp.status === 200) { this.politica = resp.data; return { success: true } }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) { console.error(e); return { success: false, data: mensajeError(e) } }
    },

    async loadEstado() {
      try {
        const resp = await api.get('/preservacion/estado')
        if (resp.status === 200) { this.estado = resp.data; return { success: true } }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) { console.error(e); return { success: false, data: mensajeError(e) } }
    },

    async verificarIntegridad(adjuntoId) {
      try {
        const resp = await api.post(`/preservacion/adjuntos/${adjuntoId}/verificar-integridad`)
        if (resp.status === 200) { return { success: true, data: resp.data } }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo." }
      } catch (e) { console.error(e); return { success: false, data: mensajeError(e) } }
    },

    async migrarFormato(adjuntoId, nuevoFormato, observaciones) {
      try {
        const resp = await api.post(`/preservacion/adjuntos/${adjuntoId}/migrar-formato`, { nuevoFormato, observaciones })
        if (resp.status === 204 || resp.status === 200) { return { success: true, data: "Migración registrada" } }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo." }
      } catch (e) { console.error(e); return { success: false, data: mensajeError(e) } }
    },

    async loadAcciones(adjuntoId) {
      try {
        this.acciones = []
        const resp = await api.get(`/preservacion/adjuntos/${adjuntoId}/acciones`)
        if (resp.status === 200 && Array.isArray(resp.data)) { this.acciones = resp.data; return { success: true } }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) { console.error(e); return { success: false, data: mensajeError(e) } }
    },
  },
});
