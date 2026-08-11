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
        <q-toolbar-title> Gestión documental </q-toolbar-title>
        <q-btn flat round dense icon="notifications">
          <q-badge v-if="no_notificaciones > 0" color="red" floating>{{
            no_notificaciones > 5 ? "5+" : no_notificaciones
          }}</q-badge>
          <q-menu>
            <q-list style="min-width: 100px">
              <div
                class="q-pl-md q-pt-sm q-pb-sm q-pr-md text-bold text-h6 text-grey-9"
              >
                Notificaciones
              </div>
              <div>
                <q-item
                  style="max-width: 420px"
                  v-for="notificacion in notificaciones"
                  :key="notificacion.id"
                  clickable
                  v-ripple
                  @click="detalle(notificacion)"
                >
                  <q-item-section>
                    <q-item-label>{{ notificacion.titulo }}</q-item-label>
                    <q-item-label caption lines="3"
                      >{{ notificacion.mensaje }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    {{ notificacion.fecha_Registro }}
                    <q-badge
                      v-if="notificacion.leido == false"
                      color="blue"
                      rounded
                      class="q-mr-sm"
                    />
                  </q-item-section>
                </q-item>
              </div>
              <q-card
                class="text-center no-shadow no-border q-pa-sm"
                v-if="notificaciones.length == 0"
              >
                <div class="text-indigo-8 text-purple-ieen">
                  Sin notificaciones
                </div>
              </q-card>
              <q-separator />
              <q-card class="text-center no-shadow no-border q-pa-sm">
                <q-btn
                  label="Marcar todo como leido"
                  color="purple-ieen"
                  flat
                  class="text-indigo-8"
                  @click="marcarLeido"
                ></q-btn>
                <q-btn
                  flat
                  label="Ver todos"
                  color="purple-ieen"
                  class="text-indigo-8"
                  @click="toNotificaciones"
                ></q-btn>
              </q-card>
            </q-list>
          </q-menu>
        </q-btn>
        <!-- <div>Quasar v{{ $q.version }}</div> -->
        <!-- <q-btn flat round dense icon="settings" @click="showM" /> -->

        <q-btn flat round dense icon="apps" @click="show" />
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
        </q-list>
      </q-scroll-area>
      <q-img class="absolute-top" src="~assets/fondo.png" style="height: 160px">
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
          <div>&#169; Unidad Técnica de Informática y Estadística</div>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useQuasar } from "quasar";
import { useRoute, useRouter } from "vue-router";
import { onBeforeMount } from "vue";
import { useAuthStore } from "../stores/auth_store";
import { useNotificacionStore } from "../stores/notificaciones_store";
import { storeToRefs } from "pinia";
import EssentialLink from "components/EssentialLink.vue";

export default defineComponent({
  name: "MainLayout",
  components: {
    EssentialLink,
  },
  setup() {
    const $q = useQuasar();
    const leftDrawerOpen = ref(false);
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();
    const { modulos, apps } = storeToRefs(authStore);
    const linksList = ref([]);
    const linksArchivoTramite = ref([]);
    const linkListPrestamos = ref([]);
    const linkListArchivoConcentracion = ref([]);
    const notificacionStore = useNotificacionStore();
    // Corte: SignalR (hub :9270) retirado. Notificaciones en tiempo real deshabilitadas.

    const { notificaciones, no_notificaciones, notificaciones_all } =
      storeToRefs(notificacionStore);
    const Empleado = ref(null);
    const Perfil = ref(null);
    const usuario = ref(null);
    onBeforeMount(async () => {
      if (route.query.key) {
        $q.loading.show();
        localStorage.setItem("key", route.query.key);
        const resp = await authStore.validarToken(
          route.query.key,
          route.query.sistema
        );
        $q.loading.hide();
      }

      if (route.query.sistema) {
        localStorage.setItem("sistema", route.query.sistema);
      }

      if (route.query.usr) {
        localStorage.setItem("usuario", route.query.usr);
        usuario.value = localStorage.getItem("usuario");
      } else {
        if (localStorage.getItem("usuario") != null) {
          usuario.value = localStorage.getItem("usuario");
        }
      }

      Empleado.value = localStorage.getItem("empleado");
      Perfil.value = localStorage.getItem("perfil");
      await loadMenu();
    });

    const toNotificaciones = () => {
      router.push({
        name: "notificaciones",
      });
    };

    const marcarLeido = async () => {
      let resp = await notificacionStore.leerTodas();
      if (resp.success) {
        $q.notify({
          position: "top-right",
          type: "positive",
          message: resp.data,
          actions: [
            {
              icon: "close",
              color: "white",
              round: true,
              handler: () => {},
            },
          ],
        });
        await notificacionStore.loadNotificaciones();
        await notificacionStore.loadNotificacionesAll();
      } else {
        $q.notify({
          position: "top-right",
          type: "negative",
          message: resp.data,
          actions: [
            {
              icon: "close",
              color: "white",
              round: true,
              handler: () => {},
            },
          ],
        });
      }
    };

    const detalle = async (row) => {
      $q.loading.show({
        spinner: QSpinnerFacebook,
        spinnerColor: "purple-ieen",
        spinnerSize: 140,
        backgroundColor: "purple-3",
        message: "Espere un momento, por favor...",
        messageColor: "black",
      });
      let resp = await notificacionStore.leerNotificacion(row.id);
      if (resp.success == true) {
        await notificacionStore.loadNotificaciones();
      }
      let url = sistemas.value.find((x) => x.value == row.sistema_Id);
      if (row.sistema_Id == localStorage.getItem("sistema")) {
        router.push({
          name: "misSolicitudes",
        });
      } else {
        window.location =
          url.url +
          `/#/?key=${localStorage.getItem("key")}&sistema=${
            row.sistema_Id
          }&usr=${localStorage.getItem("usuario")}`;
      }
      $q.loading.hide();
    };

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

          case "AI-PRESTAMOS-AI-AI":
            linkListPrestamos.value.push({
              title: "Solicitudes préstamos archivo institucional",
              icon: "sync",
              link: { name: "prestamoAIAI" },
              siglas: "AI-PRESTAMOS-AI-AI",
            });
            break;
        }
      });
      $q.loading.hide();
    };

    const show = () => {
      // Corte: cliente autónomo (login propio). Cerrar sesión limpia el token y vuelve al /login
      // propio; se retiró la navegación al portal SSO (:9271) y a otros sistemas.
      $q.bottomSheet({
        message: "Aplicaciones",
        grid: true,
        actions: apps.value,
      }).onOk((action) => {
        if (action.label == "Cerrar sesión") {
          localStorage.clear();
          router.push({ name: "login" });
        }
      });
    };

    return {
      show,
      no_notificaciones,
      notificaciones,
      toNotificaciones,
      marcarLeido,
      notificaciones_all,

      linksList,
      linksArchivoTramite,
      linkListPrestamos,
      linkListArchivoConcentracion,
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
.text-purple-ieen {
  color: #673e84 !important;
}
.bg-purple-ieen {
  background: #673e84 !important;
}
.text-purple-ieen-1 {
  color: #863399 !important;
}
.bg-purple-ieen-1 {
  background: #863399 !important;
}
.text-purple-ieen-2 {
  color: #a25eb5 !important;
}
.bg-purple-ieen-2 {
  background: #a25eb5 !important;
}
.text-purple-ieen-3 {
  color: #bb83ca !important;
}
.bg-purple-ieen-3 {
  background: #bb83ca !important;
}
.text-pink-ieen-1 {
  color: #b32572 !important;
}
.bg-pink-ieen-1 {
  background: #b32572 !important;
}
.text-pink-ieen-2 {
  color: #cc5599 !important;
}
.bg-pink-ieen-2 {
  background: #cc5599 !important;
}
.text-pink-ieen-3 {
  color: #dd85ba !important;
}
.bg-pink-ieen-3 {
  background: #dd85ba !important;
}
.text-gray-ieen-1 {
  color: #76777a !important;
}
.bg-gray-ieen-1 {
  background: #76777a !important;
}
.text-gray-ieen-2 {
  color: #98989a !important;
}
.bg-gray-ieen-2 {
  background: #98989a !important;
}
.text-gray-ieen-3 {
  color: #b1b1b1 !important;
}
.bg-gray-ieen-3 {
  background: #b1b1b1 !important;
}
</style>
