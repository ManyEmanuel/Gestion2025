<template>
  <div class="row">
    <div class="col">
      <q-table
        :rows="encabezadosFiltro"
        :columns="columns"
        :filter="filter"
        :loading="loadindg"
        row-key="id"
        rows-per-page-label="Filas por pagina"
        no-data-label="No hay registros"
        class="my-sticky-last-column-table"
      >
        <template v-slot:top>
          <q-select
            v-model="areasLista"
            :options="listaAreasGeneradoras"
            label="Área generadora"
            style="width: 25%"
            class="q-mr-sm"
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
              <div v-if="col.name === 'id'">
                <q-btn
                  v-if="modulo == null ? false : modulo.actualizar"
                  flat
                  round
                  color="purple-ieen"
                  icon="visibility"
                  @click="ver(col.value)"
                >
                  <q-tooltip>Ver registro</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="modulo == null ? false : modulo.leer"
                  flat
                  round
                  color="purple-ieen"
                  icon="content_paste"
                  @click="toCajas(col.value)"
                >
                  <q-tooltip>Cajas</q-tooltip>
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
import { useQuasar } from "quasar";
import { useAuthStore } from "../../../stores/auth_store";
import { useBajaDocumentalStore } from "../../../stores/baja_documental_store";
import { onBeforeMount, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { espera } from "../../../helpers/helper";

const $q = useQuasar();
const authStore = useAuthStore();
const bajaStore = useBajaDocumentalStore();
const router = useRouter();
const { modulo } = storeToRefs(authStore);
const {
  encabezados,
  isLoading,
  encabezado,
  encabezadosFiltro,
  listaAreasGeneradoras,
} = storeToRefs(bajaStore);
const areasLista = ref("Ver todos");
onBeforeMount(() => {
  bajaStore.loadEncabezados();
});

watch(areasLista, (newValue) => {
  cargaDatos(newValue);
});

const cargaDatos = async (dato) => {
  $q.loading.show();
  await bajaStore.loadEncabezadosFiltro(dato);
  $q.loading.hide();
};

const columns = [
  {
    name: "estatus",
    align: "center",
    label: "Estatus",
    field: "estatus",
    sortable: true,
  },
  {
    name: "nombre",
    align: "center",
    label: "Nombre de Transferencia",
    field: "nombre",
    sortable: true,
  },
  {
    name: "no_Transferencia",
    align: "center",
    label: "No. Transferencia",
    field: "no_Transferencia",
    sortable: true,
  },
  {
    name: "area_Responsable",
    align: "center",
    label: "Area responsable",
    field: "area_Responsable",
    sortable: true,
  },
  {
    name: "area_Generadora",
    align: "center",
    label: "Area generadora",
    field: "area_Generadora",
    sortable: true,
  },
  {
    name: "elaboro",
    align: "center",
    label: "Elaboró",
    field: "elaboro",
    sortable: true,
  },
  {
    name: "valida",
    align: "center",
    label: "Valida",
    field: "valida",
    sortable: true,
  },
  {
    name: "visto_Bueno",
    align: "center",
    label: "Visto bueno",
    field: "visto_Bueno",
    sortable: true,
  },
  {
    name: "aprobo",
    align: "center",
    label: "Aprobó",
    field: "aprobo",
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

const filter = ref("");

const pagination = ref({
  //********** */
  page: 1,
  rowsPerPage: 10,
  sortBy: "name",
  descending: false,
});

const ver = async (id) => {
  $q.loading.show();
  await bajaStore.loadEncabezado(id);
  await espera(50);
  $q.loading.hide();
  bajaStore.actualizarModalVer(true);
};

const toCajas = async (id) => {
  await bajaStore.loadEncabezado(id);
  router.push({
    name: "cajasBajas",
    params: { bajaId: id },
  });
};
</script>

<style lang="sass">
.my-sticky-last-column-table

  thead tr:last-child th:last-child
    background-color: #fff

  td:last-child
    background-color: #fff

  th:last-child,
  td:last-child
    position: sticky
    right: 0
    z-index: 1
</style>
