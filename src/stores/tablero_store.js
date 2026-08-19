import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

// Horizonte-2 #QW-5: tablero único de vencimientos, agrega 5 cálculos ya existentes y dispersos.
export const useTableroStore = defineStore('TableroStore', {
  state: () => ({
    items: [],
  }),
  actions: {
    async loadVencimientos() {
      try {
        this.items = []
        const resp = await api.get('/tablero/vencimientos')
        if (resp.status === 200 && Array.isArray(resp.data)) {
          this.items = resp.data
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },
  },
});
