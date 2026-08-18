<template>
  <div class="row">
    <div class="col">
      <q-table
        :rows="detalles"
        :columns="columns"
        :filter="filter"
        row-key="id"
        rows-per-page-label="Filas por pagina"
        no-data-label="No hay expedientes registrados en esta solicitud."
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
import { ref, onBeforeMount } from "vue";
import { useSolicitudPrestamoAiStore } from "../../../stores/solicitud_prestamo_ai_store";
import { useDetalleSolicitudAISotre } from "../../../stores/detalle_solicitud_prestamo_ai_store";

import { useAdjuntoInventarioStore } from "../../../stores/adjunto_inventario_store";
import { useInventarioAreaStore } from "../../../stores/inventario_area_store";
const $q = useQuasar();
const solicitudStore = useSolicitudPrestamoAiStore();
const detalleStore = useDetalleSolicitudAISotre();
const { solicitud, isEditar } = storeToRefs(solicitudStore);
const { array_detalle, detalles } = storeToRefs(detalleStore);
const inventarioStore = useInventarioAreaStore();
const adjuntoStore = useAdjuntoInventarioStore();
onBeforeMount(() => {

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

const verAdjuntos = async (id) => {
  $q.loading.show();
  await adjuntoStore.loadAdjuntos(id);
  await inventarioStore.loadInventario(id);
  $q.loading.hide();
  adjuntoStore.actualizarModalVer(true);
};

const eliminar = async (id) => {
  $q.dialog({
    title: "Eliminación de registro",
    message: "¿Esta seguro de eliminar el registro?",
    icon: "warning",
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
  });
};
</script>