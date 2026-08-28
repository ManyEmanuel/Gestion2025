<template>
  <q-page padding>
    <div class="row">
      <div class="col">
        <div class="q-pa-md q-gutter-sm">
          <q-breadcrumbs>
            <q-breadcrumbs-el icon="home" to="/" />
            <q-breadcrumbs-el label="Secciones" icon="menu_book" />
          </q-breadcrumbs>
        </div>
      </div>
    </div>
    <div class="row items-center">
      <div class="col">
        <h1 class="text-h6 text-purple-ieen q-px-md">Secciones</h1>
      </div>
      <div class="col-auto q-px-md">
        <!-- Auditoría FUNC-002: la guía de archivo documental (LGA 14 / Nay 13) es de publicación
             obligatoria y su endpoint no tenía ningún consumidor en el cliente. Vive aquí porque lo que
             tabula es justamente este cuadro: fondo → área → sección → serie. -->
        <q-btn
          v-if="puedeGenerarGuia"
          type="button"
          color="green-8"
          icon-right="menu_book"
          label="Guía de archivo documental"
          @click="descargarGuiaArchivo"
        />
      </div>
    </div>
    <div
      class="row items-start q-col-gutter-lg"
      v-if="modulo == null ? false : modulo.leer"
    >
      <CardSecciones />
      <CardSerie />
      <CardSubSerie />
    </div>
    <SinPermisoBanner v-else modulo="Secciones" />
    <ModalSecciones />
    <ModalSeries />
    <ModalSubSeries />
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar";
import { onBeforeMount, ref } from "vue-demi";
import { useAuthStore } from "../../../stores/auth_store";
import { storeToRefs } from "pinia";

import CardSecciones from "../components/Card_Seccion.vue";
import CardSerie from "../components/Card_Serie.vue";
import CardSubSerie from "../components/Card_SubSerie.vue";
import ModalSecciones from "../components/Modal_Seccion.vue";
import ModalSeries from "../components/Modal_Serie.vue";
import ModalSubSeries from "../components/Modal_SubSerie.vue";
import SinPermisoBanner from "../../../components/SinPermisoBanner.vue";
import { descargarReporte } from "../../../helpers/descargar_reporte";

const $q = useQuasar();
const authStore = useAuthStore();
const { modulo } = storeToRefs(authStore);
const siglas = "AI-CAT-SECCIONES";

// El endpoint de la guía exige `archivo.inventario.ver`, no el permiso de esta pantalla: se gatea con el
// permiso real para no ofrecer un botón que respondería 403.
const puedeGenerarGuia = ref(false);

onBeforeMount(() => {
  leerPermisos();
});

const leerPermisos = async () => {
  $q.loading.show();
  await authStore.loadModulo(siglas);
  puedeGenerarGuia.value = authStore.tienePermiso("archivo.inventario.ver");
  $q.loading.hide();
};

// Auditoría FUNC-002: GET /api/reportes/guia-archivo estaba implementado y sin consumidor.
// El ámbito lo resuelve el servidor: global -> todas las áreas; usuario de área -> la suya.
const descargarGuiaArchivo = async () => {
  $q.loading.show();
  const resp = await descargarReporte("/reportes/guia-archivo", "Guia_Archivo.pdf");
  $q.loading.hide();
  if (!resp.success) {
    $q.notify({ type: "negative", message: resp.data });
  }
};
</script>

<style>
</style>