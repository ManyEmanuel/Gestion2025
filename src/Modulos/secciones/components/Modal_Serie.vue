<template>
  <q-dialog
    v-model="modal"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card flat bordered style="width: 800px; max-width: 80vw">
      <q-card-section class="row">
        <h2 class="text-h6">Series</h2>
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
              v-model="serie.serie"
              label="Serie"
              type="number"
              hint="Ingrese serie"
              lazy-rules
              :rules="[(val) => !!val || 'La serie es requerida']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-8">
            <q-input
              v-model="serie.descripcion"
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
import { useSeccionStore } from "../../../stores/secciones_store";
import BtnCancelar from "../../../components/BtnCancelar.vue";

const serieStore = useSeriesStore();
const seccionStore = useSeccionStore();
const $q = useQuasar();

const { modal, isEditar, serie } = storeToRefs(serieStore);

const loading = ref(false);

const actualizarModal = (valor) => {
  serieStore.actualizarModal(valor);
  if (valor == false) {
    serieStore.initSerie();
  }
};

const onSubmit = async () => {
  let resp = null;
  loading.value = true;
  if (isEditar.value == true) {
    resp = await serieStore.updateSerie(serie.value, serie.value.id);
  } else {
    serie.value.seccion_Id = seccionStore.seccionId;
    resp = await serieStore.createSerie(serie.value);
  }

  if (resp.success) {
    $q.notify({
      type: "positive",
      message: resp.data,
    });
    loading.value = false;
    actualizarModal(false);
    serieStore.loadSeries(seccionStore.seccionId);
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