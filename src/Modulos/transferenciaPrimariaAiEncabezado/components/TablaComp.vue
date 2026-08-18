<template>
  <div class="row">
    <div class="col">
      <q-table
        dense
        :rows="encabezadosAiFiltro"
        :columns="columns"
        :filter="filter"
        :loading="loadindg"
        row-key="id"
        rows-per-page-label="Filas por pagina"
        no-data-label="No hay transferencias primarias AI registradas."
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
import { useTransferenciaPrimariaEncabezadoStore } from "../../../stores/transferencia_primaria_encabezado_store";
import { onBeforeMount, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

const $q = useQuasar();
const authStore = useAuthStore();
const transferenciaPrimariaStore = useTransferenciaPrimariaEncabezadoStore();
const router = useRouter();
const { modulo } = storeToRefs(authStore);
const { encabezadosAi, isLoading, encabezadosAiFiltro, listaAreasGeneradoras } =
  storeToRefs(transferenciaPrimariaStore);
const areasLista = ref("Ver todos");
onBeforeMount(() => {
  transferenciaPrimariaStore.loadEncabezadosAi();
});

const columns = [
  {
    name: "numero_Transferencia",
    align: "center",
    label: "No. Transferencia",
    field: "numero_Transferencia",
    sortable: true,
  },
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
    label: "Nombre",
    field: "nombre",
    sortable: true,
  },
  {
    name: "area_Responsable",
    align: "center",
    label: "Área responsable",
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
    name: "fecha_Registro",
    align: "center",
    label: "Fecha registro",
    field: "fecha_Registro",
    sortable: true,
  },
  {
    name: "enlace",
    align: "center",
    label: "Elaboró",
    field: "enlace",
    sortable: true,
  },
  {
    name: "valida_Area",
    align: "center",
    label: "Valida (Responsable de area)",
    field: "valida_Area",
    sortable: true,
  },
  {
    name: "coteja",
    align: "center",
    label: "Coteja",
    field: "coteja",
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
  await transferenciaPrimariaStore.loadEncabezado(id);
  $q.loading.hide();
  transferenciaPrimariaStore.actualizarModalAI(true);
};

const toCajas = (id) => {
  router.push({
    name: "cajasTransferenciasAI",
    params: { transferenciaId: id },
  });
};

watch(areasLista, (newValue) => {
  cargaDatos(newValue);
});

const cargaDatos = async (dato) => {
  $q.loading.show();
  await transferenciaPrimariaStore.loadEncabezadosAiFiltro(dato);
  $q.loading.hide();
};
</script>