import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

export const useAdjuntoInventarioStore = defineStore('AdjuntoInventario', {
    state: () => ({
        modal: false,
        modalVer: false,
        viewer: false,
        loading: false,
        adjuntos: [],
        adjunto_url: null,
        adjunto: {
            archivo: null,
            no_Paginas: 0,
        }
    }),

    actions: {
        initAdjunto() {
            this.adjunto.archivo = null
            this.no_Paginas = 0
        },

        async loadAdjuntos(inventarioId) {
            try {
                this.loading = true
                this.adjuntos = []
                const resp = await api.get(`/Archivo/AdjuntosInventariosGeneral/ByInventario/${inventarioId}`)
                if (resp.status == 200) {
                    const { success, data } = resp.data
                    if (success == true) {
                        if (data) {
                            data.forEach(element => {
                                const {
                                    id,
                                    nombre,
                                    no_Paginas
                                } = element;
                                const obj = {
                                    id,
                                    nombre,
                                    no_Paginas
                                }
                                this.adjuntos.push(obj)
                            });
                        }
                        this.loading = false
                    } else {
                        this.loading = false
                        return { success, data }
                    }
                }
            } catch (error) {
                this.loading = false
                console.error(e)
                return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
            }
        },

        async loadAdjunto(id) {
            try {
                this.adjunto_url = "";
                const resp = await api.get(`/Archivo/AdjuntosInventariosGeneral/${id}`, {
                    responseType: 'blob',
                })
                if (resp.status == 200) {
                    let blob = new window.Blob([resp.data], { type: 'application/pdf' })
                    this.adjunto_url = window.URL.createObjectURL(blob)
                    return { success: true }
                } else {
                    return { success: false, data: 'Error al descargar archivo, intentelo de nuevo' }
                }
            } catch (error) {
                console.log(error)
                return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
            }
        },

        async loadAdjuntoOficioInventarioArea(id) {
            try {
                this.adjunto_url = "";
                const resp = await api.get(`/Archivo/InventariosGneralesAreas/GetOficio/${id}`, {
                    responseType: 'blob',
                })
                if (resp.status == 200) {
                    let blob = new window.Blob([resp.data], { type: 'application/pdf' })
                    this.adjunto_url = window.URL.createObjectURL(blob)
                    return { success: true }
                } else {
                    return { success: false, data: 'Error al descargar archivo, intentelo de nuevo' }
                }
            } catch (error) {
                console.log(error)
                return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
            }
        },

        async createAdjunto(inventarioId, adjunto) {
            try {
                const resp = await api.post(`/Archivo/AdjuntosInventariosGeneral/${inventarioId}`, adjunto, {
                    headers: {
                        'Conten-Type': 'multipart/form-data'
                    }
                })
                if (resp.status == 200) {
                    const { success, data } = resp.data
                    if (success == true) {
                        this.loadAdjuntos(inventarioId)
                        return { success, data }
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

        async deleteAdjunto(inventarioId, id) {
            try {
                const resp = await api.delete(`/Archivo/AdjuntosInventariosGeneral/${id}`)
                if (resp.status == 200) {
                    let { success, data } = resp.data
                    if (success === true) {
                        this.loadAdjuntos(inventarioId);
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

        actualizarModalVer(valor) {
            this.modalVer = valor
        },

        actualizarViewer(valor) {
            this.viewer = valor
        }
    }
})