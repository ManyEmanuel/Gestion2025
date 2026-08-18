<template>
  <div class="row">
    <div class="col">
      <q-table
        dense
        :rows="encabezadosFiltro"
        :columns="columns"
        :filter="filter"
        :loading="loadindg"
        row-key="id"
        rows-per-page-label="Filas por pagina"
        no-data-label="No hay transferencias secundarias registradas. Usa &quot;Nuevo&quot; para crear la primera."
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
                
  aria-label="Ver registro"
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
                
  aria-label="Cajas"
>
                  <q-tooltip>Cajas</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="modulo == null ? false : modulo.leer"
                  flat
                  round
                  color="purple-ieen"
                  icon="verified"
                  @click="abrirActos(props.row)"
                
  aria-label="Actos y firma"
>
                  <q-tooltip>Actos y firma</q-tooltip>
                </q-btn>
              </div>
              <label v-else>{{ col.value }}</label>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
    <ActosDialog v-model="mostrarActos" proceso="secundaria" :proceso-id="actoProcesoId" :nombre="actoNombre" />
  </div>
</template>
<script setup>
import { useQuasar } from "quasar";
import { useAuthStore } from "../../../stores/auth_store";
import { useTransferenciaSecundariaEncabezadoStore } from "../../../stores/transferencia_secundaria_encabezado_store";
import { onBeforeMount, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import ActosDialog from "../../../components/ActosDialog.vue";

const mostrarActos = ref(false);
const actoProcesoId = ref(null);
const actoNombre = ref("");
const abrirActos = (row) => { actoProcesoId.value = row.id; actoNombre.value = row.nombre; mostrarActos.value = true; };

const $q = useQuasar();
const authStore = useAuthStore();
const transferenciaSecundariaStore =
  useTransferenciaSecundariaEncabezadoStore();
const router = useRouter();
const { modulo } = storeToRefs(authStore);
const { encabezados, isLoading, encabezadosFiltro, listaAreasGeneradoras } =
  storeToRefs(transferenciaSecundariaStore);
const areasLista = ref("Ver todos");

onBeforeMount(() => {
  // Sincroniza el filtro del store con el default del selector al montar (evita que un filtro previo
  // persista entre montajes); durante la sesión se preserva al crear (createTransferencia → loadEncabezados).
  transferenciaSecundariaStore.areaFiltroActiva = areasLista.value;
  transferenciaSecundariaStore.loadEncabezados();
});

watch(areasLista, (newValue) => {
  cargaDatos(newValue);
});

const cargaDatos = async (dato) => {
  $q.loading.show();
  await transferenciaSecundariaStore.loadEncabezadosFiltro(dato);
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
  await transferenciaSecundariaStore.loadEncabezado(id);
  $q.loading.hide();
  transferenciaSecundariaStore.actualizarModalVer(true);
};

const toCajas = async (id) => {
  await transferenciaSecundariaStore.loadEncabezado(id);
  router.push({
    name: "cajasTranSec",
    params: { transferenciaId: id },
  });
};
</script>
