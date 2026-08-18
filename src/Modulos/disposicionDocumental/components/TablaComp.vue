<template>
  <div class="row">
    <div class="col">
      <q-table
        dense
        :rows="disposiciones"
        :columns="columns"
        :filter="filter"
        row-key="id"
        rows-per-page-label="Filas por pagina"
        no-data-label="No hay disposiciones documentales registradas. Usa el botón Nuevo para crear la primera."
        class="my-sticky-last-column-table"
      >
        <template v-slot:top-right>
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
              <div v-if="col.name === 'id'">
                <q-btn
                  v-if="modulo == null ? false : modulo.actualizar"
                  flat
                  round
                  color="purple-ieen"
                  icon="edit"
                  @click="editar(col.value)"
                >
                  <q-tooltip>Editar registro</q-tooltip>
                </q-btn>
                <BtnEliminar
                  v-if="modulo == null ? false : modulo.eliminar"
                  label="Eliminar disposición"
                  titulo="Eliminar disposición"
                  :mensaje="mensajeEliminar(props.row)"
                  @confirmado="eliminarDisposicion(col.value)"
                />
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
import { onMounted, ref } from "vue";
import { useDisposicionDocStore } from "../../../stores/disposicion_documental_store";
import { useSeccionStore } from "../../../stores/secciones_store";
import { useSeriesStore } from "../../../stores/series_store";
import { useSubSerieStore } from "../../../stores/sub_series_store";
import { useAuthStore } from "../../../stores/auth_store";
import BtnEliminar from "../../../components/BtnEliminar.vue";
const $q = useQuasar();
const disposicionDocStore = useDisposicionDocStore();
const seccionStore = useSeccionStore();
const seriesStore = useSeriesStore();
const subSerieStore = useSubSerieStore();
const authStore = useAuthStore();
const { modulo } = storeToRefs(authStore);

const props = defineProps({
  tipo: {
    required: true,
  },
});

onMounted(() => {
  disposicionDocStore.loadDisposiciones(props.tipo);
});

const columns = [
  {
    name: "seccion",
    align: "center",
    label: "Sección",
    field: "seccion",
    sortable: true,
  },
  {
    name: "serie",
    align: "center",
    label: "Serie",
    field: "serie",
    sortable: true,
  },
  {
    name: "subSerie",
    align: "center",
    label: "SubSerie",
    field: "subSerie",
    sortable: true,
  },
  {
    name: "nombre",
    align: "center",
    label: "Nombre",
    field: "nombre",
    sortable: true,
  },
  {
    name: "valor_Documental",
    align: "center",
    label: "Valor documental",
    field: "valor_Documental",
    sortable: true,
  },
  {
    name: "vigencia_Archivo_Tramite",
    align: "center",
    label: "Vigencia archivo tramite",
    field: "vigencia_Archivo_Tramite",
    sortable: true,
  },
  {
    name: "vigencia_Archivo_Concentracion",
    align: "center",
    label: "Vigencia archivo concentración",
    field: "vigencia_Archivo_Concentracion",
    sortable: true,
  },
  {
    name: "total_Vigencia",
    align: "center",
    label: "Total vigencia",
    field: "total_Vigencia",
    sortable: true,
  },
  {
    name: "disposicion_Documental",
    align: "center",
    label: "Disposicion documental",
    field: "disposicion_Documental",
    sortable: true,
  },
  {
    name: "sistema_Datos_Personales_Nombre",
    align: "center",
    label: "Nombre",
    field: "sistema_Datos_Personales_Nombre",
    sortable: true,
  },
  {
    name: "nivel_Seguridad",
    align: "center",
    label: "Nivel de seguridad",
    field: "nivel_Seguridad",
    sortable: true,
  },
  {
    name: "observaciones",
    align: "center",
    label: "Observaciones",
    field: "observaciones",
    sortable: true,
  },
  {
    name: "id",
    align: "center",
    label: "Acciones",
    field: "id",
    sortable: false,
  },
];

const pagination = ref({
  //********** */
  page: 1,
  rowsPerPage: 10,
  sortBy: "name",
  descending: false,
});

const filter = ref("");

const { disposiciones } = storeToRefs(disposicionDocStore);

const editar = async (id) => {
  $q.loading.show();
  await disposicionDocStore.loadValoresDocumentales();
  await disposicionDocStore.loadNivelesSeguridad();
  await seccionStore.loadListaSecciones();
  disposicionDocStore.updateEditar(true);
  await disposicionDocStore.loadDisposicion(id);
  await seriesStore.loadListaSeries(disposicionDocStore.disposicion.seccion_Id);
  await subSerieStore.loadListaSubSeries(
    disposicionDocStore.disposicion.serie_Id
  );

  $q.loading.hide();
  disposicionDocStore.actualizarModalEditar(true);
};

const mensajeEliminar = (row) => `¿Eliminar la disposición documental de "${row.nombre}"?`;

const eliminarDisposicion = async (id) => {
  $q.loading.show();
  const resp = await disposicionDocStore.deleteDisposicion(id);
  $q.loading.hide();
  $q.notify({ type: resp.success ? "positive" : "negative", message: resp.data });
};
</script>