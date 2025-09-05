<template>
  <div class="row">
    <div class="col">
      <q-table
        :rows="encabezadosAreaFiltro"
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
            :options="areas"
            label="Área generadora"
            style="width: 25%"
            class="q-mr-sm"
          >
          </q-select>
          <q-select
            v-model="anio"
            :options="anioLista"
            label="Áño"
            style="width: 25%"
          >
          </q-select>

          <q-space></q-space>
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
                  flat
                  round
                  color="purple-ieen"
                  icon="cached"
                  @click="ver(col.value)"
                >
                  <q-tooltip>ver registro</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="purple-ieen"
                  icon="visibility"
                  @click="ver(col.value)"
                >
                  <q-tooltip>ver registro</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="purple-ieen"
                  icon="content_paste"
                  @click="toDetalle(col.value)"
                >
                  <q-tooltip>Detalle</q-tooltip>
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
import { storeToRefs } from "pinia";
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useEncabezadoInventarioStore } from "../../../stores/encabezado_inventario_area";
import { useAreaStore } from "../../../stores/areas_store";
import { useAuthStore } from "../../../stores/auth_store";
import { espera } from "../../../helpers/helper";

const $q = useQuasar();
const router = useRouter();
const encabezadoInventariosStore = useEncabezadoInventarioStore();
const areaStore = useAreaStore();
const authStore = useAuthStore();
const { modulo } = storeToRefs(authStore);
const { encabezadosAreaFiltro, loadindg } = storeToRefs(
  encabezadoInventariosStore
);
const { areas } = storeToRefs(areaStore);
const areasLista = ref({ value: 0, label: "Ver todos" });
const anioLista = ref([]);
const anio = ref("Ver todos");

onMounted(() => {
  cargarDatos();
});

const cargarDatos = async () => {
  await encabezadoInventariosStore.loadEncabezadosAll();
  await areaStore.loadListaAreas();
  await cargarAños();
};

const cargarAños = async () => {
  let hoy = new Date();
  let año = parseInt(hoy.getFullYear());
  for (let i = 1993; i <= año; i++) {
    anioLista.value.push(i);
  }
  anioLista.value.push("Ver todos");
  anioLista.value.reverse();
  areas.value.unshift({ value: 0, label: "Ver todos" });
};

watch(areasLista, (val) => {
  if (val.label != "Ver todos") {
    console.log;
    let textoArea = val.label.split("-");
    cargarFiltros(textoArea[1].trim(), anio.value);
  } else {
    cargarFiltros(val.label, anio.value);
  }
});

watch(anio, (val) => {
  if (areasLista.value.label != "Ver todos") {
    console.log;
    let textoArea = areasLista.value.label.split("-");
    cargarFiltros(textoArea[1].trim(), val);
  } else {
    cargarFiltros(areasLista.value.label, val);
  }
});

const cargarFiltros = async (area, anio) => {
  $q.loading.show();
  await encabezadoInventariosStore.loadEncabezadoAllFiltro(area, anio);
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
    name: "ano",
    align: "center",
    label: "Año",
    field: "ano",
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
    label: "Área generadora",
    field: "area_Generadora",
    sortable: true,
  },
  {
    name: "enlace",
    align: "center",
    label: "Enlace",
    field: "enlace",
    sortable: true,
  },
  {
    name: "valido",
    align: "center",
    label: "Validó",
    field: "valido",
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
    name: "supervisa",
    align: "center",
    label: "Supervisa",
    field: "supervisa",
    sortable: true,
  },
  {
    name: "nombre",
    align: "center",
    label: "nombre",
    field: "nombre",
    sortable: true,
  },
  {
    name: "fecha_Registro",
    align: "center",
    label: "Fecha registro",
    field: "fecha_Registro",
    sortable: true,
  },
  {
    name: "fecha_Registro",
    align: "center",
    label: "Fecha registro",
    field: "fecha_Registro",
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
const ver = async (id) => {
  $q.loading.show();
  await encabezadoInventariosStore.loadEncabezado(id);
  await areaStore.loadListaAreas();
  await espera();
  encabezadoInventariosStore.actualizarModalGral(true);
  $q.loading.hide();
};

const toDetalle = (id) => {
  router.push({
    name: "detalleInventarioGral",
    params: {
      encabezadoId: id,
    },
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

