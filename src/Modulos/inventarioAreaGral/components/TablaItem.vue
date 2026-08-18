<template>
  <div class="row">
    <div class="col">
      <q-table
        dense
        :rows="inventarios"
        :columns="columns"
        :visible-columns="visibleColumns"
        :filter="filter"
        :loading="loading"
        row-key="id"
        rows-per-page-label="Filas por pagina"
        no-data-label="No hay expedientes registrados en este inventario. Usa el botón Nuevo para agregar el primero."
        class="my-sticky-last-column-table"
      >
        <template v-slot:top>
          <q-checkbox
            v-model="selected"
            color="purple-ieen"
            label="Seleccionar todos"
          />
          <q-select
            v-model="columnasAdicionales"
            :options="columnasOpcionales"
            emit-value
            map-options
            multiple
            dense
            outlined
            use-chips
            options-dense
            label="Columnas"
            class="q-ml-md"
            style="min-width: 260px; max-width: 420px"
          />
          <q-space />
          <q-input
            borderless
            dense
            debounce="300"
            v-model="filter"
            placeholder="Buscar.."
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              <div v-if="col.name === 'Seleccion'">
                <q-checkbox v-model="props.row.Seleccion" color="purple-ieen" />
              </div>
              <div v-else-if="col.name === 'id'">
                <q-btn
                  flat
                  round
                  color="purple-ieen"
                  icon="visibility"
                  @click="ver(col.value)"
                
  aria-label="ver registro"
>
                  <q-tooltip>ver registro</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="purple-ieen"
                  icon="file_present"
                  @click="verAdjuntos(col.value)"
                
  aria-label="Ver adjuntos"
>
                  <q-tooltip>Ver adjuntos</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="props.row['estatus'] == 'Rechazado'"
                  flat
                  round
                  color="positive"
                  icon="check_circle"
                  @click="aprobar(col.value)"
                
  aria-label="Aprobar"
>
                  <q-tooltip>Aprobar</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="props.row['estatus'] == 'Aprobado'"
                  flat
                  round
                  color="negative"
                  icon="cancel"
                  @click="rechazar(col.value)"
                
  aria-label="Rechazar"
>
                  <q-tooltip>Rechazar</q-tooltip>
                </q-btn>
              </div>
              <label v-else>{{ col.value }}</label>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>
</template>
<script setup>
import { storeToRefs } from "pinia";
import { useQuasar } from "quasar";
import { computed, onBeforeMount, ref, watch } from "vue";
import { useInventarioAreaStore } from "../../../stores/inventario_area_store";
import { useAdjuntoInventarioStore } from "../../../stores/adjunto_inventario_store";
import { useAuthStore } from "../../../stores/auth_store";

const props = defineProps({
  encabezadoId: {
    type: Number,
    required: true,
  },
});

const $q = useQuasar();
const inventarioStore = useInventarioAreaStore();
const adjuntoStore = useAdjuntoInventarioStore();
const authStore = useAuthStore();
const selected = ref(false);
const { modulo } = storeToRefs(authStore);
const { inventarios, loading } = storeToRefs(inventarioStore);
onBeforeMount(() => {
  inventarioStore.loadInventarios(props.encabezadoId);
});

// Selector de columnas: "Seleccion" y "id" (acciones) siempre están visibles;
// el resto lo elige el usuario. Por defecto se muestra un subconjunto reducido
// en vez de las 24 columnas completas.
const columnasOpcionales = [
  { label: "Estatus", value: "estatus" },
  { label: "Sección", value: "seccion" },
  { label: "Serie", value: "serie" },
  { label: "SubSerie", value: "sub_Serie" },
  { label: "Clave de clasificación", value: "clave_Clasificacion" },
  { label: "Nombre expediente", value: "nombre_Expediente" },
  { label: "No. expediente interno", value: "no_Expediente_Interno" },
  { label: "Descripción/Observaciones", value: "descripcion" },
  { label: "Fecha inicio", value: "fecha_Inicio" },
  { label: "Fecha término", value: "fecha_Termino" },
  { label: "Ubicación física", value: "ubicacion" },
  { label: "Valor documental", value: "valor_Documental" },
  { label: "Vigencia trámite", value: "vigencia_Tramite" },
  { label: "Vigencia concentración", value: "vigencia_Concentracion" },
  { label: "Vigencia completa", value: "vigencia_Completa" },
  { label: "Destino final", value: "disposicion_Documental" },
  { label: "Fecha clasificación", value: "fecha_Clasificacion" },
  { label: "Fecha desclasificación", value: "fecha_Desclasificacion" },
  { label: "Fecha ampliación", value: "fecha_Ampliacion" },
  { label: "Motivo de rechazo", value: "motivo_Rechazo" },
  { label: "Clasificado", value: "clasificado_Texto" },
  { label: "Total páginas", value: "total_Paginas" },
];
const columnasAdicionales = ref([
  "estatus",
  "clave_Clasificacion",
  "nombre_Expediente",
  "no_Expediente_Interno",
  "fecha_Inicio",
  "disposicion_Documental",
]);
const visibleColumns = computed(() => [
  "Seleccion",
  "id",
  ...columnasAdicionales.value,
]);

const ver = async (id) => {
  $q.loading.show();
  await inventarioStore.loadInventario(id);
  $q.loading.hide();
  inventarioStore.actualizarModalVer(true);
};

const verAdjuntos = async (id) => {
  $q.loading.show();
  await adjuntoStore.loadAdjuntos(id);
  $q.loading.hide();
  adjuntoStore.actualizarModalVer(true);
};

watch(selected, (val) => {
  inventarios.value.forEach((item) => {
    item.Seleccion = val;
  });
});

const rechazar = async (id) => {
  $q.dialog({
    title: "Rechazar registro",
    message: "¿Esta seguro de rechazar el registro?, Describe el motivo",
    icon: "warning",
    persistent: true,
    transitionShow: "scale",
    transitionHide: "scale",
    ok: {
      color: "positive",
      label: "Sí! rechazar",
    },
    cancel: {
      color: "negative",
      label: "Cancelar",
    },
    prompt: {
      model: "",
      type: "text", // optional
    },
  }).onOk(async (motivo) => {
    $q.loading.show();
    const resp = await inventarioStore.rechazarInventario(
      id,
      props.encabezadoId,
      motivo
    );
    if (resp.success) {
      $q.loading.hide();
      $q.notify({
        type: "positive",
        message: resp.data,
      });
    } else {
      $q.loading.hide();
      $q.notify({
        type: "negative",
        message: resp.data,
      });
    }
  });
};

const aprobar = async (id) => {
  $q.dialog({
    title: "Aprobar registro",
    message: "¿Esta seguro de aprobar el registro?",
    icon: "warning",
    persistent: true,
    transitionShow: "scale",
    transitionHide: "scale",
    ok: {
      color: "positive",
      label: "Sí! aprobar",
    },
    cancel: {
      color: "negative",
      label: "Cancelar",
    },
  }).onOk(async () => {
    $q.loading.show();
    const resp = await inventarioStore.aprobarInventario(
      id,
      props.encabezadoId
    );
    if (resp.success) {
      $q.loading.hide();
      $q.notify({
        type: "positive",
        message: resp.data,
      });
    } else {
      $q.loading.hide();
      $q.notify({
        type: "negative",
        message: resp.data,
      });
    }
  });
};

const columns = [
  {
    name: "Seleccion",
    align: "center",
    label: "Seleccionado",
    field: "Seleccion",
    sortable: false,
  },
  {
    name: "estatus",
    align: "center",
    label: "Estatus",
    field: "estatus",
    sortable: false,
  },
  {
    name: "seccion",
    align: "center",
    label: "Sección",
    field: "seccion",
    sortable: false,
  },
  {
    name: "serie",
    align: "center",
    label: "Serie",
    field: "serie",
    sortable: false,
  },
  {
    name: "sub_Serie",
    align: "center",
    label: "SubSerie",
    field: "sub_Serie",
    sortable: false,
  },
  {
    name: "clave_Clasificacion",
    align: "center",
    label: "Clave de clasificacion",
    field: "clave_Clasificacion",
    sortable: false,
  },
  {
    name: "nombre_Expediente",
    align: "left",
    label: "Nombre expediente",
    field: "nombre_Expediente",
    sortable: false,
  },
  {
    name: "no_Expediente_Interno",
    align: "center",
    label: "No. Expediente interno",
    field: "no_Expediente_Interno",
    sortable: false,
  },
  {
    name: "descripcion",
    align: "left",
    label: "Descripción/Observaciones",
    field: "descripcion",
    sortable: false,
  },
  {
    name: "fecha_Inicio",
    align: "center",
    label: "Fecha inicio",
    field: "fecha_Inicio",
    sortable: false,
  },
  {
    name: "fecha_Termino",
    align: "center",
    label: "Fecha termino",
    field: "fecha_Termino",
    sortable: false,
  },
  {
    name: "ubicacion",
    align: "left",
    label: "Ubicación fisica",
    field: "ubicacion",
    sortable: false,
  },
  {
    name: "valor_Documental",
    align: "center",
    label: "Valor documental",
    field: "valor_Documental",
    sortable: false,
  },
  {
    name: "vigencia_Tramite",
    align: "center",
    label: "Vigencia tramite",
    field: "vigencia_Tramite",
    sortable: false,
  },
  {
    name: "vigencia_Concentracion",
    align: "center",
    label: "Vigencia concentración",
    field: "vigencia_Concentracion",
    sortable: false,
  },
  {
    name: "vigencia_Completa",
    align: "center",
    label: "Vigencia completa",
    field: "vigencia_Completa",
    sortable: false,
  },
  {
    name: "disposicion_Documental",
    align: "center",
    label: "Destino final",
    field: "disposicion_Documental",
    sortable: false,
  },
  {
    name: "fecha_Clasificacion",
    align: "center",
    label: "Fecha clasificación",
    field: "fecha_Clasificacion",
    sortable: false,
  },
  {
    name: "fecha_Desclasificacion",
    align: "center",
    label: "Fecha desclasificación",
    field: "fecha_Desclasificacion",
    sortable: false,
  },
  {
    name: "fecha_Ampliacion",
    align: "center",
    label: "Fecha ampliación",
    field: "fecha_Ampliacion",
    sortable: false,
  },
  {
    name: "motivo_Rechazo",
    align: "left",
    label: "Motivo de rechazo",
    field: "motivo_Rechazo",
    sortable: false,
  },
  {
    name: "clasificado_Texto",
    align: "center",
    label: "Clasificado",
    field: "clasificado_Texto",
    sortable: false,
  },
  {
    name: "total_Paginas",
    align: "center",
    label: "Total paginas",
    field: "total_Paginas",
    sortable: false,
  },
  {
    name: "id",
    align: "center",
    label: "Acciones",
    field: "id",
    sortable: false,
  },
];
</script>