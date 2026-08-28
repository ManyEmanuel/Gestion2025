<template>
  <q-page padding>
    <div class="q-pa-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Bitácora de trazabilidad" icon="fact_check" />
      </q-breadcrumbs>
    </div>

    <div v-if="modulo && modulo.leer">
      <h1 class="text-h6 text-purple-ieen q-px-md">Bitácora de trazabilidad</h1>
      <p class="text-caption text-grey-8 q-px-md">
        Rastro de quién hizo qué y cuándo sobre los expedientes y los procesos del archivo. Es un registro
        de solo lectura: no puede modificarse ni borrarse desde la aplicación.
      </p>

      <q-card flat bordered class="q-mb-md">
        <q-card-section class="row q-col-gutter-md items-end">
          <div class="col-12 col-md-3">
            <q-select
              v-model="tipoEntidad"
              :options="tiposOpciones"
              label="Tipo de entidad"
              dense
              clearable
            />
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model="entidadId"
              label="Id de la entidad"
              hint="Pegue aquí el identificador del expediente o del proceso"
              dense
              clearable
            />
          </div>
          <div class="col-12 col-md-2">
            <q-input v-model="usuario" label="Usuario" dense clearable />
          </div>
          <div class="col-6 col-md-2">
            <q-input v-model="desde" label="Desde" mask="date" :rules="['date']" dense clearable>
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                    <q-date v-model="desde" color="purple">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Ok" color="purple" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <div class="col-6 col-md-2">
            <q-input v-model="hasta" label="Hasta" mask="date" :rules="['date']" dense clearable>
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                    <q-date v-model="hasta" color="purple">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Ok" color="purple" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat color="purple-ieen" label="Limpiar filtros" icon="filter_alt_off" @click="limpiar" />
          <q-btn color="purple-ieen" text-color="white" label="Consultar" icon="search" @click="consultar" />
        </q-card-actions>
      </q-card>

      <q-table
        dense
        flat
        bordered
        :rows="renglones"
        :columns="columnas"
        :loading="cargando"
        v-model:pagination="paginacion"
        :rows-number="total"
        @request="onRequest"
        row-key="id"
        rows-per-page-label="Filas por página"
        :rows-per-page-options="[10, 25, 50, 100, 200]"
        no-data-label="No hay movimientos registrados para esos filtros."
      >
        <template v-slot:top>
          <h2 class="text-subtitle1 q-my-none">Movimientos</h2>
          <q-space />
          <q-btn
            type="button"
            class="q-ma-sm"
            color="purple-ieen"
            text-color="white"
            icon-right="document_scanner"
            label="Listado Excel"
            @click="listadoExcel"
          />
        </template>
        <template v-slot:body-cell-detalle="props">
          <q-td :props="props" class="text-center">
            <q-btn
              flat
              round
              dense
              color="purple-ieen"
              icon="visibility"
              @click="verDetalle(props.row)"
              aria-label="Ver detalle del movimiento"
            >
              <q-tooltip>Ver detalle</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>
    <SinPermisoBanner v-else modulo="Bitácora de trazabilidad" />

    <q-dialog v-model="dialogoDetalle">
      <q-card flat bordered style="width: 760px; max-width: 92vw">
        <q-card-section class="row items-center">
          <h2 class="text-h6 q-my-none">Detalle del movimiento</h2>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup aria-label="Cerrar" />
        </q-card-section>
        <q-card-section v-if="seleccionado">
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-6"><b>Evento:</b> {{ seleccionado.evento }}</div>
            <div class="col-12 col-md-6"><b>Fecha:</b> {{ seleccionado.fecha_Texto }}</div>
            <div class="col-12 col-md-6"><b>Usuario:</b> {{ seleccionado.usuario }}</div>
            <div class="col-12 col-md-6"><b>Tipo de entidad:</b> {{ seleccionado.entidad_Tipo }}</div>
            <div class="col-12"><b>Id de la entidad:</b> {{ seleccionado.entidad_Id }}</div>
            <div class="col-12"><b>Origen:</b> {{ seleccionado.origen || "—" }}</div>
          </div>
          <div class="q-mt-md">
            <b>Cambio registrado</b>
            <pre class="bitacora-diff">{{ diffFormateado }}</pre>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            color="purple-ieen"
            label="Ver solo esta entidad"
            icon="filter_alt"
            @click="filtrarPorEntidadSeleccionada"
          />
          <q-btn flat label="Cerrar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style scoped>
.bitacora-diff {
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 40vh;
  overflow: auto;
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
}
</style>

<script setup>
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "../../../stores/auth_store";
import { useBitacoraStore } from "../../../stores/bitacora_store";
import SinPermisoBanner from "../../../components/SinPermisoBanner.vue";
import * as XLSX from "xlsx";

const $q = useQuasar();
const route = useRoute();
const authStore = useAuthStore();
const store = useBitacoraStore();
const { modulo } = storeToRefs(authStore);
const { renglones, total, tiposEntidad, cargando } = storeToRefs(store);
const siglas = "AI-BITACORA";

const tipoEntidad = ref(null);
const entidadId = ref(null);
const usuario = ref(null);
const desde = ref(null);
const hasta = ref(null);
const paginacion = ref({ page: 1, rowsPerPage: 25, rowsNumber: 0 });

const dialogoDetalle = ref(false);
const seleccionado = ref(null);

const tiposOpciones = computed(() => tiposEntidad.value);

// El `diff` es el JSON que guarda el interceptor; se muestra formateado para que sea legible, y tal cual
// si no fuera JSON válido (nunca conviene ocultarle al auditor lo que hay realmente guardado).
const diffFormateado = computed(() => {
  const crudo = seleccionado.value && seleccionado.value.diff;
  if (!crudo) return "Sin detalle registrado.";
  try {
    return JSON.stringify(JSON.parse(crudo), null, 2);
  } catch {
    return crudo;
  }
});

const columnas = [
  { name: "fecha_Texto", label: "Fecha", field: "fecha_Texto", align: "left", sortable: false },
  { name: "evento", label: "Evento", field: "evento", align: "left", sortable: false },
  { name: "entidad_Tipo", label: "Tipo de entidad", field: "entidad_Tipo", align: "left", sortable: false },
  { name: "entidad_Id", label: "Id de la entidad", field: "entidad_Id", align: "left", sortable: false },
  { name: "usuario", label: "Usuario", field: "usuario", align: "left", sortable: false },
  { name: "origen", label: "Origen", field: (r) => r.origen || "—", align: "left", sortable: false },
  { name: "detalle", label: "Detalle", field: "id", align: "center", sortable: false },
];

// Permite llegar al rastro de una entidad concreta desde un enlace:
// #/bitacora?entidadTipo=Expediente&entidadId=<guid>
const aplicarQuery = () => {
  if (route.query.entidadTipo) tipoEntidad.value = route.query.entidadTipo;
  if (route.query.entidadId) entidadId.value = route.query.entidadId;
};

onBeforeMount(async () => {
  $q.loading.show();
  await authStore.loadModulo(siglas);
  if (modulo.value && modulo.value.leer) {
    aplicarQuery();
    await store.loadTiposEntidad();
    await pedirPagina(paginacion.value);
  }
  $q.loading.hide();
});

// Llegar a esta misma ruta con otros parámetros NO remonta el componente, así que sin este watcher el
// enlace no tendría efecto para quien ya estuviera en la pantalla.
watch(
  () => route.query,
  () => {
    if (!(modulo.value && modulo.value.leer)) return;
    aplicarQuery();
    consultar();
  }
);

// El backend espera un instante; el selector de fecha entrega `YYYY/MM/DD`. `hasta` se lleva al final del
// día para que filtrar «hasta el 5» incluya lo ocurrido ese mismo 5.
const aInstante = (texto, finDelDia) => {
  if (!texto) return null;
  const partes = texto.split("/");
  if (partes.length !== 3) return null;
  const d = new Date(
    Number(partes[0]),
    Number(partes[1]) - 1,
    Number(partes[2]),
    finDelDia ? 23 : 0,
    finDelDia ? 59 : 0,
    finDelDia ? 59 : 0
  );
  return isNaN(d.getTime()) ? null : d.toISOString();
};

const filtroActual = () => ({
  entidadTipo: tipoEntidad.value || null,
  entidadId: entidadId.value ? entidadId.value.trim() : null,
  usuario: usuario.value ? usuario.value.trim() : null,
  desde: aInstante(desde.value, false),
  hasta: aInstante(hasta.value, true),
});

const pedirPagina = async (p) => {
  // rowsPerPage 0 es "todas" en Quasar; se acota al máximo que admite la API.
  const tamanoPagina = p.rowsPerPage > 0 ? p.rowsPerPage : 200;
  const resp = await store.loadBitacora({ ...filtroActual(), pagina: p.page, tamanoPagina });
  if (!resp.success) {
    $q.notify({ color: "negative", position: "top-right", message: resp.data, icon: "report_problem" });
    return;
  }
  paginacion.value = { page: p.page, rowsPerPage: tamanoPagina, rowsNumber: total.value };
};

// q-table en modo servidor emite `request` al cambiar de página o de tamaño de página.
const onRequest = async (props) => {
  await pedirPagina(props.pagination);
};

// Un filtro nuevo cambia el conjunto: se vuelve a la primera página para no dejar la tabla vacía.
const consultar = async () => {
  $q.loading.show();
  await pedirPagina({ ...paginacion.value, page: 1 });
  $q.loading.hide();
};

const limpiar = async () => {
  tipoEntidad.value = null;
  entidadId.value = null;
  usuario.value = null;
  desde.value = null;
  hasta.value = null;
  await consultar();
};

const verDetalle = (row) => {
  seleccionado.value = row;
  dialogoDetalle.value = true;
};

const filtrarPorEntidadSeleccionada = async () => {
  tipoEntidad.value = seleccionado.value.entidad_Tipo;
  entidadId.value = seleccionado.value.entidad_Id;
  dialogoDetalle.value = false;
  await consultar();
};

const listadoExcel = async () => {
  $q.dialog({
    title: "Generación de listado de información",
    message:
      "Se generará un listado en Excel con TODOS los movimientos que cumplen los filtros actuales, no solo los de esta página. ¿Desea continuar?",
    icon: "warning",
    persistent: true,
    transitionShow: "scale",
    transitionHide: "scale",
    ok: { color: "positive", label: "¡Sí!, Generar" },
    cancel: { color: "negative", label: " No Cancelar" },
  }).onOk(async () => {
    $q.loading.show();
    const resp = await store.descargarFiltradoCompleto(filtroActual());
    if (!resp.success) {
      $q.loading.hide();
      $q.notify({ color: "negative", position: "top-right", message: resp.data, icon: "report_problem" });
      return;
    }
    if (resp.data.length === 0) {
      $q.loading.hide();
      $q.notify({
        color: "negative",
        position: "top-right",
        message: "No hay registros para generar el listado",
        icon: "report_problem",
      });
      return;
    }
    const datos = resp.data.map((r) => ({
      Fecha: r.fecha_Texto,
      Evento: r.evento,
      "Tipo de entidad": r.entidad_Tipo,
      "Id de la entidad": r.entidad_Id,
      Usuario: r.usuario,
      Origen: r.origen,
      "Cambio registrado": r.diff,
    }));
    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Bitacora");
    XLSX.writeFile(libro, "Bitacora_trazabilidad.xlsx");
    $q.loading.hide();
  });
};
</script>
