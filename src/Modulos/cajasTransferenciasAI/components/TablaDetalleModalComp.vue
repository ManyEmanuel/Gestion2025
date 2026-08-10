<template>
  <div class="row">
    <div class="col">
      <q-table
        :rows="detalles"
        :columns="columns"
        :filter="filter"
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
          <q-btn
            class="q-ml-sm"
            label="Aprobar todo"
            color="purple-ieen"
            icon="check_circle"
            @click="aprobarTodo()"
          >
            <q-tooltip>Refrescar tabla</q-tooltip>
          </q-btn>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              <div v-if="col.name === 'id'">
                <q-btn
                  v-if="
                    props.row.estatus != 'Aprobado' &&
                    props.row.estatus != 'Rechazado' &&
                    props.row.estatus != 'Afectado'
                  "
                  flat
                  round
                  color="purple-ieen"
                  icon="check_circle"
                  @click="aprobar(col.value)"
                >
                  <q-tooltip>Aprobar</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="
                    props.row.estatus != 'Aprobado' &&
                    props.row.estatus != 'Rechazado' &&
                    props.row.estatus != 'Afectado'
                  "
                  flat
                  round
                  color="purple-ieen"
                  icon="cancel"
                  @click="rechazar(col.value)"
                >
                  <q-tooltip>Rechazar</q-tooltip>
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
import { useCajaTransferenciaStore } from "../../../stores/caja_trasnferencia_store";
import { useDetalleCajaTransferenciaStore } from "../../../stores/detalle_caja_Transferencia";
import { useTransferenciaPrimariaEncabezadoStore } from "../../../stores/transferencia_primaria_encabezado_store";

const $q = useQuasar();
const cajaTransferenciaStore = useCajaTransferenciaStore();
const detalleCajaTransferencia = useDetalleCajaTransferenciaStore();
const transferenciaPrimariaStore = useTransferenciaPrimariaEncabezadoStore();
const { caja, isEditar } = storeToRefs(cajaTransferenciaStore);
const { arrayDetalles, detalles } = storeToRefs(detalleCajaTransferencia);
const { encabezado } = storeToRefs(transferenciaPrimariaStore);

onBeforeMount(() => {
  detalleCajaTransferencia.loadDetalles(caja.value.id);
});

const columns = [
  {
    name: "nombre_Expediente",
    align: "center",
    label: "Nombre del expedientes",
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
    name: "id",
    align: "center",
    label: "Acciones",
    field: "id",
    sortable: true,
  },
];

const rechazar = async (id) => {
  $q.dialog({
    title: "Rechazar registro",
    message: "¿Esta seguro de rechazar el registro?, Describe el motivo",
    icon: "Warning",
    persistent: true,
    transitionShow: "scale",
    transitionHide: "scale",
    ok: {
      color: "positive",
      label: "Sí! rechazar",
    },
    cancel: {
      color: "negative",
      label: "Cancelar",
    },
    prompt: {
      model: "",
      type: "text", // optional
    },
  }).onOk(async (motivo) => {
    $q.loading.show();
    const resp = await detalleCajaTransferencia.rechazar(
      id,
      caja.value.id,
      motivo
    );
    if (resp.success) {
      $q.loading.hide();
      $q.notify({
        type: "positive",
        message: resp.data,
      });
      detalleCajaTransferencia.loadDetalles(caja.value.id);
    } else {
      $q.loading.hide();
      $q.notify({
        type: "negative",
        message: resp.data,
      });
    }
  });
};

const aprobar = async (id) => {
  $q.dialog({
    title: "Aprobar registro",
    message: "¿Esta seguro de aprobar el registro?",
    icon: "Warning",
    persistent: true,
    transitionShow: "scale",
    transitionHide: "scale",
    ok: {
      color: "positive",
      label: "Sí! aprobar",
    },
    cancel: {
      color: "negative",
      label: "Cancelar",
    },
  }).onOk(async () => {
    $q.loading.show();
    const resp = await detalleCajaTransferencia.aprobarDetalle(
      id,
      caja.value.id
    );
    if (resp.success) {
      detalleCajaTransferencia.loadDetalles(caja.value.id);
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

const aprobarTodo = async () => {
  let total = 0;
  $q.dialog({
    title: "Aprobar todos los documentos",
    message: "¿Esta seguro de aprobar todos los documentos?",
    icon: "Warning",
    persistent: true,
    transitionShow: "scale",
    transitionHide: "scale",
    ok: {
      color: "positive",
      label: "Sí! aprobar",
    },
    cancel: {
      color: "negative",
      label: "Cancelar",
    },
  }).onOk(async () => {
    $q.loading.show();
    let detallesPendientes = detalles.value.filter(
      (detalle) =>
        detalle.estatus != "Aprobado" &&
        detalle.estatus != "Rechazado" &&
        detalle.estatus != "Afectado"
    );

    for (let detalle of detallesPendientes) {
      const resp = await detalleCajaTransferencia.aprobarDetalle(
        detalle.id,
        caja.value.id
      );
      if (resp.success) {
        total += 1;
      }
      $q.loading.hide();
    }
    await detalleCajaTransferencia.loadDetalles(caja.value.id);
    $q.loading.hide();
    $q.notify({
      type: "positive",
      message: `Se han aprobado ${total} documentos.`,
    });
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
