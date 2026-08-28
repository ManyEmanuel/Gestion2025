
// Auditoría UX-003: cada ruta de módulo declara la sigla de su pantalla en `meta.siglas`. La guardia del
// router (index.js) la usa para decidir ANTES de montar el componente, en vez de dejar cargar la pantalla
// entera y que fallen después las llamadas al API. La sigla es la que declara la propia página; las
// pantallas de detalle heredan la de su listado, que comparte el mismo grupo de permiso.
// Una ruta sin `meta.siglas` (inicio, login, cambio de contraseña, 404) solo exige estar autenticado.
const routes = [
  {
    // Login propio contra el backend nuevo (corte de clientes). Sin el layout principal.
    path: '/login',
    name: 'login',
    component: () => import('../Modulos/acceso/pages/Login_Nuevo.vue')
  },
  {
    // Cambio de contraseña forzado (tras entrar con una temporal). Sin el layout principal.
    path: '/cambiar-password',
    name: 'cambiarPassword',
    component: () => import('../Modulos/acceso/pages/CambiarPassword.vue')
  },
  {
    path: '/',
    name: 'home',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      {
        path: '/secciones',
        name: 'secciones',
        meta: { siglas: 'AI-CAT-SECCIONES' },
        component: () => import('../Modulos/secciones/pages/Index_Secciones.vue')
      },
      {
        path: '/voBo',
        name: 'voBo',
        meta: { siglas: 'AI-CAT-VOBO' },
        component: () => import('../Modulos/voBos/pages/IndexPage.vue')
      },
      {
        path: '/dispDoc',
        name: 'dispDoc',
        meta: { siglas: 'AI-CAT-DISP-DOC' },
        component: () => import('../Modulos/disposicionDocumental/pages/Index_Disp.vue')
      },
      {
        path: '/inventarioGeneral',
        name: 'inventarioGeneral',
        meta: { siglas: 'AI-INV-AREA' },
        component: () => import('../Modulos/encabezadoInventarioArea/pages/IndexPage.vue')
      },
      {
        path: '/detalleInventario/:encabezadoId',
        props: true,
        name: 'detalleInventario',
        meta: { siglas: 'AI-INV-AREA' },
        component: () => import('../Modulos/inventarioArea/pages/IndexPage.vue')
      },
      {
        path: '/detalleInventarioGral/:encabezadoId',
        props: true,
        name: 'detalleInventarioGral',
        meta: { siglas: 'AI-INV-AREA-GRAL' },
        component: () => import('../Modulos/inventarioAreaGral/pages/IndexPage.vue')
      },
      {
        path: '/cedulasPrestamo',
        name: 'cedulasPrestamo',
        meta: { siglas: 'AI-PRESTAMOS' },
        component: () => import('../Modulos/cedulaPrestamo/pages/IndexPage')
      },
      {
        path: '/cedulasPrestamoClasificados',
        name: 'cedulasPrestamoClasificados',
        meta: { siglas: 'AI-PRESTAMOS-CLASI' },
        component: () => import('../Modulos/cedulaPrestamoClasificado/IndexPage')
      },
      {
        path: '/prestamoAceptado/:encabezadoId',
        name: 'prestamoAceptado',
        meta: { siglas: 'AI-PRESTAMOS' },
        props: true,
        component: () => import('../Modulos/cedulaPrestamo/pages/Prestamo_AceptadoPage.vue')
      },
      {
        path: '/inventarioGeneralAreas',
        name: 'inventarioGeneralAreas',
        meta: { siglas: 'AI-INV-AREA-GRAL' },
        component: () => import('../Modulos/encabezadosInventariosGral/pages/IndexPage')
      },
      {
        path: '/enlaces',
        name: 'enlaces',
        meta: { siglas: 'AI-CAT-ENLACE' },
        component: () => import('../Modulos/enlaces/pages/IndexPage')
      },
      {
        path: '/transferenciasPrimarias',
        name: 'transferenciasPrimarias',
        meta: { siglas: 'AI-TP' },
        component: () => import('../Modulos/trasferenciaPrimariaEncabezado/pages/IndexPage')
      },
      {
        path: '/transferenciasPrimariasAI',
        name: 'transferenciasPrimariasAI',
        meta: { siglas: 'AI-TP-AI' },
        component: () => import('../Modulos/transferenciaPrimariaAiEncabezado/pages/IndexPage')
      },
      // Horizonte-2 #ES-10
      {
        path: '/candidatosTransferencia',
        name: 'candidatosTransferencia',
        meta: { siglas: 'AI-TP-CANDIDATOS' },
        component: () => import('../Modulos/candidatosTransferencia/pages/IndexPage.vue')
      },
      // Horizonte-2 #ES-11
      {
        path: '/candidatosBaja',
        name: 'candidatosBaja',
        meta: { siglas: 'AI-BD-CANDIDATOS' },
        component: () => import('../Modulos/candidatosBaja/pages/IndexPage.vue')
      },
      // Horizonte-2 #ES-16
      {
        path: '/ubicacionesFisicas',
        name: 'ubicacionesFisicas',
        meta: { siglas: 'AI-UBICACIONES' },
        component: () => import('../Modulos/ubicacionesFisicas/pages/IndexPage.vue')
      },
      // Horizonte-3 #DF-8
      {
        path: '/escanearCodigo',
        name: 'escanearCodigo',
        meta: { siglas: 'AI-QR-ESCANEAR' },
        component: () => import('../Modulos/escanearCodigo/pages/IndexPage.vue')
      },
      {
        path: '/cajasTransferencias/:transferenciaId',
        props: true,
        name: 'cajasTransferencias',
        meta: { siglas: 'AI-CJS-TRANS' },
        component: () => import('../Modulos/cajasTransferencias/pages/IndexPage')
      },
      {
        path: '/cajasTransferenciasAI/:transferenciaId',
        props: true,
        name: 'cajasTransferenciasAI',
        meta: { siglas: 'AI-CJS-TRANS-AI' },
        component: () => import('../Modulos/cajasTransferenciasAI/pages/IndexPage')
      },
      {
        path: '/inventarioAI',
        name: 'inventarioAI',
        meta: { siglas: 'AI-INV-AREA-AI' },
        component: () => import('../Modulos/inventarioAreaAI/pages/IndexPage')
      },
      // Auditoría FUNC-001: la bitácora se registraba y no era consultable desde el cliente.
      // Acepta ?entidadTipo= y ?entidadId= para enlazar directo al rastro de una entidad concreta.
      {
        path: '/bitacora',
        name: 'bitacora',
        meta: { siglas: 'AI-BITACORA' },
        component: () => import('../Modulos/bitacora/pages/IndexPage.vue')
      },
      {
        path: '/bajaDocumental',
        name: 'bajaDocumental',
        meta: { siglas: 'AI-BD' },
        component: () => import('../Modulos/bajaDocumental/Pages/IndexPage')
      },
      {
        path: '/cajasBajas/:bajaId',
        props: true,
        name: 'cajasBajas',
        meta: { siglas: 'AI-CJS-BAJAS' },
        component: () => import('../Modulos/cajasBajas/Pages/IndexPage')
      },
      {
        path: '/transferenciasSecundarias',
        name: 'transferenciasSecundarias',
        meta: { siglas: 'AI-TS' },
        component: () => import('../Modulos/transferenciaSecundariaEncabezado/pages/IndexPage')
      },
      {
        path: '/cajasTranSec/:transferenciaId',
        props: true,
        name: 'cajasTranSec',
        meta: { siglas: 'AI-CJS-TRNS-SEC' },
        component: () => import('../Modulos/cajasTransferenciasSecundarias/pages/IndexPage')
      },
      {
        path: '/prestamoAI',
        name: 'prestamoAI',
        meta: { siglas: 'AI-PRESTAMOS-AI' },
        component: () => import('../Modulos/soliciutdes_ai/pages/IndexPage')
      },
      {
        path: '/prestamoAIAI',
        name: 'prestamoAIAI',
        meta: { siglas: 'AI-PRESTAMOS-AI-AI' },
        component: () => import('../Modulos/soliciutdes_ai/pages/IndexPageAI')
      },
      {
        path: '/prestamoInstitucional/:encabezadoId/:estatus',
        name: 'prestamoInstitucional',
        meta: { siglas: 'AI-PRESTAMOS-AI' },
        props: true,
        component: () => import('../Modulos/soliciutdes_ai/pages/detallePrestamo.vue')
      },
      // Cumplimiento LGA/Nayarit (Fases 3-4)
      {
        path: '/avisos',
        name: 'avisos',
        meta: { siglas: 'AI-AVISOS' },
        component: () => import('../Modulos/avisos/pages/IndexPage.vue')
      },
      // Horizonte-2 #QW-5
      {
        path: '/tablero',
        name: 'tablero',
        meta: { siglas: 'AI-TABLERO' },
        component: () => import('../Modulos/tablero/pages/IndexPage.vue')
      },
      {
        path: '/pada',
        name: 'pada',
        meta: { siglas: 'AI-PADA' },
        component: () => import('../Modulos/pada/pages/IndexPage.vue')
      },
      {
        path: '/grupoInterdisciplinario',
        name: 'grupoInterdisciplinario',
        meta: { siglas: 'AI-GRUPO' },
        component: () => import('../Modulos/grupoInterdisciplinario/pages/IndexPage.vue')
      },
      {
        path: '/sesionesGrupo/:grupoId',
        name: 'sesionesGrupo',
        meta: { siglas: 'AI-GRUPO' },
        props: true,
        component: () => import('../Modulos/grupoInterdisciplinario/pages/SesionesPage.vue')
      },
      {
        path: '/preservacion',
        name: 'preservacion',
        meta: { siglas: 'AI-PRESERVACION' },
        component: () => import('../Modulos/preservacion/pages/IndexPage.vue')
      },
      {
        path: '/interoperabilidad',
        name: 'interoperabilidad',
        meta: { siglas: 'AI-INTEROP' },
        component: () => import('../Modulos/interoperabilidad/pages/IndexPage.vue')
      },
      // Administración (ámbito global)
      {
        path: '/administracionAreas',
        name: 'administracionAreas',
        meta: { siglas: 'AI-ADMIN-AREAS' },
        component: () => import('../Modulos/administracionAreas/pages/IndexPage.vue')
      },
      {
        path: '/administracionEmpleados',
        name: 'administracionEmpleados',
        meta: { siglas: 'AI-ADMIN-EMPLEADOS' },
        component: () => import('../Modulos/administracionEmpleados/pages/IndexPage.vue')
      },
      {
        path: '/administracionUsuarios',
        name: 'administracionUsuarios',
        meta: { siglas: 'AI-ADMIN-USUARIOS' },
        component: () => import('../Modulos/administracionUsuarios/pages/IndexPage.vue')
      },
      {
        path: '/administracionPerfiles',
        name: 'administracionPerfiles',
        meta: { siglas: 'AI-ADMIN-PERFILES' },
        component: () => import('../Modulos/administracionPerfiles/pages/IndexPage.vue')
      },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    name: 'notFount',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
