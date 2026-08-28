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
          <!-- Horizonte-3 #DF-6: alerta no bloqueante de posibles CURP/RFC en nombre/descripción. -->
          <div class="col-12" v-if="hallazgosSensibles.length > 0">
            <q-banner dense rounded class="bg-warning text-white q-mb-sm">
              <template v-slot:avatar>
                <q-icon name="warning" />
              </template>
              Se detectó un posible dato personal sensible ({{ hallazgosSensibles.join(", ") }}) en el
              nombre o descripción. Verifique si el expediente debe clasificarse.
            </q-banner>
          </div>
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
              lazy-rules
              :rules="[
                (val) =>
                  listaSubSeries.length === 0 ||
                  !!val ||
                  'La subserie es requerida (la serie seleccionada tiene subseries)',
              ]"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              v-model="inventario.nombre_Expediente"
              label="Nombre del expediente"
              hint="ingrese nombre del expediente"
              lazy-rules
              :rules="[(val) => !!val || 'El nombre del expediente es requerido']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              v-model="inventario.clave_Clasificacion"
              label="Clave de clasificación"
              hint="ingrese clave de clasificación"
              lazy-rules
              :rules="[(val) => !!val || 'La clave de clasificación es requerida']"
            />
          </div>
          <!-- Horizonte-3 #DF-1: sugerencia de Sección/Serie/Subserie por similitud con expedientes ya
          aprobados. Solo sugiere -- aplicar una sugerencia prellena los selects, que siguen editables. -->
          <div class="col-12" v-if="inventario.nombre_Expediente">
            <q-btn
              flat
              dense
              no-caps
              color="primary"
              icon="auto_awesome"
              label="Sugerir clasificación"
              :loading="sugiriendo"
              @click="sugerirClasificacion"
            />
            <div v-if="sugerencias.length > 0" class="q-gutter-xs q-mt-xs">
              <q-chip
                v-for="(sug, idx) in sugerencias"
                :key="idx"
                clickable
                color="primary"
                text-color="white"
                icon="check"
                @click="aplicarSugerencia(sug)"
              >
                {{ sug.seccionNombre }} / {{ sug.serieNombre }}<template v-if="sug.subSerieNombre"> / {{ sug.subSerieNombre }}</template>
                ({{ Math.round(sug.confianza * 100) }}%)
              </q-chip>
            </div>
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
          <!-- Horizonte-1 #H1: fecha_Clasificacion/Desclasificacion/Ampliacion no se envían a ningún
          endpoint (onSubmit solo manda nivelClasificacion/fundamentoClasificacion/plazoReservaAnios; la
          fecha de clasificación la fija el propio backend al recibir PATCH .../clasificacion). Exigirlas
          aquí inventaría una restricción que el backend no usa -- se dejan sin :rules. -->
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
          <!-- Auditoría SEC-008: clasificar tiene permiso propio (archivo.inventario.clasificar); sin él
               no se ofrecen estos campos, porque el backend rechazaría la clasificación con 403. -->
          <div class="col-12 col-xs-6 col-md-4" v-if="puedeClasificar">
            <q-select
              v-model="nivelClasificacion"
              :options="opciones_nivel_clasificacion"
              emit-value
              map-options
              label="Clasificación de la información"
              hint="LGTAIP: pública, reservada o confidencial"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4" v-if="puedeClasificar && nivelClasificacion !== 1">
            <q-input
              v-model="fundamentoClasificacion"
              label="Fundamento"
              hint="Fundamento legal de la clasificación"
              lazy-rules
              :rules="[(val) => !!val || 'El fundamento es requerido']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4" v-if="puedeClasificar && nivelClasificacion === 2">
            <q-input
              v-model="plazoReservaAnios"
              type="number"
              label="Plazo de reserva (años)"
              hint="Años de reserva de la información"
              lazy-rules
              :rules="[(val) => (!!val && Number(val) > 0) || 'El plazo de reserva es requerido']"
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
import { storeToRefs } from "pinia";
import { computed, ref, toRef, watch } from "vue";
import { useInventarioAreaStore } from "../../../stores/inventario_area_store";
import { useSeccionStore } from "../../../stores/secciones_store";
import { useSeriesStore } from "../../../stores/series_store";
import { useSubSerieStore } from "../../../stores/sub_series_store";
import { useDisposicionDocStore } from "../../../stores/disposicion_documental_store";
import { useAuthStore } from "../../../stores/auth_store";
import BtnCancelar from "../../../components/BtnCancelar.vue";
const $q = useQuasar();
const inventarioStore = useInventarioAreaStore();
const seccionStore = useSeccionStore();
const seriesStore = useSeriesStore();
const subSerieStore = useSubSerieStore();
const disposicionDocStore = useDisposicionDocStore();
const authStore = useAuthStore();
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

// Horizonte-3 #DF-6: alerta no bloqueante de posibles CURP/RFC en nombre/descripción, con debounce
// para no llamar al backend en cada tecla.
const hallazgosSensibles = ref([]);
let debounceDatosSensibles = null;
watch(
  () => [inventario.value.nombre_Expediente, inventario.value.descripcion],
  () => {
    clearTimeout(debounceDatosSensibles);
    debounceDatosSensibles = setTimeout(async () => {
      const resp = await inventarioStore.detectarDatosSensibles(
        inventario.value.nombre_Expediente,
        inventario.value.descripcion
      );
      hallazgosSensibles.value = resp.success ? resp.data : [];
    }, 500);
  }
);

// Horizonte-3 #DF-1: sugerencia de Sección/Serie/Subserie por similitud de nombre.
const sugiriendo = ref(false);
const sugerencias = ref([]);
// Evita que los watch de seccionId/serieId (que resetean los niveles siguientes al cambiar por
// selección manual del usuario) pisen los valores que aplicarSugerencia acaba de fijar.
const aplicandoSugerencia = ref(false);

const sugerirClasificacion = async () => {
  if (!inventario.value.nombre_Expediente) return;
  sugiriendo.value = true;
  const resp = await inventarioStore.sugerirClasificacion(inventario.value.nombre_Expediente);
  sugiriendo.value = false;
  if (resp.success) {
    sugerencias.value = resp.data;
    if (sugerencias.value.length === 0) {
      $q.notify({ type: "info", message: "No se encontraron sugerencias con expedientes aprobados similares." });
    }
  } else {
    $q.notify({ type: "negative", message: resp.data });
  }
};

const aplicarSugerencia = async (sug) => {
  aplicandoSugerencia.value = true;
  $q.loading.show();
  try {
    seccionId.value = { label: sug.seccionNombre, value: sug.seccionId };
    await loadSeries(sug.seccionId);
    serieId.value = { label: sug.serieNombre, value: sug.serieId };
    await loadSubSeries(sug.serieId);
    if (sug.subSerieId) {
      subSerieId.value = { label: sug.subSerieNombre, value: sug.subSerieId };
    }
  } finally {
    $q.loading.hide();
    aplicandoSugerencia.value = false;
  }
};

// Clasificación LGTAIP (Horizonte-0 #2): antes era un checkbox local que nunca se enviaba al backend.
// nivelClasificacion usa los valores enteros del enum NivelClasificacion (1=Publica/2=Reservada/
// 3=Confidencial) tal como los espera PATCH /expedientes/{id}/clasificacion (sin JsonStringEnumConverter).
const opciones_nivel_clasificacion = [
  { label: "Pública", value: 1 },
  { label: "Reservada", value: 2 },
  { label: "Confidencial", value: 3 },
];
// Auditoría SEC-008: el permiso de clasificar dejó de ir junto con el de captura.
const puedeClasificar = computed(() => authStore.tienePermiso("archivo.inventario.clasificar"));
const nivelClasificacion = ref(1);
const fundamentoClasificacion = ref(null);
const plazoReservaAnios = ref(null);

watch(modal, (val) => {
  if (val === true) {
    nivelClasificacion.value = 1;
    fundamentoClasificacion.value = null;
    plazoReservaAnios.value = null;
    hallazgosSensibles.value = [];
    sugerencias.value = [];
  }
});

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
  if (val == null || aplicandoSugerencia.value) return;
  serieId.value = null;
  subSerieId.value = null;
  seriesStore.initListaSeries();
  subSerieStore.initListaSubSerie();
  loadSeries(val.value);
});

watch(serieId, (val) => {
  if (val == null || aplicandoSugerencia.value) return;
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
    if (nivelClasificacion.value !== 1 && resp.id) {
      const respClasificacion = await inventarioStore.clasificarInventario(
        resp.id,
        nivelClasificacion.value,
        fundamentoClasificacion.value,
        plazoReservaAnios.value,
        props.encabezadoId
      );
      if (!respClasificacion.success) {
        $q.notify({
          type: "warning",
          message:
            "El expediente se registró, pero no se pudo aplicar la clasificación: " +
            respClasificacion.data,
        });
      }
    }
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
