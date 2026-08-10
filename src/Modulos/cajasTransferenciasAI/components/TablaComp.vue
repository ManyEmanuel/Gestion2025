<template>
  <!-- Corte al backend nuevo: la vista AI se colapsó a SOLO-LECTURA + afectar (el afectar está en
       la página del módulo). Se retiraron las acciones por-caja "ver" y "Generar anexo 10": el
       backend nuevo no expone GET-por-id de caja ni persiste ubicación por caja, y el anexo 10
       (cédula por caja) dependía de campos que el dominio nuevo no modela — queda como reporte
       diferido (ver CORTE_CLIENTES.md). -->
  <div class="row">
    <div class="col">
      <q-table
        :rows="cajas"
        :columns="columns"
        :filter="filter"
        :loading="isLoading"
        row-key="id"
        rows-per-page-label="Filas por pagina"
        no-data-label="No hay registros"
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
      </q-table>
    </div>
  </div>
</template>
<script setup>
import { storeToRefs } from "pinia";
import { useCajaTransferenciaStore } from "../../../stores/caja_trasnferencia_store";
import { onBeforeMount, ref } from "vue";

const cajaTransferenciaStore = useCajaTransferenciaStore();
const { cajas, isLoading } = storeToRefs(cajaTransferenciaStore);

const props = defineProps({
  transferenciaId: String,
});

onBeforeMount(() => {
  cajaTransferenciaStore.loadCajas(props.transferenciaId);
});

const filter = ref("");

const columns = [
  { name: "no_Caja", align: "center", label: "No. Caja", field: "no_Caja", sortable: true },
  { name: "estatus", align: "center", label: "Estatus", field: "estatus", sortable: true },
  { name: "seccion", align: "center", label: "Sección", field: "seccion", sortable: true },
  { name: "peso", align: "center", label: "Peso (Kilogramos)", field: "peso", sortable: true },
  { name: "total_Expedientes", align: "center", label: "Total expedientes", field: "total_Expedientes", sortable: true },
];
</script>
