
import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

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
                        empleado: element.empleado,
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

        async loadVoBo(id) {
            try {
                const resp = await api.get(`/Archivo/VistosBuenos/${id}`)
                if (resp.status == 200) {
                    const { success, data } = resp.data
                    if (success === true) {
                        if (data) {
                            this.visto.id = data.id
                            this.visto.empleado_Id = data.empleado_Id
                            this.visto.activo = data.activo
                        } else {
                            return { success, data }
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

        async create(voBO) {
            try {
                const resp = await api.post("/Archivo/VistosBuenos", voBO)
                if (resp.status == 200) {
                    const { success, data } = resp.data
                    if (success === true) {
                        this.loadVoBos()
                        return { success, data }
                    } else {
                        return { success, data }
                    }
                }
                else {
                    return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
                }
            } catch (e) {
                console.error(e)
                return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
            }
        },

        async update(voBO) {
            try {
                const resp = await api.put(`/Archivo/VistosBuenos/${voBO.id}`, voBO)
                if (resp.status == 200) {
                    const { success, data } = resp.data
                    if (success === true) {
                        this.loadVoBos()
                        return { success, data }
                    } else {
                        return { success, data }
                    }
                }
                else {
                    return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
                }
            } catch (e) {
                console.error(e)
                return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
            }
        },

        async deleteSerie(id) {
            try {
                const resp = await api.delete(`/Archivo/VistosBuenos/${id}`)
                if (resp.status == 200) {
                    let { success, data } = resp.data
                    if (success === true) {
                        this.loadVoBos()
                        return { success, data }
                    } else {
                        return { success, data }
                    }
                } else {
                    return { success: false, data: "Ocurrio un error, intentelo de nuevo" }
                }
            } catch (e) {
                console.log(e)
                return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
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