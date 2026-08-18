<template>
  <q-dialog
    v-model="modalVer"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card flat bordered style="width: 800px; max-width: 80vw">
      <q-card-section class="row">
        <div class="text-h6">
          Archivos adjuntos de {{ inventario.clave_Clasificacion }} con clave
          interna {{ inventario.no_Expediente_Interno }}
        </div>
        <q-space />
        <q-btn
          icon="close"
          @click="actualizarModal(false)"
          flat
          round
          dense
          v-close-popup
        />
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
            no-data-label="No hay archivos adjuntos para este expediente."
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
                    >
                      <q-tooltip>Descargar</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      color="purple-ieen"
                      icon="preview"
                      @click="ver(col.value)"
                    >
                      <q-tooltip>Ver archivo</q-tooltip>
                    </q-btn>
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
import { onMounted, ref } from "vue";
import { useInventarioAreaStore } from "../../../stores/inventario_area_store";
import { useAdjuntoInventarioStore } from "../../../stores/adjunto_inventario_store";
import * as XLSX from "xlsx";

const $q = useQuasar();
const inventarioStore = useInventarioAreaStore();
const adjuntoStore = useAdjuntoInventarioStore();

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
const { modalVer, adjuntos } = storeToRefs(adjuntoStore);
const file = ref(null);
const loading = ref(false);
const actualizarModal = () => {
  file.value = null;
  adjuntoStore.actualizarModal(false);
};

const ver = async (id) => {
  $q.loading.show();
  await adjuntoStore.loadAdjunto(id);
  adjuntoStore.actualizarViewer(true);
  $q.loading.hide();
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
</script>

<style>
</style>
