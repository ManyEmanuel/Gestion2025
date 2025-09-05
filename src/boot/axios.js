import { boot } from 'quasar/wrappers'

import axios from 'axios'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
//Produccion
const api = axios.create({ baseURL: 'http://sistema.ieenayarit.org:9270/api' })
//const api = axios.create({ baseURL: 'https://pgcfrl9c-7289.usw3.devtunnels.ms/api' })

const apiLog = axios.create({ baseURL: "http://sistema.ieenayarit.org:9120/api" });

//Desarrollo
// const api = axios.create({ baseURL: 'http://sistema.ieenayarit.org:9170/api' })

// const apiLog = axios.create({ baseURL: "http://sistema.ieenayarit.org:9170/api" });

// Local
// const api = axios.create({ baseURL: "https://localhost:7289/api" });

// const apiLog = axios.create({ baseURL: "https://localhost:7289/api" });

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

export { api, apiLog }
