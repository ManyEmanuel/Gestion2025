import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

// Corte al backend nuevo: las escrituras REST responden 201/204 y problem+json en error (axios lanza).
const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

// Aplana el árbol de áreas (GET /api/areas/arbol) a una lista con el nombre del padre resuelto y el nivel.
function aplanarArbol(nodos, padreNombre, nivel, acumulado) {
  for (const n of nodos) {
    acumulado.push({
      id: n.id,
      nombre: n.nombre,
      siglas: n.siglas,
      areaPadreId: n.areaPadreId,
      area_Padre: padreNombre,
      nivel,
    })
    if (Array.isArray(n.hijos) && n.hijos.length) {
      aplanarArbol(n.hijos, n.nombre, nivel + 1, acumulado)
    }
  }
  return acumulado
}

export const useAreaStore = defineStore('Areas', {
  state: () => ({
    areas: [],
    areasHijas: [],
    areasAdmin: [],
    empleados: [],
    area: {
      id: null,
      area: null
    }
  }),

  actions: {

    initAreasHijas() {
      this.areasHijas = []
    },

    initArea() {
      this.area.id = null
      this.area.area = null
    },

    // MIGRADO al backend nuevo (corte): GET /api/areas -> array de { id, siglas, nombre }.
    // Selector reutilizable (préstamos, encabezados, transferencias, bajas, etc.).
    async loadListaAreas() {
      try {
        this.areas = []
        const resp = await api.get('/areas')
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.areas = resp.data.map((area) => ({
            label: `${area.siglas} - ${area.nombre}`,
            value: area.id
          }))
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadPadreByHija(id) {
      try {
        const resp = await api.get(`/Areas/AreaByHija/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              this.area.id = data.id
              this.area.area = data.nombre
            }
          } else {
            return { success, data }
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (error) {
        console.log(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadListaByPadre(id) {
      try {
        this.areasHijas = []
        const resp = await api.get(`/Areas/ByPadre/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              let areasArray = data.map((area) => {
                return {
                  label: area.label,
                  value: area.value
                }
              })
              this.areasHijas = areasArray;
            }
          } else {
            return { success, data }
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (error) {
        console.log(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadEmpleadosByArea(areaid) {
      try {
        console.log(areaid)
        const resp = await api.get(`/Empleados/ByArea/${areaid}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              let empleadosArray = data.map((empleado) => {
                return {
                  label: `${empleado.nombres} ${empleado.apellido_Paterno} ${empleado.apellido_Materno}`,
                  value: empleado.id
                }
              })
              this.empleados = empleadosArray
            }
          } else {
            return { success, data }
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (error) {
        console.log(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo (corte): GET /api/empleados -> array de { id, nombreCompleto }.
    // Selector reutilizable (vistos buenos, enlaces, préstamos, encabezados, etc.).
    async loadEmpleadosTodos() {
      try {
        const resp = await api.get(`/empleados`)
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.empleados = resp.data.map((empleado) => ({
            label: empleado.nombreCompleto,
            value: empleado.id
          }))
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadEmpleados() {
      try {
        const resp = await api.get(`/Empleados/ByArea`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              let empleadosArray = data.map((empleado) => {
                return {
                  label: `${empleado.nombres} ${empleado.apellido_Paterno} ${empleado.apellido_Materno}`,
                  value: empleado.id
                }
              })
              this.empleados = empleadosArray
            }
          } else {
            return { success, data }
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (error) {
        console.log(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // --- Administración de áreas (issue #38 / permiso archivo.administracion.areas.*) ---

    // GET /api/areas/arbol -> árbol jerárquico; se aplana a `areasAdmin` para la tabla.
    async loadArbol() {
      try {
        this.areasAdmin = []
        const resp = await api.get('/areas/arbol')
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.areasAdmin = aplanarArbol(resp.data, null, 0, [])
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },

    // POST /api/areas (201 { id }).
    async crearArea(area) {
      try {
        const resp = await api.post('/areas', {
          nombre: area.nombre,
          siglas: area.siglas || null,
          areaPadreId: area.areaPadreId || null,
        })
        if (resp.status === 201 || resp.status === 200) {
          await this.loadArbol()
          return { success: true, data: "Área creada con éxito", id: resp.data && resp.data.id }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },

    // PUT /api/areas/{id} (204).
    async actualizarArea(id, area) {
      try {
        const resp = await api.put(`/areas/${id}`, {
          nombre: area.nombre,
          siglas: area.siglas || null,
          areaPadreId: area.areaPadreId || null,
        })
        if (resp.status === 204 || resp.status === 200) {
          await this.loadArbol()
          return { success: true, data: "Área actualizada con éxito" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },

    // DELETE /api/areas/{id} (204). El backend rechaza si el área tiene hijas o está en uso.
    async eliminarArea(id) {
      try {
        const resp = await api.delete(`/areas/${id}`)
        if (resp.status === 204 || resp.status === 200) {
          await this.loadArbol()
          return { success: true, data: "Área eliminada con éxito" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },
  },
});
