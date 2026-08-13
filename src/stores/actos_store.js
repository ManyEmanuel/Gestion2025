import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { descargarReporte } from 'src/helpers/descargar_reporte';

const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto
const ok = (resp) => resp.status === 200 || resp.status === 201 || resp.status === 204

// Rutas por tipo de proceso ('baja' | 'secundaria').
const BASE = { baja: 'bajasdocumentales', secundaria: 'transferenciassecundarias' }
const REPORTE = { baja: 'baja', secundaria: 'transferencia-secundaria' }

// Actos de disposición (dictamen/acta) del ciclo: crear → firmar → publicar, + verificación de firma
// (LGA 48-49, 58 / Nay 46, 56). Reutilizable para baja documental y transferencia secundaria.
export const useActosStore = defineStore('ActosStore', {
  state: () => ({
    actos: [],
    verificacion: null,
  }),
  actions: {
    async loadActos(proceso, procesoId) {
      try {
        this.actos = []
        const resp = await api.get(`/${BASE[proceso]}/${procesoId}/actos`)
        if (resp.status === 200 && Array.isArray(resp.data)) { this.actos = resp.data; return { success: true } }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) { console.error(e); return { success: false, data: mensajeError(e) } }
    },

    async crearActo(proceso, procesoId, tipo, body) {
      // tipo: 'dictamen' | 'acta' (acta solo en baja).
      try {
        const resp = await api.post(`/${BASE[proceso]}/${procesoId}/${tipo}`, {
          folio: body.folio, fundamentoLegal: body.fundamentoLegal, firmantes: body.firmantes || null
        })
        return ok(resp) ? { success: true, data: `${tipo === 'acta' ? 'Acta' : 'Dictamen'} registrado` } : { success: false, data: "Error" }
      } catch (e) { return { success: false, data: mensajeError(e) } }
    },

    async firmar(proceso, procesoId, actoId) {
      try { const resp = await api.post(`/${BASE[proceso]}/${procesoId}/actos/${actoId}/firmar`)
        return ok(resp) ? { success: true, data: "Acto firmado" } : { success: false, data: "Error" }
      } catch (e) { return { success: false, data: mensajeError(e) } }
    },

    async publicar(proceso, procesoId, actoId, url) {
      try { const resp = await api.post(`/${BASE[proceso]}/${procesoId}/actos/${actoId}/publicar`, { urlPublicacion: url })
        return ok(resp) ? { success: true, data: "Acto publicado" } : { success: false, data: "Error" }
      } catch (e) { return { success: false, data: mensajeError(e) } }
    },

    async verificarFirma(actoId) {
      try {
        this.verificacion = null
        const resp = await api.get(`/actosdisposicion/${actoId}/verificar-firma`)
        if (resp.status === 200) { this.verificacion = resp.data; return { success: true, data: resp.data } }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) { console.error(e); return { success: false, data: mensajeError(e) } }
    },

    async descargarPdf(proceso, procesoId, tipo) {
      return await descargarReporte(`/reportes/${REPORTE[proceso]}/${procesoId}/${tipo}`, `${tipo}_${procesoId}.pdf`)
    },
  },
});
