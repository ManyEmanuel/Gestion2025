import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

// Corte al backend nuevo: las escrituras REST responden 201/204 y problem+json en error (axios lanza).
const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

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

        // MIGRADO al backend nuevo (corte de clientes): GET /api/adjuntos/por-expediente/{id}
        // (aislado por el área del encabezado del expediente) devuelve un array de metadatos.
        async loadAdjuntos(inventarioId) {
            try {
                this.loading = true
                this.adjuntos = []
                const resp = await api.get(`/adjuntos/por-expediente/${inventarioId}`)
                this.loading = false
                if (resp.status == 200 && Array.isArray(resp.data)) {
                    this.adjuntos = resp.data.map((e) => ({
                        id: e.id,
                        nombre: e.nombre,
                        no_Paginas: e.noPaginas
                    }))
                    return { success: true }
                }
                return { success: false, data: "Respuesta inesperada del servidor." }
            } catch (error) {
                this.loading = false
                console.error(error)
                return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
            }
        },

        // MIGRADO: GET /api/adjuntos/{id}/contenido. El backend streamea el contenido tanto de las
        // subidas locales nuevas como de los adjuntos migrados (de estos hace proxy desde el servidor
        // de archivos anterior), así que este visor por blob funciona igual para ambos.
        async loadAdjunto(id) {
            try {
                this.adjunto_url = "";
                const resp = await api.get(`/adjuntos/${id}/contenido`, {
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

        // MIGRADO: POST /api/adjuntos/por-expediente/{inventarioId} (multipart: archivo + noPaginas).
        // 201 Created. El adjunto se guarda local en el backend (IFileStorage).
        async createAdjunto(inventarioId, adjunto) {
            try {
                const resp = await api.post(`/adjuntos/por-expediente/${inventarioId}`, adjunto)
                if (resp.status === 201 || resp.status === 200) {
                    this.loadAdjuntos(inventarioId)
                    return { success: true, data: "Adjunto registrado con éxito" }
                }
                return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
            } catch (error) {
                console.error(error)
                return { success: false, data: mensajeError(error) }
            }
        },

        // MIGRADO: DELETE /api/adjuntos/{id} -> 204 (borrado lógico del metadato).
        async deleteAdjunto(inventarioId, id) {
            try {
                const resp = await api.delete(`/adjuntos/${id}`)
                if (resp.status === 204 || resp.status === 200) {
                    this.loadAdjuntos(inventarioId);
                    return { success: true, data: "Adjunto eliminado con éxito" }
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

        actualizarModalVer(valor) {
            this.modalVer = valor
        },

        actualizarViewer(valor) {
            this.viewer = valor
        }
    }
})