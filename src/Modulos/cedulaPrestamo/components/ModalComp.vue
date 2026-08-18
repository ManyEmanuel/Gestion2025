<template>
  <q-dialog
    v-model="modal"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card flat bordered style="width: 800px; max-width: 80vw">
      <q-card-section class="row">
        <div class="text-h6">Solicitud de prestamo</div>
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
          <div class="col-12 col-xs-12 col-md-12">
            <q-select
              use-input
              :autofocus="true"
              v-model="areaRespId"
              :options="options_areas"
              @filter="filtro_area"
              label="Área"
              hint="Seleccione área"
              lazy-rules
              :rules="[(val) => !!val || 'El área es requerida']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              stack-label
              v-model="registro.fecha_Prestamo"
              label="Fecha préstamo"
              hint="Ingrese fecha préstamo"
              type="date"
              lazy-rules
              :rules="[(val) => !!val || 'La fecha es requerida']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              stack-label
              v-model="registro.fecha_Devolucion"
              label="Fecha devolución"
              hint="Ingrese fecha devolución"
              type="date"
              lazy-rules
              :rules="[(val) => !!val || 'La fecha es requerida']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-select
              v-model="empleadoId"
              :options="empleados"
              label="Solicitante"
              hint="Seleccione solicitante"
              lazy-rules
              :rules="[(val) => !!val || 'El empleado es requerido']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-checkbox label="Digital" v-model="registro.digital" />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-checkbox label="Fisico" v-model="registro.fisico" />
          </div>
        </q-form>
      </q-card-section>
      <q-separator />
      <br />
      <q-card-section>
        <RegistroDetalle />
      </q-card-section>
      <q-card-section>
        <Tabla />
      </q-card-section>
      <q-card-section>
        <div class="col-12 justify-end">
          <div class="text-right q-gutter-xs">
            <BtnCancelar @click="actualizarModal(false)" />
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
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { ref, watch, defineProps, onMounted } from "vue";
import { useCedulaPrestamoStore } from "../../../stores/cedula_prestamo_store";
import { useInventarioAreaStore } from "../../../stores/inventario_area_store";
import { useAreaStore } from "../../../stores/areas_store";
import { useDetalleCedulaPrestamoStore } from "../../../stores/detalle_cedula_prestamo";
import { espera } from "../../../helpers/helper";
import Tabla from "./Tabla_Detalle.vue";
import RegistroDetalle from "./Registro_Detalle.vue";
import BtnCancelar from "../../../components/BtnCancelar.vue";

const $q = useQuasar();
const cedulaPrestamo = useCedulaPrestamoStore();
const inventariosAreas = useInventarioAreaStore();
const detalleCedulaPrestamoStore = useDetalleCedulaPrestamoStore();
const areasStore = useAreaStore();

onMounted(() => {
  // Corte al backend nuevo: el selector de solicitante usa /api/empleados (loadEmpleadosTodos, ya
  // migrado) en vez del /Empleados/ByArea legado.
  areasStore.loadEmpleadosTodos();
});

const props = defineProps({
  clasificado: Boolean,
});

const { modal, registro, isEditar } = storeToRefs(cedulaPrestamo);

const { areas, empleados } = storeToRefs(areasStore);
const { arrayDetalles } = storeToRefs(detalleCedulaPrestamoStore);
const areaRespId = ref(null);
const areaSolId = ref(null);
const empleadoId = ref(null);
const loading = ref(false);
const detalle = ref([]);
const myForm = ref(null);

const options_areas = ref(areas.value);

watch(areaRespId, (area) => {
  if (area != null) {
    if (props.clasificado == true) {
      inventariosAreas.loadInventariosAreaClasificado(area.value);
    } else {
      inventariosAreas.loadInventariosArea(area.value);
    }
  }
});

const actualizarModal = () => {
  areaRespId.value = null;
  areaSolId.value = null;
  empleadoId.value = null;
  cedulaPrestamo.initRegistro();
  cedulaPrestamo.actualizarModal(false);
};

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

const onSubmit = async () => {
  const valido = await myForm.value.validate();
  if (valido == true) {
    let resp = null;
    loading.value = true;
    registro.value.area_Responsable_Id = areaRespId.value.value;
    registro.value.solicitante_Id = empleadoId.value.value;
    registro.value.detalle = arrayDetalles.value;
    registro.value.clasificado = props.clasificado;
    console.log(registro);
    if (isEditar.value == true) {
      resp = await cedulaPrestamo.updateCedulaPrestamo(
        registro.value.id,
        registro.value
      );
    } else {
      resp = await cedulaPrestamo.createSolicitudPrestamo(registro.value);
    }
    if (resp.success) {
      loading.value = true;
      $q.notify({
        type: "positive",
        message: resp.data,
      });
      loading.value = false;
      cedulaPrestamo.loadMisSolicitudes(props.clasificado);
      actualizarModal();
    } else {
      $q.notify({
        type: "negative",
        message: resp.data,
      });
      loading.value = false;
    }
  }
};
</script>
<style>
</style>s
