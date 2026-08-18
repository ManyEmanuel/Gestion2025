<template>
  <q-dialog
    v-model="modal"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card flat bordered style="width: 800px; max-width: 80vw">
      <q-card-section class="row">
        <h2 class="text-h6">SubSeries</h2>
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
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="subSerie.subSerie"
              label="Subserie"
              type="number"
              hint="Ingrese serie"
              lazy-rules
              :rules="[(val) => !!val || 'La serie es requerida']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-8">
            <q-input
              v-model="subSerie.descripcion"
              label="Descripción"
              hint="Ingrese descripción"
              lazy-rules
              :rules="[(val) => !!val || 'La descripción es requerida']"
            />
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
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useSeriesStore } from "../../../stores/series_store";
import { useSubSerieStore } from "../../../stores/sub_series_store";
import BtnCancelar from "../../../components/BtnCancelar.vue";

const seriesStore = useSeriesStore();
const subSerieStore = useSubSerieStore();
const $q = useQuasar();

const { serieId } = storeToRefs(seriesStore);
const { modal, isEditar, subSerie } = storeToRefs(subSerieStore);

const loading = ref(false);

const actualizarModal = (valor) => {
  subSerieStore.actualizarModal(valor);
  if (valor == false) {
    subSerieStore.initSubSerie();
  }
};

const onSubmit = async () => {
  let resp = null;
  loading.value = true;
  if (isEditar.value == true) {
    resp = await subSerieStore.updateSubserie(
      subSerie.value,
      subSerie.value.id
    );
  } else {
    subSerie.value.serie_Id = serieId.value;
    resp = await subSerieStore.createSubSerie(subSerie.value);
  }

  if (resp.success) {
    $q.notify({
      type: "positive",
      message: resp.data,
    });
    loading.value = false;
    actualizarModal(false);
    subSerieStore.loadSubSeries(serieId.value);
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