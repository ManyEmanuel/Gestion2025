<template>
  <div class="text-h6">Detalle</div>
  <q-form
    class="row q-col-gutter-xs"
    @submit="agregar_detalle"
    ref="my_form_det"
  >
    <div class="col-2 col-xs-2 col-md-2">
      <q-select v-model="anioRegistro" :options="aniosFiltro" label="Año" />
    </div>
    <div class="col-10 col-xs-10 col-md-10">
      <q-select
        v-model="inventario_id"
        :options="inventariosOptFiltro"
        label="Clave inventarios"
        hint="Seleccione clave"
        lazy-rules
        :rules="[(val) => !!val || 'La clave es requerida']"
      />
    </div>
    <div class="col-12 col-xs-12 col-md-12">
      <q-input
        v-model="detalle.descripcion"
        label="Descripción"
        hint="Indique descripción"
        lazy-rules
        :rules="[(val) => !!val || 'La descripción es requerida']"
      />
    </div>
    <div class="col-12 col-xs-12 col-md-12">
      <q-input
        v-model="detalle.observaciones"
        label="Observaciones"
        hint="Puede describir observaciones"
      />
    </div>
    <div class="col-12 justify-end">
      <div class="text-right q-gutter-xs">
        <q-btn
          color="red"
          label="limpiar"
          @click="limpiar"
          icon="highlight_off"
        />
        <q-btn
          :loading="loading"
          type="submit"
          color="secondary"
          label="Agregar"
          icon="add"
        >
          <template v-slot:loading>
            <q-spinner-hourglass class="on-left" />
            Cargando...
          </template>
        </q-btn>
      </div>
    </div>
  </q-form>
</template>
<script setup>
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { onBeforeMount, onMounted, ref, watch } from "vue";
import { useSolicitudPrestamoAiStore } from "../../../stores/solicitud_prestamo_ai_store";
import { useDetalleSolicitudAISotre } from "../../../stores/detalle_solicitud_prestamo_ai_store";
import { useInventarioAreaStore } from "../../../stores/inventario_area_store";

const $q = useQuasar();
const solicitudStore = useSolicitudPrestamoAiStore();
const detalleStore = useDetalleSolicitudAISotre();
const inventariosAreasSotre = useInventarioAreaStore();

const { solicitud, isEditar, isHistorico } = storeToRefs(solicitudStore);
const { detalle, array_detalle, detalles } = storeToRefs(detalleStore);
const { inventariosOpt, inventario, inventariosOptFiltro, aniosFiltro } =
  storeToRefs(inventariosAreasSotre);
const inventario_id = ref(null);
const my_form_det = ref(null);
const anioRegistro = ref(null);

const leerInventario = async (id) => {
  $q.loading.show();
  await inventariosAreasSotre.loadInventario(id);
  detalle.value.descripcion = inventario.value.descripcion;
  detalle.value.inventario_Id = inventario_id.value.value;
  detalle.value.inventario_Clave_Clasificacion =
    inventario.value.clave_Clasificacion;
  $q.loading.hide();
};

watch(inventario_id, (val) => {
  if (val != null) {
    leerInventario(val.value);
  } else {
    detalle.value.inventario_Clave_Clasificacion = null;
    detalle.value.descripcion = null;
  }
});

watch(anioRegistro, (val) => {
  if (val != null) {
    console.log("val", val);
    cargarFiltro(val);
  }
});

onMounted(() => {
  load_inventarios();
});

const load_inventarios = async () => {
  $q.loading.show();
  await inventariosAreasSotre.loadInventarioOptAiHistorico(isHistorico.value);
  if (aniosFiltro.value.length > 0) anioRegistro.value = aniosFiltro.value[0];
  $q.loading.hide();
};

const cargarFiltro = async (anio) => {
  $q.loading.show();
  await inventariosAreasSotre.loadFiltroAnio(anio);
  $q.loading.hide();
};

const limpiar = async () => {
  detalleStore.init_detalle();
  inventario_id.value = null;
  my_form_det.value.reset();
};

const agregar_detalle = async () => {
  $q.loading.show();
  if (isEditar.value) {
    const existe = detalles.value.some(
      (x) => x.inventario_Id == inventario_id.value.value
    );
    if (existe == true) {
      limpiar();
      $q.notify({
        type: "warning",
        message: "Ya has agregado esa clave",
      });
      $q.loading.hide();
      return;
    }
    const resp = await detalleStore.create(solicitud.value.id, detalle.value);
    if (resp.success) {
      limpiar();
      $q.notify({
        type: "positive",
        message: resp.data,
      });
    } else {
      $q.notify({
        type: "negative",
        message: resp.data,
      });
    }
  } else {
    const existe = array_detalle.value.some(
      (x) => x.inventario_Id == detalle.value.inventario_Id
    );
    if (!existe) {
      detalle.value.id = array_detalle.value.length + 1;
      detalleStore.add_detalle({ ...detalle.value });
      limpiar();
    } else {
      $q.loading.hide();
      $q.notify({
        type: "warning",
        message: "Ya has agregado esa clave",
      });
    }
  }
  $q.loading.hide();
};
</script>
