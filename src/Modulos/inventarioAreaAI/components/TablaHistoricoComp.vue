<template>
  <div class="row">
    <div class="col">
      <q-table
        dense
        :rows="inventariosHistorico"
        :columns="columns"
        :filter="filter"
        :loading="isLoadingHistorico"
        v-model:pagination="pagination"
        :rows-number="totalHistorico"
        @request="onRequest"
        row-key="id"
        rows-per-page-label="Filas por página"
        :rows-per-page-options="[10, 25, 50, 100, 200]"
        no-data-label="No hay expedientes en el histórico para el área y año seleccionados."
        class="my-sticky-last-column-table"
      >
        <template v-slot:top>
          <q-select
            v-model="areaSeleccionada"
            :options="areasOpciones"
            label="Área generadora"
            style="width: 25%"
            class="q-mr-sm"
          >
          </q-select>
          <q-select
            v-model="anio"
            :options="anioOpciones"
            label="Año"
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
                
  aria-label="Adjuntar archivo"
>
                  <q-tooltip>Adjuntar archivo</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="purple-ieen"
                  icon="edit"
                  @click="editar(col.value)"

  aria-label="Editar registro"
>
                  <q-tooltip>Editar registro</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="purple-ieen"
                  icon="qr_code_2"
                  @click="imprimirQr(props.row)"
                  aria-label="Imprimir etiqueta QR"
                >
                  <q-tooltip>Imprimir etiqueta QR</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="puedeVerBitacora"
                  flat
                  round
                  color="purple-ieen"
                  icon="fact_check"
                  @click="verBitacora(col.value)"
                  aria-label="Ver bitácora del expediente"
                >
                  <q-tooltip>Ver bitácora del expediente</q-tooltip>
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
import { computed, onBeforeMount, ref, watch } from "vue";
import { useInventarioAreaAIStore } from "../../../stores/inventario_area_ai_store";
import { useAdjuntoInventarioStore } from "../../../stores/adjunto_inventario_store";
import { useAuthStore } from "../../../stores/auth_store";
import { useRouter } from "vue-router";
import { useAreaStore } from "../../../stores/areas_store";
import * as XLSX from "xlsx";

const $q = useQuasar();
const inventarioStore = useInventarioAreaAIStore();
const adjuntoStore = useAdjuntoInventarioStore();
const areaStore = useAreaStore();
const authStore = useAuthStore();
const router = useRouter();
// Auditoría PERF-003: la tabla trabaja en modo servidor. `inventariosHistorico` es solo la página visible
// y `totalHistorico` el número de expedientes que cumplen el filtro; área, año y búsqueda viajan a la API
// en vez de filtrarse en memoria sobre el acervo completo.
const { inventariosHistorico, isLoadingHistorico, totalHistorico } =
  storeToRefs(inventarioStore);
const { areas } = storeToRefs(areaStore);

const VER_TODOS = "Ver todos";
const areaSeleccionada = ref({ value: null, label: VER_TODOS });
const anio = ref(VER_TODOS);
const anios = ref([]);
const filter = ref("");
const pagination = ref({ page: 1, rowsPerPage: 25, rowsNumber: 0 });

// Se componen sin tocar las listas del store: mutarlas duplicaba la opción "Ver todos" al volver a entrar.
const areasOpciones = computed(() => [{ value: null, label: VER_TODOS }, ...areas.value]);
const anioOpciones = computed(() => [VER_TODOS, ...anios.value]);

onBeforeMount(() => {
  cargarDatos();
});

const cargarDatos = async () => {
  await areaStore.loadListaAreas();
  const resp = await inventarioStore.loadAniosInventario("Historico");
  anios.value = resp.data || [];
  await pedirPagina(pagination.value, filter.value);
};

// El filtro cambia el conjunto, así que vuelve a la primera página: quedarse en la 7 de un conjunto que
// ahora tiene 2 dejaría la tabla vacía sin explicación.
watch([areaSeleccionada, anio], () => {
  pedirPagina({ ...pagination.value, page: 1 }, filter.value);
});

const consultaActual = () => ({
  areaGeneradoraId: areaSeleccionada.value?.value || null,
  anio: anio.value === VER_TODOS ? null : anio.value,
});

const pedirPagina = async (p, busqueda) => {
  // rowsPerPage 0 es "todas" en Quasar; se acota al máximo que admite la API.
  const tamanoPagina = p.rowsPerPage > 0 ? p.rowsPerPage : 200;
  const resp = await inventarioStore.loadInventariosHistorico({
    ...consultaActual(),
    pagina: p.page,
    tamanoPagina,
    busqueda: busqueda || null,
  });
  if (!resp.success) {
    $q.notify({ color: "negative", position: "top-right", message: resp.data, icon: "report_problem" });
    return;
  }
  pagination.value = { page: p.page, rowsPerPage: tamanoPagina, rowsNumber: totalHistorico.value };
};

// q-table en modo servidor emite `request` al cambiar de página, de tamaño de página o de búsqueda.
const onRequest = async (props) => {
  await pedirPagina(props.pagination, props.filter);
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

const editar = (id) => {
  inventarioStore.loadInventario(id);
  inventarioStore.actualizarModal(true);
};

// Auditoría FUNC-001: salto al rastro de trazabilidad de ESTE expediente. Sin este atajo, consultar la
// bitácora de un expediente concreto obligaría a conseguir su identificador por fuera de la aplicación.
const puedeVerBitacora = computed(() => authStore.tienePermiso("archivo.bitacora.ver"));

const verBitacora = (id) => {
  router.push({ name: "bitacora", query: { entidadTipo: "Expediente", entidadId: id } });
};

// Horizonte-3 #DF-8: etiqueta QR imprimible para pegar en la carpeta/caja física.
const imprimirQr = (row) => {
  inventarioStore.obtenerQr(row.id, row.clave_Clasificacion, row.nombre_Expediente);
};

const ListadoExcel = async () => {
  $q.dialog({
    title: "Generación de listado de información",
    message:
      "Se generara un listado de la información de la tabla en formato excel, ¿Desea continuar?",
    icon: "warning",
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
    // Auditoría PERF-003: la tabla ya solo tiene la página visible, así que el listado se arma pidiendo al
    // servidor todas las páginas del MISMO filtro -- si se exportara `rows` saldría solo lo que se ve.
    const resp = await inventarioStore.descargarInventarioAiCompleto("Historico", {
      ...consultaActual(),
      busqueda: filter.value || null,
    });
    if (!resp.success) {
      $q.loading.hide();
      $q.notify({ color: "negative", position: "top-right", message: resp.data, icon: "report_problem" });
      return;
    }
    if (resp.data.length > 0) {
      await generarExcel(resp.data);
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

const generarExcel = async (filas) => {
  $q.loading.show();
  let datosInventario = filas.map((inventario) => {
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