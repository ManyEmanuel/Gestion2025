import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

export const useInventarioAreaStore = defineStore('InventarioArea', {
  state: () => ({
    modal: false,
    modalVer: false,
    modalAmpliacion: false,
    modalVerAmpliacion: false,
    modalEditar: false,
    isEditar: false,
    loading: false,
    listaAnios: [],
    inventarios: [],
    inventariosOpt: [],
    inventariosOptFiltro: [],
    aniosFiltro: [],
    inventariosArea: [],
    inventariosAreaFiltro: [],
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
      descripcion: null,
      fecha_Inicio: null,
      fecha_Termino: null,
      ubicacion: null,
      vigencia_Tramite: null,
      vigencia_Concentracion: null,
      vigencia_Completa: null,
      fecha_Clasificacion: null,
      fecha_Desclasificacion: null,
      fecha_Ampliacion: null,
      valor_Documental: null,
      clasificado: false,
      clasificado_Texto: null,
      total_Paginas: null,
      total_Ampliacion: null,
    }
  }),
  getters: {
  },
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
      this.inventario.descripcion = null;
      this.inventario.fecha_Inicio = null;
      this.inventario.fecha_Termino = null;
      this.inventario.ubicacion = null;
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
    },

    async loadInventarios(encabezadoId) {
      try {
        this.loading = true
        this.inventarios = []
        const resp = await api.get(`/Archivo/InventariosGneralesAreas/ByEncabezado/${encabezadoId}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success == true) {
            if (data) {
              data.forEach(element => {
                const { id, inventario_General_Area_Encabezado_Id, seccion_Id, seccion, serie_Id, serie, sub_Serie_Id, sub_Serie,
                  disposicion_Documental_Id, empleado, nombre_Expediente, clave_Clasificacion,
                  descripcion, fecha_Inicio, fecha_Termino, ubicacion, valor_Documental, vigencia_Tramite, vigencia_Concentracion
                  , vigencia_Completa, disposicion_Documental, fecha_Clasificacion, fecha_Desclasificacion, fecha_Ampliacion, estatus, motivo_Rechazo,
                  clasificado, clasificado_Texto, total_Paginas, total_Ampliacion
                } = element;
                const obj = {
                  id, inventario_General_Area_Encabezado_Id, seccion_Id, seccion, serie_Id, serie, sub_Serie_Id, sub_Serie,
                  disposicion_Documental_Id, empleado, nombre_Expediente, clave_Clasificacion,
                  descripcion, fecha_Inicio, fecha_Termino, ubicacion, valor_Documental, vigencia_Tramite, vigencia_Concentracion
                  , vigencia_Completa, disposicion_Documental, fecha_Clasificacion, fecha_Desclasificacion, fecha_Ampliacion, estatus, motivo_Rechazo,
                  clasificado, clasificado_Texto, total_Paginas, total_Ampliacion, Seleccion: false
                }
                this.inventarios.push(obj)
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
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadInventariosByAreaYear(area, year) {
      try {
        this.loading = true
        this.inventarios = []
        const resp = await api.get(`/Archivo/InventariosGneralesAreas/GetByArea/${area}/${year}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success == true) {
            if (data) {
              const inventariosArray = data.map((inventario) => {
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
                  descripcion: inventario.descripcion,
                  fecha_Inicio: inventario.fecha_Inicio,
                  fecha_Termino: inventario.fecha_Termino,
                  ubicacion: inventario.ubicacion,
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
                }
              });
              this.inventariosArea = inventariosArray;
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
      } catch (error) {
        this.loading = false
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadInventariosByArea() {
      try {
        this.loading = true
        this.inventariosArea = []
        const resp = await api.get('/Archivo/InventariosGneralesAreas/ByArea')
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success == true) {
            if (data) {
              data.forEach(element => {
                const { id, inventario_General_Area_Encabezado_Id, seccion_Id, seccion, serie_Id, serie, sub_Serie_Id, sub_Serie,
                  disposicion_Documental_Id, empleado, nombre_Expediente, clave_Clasificacion,
                  descripcion, fecha_Inicio, fecha_Termino, ubicacion, valor_Documental, vigencia_Tramite, vigencia_Concentracion
                  , vigencia_Completa, disposicion_Documental, fecha_Clasificacion, fecha_Desclasificacion, fecha_Ampliacion, estatus, motivo_Rechazo,
                  clasificado, clasificado_Texto
                } = element;
                const obj = {
                  id, inventario_General_Area_Encabezado_Id, seccion_Id, seccion, serie_Id, serie, sub_Serie_Id, sub_Serie,
                  disposicion_Documental_Id, empleado, nombre_Expediente, clave_Clasificacion,
                  descripcion, fecha_Inicio, fecha_Termino, ubicacion, valor_Documental, vigencia_Tramite, vigencia_Concentracion
                  , vigencia_Completa, disposicion_Documental, fecha_Clasificacion, fecha_Desclasificacion, fecha_Ampliacion, estatus, motivo_Rechazo,
                  clasificado, clasificado_Texto
                }
                this.inventariosArea.push(obj)
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
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }

    },

    async loadInventariosAreaOpt(secciones, year_Inicio, year_Fin) {
      try {
        this.inventariosOpt = []
        const secciones_id = secciones.map(element => {
          return element.value
        })

        const resp = await api.post(`/Archivo/InventariosGneralesAreas/ByAreaOpt`, { "Secciones_Id": secciones_id, "year_Inicio": parseInt(year_Inicio), "year_Fin": parseInt(year_Fin) })
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success == true) {
            if (data) {
              const inventarioOpt = data.map((inventario) => {
                const { label, value } = inventario
                return {
                  label, value
                }
              })
              this.inventariosOpt = inventarioOpt
            }
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

    async loadInventariosByAreaOptAI(secciones, areaId, year_Inicio, year_Fin) {
      try {
        this.inventariosOpt = []
        const secciones_id = secciones.map(element => {
          return element.value
        })
        const resp = await api.post(`/Archivo/InventariosGneralesAreas/ByAreaOptAI/${areaId}`, { "Secciones_Id": secciones_id, "Year_Inicio": year_Inicio, "Year_Fin": year_Fin })
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success == true) {
            if (data) {
              const inventarioOpt = data.map((inventario) => {
                const { label, value } = inventario
                return {
                  label, value
                }
              })
              this.inventariosOpt = inventarioOpt
            }
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

    async loadInventarioOptAi() {
      try {
        const resp = await api.get(`/Archivo/InventariosAreasAI/GetLista`)
        if (resp.status == 200) {
          const { success, data } = resp.data

          if (success) {
            if (data) {
              this.inventariosOpt = data.map((element) => {
                const { label, value } = element
                return {
                  label, value
                }
              })
            }
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (error) {
        console.log(error)
      }
    },

    async loadInventarioOptAiHistorico(historico) {
      try {
        const respArea = await api.get("/Areas/AreaByUsuario")
        let area = respArea.data.data.area
        let resp = null
        if (historico) {
          resp = await api.get(`/Archivo/InventariosAreasAI/Historico`)
        }
        else {
          resp = await api.get(`/Archivo/InventariosAreasAI/Concentracion`)
        }

        if (resp.status == 200) {
          this.aniosFiltro = []
          this.inventariosOpt = []
          this.inventariosOptFiltro = []
          const { success, data } = resp.data
          let resultados = data.filter(x => x.area_Generadora == area)
          if (success) {
            let anios = []
            if (data) {

              this.inventariosOpt = resultados.map((element) => {
                const { clave_Clasificacion, nombre_Expediente, id } = element
                anios.push(clave_Clasificacion.split("/")[clave_Clasificacion.split("/").length - 1])
                return {
                  label: clave_Clasificacion + " - " + nombre_Expediente, value: id, anio: parseInt(clave_Clasificacion.split("/")[clave_Clasificacion.split("/").length - 1])
                }
              })
            }
            if (this.inventariosOpt.length > 0) {
              let aniosUnicos = [...new Set(anios)]
                .map(Number) // Convertir a enteros
                .sort((a, b) => a - b); // Ordenar de menor a mayor
              this.aniosFiltro = aniosUnicos
            }
          }
          if (this.inventariosOpt.length > 0) { await this.loadFiltroAnio(this.aniosFiltro[0]) }

        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (error) {
        console.log(error)
      }
    },

    async loadFiltroAnio(anio) {
      try {
        console.log("esto es anio", anio)
        this.inventariosOptFiltro = this.inventariosOpt.filter(x => x.anio == anio)
      } catch (error) {
        console.log(error)
      }
    },

    async loadInventariosAreaOptAI(seccionId, areaId) {
      try {
        this.inventariosOpt = []
        const resp = await api.get(`/Archivo/InventariosGneralesAreas/ByAreaOptAI/${seccionId}/${areaId}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success == true) {
            if (data) {
              const inventarioOpt = data.map((inventario) => {
                const { label, value } = inventario
                return {
                  label, value
                }
              })
              this.inventariosOpt = inventarioOpt
            }
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

    async loadInventariosArea(areaId) {
      try {
        this.inventariosArea = []
        let listaAnio = []
        const resp = await api.get(`/Archivo/InventariosGneralesAreas/ByArea/${areaId}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success == true) {
            if (data) {
              const inventarioOpt = data.map((inventario) => {
                const { label, value } = inventario
                let filtroUno = label.split("-")
                let filtroDos = filtroUno[0].split("/")
                let anio = parseInt(filtroDos[filtroDos.length - 1])
                listaAnio.push(anio)
                return {
                  label, value, anio
                }
              })
              this.inventariosArea = inventarioOpt
              this.listaAnios = [...new Set(listaAnio)];
              this.listaAnios.sort((a, b) => a - b);
            }
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

    async loadInventariosAreaAnio(anio) {
      try {
        this.inventariosAreaFiltro = this.inventariosArea.filter(x => x.anio == anio)

      } catch (error) {
        console.error(error)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadInventariosAreaClasificado(areaId) {
      try {
        this.inventariosArea = []
        const resp = await api.get(`/Archivo/InventariosGneralesAreas/ByAreaClasificado/${areaId}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success == true) {
            if (data) {
              const inventarioOpt = data.map((inventario) => {
                const { label, value } = inventario
                return {
                  label, value
                }
              })
              this.inventariosArea = inventarioOpt
            }
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

    async loadInventario(id) {
      try {
        this.initInventario()
        const resp = await api.get(`/Archivo/InventariosGneralesAreas/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              console.log(data)
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
              this.inventario.descripcion = data.descripcion
              this.inventario.fecha_Inicio = data.fecha_Inicio
              this.inventario.fecha_Termino = data.fecha_Termino
              this.inventario.ubicacion = data.ubicacion
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
              this.inventario.total_Ampliacion = data.total_Ampliacion
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

    setInventario(id) {
      try {
        const inventarioSeleccionado = this.inventarios.find(element => element.id == id);
        this.inventario.id = inventarioSeleccionado.id
        this.inventario.clave_Clasificacion = inventarioSeleccionado.clave_Clasificacion
        this.inventario.total_Ampliacion = inventarioSeleccionado.total_Ampliacion
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async createInventario(inventario, encabezado_id) {
      try {

        const resp = await api.post(`/Archivo/InventariosGneralesAreas/${encabezado_id}`, inventario)
        if (resp.status == 200) {
          const { success, data, id } = resp.data
          if (success === true) {
            this.loadInventarios(encabezado_id);
            return { success, data, id }
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

    async updateInventario(inventario, id, encabezado_Id) {
      try {

        const resp = await api.put(`/Archivo/InventariosGneralesAreas/${id}`, inventario)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            console.log(encabezado_Id)
            this.loadInventarios(encabezado_Id);
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

    async deleteInventario(id, encabezado_Id) {
      try {
        const resp = await api.delete(`/Archivo/InventariosGneralesAreas/${id}`)
        if (resp.status == 200) {
          let { success, data } = resp.data
          if (success === true) {
            this.loadInventarios(encabezado_Id);
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

    async aprobarInventario(id, encabezadoId) {
      try {
        const resp = await api.get(`/Archivo/InventariosGneralesAreas/Aprobar/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success == true) {
            this.loadInventarios(encabezadoId)
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

    async rechazarInventario(id, encabezadoId, motivo) {
      try {
        const resp = await api.post(`/Archivo/InventariosGneralesAreas/Rechazar/${id}`, { motivo })
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success == true) {
            this.loadInventarios(encabezadoId)
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

    async ampliarVigencia(id, ampliacion, encabezadoId) {
      try {
        const resp = await api.post(`/Archivo/InventariosGneralesAreas/Ampliar/${id}`, ampliacion, {
          headers: {
            'Conten-Type': 'multipart/form-data'
          }
        }
        )
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success == true) {
            this.loadInventarios(encabezadoId);
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

    actualizarModal(valor) {
      this.modal = valor
    },

    actualizarModalEditar(valor) {
      this.modalEditar = valor
    },

    actualizarModalVer(valor) {
      this.modalVer = valor
    },

    actualizarModalAmpliacion(valor) {
      this.modalAmpliacion = valor
    },

    actualizarModalVerAmpliacion(valor) {
      this.modalVerAmpliacion = valor
    },

    updateEditar(valor) {
      this.isEditar = valor
    },

  },
});
