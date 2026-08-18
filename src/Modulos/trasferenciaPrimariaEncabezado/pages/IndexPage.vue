<template>
  <q-page padding>
    <div class="row">
      <div class="col">
        <div class="q-pa-md q-gutter-sm">
          <q-breadcrumbs>
            <q-breadcrumbs-el icon="home" to="/" />
            <q-breadcrumbs-el label="Transferencias primarias" icon="group" />
          </q-breadcrumbs>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <h1 class="text-h6 text-purple-ieen q-px-md">Transferencias primarias</h1>
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
    <SinPermisoBanner v-else modulo="Transferencias primarias" />
    <ModalComp />
  </q-page>
</template>
<script setup>
import { useQuasar } from "quasar";
import { useAuthStore } from "../../../stores/auth_store";
import { useTransferenciaPrimariaEncabezadoStore } from "../../../stores/transferencia_primaria_encabezado_store";
import { useAreaStore } from "../../../stores/areas_store";
import { onBeforeMount } from "vue";
import { storeToRefs } from "pinia";
import TablaComp from "../components/TablaComp.vue";
import ModalComp from "../components/ModalComp.vue";
import SinPermisoBanner from "../../../components/SinPermisoBanner.vue";

const $q = useQuasar();
const authStore = useAuthStore();
const transferenciaPrimariaStore = useTransferenciaPrimariaEncabezadoStore();
const areaStore = useAreaStore();
const { modulo } = storeToRefs(authStore);
const siglas = "AI-TP";

onBeforeMount(() => {
  leerPermisos();
});

// Corte al backend nuevo: se cargan el área generadora (del usuario) y su enlace; el área responsable
// se elige con un selector (loadListaAreas). Los roles legados (valida/coteja/responsable de área) no
// los modela el backend nuevo, así que ya no se cargan.
transferenciaPrimariaStore.loadArea();
transferenciaPrimariaStore.loadEnlace();
areaStore.loadListaAreas();

const leerPermisos = async () => {
  $q.loading.show();
  await authStore.loadModulo(siglas);
  $q.loading.hide();
};

const actualizarModal = (valor) => {
  $q.loading.show();
  transferenciaPrimariaStore.initEncabezado();
  transferenciaPrimariaStore.actualizarModal(valor);
  transferenciaPrimariaStore.updateEditar(false);
  $q.loading.hide();
};
</script>
