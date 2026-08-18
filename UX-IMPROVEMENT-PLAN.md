# Plan de mejora UX/UI — Sistema de Gestión Documental (Archivo IEEN)

Complemento de `UX-AUDIT.md`. Este documento **no implementa nada**: es el plan técnico y de producto para ejecutar las mejoras, con archivos/componentes afectados, tokens propuestos y un roadmap en 6 fases. Cerrado por el veredicto UX final.

---

## 1. TOP 10 Quick Wins

Ordenados por relación beneficio/esfuerzo. Todos son cambios acotados, de bajo riesgo, sin tocar el modelo de dominio ni el backend.

| # | Quick win | Problema | Impacto usuario | Principio UX | Solución propuesta | Prioridad | Complejidad | Beneficio esperado |
|---|---|---|---|---|---|---|---|---|
| 1 | Corregir `icon: "Warning"`/`"Information"` → `"warning"`/`"info"` | Íconos capitalizados no renderizan en 32 archivos | Diálogos de confirmación se ven "rotos" (sin ícono) en casi toda acción de aprobar/rechazar/eliminar | Heurística 1 (visibilidad del estado) | Buscar y reemplazar global de los 4 valores mal escritos por su ligature real de Material Icons en minúscula | P1 | Muy baja (find & replace) | Alto — arregla un defecto visible en decenas de pantallas con una tarde de trabajo |
| 2 | Eliminar/journalizar los `espera(ms)` innecesarios, empezando por el de 5000 ms | Delays artificiales bloquean la UI sin motivo de red | El usuario espera segundos "sin razón" antes de poder actuar | Heurística 7 (eficiencia de uso) | Auditar cada llamado a `espera()`; sustituir por `await` real sobre la promesa de la store, o eliminarlo si era solo para forzar reactividad | P0 | Media (requiere probar cada flujo tras quitar el timeout) | Muy alto — mejora de rendimiento percibido transversal a toda la app |
| 3 | Notificar y redirigir en 401 | Sesión expirada falla en silencio (`console.log` solamente) | El usuario interactúa con una app "muerta" sin saber por qué nada se guarda | Heurística 1 y 9 | En el interceptor de `boot/axios.js`, en el `catch` de 401: `$q.notify` + `router.push('/login')` + limpiar `localStorage` | P0 | Baja | Alto — evita frustración y reportes de "el sistema no guarda" |
| 4 | Unificar el estado "sin permiso" en un solo componente | 3 tratamientos visuales distintos para el mismo caso | Confusión sobre si la app cargó o si es un tema de permisos | Heurística 4 (consistencia) | Crear `components/SinPermisoBanner.vue` y sustituir las 3 variantes | P1 | Baja | Medio-alto — mejora consistencia percibida rápido |
| 5 | Agregar `aria-label` a botones ícono-solo de acciones (editar/eliminar/ver/aprobar/rechazar/firmar/publicar) | Cero accesibilidad para lectores de pantalla fuera del drawer | Usuarios con lector de pantalla no pueden operar la app | Accesibilidad / heurística 6 | Añadir `:aria-label` calculado a partir del mismo texto del `q-tooltip` ya existente | P1 | Baja-media (repetitivo pero mecánico) | Alto — reduce riesgo normativo y abre la app a más usuarios |
| 6 | Quitar `console.log` de depuración | 300 ocurrencias en 47 archivos, incl. una suelta sin propósito | Ninguno directo al usuario, pero ensucia consola y ralentiza ligeramente | Deuda técnica | Lint rule `no-console` + limpieza en un PR único | P2 | Baja | Medio — mejora mantenibilidad, reduce ruido al depurar bugs reales |
| 7 | Quitar columnas muertas (`valida`, `visto_Bueno`, `aprobo`) de la tabla de bajas | Columnas siempre vacías ocupan espacio y confunden | Menos scroll horizontal, tabla más legible | Heurística 8 (diseño minimalista) | Eliminar las 3 definiciones de columna en `bajaDocumental/Components/TablaComp.vue` | P2 | Muy baja | Medio |
| 8 | Retirar dependencia `sweetalert2` no usada | Peso muerto en `node_modules`/bundle | Ninguno directo, pero bundle más liviano | Deuda técnica | `yarn remove sweetalert2` tras confirmar 0 usos | P3 | Muy baja | Bajo-medio (bundle size) |
| 9 | Corregir el breadcrumb "Trasnferencias secundarias" y unificar tildes ("Filas por página", "permiso") | Errores tipográficos visibles en producción | Percepción de descuido/poca calidad | Microcopy | Búsqueda y corrección puntual de las cadenas | P3 | Muy baja | Bajo-medio (percepción de calidad) |
| 10 | Agregar confirmación explícita a "Activar/Desactivar usuario" | Acción de alto impacto sin fricción protectora, inconsistente con "Resetear contraseña" que sí confirma | Riesgo de desactivar cuentas por error | Heurística 5 (prevención de errores) | Envolver `alternarEstado` en el mismo patrón `$q.dialog` que ya usa `confirmarReset` | P2 | Muy baja | Medio |

---

## 2. Roadmap en 6 fases

```
FASE 1 — CRÍTICO (semanas 1-2)
├─ Notificación + redirección en 401 (boot/axios.js)
├─ Retirar/journalizar espera(5000) y demás delays artificiales bloqueantes
├─ Auditoría de contraste de color (herramienta automática) sobre paleta purple-ieen
└─ Confirmación en "Activar/Desactivar usuario" y equivalentes de alto impacto

FASE 2 — USABILIDAD (semanas 3-5)
├─ Selector de columnas (visible-columns) en inventarioAreaGral/TablaItem.vue
├─ Alinear a la izquierda las columnas de texto libre en tablas densas
├─ Eliminar columnas muertas (bajaDocumental) y código muerto (v-if="false" en cédula de préstamo)
├─ Agregar mensajes de estado vacío accionables ("No hay usuarios — cree el primero")
└─ Página de inicio (IndexPage.vue) con resumen/accesos directos reales

FASE 3 — CONSISTENCIA (semanas 6-8)
├─ Componente único SinPermisoBanner.vue (reemplaza 3 variantes)
├─ Componente único BtnCancelar.vue / BtnEliminar.vue (elimina repetición de props)
├─ Mover .my-sticky-last-column-table a app.scss (una sola definición global)
├─ Unificar tratamiento flat/bordered vs. sombra entre módulos antiguos y nuevos
├─ Agregar breadcrumbs a los 4 módulos de Administración
└─ Corregir ruta duplicada /cedulasPrestamo en router/routes.js

FASE 4 — DISEÑO VISUAL (semanas 9-11)
├─ Migrar paleta purple-ieen/pink-ieen/gray-ieen a variables reales de Quasar
│  (quasar.variables.scss) para que Login y el resto compartan un solo theme
├─ Definir tokens de tipografía y espaciado documentados (ver §4)
├─ Revisar iconografía: guía de qué ícono corresponde a qué acción (aprobar/rechazar/etc.)
└─ Unificar densidad de tablas (dense) según volumen de columnas

FASE 5 — ACCESIBILIDAD (semanas 12-15)
├─ aria-label en todos los botones ícono-solo (script de barrido + revisión manual)
├─ role="alert"/aria-live en mensajes de error de formulario
├─ Encabezados semánticos reales (h1-h6) en vez de <div class="text-h6">
├─ Verificar y corregir foco automático (autofocus) y orden de tabulación en modales anidados
└─ Auditoría con axe-core / Lighthouse Accessibility sobre cada módulo

FASE 6 — REFINAMIENTO (semanas 16-18)
├─ Modo responsive real (grid/card view) para tablas en viewport < 768px
├─ Reemplazar overlay global $q.loading por loaders locales + q-skeleton donde aplique
├─ Unificar arquitectura de generación de documentos (evaluar migrar jsPDF client-side
│  restante hacia generación server-side, como interoperabilidad/avisos)
└─ Limpieza final de microcopy (tildes, "permiso/permisos", nombres de carpeta con typos)
```

---

## 3. Ejemplos antes/después

### 3.1 Espera artificial + overlay bloqueante

```
ANTES                                          DESPUÉS
──────────────────────────────────             ──────────────────────────────────
Usuario hace clic en "Nuevo"                   Usuario hace clic en "Nuevo"
        │                                              │
        ▼                                              ▼
┌───────────────────────────┐                 ┌───────────────────────────┐
│  $q.loading.show()         │                 │  bajaStore.initEncabezado()│
│  (bloquea TODA la pantalla,│                 │  (síncrono, instantáneo)   │
│   incl. el drawer)         │                 └───────────────────────────┘
└───────────────────────────┘                          │
        │                                               ▼
        ▼                                      ┌───────────────────────────┐
┌───────────────────────────┐                  │  Modal se abre de inmediato│
│  await espera(5000)  ⏳     │                 │  (sin overlay global)      │
│  (setTimeout sin llamada   │                  └───────────────────────────┘
│   de red real)             │
└───────────────────────────┘
        │
        ▼
┌───────────────────────────┐
│  Modal se abre (5 s después)│
└───────────────────────────┘
```
Evidencia: `Modulos/encabezadosInventariosGral/pages/IndexPage.vue:94`. Regla general: sustituir `$q.loading.show() + espera(ms)` por `await` sobre la promesa real de la store; si el `espera()` existía para "dar tiempo a que Pinia reaccione", es señal de que falta un `await` correcto en la acción de la store, no de que se necesite un temporizador.

### 3.2 Tabla de 24 columnas todo-centrado

```
ANTES (inventarioAreaGral/TablaItem.vue)
┌────┬────────┬─────────┬────────┬──────────┬─────────────────────┬───┐
│Sel.│ Estatus│ Sección │ Serie  │ SubSerie │     Descripción      │...│  ← 24 columnas
├────┼────────┼─────────┼────────┼──────────┼─────────────────────┼───┤
│ [] │ centro │  centro │ centro │  centro  │  texto largo CENTRADO│...│
└────┴────────┴─────────┴────────┴──────────┴─────────────────────┴───┘
        scroll horizontal interminable, sin selector de columnas

DESPUÉS
┌──────────────────────────────────────────────────┐  [Columnas ▾] [Filtros ▾]
│ Vista por defecto: 8 columnas clave               │  ← visible-columns
│ Sel │ Estatus │ Clave  │ Expediente        │ ...   │
│ []  │ Aprobado│ 1/2/3  │Descripción a la izq. │ ... │
└──────────────────────────────────────────────────┘
   "Ver más columnas" expande bajo demanda; texto alineado a la izquierda
```
Evidencia: `Modulos/inventarioAreaGral/components/TablaItem.vue:214-383` (columnas), `align:"center"` en todas. Ya existe el patrón de `visible-columns` en `cedulaPrestamo/components/TablaComp.vue:215-225` — reutilizarlo aquí.

### 3.3 Estado "sin permiso" — 3 variantes → 1

```
ANTES                                    DESPUÉS
Administración:                          Todos los módulos:
  <div class="text-grey q-pa-lg">          <SinPermisoBanner
    No tiene permisos para ver             modulo="Baja documental"
    este módulo.                         />
  </div>
                                          ┌──────────────────────────────┐
Cumplimiento:                            │ 🔒  No tiene permiso para ver │
  <q-banner class="bg-orange-2">         │     "Baja documental".        │
    No tiene permiso para ver...         │     Contacte a su             │
  </q-banner>                            │     administrador si          │
                                          │     considera que es un error.│
Operativos (baja, cédula, transf.):      └──────────────────────────────┘
  (nada — tabla oculta sin mensaje)
```

### 3.4 Sesión expirada (401 silencioso)

```
ANTES                                        DESPUÉS
Token expira → cada llamada API falla        Token expira → primera llamada 401
        │                                            │
        ▼                                            ▼
console.log('Error 401: No autorizado')      $q.notify({type:'warning',
        │                                       message:'Su sesión expiró,
        ▼                                       vuelva a iniciar sesión'})
Usuario sigue en la pantalla,                       │
clics no producen ningún resultado                  ▼
visible ni explicación                       localStorage.clear()
                                              router.push('/login')
```
Evidencia: `src/boot/axios.js:24-33`.

---

## 4. Plan técnico de implementación

### 4.1 Archivos/componentes afectados por fase

| Fase | Archivos principales a tocar |
|---|---|
| 1 | `src/boot/axios.js`; los ~60 puntos de `espera(` listados en `UX-AUDIT.md §5/§22` (priorizar `encabezadosInventariosGral/pages/IndexPage.vue`, `cajasTransferencias/components/RegistroDetalleComp.vue`, `cajasBajas/components/RegistroDetalleComp.vue`); `administracionUsuarios/pages/IndexPage.vue` (confirmación de estado) |
| 2 | `Modulos/inventarioAreaGral/components/TablaItem.vue`; `Modulos/bajaDocumental/Components/TablaComp.vue`; `Modulos/cedulaPrestamo/components/TablaComp.vue` (retirar `v-if="false"`); `src/pages/IndexPage.vue` |
| 3 | Nuevo `src/components/SinPermisoBanner.vue`; nuevo `src/components/BtnCancelar.vue`, `src/components/BtnEliminar.vue`; `src/css/app.scss`; los 4 `IndexPage.vue` de Administración; `src/router/routes.js` (ruta duplicada) |
| 4 | `src/css/quasar.variables.scss`; `src/layouts/MainLayout.vue` (mover paleta); `Modulos/acceso/pages/Login_Nuevo.vue` y `CambiarPassword.vue` (color de botón) |
| 5 | Todos los `TablaComp.vue`/`ModalComp.vue` con botones ícono-solo (barrido asistido); componentes de formulario con mensajes de error |
| 6 | Todas las `q-table` de módulos de alto volumen (`inventarioAreaGral`, `encabezadosInventariosGral`, `cajasTransferencias*`); `boot/` o composable nuevo `useLoading.js` para reemplazar el uso indiscriminado de `$q.loading` |

### 4.2 Componentes nuevos propuestos

| Componente | Props | Sustituye a |
|---|---|---|
| `SinPermisoBanner.vue` | `modulo: String` | 3 variantes de "sin permiso" repetidas en ~15 módulos |
| `BtnCancelar.vue` | `(ninguna, o @click)` | `<q-btn color="red" label="Cancelar" icon="highlight_off" .../>` repetido en ~30 modales |
| `BtnEliminar.vue` | `label, mensaje, @confirmado` | Bloques `$q.dialog({title:'Eliminar...', ...})` repetidos |
| `EstadoChip.vue` | `estado: String, mapaColores: Object` | Lógica `colorEstado()` duplicada en PADA, Preservación, Avisos, ActosDialog |
| `TablaBase.vue` (opcional, mayor esfuerzo) | slots + props de columnas | Reduce duplicación de `.my-sticky-last-column-table` y boilerplate de `q-table` |

### 4.3 Componentes reutilizables ya existentes (conservar)

- `components/ActosDialog.vue` — patrón de referencia de reutilización real entre dos módulos; usar como modelo al construir `SinPermisoBanner`/`EstadoChip`.
- `components/EssentialLink.vue` — simple y correcto, sin cambios necesarios salvo tipar `link` como `[String, Object]` en vez de solo `String` (hoy recibe objetos de ruta en la práctica).

### 4.4 Design tokens propuestos (para `quasar.variables.scss`)

```scss
// Reemplaza la paleta default de Quasar por la marca real del sistema,
// hoy vive solo como CSS suelto en MainLayout.vue.
$primary   : #673e84;   // antes purple-ieen
$secondary : #863399;   // antes purple-ieen-1
$accent    : #b32572;   // antes pink-ieen-1

$positive  : #21BA45;   // sin cambio, ya es consistente en toda la app
$negative  : #C10015;   // sin cambio
$warning   : #F2C037;   // sin cambio
$info      : #31CCEC;   // sin cambio

// Tokens adicionales (nuevos, para reemplazar valores hardcodeados dispersos)
$purple-ieen-2: #a25eb5;
$purple-ieen-3: #bb83ca;
$pink-ieen-2: #cc5599;
$pink-ieen-3: #dd85ba;
$gray-ieen-1: #76777a;
$gray-ieen-2: #98989a;
$gray-ieen-3: #b1b1b1;
```
Con esto, `Login_Nuevo.vue` y `CambiarPassword.vue` pueden seguir usando `color="primary"` sin cambiar una sola línea de esos archivos, y automáticamente heredarán la marca correcta.

### 4.5 Cambios de layout / navegación

- Agregar `q-breadcrumbs` a los 4 `IndexPage.vue` de Administración (mismo patrón ya usado en el resto).
- Reemplazar el `q-bottom-sheet` de una sola opción ("Cerrar sesión") por un `q-btn-dropdown`/`q-menu` simple anclado al ícono de usuario, mostrando el nombre del empleado actual junto al botón de salir — reduce un nivel de indirección para la acción más frecuente después de navegar.
- Mostrar el nombre de usuario/perfil también en el `q-toolbar` (hoy solo visible dentro del drawer).

### 4.6 Cambios de formularios

- Estandarizar el asterisco `*` en labels de campos obligatorios en todos los módulos (hoy solo presente en administración).
- Unificar el patrón de envío: usar siempre `@submit` del `q-form` (que ya dispara validación) y eliminar las llamadas duplicadas a `.validate()` manual donde ya existe `@submit`.
- Password: agregar toggle de mostrar/ocultar (`type="password"`/`"text"` con ícono `visibility`/`visibility_off`) en Login, CambiarPassword y el campo de contraseña temporal.
- Elevar la política mínima de contraseña de 6 a un mínimo razonable (8+ con al menos una condición adicional), documentado en el propio `hint` del campo.

### 4.7 Cambios responsive

- Introducir el modo de tarjetas (`grid`/CSS `q-table` responsive) para viewport < 768px en las tablas de mayor volumen (`inventarioAreaGral`, `encabezadosInventariosGral`, `cajasTransferencias*`).
- Auditar y, si es necesario, ajustar anchos fijos de `q-card` en diálogos (`style="width: 960px"` etc.) para que usen `style="width: min(960px, 95vw)"` de forma consistente (algunos ya lo hacen con `max-width: 95vw`, otros no).

### 4.8 Cambios de accesibilidad

- Barrido automatizado (script/codemod) que añade `:aria-label` a todo `q-btn` `flat round dense` que ya tiene un `q-tooltip` hijo, tomando el texto del tooltip como valor.
- Reemplazar `<div class="text-h6">Título</div>` por `<h1 class="text-h6">`/`<h2 class="text-h6">` según nivel de jerarquía real de la página.
- Agregar `aria-live="polite"` al contenedor de mensajes de error de formulario (`<div v-if="error">`).
- Ejecutar Lighthouse/axe-core en cada módulo tras cada fase y llevar un tablero de puntaje de accesibilidad por módulo.

---

## 5. Veredicto UX final

# **Funcional pero con problemas importantes**

El sistema cumple su propósito: modela con seriedad y fundamento legal un dominio complejo (ciclo de vida documental bajo la LGA y la Ley de Archivos de Nayarit), con módulos recientes (Administración, Cumplimiento Fases 3-4) que demuestran que el equipo sabe construir pantallas consistentes, bien jerarquizadas y con buen manejo de estados. Ejemplos concretos que deben **conservarse** como estándar: el flujo defensivo de aprobación de préstamos que bloquea la acción si no hay autorizador vigente (`cedulaPrestamo/components/TablaComp.vue:301-313`), la reutilización real de `ActosDialog.vue` entre dos procesos distintos, y la cita explícita del fundamento legal en la propia interfaz (`avisos/pages/IndexPage.vue:20`, `ActosDialog.vue:17-22`).

Pero el promedio (UX MATURITY SCORE 55/100) está arrastrado por problemas que no son de "pulido" sino estructurales: una accesibilidad casi inexistente (un solo `aria-label` en 116 archivos) que representa un riesgo real en un sistema de gobierno; un antipatrón de rendimiento percibido replicado sistemáticamente (`espera()` + overlay bloqueante global, con un caso extremo de 5 segundos sin llamada de red de por medio); tablas de datos del uso diario más frecuente que son ilegibles en dispositivos pequeños y difíciles de escanear incluso en desktop (24 columnas, todas centradas); y una falta de capa de diseño compartida que hace evidente, módulo a módulo, en qué "generación" de desarrollo fue construido cada uno.

Ninguno de estos problemas requiere rediseñar el producto ni su arquitectura de información —el mapa funcional y el modelo de permisos están bien planteados—; son, en su mayoría, defectos corregibles con el roadmap de 6 fases propuesto, empezando por las correcciones de Fase 1 (401 silencioso, delays artificiales, confirmaciones faltantes) que son de bajo esfuerzo y alto impacto inmediato para el usuario diario.
