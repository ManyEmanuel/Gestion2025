import { route } from 'quasar/wrappers'
import { Notify } from 'quasar'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { useAuthNuevoStore } from 'src/stores/auth_nuevo_store'
import { useAuthStore } from 'src/stores/auth_store'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE)
  })

  // Guard de autenticación (login propio del backend nuevo): sin sesión -> /login.
  // Horizonte-1 #F7: el JWT vive en una cookie httpOnly (no la puede leer JS), así que ya no hay un
  // "token" que consultar síncronamente. `sesion_activa` es solo un indicador local no sensible; si
  // está presente y el store aún no cargó /auth/me en esta carga de página (recarga completa), se
  // espera esa llamada antes de decidir -- la autorización real la sigue haciendo el backend.
  Router.beforeEach(async (to, from) => {
    const authStore = useAuthNuevoStore()
    if (localStorage.getItem('sesion_activa') === '1' && !authStore.cargado) {
      await authStore.cargarUsuarioActual()
    }
    const autenticado = authStore.autenticado
    if (to.path !== '/login' && !autenticado) {
      return '/login'
    }
    if (to.path === '/login' && autenticado) {
      return '/'
    }

    // Auditoría UX-003: la guardia solo comprobaba autenticación. Escribir la ruta a mano cargaba la
    // pantalla completa y solo fallaban después las llamadas al API, dejando una pantalla a medio cargar
    // con banners y tablas vacías. No era un fallo de seguridad —el backend responde 403— sino de
    // experiencia. Ahora la ruta se rechaza antes de montar el componente.
    //
    // La regla es la MISMA que la del menú (`puedeVerModulo`): cualquier permiso del grupo. Así, lo que
    // el usuario ve en el menú es exactamente lo que puede abrir escribiendo la URL.
    const siglas = to.meta && to.meta.siglas
    if (siglas && !useAuthStore().puedeVerModulo(siglas)) {
      Notify.create({
        type: 'negative',
        position: 'top-right',
        icon: 'lock',
        message: 'No tiene permiso para acceder a esa pantalla.',
        caption: 'Si necesita el acceso, solicítelo al administrador del sistema.',
        timeout: 5000,
      })
      // Al inicio, no a /login: la sesión es válida; lo que falta es el permiso.
      return from.name ? false : '/'
    }

    return true
  })

  return Router
})
