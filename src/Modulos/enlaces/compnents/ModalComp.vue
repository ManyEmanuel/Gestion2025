<template>
  <q-dialog
    v-model="modal"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card flat bordered style="width: 800px; max-width: 80vw">
      <q-card-section class="row">
        <h2 class="text-h6">Enlaces de áreas</h2>
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
        <q-form class="row q-col-gutter-xs" @submit="onSubmit">
          <div class="col-12 col-xs-6 col-md-6">
            <q-select
              v-model="areaId"
              :options="areas"
              label="Área"
              hint="Selecciona área"
              lazy-rules
              :rules="[(val) => !!val || 'El área es requerida']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-select
              v-model="empleadoId"
              :options="empleados"
              label="Empleado"
              hint="Selecciona empleado"
              lazy-rules
              :rules="[(val) => !!val || 'El empleado es requerido']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              label="Fecha de asignación"
              v-model="enlace.fecha_Registro"
              mask="date"
              :rules="['date']"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      v-model="enlace.fecha_Registro"
                      :locale="myLocale"
                      color="purple"
                    >
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Ok" color="purple" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-checkbox label="Activo" v-model="enlace.activo" />
          </div>
          <div class="col-12 justify-end">
            <div class="text-right q-gutter-xs">
              <BtnCancelar @click="actualizarModal(false)" />
              <q-btn
                :loading="loading"
                type="submit"
                color="secondary"
                label="Guardar"
                icon="save"
              >
                <template v-slot:loading>
                  <q-spinner-hourglass class="on-left" />
                  Cargando...
                </template>
              </q-btn>
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useQuasar } from "quasar";
import { onMounted, ref, watch } from "vue";
import { useEnlaceArchivoStore } from "../../../stores/enlace_archivo_store";
import { useAreaStore } from "../../../stores/areas_store";
import BtnCancelar from "../../../components/BtnCancelar.vue";
import { espera } from "../../../helpers/helper";

const $q = useQuasar();
const enlaceArchivoStore = useEnlaceArchivoStore();
const areaStore = useAreaStore();
const { enlace, modal, myLocale } = storeToRefs(enlaceArchivoStore);
const { areas, empleados } = storeToRefs(areaStore);
const loading = ref(false);
const areaId = ref(null);
const empleadoId = ref(null);
const actualizarModal = () => {
  areaId.value = null;
  empleadoId.value = null;
  enlaceArchivoStore.updateEditar(false);
  enlaceArchivoStore.actualizarModal(false);
};

onMounted(() => {
  areaStore.loadListaAreas();
});

watch(areaId, (val) => {
  empleadoId.value = null;
  if (val == null) return;
  console.log(val.value);
  areaStore.loadEmpleadosByArea(val.value);
});

watch(enlace.value, (val) => {
  if (val.id != null) {
    cargarEnlace(val);
  }
});

const cargarEnlace = async (val) => {
  const areaFiltrada = areas.value.find((x) => x.value == `${val.area_Id}`);
  areaId.value = areaFiltrada;
  // TODO(ux-audit): revisar si este delay compensa una transición real o reactividad no otorgada
  await espera(100);
  const empleadoFiltrado = empleados.value.find(
    (x) => x.value == `${val.empleado_Id}`
  );
  empleadoId.value = empleadoFiltrado;
};

const onSubmit = async () => {
  let resp = null;
  loading.value = true;
  enlace.value.empleado_Id = empleadoId.value.value;
  enlace.value.area_Id = areaId.value.value;
  // Corte: el backend nuevo no actualiza empleado/área de un enlace (solo el estado, vía
  // activar/desactivar). La edición se deshabilitó, así que el modal solo crea.
  resp = await enlaceArchivoStore.createEnlace(enlace.value);
  if (resp.success) {
    $q.notify({
      type: "positive",
      message: resp.data,
    });
    loading.value = false;
    actualizarModal(false);
  } else {
    $q.notify({
      type: "negative",
      message: resp.data,
    });
    loading.value = false;
  }
};
</script>
