
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
        component: () => import('../Modulos/secciones/pages/Index_Secciones.vue')
      },
      {
        path: '/voBo',
        name: 'voBo',
        component: () => import('../Modulos/voBos/pages/IndexPage.vue')
      },
      {
        path: '/dispDoc',
        name: 'dispDoc',
        component: () => import('../Modulos/disposicionDocumental/pages/Index_Disp.vue')
      },
      {
        path: '/inventarioGeneral',
        name: 'inventarioGeneral',
        component: () => import('../Modulos/encabezadoInventarioArea/pages/IndexPage.vue')
      },
      {
        path: '/detalleInventario/:encabezadoId',
        props: true,
        name: 'detalleInventario',
        component: () => import('../Modulos/inventarioArea/pages/IndexPage.vue')
      },
      {
        path: '/detalleInventarioGral/:encabezadoId',
        props: true,
        name: 'detalleInventarioGral',
        component: () => import('../Modulos/inventarioAreaGral/pages/IndexPage.vue')
      },
      {
        path: '/cedulasPrestamo',
        name: 'cedulasPrestamo',
        component: () => import('../Modulos/cedulaPrestamo/pages/IndexPage')
      },
      {
        path: '/cedulasPrestamo',
        name: 'cedulasPrestamoClasificados',
        component: () => import('../Modulos/cedulaPrestamoClasificado/IndexPage')
      },
      {
        path: '/prestamoAceptado/:encabezadoId',
        name: 'prestamoAceptado',
        props: true,
        component: () => import('../Modulos/cedulaPrestamo/pages/Prestamo_AceptadoPage.vue')
      },
      {
        path: '/inventarioGeneralAreas',
        name: 'inventarioGeneralAreas',
        component: () => import('../Modulos/encabezadosInventariosGral/pages/IndexPage')
      },
      {
        path: '/enlaces',
        name: 'enlaces',
        component: () => import('../Modulos/enlaces/pages/IndexPage')
      },
      {
        path: '/transferenciasPrimarias',
        name: 'transferenciasPrimarias',
        component: () => import('../Modulos/trasferenciaPrimariaEncabezado/pages/IndexPage')
      },
      {
        path: '/transferenciasPrimariasAI',
        name: 'transferenciasPrimariasAI',
        component: () => import('../Modulos/transferenciaPrimariaAiEncabezado/pages/IndexPage')
      },
      {
        path: '/cajasTransferencias/:transferenciaId',
        props: true,
        name: 'cajasTransferencias',
        component: () => import('../Modulos/cajasTransferencias/pages/IndexPage')
      },
      {
        path: '/cajasTransferenciasAI/:transferenciaId',
        props: true,
        name: 'cajasTransferenciasAI',
        component: () => import('../Modulos/cajasTransferenciasAI/pages/IndexPage')
      },
      {
        path: '/inventarioAI',
        name: 'inventarioAI',
        component: () => import('../Modulos/inventarioAreaAI/pages/IndexPage')
      },
      {
        path: '/bajaDocumental',
        name: 'bajaDocumental',
        component: () => import('../Modulos/bajaDocumental/Pages/IndexPage')
      },
      {
        path: '/cajasBajas/:bajaId',
        props: true,
        name: 'cajasBajas',
        component: () => import('../Modulos/cajasBajas/Pages/IndexPage')
      },
      {
        path: '/transferenciasSecundarias',
        name: 'transferenciasSecundarias',
        component: () => import('../Modulos/transferenciaSecundariaEncabezado/pages/IndexPage')
      },
      {
        path: '/cajasTranSec/:transferenciaId',
        props: true,
        name: 'cajasTranSec',
        component: () => import('../Modulos/cajasTransferenciasSecundarias/pages/IndexPage')
      },
      {
        path: '/prestamoAI',
        name: 'prestamoAI',
        component: () => import('../Modulos/soliciutdes_ai/pages/IndexPage')
      },
      {
        path: '/prestamoAIAI',
        name: 'prestamoAIAI',
        component: () => import('../Modulos/soliciutdes_ai/pages/IndexPageAI')
      },
      {
        path: '/prestamoInstitucional/:encabezadoId/:estatus',
        name: 'prestamoInstitucional',
        props: true,
        component: () => import('../Modulos/soliciutdes_ai/pages/detallePrestamo.vue')
      },
      // Cumplimiento LGA/Nayarit (Fases 3-4)
      {
        path: '/avisos',
        name: 'avisos',
        component: () => import('../Modulos/avisos/pages/IndexPage.vue')
      },
      {
        path: '/pada',
        name: 'pada',
        component: () => import('../Modulos/pada/pages/IndexPage.vue')
      },
      {
        path: '/grupoInterdisciplinario',
        name: 'grupoInterdisciplinario',
        component: () => import('../Modulos/grupoInterdisciplinario/pages/IndexPage.vue')
      },
      {
        path: '/sesionesGrupo/:grupoId',
        name: 'sesionesGrupo',
        props: true,
        component: () => import('../Modulos/grupoInterdisciplinario/pages/SesionesPage.vue')
      },
      {
        path: '/preservacion',
        name: 'preservacion',
        component: () => import('../Modulos/preservacion/pages/IndexPage.vue')
      },
      {
        path: '/interoperabilidad',
        name: 'interoperabilidad',
        component: () => import('../Modulos/interoperabilidad/pages/IndexPage.vue')
      },
      // Administración (ámbito global)
      {
        path: '/administracionAreas',
        name: 'administracionAreas',
        component: () => import('../Modulos/administracionAreas/pages/IndexPage.vue')
      },
      {
        path: '/administracionEmpleados',
        name: 'administracionEmpleados',
        component: () => import('../Modulos/administracionEmpleados/pages/IndexPage.vue')
      },
      {
        path: '/administracionUsuarios',
        name: 'administracionUsuarios',
        component: () => import('../Modulos/administracionUsuarios/pages/IndexPage.vue')
      },
      {
        path: '/administracionPerfiles',
        name: 'administracionPerfiles',
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
