<template>
  <q-dialog
    v-model="modal"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card flat bordered style="width: 800px; max-width: 80vw">
      <q-card-section class="row">
        <h2 class="text-h6">Inventario general por expediente</h2>
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
          <div class="col-12 col-xs-12 col-md-12">
            <q-select
              v-model="seccionId"
              :options="options_secciones"
              use-input
              @filter="filtro_seccion"
              label="Sección"
              hint="Seleccione sección"
              lazy-rules
              :rules="[(val) => !!val || 'La sección es requerida']"
            />
          </div>
          <div class="col-12 col-xs-12 col-md-12">
            <q-select
              v-model="serieId"
              :options="options_series"
              use-input
              @filter="filtro_serie"
              label="Serie"
              hint="Seleccione serie"
              lazy-rules
              :rules="[(val) => !!val || 'La serie es requerida']"
            />
          </div>
          <div class="col-12 col-xs-12 col-md-12">
            <q-select
              v-model="subSerieId"
              :options="options_subseries"
              use-input
              @filter="filtro_subserie"
              label="SubSerie"
              hint="Seleccione Subserie"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              v-model="inventario.nombre_Expediente"
              label="Nombre del expediente"
              hint="ingrese nombre del expediente"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              v-model="inventario.clave_Clasificacion"
              label="Clave de clasificación"
              hint="ingrese clave de clasificación"
            />
          </div>
          <div class="col-12 col-xs-12 col-md-12">
            <q-input
              v-model="inventario.descripcion"
              label="Descripción"
              hint="ingrese descripción"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              stack-label
              v-model="inventario.fecha_Inicio"
              type="date"
              label="Fecha inicio"
              hint="ingrese fecha inicio"
              lazy-rules
              :rules="[(val) => !!val || 'La fecha de inicio es requerida']"
            >
            </q-input>
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              stack-label
              v-model="inventario.fecha_Termino"
              type="date"
              label="Fecha termino"
              hint="ingrese fecha termino"
              lazy-rules
              :rules="[(val) => !!val || 'La fecha de termino es requerida']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="inventario.ubicacion"
              label="Ubicación"
              hint="ingrese ubicación"
              lazy-rules
              :rules="[
                (val) => !!val || 'El  no. expediente interno es requerido',
              ]"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              readonly
              v-model="disposicion.valor_Documental"
              label="Valor documental"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              readonly
              v-model="disposicion.vigencia_Archivo_Tramite"
              label="Vigencia archivo tramite"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              readonly
              v-model="disposicion.vigencia_Archivo_Concentracion"
              label="Destino concentración"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              readonly
              v-model="disposicion.disposicion_Documental"
              label="Destino final"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              stack-label
              v-model="inventario.fecha_Clasificacion"
              type="date"
              label="Fecha clasificación"
              hint="ingrese fecha clasificación"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              stack-label
              v-model="inventario.fecha_Desclasificacion"
              type="date"
              label="Fecha desclasificación"
              hint="ingrese fecha desclasificación"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              stack-label
              v-model="inventario.fecha_Ampliacion"
              type="date"
              label="Fecha ampliación"
              hint="ingrese fecha ampliación"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-checkbox label="Clasificado" v-model="inventario.clasificado" />
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
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { ref, toRef, watch } from "vue";
import { useInventarioAreaStore } from "../../../stores/inventario_area_store";
import { useSeccionStore } from "../../../stores/secciones_store";
import { useSeriesStore } from "../../../stores/series_store";
import { useSubSerieStore } from "../../../stores/sub_series_store";
import { useDisposicionDocStore } from "../../../stores/disposicion_documental_store";
import BtnCancelar from "../../../components/BtnCancelar.vue";
const $q = useQuasar();
const inventarioStore = useInventarioAreaStore();
const seccionStore = useSeccionStore();
const seriesStore = useSeriesStore();
const subSerieStore = useSubSerieStore();
const disposicionDocStore = useDisposicionDocStore();
const props = defineProps({
  encabezadoId: {
    type: Number,
    required: true,
  },
});
const { modal, isEditar, inventario } = storeToRefs(inventarioStore);
const { listaSecciones } = storeToRefs(seccionStore);
const { listaSeries } = storeToRefs(seriesStore);
const { listaSubSeries } = storeToRefs(subSerieStore);
const { disposicion } = storeToRefs(disposicionDocStore);

const seccionId = ref(null);
const serieId = ref(null);
const subSerieId = ref(null);
const loading = ref(false);
const actualizarModal = () => {
  inventarioStore.actualizarModal(false);
};

const options_secciones = ref(listaSecciones.value);
const options_series = ref(listaSeries.value);
const options_subseries = ref(listaSubSeries.value);

const loadSeries = async (seccionId) => {
  if (seccionId == null) return;
  $q.loading.show();
  await seriesStore.loadListaSeries(seccionId);
  $q.loading.hide();
};

const loadSubSeries = async (serieId) => {
  if (serieId == null) return;
  $q.loading.show();
  await subSerieStore.loadListaSubSeries(serieId);
  if (listaSubSeries.value.length == 0) {
    await loadDispDocumental();
  }
  $q.loading.hide();
};

const loadDispDocumental = async () => {
  $q.loading.show();
  if (subSerieId.value == null) {
    await disposicionDocStore.loadDisposicionBySerie(
      seccionId.value.value,
      serieId.value.value
    );
  } else {
    await disposicionDocStore.loadDisposicionBySerie(
      seccionId.value.value,
      serieId.value.value,
      subSerieId.value.value
    );
  }
  $q.loading.hide();
};

watch(seccionId, (val) => {
  if (val == null) return;
  serieId.value = null;
  subSerieId.value = null;
  seriesStore.initListaSeries();
  subSerieStore.initListaSubSerie();
  loadSeries(val.value);
});

watch(serieId, (val) => {
  if (val == null) return;
  subSerieId.value = null;
  subSerieStore.initListaSubSerie();
  loadSubSeries(val.value);
});

watch(subSerieId, (val) => {
  if (val == null) return;
  loadDispDocumental();
});

const filtro_seccion = (val, update) => {
  if (val === "") {
    update(() => {
      options_secciones.value = listaSecciones.value;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    options_secciones.value = listaSecciones.value.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1
    );
  });
};

const filtro_serie = (val, update) => {
  if (val === "") {
    update(() => {
      options_series.value = listaSeries.value;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    options_series.value = listaSeries.value.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1
    );
  });
};

const filtro_subserie = (val, update) => {
  if (val === "") {
    update(() => {
      options_subseries.value = listaSubSeries.value;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    options_subseries.value = listaSubSeries.value.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1
    );
  });
};

const onSubmit = async () => {
  loading.value = true;
  let resp = null;
  inventario.value.seccion_Id = seccionId.value.value;
  inventario.value.serie_Id = serieId.value.value;
  inventario.value.vigencia_Tramite =
    disposicion.value.vigencia_Archivo_Tramite;
  inventario.value.vigencia_Concentracion =
    disposicion.value.vigencia_Archivo_Concentracion;
  inventario.value.vigencia_Completa =
    disposicion.value.vigencia_Archivo_Tramite +
    disposicion.value.vigencia_Archivo_Concentracion;
  if (subSerieId.value != null) {
    inventario.value.sub_Serie_Id = subSerieId.value.value;
  }
  inventario.value.disposicion_Documental_Id = disposicion.value.id;
  if (isEditar.value == true) {
  } else {
    resp = await inventarioStore.createInventario(
      inventario.value,
      props.encabezadoId
    );
  }
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
<style>
</style>
