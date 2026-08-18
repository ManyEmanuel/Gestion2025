<template>
  <div class="row">
    <div class="col">
      <q-table
        dense
        :rows="inventariosArea"
        :columns="columns"
        :filter="filter"
        :loading="loadindg"
        row-key="id"
        rows-per-page-label="Filas por pagina"
        no-data-label="No hay expedientes registrados en el inventario general por expediente"
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
                  icon="visibility"
                  @click="ver(col.value)"
                >
                  <q-tooltip>ver registro</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="purple-ieen"
                  icon="file_present"
                  @click="verAdjuntos(col.value)"
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
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useInventarioAreaStore } from "../../../stores/inventario_area_store";
import { useAdjuntoInventarioStore } from "../../../stores/adjunto_inventario_store";
import { useAuthStore } from "../../../stores/auth_store";
import { espera } from "../../../helpers/helper";

const $q = useQuasar();
const router = useRouter();
const inventarioStore = useInventarioAreaStore();
const adjuntoStore = useAdjuntoInventarioStore();
const authStore = useAuthStore();
const { modulo } = storeToRefs(authStore);
const { inventariosArea, loadindg } = storeToRefs(inventarioStore);

onMounted(() => {
  inventarioStore.loadInventariosByArea();
});

const columns = [
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
    name: "serie",
    align: "center",
    label: "Serie",
    field: "serie",
    sortable: true,
  },
  {
    name: "sub_Serie",
    align: "center",
    label: "SubSerie",
    field: "sub_Serie",
    sortable: true,
  },
  {
    name: "nombre_Expediente",
    align: "center",
    label: "Nombre expediente",
    field: "nombre_Expediente",
    sortable: true,
  },
  {
    name: "clave_Clasificacion",
    align: "center",
    label: "Clave de clasificacion",
    field: "clave_Clasificacion",
    sortable: true,
  },
  {
    name: "descripcion",
    align: "center",
    label: "Descripción/Observaciones",
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
    name: "ubicacion",
    align: "center",
    label: "Ubicación fisica",
    field: "ubicacion",
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
    name: "vigencia_Tramite",
    align: "center",
    label: "Vigencia tramite",
    field: "vigencia_Tramite",
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
    name: "vigencia_Completa",
    align: "center",
    label: "Vigencia completa",
    field: "vigencia_Completa",
    sortable: true,
  },
  {
    name: "disposicion_Documental",
    align: "center",
    label: "Destino final",
    field: "disposicion_Documental",
    sortable: true,
  },
  {
    name: "fecha_Clasificacion",
    align: "center",
    label: "Fecha clasificación",
    field: "fecha_Clasificacion",
    sortable: true,
  },
  {
    name: "fecha_Desclasificacion",
    align: "center",
    label: "Fecha desclasificación",
    field: "fecha_Desclasificacion",
    sortable: true,
  },
  {
    name: "fecha_Ampliacion",
    align: "center",
    label: "Fecha ampliación",
    field: "fecha_Ampliacion",
    sortable: true,
  },
  {
    name: "motivo_Rechazo",
    align: "center",
    label: "Motivo de rechazo",
    field: "motivo_Rechazo",
    sortable: true,
  },
  {
    name: "clasificado_Texto",
    align: "center",
    label: "Clasificado",
    field: "clasificado_Texto",
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

const ver = async (id) => {
  await inventarioStore.loadInventario(id);
  inventarioStore.actualizarModalVer(true);
};

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
</script>
