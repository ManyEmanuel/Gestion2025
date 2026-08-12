import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

// Corte al backend nuevo: las escrituras REST responden 201/204 y problem+json en error (axios lanza).
const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

export const useCajaTransferenciaSecundariaterStore = defineStore('useCajaTransferenciaSecundariaterStore', {
  state: () => ({
    isLoading: false,
    isEditar: false,
    isCompleto: false,
    modal: false,
    cajas: [],
    caja: {
      id: null,
      no_Caja: null,
      peso: null,
      fecha_Antigua: null,
      fecha_Reciente: null,
      total_Expedientes: null,
      total_Paginas: null,
      detalle: [],
      secciones: [],
      secciones_Id: []
    }
  }),
  actions: {

    initCaja() {
      this.caja.id = null
      this.caja.no_Caja = null
      this.caja.peso = null
      this.caja.fecha_Antigua = null
      this.caja.fecha_Reciente = null
      this.caja.total_Expedientes = null
      this.caja.total_Paginas = null
      this.caja.detalle = []
      this.caja.secciones = []
    },

    // MIGRADO al backend nuevo (corte de clientes): GET /api/transferenciassecundarias/{id}/cajas
    // (aislado por el área de la transferencia). Sección/total de páginas van en null. isCompleto se
    // basa en el estatus 'Afectada' (todas afectadas => transferencia cerrada).
    async loadCajas(transferenciaId) {
      try {
        const resp = await api.get(`/transferenciassecundarias/${transferenciaId}/cajas`)
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.cajas = resp.data.map((caja) => ({
            id: caja.id,
            no_Caja: caja.noCaja,
            seccion: null,
            peso: caja.peso,
            fecha_Antigua: caja.anoAntiguo,
            fecha_Reciente: caja.anoReciente,
            total_Expedientes: caja.totalExpedientes,
            total_Paginas: null,
            estatus: caja.estatus
          }))
          let filtro = this.cajas.filter((caja) => caja.estatus == "Afectada")
          this.isCompleto = this.cajas.length > 0 && filtro.length === this.cajas.length
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (error) {
        console.log(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo (corte de clientes): el backend nuevo NO expone GET-por-id de caja;
    // se toma del listado ya cargado (this.cajas) buscando por id (patrón edit-from-list). Se usa al
    // EDITAR una caja (solo para agregar expedientes en Borrador). Sección/total de hojas van en null.
    async loadCaja(id) {
      try {
        const encontrada = (this.cajas || []).find((c) => c.id == id)
        if (encontrada) {
          this.caja.id = encontrada.id
          this.caja.no_Caja = encontrada.no_Caja
          this.caja.secciones_Id = []
          this.caja.peso = encontrada.peso
          this.caja.fecha_Antigua = encontrada.fecha_Antigua
          this.caja.fecha_Reciente = encontrada.fecha_Reciente
          this.caja.total_Expedientes = encontrada.total_Expedientes
          this.caja.total_Paginas = null
          this.caja.estatus = encontrada.estatus
          return { success: true }
        }
        return { success: false, data: "No se encontró la caja en el listado." }
      } catch (error) {
        console.log(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo: el legado creaba la caja con sus expedientes EMBEBIDOS en un solo POST.
    // El backend nuevo lo separa: AgregarCaja (POST /{id}/cajas {noCaja, peso, anoAntiguo, anoReciente})
    // -> devuelve el id de la caja -> y luego un AgregarExpediente (POST /{id}/expedientes) por cada
    // expediente del detalle (con signatura topográfica, propia de la secundaria).
    async createCaja(transferenciaId, caja) {
      try {
        const anio = (v) => (v != null && v !== '' ? Number(v) : null)
        const respCaja = await api.post(`/transferenciassecundarias/${transferenciaId}/cajas`, {
          noCaja: Number(caja.no_Caja),
          peso: caja.peso != null && caja.peso !== '' ? Number(caja.peso) : null,
          anoAntiguo: anio(caja.fecha_Antigua),
          anoReciente: anio(caja.fecha_Reciente)
        })
        const cajaId = respCaja && respCaja.data && respCaja.data.id
        if (!cajaId) {
          return { success: false, data: "No se pudo crear la caja." }
        }
        for (const d of (caja.detalle || [])) {
          await api.post(`/transferenciassecundarias/${transferenciaId}/expedientes`, {
            cajaId,
            inventarioGeneralId: d.inventario_Area_Id,
            descripcion: d.descripcion || null,
            signaturaTopografica: d.signatura_Topografica || null,
            observaciones: d.observaciones || null,
            totalPaginas: d.total_Paginas != null ? Number(d.total_Paginas) : null
          })
        }
        this.loadCajas(transferenciaId)
        return { success: true, data: "Caja registrada con éxito" }
      } catch (error) {
        console.error(error)
        return { success: false, data: mensajeError(error) }
      }
    },

    updateEditar(valor) {
      this.isEditar = valor
    },

    actualizarModal(valor) {
      this.modal = valor
    },

    actualizarModalAI(valor) {
      this.modalAI = valor
    }

  },
});
