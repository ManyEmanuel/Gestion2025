<template>
  <q-dialog
    v-model="modalAI"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card style="width: 800px; max-width: 80vw">
      <q-card-section class="row">
        <div class="text-h6">Cajas de transferencia</div>
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
        <q-form class="row q-col-gutter-xs" ref="myForm">
          <div class="col-12 col-xs-6 col-md-4">
            <q-input v-model="caja.no_Caja" label="No. Caja" readonly />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input v-model="caja.seccion" label="Sección" readonly />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input v-model="caja.peso" label="Peso ( Kilogramos)" readonly />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="caja.fecha_Antigua"
              label="Año mas antiguo"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="caja.fecha_Reciente"
              label="Año mas reciente"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="caja.total_Expedientes"
              label="Total expedientes"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="caja.total_Paginas"
              label="Total hojas"
              readonly
            />
          </div>
        </q-form>
      </q-card-section>
      <q-separator />
      <br />
      <q-card-section>
        <TablaDetalleModalComp />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="col-12 justify-end">
          <div class="text-right q-gutter-xs">
            <q-btn
              color="red"
              label="Cancelar"
              @click="actualizarModal(false)"
              icon="highlight_off"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../../../stores/auth_store";
import { useCajaTransferenciaStore } from "../../../stores/caja_trasnferencia_store";

import TablaDetalleModalComp from "../components/TablaDetalleModalComp.vue";

const $q = useQuasar();
const cajaTransferenciaStore = useCajaTransferenciaStore();
const { caja, modalAI } = storeToRefs(cajaTransferenciaStore);

const actualizarModal = () => {
  cajaTransferenciaStore.actualizarModalAI(false);
  cajaTransferenciaStore.initCaja();
};
</script>
