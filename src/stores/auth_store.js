import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

// Corte al backend nuevo: los permisos por módulo se derivan de los claims del JWT
// (no del endpoint legado /PermisosModulosUsuarios). Mapa siglas del cliente -> grupo
// de permiso archivo.<grupo>.*. Se extiende a medida que se migra cada módulo.
const MAPA_SIGLAS_GRUPO = {
  'AI-CAT-SECCIONES': 'clasificacion',
  'AI-CAT-DISP-DOC': 'disposicion',
  'AI-INV-AREA': 'inventario',
  'AI-TP': 'transferencia',
  'AI-CJS-TRANS': 'transferencia',
};

function permisosDelToken() {
  try {
    const token = localStorage.getItem('key');
    if (!token) return [];
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(decodeURIComponent(escape(atob(base64))));
    const p = payload.permiso;
    return Array.isArray(p) ? p : (p ? [p] : []);
  } catch (e) {
    console.log(e);
    return [];
  }
}

export const useAuthStore = defineStore('AuthStore', {
  state: () => ({
    modulos: [],
    apps: [],
    modulo: null
  }),

  actions: {

    async validarToken(token, sistemaId) {
      try {
        const resp = await api.get(`/Accesos/ValidaToken/?token=${token}&SistemaId=${sistemaId}`)
        if (resp.status == 200) {
          const { success, data, empleado, perfil, perfil_Id, area, area_Id, puesto, puesto_Id } = resp.data
          if (success === true) {
            localStorage.setItem("empleado", empleado)
            localStorage.setItem("perfil", perfil)
            localStorage.setItem("perfil_Id", perfil_Id)
            localStorage.setItem("area", area)
            localStorage.setItem("area_Id", area_Id)
            localStorage.setItem("puesto", puesto)
            localStorage.setItem("puesto_Id", puesto_Id)
            return success;
          } else {
            return { success }
          }
        } else {
          return { success: false, data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte" }
        }
      } catch (error) {
        console.log(error)
        return { success: false, data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte" }
      }
    },

    async loadModulos() {
      try {
        const sistema = localStorage.getItem('sistema')
        const resp = await api.get(`/PermisosModulosUsuarios/Bysuario/${sistema}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              const modulosArray = data.map((modulo) => {
                return {
                  siglas_Modulo: modulo.siglas_Modulo,
                  registrar: modulo.registrar,
                  actualizar: modulo.actualizar,
                  eliminar: modulo.eliminar,
                  leer: modulo.leer
                }
              })
              this.modulos = modulosArray;
            }
          } else {
            return { success, data }
          }
        } else {
          return { success: false, data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte" }
        }
      } catch (error) {
        console.log(error)
        return { success: false, data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte" }
      }
    },


    async loadSistemas() {
      try {
        const resp = await api.get(`/SistemasUsuarios/ByUSuario`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              const sistemasArray = data.map((sistema) => {
                return {
                  sistema_Id: sistema.sistema_Id,
                  sistema: sistema.sistema,
                  url: sistema.url
                }
              })
              this.sistemas = sistemasArray;

              const appsArray = data.map((app) => {
                return {
                  id: app.sistema_Id,
                  label: app.sistema,
                  avatar: app.logo_Url,
                  url: app.url,
                }
              })

              const logOut = {
                id: 0,
                label: "Cerrar sesión",
                avatar: "http://sistema.ieenayarit.org:9270/Imagenes/Sistemas/dbb9640f-dd18-4fc3-b530-7041d8594240.png",
                url: "",
              }
              const universoIEEN = {
                id: 0,
                label: "Ir a universo",
                avatar: "http://sistema.ieenayarit.org:9270/Imagenes/Sistemas/67cfdabe-0538-4324-b711-93bcb6cb9a60.png",
                url: "",
              }

              appsArray.push(universoIEEN);
              appsArray.push(logOut);
              this.apps = appsArray;
            }
          } else {
            return { success, data }
          }
        } else {
          return { success: false, data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte" }
        }
      } catch (error) {
        console.log(error)
        return { success: false, data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte" }
      }
    },


    async loadModulo(siglas) {
      // Backend nuevo: deriva los permisos del módulo desde los claims del JWT.
      const grupo = MAPA_SIGLAS_GRUPO[siglas];
      if (!grupo) {
        // Módulo aún no mapeado (migración por fases): permisivo en UI; el backend
        // aplica 401/403 en cada llamada real.
        this.modulo = { siglas_Modulo: siglas, leer: true, registrar: true, actualizar: true, eliminar: true };
        return;
      }
      const permisos = permisosDelToken();
      this.modulo = {
        siglas_Modulo: siglas,
        leer: permisos.includes(`archivo.${grupo}.ver`),
        registrar: permisos.includes(`archivo.${grupo}.registrar`),
        actualizar: permisos.includes(`archivo.${grupo}.actualizar`),
        eliminar: permisos.includes(`archivo.${grupo}.eliminar`),
      };
    },
  },
});
