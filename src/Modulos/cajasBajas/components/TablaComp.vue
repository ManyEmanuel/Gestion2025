<template>
  <div class="row">
    <div class="col">
      <q-table
        :rows="cajas"
        :columns="columns"
        :filter="filter"
        :loading="loadindg"
        row-key="id"
        rows-per-page-label="Filas por pagina"
        no-data-label="No hay registros"
        class="my-sticky-last-column-table"
      >
        <template v-slot:top>
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
                  v-if="
                    modulo == null
                      ? false
                      : modulo.actualizar && props.row.estatus != 'Afectado'
                  "
                  flat
                  round
                  color="purple-ieen"
                  icon="edit"
                  @click="editar(col.value)"
                >
                  <q-tooltip>Editar registro</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="modulo == null ? false : modulo.actualizar"
                  flat
                  round
                  color="purple-ieen"
                  icon="description"
                  @click="anexo_13(col.value)"
                >
                  <q-tooltip>Anexo 13</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="
                    modulo == null
                      ? false
                      : modulo.eliminar && props.row.estatus != 'Afectado'
                  "
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
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../../../stores/auth_store";
import { genera_anexo_13 } from "../../../helpers/anexo_13";
import { useCajaBajaDocumentalStore } from "../../../stores/caja_baja_documental";
import { onBeforeMount, ref } from "vue";
import { useDetalleCajaBajaStore } from "../../../stores/detalle_caja_baja_store";
import { espera } from "../../../helpers/helper";
import { useBajaDocumentalStore } from "src/stores/baja_documental_store";

const $q = useQuasar();
const authStore = useAuthStore();
const cajaBajaStore = useCajaBajaDocumentalStore();
const detalleCajaBaja = useDetalleCajaBajaStore();
const bajaStore = useBajaDocumentalStore();
const { modulo } = storeToRefs(authStore);
const { cajas, isLoading, caja } = storeToRefs(cajaBajaStore);
const { arrayDetalles, detalles } = storeToRefs(detalleCajaBaja);
const { encabezados, encabezado } = storeToRefs(bajaStore);

const props = defineProps({
  bajaId: Number,
});

onBeforeMount(() => {
  cajaBajaStore.loadCajas(props.bajaId);
});

const columns = [
  {
    name: "no_Caja",
    align: "center",
    label: "No. Caja",
    field: "no_Caja",
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
    name: "seccion",
    align: "center",
    label: "Sección",
    field: "seccion",
    sortable: true,
  },
  {
    name: "peso",
    align: "center",
    label: "Peso (Kilogramos)",
    field: "peso",
    sortable: true,
  },
  {
    name: "total_Expedientes",
    align: "center",
    label: "Total de expedientes",
    field: "total_Expedientes",
    sortable: true,
  },
  {
    name: "total_Paginas",
    align: "center",
    label: "Total hojas",
    field: "total_Paginas",
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
  cajaBajaStore.updateEditar(true);
  await cajaBajaStore.loadCaja(id);
  await espera();
  cajaBajaStore.actualizarModal(true);
  $q.loading.hide();
};

const anexo_13 = async (id) => {
  $q.loading.show();
  await cajaBajaStore.loadCaja(id);
  await detalleCajaBaja.load_detalles(id);
  let transferencia = encabezado.value.no_Transferencia;
  let area = encabezado.value.area_Generadora;
  let Nocaja = caja.value.no_Caja;
  genera_anexo_13("Baja", transferencia, area, Nocaja, detalles.value);

  $q.loading.hide();
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
    const resp = await cajaBajaStore.deleteCaja(id, props.bajaId);
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
