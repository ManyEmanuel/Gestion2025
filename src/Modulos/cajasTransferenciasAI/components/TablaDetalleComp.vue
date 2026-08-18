<template>
  <div class="row">
    <div class="col">
      <q-table
        dense
        :rows="detallesAI"
        :columns="columns"
        :filter="filter"
        :loading="isLoading"
        row-key="id"
        rows-per-page-label="Filas por pagina"
        no-data-label="No hay expedientes en esta caja de transferencia"
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
              <!-- Corte: el backend nuevo no modela aprobación/rechazo por-expediente de
                   transferencia; la vista AI se colapsó a solo-lectura + afectar toda la
                   transferencia (el afectar está en la página, no por renglón). -->
              <div v-if="col.name === 'id'"></div>
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
import { ref, onBeforeMount } from "vue";
import { useDetalleCajaTransferenciaStore } from "../../../stores/detalle_caja_Transferencia";

// Corte: la vista quedó de solo-lectura (sin aprobar/rechazar), así que ya no se usan $q,
// authStore/modulo ni el store de encabezado aquí.
const detalleCajaTransferencia = useDetalleCajaTransferenciaStore();
const { detallesAI, isLoading } = storeToRefs(detalleCajaTransferencia);
const props = defineProps({
  transferenciaId: Number,
});

onBeforeMount(() => {
  detalleCajaTransferencia.loadDetallesAI(props.transferenciaId);
});

const columns = [
  {
    name: "nombre_Expediente",
    align: "center",
    label: "Nombre del expedientess",
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
    name: "no_Expediente_Interno",
    align: "center",
    label: "No. Expediente interno",
    field: "no_Expediente_Interno",
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

// Corte: se retiraron aprobar()/rechazar() por-expediente — el backend nuevo no modela aprobación
// por-expediente de transferencia; la vista quedó de solo-lectura. El afectar (toda la transferencia)
// vive en la página del módulo.
</script>
