<template>
  <q-dialog
    v-model="modalVer"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card flat bordered style="width: 800px; max-width: 80vw">
      <q-card-section class="row">
        <h2 class="text-h6">Solicitud de prestamo</h2>
        <q-space />
        <q-btn
          icon="close"
          @click="actualizarModal(false)"
          flat
          round
          dense
          v-close-popup
        aria-label="Cerrar" />
      </q-card-section>
      <q-card-section>
        <q-form class="row q-col-gutter-xs">
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              readonly
              v-model="registro.area_Solicitante"
              label="Área solicitante"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              readonly
              v-model="registro.folio_Solicitud"
              label="Folio solicitud"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input readonly v-model="registro.folio" label="Folio prestamo" />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              stack-label
              readonly
              v-model="registro.fecha_Prestamo"
              label=""
              hint="Fecha prestamo"
              type="date"
              lazy-rules
              :rules="[(val) => !!val || 'La fecha es requerida']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              stack-label
              v-model="registro.fecha_Devolucion"
              label=""
              hint="Fecha devolución"
              type="date"
              lazy-rules
              :rules="[(val) => !!val || 'La fecha es requerida']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="registro.solicitante"
              readonly
              label="Solicitante"
              lazy-rules
              :rules="[(val) => !!val || 'El empleado es requerido']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-checkbox label="Digital" v-model="registro.digital" disable />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-checkbox label="Fisico" v-model="registro.fisico" disable />
          </div>
        </q-form>
      </q-card-section>
      <q-separator />
      <br />
      <q-card-section>
        <Tabla />
      </q-card-section>
      <q-card-section>
        <div class="col-12 justify-end">
          <div class="text-right q-gutter-xs">
            <BtnCancelar @click="actualizarModal(false)" />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { useCedulaPrestamoStore } from "../../../stores/cedula_prestamo_store";
import Tabla from "../components/Tabla_Detalle_Ver.vue";
import BtnCancelar from "../../../components/BtnCancelar.vue";

const $q = useQuasar();
const cedulaPrestamo = useCedulaPrestamoStore();
const { registro, modalVer } = storeToRefs(cedulaPrestamo);
const actualizarModal = () => {
  cedulaPrestamo.initRegistro();
  cedulaPrestamo.actualizarModalVer(false);
};
</script>
