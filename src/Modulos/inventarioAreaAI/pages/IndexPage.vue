<template>
  <q-page padding>
    <div class="row">
      <div class="col">
        <div class="q-pa-md q-gutter-sm">
          <q-breadcrumbs>
            <q-breadcrumbs-el icon="home" to="/" />
            <q-breadcrumbs-el label="Inventario general AI" icon="inventory" />
          </q-breadcrumbs>
        </div>
      </div>
    </div>
    <div class="row items-center">
      <div class="col">
        <h1 class="text-h6 text-purple-ieen q-px-md">Inventario general AI</h1>
      </div>
      <div class="col-auto q-px-md">
        <!-- Auditoría FUNC-002: el índice de expedientes clasificados como reservados (LGA 14 / Nay 13,
             LGTAIP) es de publicación obligatoria y su endpoint no tenía ningún consumidor en el cliente.
             El ámbito lo resuelve el servidor: global -> todas las áreas; usuario de área -> la suya. -->
        <q-btn
          v-if="puedeGenerarIndice"
          type="button"
          color="green-8"
          icon-right="lock"
          label="Índice de reservados"
          @click="descargarIndiceReservados"
        />
      </div>
    </div>
    <div class="row">
      <div class="col">
        <q-card flat bordered v-if="modulo == null ? false : modulo.leer">
          <q-tabs v-model="tab" class="text-purple-ieen" align="justify">
            <q-tab name="concentracion" label="Concentración" />
            <q-tab name="historico" label="Histórico" />
          </q-tabs>
          <q-separator />
          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="concentracion">
              <TablaConcentracionComp />
            </q-tab-panel>

            <q-tab-panel name="historico">
              <TablaHistoricoComp />
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
        <SinPermisoBanner v-else modulo="Inventario general AI" />
      </div>
    </div>
    <ModalComp />
    <ModalAdjuntos />
    <ModalVisor />
    <ModalQr />
  </q-page>
</template>
<script setup>
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { useInventarioAreaAIStore } from "../../../stores/inventario_area_ai_store";
import { useAuthStore } from "../../../stores/auth_store";
import { espera } from "../../../helpers/helper";

import ModalComp from "../components/ModalComp.vue";
import TablaConcentracionComp from "../components/TablaConcentracionComp.vue";
import TablaHistoricoComp from "../components/TablaHistoricoComp.vue";
import ModalAdjuntos from "../components/ModalAdjuntos.vue";
import ModalVisor from "../components/ModalVisor.vue";
import ModalQr from "../components/ModalQr.vue";
import SinPermisoBanner from "../../../components/SinPermisoBanner.vue";
import { descargarReporte } from "../../../helpers/descargar_reporte";

const $q = useQuasar();
const authStore = useAuthStore();
const { modulo } = storeToRefs(authStore);
const siglas = "AI-INV-AREA-AI";
const tab = ref("concentracion");
const puedeGenerarIndice = ref(false);

onBeforeMount(() => {
  leerPermisos();
});

const leerPermisos = async () => {
  $q.loading.show();
  await authStore.loadModulo(siglas);
  puedeGenerarIndice.value = authStore.tienePermiso("archivo.inventario.ver");
  $q.loading.hide();
};

// Auditoría FUNC-002: GET /api/reportes/indice-reservados estaba implementado y sin consumidor.
// Generarlo deja renglón en la bitácora (el índice expone la relación de expedientes reservados).
const descargarIndiceReservados = async () => {
  $q.loading.show();
  const resp = await descargarReporte("/reportes/indice-reservados", "Indice_Reservados.pdf");
  $q.loading.hide();
  if (!resp.success) {
    $q.notify({ type: "negative", message: resp.data });
  }
};
</script>
