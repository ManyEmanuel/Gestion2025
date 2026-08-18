<template>
  <q-dialog
    v-model="modal"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card flat bordered style="width: 800px; max-width: 80vw">
      <q-card-section class="row">
        <h2 class="text-h6">Secciones</h2>
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
          <div class="col-12 col-xs-6 col-md-2">
            <q-input
              v-model="seccion.codigo"
              label="Código"
              type="number"
              hint="Ingrese código"
              lazy-rules
              :rules="[(val) => !!val || 'El código es requerido']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-2">
            <q-select
              v-model="seccion.tipo"
              :options="tipos"
              label="Tipo"
              hint="Seleccione tipo"
              lazy-rules
              :rules="[(val) => !!val || 'El area es requerida']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-8">
            <q-input
              v-model="seccion.descripcion"
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
import { useSeccionStore } from "../../../stores/secciones_store";
import BtnCancelar from "../../../components/BtnCancelar.vue";

const seccionStore = useSeccionStore();
const $q = useQuasar();

const { modal, isEditar, seccion } = storeToRefs(seccionStore);
const tipos = ["C", "S"];

const loading = ref(false);

const actualizarModal = (valor) => {
  seccionStore.actualizarModal(valor);
  if (valor == false) {
    seccionStore.initSeccion();
  }
};

const onSubmit = async () => {
  let resp = null;
  loading.value = true;
  if (isEditar.value == true) {
    resp = await seccionStore.updateSeccion(seccion.value, seccion.value.id);
  } else {
    resp = await seccionStore.createSeccion(seccion.value);
  }

  if (resp.success) {
    $q.notify({
      type: "positive",
      message: resp.data,
    });
    loading.value = false;
    actualizarModal(false);
    seccionStore.loadSecciones();
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
