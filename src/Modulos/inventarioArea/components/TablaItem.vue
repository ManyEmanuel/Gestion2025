<template>
  <div class="row">
    <div class="col">
      <div class="text-right q-pa-md items-start q-gutter-md">
        <q-btn
          type="button"
          class="q-ma-sm"
          color="purple-ieen"
          icon-right="document_scanner"
          label="Anexo 4"
          @click="generar_anexo_4"
        />
        <q-btn
          type="button"
          class="q-ma-sm"
          color="green-8"
          icon-right="grid_on"
          label="Excel"
          @click="descargar_excel"
        />
        <q-btn
          type="button"
          class="q-ma-sm"
          color="purple-ieen"
          icon-right="document_scanner"
          label="Anexo 5"
          @click="generar_anexo_5"
        />
        <q-btn
          type="button"
          class="q-ma-sm"
          color="purple-ieen"
          icon-right="add_circle_outline"
          label="Nuevo"
          @click="actualizarModal(true)"
        />
      </div>
    </div>
  </div>
  <div class="row">
    <div class="col">
      <q-table
        :rows="inventarios"
        :columns="columns"
        :filter="filter"
        :loading="loading"
        row-key="id"
        rows-per-page-label="Filas por pagina"
        no-data-label="No hay expedientes registrados en este inventario. Usa &quot;Nuevo&quot; para capturar el primero."
        selection="multiple"
        v-model:selected="selected"
        rows-selection
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
        <template v-slot:body-selection="scope">
          <q-toggle v-model="scope.selected" />
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td>
              <q-checkbox v-model="props.selected" color="purple-ieen" />
            </q-td>
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              <div v-if="col.name === 'id'">
                <q-btn
                  flat
                  round
                  color="purple-ieen"
                  icon="file_present"
                  @click="adjuntos(col.value)"
                >
                  <q-tooltip>Adjuntar archivo</q-tooltip>
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
import { onMounted, ref } from "vue";
import { useInventarioAreaStore } from "../../../stores/inventario_area_store";
import { useAdjuntoInventarioStore } from "../../../stores/adjunto_inventario_store";
import { useEncabezadoInventarioStore } from "../../../stores/encabezado_inventario_area";
import {
  espera,
  genera_anexo_4,
  genera_anexo_5,
} from "../../../helpers/helper";
import { descargarReporte } from "../../../helpers/descargar_reporte";

const props = defineProps({
  encabezadoId: {
    type: Number,
    required: true,
  },
});
const $q = useQuasar();
const inventarioStore = useInventarioAreaStore();
const adjuntoStore = useAdjuntoInventarioStore();
const encabezadoInventariosStore = useEncabezadoInventarioStore();
const { inventarios, loading } = storeToRefs(inventarioStore);
const { encabezado } = storeToRefs(encabezadoInventariosStore);
onMounted(() => {
  inventarioStore.loadInventarios(props.encabezadoId);
  encabezadoInventariosStore.loadEncabezado(props.encabezadoId);
});
const selected = ref([]);
const columns = [
  {
    name: "estatus",
    align: "center",
    label: "Estatus",
    field: "estatus",
    sortable: false,
  },
  {
    name: "seccion",
    align: "center",
    label: "Sección",
    field: "seccion",
    sortable: false,
  },
  {
    name: "serie",
    align: "center",
    label: "Serie",
    field: "serie",
    sortable: false,
  },
  {
    name: "sub_Serie",
    align: "center",
    label: "SubSerie",
    field: "sub_Serie",
    sortable: false,
  },
  {
    name: "clave_Clasificacion",
    align: "center",
    label: "Clave de clasificación",
    field: "clave_Clasificacion",
    sortable: false,
  },
  {
    name: "nombre_Expediente",
    align: "center",
    label: "Nombre expediente",
    field: "nombre_Expediente",
    sortable: false,
  },
  {
    name: "descripcion",
    align: "center",
    label: "Descripción/Observaciones",
    field: "descripcion",
    sortable: false,
  },
  {
    name: "fecha_Inicio",
    align: "center",
    label: "Fecha inicio",
    field: "fecha_Inicio",
    sortable: false,
  },
  {
    name: "fecha_Termino",
    align: "center",
    label: "Fecha termino",
    field: "fecha_Termino",
    sortable: false,
  },
  {
    name: "ubicacion",
    align: "center",
    label: "Ubicación física",
    field: "ubicacion",
    sortable: false,
  },
  {
    name: "valor_Documental",
    align: "center",
    label: "Valor documental",
    field: "valor_Documental",
    sortable: false,
  },
  {
    name: "vigencia_Tramite",
    align: "center",
    label: "Vigencia tramite",
    field: "vigencia_Tramite",
    sortable: false,
  },
  {
    name: "vigencia_Concentracion",
    align: "center",
    label: "Vigencia concentración",
    field: "vigencia_Concentracion",
    sortable: false,
  },
  {
    name: "vigencia_Completa",
    align: "center",
    label: "Vigencia completa",
    field: "vigencia_Completa",
    sortable: false,
  },
  {
    name: "disposicion_Documental",
    align: "center",
    label: "Destino final",
    field: "disposicion_Documental",
    sortable: false,
  },
  {
    name: "fecha_Ampliacion",
    align: "center",
    label: "Fecha ampliación",
    field: "fecha_Ampliacion",
    sortable: false,
  },
  {
    name: "motivo_Rechazo",
    align: "center",
    label: "Motivo de rechazo",
    field: "motivo_Rechazo",
    sortable: false,
  },
  {
    name: "clasificado_Texto",
    align: "center",
    label: "Clasificado",
    field: "clasificado_Texto",
    sortable: false,
  },
  {
    name: "total_Paginas",
    align: "center",
    label: "Total paginas",
    field: "total_Paginas",
    sortable: false,
  },
  {
    name: "id",
    align: "center",
    label: "Acciones",
    field: "id",
    sortable: false,
  },
];

const actualizarModal = (valor) => {
  inventarioStore.initInventario();
  inventarioStore.actualizarModal(valor);
  inventarioStore.updateEditar(false);
};

const generar_anexo_4 = () => {
  const rows = [];
  inventarios.value.forEach((element) => {
    const arr_clave = element.clave_Clasificacion.split("/");
    rows.push([
      element.seccion,
      element.sub_Serie == "" ? element.serie : element.sub_Serie,
      element.nombre_Expediente,
      element.clave_Clasificacion,
      arr_clave[3],
      element.descripcion,
      element.fecha_Inicio,
      element.fecha_Termino,
      element.ubicacion,
      element.valor_Documental,
      element.vigencia_Tramite,
      element.vigencia_Concentracion,
      element.vigencia_Completa,
      element.disposicion_Documental == "Eliminación" ? "X" : "",
      element.disposicion_Documental == "Archivo histórico" ? "X" : "",
      element.fecha_Clasificacion,
      element.fecha_Desclasificacion,
      element.fecha_Ampliacion,
    ]);
  });
  genera_anexo_4(encabezado.value, rows);
};

const generar_anexo_5 = () => {
  genera_anexo_5(
    [...selected.value],
    encabezado.value.area_Responsable,
    encabezado.value.area_Generadora
  );
};

// MIGRADO al backend nuevo: descarga el Inventario general por expediente en Excel (.xlsx)
// generado por el servidor (GET /api/reportes/inventario/por-encabezado/{encabezadoId}).
const descargar_excel = async () => {
  $q.loading.show();
  const resp = await descargarReporte(
    `/reportes/inventario/por-encabezado/${props.encabezadoId}`,
    "Inventario.xlsx"
  );
  $q.loading.hide();
  if (!resp.success) {
    $q.notify({ type: "negative", message: resp.data });
  }
};

const pagination = ref({
  //********** */
  page: 1,
  rowsPerPage: 10,
  sortBy: "name",
  descending: false,
});

const filter = ref("");

const adjuntos = async (id) => {
  $q.loading.show();
  inventarioStore.setInventario(id);
  adjuntoStore.loadAdjuntos(id);
  // TODO(ux-audit): revisar si este delay compensa una transición real o reactividad no otorgada
  await espera(50);
  $q.loading.hide();
  adjuntoStore.actualizarModal(true);
};

</script>


