import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

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

    async loadEncabezados() {
      try {
        this.encabezados = []
        this.loadindg = true
        const resp = await api.get("/Archivo/InventariosGeneralesAreasEncabezado")
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
                this.encabezados.push(encabezadoItem);
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

    async loadArea() {
      try {
        const resp = await api.get("/Areas/AreaByUsuario")
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              const { id, area_Id, area, area_Padre_Id, area_Padre } = data;
              this.encabezado.id = id;
              this.encabezado.area_Generadora_Id = area_Id;
              this.encabezado.area_Generadora = area;
              this.encabezado.area_Responsable_Id = area_Padre_Id;
              this.encabezado.area_Responsable = area_Padre;
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

    async loadEncabezado(id) {
      try {
        this.initEncabezado()
        const resp = await api.get(`/Archivo/InventariosGeneralesAreasEncabezado/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              this.encabezado.id = data.id
              this.encabezado.area_Responsable_Id = data.area_Responsable_Id
              this.encabezado.area_Responsable = data.area_Responsable
              this.encabezado.area_Generadora_Id = data.area_Generadora_Id
              this.encabezado.area_Generadora = data.area_Generadora
              this.encabezado.enlace_Id = data.enlace_Id
              this.encabezado.enlace = data.enlace
              this.encabezado.puesto_Enlace = data.puesto_Enlace
              this.encabezado.valido_Id = data.valido_Id
              this.encabezado.valido = data.valido
              this.encabezado.puesto_Valido = data.puesto_Valido
              this.encabezado.visto_Bueno_Id = data.visto_Bueno_Id
              this.encabezado.visto_Bueno = data.visto_Bueno
              this.encabezado.puesto_Visto_Bueno = data.puesto_Visto_Bueno
              this.encabezado.supervisa_Id = data.supervisa_Id
              this.encabezado.supervisa = data.supervisa
              this.encabezado.puesto_Supervisa = data.puesto_Supervisa
              this.encabezado.nombre = data.nombre
              this.encabezado.fecha_Registro = data.fecha_Registro
              this.encabezado.ano = data.ano
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

    async loadResponsableArea() {
      try {
        const resp = await api.get("/ResponsablesAreas/ResposableByUsuario")
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              const { empleado_Id, empleado } = data;
              this.encabezado.valido_Id = empleado_Id;
              this.encabezado.valido = empleado;
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

    async loadVoBo() {
      try {
        const resp = await api.get("/Archivo/InventariosGeneralesAreasEncabezado/GetVoBo")
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              const { empleado_Id, empleado } = data;
              this.encabezado.visto_Bueno_Id = empleado_Id;
              this.encabezado.visto_Bueno = empleado;
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

    async loadSupervisa() {
      try {
        const resp = await api.get("/Archivo/InventariosGeneralesAreasEncabezado/GetSupervisa")
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              const { empleado_Id, empleado } = data;
              this.encabezado.supervisa_Id = empleado_Id;
              this.encabezado.supervisa = empleado;
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

    async loadEnlace() {
      try {
        const resp = await api.get("/Archivo/Enlace/ByUsuario")
        if (resp.status == 200) {
          const { success, id, enlace } = resp.data
          if (success === true) {
            this.encabezado.enlace_Id = id
            this.encabezado.enlace = enlace
            return { success }
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

    async loadRespArchivo() {
      try {
        const resp = await api.get("/Archivo/InventariosGeneralesAreasEncabezado/GetRespArchivo")
        if (resp.status == 200) {
          const { success, id, empleado } = resp.data
          if (success === true) {
            this.encabezado.visto_Bueno_Id = id
            this.encabezado.visto_Bueno = empleado
            return { success }

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

    async createEncabezado(encabezado) {
      try {
        const resp = await api.post("/Archivo/InventariosGeneralesAreasEncabezado", encabezado)
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
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
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
