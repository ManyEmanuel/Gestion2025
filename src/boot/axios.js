import { boot } from 'quasar/wrappers'

import axios from 'axios'
import { Notify } from 'quasar'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
// Corte al backend nuevo (UniversoArchivo): baseURL parametrizada por entorno
// (quasar.config.js > build.env.API_URL). Por defecto apunta al backend NUEVO local (:5120); en
// build/producción se define API_URL con la URL del backend nuevo. Se retiró el default legado (:9270)
// y la apiLog legada (:9120), que ya no se usan.
const api = axios.create({ baseURL: process.env.API_URL || 'http://localhost:5120/api' })

api.interceptors.request.use((config) => {
  config.headers = {
    'Authorization': `Bearer ${localStorage.getItem('key')}`
  }
  return config
});

// Router inyectado por el boot para poder redirigir a /login cuando expira la sesión.
let routerInstance = null
// Evita notificar/redirigir más de una vez cuando varias peticiones fallan a la vez con 401;
// se libera al llegar a /login para que una sesión expirada posterior vuelva a avisar.
let manejando401 = false

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && !manejando401) {
      manejando401 = true
      localStorage.removeItem('key')
      localStorage.removeItem('usuario_nuevo')
      Notify.create({ type: 'warning', message: 'Su sesión expiró. Vuelva a iniciar sesión.' })
      routerInstance?.push('/login')
    }
    return Promise.reject(error);
  }
);


export default boot(({ app, router }) => {
  routerInstance = router
  router.afterEach((to) => {
    if (to.path === '/login') manejando401 = false
  })

  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api }
