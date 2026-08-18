<template>
  <h2 class="text-h6">Detalle</h2>
  <q-form class="row q-col-gutter-xs" @submit="agregar_detalle" ref="my_form_det">
    <div class="col-12 col-xs-2 col-md-3">
      <q-select
        use-input
        v-model="anioDetalle"
        :options="listaAnios"
        label="Año"
        hint="Seleccione un año"
      />
    </div>
    <div class="col-12 col-xs-12 col-md-9">
      <q-select
        use-input
        @filter="filtro_inventario"
        v-model="inventarioId"
        :options="options_inventario"
        label="Clave inventario"
        hint="Seleccione clave"
        lazy-rules
        :rules="[(val) => !!val || 'La clave es requerida']"
      />
    </div>
    <div class="col-12 col-xs-6 col-md-4">
      <q-input
        stack-label
        v-model="inventario.fecha_Termino"
        label="Fecha de conclusión"
        hint="Fecha de conclusión del expediente"
        type="date"
      />
    </div>
    <div class="col-12 col-xs-6 col-md-8">
      <q-input
        v-model="inventario.ubicacion"
        label="Signatura Topográfica"
        hint="Indique ubicación / signatura"
      />
    </div>
    <div class="col-12 col-xs-12 col-md-12">
      <q-input
        v-model="descripcion"
        label="Descripción del contenido del expediente"
        hint="Ingrese descripción"
        lazy-rules
        :rules="[(val) => !!val || 'La descripción es requerida']"
      />
    </div>
    <div class="col-12 col-xs-12 col-md-12">
      <q-input
        v-model="observaciones"
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
import { ref, watch } from "vue";
import { useSolicitudPrestamoAiStore } from "../../../stores/solicitud_prestamo_ai_store";
import { useDetalleSolicitudAISotre } from "../../../stores/detalle_solicitud_prestamo_ai_store";
import { useInventarioAreaStore } from "../../../stores/inventario_area_store";

const $q = useQuasar();
const solicitudStore = useSolicitudPrestamoAiStore();
const detalleStore = useDetalleSolicitudAISotre();
const inventariosAreas = useInventarioAreaStore();

const { solicitud, isEditar } = storeToRefs(solicitudStore);
const { detalles } = storeToRefs(detalleStore);
// Corte al backend nuevo: el picker de expediente lo carga el modal (loadInventariosAreaAi al elegir área);
// aquí se consume el estado compartido con el picker de préstamo de Trámite.
const { inventariosArea, inventario, listaAnios, inventariosAreaFiltro } =
  storeToRefs(inventariosAreas);
const inventarioId = ref(null);
const anioDetalle = ref(null);
const descripcion = ref(null);
const observaciones = ref(null);
const loading = ref(false);
const my_form_det = ref(null);
const options_inventario = ref(inventariosAreaFiltro.value);

watch(inventariosArea, () => {
  inventarioId.value = null;
  inventariosAreas.initInventario();
});

watch(inventarioId, (val) => {
  if (val != null) {
    inventariosAreas.seleccionarInventarioLocal(val.value);
  } else {
    inventariosAreas.initInventario();
  }
});

watch(anioDetalle, (val) => {
  if (val != null) {
    inventariosAreas.loadInventariosAreaAnio(val);
  }
});

const limpiar = () => {
  inventariosAreas.initInventario();
  descripcion.value = null;
  observaciones.value = null;
  inventarioId.value = null;
  if (my_form_det.value) my_form_det.value.resetValidation();
};

const filtro_inventario = (val, update) => {
  if (val === "") {
    update(() => {
      options_inventario.value = inventariosAreaFiltro.value;
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    options_inventario.value = inventariosAreaFiltro.value.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1
    );
  });
};

const agregar_detalle = async () => {
  const objDetalle = {
    id: null,
    inventario_Id: inventarioId.value.value,
    inventario_Clave_Clasificacion: inventarioId.value.label,
    ubicacion: inventario.value.ubicacion,
    descripcion: descripcion.value,
    observaciones: observaciones.value,
    fecha_Inicio_Conclusion: inventario.value.fecha_Termino,
  };
  $q.loading.show();
  if (isEditar.value) {
    const existe = detalles.value.some((x) => x.inventario_Id == objDetalle.inventario_Id);
    if (existe) {
      $q.loading.hide();
      $q.notify({ type: "warning", message: "Ya has agregado esa clave" });
      return;
    }
    const resp = await detalleStore.create(solicitud.value.id, objDetalle);
    if (resp.success) {
      limpiar();
      $q.notify({ type: "positive", message: resp.data });
    } else {
      $q.notify({ type: "negative", message: resp.data });
    }
  } else {
    const existe = detalleStore.array_detalle.some(
      (x) => x.inventario_Id == objDetalle.inventario_Id
    );
    if (!existe) {
      objDetalle.id = detalleStore.array_detalle.length + 1;
      detalleStore.add_detalle({ ...objDetalle });
      limpiar();
    } else {
      $q.notify({ type: "warning", message: "Ya has agregado esa clave" });
    }
  }
  $q.loading.hide();
};
</script>
