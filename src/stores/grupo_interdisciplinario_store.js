import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto
const ok = (resp) => resp.status === 200 || resp.status === 201 || resp.status === 204

// Grupo interdisciplinario que apoya la valoración (LGA 50-52 / Nay 48-50).
export const useGrupoStore = defineStore('GrupoStore', {
  state: () => ({
    grupos: [],
    grupo: null,      // detalle con integrantes
    sesiones: [],
    sesion: null,     // detalle con acuerdos
    disposiciones: [],
  }),
  actions: {
    // ---------- Grupos ----------
    async loadGrupos() {
      try {
        this.grupos = []
        const resp = await api.get('/gruposinterdisciplinarios')
        if (resp.status === 200 && Array.isArray(resp.data)) { this.grupos = resp.data; return { success: true } }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) { console.error(e); return { success: false, data: mensajeError(e) } }
    },
    async getGrupo(id) {
      try { const resp = await api.get(`/gruposinterdisciplinarios/${id}`)
        if (resp.status === 200) { this.grupo = resp.data; return { success: true, data: resp.data } }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) { console.error(e); return { success: false, data: mensajeError(e) } }
    },
    async crearGrupo(g) {
      try { const resp = await api.post('/gruposinterdisciplinarios', { nombre: g.nombre, vigenciaDesde: g.vigenciaDesde, vigenciaHasta: g.vigenciaHasta || null, descripcion: g.descripcion })
        return ok(resp) ? { success: true, data: "Grupo registrado" } : { success: false, data: "Error" }
      } catch (e) { return { success: false, data: mensajeError(e) } }
    },
    async actualizarGrupo(id, g) {
      try { const resp = await api.put(`/gruposinterdisciplinarios/${id}`, { nombre: g.nombre, vigenciaDesde: g.vigenciaDesde, vigenciaHasta: g.vigenciaHasta || null, descripcion: g.descripcion })
        return ok(resp) ? { success: true, data: "Grupo actualizado" } : { success: false, data: "Error" }
      } catch (e) { return { success: false, data: mensajeError(e) } }
    },
    async eliminarGrupo(id) {
      try { const resp = await api.delete(`/gruposinterdisciplinarios/${id}`)
        return ok(resp) ? { success: true, data: "Grupo eliminado" } : { success: false, data: "Error" }
      } catch (e) { return { success: false, data: mensajeError(e) } }
    },
    async agregarIntegrante(id, i) {
      try { const resp = await api.post(`/gruposinterdisciplinarios/${id}/integrantes`, { nombre: i.nombre, rol: i.rol, areaId: i.areaId || null })
        return ok(resp) ? { success: true, data: "Integrante agregado" } : { success: false, data: "Error" }
      } catch (e) { return { success: false, data: mensajeError(e) } }
    },
    async eliminarIntegrante(id, integranteId) {
      try { const resp = await api.delete(`/gruposinterdisciplinarios/${id}/integrantes/${integranteId}`)
        return ok(resp) ? { success: true, data: "Integrante eliminado" } : { success: false, data: "Error" }
      } catch (e) { return { success: false, data: mensajeError(e) } }
    },

    // ---------- Sesiones ----------
    async loadSesiones(grupoId) {
      try { this.sesiones = []
        const resp = await api.get(`/sesionesgrupo/por-grupo/${grupoId}`)
        if (resp.status === 200 && Array.isArray(resp.data)) { this.sesiones = resp.data; return { success: true } }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) { console.error(e); return { success: false, data: mensajeError(e) } }
    },
    async getSesion(id) {
      try { const resp = await api.get(`/sesionesgrupo/${id}`)
        if (resp.status === 200) { this.sesion = resp.data; return { success: true, data: resp.data } }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) { console.error(e); return { success: false, data: mensajeError(e) } }
    },
    async crearSesion(s) {
      try { const resp = await api.post('/sesionesgrupo', { grupoId: s.grupoId, fecha: s.fecha, ordenDelDia: s.ordenDelDia, minuta: s.minuta })
        return ok(resp) ? { success: true, data: "Sesión registrada" } : { success: false, data: "Error" }
      } catch (e) { return { success: false, data: mensajeError(e) } }
    },
    async actualizarSesion(id, s) {
      try { const resp = await api.put(`/sesionesgrupo/${id}`, { fecha: s.fecha, ordenDelDia: s.ordenDelDia, minuta: s.minuta })
        return ok(resp) ? { success: true, data: "Sesión actualizada" } : { success: false, data: "Error" }
      } catch (e) { return { success: false, data: mensajeError(e) } }
    },
    async eliminarSesion(id) {
      try { const resp = await api.delete(`/sesionesgrupo/${id}`)
        return ok(resp) ? { success: true, data: "Sesión eliminada" } : { success: false, data: "Error" }
      } catch (e) { return { success: false, data: mensajeError(e) } }
    },
    async agregarAcuerdo(sesionId, a) {
      try { const resp = await api.post(`/sesionesgrupo/${sesionId}/acuerdos`, { descripcion: a.descripcion, fichaTecnicaValoracionId: a.fichaTecnicaValoracionId || null, disposicionDocumentalId: a.disposicionDocumentalId || null })
        return ok(resp) ? { success: true, data: "Acuerdo agregado" } : { success: false, data: "Error" }
      } catch (e) { return { success: false, data: mensajeError(e) } }
    },
    async eliminarAcuerdo(sesionId, acuerdoId) {
      try { const resp = await api.delete(`/sesionesgrupo/${sesionId}/acuerdos/${acuerdoId}`)
        return ok(resp) ? { success: true, data: "Acuerdo eliminado" } : { success: false, data: "Error" }
      } catch (e) { return { success: false, data: mensajeError(e) } }
    },

    // ---------- Apoyo: disposiciones para vincular acuerdos ----------
    async loadDisposiciones() {
      try { const resp = await api.get('/disposiciones')
        if (resp.status === 200 && Array.isArray(resp.data)) {
          this.disposiciones = resp.data.map((d) => ({
            label: `${d.serieClave || ''}${d.subSerieClave ? '.' + d.subSerieClave : ''} — ${d.nombre || d.valorDocumental || ''}`,
            value: d.id
          }))
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) { console.error(e); return { success: false, data: mensajeError(e) } }
    },
  },
});
