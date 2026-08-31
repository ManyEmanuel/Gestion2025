import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { useAuthNuevoStore } from 'src/stores/auth_nuevo_store';

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
  'AI-TP-CANDIDATOS': 'transferencia',
  'AI-CJS-TRANS': 'transferencia',
  'AI-CJS-TRANS-AI': 'transferencia',
  'AI-TS': 'transferencia-secundaria',
  'AI-CJS-TRNS-SEC': 'transferencia-secundaria',
  'AI-BD': 'baja',
  'AI-CJS-BAJAS': 'baja',
  'AI-BD-CANDIDATOS': 'baja',
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
  'AI-TABLERO': 'tablero',
  // Auditoría P2: búsqueda global de expedientes. Reutiliza el permiso de inventario, que es lo que el
  // endpoint exige.
  'AI-BUSQUEDA': 'inventario',
  // Auditoría FUNC-001: consulta de la bitácora de trazabilidad (coordinación / OIC). Solo lectura.
  'AI-BITACORA': 'bitacora',
  'AI-UBICACIONES': 'ubicacion-fisica',
  // Horizonte-3 #DF-8: escanear código QR/barras. Reutiliza el permiso de inventario (leer para
  // resolver el código, registrar para actualizar la ubicación física vía el editor existente).
  'AI-QR-ESCANEAR': 'inventario',
  // Administración (ámbito global): áreas y su jerarquía. Grupo `administracion.areas` -> los flags
  // leer/registrar/actualizar/eliminar salen de archivo.administracion.areas.{ver,registrar,actualizar,eliminar}.
  'AI-ADMIN-AREAS': 'administracion.areas',
  'AI-ADMIN-EMPLEADOS': 'administracion.empleados',
  'AI-ADMIN-USUARIOS': 'administracion.usuarios',
  'AI-ADMIN-PERFILES': 'administracion.perfiles',
};

// Siglas que son ítems de MENÚ (top-level). Un subconjunto de MAPA_SIGLAS_GRUPO: las páginas de
// cajas (AI-CJS-*) se navegan desde dentro de su encabezado, no van en el menú.
const SIGLAS_MENU = [
  'AI-CAT-SECCIONES', 'AI-CAT-DISP-DOC', 'AI-CAT-ENLACE', 'AI-CAT-VOBO',
  'AI-INV-AREA', 'AI-TP', 'AI-TP-AI', 'AI-TP-CANDIDATOS', 'AI-INV-AREA-AI', 'AI-TS', 'AI-BD', 'AI-BD-CANDIDATOS',
  'AI-PRESTAMOS', 'AI-PRESTAMOS-CLASI', 'AI-PRESTAMOS-AI', 'AI-PRESTAMOS-AI-AI',
  'AI-AVISOS', 'AI-PADA', 'AI-GRUPO', 'AI-PRESERVACION', 'AI-INTEROP', 'AI-TABLERO', 'AI-UBICACIONES', 'AI-QR-ESCANEAR',
  'AI-BITACORA', 'AI-BUSQUEDA',
  'AI-ADMIN-AREAS', 'AI-ADMIN-EMPLEADOS', 'AI-ADMIN-USUARIOS', 'AI-ADMIN-PERFILES',
];

// Horizonte-1 #F7: antes decodificaba el JWT de localStorage; el token ahora vive en una cookie httpOnly
// que JS no puede leer. Los permisos (congelados al login, igual que antes) se leen del estado ya
// cargado por auth_nuevo_store desde GET /api/auth/me.
function permisosDelToken() {
  return useAuthNuevoStore().permisos || [];
}

export const useAuthStore = defineStore('AuthStore', {
  state: () => ({
    modulos: [],
    apps: [],
    sistemas: [],
    modulo: null
  }),

  actions: {

    // Auditoría ARCH-001: aquí estaba `validarToken`, que llamaba a `/Accesos/ValidaToken` del portal SSO
    // legado. Ese endpoint NO existe en el backend nuevo (404 siempre) desde el corte al login propio, y
    // lo único que hacía era sembrar en localStorage claves (`empleado`, `perfil`, `area`, `puesto`…) que
    // ya nadie leía. Retirado: la identidad viene de GET /api/auth/me vía `auth_nuevo_store`.

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

    // Auditoría UX-003: ¿el usuario puede entrar al módulo de esa sigla? Es la MISMA regla que usan el
    // menú y `loadModulo().leer` (cualquier permiso del grupo), extraída para que la guardia del router
    // decida antes de montar la pantalla en vez de dejarla cargar y fallar después contra el API.
    // Una sigla no mapeada devuelve false, igual que en `loadModulo`: default restrictivo.
    puedeVerModulo(siglas) {
      const grupo = MAPA_SIGLAS_GRUPO[siglas]
      if (!grupo) {
        console.warn('puedeVerModulo: sigla no mapeada en MAPA_SIGLAS_GRUPO ->', siglas)
        return false
      }
      return permisosDelToken().some((p) => p.startsWith(`archivo.${grupo}.`))
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
