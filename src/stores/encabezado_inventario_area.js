import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

// Corte al backend nuevo: las escrituras REST responden 201/204 y problem+json en error (axios lanza).
const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

import { useAuthNuevoStore } from 'src/stores/auth_nuevo_store'

// Empleado y área del usuario autenticado (para el área generadora y el enlace del alta del encabezado).
// Horizonte-1 #F7: antes decodificaba el JWT de localStorage; el token ahora vive en una cookie httpOnly
// que JS no puede leer -- se lee del estado ya cargado por auth_nuevo_store (GET /api/auth/me).
function datosUsuarioToken() {
  const { areaId, empleadoId } = useAuthNuevoStore()
  return { empleadoId, areaId }
}

export const useEncabezadoInventarioStore = defineStore('encabezado', {
  state: () => ({
    modal: false,
    modalGral: false,
    isEditar: false,
    encabezados: [],
    encabezadosArea: [],
    encabezadosAreaFiltro: [],
    loadindg: false,
    encabezado: {
      id: null,
      area_Responsable_Id: null,
      area_Responsable: null,
      area_Generadora_Id: null,
      area_Generadora: null,
      enlace_Id: null,
      enlace: null,
      puesto_Enlace: null,
      valido_Id: null,
      valido: null,
      puesto_Valido: null,
      visto_Bueno_Id: null,
      visto_Bueno: null,
      puesto_Visto_Bueno: null,
      supervisa_Id: null,
      supervisa: null,
      puesto_Supervisa: null,
      nombre: null,
      fecha_Registro: null,
      ano: null
    },
  }),
  getters: {
  },
  actions: {
    initEncabezado() {
      this.encabezado.id = null,
        // this.encabezado.enlace_Id = null
        this.encabezado.nombre = null
    },

    // MIGRADO al backend nuevo (corte de clientes): GET /api/encabezados devuelve un array
    // scoped por el usuario (ámbito global -> todas las áreas; usuario de área -> la suya),
    // con nombres resueltos. Los roles de firma (elaboró/validó/VoBo/supervisa) no los modela
    // el dominio nuevo -> van en null.
    async loadEncabezados() {
      try {
        this.encabezados = []
        this.loadindg = true
        const resp = await api.get("/encabezados")
        this.loadindg = false
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.encabezados = resp.data.map((e) => ({
            id: e.id,
            area_Responsable_Id: e.areaResponsableId,
            area_Responsable: e.areaResponsable,
            area_Generadora_Id: e.areaGeneradoraId,
            area_Generadora: e.areaGeneradora,
            enlace_Id: e.enlaceId,
            enlace: e.enlace,
            elaboro_Id: null, elaboro: null,
            valido_Id: null, valido: null,
            visto_Bueno_Id: null, visto_Bueno: null,
            supervisa_Id: null, supervisa: null,
            nombre: e.nombre,
            fecha_Registro: null,
            estatus: e.estatus,
            ano: e.ano
          }))
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) {
        this.loadindg = false
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadEncabezadosAll() {
      try {
        this.encabezadosArea = []
        this.loadindg = true
        const resp = await api.get("/Archivo/InventariosGeneralesAreasEncabezado/GetAll")
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              data.forEach(element => {
                const { id, area_Responsable_Id, area_Responsable, area_Generadora_Id,
                  area_Generadora, enlace_Id, enlace, elaboro_Id, elaboro, valido_Id,
                  valido, visto_Bueno_Id, visto_Bueno, supervisa_Id, supervisa,
                  nombre, fecha_Registro, estatus, ano } = element

                const encabezadoItem = {
                  id, area_Responsable_Id, area_Responsable, area_Generadora_Id,
                  area_Generadora, enlace_Id, enlace, elaboro_Id, elaboro, valido_Id,
                  valido, visto_Bueno_Id, visto_Bueno, supervisa_Id, supervisa,
                  nombre, fecha_Registro, estatus, ano
                }
                this.encabezadosArea.push(encabezadoItem);
                this.encabezadosAreaFiltro.push(encabezadoItem)
              });
              this.loadindg = false
              return { success }
            } else {
              return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
            }
          } else {
            this.loadindg = false
            return { success, data }
          }
        } else {
          this.loadindg = false
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (e) {
        this.loadindg = false
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadEncabezadoAllFiltro(area, anio) {
      try {
        if (area == 'Ver todos') {
          if (anio == 'Ver todos') {
            this.encabezadosAreaFiltro = this.encabezadosArea
          } else {
            this.encabezadosAreaFiltro = this.encabezadosArea.filter(x => x.ano == anio)
          }
        } else {
          if (anio == 'Ver todos') {
            this.encabezadosAreaFiltro = this.encabezadosArea.filter(x => x.area_Generadora == area)
          } else {
            this.encabezadosAreaFiltro = this.encabezadosArea.filter(x => x.ano == anio && x.area_Generadora == area)
          }
        }
      } catch (error) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo (corte de clientes): el área generadora es el área del usuario (claim
    // `area` del JWT); el nombre se resuelve desde /api/areas. El área RESPONSABLE ya no se deriva del
    // área padre (jerarquía no poblada) — el usuario la elige con un selector en el modal.
    async loadArea() {
      try {
        const usuario = datosUsuarioToken()
        if (!usuario.areaId) {
          return { success: false, data: "Tu usuario no tiene área asociada." }
        }
        this.encabezado.area_Generadora_Id = usuario.areaId
        const resp = await api.get("/areas")
        if (resp.status == 200 && Array.isArray(resp.data)) {
          const area = resp.data.find((a) => a.id == usuario.areaId)
          this.encabezado.area_Generadora = area ? `${area.siglas} - ${area.nombre}` : null
        }
        return { success: true }
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo (corte de clientes): el backend nuevo NO expone GET-por-id; el
    // encabezado se toma del listado ya scoped (GET /api/encabezados) buscando por id (patrón
    // edit-from-list). Los roles legados de firma (validó/VoBo/supervisa + puestos), que el dominio
    // nuevo no modela, van en null.
    async loadEncabezado(id) {
      try {
        const resp = await api.get('/encabezados')
        if (resp.status == 200 && Array.isArray(resp.data)) {
          const enc = resp.data.find((e) => e.id == id)
          if (enc) {
            this.encabezado.id = enc.id
            this.encabezado.area_Responsable_Id = enc.areaResponsableId
            this.encabezado.area_Responsable = enc.areaResponsable
            this.encabezado.area_Generadora_Id = enc.areaGeneradoraId
            this.encabezado.area_Generadora = enc.areaGeneradora
            this.encabezado.enlace_Id = enc.enlaceId
            this.encabezado.enlace = enc.enlace
            this.encabezado.puesto_Enlace = null
            this.encabezado.valido_Id = null; this.encabezado.valido = null; this.encabezado.puesto_Valido = null
            this.encabezado.visto_Bueno_Id = null; this.encabezado.visto_Bueno = null; this.encabezado.puesto_Visto_Bueno = null
            this.encabezado.supervisa_Id = null; this.encabezado.supervisa = null; this.encabezado.puesto_Supervisa = null
            this.encabezado.nombre = enc.nombre
            this.encabezado.fecha_Registro = null
            this.encabezado.ano = enc.ano
          }
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo: el enlace es el del empleado del usuario, buscado en /api/enlaces
    // (scoped). Si el usuario no es enlace, queda vacío (el enlace es opcional al crear). Se retiraron
    // las lecturas de rol legadas (loadResponsableArea/loadVoBo/loadSupervisa/loadRespArchivo): el
    // dominio nuevo no modela validó/VoBo/supervisa.
    async loadEnlace() {
      try {
        const usuario = datosUsuarioToken()
        if (!usuario.empleadoId) {
          return { success: true }
        }
        const resp = await api.get("/enlaces")
        if (resp.status == 200 && Array.isArray(resp.data)) {
          const enlace = resp.data.find((e) => e.empleadoId == usuario.empleadoId)
          if (enlace) {
            this.encabezado.enlace_Id = enlace.id
            this.encabezado.enlace = enlace.empleado
          }
        }
        return { success: true }
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO al backend nuevo: POST /api/encabezados (201 { id }, estado Borrador). Área generadora =
    // área del usuario (JWT); enlace = enlace del empleado; área responsable = selector. Los roles
    // legados (validó/VoBo/supervisa) no los modela el backend y se omiten.
    async createEncabezado(encabezado) {
      try {
        const resp = await api.post('/encabezados', {
          areaGeneradoraId: encabezado.area_Generadora_Id,
          areaResponsableId: encabezado.area_Responsable_Id,
          enlaceId: encabezado.enlace_Id || null,
          nombre: encabezado.nombre,
          ano: encabezado.ano != null && encabezado.ano !== '' ? Number(encabezado.ano) : null
        })
        if (resp.status === 201 || resp.status === 200) {
          this.loadEncabezados();
          return { success: true, data: "Encabezado registrado con éxito", id: resp.data && resp.data.id }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    async updateEncabezado(encabezado, id) {
      try {
        const resp = await api.put(`/Archivo/InventariosGeneralesAreasEncabezado/${id}`, encabezado)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            return { success, data }
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

    async deleteEncabezado(id) {
      try {
        const resp = await api.delete(`/Archivo/InventariosGeneralesAreasEncabezado/${id}`)
        if (resp.status == 200) {
          let { success, data } = resp.data
          if (success === true) {
            this.loadEncabezados();
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

    async cambiarAreaGeneradora(id, area) {
      try {
        const resp = await api.put(`/Archivo/InventariosGeneralesAreasEncabezado/CambiarAreaGeneradora/${id}`, {
          "area_Generadora_Id": area
        })
        if (resp.status == 200) {
          const { success, data, id } = resp.data
          if (success === true) {
            this.loadEncabezados();
            return { success, data, id }
          } else {
            return { success, data }
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (error) {
        console.log(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    actualizarModal(valor) {
      this.modal = valor
    },

    actualizarModalGral(valor) {
      this.modalGral = valor
    },

    updateEditar(valor) {
      this.isEditar = valor
    },

  },
});
