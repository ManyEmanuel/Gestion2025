<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-purple-ieen">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        <q-toolbar-title>{{ SYSTEM_NAME }}</q-toolbar-title>
        <!-- Corte al backend nuevo: la campana de notificaciones se retiró (dependía de SignalR :9270 +
             endpoints legados /NotificacionesUniverso, dormantes). Reimplementar sobre el backend nuevo
             si se requiere. -->
        <q-btn flat round dense icon="apps" @click="show" aria-label="Aplicaciones" />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :width="300"
      :breakpoint="1024"
    >
      <q-scroll-area
        style="
          height: calc(100% - 150px);
          margin-top: 150px;
          border-right: 1px solid #ddd;
        "
      >
        <q-list padding class="margin top">
          <q-item-label header>Menu </q-item-label>
          <!-- Auditoría P2: la búsqueda global es transversal, no pertenece a ningún grupo del archivo,
               así que va suelta y arriba: es lo primero que alguien necesita cuando no sabe dónde está
               el expediente. -->
          <EssentialLink v-for="link in linkListBusqueda" :key="link.title" v-bind="link" />
          <q-expansion-item
            expand-separator
            icon="menu_book"
            label="Catálogos"
            v-if="linksList.some((x) => x.siglas.startsWith('AI-CAT'))"
          >
            <EssentialLink
              v-for="link in linksList.filter((x) =>
                x.siglas.startsWith('AI-CAT')
              )"
              :key="link.title"
              v-bind="link"
            />
          </q-expansion-item>
          <q-expansion-item
            expand-separator
            icon="menu_book"
            label="Archivo en trámite"
            v-if="linksArchivoTramite.length > 0"
          >
            <EssentialLink
              v-for="link in linksArchivoTramite"
              :key="link.title"
              v-bind="link"
            />
          </q-expansion-item>
          <q-expansion-item
            expand-separator
            icon="menu_book"
            label="Préstamos"
            v-if="linkListPrestamos.length > 0"
          >
            <EssentialLink
              v-for="link in linkListPrestamos"
              :key="link.title"
              v-bind="link"
            />
          </q-expansion-item>
          <q-expansion-item
            expand-separator
            icon="menu_book"
            label="Archivo en Concentración"
            v-if="linkListArchivoConcentracion.length > 0"
          >
            <EssentialLink
              v-for="link in linkListArchivoConcentracion"
              :key="link.title"
              v-bind="link"
            />
          </q-expansion-item>
          <q-expansion-item
            expand-separator
            icon="verified"
            label="Cumplimiento"
            v-if="linkListCumplimiento.length > 0"
          >
            <EssentialLink
              v-for="link in linkListCumplimiento"
              :key="link.title"
              v-bind="link"
            />
          </q-expansion-item>
          <q-expansion-item
            expand-separator
            icon="admin_panel_settings"
            label="Administración"
            v-if="linkListAdministracion.length > 0"
          >
            <EssentialLink
              v-for="link in linkListAdministracion"
              :key="link.title"
              v-bind="link"
            />
          </q-expansion-item>
        </q-list>
      </q-scroll-area>
      <!--
        Auditoría UX-001: `loading="eager"` es obligatorio aquí, no una optimización. QImg solo renderiza
        su slot por defecto cuando la imagen terminó de cargar (QImg.js: `if (isLoading === false)`), y con
        el `lazy` nativo por defecto el navegador nunca llegaba a pedir este fondo -- el <img> se quedaba
        en complete=false / naturalWidth=0. Resultado: el saludo y el perfil de la cabecera del menú NUNCA
        se pintaban. Con carga anticipada la imagen resuelve y el bloque aparece.
      -->
      <q-img
        class="absolute-top"
        src="~assets/branding/fondo.png"
        style="height: 160px"
        loading="eager"
      >
        <div class="bg-transparent">
          <!-- <q-avatar size="56px" class="q-mb-sm">
            <img src="~assets/usuario.jpeg" />
          </q-avatar> -->

          <div class="text-weight-bold text-black">
            <br />
            Bienvenido(a) {{ Empleado }}
          </div>
          <div class="text-black">
            {{ Perfil }}
          </div>
        </div>
      </q-img>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
    <q-footer reveal bordered class="bg-purple-ieen">
      <q-toolbar>
        <q-toolbar-title>
          <div>{{ FOOTER_TEXT }}</div>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { onBeforeMount } from "vue";
import { useAuthStore } from "../stores/auth_store";
import { useAuthNuevoStore } from "../stores/auth_nuevo_store";
import { storeToRefs } from "pinia";
import EssentialLink from "components/EssentialLink.vue";
import { SYSTEM_NAME, FOOTER_TEXT } from "src/branding.js";

export default defineComponent({
  name: "MainLayout",
  components: {
    EssentialLink,
  },
  setup() {
    const $q = useQuasar();
    // Auditoría UX-002: el modelo arrancaba en `false` mientras `show-if-above` dejaba el cajón ABIERTO
    // en escritorio. Modelo y estado visual nacían desfasados, así que al pulsar "Menu" el cajón se
    // cerraba y ya no volvía a abrirse: el usuario perdía TODA la navegación y solo la recuperaba
    // recargando la página. Se inicializa el modelo con el mismo criterio que usa `show-if-above`
    // (el breakpoint de 1024 del q-drawer), de modo que el botón queda en fase desde el primer clic.
    const leftDrawerOpen = ref($q.screen.width >= 1024);
    const router = useRouter();
    const authStore = useAuthStore();
    const authNuevoStore = useAuthNuevoStore();
    const { modulos, apps } = storeToRefs(authStore);
    const linksList = ref([]);
    const linksArchivoTramite = ref([]);
    const linkListPrestamos = ref([]);
    const linkListArchivoConcentracion = ref([]);
    const linkListCumplimiento = ref([]);
    const linkListAdministracion = ref([]);
    const linkListBusqueda = ref([]);
    // Corte: SignalR (hub :9270) + campana de notificaciones retirados (notificaciones en tiempo real
    // deshabilitadas; el store legado /NotificacionesUniverso ya no se usa).
    const Empleado = ref(null);
    const Perfil = ref(null);
    const usuario = ref(null);
    // Auditoría ARCH-001: aquí vivía el camino de entrada del portal SSO legado — leer `?key=` de la URL,
    // guardarla en localStorage y validarla contra `/Accesos/ValidaToken`, un endpoint que el backend
    // nuevo NO tiene (respondía 404 siempre). Estaba muerto desde el corte al login propio y solo servía
    // para dejar en localStorage claves (`key`, `sistema`, `usuario`) que ya nadie leía.
    //
    // Auditoría UX-001: el saludo y el perfil se leían de esas mismas claves, así que con el flujo muerto
    // la cabecera del menú quedaba vacía en TODAS las pantallas. Ahora salen del estado que
    // `auth_nuevo_store` carga desde GET /api/auth/me, que es lo único que hoy dice la verdad.
    onBeforeMount(async () => {
      usuario.value = authNuevoStore.usuario;
      Empleado.value = authNuevoStore.usuario;
      Perfil.value = authNuevoStore.perfilNombre;
      await loadMenu();
    });

    const loadMenu = async () => {
      $q.loading.show();
      await authStore.loadSistemas();
      await authStore.loadModulos();
      modulos.value.forEach((element) => {
        switch (element.siglas_Modulo) {
          case "AI-CAT-ENLACE":
            linksList.value.push({
              title: "Enlaces",
              icon: "group",
              link: { name: "enlaces" },
              siglas: "AI-CAT-ENLACE",
            });
            break;
          case "AI-CAT-VOBO":
            linksList.value.push({
              title: "Visto bueno",
              icon: "group",
              link: { name: "voBo" },
              siglas: "AI-CAT-VOBO",
            });
            break;
          case "AI-CAT-SECCIONES":
            linksList.value.push({
              title: "Secciones",
              icon: "menu_book",
              link: { name: "secciones" },
              siglas: "AI-CAT-SECCIONES",
            });
            break;
          case "AI-CAT-DISP-DOC":
            linksList.value.push({
              title: "Disp. Documental",
              icon: "menu_book",
              link: { name: "dispDoc" },
              siglas: "AI-CAT-DISP-DOC",
            });
            break;
          case "AI-INV-AREA":
            linksArchivoTramite.value.push({
              title: "Inv. Gral. por expediente",
              icon: "assignment",
              link: { name: "inventarioGeneral" },
              siglas: "AI-INV-AREA",
            });
            break;
          case "AI-INV-AREA-GRAL":
            linksArchivoTramite.value.push({
              title: "Inv. Gral. por expediente areas",
              icon: "assignment",
              link: { name: "inventarioGeneralAreas" },
              siglas: "AI-INV-AREA-GRAL",
            });
            break;
          case "AI-TP":
            linksArchivoTramite.value.push({
              title: "Transferencias primarias",
              icon: "move_down",
              link: { name: "transferenciasPrimarias" },
              siglas: "AI-TP",
            });
            break;
          case "AI-TP-CANDIDATOS":
            linksArchivoTramite.value.push({
              title: "Candidatos a transferencia",
              icon: "move_to_inbox",
              link: { name: "candidatosTransferencia" },
              siglas: "AI-TP-CANDIDATOS",
            });
            break;
          case "AI-PRESTAMOS":
            linkListPrestamos.value.push({
              title: "Préstamos Archivo en Trámite",
              icon: "sync",
              link: { name: "cedulasPrestamo" },
              siglas: "AI-PRESTAMOS",
            });
            break;
          case "AI-PRESTAMOS-CLASI":
            linkListPrestamos.value.push({
              title: "Ced. Préstamos clasificados",
              icon: "sync_lock",
              link: {
                name: "cedulasPrestamoClasificados",
              },
              siglas: "AI-PRESTAMOS-CLASI",
            });
            break;
          case "AI-PRESTAMOS-AI":
            linkListPrestamos.value.push({
              title: "Préstamos archivo institucional",
              icon: "sync",
              link: { name: "prestamoAI" },
              siglas: "AI-PRESTAMOS-AI",
            });
            break;

          case "AI-TS":
            linkListArchivoConcentracion.value.push({
              title: "Transferencias secundarias",
              icon: "move_down",
              link: { name: "transferenciasSecundarias" },
              siglas: "AI-TS",
            });
            break;
          case "AI-TP-AI":
            linkListArchivoConcentracion.value.push({
              title: "Transferencias primarias AI",
              icon: "low_priority",
              link: { name: "transferenciasPrimariasAI" },
              siglas: "AI-TP-AI",
            });
            break;
          case "AI-INV-AREA-AI":
            linkListArchivoConcentracion.value.push({
              title: "Inventario AI",
              icon: "inventory",
              link: { name: "inventarioAI" },
              siglas: "AI-INV-AREA-AI",
            });
            break;
          case "AI-BD":
            linkListArchivoConcentracion.value.push({
              title: "Baja documental",
              icon: "folder_delete",
              link: { name: "bajaDocumental" },
              siglas: "AI-BD",
            });
            break;
          case "AI-BD-CANDIDATOS":
            linkListArchivoConcentracion.value.push({
              title: "Candidatos a baja",
              icon: "delete_sweep",
              link: { name: "candidatosBaja" },
              siglas: "AI-BD-CANDIDATOS",
            });
            break;

          case "AI-PRESTAMOS-AI-AI":
            linkListPrestamos.value.push({
              title: "Solicitudes préstamos archivo institucional",
              icon: "sync",
              link: { name: "prestamoAIAI" },
              siglas: "AI-PRESTAMOS-AI-AI",
            });
            break;

          case "AI-AVISOS":
            linkListArchivoConcentracion.value.push({
              title: "Avisos al Archivo General",
              icon: "notification_important",
              link: { name: "avisos" },
              siglas: "AI-AVISOS",
            });
            break;
          case "AI-PADA":
            linkListCumplimiento.value.push({
              title: "PADA e informe anual",
              icon: "event_note",
              link: { name: "pada" },
              siglas: "AI-PADA",
            });
            break;
          case "AI-GRUPO":
            linkListCumplimiento.value.push({
              title: "Grupo interdisciplinario",
              icon: "groups",
              link: { name: "grupoInterdisciplinario" },
              siglas: "AI-GRUPO",
            });
            break;
          case "AI-PRESERVACION":
            linkListCumplimiento.value.push({
              title: "Preservación digital",
              icon: "shield",
              link: { name: "preservacion" },
              siglas: "AI-PRESERVACION",
            });
            break;
          case "AI-INTEROP":
            linkListCumplimiento.value.push({
              title: "Interoperabilidad / Exportar",
              icon: "cloud_download",
              link: { name: "interoperabilidad" },
              siglas: "AI-INTEROP",
            });
            break;
          case "AI-TABLERO":
            linkListCumplimiento.value.push({
              title: "Tablero de vencimientos",
              icon: "event_busy",
              link: { name: "tablero" },
              siglas: "AI-TABLERO",
            });
            break;
          case "AI-UBICACIONES":
            linkListCumplimiento.value.push({
              title: "Ubicaciones físicas",
              icon: "warehouse",
              link: { name: "ubicacionesFisicas" },
              siglas: "AI-UBICACIONES",
            });
            break;
          case "AI-BUSQUEDA":
            linkListBusqueda.value.push({
              title: "Buscar expedientes",
              icon: "search",
              link: { name: "buscar" },
              siglas: "AI-BUSQUEDA",
            });
            break;
          case "AI-BITACORA":
            linkListCumplimiento.value.push({
              title: "Bitácora de trazabilidad",
              icon: "fact_check",
              link: { name: "bitacora" },
              siglas: "AI-BITACORA",
            });
            break;
          case "AI-QR-ESCANEAR":
            linkListCumplimiento.value.push({
              title: "Escanear código",
              icon: "qr_code_scanner",
              link: { name: "escanearCodigo" },
              siglas: "AI-QR-ESCANEAR",
            });
            break;
          case "AI-ADMIN-AREAS":
            linkListAdministracion.value.push({
              title: "Áreas",
              icon: "account_tree",
              link: { name: "administracionAreas" },
              siglas: "AI-ADMIN-AREAS",
            });
            break;
          case "AI-ADMIN-EMPLEADOS":
            linkListAdministracion.value.push({
              title: "Empleados",
              icon: "badge",
              link: { name: "administracionEmpleados" },
              siglas: "AI-ADMIN-EMPLEADOS",
            });
            break;
          case "AI-ADMIN-USUARIOS":
            linkListAdministracion.value.push({
              title: "Usuarios",
              icon: "manage_accounts",
              link: { name: "administracionUsuarios" },
              siglas: "AI-ADMIN-USUARIOS",
            });
            break;
          case "AI-ADMIN-PERFILES":
            linkListAdministracion.value.push({
              title: "Perfiles",
              icon: "security",
              link: { name: "administracionPerfiles" },
              siglas: "AI-ADMIN-PERFILES",
            });
            break;
        }
      });
      $q.loading.hide();
    };

    const show = () => {
      // Corte: cliente autónomo (login propio). Cerrar sesión limpia el token y vuelve al /login
      // propio; se retiró la navegación al portal SSO (:9271) y a otros sistemas.
      // Horizonte-1 #F7: antes bastaba localStorage.clear() (el JWT vivía ahí). Ahora vive en una
      // cookie httpOnly -- hay que llamar a authNuevoStore.logout() para que el backend la expire y el
      // estado en memoria (área/permisos/empleado) se limpie. logout() limpia su estado en memoria de
      // forma síncrona antes de la llamada de red, así que el guard de rutas ve la sesión cerrada de
      // inmediato aunque no se espere la promesa.
      $q.bottomSheet({
        message: "Aplicaciones",
        grid: true,
        actions: apps.value,
      }).onOk((action) => {
        if (action.label == "Cerrar sesión") {
          authNuevoStore.logout();
          router.push({ name: "login" });
        }
      });
    };

    return {
      show,
      SYSTEM_NAME,
      FOOTER_TEXT,

      linksList,
      linksArchivoTramite,
      linkListPrestamos,
      linkListArchivoConcentracion,
      linkListCumplimiento,
      linkListBusqueda,
      linkListAdministracion,
      leftDrawerOpen,
      Empleado,
      Perfil,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>

<style lang="scss">
// Los valores viven ahora en quasar.variables.scss (variables SCSS globales,
// única fuente de verdad); estas clases solo generan las utilidades que
// necesita color="purple-ieen" (Quasar no genera utilidades para nombres de
// color que no sean los suyos, aunque estén declarados como variable SCSS).
.text-purple-ieen {
  color: $purple-ieen !important;
}
.bg-purple-ieen {
  background: $purple-ieen !important;
}
.text-purple-ieen-1 {
  color: $purple-ieen-1 !important;
}
.bg-purple-ieen-1 {
  background: $purple-ieen-1 !important;
}
.text-purple-ieen-2 {
  color: $purple-ieen-2 !important;
}
.bg-purple-ieen-2 {
  background: $purple-ieen-2 !important;
}
.text-purple-ieen-3 {
  color: $purple-ieen-3 !important;
}
.bg-purple-ieen-3 {
  background: $purple-ieen-3 !important;
}
.text-pink-ieen-1 {
  color: $pink-ieen-1 !important;
}
.bg-pink-ieen-1 {
  background: $pink-ieen-1 !important;
}
.text-pink-ieen-2 {
  color: $pink-ieen-2 !important;
}
.bg-pink-ieen-2 {
  background: $pink-ieen-2 !important;
}
.text-pink-ieen-3 {
  color: $pink-ieen-3 !important;
}
.bg-pink-ieen-3 {
  background: $pink-ieen-3 !important;
}
.text-gray-ieen-1 {
  color: $gray-ieen-1 !important;
}
.bg-gray-ieen-1 {
  background: $gray-ieen-1 !important;
}
.text-gray-ieen-2 {
  color: $gray-ieen-2 !important;
}
.bg-gray-ieen-2 {
  background: $gray-ieen-2 !important;
}
.text-gray-ieen-3 {
  color: $gray-ieen-3 !important;
}
.bg-gray-ieen-3 {
  background: $gray-ieen-3 !important;
}
</style>
