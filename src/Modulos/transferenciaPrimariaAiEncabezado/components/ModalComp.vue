<template>
  <q-dialog
    v-model="modalAI"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card flat bordered style="width: 800px; max-width: 80vw">
      <q-card-section class="row">
        <div class="text-h6">Transferencia primaria</div>
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
        <q-form class="row q-col-gutter-xs" @submit="onSubmit">
          <div class="col-12 col-xs-6 col-md-6" v-if="isEditar">
            <q-input
              v-model="encabezado.numero_Transferencia"
              label="No. transferencia"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6" v-if="isEditar">
            <q-input
              v-model="encabezado.fecha_Registro"
              label="Fecha registro"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input v-model="encabezado.nombre" label="Nombre" readonly />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              v-model="encabezado.area_Responsable"
              label="Area responsable"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              v-model="encabezado.area_Generadora"
              label="Área generadora"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input v-model="encabezado.enlace" label="Enlace" readonly />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input v-model="encabezado.valida_Area" label="Valida" readonly />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input v-model="encabezado.coteja" label="Coteja" readonly />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input v-model="encabezado.valida" label="Valida" readonly />
          </div>
          <div class="col-12 justify-end">
            <div class="text-right q-gutter-xs">
              <q-btn
                color="red"
                label="Cerrar"
                @click="actualizarModal(false)"
                icon="highlight_off"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { useTransferenciaPrimariaEncabezadoStore } from "../../../stores/transferencia_primaria_encabezado_store";
import { useRouter } from "vue-router";
import { espera } from "../../../helpers/helper";

const $q = useQuasar();
const router = useRouter();
const transferenciaStore = useTransferenciaPrimariaEncabezadoStore();
const { modalAI, encabezado } = storeToRefs(transferenciaStore);

const actualizarModal = (valor) => {
  transferenciaStore.actualizarModalAI(valor);
};
</script>
