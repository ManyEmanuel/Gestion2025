import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

// Corte al backend nuevo: agregar expediente responde 204 y problem+json en error (axios lanza).
const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

export const useDetalleCajaTransferenciaStore = defineStore('DetalleCajaTransferenciaStore', {
  state: () => ({
    isLoading: false,
    isEditar: false,
    detalles: [],
    detallesAI: [],
    arrayDetalles: [],
    detalle: {
      id: null,
      nombre_Expediente: null,
      inventario_Area_Id: null,
      clave_Clasificacion: null,
      no_Expediente_Interno: null,
      fecha_Inicio: null,
      fecha_Termino: null,
      valor_Documental: null,
      vigencia_Concentracion: null,
      destino_Final: null,
      descripcion: null,
      signatura_Topografica: null,
      total_Paginas: null,
    },
  }),
  actions: {

    initDetalle() {
      this.detalle.id = null
      this.detalle.nombre_Expediente = null
      this.detalle.inventario_Area_Id = null
      this.detalle.clave_Clasificacion = null
      this.detalle.no_Expediente_Interno = null
      this.detalle.fecha_Inicio = null
      this.detalle.fecha_Termino = null
      this.detalle.valor_Documental = null
      this.detalle.vigencia_Concentracion = null
      this.detalle.destino_Final = null
      this.detalle.descripcion = null
      this.detalle.signatura_Topografica = null
      this.detalle.total_Paginas = null
    },

    initArrayDetalle() {
      this.arrayDetalles = []
    },

    // MIGRADO al backend nuevo (corte de clientes): GET /api/transferenciasprimarias/cajas/{cajaId}/detalle
    // devuelve un array (aislado por el área de la transferencia) con datos del expediente resueltos.
    // no_Expediente_Interno se deriva de la clave; valor documental/destino final no los modela el dominio.
    async loadDetalles(cajaId, ubicacion) {
      try {
        const resp = await api.get(`/transferenciasprimarias/cajas/${cajaId}/detalle`)
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.detalles = resp.data.map((d) => {
            const partes = (d.claveClasificacion || '').split('/')
            return {
              id: d.id,
              nombre_Expediente: d.nombreExpediente,
              caja_Id: d.cajaId,
              inventario_Area_Id: d.inventarioGeneralId,
              clave_Clasificacion: d.claveClasificacion,
              no_Expediente_Interno: partes.length > 3 ? partes[3] : null,
              destino_Final: null,
              vigencia_Concentracion: d.vigenciaConcentracion,
              descripcion: d.descripcion,
              signatura_Topografica: d.signaturaTopografica,
              total_Paginas: d.totalPaginas,
              fecha_Inicio: d.fechaInicio,
              fecha_Termino: d.fechaTermino,
              valor_Documental: null,
              estatus: d.estatus,
              motivo_Rechazo: d.motivoRechazo,
              ubicacion: ubicacion || null
            }
          })
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo (corte de clientes): el backend nuevo no expone un listado de
    // expedientes por transferencia; se arma agregando el detalle de cada caja
    // (GET /transferenciasprimarias/{id}/cajas -> por cada caja GET .../cajas/{cajaId}/detalle).
    // El `estatus` es el del expediente (InventarioGeneral); el backend nuevo NO modela aprobación
    // por-expediente de transferencia (la vista AI se colapsó a solo-lectura + afectar).
    async loadDetallesAI(transferenciaId) {
      try {
        this.isLoading = true;
        this.detallesAI = []
        const respCajas = await api.get(`/transferenciasprimarias/${transferenciaId}/cajas`)
        if (!(respCajas.status == 200 && Array.isArray(respCajas.data))) {
          this.isLoading = false;
          return { success: false, data: "Respuesta inesperada del servidor." }
        }
        const agregados = []
        for (const c of respCajas.data) {
          const r = await api.get(`/transferenciasprimarias/cajas/${c.id}/detalle`)
          if (r.status == 200 && Array.isArray(r.data)) {
            r.data.forEach((d) => {
              const partes = (d.claveClasificacion || '').split('/')
              agregados.push({
                id: d.id,
                nombre_Expediente: d.nombreExpediente,
                caja_Id: d.cajaId,
                inventario_Area_Id: d.inventarioGeneralId,
                clave_Clasificacion: d.claveClasificacion,
                no_Expediente_Interno: partes.length > 3 ? partes[3] : null,
                destino_Final: null,
                vigencia_Concentracion: d.vigenciaConcentracion,
                descripcion: d.descripcion,
                signatura_Topografica: d.signaturaTopografica,
                total_Paginas: d.totalPaginas,
                fecha_Inicio: d.fechaInicio,
                fecha_Termino: d.fechaTermino,
                valor_Documental: null,
                estatus: d.estatus,
                motivo_Rechazo: d.motivoRechazo
              })
            })
          }
        }
        this.detallesAI = agregados;
        this.isLoading = false;
        return { success: true }
      } catch (error) {
        this.isLoading = false;
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo: POST /api/transferenciasprimarias/{transferenciaId}/expedientes
    // { cajaId, ... } -> 204. Se usa al EDITAR una caja (agregar un expediente extra); solo mientras
    // la transferencia está en Borrador. Recibe transferenciaId (lo pasa el componente por prop).
    async createDetalle(transferenciaId, cajaId, detalle) {
      try {
        const resp = await api.post(`/transferenciasprimarias/${transferenciaId}/expedientes`, {
          cajaId,
          inventarioGeneralId: detalle.inventario_Area_Id,
          descripcion: detalle.descripcion || null,
          signaturaTopografica: detalle.signatura_Topografica || null,
          totalPaginas: detalle.total_Paginas != null ? Number(detalle.total_Paginas) : null
        })
        if (resp.status === 204 || resp.status === 200) {
          this.loadDetalles(cajaId)
          return { success: true, data: "Expediente agregado" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    async deleteDetalle(cajaId, id) {
      try {
        const resp = await api.delete(`/DetallesCajasTrasnferencias/${cajaId}/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            this.loadDetalles(cajaId)
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

    async aprobarDetalle(id, cajaId, ubicacion) {
      try {
        const resp = await api.post(`/DetallesCajasTrasnferencias/${cajaId}/Aprobar/${id}`, { ubicacion })
        if (resp.status == 200) {
          const { success, data } = resp.data
          return { success, data }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo" }
        }
      } catch (e) {
        console.log(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async rechazar(id, cajaId, motivo) {
      try {
        const resp = await api.post(`/DetallesCajasTrasnferencias/${cajaId}/Rechazar/${id}`, { motivo })
        if (resp.status == 200) {
          const { success, data } = resp.data
          return { success, data }
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
