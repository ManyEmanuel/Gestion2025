<template>
  <q-dialog
    v-model="viewer"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card flat bordered style="width: 800px; max-width: 80vw">
      <q-card-section class="row">
        <div class="text-h6">Visor</div>
        <q-space />
        <q-btn
          icon="close"
          @click="actualizarModal(false)"
          flat
          round
          dense
          v-close-popup
        />
      </q-card-section>
      <q-card-section>
        <VuePdfEmbed :source="adjunto_url" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { storeToRefs } from "pinia";
import { useQuasar } from "quasar";
import { ref, warn, watch } from "vue";
import VuePdfEmbed from "vue-pdf-embed";
import { useAdjuntoInventarioStore } from "../../../stores/adjunto_inventario_store";

const $q = useQuasar();
const adjuntoStore = useAdjuntoInventarioStore();
const { viewer, modal, adjunto_url } = storeToRefs(adjuntoStore);
const actualizarModal = () => {
  adjuntoStore.actualizarViewer(false);
};
</script>
<style>
</style>