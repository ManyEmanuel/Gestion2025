<template>
  <q-page padding>
    <div class="row">
      <div class="col">
        <div class="q-pa-md q-gutter-sm">
          <q-breadcrumbs>
            <q-breadcrumbs-el icon="home" to="/" />
            <q-breadcrumbs-el label="Trasnferencias secundarias" icon="group" />
          </q-breadcrumbs>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <div class="text-right q-pa-md items-start q-gutter-md">
          <q-btn
            v-if="modulo == null ? false : modulo.registrar"
            type="button"
            class="q-ma-sm"
            color="purple-ieen"
            icon-right="add_circle_outline"
            label="Nuevo"
            @click="actualizarModal(true)"
          />
        </div>
      </div>
    </div>
    <TablaComp v-if="modulo == null ? false : modulo.leer" />
    <ModalComp />
    <ModalVerComp />
  </q-page>
</template>
<script setup>
import { useQuasar } from "quasar";
import { onBeforeMount } from "vue";
import { storeToRefs } from "pinia";
import { useAreaStore } from "../../../stores/areas_store";
import { useAuthStore } from "../../../stores/auth_store";
import { useTransferenciaSecundariaEncabezadoStore } from "../../../stores/transferencia_secundaria_encabezado_store";
import { espera } from "../../../helpers/helper";
import TablaComp from "../components/TablaComp.vue";
import ModalComp from "../components/ModalComp.vue";
import ModalVerComp from "../components/ModalVerComp.vue";

const $q = useQuasar();
const authStore = useAuthStore();
const areaStore = useAreaStore();
const transferenciaSecundariaStore =
  useTransferenciaSecundariaEncabezadoStore();
const { modulo } = storeToRefs(authStore);
const siglas = "AI-TS";

onBeforeMount(() => {
  leerPermisos();
});

const leerPermisos = async () => {
  $q.loading.show();
  await authStore.loadModulo(siglas);
  $q.loading.hide();
};

// Corte al backend nuevo: se cargan el área generadora (del usuario, JWT) y su enlace ("Elaboró"); el
// área responsable se elige con un selector (loadListaAreas). Los roles legados (aprueba/responsable de
// archivo), que el backend nuevo no modela, ya no se cargan.
const actualizarModal = async (valor) => {
  $q.loading.show();
  transferenciaSecundariaStore.initEncabezado();
  await espera();
  await areaStore.loadListaAreas();
  await transferenciaSecundariaStore.loadArea();
  await transferenciaSecundariaStore.loadEnlace();
  transferenciaSecundariaStore.updateEditar(false);
  transferenciaSecundariaStore.actualizarModal(valor);
  $q.loading.hide();
};
</script>
