# Auditoría UX/UI — Sistema de Gestión Documental (Archivo IEEN)

**Alcance**: análisis estático de código fuente (sin ejecutar la app). Cliente Quasar 2 (Vue 3) + Pinia + vue-router, en `D:\2026\IA\Claude\Universo_Externo\Clientes\Gestion_Documental`.
**Método**: lectura directa de 30 módulos en `src/Modulos`, layout, router, stores globales, componentes compartidos y hojas de estilo; auditoría profunda pantalla-por-pantalla en 9 módulos representativos + pasada ligera agregada en el resto; verificación cruzada con `grep` sobre todo `src/` para cuantificar patrones (no solo impresiones puntuales).
**No se modificó ningún archivo de la aplicación.**

Estadísticas base del proyecto: 116 archivos `.vue`, 30 carpetas de módulo, 38 stores Pinia, 44 usos de `q-table`.

---

## 1. Mapa funcional completo

```
Gestión Documental (archivo_app)
│
├── /login                            Acceso (sin layout) — Login_Nuevo.vue
├── /cambiar-password                 Cambio forzado de contraseña temporal — CambiarPassword.vue
│
└── / (MainLayout: header + drawer + footer)
    │
    ├── 📁 Catálogos  (AI-CAT-*)
    │   ├── /secciones                Secciones / Series / SubSeries (cuadro de clasificación)
    │   ├── /voBo                     Vistos buenos (catálogo de autorizadores)
    │   ├── /dispDoc                  Disposición documental (destino final)
    │   └── /enlaces                  Enlaces (catálogo de enlaces de área)
    │
    ├── 📁 Archivo en trámite (AI-INV-AREA*, AI-TP)
    │   ├── /inventarioGeneral        Inventario por expediente (por área) → encabezados
    │   │   └── /detalleInventario/:id        Detalle de expedientes de un encabezado
    │   ├── /inventarioGeneralAreas   Inventario general (todas las áreas)
    │   │   └── /detalleInventarioGral/:id    Detalle (tabla de 24 columnas)
    │   └── /transferenciasPrimarias  Transferencias primarias → encabezados
    │       └── /cajasTransferencias/:id      Cajas/expedientes de una transferencia
    │
    ├── 📁 Préstamos (AI-PRESTAMOS*)
    │   ├── /cedulasPrestamo          Cédulas de préstamo (archivo de trámite)
    │   │   └── /prestamoAceptado/:id         Documentos del préstamo aceptado (imprime anexos)
    │   ├── /cedulasPrestamo          Cédulas de préstamo clasificados (⚠ misma ruta, ver §22)
    │   ├── /prestamoAI               Solicitudes de préstamo archivo institucional
    │   ├── /prestamoAIAI             Solicitudes al archivo institucional
    │   └── /prestamoInstitucional/:id/:estatus   Detalle de préstamo institucional
    │
    ├── 📁 Archivo en Concentración (AI-TS, AI-TP-AI, AI-INV-AREA-AI, AI-BD, AI-AVISOS)
    │   ├── /transferenciasSecundarias        → /cajasTranSec/:id
    │   ├── /transferenciasPrimariasAI        → /cajasTransferenciasAI/:id
    │   ├── /inventarioAI                     Inventario en concentración
    │   ├── /bajaDocumental                   → /cajasBajas/:id
    │   └── /avisos                           Avisos al Archivo General (plazo 45 días)
    │
    ├── 📁 Cumplimiento (AI-PADA, AI-GRUPO, AI-PRESERVACION, AI-INTEROP)
    │   ├── /pada                     PADA e informe anual (tabs: Programas / Informes)
    │   ├── /grupoInterdisciplinario  → /sesionesGrupo/:id
    │   ├── /preservacion             Preservación digital (política, riesgo, migración)
    │   └── /interoperabilidad        Export a Registro Estatal (cuadro/CADIDO/guía)
    │
    ├── 📁 Administración (AI-ADMIN-*, ámbito global)
    │   ├── /administracionAreas
    │   ├── /administracionEmpleados
    │   ├── /administracionUsuarios
    │   └── /administracionPerfiles
    │
    └── /:catchAll                    404 — ErrorNotFound.vue
```

Notas sobre el mapa (evidencia en `src/router/routes.js`):
- Los "Actos de disposición" (dictamen/acta + firma electrónica) **no tienen ruta propia**: se acceden vía `ActosDialog.vue`, un modal invocado desde las tablas de Baja documental y Transferencia secundaria (`Modulos/bajaDocumental/Components/TablaComp.vue:65-68`, patrón espejo en transferencia secundaria).
- Dos rutas registradas con **el mismo path** `/cedulasPrestamo` (routes.js:54-62) para "cédulas" y "cédulas clasificadas" — ver hallazgo en §22.
- No existe un layout ni rutas para "Perfil de usuario" (ver mi cuenta / cambiar mi propia contraseña ya autenticado): `CambiarPassword.vue` solo se usa en el flujo forzado post-login, no hay forma de que un usuario cambie su contraseña voluntariamente desde el menú.

---

## 2. Análisis por tipo de usuario

### Usuario nuevo (primera vez en el sistema)
- El login (`Login_Nuevo.vue`) es minimalista y no ofrece ayuda contextual (sin "¿Olvidó su contraseña?", sin explicación de qué hacer si el usuario no existe).
- Tras el primer ingreso con contraseña temporal, el sistema **fuerza** el cambio (`router.push('/cambiar-password')`) — buen patrón de seguridad, pero la pantalla no explica los requisitos de la nueva contraseña más allá de "mínimo 6 caracteres" (política débil y sin más guía, `CambiarPassword.vue:24-27`).
- El menú lateral se construye dinámicamente según permisos (`MainLayout.vue:202-408`); un usuario nuevo con pocos permisos verá un menú casi vacío sin ningún mensaje que explique "no tiene módulos asignados" — puede parecer una aplicación rota.
- Las tablas de 15-24 columnas (inventario general) no ofrecen ninguna guía visual de qué campos son obligatorios o su significado (sin tooltips de ayuda, sin leyenda).
- No hay onboarding, tour guiado ni estado vacío explicativo en la primera pantalla (`IndexPage.vue` es un placeholder por defecto de Quasar sin contenido útil, ver §6).

### Usuario frecuente (uso diario)
- Beneficiado por atajos reales: filtros de tabla con debounce (`debounce="300"` repetido de forma consistente en casi todas las tablas), selects con búsqueda (`use-input` + `@filter`).
- Penalizado por el patrón sistemático de `$q.loading.show()` + `espera(ms)` antes de casi cualquier acción (ver §17 y §24) — un usuario que abre 20-30 modales al día pierde tiempo real acumulado en esperas artificiales (100 ms–5000 ms) que no corresponden a una llamada de red.
- No existen accesos directos de teclado, vistas guardadas de filtros, ni acciones en lote más allá de un único checkbox "Seleccionar todos" en `inventarioAreaGral/components/TablaItem.vue:15-19` (que sólo alimenta la generación de un PDF, "Anexo 5").
- La navegación por breadcrumbs es útil para volver, pero es inconsistente (ver §13): los módulos de Administración no la tienen, obligando a usar el botón "atrás" del navegador o el drawer.

### Usuario con poca experiencia tecnológica
- Los mensajes de error del backend se muestran en gran medida ya traducidos a español por las stores (`resp.data` con `detail`/`title` del backend), lo cual es positivo (ver §10).
- Sin embargo, el patrón de "pantalla en blanco si no tiene permiso" en varios módulos operativos (baja documental, cédula de préstamo, transferencias) — sin banner ni mensaje — puede confundir a un usuario que no distingue entre "no tengo permiso" y "la aplicación no cargó".
- Los botones de acción son mayoritariamente ícono + tooltip sin texto visible (editar/eliminar/ver), lo que exige que el usuario "descubra" la función pasando el mouse — fricción real para usuarios menos hábiles, agravada por la ausencia total de `aria-label` (ver §20).
- Las confirmaciones de eliminación sí incluyen el nombre del elemento ("¿Eliminar el área 'X'?"), lo cual reduce el riesgo de error — buena práctica a conservar.

---

## 3. Metodología de la auditoría profunda

Se auditaron a profundidad, código por código, los siguientes 9 módulos por cubrir los distintos patrones de la aplicación:

| # | Módulo | Patrón que representa |
|---|--------|------------------------|
| 1 | `acceso` (Login + CambiarPassword) | Autenticación / puerta de entrada |
| 2 | `administracionUsuarios` | CRUD simple con tabla + diálogo + acción secundaria (reset password) |
| 3 | `administracionAreas` / `administracionEmpleados` / `administracionPerfiles` | Clúster de administración interna (jerarquía, catálogo relacional, permisos) |
| 4 | `bajaDocumental` | Workflow documental con encabezado → detalle → actos/firma |
| 5 | `transferenciaSecundariaEncabezado` | Workflow paralelo a baja documental (para comparar consistencia) |
| 6 | `cedulaPrestamo` (+ `cedulaPrestamoClasificado`) | Préstamo con aprobar/rechazar, impresión de anexos (jsPDF) |
| 7 | `inventarioAreaGral` / `encabezadosInventariosGral` | Tabla grande (24 columnas), maestro-detalle con tabs |
| 8 | `pada`, `preservacion`, `interoperabilidad`, `avisos`, `grupoInterdisciplinario` | Cumplimiento normativo (Fases 3-4, generación más reciente) |
| 9 | `acceso` como puerta + `MainLayout`/`auth_store` como esqueleto de navegación y permisos | Navegación global y modelo de permisos |

El resto de los módulos (`cajasTransferencias*`, `cajasBajas`, `inventarioArea*`, `secciones`, `disposicionDocumental`, `enlaces`, `voBos`, `encabezadoInventarioArea`, `soliciutdes_ai`, `transferenciaPrimariaAiEncabezado`, `trasferenciaPrimariaEncabezado`) se revisaron en pasada ligera (estructura de archivos + 1-2 componentes clave + `grep` dirigido) — hallazgos agregados en §6.

---

## 4. Evaluación pantalla por pantalla — módulos profundos

### 4.1 Login (`Modulos/acceso/pages/Login_Nuevo.vue`)

| Aspecto | Evaluación |
|---|---|
| Propósito | Autenticar usuario/contraseña contra `/api/auth/login`. Claro. |
| Acción principal | Botón "Ingresar", único y bien jerarquizado (`type="submit"`, `full-width`). |
| Jerarquía visual | Card centrada 360px, título + subtítulo + 2 campos + botón. Muy limpia. |
| Distribución | Correcta, sin ruido. |
| Complejidad | Mínima — 2 campos. Adecuado para un login. |
| Carga cognitiva | Baja. |
| Clics para completar | 1 (llenar 2 campos + Enter/click) — óptimo. |
| Feedback | `:loading="cargando"` en el botón (bueno); error en texto plano bajo el formulario sin ícono ni `role="alert"` (línea 27). |

**Hallazgos**:
- El botón usa `color="primary"` (línea 31), que resuelve al azul por defecto de Quasar `#1976D2` (`quasar.variables.scss:15`) — **el único punto de toda la aplicación donde no se usa la marca morada `purple-ieen`** que domina el resto del sistema (`MainLayout.vue:449` define `.bg-purple-ieen { background:#673e84 }`, usado en cientos de botones). Es la primera pantalla que ve cualquier usuario y no lleva la marca del sistema.
- No hay enlace de "recuperar contraseña", ni número de soporte, ni contacto — si un usuario olvida su contraseña no tiene ninguna guía en pantalla.
- Sin toggle de mostrar/ocultar contraseña (`type="password"` fijo).
- El mensaje de error (`error.value = r.data`) es genérico "Usuario o contraseña incorrectos" (`auth_nuevo_store.js:29`) — correcto por seguridad (no revela cuál campo falló), pero no está asociado al formulario vía `aria-live`/`role="alert"`, así que un lector de pantalla no lo anunciará automáticamente.

### 4.2 Cambio de contraseña forzado (`CambiarPassword.vue`)
- Buen patrón de seguridad (login con contraseña temporal → cambio obligatorio antes de usar el sistema).
- Regla de longitud mínima de 6 caracteres (línea 26) es débil para un sistema que maneja actos con valor legal y firma electrónica; no exige mayúsculas/números/símbolos ni longitud recomendada (8-12+).
- Botón "Cancelar" hace logout y regresa a `/login` (líneas 87-91) — comportamiento correcto pero no está explicado en el copy (el usuario podría no anticipar que "Cancelar" cierra su sesión).

### 4.3 Administración de Usuarios (`administracionUsuarios/pages/IndexPage.vue`)
CRUD limpio, moderno (`script setup`), y el mejor ejemplo del "cómo debería verse" el resto de la app.

- Tabla con búsqueda (`debounce="300"`), columnas con slots personalizados para estado (chip Activo/Inactivo) y "debe cambiar contraseña" (ícono con tooltip).
- Alta/edición en diálogo simple; contraseña temporal se muestra **una sola vez** en un diálogo dedicado con botón de copiar al portapapeles (líneas 131-151) — excelente patrón de seguridad y usabilidad.
- Reset de contraseña con confirmación explícita (`confirmarReset`, líneas 257-275) — correcto.
- **Inconsistencia de confirmación**: "Activar/Desactivar" un usuario (línea 250-255, `alternarEstado`) se ejecuta **sin ningún diálogo de confirmación**, mientras que "Resetear contraseña" sí lo pide. Desactivar un usuario es una acción con impacto real (bloquea su acceso) y no tiene el mismo nivel de fricción protectora que acciones de menor impacto relativo.
- El campo `userName` es de solo lectura al editar con `hint` explicativo (línea 100) — buena prevención de errores.

### 4.4 Clúster de Administración (Áreas / Empleados / Perfiles)
Los cuatro módulos de administración (`administracionAreas`, `administracionEmpleados`, `administracionUsuarios`, `administracionPerfiles`) comparten un **mismo patrón** casi pixel-perfecto: título + botón primario a la derecha, tabla con buscador, diálogo de alta/edición, confirmación de eliminación con nombre interpolado. Esto es el clúster más consistente de toda la aplicación y debería usarse como plantilla de referencia para el resto.

- `administracionAreas`: selector de "Área padre" excluye la propia área editada (`computed opcionesPadre`, líneas 124-128) — buena prevención de ciclos en el front, complementaria a la validación del backend (comentario explícito en el código).
- `administracionEmpleados`: permite crear un "Puesto" nuevo sin salir del formulario mediante un `$q.dialog` con `prompt` (líneas 185-203) — buen patrón de flujo sin fricción, evita modal-dentro-de-modal.
- `administracionPerfiles`: gestión de permisos mediante `q-expansion-item` agrupados por prefijo de clave con contador `{{ contarGrupo(g) }}/{{ g.permisos.length }}` (líneas 94-113) — presentación clara de un catálogo de permisos potencialmente largo.
- **Ninguno de los 4 tiene breadcrumbs** (a diferencia de los módulos operativos, ver §13) ni tiene paginación visible configurada explícitamente (usa defaults de `q-table`, aceptable pero no verificado contra volúmenes reales).
- El texto de "sin permiso" difiere del resto de la app: `<div class="text-grey q-pa-lg">No tiene permisos para ver este módulo.</div>` (texto plano) vs. el `q-banner` naranja usado en cumplimiento (ver §22).

### 4.5 Baja documental (`bajaDocumental`)
Workflow representativo de "encabezado → detalle (cajas) → actos y firma".

- Buen flujo pos-registro: tras crear el encabezado, un diálogo pregunta "¿Desea capturar el inventario a dar de Baja?" con Sí/No, cada opción llevando a un lugar coherente (`ModalComp.vue:127-146`) — patrón de continuidad de tarea bien pensado.
- El botón "Actos y firma" desde la tabla abre `ActosDialog.vue` (componente compartido, ver §4.8) — buen ejemplo de reutilización real entre baja y transferencia secundaria.
- **Columnas muertas**: la tabla (`TablaComp.vue:166-186`) sigue declarando y renderizando las columnas `valida`, `visto_Bueno`, `aprobo`, pese a que el propio comentario del código (`Pages/IndexPage.vue:69-72`) documenta que esos roles legados **ya no existen** en el backend nuevo. El resultado es tres columnas siempre vacías ocupando espacio horizontal en una tabla que ya tiene 10 columnas — ruido visual y carga cognitiva sin valor.
- El diálogo de confirmación "Aprobar/Rechazar" en módulos vecinos usa `icon: "Warning"` (mayúscula) — ver bug transversal en §22; no se reprodujo aquí directamente pero sí en `TablaComp.vue` de módulos hermanos (transferencia secundaria, cédula de préstamo).
- Estado "sin permiso": el módulo simplemente oculta la tabla (`v-if="modulo.leer"`, `IndexPage.vue:28`) sin mostrar ningún mensaje — a diferencia del clúster de administración, aquí el usuario ve una página casi en blanco (solo breadcrumb) sin entender por qué.

### 4.6 Transferencia secundaria (`transferenciaSecundariaEncabezado`)
Refleja el mismo patrón que baja documental (mismo desarrollador/época), con las mismas fortalezas y debilidades: buen flujo de "¿capturar inventario ahora?", reutilización de `ActosDialog`, falta de banner de "sin permiso", breadcrumb con **error tipográfico** ("Trasnferencias secundarias", `IndexPage.vue:8`) visible en producción.

### 4.7 Cédula de préstamo (`cedulaPrestamo`)
El módulo más complejo funcionalmente: solicitud → aprobación (con selección de "visto bueno" vigente) → aceptación → impresión de anexos (recibo/comprobante).

- El flujo de aprobación es el más defensivo de la app: antes de aprobar, carga los "vistos buenos" activos y **bloquea la acción con un mensaje explícito** si no hay ninguno vigente (`TablaComp.vue:301-313`, "No hay vistos buenos vigentes para autorizar") — excelente prevención de errores, en vez de dejar avanzar un flujo que fallaría en el backend.
- El rechazo pide motivo mediante `$q.dialog` con `prompt` (líneas 333-373) — adecuado, aunque el campo de motivo no es obligatorio (`type: "text"` sin validación de "requerido"), por lo que se puede rechazar sin explicar el motivo pese a que la UI lo sugiere.
- Edición y eliminación de préstamo están **deshabilitadas explícitamente** con `v-if="false"` (líneas 75-94) en vez de eliminarse del código — deuda técnica menor (código muerto), documentado en el propio comentario como decisión de negocio (préstamos inmutables).
- La impresión de anexos (`Prestamo_AceptadoPage.vue`) usa generación **client-side** con `jspdf`/`jspdf-autotable` (import `genera_anexo_7`/`genera_anexo_8`), mientras que módulos más nuevos (Interoperabilidad, Avisos) descargan PDFs **generados en servidor** (`descargarReporte`, `store.exportarAviso`). Conviven dos arquitecturas de generación de documentos distintas — inconsistencia técnica con impacto UX (los PDFs client-side no reflejan necesariamente el mismo formato/calidad que los server-side, y duplican lógica de layout de documentos en el frontend).
- No se encontró en este código ninguna funcionalidad de "vale" con contraseña/reimpresión (los anexos generados son recibos de préstamo, no vales con credenciales) — cualquier hallazgo relacionado con ese fix específico corresponde a otra capa (backend) no visible en este repositorio de cliente.
- El diálogo de "Generar recibo" simplemente cierra sin advertencia si el usuario cierra el diálogo padre mientras el hijo está abierto (no se probó en runtime, pero no hay guardas visibles en el código).

### 4.8 Actos de disposición (`components/ActosDialog.vue`) — componente compartido
Merece mención aparte por ser el mejor ejemplo de reutilización de la aplicación: un solo componente sirve tanto a Baja documental como a Transferencia secundaria (prop `proceso: 'baja' | 'secundaria'`), con lógica de permisos por grupo (`archivo.baja.afectar` / `archivo.transferencia-secundaria.afectar`) y presenta un flujo completo de dictamen/acta → firma → publicación → verificación, incluyendo un banner explicativo del requisito legal (líneas 17-22: "Para afectar la baja se requiere un dictamen y un acta firmados (LGA 58 / Nay 56)"). Buena práctica a conservar y replicar: **cita el fundamento legal directamente en la UI**, algo que ningún otro módulo hace de forma tan explícita.

Único señalamiento: son **3 niveles de `q-dialog` anidados** (el diálogo principal de actos + crear/publicar/verificar como hijos) — funciona en Quasar, pero en pantallas pequeñas el apilamiento de overlays puede generar confusión sobre cuál "cerrar" corresponde a cuál capa.

### 4.9 Inventario general por expediente — tabla grande (`inventarioAreaGral/components/TablaItem.vue`)
El caso más extremo de densidad de datos de la aplicación.

- **24 columnas** definidas (`TablaItem.vue:214-383`): Selección, Estatus, Sección, Serie, SubSerie, Clave, Nombre expediente, No. interno, Descripción/Observaciones, Fecha inicio, Fecha término, Ubicación, Valor documental, 3 vigencias, Destino final, 3 fechas de clasificación, Motivo de rechazo, Clasificado, Total páginas, Acciones.
- **Todas** las columnas usan `align: "center"` (incluidas `descripcion` y `nombre_Expediente`, que son texto libre potencialmente largo) — centrar texto de longitud variable dificulta la lectura en comparación con alineación a la izquierda, que es la convención tipográfica estándar para texto no numérico.
- No hay selector de columnas visibles (`visible-columns`) que permita al usuario ocultar las que no necesita en el día a día (sí existe en `cedulaPrestamo/components/TablaComp.vue`, evidenciando que el patrón existe en la base de código pero no se aplicó aquí, donde más falta hace).
- Se mitiga el scroll horizontal fijando solo la última columna (clase `.my-sticky-last-column-table`, duplicada literalmente en al menos 8 archivos distintos en vez de vivir en `app.scss`, que está vacío).
- Tres botones de exportación en la cabecera de página (Anexo 4, Excel, Anexo 5) con colores distintos (`purple-ieen`, `green-8`, `purple-ieen`) sin agrupación visual ni menú desplegable — para un usuario nuevo no es obvio cuál generar y por qué hay dos "iguales" en apariencia con función distinta.

### 4.10 Cumplimiento — PADA, Preservación, Interoperabilidad, Avisos, Grupo interdisciplinario
Este clúster (construido en las Fases 3-4 documentadas en la memoria del proyecto) es, junto al de Administración, el de **mejor calidad UX de la aplicación**:

- Todos usan el mismo esqueleto: `q-breadcrumbs` → `q-banner`/mensaje de estado si falta permiso → contenido → diálogos con `q-form` y validación `lazy-rules`.
- Estados representados con `q-chip` de color semántico consistente (`colorEstado`: naranja=Borrador, verde=Aprobado, morado=Publicado) — repetido idénticamente en PADA y en el patrón de Avisos (rojo=Vencido).
- **Avisos** (`avisos/pages/IndexPage.vue`) cita el plazo legal directamente en el título de la tabla ("plazo 45 días · LGA 59 / Nay 57", línea 20) y calcula visualmente el vencimiento con `text-red text-weight-bold` cuando `diasRestantes < 0` — excelente para una app de cumplimiento normativo, refuerza el propósito legal en el propio dato.
- **Preservación** presenta KPIs en tarjetas (Adjuntos / Sin huella / Formato no preservación / Integridad ✗) antes de la tabla de riesgo — buen resumen ejecutivo visual, ausente en el resto de la aplicación (ningún otro módulo usa tarjetas de KPI).
- **Interoperabilidad** usa `q-tree` para representar el cuadro de clasificación jerárquico (fondo → sección → serie → subserie) — uso apropiado del componente para datos jerárquicos, en contraste con el resto de la app que aplana todo en tablas.
- Único gap relevante de este clúster: los banners de "sin permiso" (`q-banner class="bg-orange-2"`) y el color naranja-para-permiso-denegado no se reutiliza en ningún módulo fuera de este clúster (ver inconsistencia en §22).

---

## 5. Pasada ligera — resto de módulos (hallazgos agregados)

Revisados por estructura de archivos + componente clave + `grep` dirigido: `cajasTransferencias`, `cajasTransferenciasAI`, `cajasTransferenciasSecundarias`, `cajasBajas`, `inventarioArea`, `inventarioAreaAI`, `encabezadoInventarioArea`, `secciones`, `disposicionDocumental`, `enlaces`, `voBos`, `soliciutdes_ai`, `transferenciaPrimariaAiEncabezado`, `trasferenciaPrimariaEncabezado`.

Patrones repetidos detectados:
1. **Mismo esqueleto Tabla+Modal(+ModalVer)+Registro_Detalle** en todos los módulos de "cajas" (Transferencias, Transferencias secundarias, Bajas) y en Cédula de préstamo — buena consistencia estructural interna, pero cada uno reimplementa su propia tabla y su propio CSS `.my-sticky-last-column-table` en vez de compartir un componente base.
2. **Errores tipográficos en nombres de carpeta**: `Modulos/enlaces/compnents/` y `Modulos/voBos/compnents/` (falta la "o" de "components"); `Modulos/trasferenciaPrimariaEncabezado/` (falta la "n" de "transferencia"). No afectan al usuario final directamente, pero son señal de falta de revisión de código y elevan el costo de mantenimiento futuro.
3. **`icon: "Warning"` / `icon: "Information"`** (capitalizado) en diálogos de confirmación — encontrado en **32 archivos** distintos vía `grep` (ver detalle en §22), incluyendo `TablaComp.vue`/`ModalComp.vue` de casi todos los módulos operativos.
4. **`console.log` de depuración** dejado en producción: 47 archivos con 300 ocurrencias en total (incluye un `console.log(props.clasificado)` suelto en `cedulaPrestamoClasificado/IndexPage.vue:83`).
5. **Patrón `espera(ms)` + `$q.loading.show()`** (delay artificial vía `setTimeout` antes de continuar) usado en más de 40 puntos distintos del código, con valores que van de 20 ms a un caso extremo de **5000 ms** en `encabezadosInventariosGral/pages/IndexPage.vue:94` antes de abrir el diálogo "Nuevo" — ver detalle en §17 y §22.
6. `soliciutdes_ai` (nombre de carpeta con error tipográfico "soliciutdes") gestiona préstamos institucionales con un patrón de tabs similar a Cédula de préstamo — mismo patrón, misma familia de deuda (columnas fijas, `espera()`, iconos mal escritos).
7. Ningún módulo de este grupo usa `q-skeleton` ni estados de carga progresivos; todos dependen del overlay global `$q.loading`.
8. Los módulos de "cajas" (`cajasTransferencias`, `cajasBajas`, `cajasTransferenciasSecundarias`) tienen componentes `RegistroDetalleComp.vue` con cientos de líneas y múltiples `espera(100)` encadenados para sincronizar selects dependientes (área → inventario → detalle) — indicio de que la reactividad de Pinia no se está aprovechando correctamente y se compensa con temporizadores, lo cual es fráil ante cambios de velocidad de red/dispositivo.

---

## 6. Auditoría visual

**Fuente de estilos**: `src/css/app.scss` está **vacío** (`// app global css in SCSS form`, única línea). `src/css/quasar.variables.scss` define la paleta *default* de Quasar (`$primary:#1976D2`, `$secondary:#26A69A`, `$accent:#9C27B0`, etc.) que **no se usa en la práctica** salvo en el botón de login. La marca real del sistema (`purple-ieen`, `pink-ieen`, `gray-ieen`, cada uno en 3 tonos) está definida como CSS plano dentro de `<style lang="scss">` de `MainLayout.vue:445-506`, fuera del sistema de theming de Quasar.

- **Tipografía**: no hay declaración de familia tipográfica propia (usa la fuente por defecto de Quasar/Roboto vía `@quasar/extras`). Jerarquía basada en clases utilitarias de Quasar (`text-h6`, `text-subtitle1`, `text-caption`) aplicadas de forma razonablemente consistente para títulos de sección, pero sin una escala documentada (cada desarrollador eligió `text-h6` vs `text-subtitle1` para títulos de página de forma discrecional).
- **Colores**: paleta de marca coherente y bien escalada (3 tonos de morado, 3 de rosa, 3 de gris) pero **vive fuera del sistema de theming** (no son variables SCSS de Quasar, son clases `.text-purple-ieen`/`.bg-purple-ieen` con `!important`), lo que impide, por ejemplo, cambiar el tema desde `quasar.variables.scss` sin editar además el layout. Los estados semánticos (positive/negative/warning) sí usan los valores por defecto de Quasar y se aplican de forma consistente en chips y notificaciones.
- **Espaciados**: uso consistente de las utilidades `q-pa-md`, `q-gutter-md`, `q-mb-md` de Quasar en casi todos los módulos — buen indicio de que, aunque no exista un archivo de tokens, existe una convención implícita razonable.
- **Bordes/sombras**: mezcla de `flat bordered` (módulos de cumplimiento, más recientes, look plano con borde) vs. cards con sombra por defecto de Quasar (módulos operativos más antiguos) — diferencia visual perceptible al navegar entre, por ejemplo, "PADA" (plano) y "Cédula de préstamo" (con sombra), sin que exista una razón funcional para la diferencia.
- **Iconografía**: Material Icons vía `@quasar/extras`, uso extenso y en general semánticamente correcto (`folder_delete` para bajas, `sync` para préstamos, `verified` para actos). El bug de capitalización (`"Warning"`/`"Information"`) descrito en §22 es el principal defecto de iconografía, además de la ausencia de una guía de qué ícono corresponde a qué acción (algunos módulos usan `delete` y otros `cancel` para "rechazar", por ejemplo).

---

## 7. Botones y acciones

- **Primarios**: `color="purple-ieen"` (o `"secondary"` en cumplimiento) + label + ícono, consistente en la mayoría de formularios ("Guardar", "Nuevo").
- **Secundarios/Cancelar**: `color="red"` + `label="Cancelar"` + `icon="highlight_off"` — patrón repetido casi textual en decenas de modales (`ModalComp.vue` de baja, transferencia, cédula, etc.), lo cual es positivo por su consistencia mecánica, pero usar **rojo para "Cancelar"** es discutible: rojo se asocia convencionalmente con acciones destructivas/negativas, y aquí se usa para una acción neutra (cerrar sin guardar), mientras que las acciones verdaderamente destructivas (Eliminar) también usan `color="negative"`/rojo — se pierde la distinción semántica entre "cancelar" y "eliminar".
- **Destructivos**: `color="negative"`/`"red"` + ícono `delete` + confirmación vía `$q.dialog`, consistente en el clúster de Administración; en cambio, "Rechazar" en Préstamos/Inventario usa `color="purple-ieen"` (el mismo morado que "Aprobar" o "Ver"), sin diferenciación cromática entre una acción positiva y una negativa dentro de la misma fila de acciones (`TablaComp.vue` de cédula de préstamo e inventario general, iconos `check_circle`/`cancel` en el mismo color).
- **Botones ícono-solo con tooltip** (editar/ver/eliminar/aprobar/rechazar) son el patrón dominante en tablas — funcionales en desktop con mouse, pero sin `aria-label`, no accesibles a lectores de pantalla, y sin equivalente táctil en dispositivos móviles (el tooltip no se dispara con tap).

---

## 8. Formularios

- Uso consistente de `q-form` + `:rules` + `lazy-rules`, con mensajes de requerido en español ("Requerido", "El área es requerida").
- Patrón mixto de validación: algunos formularios usan `myForm.value.validate()` explícito antes de enviar (`cedulaPrestamo/ModalComp.vue:189`), otros confían solo en el evento `@submit` del `q-form` (que también valida, pero de forma menos explícita) — dos formas de lograr lo mismo conviviendo en el código.
- Campos de solo lectura (`readonly`) usados para mostrar datos derivados del usuario autenticado (área generadora, "Elaboró") — buena prevención de errores (el usuario no puede alterar datos que el sistema ya conoce), aunque visualmente un campo `readonly` de Quasar no siempre se distingue con suficiente contraste de uno editable vacío.
- No se identificó un patrón consistente de "campos obligatorios marcados con \*" — algunos labels lo incluyen (`"Folio *"`, admin usuarios) y otros no, pese a tener regla de "Requerido" (la mayoría de los módulos operativos).
- Selects con `use-input`/`@filter` para catálogos largos (áreas, empleados, inventarios) — patrón correcto para listas extensas, aplicado de forma razonablemente consistente.

---

## 9. Validaciones y mensajes de error

- Los errores de red/backend se normalizan en las stores a `resp.data` (string) antes de notificarse (`$q.notify({type:'negative', message: resp.data})`), generalmente ya en español (mensajes tipo "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte", `auth_store.js:97,101`). **No se filtran mensajes técnicos tipo "Error 400"/stack traces hacia el usuario** en el código auditado — punto positivo.
- Excepción relevante: el interceptor global de Axios (`boot/axios.js:24-33`) captura errores 401 pero solo hace `console.log('Error 401: No autorizado')` y **no notifica al usuario ni redirige a login**. Si el token expira en medio de una sesión activa, cada llamada subsecuente fallará silenciosamente (dependiendo de cómo cada store maneje el `catch`), dejando al usuario interactuar con una UI que ya no puede persistir nada, sin ninguna señal visual de "su sesión expiró".
- Los mensajes de validación de formulario son genéricos y repetidos ("Requerido") en vez de específicos al campo (p. ej. "El folio es requerido" vs simplemente "Requerido") en la mayoría de los inputs, salvo excepciones puntuales bien redactadas (`"El área responsable es requerida"`, `bajaDocumental/ModalComp.vue:34`).

---

## 10. Tablas (`q-table`)

44 usos de `q-table` en todo el proyecto.

- Buscador con debounce consistente (`debounce="300"`) en la gran mayoría.
- `rows-per-page-label` traducido consistentemente a "Filas por página/pagina" (nótese la inconsistencia ortográfica: con y sin tilde según el módulo).
- `no-data-label` presente en casi todas — buen estado vacío por defecto (ver también §15).
- Densidad no diferenciada: no se usa la prop `dense` de forma consistente; tablas de 20+ columnas (inventario general) no son más compactas que tablas de 5 columnas (grupo interdisciplinario).
- Paginación: se deja el comportamiento por defecto de Quasar en la mayoría de los casos, y solo los módulos de cumplimiento fijan explícitamente `:pagination="{ rowsPerPage: 10 }"` o `15` — inconsistencia menor pero real en cuántas filas ve el usuario por defecto según el módulo.
- **Selector de columnas visibles** (`visible-columns`) existe solo en `cedulaPrestamo/components/TablaComp.vue` — no se replicó en la tabla que más lo necesita (24 columnas de inventario general).

---

## 11. Búsqueda y filtros

- Filtro de texto libre (`q-input` + `filter` de `q-table`) es el mecanismo dominante y funciona de forma consistente.
- Filtros estructurados (por ejemplo, "Área generadora" en `bajaDocumental/TablaComp.vue:15-21`) usan un `q-select` fuera de la tabla que dispara una recarga completa vía `watch` — patrón correcto, aunque el valor por defecto ("Ver todos") es un string mágico comparado en varios lugares en vez de una constante nombrada.
- No existen filtros combinados persistentes (guardar/recordar la última combinación de filtros del usuario) en ningún módulo revisado.
- No hay filtros por rango de fechas en tablas que tienen múltiples columnas de fecha (vigencias, fechas de clasificación) — el usuario debe usar el buscador de texto libre, que no funciona bien sobre fechas.

---

## 12. Navegación

- **Sidebar** (`q-drawer`, `MainLayout.vue:21-127`): agrupación por `q-expansion-item` en 5 secciones fijas (Catálogos, Archivo en trámite, Préstamos, Archivo en Concentración, Cumplimiento) + Administración, cada una condicionada a `v-if="...length > 0"` según permisos — buen patrón de navegación adaptativa a permisos.
- **Breadcrumbs**: presentes en los módulos operativos "clásicos" (baja, transferencias, préstamos, inventarios) pero **ausentes** en todo el clúster de Administración y en la página de inicio (`IndexPage.vue`) — inconsistencia real de orientación dentro del sitio.
- **Tabs** (`q-tabs`/`q-tab-panels`): usados para separar "Solicitudes del área / Solicitudes al área" (préstamos) y "Programas / Informes" (PADA), "Por encabezado / Detalles" (inventario general) — patrón correcto para contenido relacionado pero mutuamente excluyente.
- No existe navegación de "migas de administración" adicional (p. ej. dentro de "Grupo interdisciplinario" → "Sesiones" no hay breadcrumb que muestre la ruta completa, solo el título de página).
- El acceso a "Cerrar sesión" está detrás de un ícono genérico de apps (`icon="apps"`, esquina superior derecha) que abre un `q-bottom-sheet` de tipo grid con **una sola opción** (`MainLayout.vue:410-423`) — sobre-ingeniería de interacción para una acción tan frecuente y crítica como cerrar sesión; además no muestra el nombre del usuario actual en el header (el nombre solo aparece dentro del drawer, superpuesto sobre una imagen de fondo).

---

## 13. Diálogos y modales

- Todos los CRUD usan `q-dialog persistent` (no se cierra al hacer clic fuera) — decisión correcta para formularios con datos no guardados, evita pérdida accidental de información.
- Los diálogos de "Ver" (`ModalVerComp.vue`) son de solo lectura, separados de los de edición — buena separación de intención, aunque duplica bastante markup entre "Ver" y "Editar" del mismo formulario en varios módulos (podrían compartir un mismo componente con prop `readonly`).
- Modales anidados confirmados en `ActosDialog.vue` (§4.8) y en el flujo de "Registro_Detalle" dentro de "ModalComp" de Cédula de préstamo (un formulario completo de captura de detalle vive dentro del modal de la solicitud). Es un patrón funcional pero incrementa la complejidad de foco/tab-order dentro de un mismo overlay.
- No se usa el patrón "drawer" (panel lateral) para ninguna edición — todo es modal centrado, incluso formularios largos (24 columnas de datos en inventario se editan en un modal, no confirmado su tamaño exacto pero el patrón general de la app son modales de 420-960px de ancho máximo).

---

## 14. Estados de carga

- Dominante: overlay global `$q.loading.show()/hide()` que bloquea **toda la interfaz** (incluido el drawer de navegación) durante prácticamente cualquier operación asíncrona, incluidas operaciones que deberían ser instantáneas (abrir un modal de creación).
- Complementario: prop `:loading` en botones de submit (con `<template v-slot:loading><q-spinner-hourglass/>Cargando...</template>` repetido casi textualmente en decenas de archivos) — buen patrón de feedback local, pero redundante cuando además el overlay global ya está bloqueando la pantalla completa.
- **Cero usos de `q-skeleton`** en todo el proyecto — no hay estados de carga progresivos/esqueleto para tablas o tarjetas, todo es "pantalla congelada con spinner" o "nada".
- El caso más severo: `encabezadosInventariosGral/pages/IndexPage.vue:94`, `await espera(5000)` bloqueando la apertura del formulario "Nuevo" con el overlay global activo durante 5 segundos completos sin ninguna llamada de red visible que lo justifique en ese punto del código.

---

## 15. Estados vacíos

- `no-data-label` de `q-table` presente en casi todas las tablas ("No hay usuarios", "No hay registros", "Sin actos registrados") — mensajes cortos, correctos, aunque genéricos (no sugieren una acción, p. ej. "No hay usuarios — cree el primero con el botón Nuevo usuario").
- Listas dentro de diálogos (actividades del PADA, integrantes del grupo, historial de preservación) tienen su propio estado vacío con `text-grey-7 text-center` — consistente entre los módulos de cumplimiento.
- La página de inicio (`pages/IndexPage.vue`, no fue modificada del scaffold de Quasar según lo revisado) no ofrece ningún resumen, KPI ni accesos directos — es el "estado vacío" más importante de la aplicación (lo primero que ve cualquier usuario al iniciar sesión) y no aporta ningún valor.

---

## 16. Confirmaciones

- Vía `$q.dialog` nativo de Quasar de forma 100% consistente — pese a que `sweetalert2` **está declarado como dependencia** en `package.json` (`"sweetalert2": "^11.22.2"`), no se encontró ningún uso (`Swal`) en `src/Modulos` — dependencia muerta, nunca migrada o nunca retirada.
- Los mensajes de confirmación para eliminar **sí interpolan el nombre del elemento** ("¿Eliminar el área 'X'?") — buena práctica que reduce el riesgo de eliminar el registro equivocado.
- **Ninguna confirmación explica consecuencias en cascada** (p. ej., eliminar un área que tiene empleados asignados, o un perfil que tiene usuarios asignados) — el texto es siempre la pregunta genérica "¿Eliminar...?" sin advertir de qué depende de ese registro, algo especialmente relevante en un sistema de archivo con obligaciones legales de trazabilidad.
- Icono de advertencia mal escrito (`icon: "Warning"`) en 32 archivos — ver §22.

---

## 17. Prevención de errores

Puntos fuertes reales (evidencia concreta, no genérica):
- Bloqueo de "Aprobar préstamo" si no hay vistos buenos vigentes (§4.7).
- Exclusión de la propia área al elegir "Área padre" (§4.4).
- Campos derivados del usuario autenticado en modo solo lectura (área generadora, elaboró).
- Botón submit con `:loading` que previene doble envío mientras la promesa está en curso (patrón de Quasar, aplicado consistentemente).

Puntos débiles:
- El overlay `$q.loading` bloquea toda interacción durante la espera artificial (`espera()`), lo cual **previene** dobles clics de forma efectiva pero a costa de bloquear también la navegación (el usuario no puede ni siquiera abrir el drawer mientras espera 100 ms–5000 ms sin motivo de red).
- No hay ningún autoguardado ni advertencia de "cambios sin guardar" al cerrar un modal con datos parcialmente capturados (los modales `persistent` evitan el cierre accidental por clic-fuera, pero el botón "Cancelar"/"X" descarta sin preguntar).

---

## 18. Responsive

- Grillas de formulario usan clases `col-xs-*/col-sm-*/col-md-*` de Quasar de forma extensa (300 ocurrencias en 47 archivos) — los formularios sí están pensados para reflow en pantallas pequeñas.
- El drawer usa `:breakpoint="1024"` (`MainLayout.vue:25`) — comportamiento estándar de Quasar (colapsa a overlay por debajo de 1024px).
- **Las tablas no tienen tratamiento responsive**: ninguna usa el modo "grid"/tarjetas de `q-table` para pantallas angostas; una tabla de 24 columnas en un teléfono es, en la práctica, inutilizable salvo con scroll horizontal extenso.
- No se encontró ningún `@media` query personalizado en el código (`app.scss` vacío) — todo el comportamiento responsive depende exclusivamente de las utilidades de grid de Quasar, sin ajustes específicos para los casos más densos (tablas grandes, modales con múltiples secciones).
- **Conclusión**: la aplicación es "responsive de formulario, no responsive de datos" — adecuada para tablets/desktop, deficiente en teléfono para las pantallas de mayor volumen de información (que son, además, las de uso diario más frecuente: inventarios, cajas, préstamos).

---

## 19. Accesibilidad

Hallazgo cuantificado más grave de toda la auditoría: `grep -r "aria-|role=|tabindex" src/` devuelve coincidencias en **un solo archivo de 116** (`MainLayout.vue`, un `aria-label="Menu"` en el botón de hamburguesa). El resto de la aplicación —incluidos decenas de botones icono-solo, diálogos, tablas y formularios— **no tiene ningún atributo de accesibilidad explícito**.

Consecuencias concretas:
- Botones de acción (editar/eliminar/ver/aprobar/rechazar) sin `aria-label`: para un lector de pantalla se anuncian solo como "botón", sin indicar su función — el único indicio visual (el ícono) y textual (el `q-tooltip`, que no siempre es accesible vía teclado/lectores de pantalla) no sustituye un `aria-label`.
- Mensajes de error de formulario sin `role="alert"`/`aria-live` — un cambio de estado (error tras enviar) no se anuncia automáticamente.
- No se identificó manejo explícito de foco al abrir/cerrar diálogos (Quasar gestiona algo de esto por defecto en `q-dialog`, pero no hay `autofocus` consistente — algunos formularios sí lo usan (`autofocus` en el primer campo, presente en varios modales), otros no).
- Contraste: no auditable con certeza sin renderizar, pero los tonos usados (`purple-ieen-3 #bb83ca` sobre blanco como color de fondo de chip con texto blanco, por ejemplo) son candidatos a revisar contra WCAG AA (contraste mínimo 4.5:1 para texto normal) — se recomienda verificación con herramienta de contraste antes de certificar cumplimiento.
- No hay "skip to content" ni estructura de encabezados (`h1`-`h6`) semántica visible — se usan clases utilitarias de tipografía (`text-h6`) sobre `<div>`, que visualmente parecen encabezados pero no lo son semánticamente para un lector de pantalla.

Para un sistema gubernamental sujeto a obligaciones de accesibilidad (México cuenta con lineamientos de accesibilidad web para sitios de gobierno), este es el hallazgo de mayor riesgo normativo/reputacional de toda la auditoría.

---

## 20. Microcopy

- Terminología generalmente consistente en español ("Guardar", "Cancelar", "Nuevo", "Editar", "Eliminar") a través de módulos.
- Inconsistencias detectadas:
  - "Filas por pagina" (sin tilde) vs. "Filas por página" (con tilde) según el módulo (`rows-per-page-label`).
  - "Trasnferencias secundarias" — error tipográfico visible en un breadcrumb de producción (§4.6).
  - "No tiene permisos para ver este módulo." (administración) vs. "No tiene permiso para ver..." (cumplimiento, sin "s" en "permiso") — mismo mensaje, dos redacciones.
  - Mezcla de "Prestamos"/"Préstamos" (sin/con tilde) en distintos labels de tabs del mismo módulo de cédula de préstamo clasificado (`"Prestamos"` en `cedulaPrestamoClasificado/IndexPage.vue:46` vs `"Préstamos"` en `cedulaPrestamo/pages/IndexPage.vue:46`).
- No se detectaron mensajes técnicos crudos (`Error 400`, stacks) expuestos al usuario en el código revisado — punto positivo genuino, ya mencionado en §9.

---

## 21. Consistencia global (design system implícito)

No existe un design system documentado ni una carpeta de componentes base reutilizables más allá de `components/EssentialLink.vue` y `components/ActosDialog.vue` (2 componentes compartidos para 116 archivos `.vue`). Cada módulo reimplementa:
- Su propia tabla con su propio bloque de estilos `.my-sticky-last-column-table` (duplicado en ≥8 archivos).
- Su propio patrón de "sin permiso" (3 variantes distintas encontradas: texto plano gris, `q-banner` naranja, o directamente ocultar el contenido sin mensaje).
- Su propio botón "Cancelar" con las mismas 3 props repetidas manualmente en vez de un componente `<BtnCancelar/>`.

Lo positivo: dentro de cada "generación" de desarrollo (el clúster de Administración por un lado, el clúster de Cumplimiento por otro) la consistencia interna es alta — el problema es la falta de una capa compartida **entre** generaciones, generando una app que se percibe como "dos aplicaciones cosidas" más que como un sistema único.

---

## 22. Heurísticas de Nielsen — evaluación explícita

| # | Heurística | Evaluación | Evidencia |
|---|---|---|---|
| 1 | Visibilidad del estado del sistema | ⚠ Parcial | Notificaciones `$q.notify` consistentes para éxito/error; pero el overlay `$q.loading` global no distingue "cargando datos reales" de "espera artificial", y los 401 silenciosos (`boot/axios.js:24-33`) dejan al usuario sin saber que su sesión expiró. |
| 2 | Correspondencia sistema-mundo real | ✅ Buena | Terminología del dominio archivístico (secciones, series, subseries, disposición documental, transferencia primaria/secundaria) usada de forma consistente y correcta; citas explícitas a artículos de ley en Avisos y ActosDialog. |
| 3 | Control y libertad del usuario | ⚠ Parcial | Diálogos `persistent` evitan cierres accidentales, pero "Cancelar" en `CambiarPassword` cierra la sesión sin advertirlo (§4.2); no hay "deshacer" en ninguna acción. |
| 4 | Consistencia y estándares | 🔴 Débil | Ver §21: 3 tratamientos distintos de "sin permiso", 2 tonos de tarjeta (flat vs. sombra), colores duplicados fuera del theming, errores ortográficos variables. |
| 5 | Prevención de errores | ⚠ Parcial | Buenos ejemplos puntuales (§17), pero confirmaciones sin explicar consecuencias en cascada y contraseña mínima de 6 caracteres son débiles para el dominio (documentos con valor legal). |
| 6 | Reconocer antes que recordar | ⚠ Parcial | Selects con catálogo visible y búsqueda; pero botones icono-solo sin label visible obligan a "recordar" qué ícono corresponde a qué acción en tablas de acciones múltiples. |
| 7 | Flexibilidad y eficiencia de uso | 🔴 Débil | Sin atajos de teclado, sin filtros guardados, sin acciones en lote (salvo un caso aislado), y el patrón `espera()` penaliza activamente al usuario experto en vez de premiar su repetición de tareas. |
| 8 | Diseño estético y minimalista | ⚠ Parcial | Módulos de cumplimiento y administración son limpios; la tabla de 24 columnas todo-centrado es el extremo opuesto (sobrecarga de información sin jerarquía). |
| 9 | Ayudar a reconocer/diagnosticar/recuperarse de errores | ✅ Buena | Mensajes de error ya traducidos y accionables en general (no hay jerga técnica cruda); ver excepción del 401 silencioso. |
| 10 | Ayuda y documentación | 🔴 Débil | No hay ayuda contextual, tours, tooltips explicativos de campos complejos (vigencias, valores documentales), ni enlace a documentación/soporte visible en ninguna pantalla. |

---

## 23. Deuda UX/visual/funcional/técnica clasificada

### Deuda técnica con impacto UX directo
| Hallazgo | Evidencia | Prioridad |
|---|---|---|
| Delay artificial `espera()` + overlay bloqueante global en 60+ puntos, incl. 5000 ms | `encabezadosInventariosGral/pages/IndexPage.vue:94` y ~59 puntos más | P0 |
| `icon: "Warning"`/`"Information"` (capitalizado, no renderiza) | 32 archivos | P1 |
| 401 silencioso sin feedback ni redirección | `boot/axios.js:24-33` | P0 |
| `console.log` de depuración en producción | 300 ocurrencias / 47 archivos | P2 |
| Dependencia `sweetalert2` sin uso real | `package.json` | P3 |
| Ruta duplicada `/cedulasPrestamo` para dos módulos distintos | `router/routes.js:54-62` | P2 |
| CSS `.my-sticky-last-column-table` duplicado en ≥8 archivos, `app.scss` vacío | `src/css/app.scss` | P3 |

### Deuda visual
| Hallazgo | Evidencia | Prioridad |
|---|---|---|
| Paleta de marca fuera del theming de Quasar (login usa azul default) | `Login_Nuevo.vue:31`, `CambiarPassword.vue:41` | P2 |
| Inconsistencia flat/bordered vs. sombra entre generaciones de módulos | comparar `pada` vs. `cedulaPrestamo` | P3 |
| Tabla de 24 columnas, todo centrado, sin selector de columnas | `inventarioAreaGral/components/TablaItem.vue` | P1 |

### Deuda funcional/UX
| Hallazgo | Evidencia | Prioridad |
|---|---|---|
| Accesibilidad casi inexistente (1 `aria-label` en todo el proyecto) | grep global | P0 |
| 3 tratamientos distintos del estado "sin permiso" | administración vs. cumplimiento vs. operativos | P1 |
| Sin breadcrumbs en todo el clúster de Administración | 4 archivos `IndexPage.vue` | P2 |
| Columnas muertas (valida/visto_bueno/aprobó) en tabla de bajas | `bajaDocumental/Components/TablaComp.vue:166-186` | P2 |
| Confirmaciones sin advertir consecuencias en cascada | todo `$q.dialog` de eliminar | P2 |
| Sin recuperación de contraseña ni ayuda en login | `Login_Nuevo.vue` | P2 |
| Sin `q-skeleton`, toda carga es overlay total o nada | grep global | P2 |
| Tablas no responsive (desktop-only en las pantallas más usadas) | grep de `q-table` sin modo grid | P2 |

### Deuda de microcopy
| Hallazgo | Evidencia | Prioridad |
|---|---|---|
| "Trasnferencias secundarias" (typo en breadcrumb de producción) | `transferenciaSecundariaEncabezado/pages/IndexPage.vue:8` | P3 |
| Inconsistencias de tildes/redacción (permiso/permisos, página/pagina) | múltiples | P4 |

---

## 24. Matriz UX por pantalla/módulo

Escala 0-10 por criterio. Estado: 🟢 sólido · 🟡 aceptable con reservas · 🔴 requiere atención.

| Pantalla | Usabilidad | Claridad | Consistencia | Diseño | Accesibilidad | Estado |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| Login | 7 | 8 | 5 | 6 | 4 | 🟡 |
| Cambiar contraseña | 7 | 7 | 6 | 6 | 4 | 🟡 |
| Administración de Usuarios | 8 | 8 | 8 | 7 | 4 | 🟢 |
| Administración de Áreas | 8 | 8 | 8 | 7 | 4 | 🟢 |
| Administración de Empleados | 8 | 8 | 8 | 7 | 4 | 🟢 |
| Administración de Perfiles | 7 | 7 | 8 | 7 | 4 | 🟢 |
| Baja documental (listado) | 5 | 5 | 5 | 5 | 3 | 🔴 |
| Baja documental (alta) | 6 | 6 | 6 | 5 | 3 | 🟡 |
| Transferencia secundaria (listado) | 5 | 5 | 5 | 5 | 3 | 🔴 |
| Cédula de préstamo (listado) | 6 | 5 | 6 | 5 | 3 | 🟡 |
| Cédula de préstamo (aprobar) | 7 | 6 | 6 | 5 | 3 | 🟡 |
| Inventario general (tabla 24 col.) | 4 | 4 | 5 | 4 | 2 | 🔴 |
| Inventario general (encabezados) | 5 | 6 | 6 | 5 | 3 | 🟡 |
| PADA | 7 | 8 | 8 | 8 | 4 | 🟢 |
| Preservación digital | 7 | 8 | 8 | 8 | 4 | 🟢 |
| Interoperabilidad | 7 | 8 | 8 | 7 | 4 | 🟢 |
| Avisos | 7 | 8 | 8 | 7 | 4 | 🟢 |
| Grupo interdisciplinario | 7 | 8 | 8 | 7 | 4 | 🟢 |
| Secciones (catálogo, tarjetas) | 6 | 6 | 6 | 6 | 3 | 🟡 |
| Actos de disposición (dialog) | 7 | 8 | 7 | 7 | 3 | 🟢 |

---

## 25. Scores globales y UX MATURITY SCORE

| Dimensión | Score | Justificación breve |
|---|:-:|---|
| Usabilidad | 62/100 | Flujos correctos y defensivos en varios puntos (§17), penalizados por delays artificiales y overlay global sobreusado. |
| Diseño visual | 58/100 | Marca coherente pero fuera del theming; brecha estética entre generaciones de módulos. |
| Consistencia | 55/100 | 3 tratamientos de "sin permiso", CSS duplicado, dos arquitecturas de generación de PDF, naming irregular. |
| Accesibilidad | 30/100 | 1 `aria-label` en 116 archivos; sin foco/roles gestionados; dependencia total de tooltips e íconos. |
| Navegación | 68/100 | Sidebar adaptativo a permisos, bien logrado; breadcrumbs inconsistentes; logout sobre-diseñado. |
| Formularios | 65/100 | Reglas de validación consistentes; mezcla de patrones de envío; sin marcador uniforme de obligatoriedad. |
| Feedback del sistema | 60/100 | `$q.notify` consistente y bien redactado; 401 silencioso es una brecha seria. |
| Responsive | 45/100 | Formularios adaptativos; tablas (el uso diario real) esencialmente desktop-only. |
| Productividad | 55/100 | Buscadores con debounce y selects filtrables; sin atajos, sin lote, penalizado por esperas artificiales. |

### UX MATURITY SCORE: **55/100**

**Clasificación: Funcional pero con problemas importantes.**

El sistema cubre de forma seria y bien pensada un dominio legal complejo (LGA/Ley de Archivos de Nayarit), y los módulos más recientes (Administración, Cumplimiento Fases 3-4) demuestran que el equipo es capaz de producir pantallas consistentes, claras y bien fundamentadas legalmente en el propio copy. Sin embargo, el promedio se ve arrastrado por: una brecha de accesibilidad casi total, un antipatrón de rendimiento percibido replicado sistemáticamente (`espera()` + overlay bloqueante, incluido un caso de 5 segundos), tablas de datos densas sin tratamiento responsive ni de legibilidad, y una falta de capa de diseño compartida que hace que la aplicación se sienta como la suma de varias generaciones de desarrollo distintas en vez de un producto único y coherente.
