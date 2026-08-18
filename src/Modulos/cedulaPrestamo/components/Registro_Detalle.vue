<template>
  <h2 class="text-h6">Detalle</h2>
  <q-form class="row q-col-gutter-xs" @submit="agregarDetalle">
    <div class="col-12 col-xs-2 col-md-3">
      <q-select
        use-input
        v-model="anioDetalle"
        :options="listaAnios"
        label="Año"
        hint="Seleccione un año"
      />
    </div>
    <div class="col-12 col-xs-12 col-md-12">
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
        label=""
        hint="Fecha de inicio o conclusión del Expediente"
        type="date"
        lazy-rules
        :rules="[(val) => !!val || 'La fecha es requerida']"
      />
    </div>
    <div class="col-12 col-xs-6 col-md-4">
      <q-input
        v-model="inventario.ubicacion"
        label="Signatura Topográfica"
        hint="Indique ubicación"
        lazy-rules
        :rules="[(val) => !!val || 'La fecha es requerida']"
      />
    </div>
    <div class="col-12 col-xs-6 col-md-4">
      <q-input
        v-model="inventario.no_Expediente_Interno"
        label="No. Interno"
        hint="No. interno de expediente"
        lazy-rules
        :rules="[(val) => !!val || 'La fecha es requerida']"
      />
    </div>
    <div class="col-12 col-xs-6 col-md-12">
      <q-input
        v-model="descripcion"
        label="Descripción del Contenido del Expediente"
        hint="Ingrese descripción"
        lazy-rules
        :rules="[(val) => !!val || 'La descripción es requerida']"
      />
    </div>
    <div class="col-12 col-xs-6 col-md-12">
      <q-input
        v-model="observaciones"
        label="Observaciones"
        hint="Ingrese observaciones"
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
import { useDetalleCedulaPrestamoStore } from "../../../stores/detalle_cedula_prestamo";
import { useInventarioAreaStore } from "../../../stores/inventario_area_store";
import { useCedulaPrestamoStore } from "../../../stores/cedula_prestamo_store";

const inventariosAreas = useInventarioAreaStore();
const detalleCedulaPrestamoStore = useDetalleCedulaPrestamoStore();
const cedulaStore = useCedulaPrestamoStore();

const $q = useQuasar();
const { detalle } = storeToRefs(detalleCedulaPrestamoStore);
const { inventariosArea, inventario, listaAnios, inventariosAreaFiltro } =
  storeToRefs(inventariosAreas);
const { isEditar, registro } = storeToRefs(cedulaStore);
const inventarioId = ref(null);
const anioDetalle = ref(null);
const descripcion = ref(null);
const observaciones = ref(null);
const options_inventario = ref(inventariosAreaFiltro.value);

watch(inventariosArea, (inventario) => {
  inventarioId.value = null;
  inventariosAreas.initInventario();
});

watch(inventarioId, (valorInv) => {
  if (valorInv != null) {
    leerInventario(valorInv.value);
  }
});

watch(anioDetalle, (val) => {
  if (val != null) {
    cargarDetalle(val);
  }
});

const leerInventario = (id) => {
  // Corte al backend nuevo: el detalle del expediente se toma de la opción ya cargada por el picker
  // (endpoint /expedientes/por-area), no de loadInventario (legado compartido). Aporta la fecha de
  // término; la ubicación (signatura) la captura el usuario, ya que el expediente no la trae.
  inventariosAreas.seleccionarInventarioLocal(id);
};

const cargarDetalle = async (anio) => {
  $q.loading.show();
  await inventariosAreas.loadInventariosAreaAnio(anio);
  $q.loading.hide();
};

const agregarDetalle = async () => {
  const objDetalle = {
    inventario_Id: inventarioId.value.value,
    inventario_Clave_Clasificacion: inventarioId.value.label,
    inventario_No_Expediente_Interno: inventario.value.no_Expediente_Interno,
    ubicacion: inventario.value.ubicacion,
    descripcion: descripcion.value,
    observaciones: observaciones.value,
    fecha_Inicio_Conclusion: inventario.value.fecha_Termino,
  };

  if (isEditar.value == false) {
    detalleCedulaPrestamoStore.addDetalle(objDetalle);
    limpiar();
  } else {
    const resp = await detalleCedulaPrestamoStore.createDetalle(
      registro.value.id,
      objDetalle
    );

    if (resp.success == true) {
      detalleCedulaPrestamoStore.loadDetalles(registro.value.id);
    } else {
      $q.notify({
        type: "negative",
        message: resp.data,
      });
    }
  }
};

const resetValidation = () => {
  inventarioId.value.resetValidation();
};

const limpiar = () => {
  inventariosAreas.initInventario();
  descripcion.value = null;
  observaciones.value = null;
  inventarioId.value = null;
  resetValidation();
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
</script>
