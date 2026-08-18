<template>
  <q-dialog
    v-model="modal"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card flat bordered style="width: 800px; max-width: 80vw">
      <q-card-section class="row">
        <h2 class="text-h6">
          Archivos adjuntos de {{ inventario.clave_Clasificacion }}
        </h2>
        <q-space />
        <q-btn
          icon="close"
          @click="actualizarModal(false)"
          flat
          round
          dense
          v-close-popup
        aria-label="Cerrar" />
      </q-card-section>
      <q-card-section>
        <q-form class="row q-col-gutter-xs" @submit="onSubmit">
          <div class="col-12 col-xs-6 col-md-9">
            <q-file
              rounded
              outlined
              bottom-slots
              v-model="file"
              label=""
              counter
              max-files="1"
            >
              <template v-slot:before>
                <q-icon name="attachment" />
              </template>
              <template v-slot:append>
                <q-icon name="search" @click.stop />
              </template>
              <template v-slot:hint> Archivo </template>
            </q-file>
          </div>
          <div class="col-12 col-xs-6 col-md-3">
            <q-input
              v-model="noPaginas"
              type="Number"
              label="No. páginas"
              hint="ingrese no. páginas"
              lazy-rules
              :rules="[(val) => !!val || 'El número de paginas es requerido']"
            />
          </div>
          <div class="col-12 justify-end">
            <div class="text-right q-gutter-xs">
              <BtnCancelar @click="actualizarModal(false)" />
              <q-btn
                :loading="loading"
                type="submit"
                color="secondary"
                label="Guardar"
                icon="save"
              >
                <template v-slot:loading>
                  <q-spinner-hourglass class="on-left" />
                  Cargando...
                </template>
              </q-btn>
            </div>
          </div>
        </q-form>
      </q-card-section>
      <card-seccion class="row">
        <div class="col">
          <q-table
            :rows="adjuntos"
            :columns="columns"
            :filter="filter"
            :loading="loading"
            row-key="id"
            rows-per-page-label="Filas por pagina"
            no-data-label="No hay archivos adjuntos. Selecciona un archivo y presiona &quot;Guardar&quot; para adjuntar el primero."
          >
            <template v-slot:top>
              <q-btn
                v-if="adjuntos.length > 0"
                type="button"
                class="q-ma-sm"
                color="purple-ieen"
                text-color="white"
                icon-right="list"
                label="Listado"
                @click="exportarListado()"
              />
              <q-space />
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
                      icon="sim_card_download"
                      @click="descargar(col.value)"
                    
  aria-label="Descargar"
>
                      <q-tooltip>Descargar</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      color="purple-ieen"
                      icon="preview"
                      @click="ver(col.value)"
                    
  aria-label="Ver archivo"
>
                      <q-tooltip>Ver archivo</q-tooltip>
                    </q-btn>
                    <BtnEliminar
                      label="Eliminar archivo"
                      titulo="Eliminar archivo"
                      :mensaje="mensajeEliminar(props.row)"
                      @confirmado="eliminarAdjunto(col.value)"
                    />
                  </div>
                  <label v-else>{{ col.value }}</label>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </div>
      </card-seccion>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useQuasar } from "quasar";
import { onMounted, ref, watch } from "vue";
import { useInventarioAreaStore } from "../../../stores/inventario_area_store";
import { useAdjuntoInventarioStore } from "../../../stores/adjunto_inventario_store";
import BtnCancelar from "../../../components/BtnCancelar.vue";
import BtnEliminar from "../../../components/BtnEliminar.vue";
import * as XLSX from "xlsx";

const $q = useQuasar();
const inventarioStore = useInventarioAreaStore();
const adjuntoStore = useAdjuntoInventarioStore();

const props = defineProps({
  encabezadoId: {
    type: Number,
    required: true,
  },
});

const columns = [
  {
    name: "nombre",
    align: "center",
    label: "Nombre",
    field: "nombre",
    sortable: true,
  },
  {
    name: "no_Paginas",
    align: "center",
    label: "No. paginas",
    field: "no_Paginas",
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

const { inventario } = storeToRefs(inventarioStore);
const { modal, adjuntos } = storeToRefs(adjuntoStore);
const file = ref(null);
const loading = ref(false);
const noPaginas = ref(0);
const actualizarModal = () => {
  file.value = null;
  noPaginas.value = null;
  adjuntoStore.actualizarModal(false);
};
const onSubmit = async () => {
  loading.value = true;
  const bodyFormData = new FormData();
  // Nombres de campo del backend nuevo (multipart): archivo + noPaginas.
  bodyFormData.append("archivo", file.value);
  bodyFormData.append("noPaginas", noPaginas.value);
  const resp = await adjuntoStore.createAdjunto(
    inventario.value.id,
    bodyFormData
  );
  if (resp.success == true) {
    inventarioStore.loadInventarios(props.encabezadoId);
    loading.value = false;
    $q.notify({
      type: "positive",
      message: resp.data,
    });
    file.value = null;
    noPaginas.value = null;
  } else {
    loading.value = false;
    $q.notify({
      type: "negative",
      message: resp.data,
    });
  }
};

watch(file, (val) => {
  if (val != null) {
    var reader = new FileReader();
    reader.readAsBinaryString(file.value);
    reader.onloadend = function () {
      noPaginas.value = reader.result.match(/\/Type[\s]*\/Page[^s]/g).length;
    };
  }
});

const ver = async (id) => {
  $q.loading.show();
  await adjuntoStore.loadAdjunto(id);
  adjuntoStore.actualizarViewer(true);
  $q.loading.hide();
};

const exportarListado = () => {
  let datosLista = adjuntos.value.map((adjunto) => {
    return {
      Nombre: adjunto.nombre,
      "Número de páginas": adjunto.no_Paginas,
    };
  });
  const worksheet = XLSX.utils.json_to_sheet(datosLista);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Listado de documentos");
  XLSX.writeFile(workbook, "Lista_Documentos.xlsx");
};

const descargar = async (id) => {
  $q.loading.show();
  await adjuntoStore.loadAdjunto(id);
  const adjunto_item = adjuntos.value.find((x) => x.id == id);
  const link = document.createElement("a");
  link.href = adjuntoStore.adjunto_url;
  link.setAttribute("download", adjunto_item.nombre);
  document.body.appendChild(link);
  link.click();
  $q.loading.hide();
};

const mensajeEliminar = (row) => `¿Eliminar el archivo "${row.nombre}"?`;

const eliminarAdjunto = async (id) => {
  $q.loading.show();
  const resp = await adjuntoStore.deleteAdjunto(inventario.value.id, id);
  if (resp.success) {
    $q.loading.hide();
    $q.notify({ type: "positive", message: resp.data });
    inventarioStore.loadInventarios(props.encabezadoId);
  } else {
    $q.loading.hide();
    $q.notify({ type: "negative", message: resp.data });
  }
};
</script>

<style>
</style>
