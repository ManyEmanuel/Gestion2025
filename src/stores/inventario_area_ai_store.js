import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

export const useInventarioAreaAIStore = defineStore('inventarioAreaAI', {
  state: () => ({
    modal: false,
    isLoadingConcentracion: false,
    isLoadingHistorico: false,
    inventariosConcentracion: [],
    inventariosConcentracionFiltro: [],
    inventariosHistorico: [],
    inventariosHistoricoFiltro: [],
    inventario: {
      id: null,
      seccion_Id: null,
      seccion: null,
      serie_Id: null,
      serie: null,
      sub_Serie_Id: null,
      sub_Serie: null,
      disposicion_Documental_Id: null,
      disposicion_Documental: null,
      nombre_Expediente: null,
      clave_Clasificacion: null,
      no_Expediente_Interno: null,
      descripcion: null,
      fecha_Inicio: new Date(),
      fecha_Termino: new Date(),
      ubicacion_AI: null,
      vigencia_Tramite: null,
      vigencia_Concentracion: null,
      vigencia_Completa: null,
      fecha_Clasificacion: null,
      fecha_Desclasificacion: null,
      fecha_Ampliacion: null,
      valor_Documental: null,
      vigencia_Concentracion: null,
      vigencia_Completa: null,
      clasificado: false,
      clasificado_Texto: null,
      total_Paginas: null,
      area_Responsable: null,
      area_Generadora: null,
      fecha_Recepcion_Transferencia_Primaria: null,
      fecha_Termino_Concentracion: null
    }
  }),
  actions: {

    initInventario() {
      this.inventario.id = null;
      this.inventario.seccion_Id = null;
      this.inventario.seccion = null;
      this.inventario.serie_Id = null;
      this.inventario.serie = null;
      this.inventario.sub_Serie_Id = null;
      this.inventario.sub_Serie = null;
      this.inventario.disposicion_Documental_Id = null;
      this.inventario.nombre_Expediente = null;
      this.inventario.clave_Clasificacion = null;
      this.inventario.no_Expediente_Interno = null;
      this.inventario.descripcion = null;
      this.inventario.fecha_Inicio = null;
      this.inventario.fecha_Termino = null;
      this.inventario.ubicacion_AI = null;
      this.inventario.vigencia_Tramite = null;
      this.inventario.vigencia_Concentracion = null;
      this.inventario.vigencia_Completa = null;
      this.inventario.fecha_Clasificacion = null;
      this.inventario.fecha_Desclasificacion = null;
      this.inventario.fecha_Ampliacion = null;
      this.inventario.valor_Documental = null;
      this.inventario.vigencia_Tramite = null;
      this.inventario.vigencia_Concentracion = null;
      this.inventario.vigencia_Completa = null;
      this.inventario.clasificado = false;
      this.inventario.clasificado_Texto = null;
      this.inventario.disposicion_Documental = null;
      this.inventario.area_Responsable = null;
      this.inventario.area_Generadora = null;
      this.fecha_Recepcion_Transferencia_Primaria = null;
      this.fecha_Termino_Concentracion = null
    },

    async loadInventariosConcentracion() {
      try {
        this.isLoading = true
        this.inventariosConcentracion = []
        const resp = await api.get('/Archivo/InventariosAreasAI/Concentracion')
        if (resp.status == 200) {
          const { success, data } = resp.data
          console.log("Esto es data de inventarios", data)
          if (success == true) {
            if (data) {
              const inventariosArray = data.map((inventario) => {
                let anio = inventario.clave_Clasificacion.split("/")

                return {
                  id: inventario.id,
                  inventario_General_Area_Encabezado_Id: inventario.inventario_General_Area_Encabezado_Id,
                  seccion_Id: inventario.seccion_Id,
                  seccion: inventario.seccion,
                  serie_Id: inventario.serie_Id,
                  serie: inventario.serie,
                  sub_Serie_Id: inventario.sub_Serie_Id,
                  sub_Serie: inventario.sub_Serie,
                  disposicion_Documental_Id: inventario.disposicion_Documental_Id,
                  disposicion_Documental: inventario.disposicion_Documental,
                  empleado: inventario.empleado,
                  nombre_Expediente: inventario.nombre_Expediente,
                  clave_Clasificacion: inventario.clave_Clasificacion,
                  no_Expediente_Interno: inventario.no_Expediente_Interno,
                  descripcion: inventario.descripcion,
                  fecha_Inicio: inventario.fecha_Inicio,
                  fecha_Termino: inventario.fecha_Termino,
                  ubicacion_AI: inventario.ubicacion_AI,
                  valor_Documental: inventario.valor_Documental,
                  vigencia_Tramite: inventario.vigencia_Tramite,
                  vigencia_Concentracion: inventario.vigencia_Concentracion,
                  vigencia_Completa: inventario.vigencia_Completa,
                  fecha_Clasificacion: inventario.fecha_Clasificacion,
                  fecha_Desclasificacion: inventario.fecha_Desclasificacion,
                  fecha_Ampliacion: inventario.fecha_Ampliacion,
                  estatus: inventario.estatus,
                  motivo_Rechazo: inventario.motivo_Rechazo,
                  clasificado: inventario.clasificado,
                  clasificado_Texto: inventario.clasificado_Texto,
                  total_Paginas: inventario.total_Paginas,
                  area_Responsable: inventario.area_Responsable,
                  area_Generadora: inventario.area_Generadora,
                  fecha_Recepcion_Transferencia_Primaria: inventario.fecha_Recepcion_Transferencia_Primaria,
                  fecha_Termino_Concentracion: inventario.fecha_Termino_Concentracion,
                  anio: parseInt(anio[anio.length - 1])
                }
              });
              this.inventariosConcentracion = inventariosArray;
              this.inventariosConcentracionFiltro = inventariosArray
            }
            this.loading = false
          } else {
            this.loading = false
            return { success, data }
          }
        } else {
          this.loading = false
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (e) {
        this.isLoading = false
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadInventariosConcentracionFiltro(area, anio) {
      try {
        if (area == 'Ver todos') {
          if (anio == 'Ver todos') {
            this.inventariosConcentracionFiltro = this.inventariosConcentracion
          } else {
            this.inventariosConcentracionFiltro = this.inventariosConcentracion.filter(x => x.anio == anio)
          }
        } else {
          if (anio == 'Ver todos') {
            this.inventariosConcentracionFiltro = this.inventariosConcentracion.filter(x => x.area_Generadora == area)
          } else {
            this.inventariosConcentracionFiltro = this.inventariosConcentracion.filter(x => x.anio == anio && x.area_Generadora == area)
          }
        }
      } catch (error) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadInventariosConcentracionBaja() {
      try {
        this.isLoading = true
        this.inventariosConcentracion = []
        const resp = await api.get('/Archivo/InventariosAreasAI/ConcentracionBaja')
        if (resp.status == 200) {
          const { success, data } = resp.data
          console.log("Esto es data de inventarios", data)
          if (success == true) {
            if (data) {
              const inventariosArray = data.map((inventario) => {
                let anio = inventario.clave_Clasificacion.split("/")

                return {
                  id: inventario.id,
                  inventario_General_Area_Encabezado_Id: inventario.inventario_General_Area_Encabezado_Id,
                  seccion_Id: inventario.seccion_Id,
                  seccion: inventario.seccion,
                  serie_Id: inventario.serie_Id,
                  serie: inventario.serie,
                  sub_Serie_Id: inventario.sub_Serie_Id,
                  sub_Serie: inventario.sub_Serie,
                  disposicion_Documental_Id: inventario.disposicion_Documental_Id,
                  disposicion_Documental: inventario.disposicion_Documental,
                  empleado: inventario.empleado,
                  nombre_Expediente: inventario.nombre_Expediente,
                  clave_Clasificacion: inventario.clave_Clasificacion,
                  no_Expediente_Interno: inventario.no_Expediente_Interno,
                  descripcion: inventario.descripcion,
                  fecha_Inicio: inventario.fecha_Inicio,
                  fecha_Termino: inventario.fecha_Termino,
                  ubicacion_AI: inventario.ubicacion_AI,
                  valor_Documental: inventario.valor_Documental,
                  vigencia_Tramite: inventario.vigencia_Tramite,
                  vigencia_Concentracion: inventario.vigencia_Concentracion,
                  vigencia_Completa: inventario.vigencia_Completa,
                  fecha_Clasificacion: inventario.fecha_Clasificacion,
                  fecha_Desclasificacion: inventario.fecha_Desclasificacion,
                  fecha_Ampliacion: inventario.fecha_Ampliacion,
                  estatus: inventario.estatus,
                  motivo_Rechazo: inventario.motivo_Rechazo,
                  clasificado: inventario.clasificado,
                  clasificado_Texto: inventario.clasificado_Texto,
                  total_Paginas: inventario.total_Paginas,
                  area_Responsable: inventario.area_Responsable,
                  area_Generadora: inventario.area_Generadora,
                  fecha_Recepcion_Transferencia_Primaria: inventario.fecha_Recepcion_Transferencia_Primaria,
                  fecha_Termino_Concentracion: inventario.fecha_Termino_Concentracion,
                  anio: parseInt(anio[anio.length - 1])
                }
              });
              this.inventariosConcentracion = inventariosArray;
              this.inventariosConcentracionFiltro = inventariosArray
            }
            this.loading = false
          } else {
            this.loading = false
            return { success, data }
          }
        } else {
          this.loading = false
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (e) {
        this.isLoading = false
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadInventariosHistorico() {
      try {
        this.isLoading = true
        this.inventarios = []
        const resp = await api.get('/Archivo/InventariosAreasAI/Historico')
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success == true) {
            if (data) {
              const inventariosArray = data.map((inventario) => {
                let anio = inventario.clave_Clasificacion.split("/")
                return {
                  id: inventario.id,
                  inventario_General_Area_Encabezado_Id: inventario.inventario_General_Area_Encabezado_Id,
                  seccion_Id: inventario.seccion_Id,
                  seccion: inventario.seccion,
                  serie_Id: inventario.serie_Id,
                  serie: inventario.serie,
                  sub_Serie_Id: inventario.sub_Serie_Id,
                  sub_Serie: inventario.sub_Serie,
                  disposicion_Documental_Id: inventario.disposicion_Documental_Id,
                  disposicion_Documental: inventario.disposicion_Documental,
                  empleado: inventario.empleado,
                  nombre_Expediente: inventario.nombre_Expediente,
                  clave_Clasificacion: inventario.clave_Clasificacion,
                  no_Expediente_Interno: inventario.no_Expediente_Interno,
                  descripcion: inventario.descripcion,
                  fecha_Inicio: inventario.fecha_Inicio,
                  fecha_Termino: inventario.fecha_Termino,
                  ubicacion_AI: inventario.ubicacion_AI,
                  valor_Documental: inventario.valor_Documental,
                  vigencia_Tramite: inventario.vigencia_Tramite,
                  vigencia_Concentracion: inventario.vigencia_Concentracion,
                  vigencia_Completa: inventario.vigencia_Completa,
                  fecha_Clasificacion: inventario.fecha_Clasificacion,
                  fecha_Desclasificacion: inventario.fecha_Desclasificacion,
                  fecha_Ampliacion: inventario.fecha_Ampliacion,
                  estatus: inventario.estatus,
                  motivo_Rechazo: inventario.motivo_Rechazo,
                  clasificado: inventario.clasificado,
                  clasificado_Texto: inventario.clasificado_Texto,
                  total_Paginas: inventario.total_Paginas,
                  area_Responsable: inventario.area_Responsable,
                  area_Generadora: inventario.area_Generadora,
                  anio: parseInt(anio[anio.length - 1])
                }
              });
              this.inventariosHistorico = inventariosArray;
              this.inventariosHistoricoFiltro = inventariosArray;
            }
            this.loading = false
          } else {
            this.loading = false
            return { success, data }
          }
        } else {
          this.loading = false
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (e) {
        this.isLoading = false
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadInventariosHistoricoFiltro(area, anio) {
      try {
        if (area == 'Ver todos') {
          if (anio == 'Ver todos') {
            this.inventariosHistoricoFiltro = this.inventariosHistorico
          } else {
            this.inventariosHistoricoFiltro = this.inventariosHistorico.filter(x => x.anio == anio)
          }
        } else {
          if (anio == 'Ver todos') {
            this.inventariosHistoricoFiltro = this.inventariosHistorico.filter(x => x.area_Generadora == area)
          } else {
            this.inventariosHistoricoFiltro = this.inventariosHistorico.filter(x => x.anio == anio && x.area_Generadora == area)
          }
        }
      } catch (error) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadInventario(id) {
      try {
        this.initInventario()
        const resp = await api.get(`/Archivo/InventariosAreasAI/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              this.inventario.id = data.id
              this.inventario.seccion_Id = data.seccion_Id
              this.inventario.seccion = data.seccion
              this.inventario.serie_Id = data.serie_Id
              this.inventario.serie = data.serie
              this.inventario.sub_Serie_Id = data.sub_Serie_Id
              this.inventario.sub_Serie = data.sub_Serie
              this.inventario.disposicion_Documental_Id = data.disposicion_Documental_Id
              this.inventario.disposicion_Documental = data.disposicion_Documental
              this.inventario.nombre_Expediente = data.nombre_Expediente
              this.inventario.clave_Clasificacion = data.clave_Clasificacion
              this.inventario.no_Expediente_Interno = data.no_Expediente_Interno
              this.inventario.descripcion = data.descripcion
              this.inventario.fecha_Inicio = data.fecha_Inicio
              this.inventario.fecha_Termino = data.fecha_Termino
              this.inventario.ubicacion_AI = data.ubicacion_AI
              this.inventario.fecha_Clasificacion = data.fecha_Clasificacion
              this.inventario.fecha_Desclasificacion = data.fecha_Desclasificacion
              this.inventario.fecha_Ampliacion = data.fecha_Ampliacion
              this.inventario.valor_Documental = data.valor_Documental
              this.inventario.vigencia_Tramite = data.vigencia_Tramite
              this.inventario.vigencia_Concentracion = data.vigencia_Concentracion
              this.inventario.vigencia_Completa = data.vigencia_Completa
              this.inventario.clasificado = data.clasificado
              this.inventario.total_Paginas = data.total_Paginas
              this.inventario.disposicion_Documental = data.disposicion_Documental
              this.inventario.area_Generadora = data.area_Generadora
              this.inventario.area_Responsable = data.area_Responsable
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

    async updateUbicacion(id, ubicacion) {
      try {
        const resp = await api.post(`/Archivo/InventariosAreasAI/${id}`, { ubicacion })
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            this.loadInventariosConcentracion();
            this.loadInventariosHistorico();
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

    async updateAreaGeneradora(id, area_id) {
      try {
        const resp = await api.put(`/Archivo/InventariosGeneralesAreasEncabezado/${id}`, { 'area_Generadora_Id': area_id })
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            this.loadInventariosConcentracion();
            this.loadInventariosConcentracion();
            return { success, data }
          } else {
            return { success, data }
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (error) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async baja(id) {
      try {
        const resp = await api.get(`/Archivo/InventariosAreasAI/Baja/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            this.loadInventariosConcentracion();
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

    actualizarModal(valor) {
      this.modal = valor
    }

  },
});
