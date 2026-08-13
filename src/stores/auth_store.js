import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

// Corte al backend nuevo: los permisos por módulo se derivan de los claims del JWT
// (no del endpoint legado /PermisosModulosUsuarios). Mapa siglas del cliente -> grupo
// de permiso archivo.<grupo>.*. Se extiende a medida que se migra cada módulo.
// Mapa siglas del cliente -> grupo de permiso archivo.<grupo>.*. Incluye tanto las páginas
// (loadModulo por-página) como los ítems de menú (loadModulos, construido desde el JWT). Solo se
// listan los módulos MIGRADOS y verificados; los que quedan diferidos se omiten a propósito.
const MAPA_SIGLAS_GRUPO = {
  'AI-CAT-SECCIONES': 'clasificacion',
  'AI-CAT-DISP-DOC': 'disposicion',
  'AI-INV-AREA': 'inventario',
  'AI-INV-AREA-AI': 'inventario',
  'AI-INV-AREA-GRAL': 'inventario',
  'AI-TP': 'transferencia',
  'AI-TP-AI': 'transferencia',
  'AI-CJS-TRANS': 'transferencia',
  'AI-CJS-TRANS-AI': 'transferencia',
  'AI-TS': 'transferencia-secundaria',
  'AI-CJS-TRNS-SEC': 'transferencia-secundaria',
  'AI-BD': 'baja',
  'AI-CJS-BAJAS': 'baja',
  'AI-CAT-ENLACE': 'enlace',
  'AI-CAT-VOBO': 'visto-bueno',
  'AI-PRESTAMOS': 'prestamo',
  'AI-PRESTAMOS-CLASI': 'prestamo',
  'AI-PRESTAMOS-AI': 'prestamo',
  'AI-PRESTAMOS-AI-AI': 'prestamo',
  // Cumplimiento LGA/Nayarit (Fases 3-4): planeación, grupo interdisciplinario, preservación,
  // interoperabilidad y avisos. Los avisos reutilizan el permiso de transferencia secundaria.
  'AI-PADA': 'pada',
  'AI-GRUPO': 'grupo',
  'AI-PRESERVACION': 'preservacion',
  'AI-INTEROP': 'interoperabilidad',
  'AI-AVISOS': 'transferencia-secundaria',
};

// Siglas que son ítems de MENÚ (top-level). Un subconjunto de MAPA_SIGLAS_GRUPO: las páginas de
// cajas (AI-CJS-*) se navegan desde dentro de su encabezado, no van en el menú.
const SIGLAS_MENU = [
  'AI-CAT-SECCIONES', 'AI-CAT-DISP-DOC', 'AI-CAT-ENLACE', 'AI-CAT-VOBO',
  'AI-INV-AREA', 'AI-TP', 'AI-TP-AI', 'AI-INV-AREA-AI', 'AI-TS', 'AI-BD',
  'AI-PRESTAMOS', 'AI-PRESTAMOS-CLASI', 'AI-PRESTAMOS-AI', 'AI-PRESTAMOS-AI-AI',
  'AI-AVISOS', 'AI-PADA', 'AI-GRUPO', 'AI-PRESERVACION', 'AI-INTEROP',
];

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
    sistemas: [],
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

    // MIGRADO al backend nuevo (corte de clientes): el MENÚ se construye desde los permisos del JWT
    // (claims `permiso` = archivo.<grupo>.<acción>), NO del endpoint legado del portal
    // /PermisosModulosUsuarios. Cada ítem de menú (SIGLAS_MENU) se incluye si el usuario tiene
    // `archivo.<grupo>.ver`; los flags registrar/actualizar/eliminar se derivan igual.
    async loadModulos() {
      const permisos = permisosDelToken()
      const modulos = []
      for (const sigla of SIGLAS_MENU) {
        const grupo = MAPA_SIGLAS_GRUPO[sigla]
        // El ítem se muestra si el usuario tiene CUALQUIER permiso del grupo (algunos grupos no tienen
        // `.ver` sino acciones propias, p.ej. interoperabilidad.exportar / preservacion.ejecutar).
        if (grupo && permisos.some((p) => p.startsWith(`archivo.${grupo}.`))) {
          modulos.push({
            siglas_Modulo: sigla,
            leer: true,
            registrar: permisos.includes(`archivo.${grupo}.registrar`),
            actualizar: permisos.includes(`archivo.${grupo}.actualizar`),
            eliminar: permisos.includes(`archivo.${grupo}.eliminar`),
          })
        }
      }
      this.modulos = modulos
      return { success: true }
    },

    // Comprueba un permiso concreto del JWT (para acciones no estándar: aprobar/publicar/ejecutar/exportar).
    tienePermiso(clave) {
      return permisosDelToken().includes(clave)
    },


    // MIGRADO al backend nuevo (corte de clientes): el cliente ya es autónomo (login propio); se retiró
    // la integración con el portal SSO (/SistemasUsuarios/ByUSuario) y sus avatares en :9270. El lanzador
    // de apps queda con una sola acción: Cerrar sesión (la maneja el layout limpiando el token -> /login).
    async loadSistemas() {
      this.sistemas = []
      this.apps = [
        { id: 0, label: "Cerrar sesión", icon: "logout", url: "" },
      ]
      return { success: true }
    },


    async loadModulo(siglas) {
      // Backend nuevo: deriva los permisos del módulo desde los claims del JWT.
      const grupo = MAPA_SIGLAS_GRUPO[siglas];
      if (!grupo) {
        // Corte cerrado: todas las siglas de página en uso están mapeadas, así que una sigla no mapeada
        // es un error/uso no previsto → default RESTRICTIVO (sin permisos en UI). El backend igual aplica
        // 401/403; esto solo evita mostrar controles para módulos desconocidos. Para habilitar un módulo
        // nuevo, agregar su sigla a MAPA_SIGLAS_GRUPO.
        console.warn('loadModulo: sigla no mapeada en MAPA_SIGLAS_GRUPO ->', siglas);
        this.modulo = { siglas_Modulo: siglas, leer: false, registrar: false, actualizar: false, eliminar: false };
        return;
      }
      const permisos = permisosDelToken();
      this.modulo = {
        siglas_Modulo: siglas,
        // leer = cualquier permiso del grupo (algunos grupos no tienen `.ver`, p.ej. interoperabilidad).
        leer: permisos.some((p) => p.startsWith(`archivo.${grupo}.`)),
        registrar: permisos.includes(`archivo.${grupo}.registrar`),
        actualizar: permisos.includes(`archivo.${grupo}.actualizar`),
        eliminar: permisos.includes(`archivo.${grupo}.eliminar`),
      };
    },
  },
});
