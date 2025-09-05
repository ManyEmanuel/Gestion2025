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
                <q-btn
                  v-if="modulo == null ? false : modulo.actualizar"
                  flat
                  round
                  color="purple-ieen"
                  :icon="
                    encabezado.estatus == 'Afectado' ||
                    encabezado.estatus == 'Enviado'
                      ? 'visibility'
                      : 'edit'
                  "
                  @click="editar(col.value, props.row['estatus'])"
                >
                  <q-tooltip>{{
                    encabezado.estatus == "Afectado" ||
                    encabezado.estatus == "Enviado"
                      ? "Ver información"
                      : "Editar registro"
                  }}</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="modulo == null ? false : modulo.actualizar"
                  flat
                  round
                  color="purple-ieen"
                  icon="assignment"
                  @click="ListadoExcel(col.value)"
                >
                  <q-tooltip>Generar listado excel</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="
                    modulo == null
                      ? false
                      : modulo.eliminar && encabezado.estatus == 'Pendiente'
                  "
                  flat
                  round
                  color="purple-ieen"
                  icon="delete"
                  @click="eliminar(col.value)"
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
import { useTransferenciaPrimariaEncabezadoStore } from "../../../stores/transferencia_primaria_encabezado_store";
import { useCajaTransferenciaStore } from "../../../stores/caja_trasnferencia_store";
import { useDetalleCajaTransferenciaStore } from "../../../stores/detalle_caja_Transferencia";
import { onBeforeMount, ref } from "vue";
import * as XLSX from "xlsx";
import { espera } from "../../../helpers/helper";

const $q = useQuasar();
const authStore = useAuthStore();
const transferenciaPrimariaStore = useTransferenciaPrimariaEncabezadoStore();
const cajaTransferenciaStore = useCajaTransferenciaStore();
const detalleCajaTransferencia = useDetalleCajaTransferenciaStore();
const { modulo } = storeToRefs(authStore);
const { encabezado } = storeToRefs(transferenciaPrimariaStore);
const { cajas, isLoading } = storeToRefs(cajaTransferenciaStore);
const { detalles } = storeToRefs(detalleCajaTransferencia);

const props = defineProps({
  transferenciaId: Number,
});

onBeforeMount(() => {
  cajaTransferenciaStore.loadCajas(props.transferenciaId);
});

const columns = [
  {
    name: "year",
    align: "center",
    label: "Año",
    field: "year",
    sortable: false,
  },
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
    name: "seccion",
    align: "center",
    label: "Sección",
    field: "seccion",
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
    label: "Fecha antigua",
    field: "fecha_Antigua",
    sortable: true,
  },
  {
    name: "fecha_Reciente",
    align: "center",
    label: "Fecha reciente",
    field: "fecha_Reciente",
    sortable: true,
  },
  {
    name: "total_Paginas",
    align: "center",
    label: "Total hojas",
    field: "total_Paginas",
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

const pagination = ref({
  //********** */
  page: 1,
  rowsPerPage: 10,
  sortBy: "name",
  descending: false,
});

const filter = ref("");

const editar = async (id) => {
  $q.loading.show();
  cajaTransferenciaStore.updateEditar(true);
  await cajaTransferenciaStore.loadCaja(props.transferenciaId, id);
  await detalleCajaTransferencia.loadDetalles(id);
  cajaTransferenciaStore.actualizarModal(true);
  $q.loading.hide();
};

const generarExcel = async (id) => {
  $q.loading.show();
  await detalleCajaTransferencia.loadDetalles(id);
  console.log("Esto es detalles", detalles.value);
  $q.loading.hide();
};

const ListadoExcel = async (id) => {
  $q.dialog({
    title: "Generación de listado de información",
    message:
      "Se generara un listado de los documentos en formato excel, ¿Desea continuar?",
    icon: "Warning",
    persistent: true,
    transitionShow: "scale",
    transitionHide: "scale",
    ok: {
      color: "positive",
      label: "¡Sí!, Generar",
    },
    cancel: {
      color: "negative",
      label: " No Cancelar",
    },
  }).onOk(async () => {
    $q.loading.show();
    await detalleCajaTransferencia.loadDetalles(id);
    if (detalles.value.length > 0) {
      await generarExcel1();
    } else {
      $q.notify({
        color: "negative",
        position: "top-right",
        message: "No hay registros para generar el listado",
        icon: "report_problem",
      });
    }
    $q.loading.hide();
  });
};

const generarExcel1 = async () => {
  $q.loading.show();
  let datosInventario = detalles.value.map((inventario) => {
    return {
      "Clave de Clasificación": inventario.clave_Clasificacion,
      "Nombre de Expediente": inventario.nombre_Expediente,
      "Descripción del Expediente": inventario.descripcion,
      "Valor Documental": inventario.valor_Documental,
      "Total de Páginas": inventario.total_Paginas,
      "Vigencia de Concentración": inventario.vigencia_Concentracion,
      "Fecha de Inicio": inventario.fecha_Inicio,
      "Fecha de Termino": inventario.fecha_Termino,
      "Estatus del expediente": inventario.estatus,
    };
  });
  const worksheet = XLSX.utils.json_to_sheet(datosInventario);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Concentración de datos");
  XLSX.writeFile(workbook, "Reporte_Documentos.xlsx");
  $q.loading.hide();
};

const eliminar = async (id) => {
  $q.dialog({
    title: "Eliminación de registro",
    message: "¿Esta seguro de eliminar el registro?",
    icon: "Warning",
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
    const resp = await cajaTransferenciaStore.deleteCaja(
      id,
      props.transferenciaId
    );
    if (resp.success) {
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
