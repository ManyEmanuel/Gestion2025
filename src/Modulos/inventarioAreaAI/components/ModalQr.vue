<template>
  <q-dialog v-model="modalQr">
    <q-card flat bordered style="width: 400px; max-width: 90vw" id="etiqueta-qr-imprimible">
      <q-card-section class="row no-print">
        <h2 class="text-h6">Etiqueta QR</h2>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup aria-label="Cerrar" />
      </q-card-section>
      <q-card-section class="text-center">
        <img v-if="qrUrl" :src="qrUrl" alt="Código QR del expediente" style="width: 220px; height: 220px" />
        <div class="text-subtitle2 q-mt-sm">{{ qrClave }}</div>
        <div class="text-caption">{{ qrNombre }}</div>
      </q-card-section>
      <q-card-section class="text-right no-print">
        <q-btn flat no-caps icon="print" label="Imprimir" color="secondary" @click="imprimir" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useInventarioAreaAIStore } from "../../../stores/inventario_area_ai_store";

const inventarioStore = useInventarioAreaAIStore();
const { modalQr, qrUrl, qrClave, qrNombre } = storeToRefs(inventarioStore);

// Imprime solo la tarjeta de la etiqueta (oculta el resto de la página vía @media print más abajo).
const imprimir = () => {
  window.print();
};
</script>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  #etiqueta-qr-imprimible,
  #etiqueta-qr-imprimible * {
    visibility: visible;
  }
  #etiqueta-qr-imprimible {
    position: absolute;
    top: 0;
    left: 0;
  }
  #etiqueta-qr-imprimible .no-print {
    display: none;
  }
}
</style>
