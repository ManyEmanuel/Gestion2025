import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

// Corte al backend nuevo: las escrituras REST no usan la envoltura {success,data}; responden
// 201/204 en éxito y problem+json en error (axios lanza). Este helper saca el mensaje del error.
const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

export const useSeccionStore = defineStore('SeccionStore', {
  state: () => ({
    modal: false,
    seccionesC: [],
    seccionesS: [],
    seccionId: null,
    seccion: {
      id: null,
      codigo: null,
      descripcion: null,
      tipo: null
    },
    isEditar: false,
    listaSecciones: [],
  }),
  getters: {

  },
  actions: {

    initSeccion() {
      this.seccion.id = null
      this.seccion.tipo = null
      this.seccion.codigo = null
      this.seccion.descripcion = null
    },

    // MIGRADO al backend nuevo (corte de clientes, piloto): GET /api/secciones devuelve
    // un array directo de { id (guid), clave, nombre }. La clave = codigo + tipo (C/S);
    // se deriva codigo/tipo/compuesto para conservar la forma que espera la pantalla.
    async loadSecciones() {
      try {
        this.seccionesC = [];
        this.seccionesS = [];
        const resp = await api.get('/secciones')
        if (resp.status == 200 && Array.isArray(resp.data)) {
          const secciones = resp.data.map((element) => {
            const clave = element.clave || ''
            const tipo = clave.slice(-1)
            return {
              id: element.id,
              codigo: clave.slice(0, -1),
              descripcion: element.nombre,
              tipo,
              compuesto: clave
            }
          })
          this.seccionesC = secciones.filter(x => x.tipo == "C")
          this.seccionesS = secciones.filter(x => x.tipo == "S")
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadListaSecciones() {
      try {
        this.listaSecciones = [];
        const resp = await api.get('/secciones')
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.listaSecciones = resp.data.map((element) => {
            return {
              value: element.id,
              label: `${element.clave}-${element.nombre}`
            }
          })
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO: el backend nuevo no expone GET /secciones/{id}. La edición se llena desde la lista
    // ya cargada (seccionesC/seccionesS), que trae id/codigo/descripcion/tipo.
    loadSeccion(id) {
      this.initSeccion()
      const seccion = [...this.seccionesC, ...this.seccionesS].find((s) => s.id == id)
      if (seccion) {
        this.seccion.id = seccion.id
        this.seccion.codigo = seccion.codigo
        this.seccion.descripcion = seccion.descripcion
        this.seccion.tipo = seccion.tipo
        return { success: true }
      }
      return { success: false, data: "No se encontró la sección." }
    },

    // MIGRADO: POST /api/secciones { clave = codigo+tipo, nombre = descripcion } -> 201 { id }.
    async createSeccion(seccion) {
      try {
        const resp = await api.post("/secciones", {
          clave: `${seccion.codigo}${seccion.tipo}`,
          nombre: seccion.descripcion
        })
        if (resp.status === 201 || resp.status === 200) {
          return { success: true, data: "Sección registrada con éxito" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    // MIGRADO: PUT /api/secciones/{id} { clave, nombre } -> 204.
    async updateSeccion(seccion, id) {
      try {
        const resp = await api.put(`/secciones/${id}`, {
          clave: `${seccion.codigo}${seccion.tipo}`,
          nombre: seccion.descripcion
        })
        if (resp.status === 204 || resp.status === 200) {
          return { success: true, data: "Sección actualizada con éxito" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    // MIGRADO: DELETE /api/secciones/{id} -> 204. Un 409 (referenciada) llega como problem+json.
    async deleteSeccion(id) {
      try {
        const resp = await api.delete(`/secciones/${id}`)
        if (resp.status === 204 || resp.status === 200) {
          this.loadSecciones()
          return { success: true, data: "Sección eliminada con éxito" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo" }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    actualizarModal(valor) {
      this.modal = valor
    },

    updateEditar(valor) {
      this.isEditar = valor
    },

    setSeccionId(id) {
      this.seccionId = id
    },

    initSecciones() {
      this.listaSecciones = []
    }

  },
});
