<template>
  <div class="row">
    <div class="col">
      <q-table
        :rows="isEditar == true ? detalles : array_detalle"
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
                <!-- Corte: el backend nuevo no modela el borrado de un expediente del préstamo; se
                     deshabilita. (El alta/edición del detalle está diferida con inventarioAreaAI.) -->
                <BtnEliminar
                  v-if="false"
                  label="Eliminar registro"
                  titulo="Eliminación de registro"
                  :mensaje="mensajeEliminar(props.row)"
                  @confirmado="eliminar(props.row.id)"
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
import { ref, onBeforeMount } from "vue";
import { useSolicitudPrestamoAiStore } from "../../../stores/solicitud_prestamo_ai_store";
import { useDetalleSolicitudAISotre } from "../../../stores/detalle_solicitud_prestamo_ai_store";
import BtnEliminar from "../../../components/BtnEliminar.vue";

const $q = useQuasar();
const solicitudStore = useSolicitudPrestamoAiStore();
const detalleStore = useDetalleSolicitudAISotre();
const { solicitud, isEditar } = storeToRefs(solicitudStore);
const { array_detalle, detalles } = storeToRefs(detalleStore);

onBeforeMount(() => {
  if (isEditar.value == true) {
    detalleStore.load_detalles(solicitud.value.id);
  }
});

const columns = [
  {
    name: "Inventario_Clave_Clasificacion",
    align: "center",
    label: "Clave de clasificación",
    field: "Inventario_Clave_Clasificacion",
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
    name: "id",
    align: "center",
    label: "Acciones",
    field: "id",
    sortable: true,
  },
];

const mensajeEliminar = (row) =>
  `¿Eliminar el expediente con clave "${row.Inventario_Clave_Clasificacion}"?`;

const eliminar = async (id) => {
  $q.loading.show();
  let resp = null;
  if (isEditar.value == true) {
    resp = await detalleStore.delete(solicitud.value.id, id);
    if (resp.success) {
      $q.notify({
        type: "positive",
        message: resp.data,
      });
    } else {
      $q.notify({
        type: "negative",
        message: resp.data,
      });
    }
  } else {
    detalleStore.delete_array(id);
  }
  $q.loading.hide();
};
</script>
