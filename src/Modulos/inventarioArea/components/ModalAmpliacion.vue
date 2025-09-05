<template>
  <q-dialog
    v-model="modalAmpliacion"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card style="width: 800px; max-width: 80vw">
      <q-card-section class="row">
        <div class="text-h6">
          Registro de ampliación de vigencia del inventario
          {{ inventario.clave_Clasificacion }}
        </div>
        <q-space />
        <q-btn
          icon="close"
          @click="actualizarModal()"
          flat
          round
          dense
          v-close-popup
        />
      </q-card-section>
      <q-card-section>
        <q-form class="row q-col-gutter-xs" @submit="onSubmit">
          <div class="col-12 col-xs-6 col-md-3">
            <q-input
              v-model="ampliacionObj.ampliacion"
              type="Number"
              label="Ampliación"
              hint="ingrese años de ampliación"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-9">
            <q-file
              rounded
              outlined
              bottom-slots
              v-model="ampliacionObj.oficio"
              label=""
              counter
              max-files="1"
            >
              <template v-slot:before>
                <q-icon name="attachment" />
              </template>
              <template v-slot:append>
                <q-icon name="search" @click.stop />
              </template>
              <template v-slot:hint> Oficio </template>
            </q-file>
          </div>
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
import { ref } from "vue-demi";
import { useInventarioAreaStore } from "../../../stores/inventario_area_store";

const $q = useQuasar();
const inventarioStore = useInventarioAreaStore();
const { inventario, modalAmpliacion } = storeToRefs(inventarioStore);
const loading = ref(false);
const ampliacionObj = ref({
  ampliacion: 0,
  oficio: null,
});

const props = defineProps({
  encabezadoId: {
    type: Number,
    required: true,
  },
});

const onSubmit = async () => {
  loading.value = true;
  const bodyFormData = new FormData();
  bodyFormData.append("Ampliacion", ampliacionObj.value.ampliacion);
  bodyFormData.append("Oficio", ampliacionObj.value.oficio);
  const resp = await inventarioStore.ampliarVigencia(
    inventario.value.id,
    bodyFormData,
    props.encabezadoId
  );
  if (resp.success) {
    loading.value = false;
    $q.notify({
      type: "positive",
      message: resp.data,
    });
    actualizarModal();
  } else {
    loading.value = false;
    $q.notify({
      type: "negative",
      message: resp.data,
    });
  }
};

const actualizarModal = () => {
  ampliacionObj.value.ampliacion = null;
  ampliacionObj.value.oficio = null;
  inventarioStore.actualizarModalAmpliacion(false);
};
</script>
