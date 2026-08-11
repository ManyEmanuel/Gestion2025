<template>
  <div class="row">
    <div class="col">
      <q-table
        :visible-columns="visible_Columns"
        :rows="misSolicitudes"
        :columns="columns"
        :filter="filter"
        :loading="isLoading"
        row-key="id"
        rows-per-page-label="Filas por pagina"
        no-data-label="No hay registros"
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
                <!-- Corte: el préstamo es inmutable en el backend nuevo (sin update) y su edición/alta
                     usa el picker de concentración/histórico diferido; se deshabilita editar. -->
                <q-btn
                  v-if="false"
                  flat
                  round
                  color="purple-ieen"
                  icon="edit"
                  @click="editar(col.value)"
                >
                  <q-tooltip>Editar registro</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="
                    props.row.estatus === 'Aprobado' &&
                    props.row.habil == true &&
                    props.row.digital == 'Si'
                  "
                  flat
                  round
                  color="purple-ieen"
                  icon="folder_open"
                  @click="verAceptado(col.value, props.row.folio_Solicitud)"
                >
                  <q-tooltip>Ver documento</q-tooltip>
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
import { onMounted, ref } from "vue";
import { useAuthStore } from "../../../stores/auth_store";
import { useRouter } from "vue-router";
import { useSolicitudPrestamoAiStore } from "../../../stores/solicitud_prestamo_ai_store";
import { useDetalleSolicitudAISotre } from "../../../stores/detalle_solicitud_prestamo_ai_store";

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const solicitudPrestamoStore = useSolicitudPrestamoAiStore();
const detalleStore = useDetalleSolicitudAISotre();
const { isLoading, misSolicitudes } = storeToRefs(solicitudPrestamoStore);
const { modulo } = storeToRefs(authStore);

const columns = [
  {
    name: "estatus",
    align: "center",
    label: "Estatus",
    field: "estatus",
    sortable: true,
  },
  {
    name: "folio_Solicitud",
    align: "center",
    label: "Folio solicitud",
    field: "folio_Solicitud",
    sortable: true,
  },
  {
    name: "fecha_Solicitada",
    align: "center",
    label: "Fecha de solicitud",
    field: "fecha_Solicitada",
    sortable: true,
  },
  {
    name: "fecha_Posible_Devolucion",
    align: "center",
    label: "Fecha de devolución",
    field: "fecha_Posible_Devolucion",
    sortable: true,
  },
  {
    name: "formato",
    align: "center",
    label: "Formato solicitado",
    field: "formato",
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
    name: "area_Solicitante",
    align: "center",
    label: "Area solicitante",
    field: "area_Solicitante",
    sortable: true,
  },
  {
    name: "responsable_Area_Solicitante",
    align: "center",
    label: "Responsable de area solicitante",
    field: "responsable_Area_Solicitante",
    sortable: true,
  },
  {
    name: "solicitante",
    align: "center",
    label: "Solicitante",
    field: "solicitante",
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

onMounted(() => {
  solicitudPrestamoStore.loadMisSolicitudes();
});

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
  solicitudPrestamoStore.updateEditar(true);
  await solicitudPrestamoStore.loadSolicitud(id);
  $q.loading.hide();
  solicitudPrestamoStore.updateEditar(true);
  solicitudPrestamoStore.actualizarModal(true);
};

const verAceptado = async (id) => {
  $q.loading.show();
  //await espera();
  $q.loading.hide();
  router.push({
    name: "prestamoInstitucional",
    params: { encabezadoId: id, estatus: "Aprobado" },
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
