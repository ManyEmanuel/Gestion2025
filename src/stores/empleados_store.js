import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

// Corte al backend nuevo: las escrituras REST responden 201/204 y problem+json en error (axios lanza).
const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

// Administración de empleados (issue #39). Permiso archivo.administracion.empleados.*.
export const useEmpleadosStore = defineStore('EmpleadosAdmin', {
  state: () => ({
    empleadosAdmin: [],
    puestos: [],
  }),

  actions: {

    // GET /api/empleados/admin -> lista con área y puesto resueltos.
    async loadAdmin() {
      try {
        this.empleadosAdmin = []
        const resp = await api.get('/empleados/admin')
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.empleadosAdmin = resp.data
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },

    // GET /api/empleados/puestos -> catálogo para el selector ({label, value}).
    async loadPuestos() {
      try {
        const resp = await api.get('/empleados/puestos')
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.puestos = resp.data.map((p) => ({ label: p.nombre, value: p.id }))
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },

    // POST /api/empleados/puestos (201 { id }); recarga el catálogo.
    async crearPuesto(nombre) {
      try {
        const resp = await api.post('/empleados/puestos', { nombre })
        if (resp.status === 201 || resp.status === 200) {
          await this.loadPuestos()
          return { success: true, data: "Puesto creado", id: resp.data && resp.data.id }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },

    // POST /api/empleados (201 { id }).
    async crearEmpleado(e) {
      try {
        const resp = await api.post('/empleados', {
          nombres: e.nombres,
          apellidoPaterno: e.apellidoPaterno || null,
          apellidoMaterno: e.apellidoMaterno || null,
          correo: e.correo || null,
          areaId: e.areaId,
          puestoId: e.puestoId || null,
          concentracion: !!e.concentracion,
        })
        if (resp.status === 201 || resp.status === 200) {
          await this.loadAdmin()
          return { success: true, data: "Empleado creado con éxito", id: resp.data && resp.data.id }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },

    // PUT /api/empleados/{id} (204).
    async actualizarEmpleado(id, e) {
      try {
        const resp = await api.put(`/empleados/${id}`, {
          nombres: e.nombres,
          apellidoPaterno: e.apellidoPaterno || null,
          apellidoMaterno: e.apellidoMaterno || null,
          correo: e.correo || null,
          areaId: e.areaId,
          puestoId: e.puestoId || null,
          concentracion: !!e.concentracion,
        })
        if (resp.status === 204 || resp.status === 200) {
          await this.loadAdmin()
          return { success: true, data: "Empleado actualizado con éxito" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },

    // DELETE /api/empleados/{id} (204). El backend rechaza si el empleado está en uso.
    async eliminarEmpleado(id) {
      try {
        const resp = await api.delete(`/empleados/${id}`)
        if (resp.status === 204 || resp.status === 200) {
          await this.loadAdmin()
          return { success: true, data: "Empleado eliminado con éxito" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },
  },
});
