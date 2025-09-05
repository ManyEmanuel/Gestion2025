<template>
  <q-dialog
    v-model="modal_ver"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card style="width: 800px; max-width: 80vw">
      <q-card-section class="row">
        <div class="text-h6">Baja documental</div>
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
        <q-form class="row q-col-gutter-xs">
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              v-model="encabezado.fecha_Elaboracion"
              label="Fecha elaboración"
              readonly
            />
          </div>
          <div class="col-12 col-xs-12 col-md-12">
            <q-input
              v-model="encabezado.area_Responsable"
              label="Area responsable"
              readonly
            />
          </div>
          <div class="col-12 col-xs-12 col-md-6">
            <q-input
              v-model="encabezado.area_Generadora"
              label="Area generadora"
              readonly
            />
          </div>
          <div class="col-12 col-xs-12 col-md-6">
            <q-input
              v-model="encabezado.nombre"
              label="Nombre de la trasferencia"
              readonly
            />
          </div>
          <div class="col-12 col-xs-12 col-md-6">
            <q-input
              v-model="encabezado.no_Transferencia"
              label="No. Trasferencia"
              readonly
            />
          </div>
          <div class="col-12 col-xs-12 col-md-6">
            <q-input
              stack-label
              v-model="encabezado.fecha_Elaboracion"
              type="date"
              label="Fecha elaboración"
              readonly
            />
          </div>
          <div class="col-12 col-xs-12 col-md-6">
            <q-input v-model="encabezado.elaboro" label="Elaboró" readonly />
          </div>
          <div class="col-12 col-xs-12 col-md-6">
            <q-input v-model="encabezado.valida" label="Valida" readonly />
          </div>
          <div class="col-12 col-xs-12 col-md-6">
            <q-input
              v-model="encabezado.visto_Bueno"
              label="Visto bueno"
              readonly
            />
          </div>
          <div class="col-12 col-xs-12 col-md-6">
            <q-input v-model="encabezado.aprobo" label="Aprobó" readonly />
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
import { useBajaDocumentalStore } from "../../../stores/baja_documental_store";
import { useAreaStore } from "../../../stores/areas_store";
import { espera } from "../../../helpers/helper";

const bajaStore = useBajaDocumentalStore();
const { modal_ver, encabezado } = storeToRefs(bajaStore);
const actualizarModal = () => {
  bajaStore.actualizarModalVer(false);
};
</script>

<style>
</style>
