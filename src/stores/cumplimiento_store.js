import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

// Auditoría P3: panel de estado de cumplimiento para visitas del Órgano Interno de Control.
// Solo lectura. El servidor devuelve, por cada obligación, su fundamento legal, su estado y la CIFRA que
// lo sostiene; el cliente no calcula nada, solo lo presenta.
const ESTADOS = {
  1: { texto: 'Cumple', color: 'green-8', icono: 'check_circle' },
  2: { texto: 'Parcial', color: 'orange-9', icono: 'error_outline' },
  3: { texto: 'No cumple', color: 'red-9', icono: 'cancel' },
}

export const useCumplimientoStore = defineStore('Cumplimiento', {
  state: () => ({
    cargando: false,
    requisitos: [],
  }),

  getters: {
    // Resumen para encabezar la pantalla: cuántos de cada estado.
    resumen: (state) => ({
      cumple: state.requisitos.filter((r) => r.estado === 1).length,
      parcial: state.requisitos.filter((r) => r.estado === 2).length,
      noCumple: state.requisitos.filter((r) => r.estado === 3).length,
      total: state.requisitos.length,
    }),
  },

  actions: {
    async loadPanel() {
      try {
        this.cargando = true
        const resp = await api.get('/cumplimiento/panel')
        this.cargando = false

        if (resp.status !== 200 || !Array.isArray(resp.data)) {
          return { success: false, data: 'Respuesta inesperada del servidor.' }
        }

        this.requisitos = resp.data.map((r) => ({
          ...r,
          // Lo que no cumple va primero: es lo que la visita va a preguntar.
          orden: r.estado === 3 ? 0 : r.estado === 2 ? 1 : 2,
          ...(ESTADOS[r.estado] || ESTADOS[3]),
        })).sort((a, b) => a.orden - b.orden)

        return { success: true }
      } catch (e) {
        this.cargando = false
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },
  },
});
