<template>
  <div class="row">
    <div class="col">
      <q-table
        :rows="inventariosHistoricoFiltro"
        :columns="columns"
        :filter="filter"
        :loading="isLoadingHistorico"
        row-key="id"
        rows-per-page-label="Filas por pagina"
        no-data-label="No hay expedientes en el histórico para el área y año seleccionados."
        class="my-sticky-last-column-table"
      >
        <template v-slot:top>
          <q-select
            v-model="areasLista"
            :options="areas"
            label="Área generadora"
            style="width: 25%"
            class="q-mr-sm"
          >
          </q-select>
          <q-select
            v-model="anio"
            :options="anioLista"
            label="Áño"
            style="width: 25%"
          >
          </q-select>

          <q-space></q-space>

          <q-btn
            type="button"
            class="q-ma-sm"
            color="purple-ieen"
            text-color="white"
            icon-right="document_scanner"
            label="Listado Excel"
            @click="ListadoExcel()"
          />
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
                  @click="verAdjuntos(col.value)"
                >
                  <q-tooltip>Adjuntar archivo</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="purple-ieen"
                  icon="edit"
                  @click="editar(col.value)"
                >
                  <q-tooltip>Editar registro</q-tooltip>
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
import { onBeforeMount, onMounted, ref, watch } from "vue";
import { useInventarioAreaAIStore } from "../../../stores/inventario_area_ai_store";
import { useAdjuntoInventarioStore } from "../../../stores/adjunto_inventario_store";
import { useAuthStore } from "../../../stores/auth_store";
import { useAreaStore } from "../../../stores/areas_store";
import * as XLSX from "xlsx";

const $q = useQuasar();
const inventarioStore = useInventarioAreaAIStore();
const adjuntoStore = useAdjuntoInventarioStore();
const areaStore = useAreaStore();
const { inventariosHistorico, isLoadingHistorico, inventariosHistoricoFiltro } =
  storeToRefs(inventarioStore);
const { areas } = storeToRefs(areaStore);
const areasLista = ref({ value: 0, label: "Ver todos" });
const anioLista = ref([]);
const anio = ref("Ver todos");

onBeforeMount(() => {
  cargarDatos();
});

const cargarDatos = async () => {
  await inventarioStore.loadInventariosHistorico();
  await areaStore.loadListaAreas();
  await cargarAños();
};

const cargarAños = async () => {
  let hoy = new Date();
  let año = parseInt(hoy.getFullYear());
  for (let i = 1992; i <= año; i++) {
    if (i == 1992) {
      anioLista.value.push("Ver todos");
    }
    anioLista.value.push(i);
  }
  areas.value.unshift({ value: 0, label: "Ver todos" });
};

watch(areasLista, (val) => {
  if (val.label != "Ver todos") {
    console.log;
    let textoArea = val.label.split("-");
    cargarFiltros(textoArea[1].trim(), anio.value);
  } else {
    cargarFiltros(val.label, anio.value);
  }
});

watch(anio, (val) => {
  if (areasLista.value.label != "Ver todos") {
    console.log;
    let textoArea = areasLista.value.label.split("-");
    cargarFiltros(textoArea[1].trim(), val);
  } else {
    cargarFiltros(areasLista.value.label, val);
  }
});

const cargarFiltros = async (area, anio) => {
  $q.loading.show();
  await inventarioStore.loadInventariosHistoricoFiltro(area, anio);
  $q.loading.hide();
};

const columns = [
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
    name: "area_Generadora",
    align: "center",
    label: "Área generadora",
    field: "area_Generadora",
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
    name: "clave_Clasificacion",
    align: "center",
    label: "Clave de clasificacion",
    field: "clave_Clasificacion",
    sortable: false,
  },
  {
    name: "area_Responsable",
    align: "center",
    label: "Área responsable",
    field: "area_Responsable",
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
    name: "ubicacion_AI",
    align: "center",
    label: "Ubicación fisica",
    field: "ubicacion_AI",
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
    name: "vigencia_Concentracion",
    align: "center",
    label: "Vigencia concentración",
    field: "vigencia_Concentracion",
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
    name: "fecha_Recepcion_Transferencia_Primaria",
    align: "center",
    label: "Fecha recepción",
    field: "fecha_Recepcion_Transferencia_Primaria",
    sortable: false,
  },
  {
    name: "fecha_Termino_Concentracion",
    align: "center",
    label: "Fecha termino concentración",
    field: "fecha_Termino_Concentracion",
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

const verAdjuntos = async (id) => {
  $q.loading.show();
  await adjuntoStore.loadAdjuntos(id);
  $q.loading.hide();
  adjuntoStore.actualizarModalVer(true);
};

const pagination = ref({
  //********** */
  page: 1,
  rowsPerPage: 10,
  sortBy: "name",
  descending: false,
});

const filter = ref("");

const editar = (id) => {
  inventarioStore.loadInventario(id);
  inventarioStore.actualizarModal(true);
};

const ListadoExcel = async () => {
  $q.dialog({
    title: "Generación de listado de información",
    message:
      "Se generara un listado de la información de la tabla en formato excel, ¿Desea continuar?",
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
    if (inventariosHistoricoFiltro.value.length > 0) {
      await generarExcel();
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

const generarExcel = async () => {
  $q.loading.show();
  let datosInventario = inventariosHistoricoFiltro.value.map((inventario) => {
    return {
      Sección: inventario.seccion,
      Serie: inventario.serie,
      SubSerie: inventario.sub_Serie,
      "Nombre de expediente": inventario.nombre_Expediente,
      "Clave de clasificación": inventario.clave_Clasificacion,
      "Área responsable": inventario.area_Responsable,
      "Área generadora": inventario.area_Generadora,
      "Descripción/Observaciones": inventario.descripcion,
      "Ubicación fisica": inventario.ubicacion_AI,
      "Valor documental": inventario.valor_Documental,
      "Vigencia concentración": inventario.vigencia_Concentracion,
      "Destino final": inventario.disposicion_Documental,
      "Fecha recepción": inventario.fecha_Recepcion_Transferencia_Primaria,
      "Fecha termino concentración": inventario.fecha_Termino_Concentracion,
      Clasificado: inventario.clasificado_Texto,
      "Total paginas": inventario.total_Paginas,
    };
  });
  const worksheet = XLSX.utils.json_to_sheet(datosInventario);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Concentración de datos");
  XLSX.writeFile(workbook, "Reporte_Historico.xlsx");
  $q.loading.hide();
};
</script>