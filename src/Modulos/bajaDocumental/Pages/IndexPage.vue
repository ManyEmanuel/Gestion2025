<template>
  <q-page padding>
    <div class="row">
      <div class="col">
        <div class="q-pa-md q-gutter-sm">
          <q-breadcrumbs>
            <q-breadcrumbs-el icon="home" to="/" />
            <q-breadcrumbs-el label="Baja documental" icon="folder_delete" />
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
import { useBajaDocumentalStore } from "../../../stores/baja_documental_store";
import { espera } from "../../../helpers/helper";
import { genera_anexo_13 } from "src/helpers/anexo_13";

import TablaComp from "../Components/TablaComp.vue";
import ModalComp from "../Components/ModalComp.vue";
import ModalVerComp from "../Components/ModalVerComp.vue";

const $q = useQuasar();
const authStore = useAuthStore();
const areaStore = useAreaStore();
const bajaStore = useBajaDocumentalStore();
const { modulo } = storeToRefs(authStore);
const siglas = "AI-BD";

const leerPermisos = async () => {
  $q.loading.show();
  await authStore.loadModulo(siglas);
  $q.loading.hide();
};

onBeforeMount(() => {
  leerPermisos();
});

const actualizarModal = async (valor) => {
  $q.loading.show();
  await espera();
  bajaStore.initEncabezado();
  await areaStore.loadListaAreas();
  await bajaStore.loadAprueba();
  await bajaStore.loadRespArchivo();
  bajaStore.updateEditar(false);
  bajaStore.actualizarModal(valor);
  $q.loading.hide();
};
</script>

