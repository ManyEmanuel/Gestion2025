import { defineStore } from "pinia";
import { api } from "src/boot/axios";

export const useNotificacionStore = defineStore("Notificaciones", {
  state: () => ({
    notificaciones: [],
    notificaciones_all: [],
    no_notificaciones: 0,
  }),

  actions: {
    async loadNotificaciones() {
      try {
        const resp = await api.get("/NotificacionesUniverso");
        if (resp.status == 200) {
          const { success, data } = resp.data;
          if (success == true) {
            if (data) {
              const notificaciones_array = data.notificaciones.map(
                (notificacion) => {
                  return {
                    id: notificacion.id,
                    empleado_Id: notificacion.empleado_Id,
                    empleado: notificacion.empleado,
                    pase_Id: notificacion.pase_Id,
                    pase: notificacion.pase,
                    titulo: notificacion.titulo,
                    mensaje: notificacion.mensaje,
                    leido: notificacion.leido,
                    fecha_Registro: notificacion.fecha_Registro,
                    fecha_Lectura: notificacion.fecha_Lectura,
                    registro_Id: notificacion.registro_Id,
                    sistema: notificacion.sistema,
                    sistema_Id: notificacion.sistema_Id,
                    tipo: notificacion.tipo,
                  };
                }
              );
              let filtro = notificaciones_array.filter((x) => x.leido == false);
              this.notificaciones = filtro;
              this.no_notificaciones = data.no_Notificaciones;
            }
          }
        } else {
          return {
            success: false,
            data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
          };
        }
      } catch (error) {
        return {
          success: false,
          data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
        };
      }
    },

    //---------------------------------------------------------------
    //LEER TODAS
    async loadNotificacionesAll() {
      try {
        const resp = await api.get("/NotificacionesUniverso/GetAll");
        if (resp.status == 200) {
          const { success, data } = resp.data;
          if (success == true) {
            if (data) {
              this.notificaciones_all = data.map((notificacion) => {
                return {
                  empleado_Id: notificacion.empleado_Id,
                  fecha_Lectura: notificacion.fecha_Lectura,
                  fecha_Registro: notificacion.fecha_Registro,
                  id: notificacion.id,
                  leido: notificacion.leido,
                  mensaje: notificacion.mensaje,
                  registro_Id: notificacion.registro_Id,
                  sistema: notificacion.sistema,
                  sistema_Id: notificacion.sistema_Id,
                  tipo: notificacion.tipo,
                  titulo: notificacion.titulo,
                };
              });
            }
          }
        } else {
          return {
            success: false,
            data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
          };
        }
      } catch (error) {
        return {
          success: false,
          data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
        };
      }
    },

    //---------------------------------------------------------------
    //LEER NOTIFICACION
    async leerNotificacion(id) {
      try {
        const resp = await api.get(`/NotificacionesUniverso/Leer/${id}`);
        if (resp.status == 200) {
          const { success, data } = resp.data;
          return { success, data };
        } else {
          return {
            success: false,
            data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
          };
        }
      } catch (error) {
        return {
          success: false,
          data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
        };
      }
    },

    //---------------------------------------------------------------
    //LEER TODAS
    async leerTodas() {
      try {
        const resp = await api.get("/NotificacionesUniverso/LeerTodas");
        if (resp.status == 200) {
          const { success, data } = resp.data;
          return { success, data };
        } else {
          return {
            success: false,
            data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
          };
        }
      } catch (error) {
        return {
          success: false,
          data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
        };
      }
    },

    //---------------------------------------------------------------
    //NO LEER NOTIFICACION
    async noLeer(id) {
      try {
        const resp = await api.get(`/NotificacionesUniverso/NoLeida/${id}`);
        if (resp.status == 200) {
          const { success, data } = resp.data;
          return { success, data };
        } else {
          return {
            success: false,
            data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
          };
        }
      } catch (error) {
        return {
          success: false,
          data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
        };
      }
    },
  },
});
