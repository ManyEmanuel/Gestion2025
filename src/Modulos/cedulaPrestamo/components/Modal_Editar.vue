<template>
  <q-dialog
    v-model="modalEditar"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card style="width: 800px; max-width: 80vw">
      <q-card-section class="row">
        <div class="text-h6">Editar prestamo</div>
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
          <div class="col-12 col-xs-6 col-md-4">
            <q-select
              :autofocus="true"
              v-model="areaRespId"
              :options="areas"
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
            <q-btn
              color="red"
              label="Cancelar"
              @click="actualizarModal(false)"
              icon="highlight_off"
            />
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
import { computed, ref, watch } from "vue";
import { useCedulaPrestamoStore } from "../../../stores/cedula_prestamo_store";
import { useInventarioAreaStore } from "../../../stores/inventario_area_store";
import { useAreaStore } from "../../../stores/areas_store";
import { useDetalleCedulaPrestamoStore } from "../../../stores/detalle_cedula_prestamo";
import { espera } from "../../../helpers/helper";
import Tabla from "../components/Tabla_Detalle.vue";
import RegistroDetalle from "../components/Registro_Detalle.vue";

const $q = useQuasar();

const cedulaPrestamo = useCedulaPrestamoStore();
const inventariosAreas = useInventarioAreaStore();
const detalleCedulaPrestamoStore = useDetalleCedulaPrestamoStore();
const areasStore = useAreaStore();

const props = defineProps({
  clasificado: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const { modalEditar, registro, isEditar } = storeToRefs(cedulaPrestamo);

const { areas, empleados } = storeToRefs(areasStore);

const { arrayDetalles } = storeToRefs(detalleCedulaPrestamoStore);

const areaRespId = ref(null);

const areaSolId = ref(null);

const empleadoId = ref(null);

const loading = ref(false);

const detalle = ref([]);

watch(areaSolId, (area) => {
  if (area != null) {
    cargarEmpleados(area.value);
  }
});

watch(areaRespId, (area) => {
  if (area != null) {
    if (props.clasificado == true) {
      inventariosAreas.loadInventariosAreaClasificado(area.value);
    } else {
      inventariosAreas.loadInventariosArea(area.value);
    }
  }
});

watch(registro.value, (registro) => {
  cargarRegistro(registro);
});

// const Seccion_Id_Filtrada = listaSecciones.value.find(
//       (x) => x.value == `${val.seccion_Id}`
//     );

const cargarRegistro = async (registro) => {
  const areaRespFiltro = areas.value.find(
    (x) => x.value == `${registro.area_Responsable_Id}`
  );
  areaRespId.value = areaRespFiltro;
  const areaSolFiltro = areas.value.find(
    (x) => x.value == `${registro.area_Solicitante_Id}`
  );
  areaSolId.value = areaSolFiltro;
  await espera(50);
  const empleadoFiltrado = empleados.value.find(
    (x) => x.value == `${registro.solicitante_Id}`
  );
  empleadoId.value = empleadoFiltrado;
};

const cargarEmpleados = async (area) => {
  $q.loading.show();
  await areasStore.loadEmpleados(area);
  $q.loading.hide();
};

const actualizarModal = () => {
  areaRespId.value = null;
  areaSolId.value = null;
  empleadoId.value = null;
  cedulaPrestamo.initRegistro();
  cedulaPrestamo.actualizarModal(false);
};

const onSubmit = async () => {
  let resp = null;
  loading.value = true;
  registro.value.area_Responsable_Id = areaRespId.value.value;
  registro.value.area_Solicitante_Id = areaSolId.value.value;
  registro.value.solicitante_Id = empleadoId.value.value;
  if (isEditar.value == true) {
    resp = await cedulaPrestamo.updateCedulaPrestamo(
      registro.value.id,
      registro.value
    );
  } else {
    resp = await cedulaPrestamo.createCedulaPrestamo(registro.value);
  }

  if (resp.success) {
    $q.notify({
      type: "positive",
      message: resp.data,
    });
    loading.value = false;
    cedulaPrestamo.loadMisSolicitudes(props.clasificado);
    cedulaPrestamo.actualizarModalEditar(false);
  } else {
    $q.notify({
      type: "negative",
      message: resp.data,
    });
    loading.value = false;
  }
};
</script>
<style>
</style>s
