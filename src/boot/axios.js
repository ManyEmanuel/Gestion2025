import { boot } from 'quasar/wrappers'

import axios from 'axios'

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

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response.status === 401) {

      console.log('Error 401: No autorizado');
    }
    return Promise.reject(error);
  }
);


export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api }
