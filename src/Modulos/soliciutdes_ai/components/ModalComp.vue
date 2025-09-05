<template>
  <q-dialog
    v-model="modal"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card style="width: 800px; max-width: 80vw">
      <q-card-section class="row">
        <div class="text-h6">Solicitud de prestamo archivo institucional</div>
        <q-space />
        <q-btn
          icon="close"
          @click="actualizarModal"
          flat
          round
          dense
          v-close-popup
        />
      </q-card-section>
      <q-card-section>
        <q-form class="row q-col-gutter-xs" ref="myForm">
          <div class="col-12 col-xs-12 col-md-12">
            <q-input
              v-model="solicitud.area_Responsable"
              label="Area responsable"
              readonly
              lazy-rules
              :rules="[(val) => !!val || 'El area responsable es requerida']"
            />
          </div>
          <div class="col-12 col-xs-12 col-md-12">
            <q-input
              v-model="solicitud.area_Solicitante"
              label="Area solicitante"
              readonly
              lazy-rules
              :rules="[(val) => !!val || 'El area solicitante es requerida']"
            />
          </div>
          <div class="col-12 col-xs-12 col-md-12">
            <q-input
              v-model="solicitud.solicitante"
              label="Solicitante"
              readonly
              lazy-rules
              :rules="[(val) => !!val || 'El area responsable es requerida']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              v-model="solicitud.fecha_Solicitada"
              stack-label
              label="Fecha solicitada"
              type="date"
              hint="ingrese la fecha que desea se le realice el prestamo"
              lazy-rules
              :rules="[(val) => !!val || 'La fecha solicitada es requerida']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              v-model="solicitud.fecha_Posible_Devolucion"
              stack-label
              label="Fecha devolución"
              type="date"
              hint="ingrese la fecha que regresará el prestamo"
              lazy-rules
              :rules="[(val) => !!val || 'La fecha de devolución es requerida']"
            />
          </div>
          <div class="col-12 col-xs-12 col-md-12">
            <q-input
              v-model="solicitud.observaciones"
              label="Observaciones"
              hint="Ingrese las observaciones de la solicitud"
            />
          </div>

          <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <q-input
              v-model="solicitud.correo"
              label="Correo Electrónico"
              hint="Correo Electrónico del solicitante"
            />
          </div>
          <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <q-input
              v-model="solicitud.telefono"
              label="Teléfono"
              hint="Teléfono del solicitante"
            />
          </div>
          <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
            Tipo de archivo a solicitar
            <q-option-group
              v-model="tipoDocumento"
              :options="opcionesTipo"
              type="checkbox"
              color="purple-ieen"
              inline
            />
          </div>
        </q-form>
      </q-card-section>
      <q-card-section>
        <RegistroDetalleComp />
      </q-card-section>
      <br />
      <q-card-section>
        <TablaDetalleComp />
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
            <q-btn
              type="button"
              color="secondary"
              label="Guardar"
              icon="save"
              @click="onSubmit"
            >
              <template v-slot:loading>
                <q-spinner-hourglass class="on-left" />
                Cargando...
              </template>
            </q-btn>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { storeToRefs } from "pinia";
import { useQuasar } from "quasar";
import { onMounted, ref } from "vue";
import { useAuthStore } from "../../../stores/auth_store";
import { useRouter } from "vue-router";
import { useSolicitudPrestamoAiStore } from "../../../stores/solicitud_prestamo_ai_store";
import { useDetalleSolicitudAISotre } from "../../../stores/detalle_solicitud_prestamo_ai_store";

import RegistroDetalleComp from "../components/RegistroDetalleComp.vue";
import TablaDetalleComp from "../components/TablaDetalleComp.vue";

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const solicitudPrestamoStore = useSolicitudPrestamoAiStore();
const detalleStore = useDetalleSolicitudAISotre();
const { isEditar, solicitud, modal, isHistorico } = storeToRefs(
  solicitudPrestamoStore
);
const { array_detalle } = storeToRefs(detalleStore);
const myForm = ref(null);
const opcionesTipo = ref([
  { label: "Fisico", value: "Fisico" },
  { label: "Digital", value: "Digital" },
]);
const tipoDocumento = ref([]);
const actualizarModal = () => {
  solicitudPrestamoStore.initSolicitud();
  detalleStore.init_array_detalle();
  solicitudPrestamoStore.actualizarModal(false);
  solicitudPrestamoStore.actualizarHistorico(false);
};

const onSubmit = async () => {
  if (tipoDocumento.value.length > 0) {
    if (tipoDocumento.value.includes("Digital")) {
      solicitud.value.digital = true;
    }

    if (tipoDocumento.value.includes("Fisico")) {
      solicitud.value.fisico = true;
    }
  }
  const valido = await myForm.value.validate();
  if (valido) {
    let resp = null;
    if (isEditar.value) {
      resp = await solicitudPrestamoStore.update(solicitud.value);
    } else {
      solicitud.value.detalle = array_detalle.value;
      resp = await solicitudPrestamoStore.create(solicitud.value);
    }
    if (resp.success) {
      $q.notify({
        type: "positive",
        message: resp.data,
      });
      actualizarModal();
    } else {
      $q.notify({
        type: "negative",
        message: resp.data,
      });
    }
  }
};
</script>

