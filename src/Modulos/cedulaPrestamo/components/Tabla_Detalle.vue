<template>
  <div class="row">
    <div class="col">
      <q-table
        :rows="isEditar == true ? detalles : arrayDetalles"
        :columns="columns"
        :filter="filter"
        row-key="id"
        rows-per-page-label="Filas por pagina"
        no-data-label="No hay expedientes agregados. Usa el botón Agregar para añadir el primero."
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
                <BtnEliminar
                  label="Eliminar expediente"
                  titulo="Eliminar expediente"
                  :mensaje="mensajeEliminar(props.row)"
                  @confirmado="eliminarDetalle(col.value)"
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
import { ref, warn, watch } from "vue";
import { useDetalleCedulaPrestamoStore } from "../../../stores/detalle_cedula_prestamo";
import { useCedulaPrestamoStore } from "../../../stores/cedula_prestamo_store";
import BtnEliminar from "../../../components/BtnEliminar.vue";

const $q = useQuasar();
const detalleCedulaStore = useDetalleCedulaPrestamoStore();
const cedulaStore = useCedulaPrestamoStore();
const { arrayDetalles, detalles } = storeToRefs(detalleCedulaStore);
const { isEditar, registro } = storeToRefs(cedulaStore);

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
    visible: false,
  },
  {
    name: "observaciones",
    align: "center",
    label: "Observaciones",
    field: "observaciones",
    sortable: true,
    visible: false,
  },
  {
    name: "id",
    align: "center",
    label: "Acciones",
    field: "id",
    sortable: true,
  },
];

const pagination = ref({
  //********** */
  page: 1,
  rowsPerPage: 10,
  sortBy: "name",
  descending: false,
});

const mensajeEliminar = (row) =>
  `¿Eliminar el expediente "${row.inventario_Clave_Clasificacion}" de esta cédula?`;

const eliminarDetalle = async (id) => {
  $q.loading.show();
  let resp = null;
  if (isEditar.value == true) {
    resp = await detalleCedulaStore.deleteDetalle(id);
  } else {
    resp = detalleCedulaStore.deleteDetalleArray(id);
  }
  if (resp.success) {
    $q.loading.hide();
    detalleCedulaStore.loadDetalles(registro.value.id);
    $q.notify({ type: "positive", message: resp.data });
  } else {
    $q.loading.hide();
    $q.notify({ type: "negative", message: resp.data });
  }
};

const filter = ref("");
</script>