import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

export const useAreaStore = defineStore('Areas', {
  state: () => ({
    areas: [],
    areasHijas: [],
    empleados: [],
    area: {
      id: null,
      area: null
    }
  }),

  actions: {

    initAreasHijas() {
      this.areasHijas = []
    },

    initArea() {
      this.area.id = null
      this.area.area = null
    },

    async loadListaAreas() {
      try {
        this.areas = []
        const resp = await api.get('/Areas')
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              let areasArray = data.map((area) => {
                return {
                  label: `${area.siglas} - ${area.nombre}`,
                  value: area.id
                }
              })
              this.areas = areasArray;
            }
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

    async loadPadreByHija(id) {
      try {
        const resp = await api.get(`/Areas/AreaByHija/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              this.area.id = data.id
              this.area.area = data.nombre
            }
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

    async loadListaByPadre(id) {
      try {
        this.areasHijas = []
        const resp = await api.get(`/Areas/ByPadre/${id}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              let areasArray = data.map((area) => {
                return {
                  label: area.label,
                  value: area.value
                }
              })
              this.areasHijas = areasArray;
            }
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

    async loadEmpleadosByArea(areaid) {
      try {
        console.log(areaid)
        const resp = await api.get(`/Empleados/ByArea/${areaid}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              let empleadosArray = data.map((empleado) => {
                return {
                  label: `${empleado.nombres} ${empleado.apellido_Paterno} ${empleado.apellido_Materno}`,
                  value: empleado.id
                }
              })
              this.empleados = empleadosArray
            }
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

    async loadEmpleadosTodos() {
      try {
        const resp = await api.get(`/Empleados/GetLista`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              let empleadosArray = data.map((empleado) => {
                return {
                  label: empleado.label,
                  value: empleado.value
                }
              })
              this.empleados = empleadosArray
            }
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

    async loadEmpleados() {
      try {
        const resp = await api.get(`/Empleados/ByArea`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              let empleadosArray = data.map((empleado) => {
                return {
                  label: `${empleado.nombres} ${empleado.apellido_Paterno} ${empleado.apellido_Materno}`,
                  value: empleado.id
                }
              })
              this.empleados = empleadosArray
            }
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
  },
});
