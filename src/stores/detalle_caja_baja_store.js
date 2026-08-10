import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

// Corte al backend nuevo: agregar expediente responde 204 y problem+json en error (axios lanza).
const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

export const useDetalleCajaBajaStore = defineStore('detalleCajaBaja', {
  state: () => ({
    isLoading: false,
    isEditar: false,
    detalles: [],
    detallesAI: [],
    arrayDetalles: [],
    detalle: {
      id: null,
      inventario_Area_Id: null,
      clave_Clasificacion: null,
      descripcion: null,
      total_Paginas: null,
      observaciones: null,
      fecha_Inicio: null,
      fecha_Termino: null
    }
  }),
  actions: {

    init_detalle() {
      this.detalle.id = null
      this.detalle.inventario_Area_Id = null
      this.detalle.clave_Clasificacion = null
      this.detalle.descripcion = null
      this.detalle.total_Paginas = null
      this.detalle.observaciones = null
      this.detalle.fecha_Inicio = null
      this.detalle.fecha_Termino = null
    },

    init_array_detalle() {
      this.arrayDetalles = []
    },

    // MIGRADO al backend nuevo (corte de clientes): GET /api/bajasdocumentales/cajas/{cajaId}/detalle
    // (aislado por el área de la baja) con datos del expediente resueltos.
    async load_detalles(caja_id) {
      try {
        const resp = await api.get(`/bajasdocumentales/cajas/${caja_id}/detalle`)
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.detalles = resp.data.map((d) => ({
            id: d.id,
            clave_Clasificacion: d.claveClasificacion,
            descripcion: d.descripcion,
            total_Paginas: d.totalPaginas,
            observaciones: d.observaciones,
            fecha_Inicio: d.fechaInicio,
            fecha_Termino: d.fechaTermino
          }))
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo: POST /api/bajasdocumentales/{bajaId}/expedientes { cajaId, ... } -> 204.
    // Se usa al EDITAR una caja (agregar un expediente extra); solo mientras la baja está en Borrador.
    // Recibe bajaId (lo pasa el componente por prop).
    async create(bajaId, caja_id, detalle) {
      try {
        const resp = await api.post(`/bajasdocumentales/${bajaId}/expedientes`, {
          cajaId: caja_id,
          inventarioGeneralId: detalle.inventario_Area_Id,
          descripcion: detalle.descripcion || null,
          observaciones: detalle.observaciones || null,
          totalPaginas: detalle.total_Paginas != null ? Number(detalle.total_Paginas) : null
        })
        if (resp.status === 204 || resp.status === 200) {
          this.load_detalles(caja_id)
          return { success: true, data: "Expediente agregado" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },


    async deleteDetalle(caja_id, id) {
      try {
        const resp = await api.delete(`/Archivo/DetalleCajasBajas/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            this.load_detalles(caja_id)
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

    addDetalle(detalle) {
      this.arrayDetalles.push(detalle)
    },

    deleteDetalleArray(id) {
      const index = this.arrayDetalles.findIndex(element => {
        return element.id == id
      })
      this.arrayDetalles.splice(index, 1)
      return { success: true, data: "Registro eliminado con éxito" }
    }
  },
});
