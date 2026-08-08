
import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

// Corte al backend nuevo: las escrituras REST responden 201/204 y problem+json en error (axios lanza).
const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

export const useVistosBuenosStore = defineStore('VoBos', {
    state: () => ({
        loading_table: false,
        modal: false,
        vistos_buenos: [],
        vistos_buenos_opt: [],
        visto: {
            id: null,
            empleado_Id: null,
            activo: false,
        },
        isEditar: false,
    }),
    getters: {

    },
    actions: {

        initVbo() {
            this.visto.id = null
            this.visto.empleado_Id = null
            this.visto.activo = null
        },

        // MIGRADO al backend nuevo (corte de clientes): GET /api/vistosbuenos devuelve un array
        // con el empleado resuelto. activo_String se deriva de activo.
        async loadVoBos() {
            try {
                this.vistos_buenos = []
                this.loading_table = true
                const resp = await api.get('/vistosbuenos')
                this.loading_table = false
                if (resp.status == 200 && Array.isArray(resp.data)) {
                    this.vistos_buenos = resp.data.map((element) => ({
                        id: element.id,
                        empleado_Id: element.empleadoId,
                        empleado: element.empleado,
                        activo: element.activo,
                        activo_String: element.activo ? 'Activo' : 'Inactivo'
                    }))
                    return { success: true }
                }
                return { success: false, data: "Respuesta inesperada del servidor." }
            } catch (e) {
                this.loading_table = false
                console.error(e)
                return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
            }
        },

        async loadListaVoBos() {
            try {
                this.vistos_buenos_opt = []
                const resp = await api.get('/Archivo/VistosBuenos/GetLista')
                if (resp.status == 200) {
                    const { success, data } = resp.data
                    if (success === true) {
                        if (data) {
                            const voBosArray = data.map((element) => {
                                return {
                                    label: element.label,
                                    value: element.value,
                                }
                            })
                            this.vistos_buenos_opt = voBosArray
                            return { success }
                        } else {
                            return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
                        }

                    } else {
                        return { success, data }
                    }
                } else {
                    return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
                }
            } catch (e) {
                console.error(e)
                return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
            }
        },

        // MIGRADO: el backend nuevo no expone GET /vistosbuenos/{id}. La edición se llena desde la
        // lista ya cargada (this.vistos_buenos trae empleado_Id y activo).
        loadVoBo(id) {
            const row = this.vistos_buenos.find((x) => x.id == id)
            if (row) {
                this.visto.id = row.id
                this.visto.empleado_Id = row.empleado_Id
                this.visto.activo = row.activo
                return { success: true }
            }
            return { success: false, data: "No se encontró el visto bueno." }
        },

        // MIGRADO: POST /api/vistosbuenos { empleadoId } -> 201. El vobo nace activo.
        async create(voBO) {
            try {
                const resp = await api.post("/vistosbuenos", { empleadoId: voBO.empleado_Id })
                if (resp.status === 201 || resp.status === 200) {
                    this.loadVoBos()
                    return { success: true, data: "Visto bueno registrado con éxito" }
                }
                return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
            } catch (e) {
                console.error(e)
                return { success: false, data: mensajeError(e) }
            }
        },

        // MIGRADO: PATCH /api/vistosbuenos/{id}/estado { activo } -> 204. El backend solo cambia el
        // estado (activo/inactivo); no reasigna el empleado de un visto bueno existente.
        async update(voBO) {
            try {
                const resp = await api.patch(`/vistosbuenos/${voBO.id}/estado`, { activo: voBO.activo })
                if (resp.status === 204 || resp.status === 200) {
                    this.loadVoBos()
                    return { success: true, data: "Visto bueno actualizado con éxito" }
                }
                return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
            } catch (e) {
                console.error(e)
                return { success: false, data: mensajeError(e) }
            }
        },

        // MIGRADO: DELETE /api/vistosbuenos/{id} -> 204.
        async deleteSerie(id) {
            try {
                const resp = await api.delete(`/vistosbuenos/${id}`)
                if (resp.status === 204 || resp.status === 200) {
                    this.loadVoBos()
                    return { success: true, data: "Visto bueno eliminado con éxito" }
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
        }
    }

})