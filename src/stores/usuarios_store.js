import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

// Administración de usuarios de acceso (issue #40). Permiso archivo.administracion.usuarios.*.
export const useUsuariosStore = defineStore('UsuariosAdmin', {
  state: () => ({
    usuarios: [],
    perfiles: [],
    empleados: [],
  }),

  actions: {

    // GET /api/usuarios -> lista con perfil y empleado resueltos.
    async loadAdmin() {
      try {
        this.usuarios = []
        const resp = await api.get('/usuarios')
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.usuarios = resp.data
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },

    // GET /api/usuarios/perfiles -> selector ({label, value}).
    async loadPerfiles() {
      try {
        const resp = await api.get('/usuarios/perfiles')
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.perfiles = resp.data.map((p) => ({ label: p.nombre, value: p.id }))
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },

    // GET /api/empleados -> selector para ligar el usuario a un empleado.
    async loadEmpleados() {
      try {
        const resp = await api.get('/empleados')
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.empleados = resp.data.map((e) => ({ label: e.nombreCompleto, value: e.id }))
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },

    // POST /api/usuarios -> { id, passwordTemporal }. Devuelve la temporal para mostrarla UNA vez.
    async crear(u) {
      try {
        const resp = await api.post('/usuarios', {
          userName: u.userName,
          correo: u.correo || null,
          empleadoId: u.empleadoId || null,
          perfilId: u.perfilId || null,
        })
        if (resp.status === 201 || resp.status === 200) {
          await this.loadAdmin()
          return { success: true, data: "Usuario creado con éxito", passwordTemporal: resp.data && resp.data.passwordTemporal }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },

    // PUT /api/usuarios/{id} (204).
    async actualizar(id, u) {
      try {
        const resp = await api.put(`/usuarios/${id}`, {
          correo: u.correo || null,
          empleadoId: u.empleadoId || null,
          perfilId: u.perfilId || null,
        })
        if (resp.status === 204 || resp.status === 200) {
          await this.loadAdmin()
          return { success: true, data: "Usuario actualizado con éxito" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },

    // PATCH /api/usuarios/{id}/estado (204).
    async cambiarEstado(id, activo) {
      try {
        const resp = await api.patch(`/usuarios/${id}/estado`, { activo })
        if (resp.status === 204 || resp.status === 200) {
          await this.loadAdmin()
          return { success: true, data: activo ? "Usuario activado" : "Usuario desactivado" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },

    // POST /api/usuarios/{id}/reset-password -> { passwordTemporal }. Devuelve la temporal para mostrarla.
    async resetPassword(id) {
      try {
        const resp = await api.post(`/usuarios/${id}/reset-password`)
        if (resp.status === 200 || resp.status === 201) {
          await this.loadAdmin()
          return { success: true, data: "Contraseña reseteada", passwordTemporal: resp.data && resp.data.passwordTemporal }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },
  },
});
