<template>
  <div class="row">
    <div class="col">
      <q-table
        :visible-columns="visible_Columns"
        :rows="props.tipo == 0 ? misSolicitudes : solicitudesArea"
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
                <q-btn
                  v-if="tipo == 1"
                  flat
                  round
                  color="purple-ieen"
                  icon="visibility"
                  @click="ver(col.value)"
                >
                  <q-tooltip>ver registro</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="tipo == 1 && props.row['estatus'] != 'Aprobado'"
                  flat
                  round
                  color="purple-ieen"
                  icon="check_circle"
                  @click="aprobar(col.value)"
                >
                  <q-tooltip>Aprobar</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="tipo == 1 && props.row['estatus'] != 'Aprobado'"
                  flat
                  round
                  color="purple-ieen"
                  icon="cancel"
                  @click="rechazar(col.value)"
                >
                  <q-tooltip>Rechazar</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="tipo == 1 && props.row['estatus'] == 'Aprobado'"
                  flat
                  round
                  color="purple-ieen"
                  icon="folder_open"
                  @click="verAceptado(col.value)"
                >
                  <q-tooltip>Ver documentos</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="tipo == 0"
                  flat
                  round
                  color="purple-ieen"
                  icon="edit"
                  @click="editar(col.value)"
                >
                  <q-tooltip>Editar registro</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="tipo == 0"
                  flat
                  round
                  color="purple-ieen"
                  icon="delete"
                  @click="eliminar(col.value)"
                >
                  <q-tooltip>Eliminar registro</q-tooltip>
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
import { onMounted, ref, defineProps } from "vue";
import { useAuthStore } from "../../../stores/auth_store";
import { useRouter } from "vue-router";
import { useCedulaPrestamoStore } from "../../../stores/cedula_prestamo_store";
import { useDetalleCedulaPrestamoStore } from "../../../stores/detalle_cedula_prestamo";
import { espera } from "../../../helpers/helper";

const $q = useQuasar();
const router = useRouter();
const cedulaPrestamoStore = useCedulaPrestamoStore();
const detallePrestamoStore = useDetalleCedulaPrestamoStore();
const authStore = useAuthStore();
const { modulo } = storeToRefs(authStore);
const { misSolicitudes, solicitudesArea, isLoading } =
  storeToRefs(cedulaPrestamoStore);
const loading = ref(false);

const props = defineProps({
  tipo: {
    type: Number,
    required: true,
    default: 0,
  },
  clasificado: Boolean,
});
const columns = [
  {
    name: "folio_Solicitud",
    align: "center",
    label: "Folio solicitud",
    field: "folio_Solicitud",
    sortable: true,
  },
  {
    name: "folio",
    align: "center",
    label: "Folio préstamo",
    field: "folio",
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
    name: "area_Solicitante",
    align: "center",
    label: "Área solicitante",
    field: "area_Solicitante",
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
    name: "fecha_Prestamo",
    align: "center",
    label: "Fecha prestamo",
    field: "fecha_Prestamo",
    sortable: true,
  },
  {
    name: "fecha_Devolucion",
    align: "center",
    label: "Fecha devolución",
    field: "fecha_Devolucion",
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
    name: "fisico",
    align: "center",
    label: "Fisico",
    field: "fisico",
    sortable: true,
  },
  {
    name: "digital",
    align: "center",
    label: "Digital",
    field: "digital",
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

const visible_Columns = [
  "folio_Solicitud",
  "folio",
  "area_Responsable",
  "area_Solicitante",
  "solicitante",
  "fecha_Prestamo",
  "fecha_Devolucion",
  "estatus",
  "id",
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
  await espera();
  cedulaPrestamoStore.updateEditar(true);
  await cedulaPrestamoStore.loadPrestamo(id);
  await detallePrestamoStore.loadDetalles(id);
  $q.loading.hide();
  cedulaPrestamoStore.actualizarModalEditar(true);
};

const ver = async (id) => {
  $q.loading.show();
  await espera();
  await cedulaPrestamoStore.loadPrestamo(id);
  await detallePrestamoStore.loadDetalles(id);
  $q.loading.hide();
  cedulaPrestamoStore.actualizarModalVer(true);
};

const verAceptado = async (id) => {
  $q.loading.show();
  await espera();
  $q.loading.hide();
  router.push({
    name: "prestamoAceptado",
    params: { encabezadoId: id },
  });
};

const eliminar = async (id) => {
  $q.dialog({
    title: "Eliminación de registro",
    message: "¿Esta seguro de eliminar el registro?",
    icon: "Warning",
    persistent: true,
    transitionShow: "scale",
    transitionHide: "scale",
    ok: {
      color: "positive",
      label: "Sí! eliminar",
    },
    cancel: {
      color: "negative",
      label: "Cancelar",
    },
  }).onOk(async () => {
    $q.loading.show();
    const resp = await cedulaPrestamoStore.deleteCedulaPrestamo(id);
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
    icon: "Warning",
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
    const resp = await cedulaPrestamoStore.aprobar(id, props.clasificado);
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

const rechazar = async (id) => {
  $q.dialog({
    title: "Rechazar registro",
    message: "¿Esta seguro de rechazar el registro?, Describe el motivo",
    icon: "Warning",
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
    const resp = await cedulaPrestamoStore.rechazar(
      id,
      motivo,
      props.clasificado
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
