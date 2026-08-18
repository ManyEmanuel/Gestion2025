<template>
  <q-dialog
    v-model="modal"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card flat bordered style="width: 800px; max-width: 80vw">
      <q-card-section class="row">
        <div class="text-h6">Disposición documental</div>
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
        <q-form class="row q-col-gutter-xs" @submit="onSubmit">
          <div class="col-12 col-xs-6 col-md-4">
            <q-select
              v-model="seccionId"
              :options="listaSecciones"
              label="Sección"
              hint="Seleccione sección"
              lazy-rules
              :rules="[(val) => !!val || 'La sección es requerida']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-select
              v-model="serieId"
              :options="listaSeries"
              label="Serie"
              hint="Seleccione serie"
              lazy-rules
              :rules="[(val) => !!val || 'La serie es requerida']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-select
              v-model="subSerieId"
              :options="listaSubSeries"
              label="SubSerie"
              hint="Seleccione Subserie"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="disposicion.nombre"
              label="Nombre"
              hint="ingrese nombre"
              lazy-rules
              :rules="[(val) => !!val || 'El nombre es requerido']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-select
              v-model="valorDocumentalId"
              :options="valorDocumental"
              label="Valor documental"
              hint="Seleccione valor documental"
              lazy-rules
              :rules="[(val) => !!val || 'El valor documental es requerido']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="disposicion.vigencia_Archivo_Tramite"
              label="Vigencia archivo tramite"
              type="number"
              hint="ingrese vigencia archivo tramite"
              lazy-rules
              :rules="[(val) => !!val || 'La vigencia es requerida']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="disposicion.vigencia_Archivo_Concentracion"
              label="Vigencia archivo concentración"
              type="number"
              hint="ingrese vigencia archivo concentración"
              lazy-rules
              :rules="[(val) => !!val || 'La vigencia es requerida']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-select
              v-model="disposicionDocumentalId"
              :options="disposicionDocumentalOpt"
              label="Disposición documental"
              hint="Seleccione disposición documental"
              lazy-rules
              :rules="[
                (val) => !!val || 'la disposición documental es requerida',
              ]"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="disposicion.sistema_Datos_Personales_Nombre"
              label="Sistema de datos personales(Nombre)"
              hint="ingrese nombre"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-select
              v-model="nivelSeguridadId"
              :options="NivelSeguridad"
              label="Nivel de seguridad"
              hint="Seleccione nivel de seguridad"
              lazy-rules
              :rules="[(val) => !!val || 'el nivel de seguridad es requerido']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-8">
            <q-input
              v-model="disposicion.observaciones"
              label="Observaciones"
              hint="ingrese observaciones"
              type="textarea"
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
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useDisposicionDocStore } from "../../../stores/disposicion_documental_store";
import { useSeccionStore } from "../../../stores/secciones_store";
import { useSeriesStore } from "../../../stores/series_store";
import { useSubSerieStore } from "../../../stores/sub_series_store";
import BtnCancelar from "../../../components/BtnCancelar.vue";

const $q = useQuasar();
const disposicionDocStore = useDisposicionDocStore();
const seccionStore = useSeccionStore();
const seriesStore = useSeriesStore();
const subSerieStore = useSubSerieStore();

const { isEditar, modal, disposicion, valorDocumental, NivelSeguridad } =
  storeToRefs(disposicionDocStore);

const { listaSecciones } = storeToRefs(seccionStore);
const { listaSeries } = storeToRefs(seriesStore);
const { listaSubSeries } = storeToRefs(subSerieStore);

const seccionId = ref(null);
const serieId = ref(null);
const subSerieId = ref(null);
const valorDocumentalId = ref(null);
const nivelSeguridadId = ref(null);
const disposicionDocumentalId = ref(null);
const disposicionDocumentalOpt = ref([
  "Eliminación",
  "Archivo histórico",
  "Muestreo",
]);

const props = defineProps({
  tipo: {
    required: true,
  },
});

const loading = ref(false);

const actualizarModal = (valor) => {
  disposicionDocStore.actualizarModal(valor);
};

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
  $q.loading.hide();
};

watch(seccionId, async (val) => {
  if (val == null) return;
  serieId.value = null;
  subSerieId.value = null;
  seriesStore.initListaSeries();
  subSerieStore.initListaSubSerie();
  await loadSeries(val.value);
});

watch(serieId, async (val) => {
  if (val == null) return;
  subSerieId.value = null;
  subSerieStore.initListaSubSerie();
  await loadSubSeries(val.value);
});

const onSubmit = async () => {
  let resp = null;
  loading.value = true;
  disposicion.value.seccion_Id = seccionId.value.value;
  disposicion.value.serie_Id = serieId.value.value;
  if (subSerieId.value != null)
    disposicion.value.subSerie_Id = subSerieId.value.value;
  disposicion.value.valor_Documental_Id = valorDocumentalId.value.value;
  disposicion.value.nivel_Seguridad_Id = nivelSeguridadId.value.value;
  // Reset de los flags de destino: el dropdown es la única fuente de verdad al guardar.
  disposicion.value.eliminacion = null;
  disposicion.value.archivo_Historico = null;
  disposicion.value.muestreo = null;
  switch (disposicionDocumentalId.value) {
    case "Eliminación":
      disposicion.value.eliminacion = true;
      break;
    case "Archivo histórico":
      disposicion.value.archivo_Historico = true;
      break;
    case "Muestreo":
      disposicion.value.muestreo = true;
      break;
  }

  if (isEditar.value == true) {
    resp = await disposicionDocStore.updateDisposicion(
      disposicion.value,
      disposicion.value.id
    );
  } else {
    resp = await disposicionDocStore.createDisposicion(disposicion.value);
  }

  if (resp.success) {
    $q.notify({
      type: "positive",
      message: resp.data,
    });
    loading.value = false;
    disposicionDocStore.loadDisposiciones(props.tipo);
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
