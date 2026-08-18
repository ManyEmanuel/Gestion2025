<template>
  <q-dialog
    v-model="modalVerAmpliacion"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card flat bordered style="width: 800px; max-width: 80vw">
      <q-card-section class="row">
        <h2 class="text-h6">
          Registro de ampliación de vigencia del inventario
          {{ inventario.clave_Clasificacion }}
        </h2>
        <q-space />
        <q-btn
          icon="close"
          @click="actualizarModal()"
          flat
          round
          dense
          v-close-popup
        aria-label="Cerrar" />
      </q-card-section>
      <q-card-section>
        <q-form class="row q-col-gutter-xs" @submit="onSubmit">
          <div class="col-12 col-xs-6 col-md-3">
            <q-input
              v-model="inventario.total_Ampliacion"
              readonly
              type="Number"
              label="Ampliación"
              hint="ingrese años de ampliación"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-3">
            <q-btn
              flat
              round
              color="purple-ieen"
              size="30px"
              icon="preview"
              @click="ver"
            
  aria-label="Ver archivo"
>
              <q-tooltip>Ver archivo</q-tooltip>
            </q-btn>
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
import { storeToRefs } from "pinia";
import { useQuasar } from "quasar";
import { ref } from "vue-demi";
import { useInventarioAreaStore } from "../../../stores/inventario_area_store";
import { useAdjuntoInventarioStore } from "../../../stores/adjunto_inventario_store";
import BtnCancelar from "../../../components/BtnCancelar.vue";

const $q = useQuasar();
const inventarioStore = useInventarioAreaStore();
const adjuntoStore = useAdjuntoInventarioStore();
const { inventario, modalVerAmpliacion } = storeToRefs(inventarioStore);
const loading = ref(false);
const size = "md";
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

const ver = async () => {
  $q.loading.show();
  await adjuntoStore.loadAdjuntoOficioInventarioArea(inventario.value.id);
  adjuntoStore.actualizarViewer(true);
  $q.loading.hide();
};

const actualizarModal = () => {
  ampliacionObj.value.ampliacion = null;
  ampliacionObj.value.oficio = null;
  inventarioStore.actualizarModalVerAmpliacion(false);
};
</script>
