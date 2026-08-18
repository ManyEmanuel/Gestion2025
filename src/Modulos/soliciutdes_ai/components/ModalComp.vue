<template>
  <q-dialog
    v-model="modal"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card flat bordered style="width: 800px; max-width: 80vw">
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
            <q-select
              use-input
              :autofocus="true"
              v-model="areaRespId"
              :options="options_areas"
              @filter="filtro_area"
              label="Área responsable"
              hint="Seleccione el área dueña de los expedientes (concentración/histórico)"
              lazy-rules
              :rules="[(val) => !!val || 'El área responsable es requerida']"
            />
          </div>
          <div class="col-12 col-xs-12 col-md-12">
            <q-select
              v-model="empleadoId"
              :options="empleados"
              label="Solicitante"
              hint="Seleccione solicitante"
              lazy-rules
              :rules="[(val) => !!val || 'El solicitante es requerido']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              v-model="solicitud.fecha_Solicitada"
              stack-label
              label="Fecha solicitada"
              type="date"
              hint="Fecha en que desea el préstamo"
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
              hint="Fecha compromiso de devolución"
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
          <div class="col-12 col-md-12">
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
            <BtnCancelar @click="actualizarModal" />
            <q-btn
              :loading="loading"
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
import { ref, watch } from "vue";
import { useSolicitudPrestamoAiStore } from "../../../stores/solicitud_prestamo_ai_store";
import { useDetalleSolicitudAISotre } from "../../../stores/detalle_solicitud_prestamo_ai_store";
import { useInventarioAreaStore } from "../../../stores/inventario_area_store";
import { useAreaStore } from "../../../stores/areas_store";

import RegistroDetalleComp from "../components/RegistroDetalleComp.vue";
import TablaDetalleComp from "../components/TablaDetalleComp.vue";
import BtnCancelar from "../../../components/BtnCancelar.vue";

const $q = useQuasar();
const solicitudPrestamoStore = useSolicitudPrestamoAiStore();
const detalleStore = useDetalleSolicitudAISotre();
const inventariosAreas = useInventarioAreaStore();
const areasStore = useAreaStore();

const { isEditar, solicitud, modal } = storeToRefs(solicitudPrestamoStore);
const { array_detalle } = storeToRefs(detalleStore);
// Corte al backend nuevo: área responsable de /api/areas (scopea el picker), solicitante de /api/empleados.
const { areas, empleados } = storeToRefs(areasStore);
const areaRespId = ref(null);
const empleadoId = ref(null);
const options_areas = ref(areas.value);
const loading = ref(false);
const myForm = ref(null);
const opcionesTipo = ref([
  { label: "Fisico", value: "Fisico" },
  { label: "Digital", value: "Digital" },
]);
const tipoDocumento = ref([]);

// Corte: al elegir el área responsable se carga el picker de expedientes en Concentración/Histórico
// de esa área (para el préstamo del archivo institucional).
watch(areaRespId, (area) => {
  if (area != null) {
    inventariosAreas.loadInventariosAreaAi(area.value);
  }
});

const filtro_area = (val, update) => {
  if (val === "") {
    update(() => {
      options_areas.value = areas.value;
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    options_areas.value = areas.value.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1
    );
  });
};

const actualizarModal = () => {
  areaRespId.value = null;
  empleadoId.value = null;
  tipoDocumento.value = [];
  solicitudPrestamoStore.initSolicitud();
  detalleStore.init_array_detalle();
  solicitudPrestamoStore.actualizarModal(false);
  solicitudPrestamoStore.actualizarHistorico(false);
};

const onSubmit = async () => {
  const valido = await myForm.value.validate();
  if (!valido) return;
  loading.value = true;
  solicitud.value.fisico = tipoDocumento.value.includes("Fisico");
  solicitud.value.digital = tipoDocumento.value.includes("Digital");
  solicitud.value.area_Responsable_Id = areaRespId.value.value;
  solicitud.value.solicitante_Id = empleadoId.value.value;
  solicitud.value.detalle = array_detalle.value;
  const resp = await solicitudPrestamoStore.create(solicitud.value);
  loading.value = false;
  if (resp.success) {
    $q.notify({ type: "positive", message: resp.data });
    actualizarModal();
  } else {
    $q.notify({ type: "negative", message: resp.data });
  }
};
</script>
