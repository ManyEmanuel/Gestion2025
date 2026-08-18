<template>
  <div class="row">
    <div class="col">
      <q-table
        :rows="isEditar == true ? detalles : arrayDetalles"
        :columns="columns"
        :filter="filter"
        row-key="id"
        rows-per-page-label="Filas por pagina"
        no-data-label="No hay expedientes agregados a esta caja. Usa &quot;Agregar&quot; para registrar el primero."
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
                <!-- Corte: en el backend nuevo el expediente agregado es inmutable (sin delete).
                     El eliminar solo aplica al armar el alta (array local, aún sin persistir);
                     al editar una caja ya guardada no se muestra. -->
                <BtnEliminar
                  v-if="isEditar == false"
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
import { ref, onBeforeMount } from "vue";
import { useCajaBajaDocumentalStore } from "../../../stores/caja_baja_documental";
import { useDetalleCajaBajaStore } from "../../../stores/detalle_caja_baja_store";
import BtnEliminar from "../../../components/BtnEliminar.vue";

const $q = useQuasar();
const cajaBajaStore = useCajaBajaDocumentalStore();
const detalleCajaBaja = useDetalleCajaBajaStore();
const { caja, isEditar } = storeToRefs(cajaBajaStore);
const { arrayDetalles, detalles } = storeToRefs(detalleCajaBaja);

onBeforeMount(() => {
  if (isEditar.value == true) {
    detalleCajaBaja.load_detalles(caja.value.id);
  }
});
const columns = [
  {
    name: "clave_Clasificacion",
    align: "center",
    label: "Clave de clasificación",
    field: "clave_Clasificacion",
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
    name: "total_Paginas",
    align: "center",
    label: "Total paginas",
    field: "total_Paginas",
    sortable: true,
  },
  {
    name: "fecha_Inicio",
    align: "center",
    label: "Fecha inicio",
    field: "fecha_Inicio",
    sortable: true,
  },
  {
    name: "fecha_Termino",
    align: "center",
    label: "Fecha termino",
    field: "fecha_Termino",
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

const mensajeEliminar = (row) => `¿Eliminar el expediente "${row.clave_Clasificacion}" de esta caja?`;

const eliminarDetalle = async (id) => {
  if (isEditar.value == true) {
    $q.loading.show();
    const resp = await detalleCajaBaja.deleteDetalle(id, caja.value.id);
    $q.loading.hide();
    $q.notify({ type: resp.success ? "positive" : "negative", message: resp.data });
  } else {
    detalleCajaBaja.deleteDetalleArray(id);
  }
};
</script>

