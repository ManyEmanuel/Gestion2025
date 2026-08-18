# Tokens de diseño — Sistema de Gestión Documental (Archivo IEEN)

Referencia de las convenciones visuales del sistema, resultado de la Fase 4 del
plan de mejora UX (`UX-IMPROVEMENT-PLAN.md`). No es aspiracional: documenta lo
que el código ya hace de forma consistente, para que se seleccione a propósito
en vez de por hábito.

## 1. Color

### 1.1 Tema de Quasar (`src/css/quasar.variables.scss`)

| Token | Valor | Uso |
|---|---|---|
| `$primary` | `#673e84` (morado de marca, antes `purple-ieen`) | Acciones de navegación/apertura vía `color="primary"` (poco usado directamente; la mayoría del código usa la clase `purple-ieen`, ver 1.2) |
| `$secondary` | `#26A69A` (teal, **sin cambio** respecto al default de Quasar) | Botones "Guardar"/"Confirmar" en decenas de formularios — es un acento deliberado y ya consistente, distinto del morado de "abrir/navegar"; **no recolorear** a la familia morada, se perdería esa distinción |
| `$accent` | `#b32572` (antes `pink-ieen-1`) | Sin uso activo todavía; queda listo para cuando se necesite un tercer acento |
| `$positive` / `$negative` / `$warning` / `$info` | Defaults de Quasar | Ya se usan de forma semánticamente correcta en todo el sistema (ver 1.3) |

### 1.2 Paleta de marca extendida

Vive como variables SCSS en `quasar.variables.scss` (`$purple-ieen`,
`$purple-ieen-1/2/3`, `$pink-ieen-1/2/3`, `$gray-ieen-1/2/3`) y como las
clases utilitarias `.text-*`/`.bg-*` correspondientes en `MainLayout.vue`
(Quasar no genera utilidades automáticas para nombres de color fuera de su
tema, así que las clases siguen siendo necesarias para `color="purple-ieen"`
como prop de componente).

- `purple-ieen` (`#673e84`) — acción primaria por defecto en toda la app: botones "Nuevo X", íconos de navegación, encabezados de tabs.
- `purple-ieen-1` (`#863399`) — variante para chips/badges que necesitan contraste con fondo blanco (ver auditoría de contraste, §1.4).
- `purple-ieen-2` / `purple-ieen-3` — tonos más claros; **evitar como texto sobre blanco** (contraste 4.37:1 y 2.91:1, ambos por debajo o al límite de WCAG AA 4.5:1). Usar solo como fondo con texto oscuro, o para elementos no textuales (bordes, íconos grandes).

### 1.3 Color semántico (independiente de la marca)

| Situación | Color | Ejemplo |
|---|---|---|
| Confirmar/aprobar/activar | `positive` (verde) | `aprobar()`, `alternarEstado()` cuando activa |
| Rechazar/eliminar/desactivar | `negative` (rojo) | `rechazar()`, `BtnEliminar`, `alternarEstado()` cuando desactiva |
| Cancelar (acción neutra, no destructiva) | Sin color (flat, `BtnCancelar`) | Cualquier "Cancelar" de diálogo |
| Alerta/pendiente | `warning` (naranja) / `orange` | Estados "Borrador", "Pendiente", ícono de contraseña temporal |
| Informativo | `info` | Poco usado; disponible para futuros badges informativos |

**Regla:** dos acciones opuestas en la misma fila (aprobar/rechazar,
activar/desactivar) siempre llevan colores distintos — nunca ambas en
`purple-ieen`. "Cancelar" nunca es rojo (se reserva para lo destructivo).

### 1.4 Contraste (WCAG AA, mínimo 4.5:1 para texto normal)

Verificado en la Fase 1: `purple-ieen` (8.07:1) y `purple-ieen-1` (7.13:1)
pasan holgadamente como texto sobre blanco o como fondo con texto blanco.
`purple-ieen-2` (4.37:1) y `purple-ieen-3` (2.91:1) **no pasan** — antes de
usarlos como fondo de chip con texto blanco, verificar con una herramienta de
contraste o usar `purple-ieen`/`purple-ieen-1` en su lugar.

## 2. Espaciado

Escala implícita ya consistente en todo el proyecto vía las utilidades de
Quasar (`q-pa-*`, `q-ma-*`, `q-gutter-*`, `q-col-gutter-*`):

```
xs = 4px   sm = 8px   md = 16px   lg = 24px   xl = 48px
```

Usar siempre las utilidades (`q-pa-md`, `q-gutter-sm`, etc.) en vez de
`style="padding: ..."`/`margin` con valores sueltos.

## 3. Tipografía

No hay una fuente de marca propia (Roboto por defecto de Quasar/`@quasar/extras`).
Escala de uso, documentada a partir del patrón ya dominante en el código:

| Clase | Uso |
|---|---|
| `text-h6` | Título de página (encabezado principal de cada módulo — patrón usado en 11+ pantallas, es la convención por defecto) |
| `text-subtitle1` | Título de tarjeta/sección dentro de una página (p. ej. cada card en Interoperabilidad) |
| `text-subtitle2` | Encabezado de subsección (p. ej. cada grupo de accesos directos en la página de inicio) |
| `text-caption` | Texto secundario/ayuda bajo un campo o dato |

## 4. Iconografía

Guía de qué ícono corresponde a qué acción, a partir del uso ya consistente
en el código (Material Icons vía `@quasar/extras`):

| Acción | Ícono | Color |
|---|---|---|
| Ver / ver registro | `visibility` | `purple-ieen` |
| Ver documentos/adjuntos | `folder_open` / `file_present` | `purple-ieen` |
| Editar | `edit` | `purple-ieen` |
| Eliminar | `delete` | `negative` (vía componente `BtnEliminar`) |
| Aprobar / aceptar | `check_circle` | `positive` |
| Rechazar / cancelar solicitud | `cancel` | `negative` |
| Activar | `check_circle` | `positive` |
| Desactivar / bloquear | `block` | `negative` |
| Enviar / afectar transferencia | `send` / `archive` | `purple-ieen` |
| Adjuntar archivo | `file_present` / `attachment` | `purple-ieen` |
| Descargar | `sim_card_download` / `download` | `purple-ieen` |
| Nuevo / crear | `add_circle_outline` / `add` | `purple-ieen` (botón con label, no solo ícono) |
| Cerrar diálogo (ícono suelto, esquina) | `close` | sin color (flat) |
| Buscar | `search` | sin color (dentro de `q-input`) |
| Resetear contraseña | `lock_reset` | `orange` |
| Confirmación en diálogo (`$q.dialog`) | `warning` (alerta) / `info` (informativo) | — minúsculas: `"Warning"`/`"Information"` con mayúscula no renderizan en Quasar |

## 5. Densidad de tablas

Las tablas con **10 o más columnas** usan la prop `dense` (reduce el alto de
fila) — aplicado en la Fase 4 a las 16 tablas del sistema que cumplían este
criterio y no la tenían. Tablas con menos columnas se dejan con la altura de
fila normal (más legible cuando hay espacio de sobra). Los datos más volumosos
(inventario general de 24 columnas) además usan el selector de columnas
(`visible-columns`, ver `inventarioAreaGral/components/TablaItem.vue`) para no
depender solo de la densidad.
