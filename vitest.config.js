import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

const ruta = (p) => fileURLToPath(new URL(p, import.meta.url))

// Auditoría T-13: primeras pruebas automatizadas del cliente. `npm test` era un `echo` — no había NADA.
//
// Vitest corre por su cuenta, sin levantar el servidor de Quasar. Cubre la lógica del cliente (stores de
// Pinia, helpers, guardia del router) y el montaje del layout, que es lo que el plan pedía expresamente
// porque habría atrapado UX-001 y UX-002.
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    include: ['test/unit/**/*.spec.js'],
    globals: true,
    restoreMocks: true,
  },
  resolve: {
    // `routes.js` importa varias páginas sin extensión (`.../pages/IndexPage`). Webpack lo resuelve por
    // configuración de Quasar; Vite no incluye `.vue` por defecto y fallaría al cargar el archivo.
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    // Lista (no objeto) para poder anclar la coincidencia de `quasar` con una expresión regular: como
    // objeto, la clave `quasar` haría también prefijo y rompería `quasar/wrappers`, que usa boot/axios.
    alias: [
      // Quasar publica exports condicionales y bajo Node gana `quasar.server.prod.js`, cuyos componentes
      // no se pueden montar: `Quasar.install` revienta con «Cannot convert undefined or null to object».
      // Estas pruebas simulan un navegador con jsdom, así que se apunta al build de cliente a propósito.
      { find: /^quasar$/, replacement: ruta('./node_modules/quasar/dist/quasar.client.js') },
      // Mismos alias que usa el código de la aplicación (`src/boot/axios`, `layouts/...`).
      { find: /^src\//, replacement: ruta('./src') + '/' },
      { find: /^app\//, replacement: ruta('.') + '/' },
      { find: /^components\//, replacement: ruta('./src/components') + '/' },
      { find: /^layouts\//, replacement: ruta('./src/layouts') + '/' },
      { find: /^pages\//, replacement: ruta('./src/pages') + '/' },
      { find: /^stores\//, replacement: ruta('./src/stores') + '/' },
    ],
  },
})
