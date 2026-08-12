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
                <!-- Corte: editar la caja = agregar expedientes (mientras no esté Afectada). -->
                <q-btn
                  v-if="
                    modulo == null
                      ? false
                      : modulo.actualizar && props.row.estatus != 'Afectada'
                  "
                  flat
                  round
                  color="purple-ieen"
                  icon="edit"
                  @click="editar(col.value)"
                >
                  <q-tooltip>Agregar expedientes</q-tooltip>
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
                <!-- Corte: la caja es inmutable en el backend nuevo (sin delete); se deshabilita. -->
                <q-btn
                  v-if="false"
                  flat
                  round
                  color="purple-ieen"
                  icon="delete"
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
import { onBeforeMount, ref } from "vue";
import { genera_anexo_13 } from "../../../helpers/anexo_13";
import { useTransferenciaSecundariaEncabezadoStore } from "../../../stores/transferencia_secundaria_encabezado_store";
import { useCajaTransferenciaSecundariaterStore } from "../../../stores/caja_transferencia_secundaria_store";
import { useDetalleCajaTransferenciaSecundariaStore } from "../../../stores/detalle_caja_transferencia_secundaria_store";
import { espera } from "../../../helpers/helper";

const $q = useQuasar();
const authStore = useAuthStore();
const transferenciaStore = useTransferenciaSecundariaEncabezadoStore();
const cajaStore = useCajaTransferenciaSecundariaterStore();
const detalleCajaStore = useDetalleCajaTransferenciaSecundariaStore();
const { modulo } = storeToRefs(authStore);
const { encabezado } = storeToRefs(transferenciaStore);
const { cajas, isLoading, caja } = storeToRefs(cajaStore);
const { detalles } = storeToRefs(detalleCajaStore);

const props = defineProps({
  // Corte al backend nuevo: los ids de transferencia secundaria son Guids (string), no enteros.
  transferenciaId: String,
});

onBeforeMount(() => {
  cajaStore.loadCajas(props.transferenciaId);
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
    name: "peso",
    align: "center",
    label: "Peso (Kilogramos)",
    field: "peso",
    sortable: true,
  },
  {
    name: "fecha_Antigua",
    align: "center",
    label: "Año antiguo",
    field: "fecha_Antigua",
    sortable: true,
  },
  {
    name: "fecha_Reciente",
    align: "center",
    label: "Año reciente",
    field: "fecha_Reciente",
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
    name: "id",
    align: "center",
    label: "Acciones",
    field: "id",
    sortable: false,
  },
];

const filter = ref("");

const editar = async (id) => {
  $q.loading.show();
  cajaStore.updateEditar(true);
  await cajaStore.loadCaja(id);
  await detalleCajaStore.load_detalles(id);
  await espera();
  cajaStore.actualizarModal(true);
  $q.loading.hide();
};

// Corte al backend nuevo: el Anexo 13 (cédula por caja, destino Histórico) se genera directamente desde
// los reads migrados (caja + detalle), sin el diálogo de ubicación física legado (no modelado).
const anexo_13 = async (id) => {
  $q.loading.show();
  await cajaStore.loadCaja(id);
  await detalleCajaStore.load_detalles(id);
  let transferencia = encabezado.value.no_Transferencia;
  let area = encabezado.value.area_Generadora;
  let Nocaja = caja.value.no_Caja;
  genera_anexo_13("Historico", transferencia, area, Nocaja, detalles.value);
  $q.loading.hide();
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
