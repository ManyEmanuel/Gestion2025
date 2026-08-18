# Guía de reutilización / rebranding

Este sistema (originalmente construido para el Archivo del IEEN Nayarit) puede desplegarse
para otra institución sin modificar componentes Vue. Hay tres cosas que reemplazar, en este
orden:

1. Variables de entorno (texto)
2. Assets de imagen (logo, fondo)
3. Colores de marca (SCSS)

Y una cosa que **revisar manualmente**: los textos legales del módulo de Cumplimiento.

## 1. Variables de entorno

Copiar `.env.example` a `.env` en la raíz del proyecto y ajustar los valores. Ver ese archivo
para la lista completa y comentarios de dónde aparece cada variable en la UI. Resumen:

| Variable | Dónde aparece |
|---|---|
| `API_URL` | URL base del backend `.NET` — no es branding, pero vive en el mismo `.env` |
| `SYSTEM_NAME` | Pestaña del navegador, encabezado, login, manifest del PWA |
| `INSTITUTION_NAME` | Descripción del manifest del PWA |
| `INSTITUTION_SHORT_NAME` | Reservado para uso futuro en textos generados |
| `LOGIN_SUBTITLE` | Subtítulo bajo el nombre del sistema en el login |
| `FOOTER_TEXT` | Encabezado y pie de página de `MainLayout` |
| `ANEXO11_FIRMANTE_NOMBRE` / `ANEXO11_FIRMANTE_CARGO` | Firma impresa en el PDF del Anexo 11 (Cédula de préstamo) |

`.env` no se versiona (está en `.gitignore`) porque cada institución/entorno tiene el suyo.
Si no existe `.env`, `quasar.config.js` usa los valores por defecto del IEEN Nayarit — el
sistema sigue arrancando sin configuración adicional en desarrollo local.

Estas variables solo se leen en tiempo de build (`quasar dev` / `quasar build`), no hay panel
de administración en tiempo de ejecución — ver la decisión de alcance al fondo de este archivo.

## 2. Assets de imagen

Reemplazar, manteniendo el mismo nombre de archivo y dimensiones similares:

- `src/assets/branding/logo.png` — logo institucional. Aparece en los encabezados de los PDF
  generados (`src/helpers/anexo_*.js`, `helper.js`).
- `src/assets/branding/fondo.png` — imagen de fondo del panel lateral (`MainLayout.vue`).
- `public/favicon.ico` y `public/icons/favicon-16x16.png` / `-32x32.png` / `-96x96.png` /
  `-128x128.png` — íconos de pestaña del navegador.

**Importante:** `logo.png` y `fondo.png` deben quedarse dentro de `src/assets/` (no mover a
`public/`). Los generadores de PDF (`jsPDF`) cargan la imagen con
`img.src = require(...)` y llaman `doc.addImage(img, ...)` inmediatamente después, sin esperar
el evento `onload`. Esto solo funciona hoy porque webpack empaqueta las imágenes pequeñas de
`src/assets/` como un data URI base64 síncrono. Si se sirvieran desde `public/` (URL real,
carga asíncrona), los PDF generados saldrían con el logo en blanco de forma intermitente.

**Nota:** el manifest del PWA (`quasar.config.js` → `pwa.manifest.icons`) referencia
`icons/icon-128x128.png`, `icon-192x192.png`, `icon-256x256.png`, `icon-384x384.png` e
`icon-512x512.png` en `public/icons/`. Esos archivos no existen actualmente en este repo (gap
preexistente, no introducido por este cambio) — si se necesita que la app instalada como PWA
muestre un ícono correcto, hay que generarlos y agregarlos ahí.

## 3. Colores de marca

Editar `src/css/quasar.variables.scss`:

- `$primary`, `$secondary`, `$accent` — paleta base de Quasar.
- `$purple-ieen`, `$purple-ieen-1/2/3`, `$pink-ieen-1/2/3`, `$gray-ieen-1/2/3` — variables de
  marca específicas de este proyecto, usadas en `MainLayout.vue` y en varios módulos para
  chips de estado, íconos y acentos.

Ver `DESIGN-TOKENS.md` para el significado de cada token, la guía de contraste WCAG AA
verificada, y qué componentes consumen cada variable.

## 4. Revisión manual: Cumplimiento

Los módulos `avisos`, `interoperabilidad` y `pada` (bajo `src/Modulos/`) citan artículos
específicos de la Ley General de Archivos y la Ley de Archivos del Estado de Nayarit
(fundamento legal de plazos, procedimientos y formatos). Estos textos son correctos para el
IEEN Nayarit pero **no se generalizan automáticamente** — si se reutiliza el sistema para otra
institución o entidad federativa, alguien con conocimiento del marco legal aplicable debe
revisar y ajustar esas citas caso por caso. No forman parte de las variables de entorno porque
son fundamento jurídico, no texto de marca.

## Alcance de esta configurabilidad

Estas variables se resuelven en tiempo de build (`quasar dev` / `quasar build`), no hay una
pantalla de administración para cambiarlas en producción sin recompilar. Esto fue una decisión
deliberada: el caso de uso es "desplegar este mismo código para otra institución/archivo",
no "una institución cambia su propio branding desde la UI". Si ese segundo caso llega a
necesitarse, requeriría mover estos valores a un endpoint del backend y cargarlos en tiempo de
ejecución — cambio de arquitectura, no cubierto aquí.
