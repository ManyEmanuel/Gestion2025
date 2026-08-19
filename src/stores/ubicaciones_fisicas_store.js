import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

// Horizonte-2 #ES-16: catálogo estructurado de ubicación física (Edificio > Almacén > Estante > Anaquel).
export const useUbicacionesFisicasStore = defineStore('UbicacionesFisicasStore', {
  state: () => ({
    arbol: [],
  }),
  actions: {
    async loadArbol() {
      try {
        this.arbol = []
        const resp = await api.get('/ubicacionesfisicas')
        if (resp.status === 200 && Array.isArray(resp.data)) {
          this.arbol = resp.data
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    async crear(padreId, nivel, nombre) {
      try {
        const resp = await api.post('/ubicacionesfisicas', { padreId, nivel, nombre })
        if (resp.status === 201) {
          return { success: true, data: "Ubicación creada", id: resp.data && resp.data.id }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo." }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    async renombrar(id, nombre) {
      try {
        const resp = await api.put(`/ubicacionesfisicas/${id}/renombrar`, { nombre })
        if (resp.status === 204 || resp.status === 200) {
          return { success: true, data: "Ubicación renombrada" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo." }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    async desactivar(id) {
      try {
        const resp = await api.post(`/ubicacionesfisicas/${id}/desactivar`)
        if (resp.status === 204 || resp.status === 200) {
          return { success: true, data: "Ubicación desactivada" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo." }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },
  },
});
