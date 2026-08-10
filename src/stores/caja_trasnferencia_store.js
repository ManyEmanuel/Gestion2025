import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

// Corte al backend nuevo: las escrituras REST responden 201/204 y problem+json en error (axios lanza).
const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

export const useCajaTransferenciaStore = defineStore('CajaTransferenciaStore', {
  state: () => ({
    isLoading: false,
    isEditar: false,
    modal: false,
    modalAI: false,
    isCompleto: false,
    ubicacion: {
      inmueble: null,
      pasillo: null,
      estante: null,
      nivel: null
    },
    cajas: [],
    caja: {
      id: null,
      no_Caja: null,
      peso: null,
      fecha_Antigua: null,
      fecha_Reciente: null,
      total_Expedientes: null,
      total_Paginas: null,
      seccion: null,
      year: null,
      detalle: [],
      secciones: [],
      secciones_Id: [],
      estatus: null,
      ubicacion: null
    }
  }),
  actions: {
    initUbicacion() {
      this.ubicacion.inmueble = null
      this.ubicacion.pasillo = null
      this.ubicacion.estante = null
      this.ubicacion.nivel = null
    },

    initCaja() {
      this.caja.id = null
      this.caja.no_Caja = null
      this.caja.peso = null
      this.caja.fecha_Antigua = null
      this.caja.fecha_Reciente = null
      this.caja.total_Expedientes = null
      this.caja.total_Paginas = null
      this.caja.year = null
      this.caja.detalle = []
      this.caja.secciones_Id = []
      this.caja.estatus = null
    },

    // MIGRADO al backend nuevo (corte de clientes): GET /api/transferenciasprimarias/{id}/cajas
    // devuelve un array de cajas (aislado por el área de la transferencia). Campos de secundaria
    // (sección, fechas extremas, total de páginas, año) van en null.
    async loadCajas(transferenciaId) {
      try {
        const resp = await api.get(`/transferenciasprimarias/${transferenciaId}/cajas`)
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.cajas = resp.data.map((caja) => ({
            id: caja.id,
            trasnferencia_Primaria_Encabezado_Id: caja.transferenciaId,
            trasnferencia: null,
            no_Caja: caja.noCaja,
            seccion_Id: null, seccion: null,
            peso: caja.peso,
            fecha_Antigua: null, fecha_Reciente: null,
            total_Expedientes: caja.totalExpedientes,
            total_Paginas: null,
            estatus: caja.estatus,
            year: null
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
    // EDITAR una caja (solo para agregar expedientes en Borrador). Los campos que el dominio nuevo no
    // modela por caja (sección, fechas extremas, total de hojas, ubicación) van en null.
    async loadCaja(transferenciaId, id) {
      try {
        const encontrada = (this.cajas || []).find((c) => c.id == id)
        if (encontrada) {
          this.caja.id = encontrada.id
          this.caja.no_Caja = encontrada.no_Caja
          this.caja.secciones_Id = []
          this.caja.seccion = null
          this.caja.peso = encontrada.peso
          this.caja.fecha_Antigua = null
          this.caja.fecha_Reciente = null
          this.caja.total_Expedientes = encontrada.total_Expedientes
          this.caja.total_Paginas = null
          this.caja.year = null
          this.caja.estatus = encontrada.estatus
          this.caja.ubicacion = null
          return { success: true }
        }
        return { success: false, data: "No se encontró la caja en el listado." }
      } catch (error) {
        console.log(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo: el legado creaba la caja con sus expedientes EMBEBIDOS en un solo POST.
    // El backend nuevo lo separa: AgregarCaja (POST /{tid}/cajas {noCaja, peso}) -> devuelve el id de la
    // caja -> y luego un AgregarExpediente (POST /{tid}/expedientes) por cada expediente del detalle.
    async createCaja(transferenciaId, caja) {
      try {
        const respCaja = await api.post(`/transferenciasprimarias/${transferenciaId}/cajas`, {
          noCaja: Number(caja.no_Caja),
          peso: caja.peso != null && caja.peso !== '' ? Number(caja.peso) : null
        })
        const cajaId = respCaja && respCaja.data && respCaja.data.id
        if (!cajaId) {
          return { success: false, data: "No se pudo crear la caja." }
        }
        for (const d of (caja.detalle || [])) {
          await api.post(`/transferenciasprimarias/${transferenciaId}/expedientes`, {
            cajaId,
            inventarioGeneralId: d.inventario_Area_Id,
            descripcion: d.descripcion || null,
            signaturaTopografica: d.signatura_Topografica || null,
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

    async createUbicacion(ubicacion, caja) {
      try {
        let nuevaUbicacion = ubicacion.inmueble + "|" + ubicacion.pasillo + "|" + ubicacion.estante + "|" + ubicacion.nivel
        const resp = await api.post(`/Archivo/InventariosAreasAI/ByCaja/${caja}`, { ubicacion: nuevaUbicacion })
        if (resp.status == 200) {
          console.log(resp)
          const { success, data } = resp.data
          if (success == true) {
            return { success, data }
          } else {
            return { success, data }
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async createUbicacionHistorico(ubicacion, caja) {
      try {
        let nuevaUbicacion = ubicacion.inmueble + "|" + ubicacion.pasillo + "|" + ubicacion.estante + "|" + ubicacion.nivel
        const resp = await api.post(`/Archivo/InventariosAreasAI/ByCajaHistorico/${caja}`, { ubicacion: nuevaUbicacion })
        if (resp.status == 200) {
          console.log(resp)
          const { success, data } = resp.data
          if (success == true) {
            return { success, data }
          } else {
            return { success, data }
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async updateCaja(transferenciaId, id, caja) {
      try {
        const resp = await api.put(`/Archivo/CajasTransferencias/${transferenciaId}/${id}`, caja)
        if (resp.status == 200) {
          let { success, data } = resp.data
          if (success === true) {
            this.loadCajas(transferenciaId);
            return { success, data }
          } else {
            return { success, data }
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo" }
        }

      } catch (error) {
        console.log(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async deleteCaja(id, transferenciaId) {
      try {
        const resp = await api.delete(`/Archivo/CajasTransferencias/${transferenciaId}/${id}`)
        if (resp.status == 200) {
          let { success, data } = resp.data
          if (success === true) {
            this.loadCajas(transferenciaId);
            return { success, data }
          } else {
            return { success, data }
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo" }
        }

      } catch (error) {
        console.log(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
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
