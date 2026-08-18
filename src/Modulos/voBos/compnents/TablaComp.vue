<template>
  <div class="row">
    <div class="col">
      <q-table
        :rows="vistos_buenos"
        :columns="columns"
        :filter="filter"
        :loading="loading"
        row-key="id"
        rows-per-page-label="Filas por pagina"
        no-data-label="No hay vistos buenos registrados. Usa &quot;Nuevo&quot; para crear el primero."
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
                  v-if="modulo.actualizar"
                  flat
                  round
                  color="purple-ieen"
                  icon="edit"
                  @click="editar(col.value)"
                >
                  <q-tooltip>Editar registro</q-tooltip>
                </q-btn>
                <BtnEliminar
                  v-if="modulo.eliminar"
                  label="Eliminar visto bueno"
                  titulo="Eliminar visto bueno"
                  :mensaje="mensajeEliminar(props.row)"
                  @confirmado="eliminarVoBo(col.value)"
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
import { useVistosBuenosStore } from "../../../stores/visto_bueno_store";
import { useAuthStore } from "../../../stores/auth_store";
import BtnEliminar from "../../../components/BtnEliminar.vue";

import { espera } from "../../../helpers/helper";

const $q = useQuasar();
const vistoStore = useVistosBuenosStore();
const authStore = useAuthStore();
const { modulo } = storeToRefs(authStore);
const { vistos_buenos, loading } = storeToRefs(vistoStore);

onMounted(() => {
  vistoStore.loadVoBos();
});

const columns = [
  {
    name: "empleado",
    align: "center",
    label: "Empleado",
    field: "empleado",
    sortable: true,
  },
  {
    name: "activo_String",
    align: "center",
    label: "Estatus",
    field: "activo_String",
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

const editar = async (id) => {
  $q.loading.show();
  vistoStore.initVbo();
  await vistoStore.loadVoBo(id);
  $q.loading.hide();
};

const mensajeEliminar = (row) => `¿Eliminar el visto bueno de "${row.empleado}"?`;

const eliminarVoBo = async (id) => {
  $q.loading.show();
  const resp = await vistoStore.deleteSerie(id);
  $q.loading.hide();
  $q.notify({ type: resp.success ? "positive" : "negative", message: resp.data });
};
</script>