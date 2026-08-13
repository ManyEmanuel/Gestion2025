import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

const ok = (resp) => resp.status === 200 || resp.status === 201 || resp.status === 204

// Programa Anual de Desarrollo Archivístico (PADA) e informe anual (LGA 23-26 / Nay 22-25).
export const usePadaStore = defineStore('PadaStore', {
  state: () => ({
    programas: [],
    informes: [],
    programa: null,   // detalle con actividades
  }),
  actions: {
    // ---------- Programas ----------
    async loadProgramas() {
      try {
        this.programas = []
        const resp = await api.get('/programasanuales')
        if (resp.status === 200 && Array.isArray(resp.data)) { this.programas = resp.data; return { success: true } }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) { console.error(e); return { success: false, data: mensajeError(e) } }
    },
    async getPrograma(id) {
      try {
        const resp = await api.get(`/programasanuales/${id}`)
        if (resp.status === 200) { this.programa = resp.data; return { success: true, data: resp.data } }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) { console.error(e); return { success: false, data: mensajeError(e) } }
    },
    async crearPrograma(p) {
      try { const resp = await api.post('/programasanuales', { anio: Number(p.anio), objetivos: p.objetivos, alcance: p.alcance })
        return ok(resp) ? { success: true, data: "Programa registrado" } : { success: false, data: "Error" }
      } catch (e) { return { success: false, data: mensajeError(e) } }
    },
    async actualizarPrograma(id, p) {
      try { const resp = await api.put(`/programasanuales/${id}`, { anio: Number(p.anio), objetivos: p.objetivos, alcance: p.alcance })
        return ok(resp) ? { success: true, data: "Programa actualizado" } : { success: false, data: "Error" }
      } catch (e) { return { success: false, data: mensajeError(e) } }
    },
    async agregarActividad(id, a) {
      try { const resp = await api.post(`/programasanuales/${id}/actividades`, {
        descripcion: a.descripcion, responsable: a.responsable, fechaInicio: a.fechaInicio || null,
        fechaFin: a.fechaFin || null, estatus: Number(a.estatus) })
        return ok(resp) ? { success: true, data: "Actividad agregada" } : { success: false, data: "Error" }
      } catch (e) { return { success: false, data: mensajeError(e) } }
    },
    async eliminarActividad(id, actividadId) {
      try { const resp = await api.delete(`/programasanuales/${id}/actividades/${actividadId}`)
        return ok(resp) ? { success: true, data: "Actividad eliminada" } : { success: false, data: "Error" }
      } catch (e) { return { success: false, data: mensajeError(e) } }
    },
    async aprobarPrograma(id) {
      try { const resp = await api.post(`/programasanuales/${id}/aprobar`)
        return ok(resp) ? { success: true, data: "Programa aprobado" } : { success: false, data: "Error" }
      } catch (e) { return { success: false, data: mensajeError(e) } }
    },
    async publicarPrograma(id, url) {
      try { const resp = await api.post(`/programasanuales/${id}/publicar`, { url })
        return ok(resp) ? { success: true, data: "Programa publicado" } : { success: false, data: "Error" }
      } catch (e) { return { success: false, data: mensajeError(e) } }
    },

    // ---------- Informes ----------
    async loadInformes() {
      try {
        this.informes = []
        const resp = await api.get('/informesanuales')
        if (resp.status === 200 && Array.isArray(resp.data)) { this.informes = resp.data; return { success: true } }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) { console.error(e); return { success: false, data: mensajeError(e) } }
    },
    async crearInforme(i) {
      try { const resp = await api.post('/informesanuales', { anio: Number(i.anio), programaAnualId: i.programaAnualId,
        resultados: i.resultados, porcentajeCumplimiento: i.porcentajeCumplimiento != null ? Number(i.porcentajeCumplimiento) : null,
        observaciones: i.observaciones })
        return ok(resp) ? { success: true, data: "Informe registrado" } : { success: false, data: "Error" }
      } catch (e) { return { success: false, data: mensajeError(e) } }
    },
    async actualizarInforme(id, i) {
      try { const resp = await api.put(`/informesanuales/${id}`, { anio: Number(i.anio), resultados: i.resultados,
        porcentajeCumplimiento: i.porcentajeCumplimiento != null ? Number(i.porcentajeCumplimiento) : null, observaciones: i.observaciones })
        return ok(resp) ? { success: true, data: "Informe actualizado" } : { success: false, data: "Error" }
      } catch (e) { return { success: false, data: mensajeError(e) } }
    },
    async aprobarInforme(id) {
      try { const resp = await api.post(`/informesanuales/${id}/aprobar`)
        return ok(resp) ? { success: true, data: "Informe aprobado" } : { success: false, data: "Error" }
      } catch (e) { return { success: false, data: mensajeError(e) } }
    },
    async publicarInforme(id, url) {
      try { const resp = await api.post(`/informesanuales/${id}/publicar`, { url })
        return ok(resp) ? { success: true, data: "Informe publicado" } : { success: false, data: "Error" }
      } catch (e) { return { success: false, data: mensajeError(e) } }
    },
  },
});
