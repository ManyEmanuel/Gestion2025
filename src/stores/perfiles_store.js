import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

// Administración de perfiles (roles) y permisos (issue #41). Permiso archivo.administracion.perfiles.*.
export const usePerfilesStore = defineStore('PerfilesAdmin', {
  state: () => ({
    perfiles: [],
    permisos: [], // catálogo crudo: { id, clave, descripcion }
  }),

  actions: {

    // GET /api/perfiles -> perfiles con sus permisoIds.
    async loadAdmin() {
      try {
        this.perfiles = []
        const resp = await api.get('/perfiles')
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.perfiles = resp.data
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },

    // GET /api/perfiles/permisos -> catálogo completo de permisos.
    async loadPermisos() {
      try {
        const resp = await api.get('/perfiles/permisos')
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.permisos = resp.data
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },

    // POST /api/perfiles (201 { id }).
    async crear(p) {
      try {
        const resp = await api.post('/perfiles', {
          nombre: p.nombre,
          descripcion: p.descripcion || null,
          permisoIds: p.permisoIds || null,
        })
        if (resp.status === 201 || resp.status === 200) {
          await this.loadAdmin()
          return { success: true, data: "Perfil creado con éxito", id: resp.data && resp.data.id }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },

    // PUT /api/perfiles/{id} (204).
    async actualizar(id, p) {
      try {
        const resp = await api.put(`/perfiles/${id}`, { nombre: p.nombre, descripcion: p.descripcion || null })
        if (resp.status === 204 || resp.status === 200) {
          await this.loadAdmin()
          return { success: true, data: "Perfil actualizado con éxito" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },

    // PUT /api/perfiles/{id}/permisos (204). Reemplaza el conjunto de permisos del perfil.
    async asignarPermisos(id, permisoIds) {
      try {
        const resp = await api.put(`/perfiles/${id}/permisos`, { permisoIds })
        if (resp.status === 204 || resp.status === 200) {
          await this.loadAdmin()
          return { success: true, data: "Permisos actualizados" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },

    // DELETE /api/perfiles/{id} (204). El backend rechaza si el perfil tiene usuarios.
    async eliminar(id) {
      try {
        const resp = await api.delete(`/perfiles/${id}`)
        if (resp.status === 204 || resp.status === 200) {
          await this.loadAdmin()
          return { success: true, data: "Perfil eliminado con éxito" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },
  },
});
