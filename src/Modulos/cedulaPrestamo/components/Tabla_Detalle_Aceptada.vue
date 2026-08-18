<template>
  <div class="row">
    <div class="col">
      <q-table
        :visible-columns="visibleColumns"
        :rows="detalles"
        :columns="columns"
        :filter="filter"
        row-key="id"
        rows-per-page-label="Filas por pagina"
        no-data-label="No hay expedientes registrados en este préstamo."
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
                  v-if="registro.digital == true"
                  flat
                  round
                  color="purple-ieen"
                  icon="file_present"
                  @click="verAdjuntos(props.row['inventario_Id'])"
                
  aria-label="Ver adjuntos"
>
                  <q-tooltip>Ver adjuntos</q-tooltip>
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
import { ref, warn, watch } from "vue";
import { useDetalleCedulaPrestamoStore } from "../../../stores/detalle_cedula_prestamo";
import { useCedulaPrestamoStore } from "../../../stores/cedula_prestamo_store";
import { useAdjuntoInventarioStore } from "../../../stores/adjunto_inventario_store";
import { useInventarioAreaStore } from "../../../stores/inventario_area_store";
const inventarioStore = useInventarioAreaStore();
const $q = useQuasar();
const detalleCedulaStore = useDetalleCedulaPrestamoStore();
const cedulaStore = useCedulaPrestamoStore();
const adjuntoStore = useAdjuntoInventarioStore();
const { detalles } = storeToRefs(detalleCedulaStore);
const { registro } = storeToRefs(cedulaStore);

const columns = [
  {
    name: "inventario_Clave_Clasificacion",
    align: "center",
    label: "Clave de clasificación del expediente",
    field: "inventario_Clave_Clasificacion",
    sortable: true,
  },
  {
    name: "fecha_Inicio_Conclusion",
    align: "center",
    label: "Fecha de inicio o conclusión del Expediente",
    field: "fecha_Inicio_Conclusion",
    sortable: true,
  },
  {
    name: "ubicacion",
    align: "center",
    label: "Signatura Topográfica",
    field: "ubicacion",
    sortable: true,
  },
  {
    name: "descripcion",
    align: "center",
    label: "Descripción",
    field: "descripcion",
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
    name: "inventario_Id",
    align: "center",
    label: "inventario_Id",
    field: "inventario_Id",
    sortable: true,
  },
  {
    name: "id",
    align: "center",
    label: "Acciones",
    field: "id",
    sortable: true,
  },
];

const visibleColumns = [
  "inventario_Clave_Clasificacion",
  "fecha_Inicio_Conclusion",
  "ubicacion",
  "inventario_No_Expediente_Interno",
  "inventario_No_Expediente_Interno",
  "descripcion",
  "observaciones",
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

const verAdjuntos = async (id) => {
  $q.loading.show();
  await adjuntoStore.loadAdjuntos(id);
  await inventarioStore.loadInventario(id);
  $q.loading.hide();
  adjuntoStore.actualizarModalVer(true);
};
</script>