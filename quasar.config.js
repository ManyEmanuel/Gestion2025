/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js


const ESLintPlugin = require('eslint-webpack-plugin')

// Carga .env (si existe) antes de leer process.env.* más abajo — permite configurar la marca del
// despliegue (nombre, institución, etc.) en un archivo en vez de exportar variables a mano. Ver
// .env.example. No falla si no hay .env (desarrollo local usa los defaults del código).
// quiet: true evita que dotenv imprima sus "tips" promocionales (incluye anuncios de productos de
// terceros del propio mantenedor del paquete) en cada arranque de "quasar dev"/"quasar build".
require('dotenv').config({ quiet: true })

const { configure } = require('quasar/wrappers');

module.exports = configure(function (ctx) {
  return {
    // https://v2.quasar.dev/quasar-cli-webpack/supporting-ts
    supportTS: false,

    // https://v2.quasar.dev/quasar-cli-webpack/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli-webpack/boot-files
    boot: [

      'axios',
    ],

    // https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-css
    css: [
      'app.scss'
    ],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      // 'mdi-v5',
      // 'fontawesome-v6',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      'roboto-font', // optional, you are not bound to it
      'material-icons', // optional, you are not bound to it
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-build
    build: {
      vueRouterMode: 'hash', // available values: 'hash', 'history'

      // URL base de la API. Corte COMPLETO al backend nuevo (UniversoArchivo): por defecto el backend
      // nuevo local (:5120). Para build/producción se define API_URL con su URL real:
      //   API_URL=https://<backend-nuevo>/api  quasar build
      //
      // Variables de marca: permiten desplegar este mismo código para otra institución sin tocar
      // componentes Vue — solo definiendo estas variables (ver .env.example) antes del build. Los
      // valores por defecto son los del IEEN Nayarit. Los assets (logo, fondo, favicons, colores) se
      // configuran aparte reemplazando archivos — ver BRANDING.md.
      env: {
        API_URL: process.env.API_URL || 'http://localhost:5120/api',
        SYSTEM_NAME: process.env.SYSTEM_NAME || 'Gestión Documental',
        INSTITUTION_NAME: process.env.INSTITUTION_NAME || 'Instituto Estatal Electoral de Nayarit',
        INSTITUTION_SHORT_NAME: process.env.INSTITUTION_SHORT_NAME || 'IEEN',
        LOGIN_SUBTITLE: process.env.LOGIN_SUBTITLE || 'Archivo — acceso al sistema',
        FOOTER_TEXT: process.env.FOOTER_TEXT || '© Unidad Técnica de Informática y Estadística',
        ANEXO11_FIRMANTE_NOMBRE: process.env.ANEXO11_FIRMANTE_NOMBRE || 'Jorge Arturo Langarica Zepeda',
        ANEXO11_FIRMANTE_CARGO: process.env.ANEXO11_FIRMANTE_CARGO || 'Coordinador de Archivo del IEEN',
      },

      // transpile: false,
      // publicPath: '/',

      // Add dependencies for transpiling with Babel (Array of string/regex)
      // (from node_modules, which are by default not transpiled).
      // Applies only if "transpile" is set to true.
      // transpileDependencies: [],

      // rtl: true, // https://quasar.dev/options/rtl-support
      // preloadChunks: true,
      // showProgress: false,
      // gzip: true,
      // analyze: true,

      // Options below are automatically set depending on the env, set them if you want to override
      // extractCSS: false,

      // https://v2.quasar.dev/quasar-cli-webpack/handling-webpack
      // "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain

      chainWebpack(chain) {
        chain.plugin('eslint-webpack-plugin')
          .use(ESLintPlugin, [{ extensions: ['js', 'vue'] }])
      }

    },

    // Título de pestaña / metadatos del <head> (index.template.html) — mismo valor que SYSTEM_NAME,
    // pero Quasar solo expone las variables de "build.env" al código de la app, no al template HTML,
    // así que se repite aquí explícitamente para <%= productName %>. IMPORTANTE: htmlVariables va en
    // la raíz de la config, no dentro de "build" — ahí Quasar lo ignora silenciosamente.
    htmlVariables: {
      productName: process.env.SYSTEM_NAME || 'Gestión Documental',
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-devServer
    devServer: {
      server: {
        type: 'http'
      },
      port: 8080,
      open: true // opens browser window automatically
    },

    // https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-framework
    framework: {
      config: {
        notify: {
          position: 'top-right',
          progress: true
        }
      },

      // iconSet: 'material-icons', // Quasar icon set
      // lang: 'en-US', // Quasar language pack

      // For special cases outside of where the auto-import strategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      // components: [],
      // directives: [],

      // Quasar plugins
      plugins: ['Notify', 'Dialog', 'Loading', 'BottomSheet'],
    },

    // animations: 'all', // --- includes all animations
    // https://quasar.dev/options/animations
    animations: [],

    // https://v2.quasar.dev/quasar-cli-webpack/developing-ssr/configuring-ssr
    ssr: {
      pwa: false,

      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      prodPort: 3000, // The default port that the production server should use
      // (gets superseded if process.env.PORT is specified at runtime)

      maxAge: 1000 * 60 * 60 * 24 * 30,
      // Tell browser when a file from the server should expire from cache (in ms)


      chainWebpackWebserver(chain) {
        chain.plugin('eslint-webpack-plugin')
          .use(ESLintPlugin, [{ extensions: ['js'] }])
      },


      middlewares: [
        ctx.prod ? 'compression' : '',
        'render' // keep this as last one
      ]
    },

    // https://v2.quasar.dev/quasar-cli-webpack/developing-pwa/configuring-pwa
    pwa: {
      workboxPluginMode: 'GenerateSW', // 'GenerateSW' or 'InjectManifest'
      workboxOptions: {}, // only for GenerateSW

      // for the custom service worker ONLY (/src-pwa/custom-service-worker.[js|ts])
      // if using workbox in InjectManifest mode

      chainWebpackCustomSW(chain) {
        chain.plugin('eslint-webpack-plugin')
          .use(ESLintPlugin, [{ extensions: ['js'] }])
      },


      manifest: {
        name: process.env.SYSTEM_NAME || 'Gestión Documental',
        short_name: process.env.SYSTEM_NAME || 'Gestión Documental',
        description: process.env.INSTITUTION_NAME || 'Instituto Estatal Electoral de Nayarit',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/developing-electron-apps/configuring-electron
    electron: {
      bundler: 'packager', // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options

        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',

        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration

        appId: 'archivo'
      },

      // "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain

      chainWebpackMain(chain) {
        chain.plugin('eslint-webpack-plugin')
          .use(ESLintPlugin, [{ extensions: ['js'] }])
      },



      chainWebpackPreload(chain) {
        chain.plugin('eslint-webpack-plugin')
          .use(ESLintPlugin, [{ extensions: ['js'] }])
      },

    }
  }
});
