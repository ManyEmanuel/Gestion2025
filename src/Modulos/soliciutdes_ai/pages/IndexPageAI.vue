<template>
  <q-page padding>
    <div class="row">
      <div class="col">
        <div class="q-pa-md q-gutter-sm">
          <q-breadcrumbs>
            <q-breadcrumbs-el icon="home" to="/" />
            <q-breadcrumbs-el
              label="Solicitudes de prestamos archivo institucional"
              icon="sync"
            />
          </q-breadcrumbs>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <q-card flat bordered v-if="modulo == null ? false : modulo.leer">
          <q-tabs v-model="tab" class="text-purple-ieen" align="justify">
            <q-tab name="pendientes" label="Pendientes" />
            <q-tab name="aprobadas" label="Aprobadas" />
            <q-tab name="rechazadas" label="Rechazadas" />
          </q-tabs>
          <q-separator />
          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="pendientes">
              <TablaComp :tipo="0" />
            </q-tab-panel>

            <q-tab-panel name="aprobadas">
              <TablaComp :tipo="1" />
            </q-tab-panel>

            <q-tab-panel name="rechazadas">
              <TablaComp :tipo="2" />
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
        <SinPermisoBanner v-else modulo="Solicitudes préstamos archivo institucional" />
      </div>
    </div>
    <ModalComp />
  </q-page>
</template>
<script setup>
import { storeToRefs } from "pinia";
import { useQuasar } from "quasar";
import { onBeforeMount, ref } from "vue";
import { useAuthStore } from "../../../stores/auth_store";

import TablaComp from "../components/TablaAIComp.vue";
import ModalComp from "../components/ModalAIComp.vue";
import SinPermisoBanner from "../../../components/SinPermisoBanner.vue";

const $q = useQuasar();
const authStore = useAuthStore();
const { modulo } = storeToRefs(authStore);
const siglas = "AI-PRESTAMOS-AI-AI";
const tab = ref("pendientes");
const leerPermisos = async () => {
  $q.loading.show();
  await authStore.loadModulo(siglas);
  $q.loading.hide();
};

onBeforeMount(() => {
  leerPermisos();
});
</script>
