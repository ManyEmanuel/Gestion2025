<template>
  <div class="row">
    <div class="col">
      <q-table
        dense
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
import { useCajaTransferenciaStore } from "../../../stores/caja_trasnferencia_store";
import { useDetalleCajaTransferenciaStore } from "../../../stores/detalle_caja_Transferencia";
import BtnEliminar from "../../../components/BtnEliminar.vue";

const $q = useQuasar();
const cajaTransferenciaStore = useCajaTransferenciaStore();
const detalleCajaTransferencia = useDetalleCajaTransferenciaStore();
const { caja, isEditar } = storeToRefs(cajaTransferenciaStore);
const { arrayDetalles, detalles } = storeToRefs(detalleCajaTransferencia);

onBeforeMount(() => {
  if (isEditar.value == true) {
    detalleCajaTransferencia.loadDetalles(caja.value.id);
  }
});

const columns = [
  {
    name: "nombre_Expediente",
    align: "center",
    label: "Nombre del expediente",
    field: "nombre_Expediente",
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
    name: "valor_Documental",
    align: "center",
    label: "Valor documental",
    field: "valor_Documental",
    sortable: true,
  },
  {
    name: "vigencia_Concentracion",
    align: "center",
    label: "Vigencia concentración",
    field: "vigencia_Concentracion",
    sortable: true,
  },
  {
    name: "destino_Final",
    align: "center",
    label: "Destino final",
    field: "destino_Final",
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
    name: "motivo_Rechazo",
    align: "center",
    label: "Motivo rechazo",
    field: "motivo_Rechazo",
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

const mensajeEliminar = (row) => `¿Eliminar el expediente "${row.nombre_Expediente}" de esta caja?`;

const eliminarDetalle = async (id) => {
  if (isEditar.value == true) {
    $q.loading.show();
    const resp = await detalleCajaTransferencia.deleteDetalle(caja.value.id, id);
    $q.loading.hide();
    $q.notify({ type: resp.success ? "positive" : "negative", message: resp.data });
  } else {
    detalleCajaTransferencia.deleteDetalleArray(id);
  }
};
</script>

