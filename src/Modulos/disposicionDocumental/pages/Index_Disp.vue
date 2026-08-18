<template>
  <q-page padding>
    <div class="row">
      <div class="col">
        <div class="q-pa-md q-gutter-sm">
          <q-breadcrumbs>
            <q-breadcrumbs-el icon="home" to="/" />
            <q-breadcrumbs-el label="Disposición documental" icon="menu_book" />
          </q-breadcrumbs>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <h1 class="text-h6 text-purple-ieen q-px-md">Disposición documental</h1>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <div class="text-right q-pa-md items-start q-gutter-md">
          <q-btn
            type="button"
            class="q-ma-sm"
            color="green-8"
            icon-right="grid_on"
            label="CADIDO"
            @click="descargar_cadido"
          />
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
    <q-card flat bordered>
      <q-tabs v-model="tab" dense class="text-purple-ieen" align="justify">
        <q-tab name="C" label="Comúnes" />
        <q-tab name="S" label="Sustantivas" />
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="C">
          <Tabla tipo="C" v-if="modulo == null ? false : modulo.leer" />
          <SinPermisoBanner v-else modulo="Disposición documental" />
        </q-tab-panel>
        <q-tab-panel name="S">
          <Tabla tipo="S" v-if="modulo == null ? false : modulo.leer" />
          <SinPermisoBanner v-else modulo="Disposición documental" />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
    <Modal :tipo="tab" />
    <ModalEditar :tipo="tab" />
  </q-page>
</template>

<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { onBeforeMount } from "vue";
import { useQuasar } from "quasar";

import { useDisposicionDocStore } from "../../../stores/disposicion_documental_store";
import { useSeccionStore } from "../../../stores/secciones_store";
import { useAuthStore } from "../../../stores/auth_store";

import Tabla from "../components/TablaComp.vue";
import Modal from "../components/Modal_DispDoc.vue";
import ModalEditar from "../components/Modal_DispDocEditar.vue";
import { descargarReporte } from "../../../helpers/descargar_reporte";
import SinPermisoBanner from "../../../components/SinPermisoBanner.vue";

const $q = useQuasar();
const disposicionDocStore = useDisposicionDocStore();
const seccionStore = useSeccionStore();
const authStore = useAuthStore();
const { modulo } = storeToRefs(authStore);
const siglas = "AI-CAT-DISP-DOC";
onBeforeMount(() => {
  leerPermisos();
});

const leerPermisos = async () => {
  $q.loading.show();
  await authStore.loadModulo(siglas);
  $q.loading.hide();
};
const tab = ref("C");

// MIGRADO al backend nuevo: descarga el CADIDO (cuadro general de clasificación y disposición
// documental) en Excel (.xlsx) generado por el servidor (GET /api/reportes/cadido).
const descargar_cadido = async () => {
  $q.loading.show();
  const resp = await descargarReporte("/reportes/cadido", "CADIDO.xlsx");
  $q.loading.hide();
  if (!resp.success) {
    $q.notify({ type: "negative", message: resp.data });
  }
};

const actualizarModal = (valor) => {
  disposicionDocStore.initDisposicion();
  disposicionDocStore.actualizarModal(valor);
  disposicionDocStore.updateEditar(false);
  disposicionDocStore.loadValoresDocumentales();
  disposicionDocStore.loadNivelesSeguridad();
  seccionStore.loadListaSecciones();
};
</script>

<style>
</style>
