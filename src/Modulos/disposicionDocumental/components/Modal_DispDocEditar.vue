<template>
  <q-dialog
    v-model="modalEditar"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card flat bordered style="width: 800px; max-width: 80vw">
      <q-card-section class="row">
        <h2 class="text-h6">Disposición documental</h2>
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
            <q-select
              v-model="seccionIdE"
              :options="listaSecciones"
              label="Sección"
              hint="Seleccione sección"
              lazy-rules
              :rules="[(val) => !!val || 'La sección es requerida']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-select
              v-model="serieIdE"
              :options="listaSeries"
              label="Serie"
              hint="Seleccione serie"
              lazy-rules
              :rules="[(val) => !!val || 'La serie es requerida']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-select
              v-model="subSerieIdE"
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
              v-model="valorDocumentalIdE"
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
              v-model="disposicionDocumentalIdE"
              :options="disposicionDocumentalOptE"
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
              hint="ingrese vigencia archivo tramite"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-select
              v-model="nivelSeguridadIdE"
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
import BtnCancelar from "../../../components/BtnCancelar.vue";
import { useSeriesStore } from "../../../stores/series_store";
import { useSubSerieStore } from "../../../stores/sub_series_store";
import { espera } from "../../../helpers/helper";

const $q = useQuasar();
const disposicionDocStore = useDisposicionDocStore();
const seccionStore = useSeccionStore();
const seriesStore = useSeriesStore();
const subSerieStore = useSubSerieStore();
const Odisposicion = ref({});
const { isEditar, modalEditar, disposicion, valorDocumental, NivelSeguridad } =
  storeToRefs(disposicionDocStore);

const { listaSecciones } = storeToRefs(seccionStore);
const { listaSeries } = storeToRefs(seriesStore);
const { listaSubSeries } = storeToRefs(subSerieStore);

const seccionIdE = ref(null);
const serieIdE = ref(null);
const subSerieIdE = ref(null);
const valorDocumentalIdE = ref(null);
const nivelSeguridadIdE = ref(null);
const disposicionDocumentalIdE = ref(null);
const disposicionDocumentalOptE = ref([
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
let cargaInicial = true;

const actualizarModal = (valor) => {
  disposicionDocStore.actualizarModalEditar(valor);
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

watch(seccionIdE, async (val) => {
  if (cargaInicial == true) return;
  console.log("Entro");
  serieIdE.value = null;
  subSerieIdE.value = null;
  seriesStore.initListaSeries();
  subSerieStore.initListaSubSerie();
  await loadSeries(val.value);
});

watch(serieIdE, async (val) => {
  if (val == null) return;
  subSerieIdE.value = null;
  subSerieStore.initListaSubSerie();
  await loadSubSeries(val.value);
});

watch(disposicion.value, (val) => {
  cargaDisposicion(val);
});

const cargaDisposicion = async (val) => {
  if (val.id != null) {
    cargaInicial = true;
    const valor_Documental_Filtrada = valorDocumental.value.find(
      (x) => x.value == `${val.valor_Documental_Id}`
    );
    valorDocumentalIdE.value = valor_Documental_Filtrada;
    const nivel_Seguridad_Filtrada = NivelSeguridad.value.find(
      (x) => x.value == `${val.nivel_Seguridad_Id}`
    );
    nivelSeguridadIdE.value = nivel_Seguridad_Filtrada;
    if (val.eliminacion == true) {
      disposicionDocumentalIdE.value = "Eliminación";
    }
    if (val.archivo_Historico == true) {
      disposicionDocumentalIdE.value = "Archivo histórico";
    }
    if (val.muestreo == true) {
      disposicionDocumentalIdE.value = "Archivo histórico";
    }
    const Seccion_Id_Filtrada = listaSecciones.value.find(
      (x) => x.value == `${val.seccion_Id}`
    );
    seccionIdE.value = Seccion_Id_Filtrada;
    // TODO(ux-audit): revisar si este delay compensa una transición real o reactividad no otorgada
    await espera();
    const Serie_Id_Filtrada = seriesStore.listaSeries.find(
      (x) => x.value == `${val.serie_Id}`
    );
    serieIdE.value = Serie_Id_Filtrada;
    // TODO(ux-audit): revisar si este delay compensa una transición real o reactividad no otorgada
    await espera();
    if (val.subSerie_Id != null) {
      const subSerie_Id_Filtrada = subSerieStore.listaSubSeries.find(
        (x) => x.value == `${val.subSerie_Id}`
      );
      subSerieIdE.value = subSerie_Id_Filtrada;
    }
    cargaInicial = false;
  }
};

const onSubmit = async () => {
  let resp = null;
  loading.value = true;
  disposicion.value.seccion_Id = seccionIdE.value.value;
  disposicion.value.serie_Id = serieIdE.value.value;
  if (subSerieIdE.value != null)
    disposicion.value.subSerie_Id = subSerieIdE.value.value;
  disposicion.value.valor_Documental_Id = valorDocumentalIdE.value.value;
  disposicion.value.nivel_Seguridad_Id = nivelSeguridadIdE.value.value;
  // Reset de los flags de destino: el dropdown es la única fuente de verdad al guardar.
  disposicion.value.eliminacion = null;
  disposicion.value.archivo_Historico = null;
  disposicion.value.muestreo = null;
  switch (disposicionDocumentalIdE.value) {
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
    actualizarModal(false);
    disposicionDocStore.loadDisposiciones(props.tipo);
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
