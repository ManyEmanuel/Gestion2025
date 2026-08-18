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
    <div class="row">
      <div class="col">
        <h1 class="text-h6 text-purple-ieen q-px-md">Secciones</h1>
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
import { onBeforeMount } from "vue-demi";
import { useAuthStore } from "../../../stores/auth_store";
import { storeToRefs } from "pinia";

import CardSecciones from "../components/Card_Seccion.vue";
import CardSerie from "../components/Card_Serie.vue";
import CardSubSerie from "../components/Card_SubSerie.vue";
import ModalSecciones from "../components/Modal_Seccion.vue";
import ModalSeries from "../components/Modal_Serie.vue";
import ModalSubSeries from "../components/Modal_SubSerie.vue";
import SinPermisoBanner from "../../../components/SinPermisoBanner.vue";

const $q = useQuasar();
const authStore = useAuthStore();
const { modulo } = storeToRefs(authStore);
const siglas = "AI-CAT-SECCIONES";
onBeforeMount(() => {
  leerPermisos();
});

const leerPermisos = async () => {
  $q.loading.show();
  await authStore.loadModulo(siglas);
  $q.loading.hide();
};
</script>

<style>
</style>