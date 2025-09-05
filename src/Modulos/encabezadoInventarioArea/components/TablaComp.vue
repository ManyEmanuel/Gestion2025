<template>
  <div class="row">
    <div class="col">
      <q-table
        :rows="encabezados"
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
                  icon="edit"
                  @click="editar(col.value)"
                >
                  <q-tooltip>Editar registro</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="modulo == null ? false : modulo.leer"
                  flat
                  round
                  color="purple-ieen"
                  icon="content_paste"
                  @click="toDetalle(col.value)"
                >
                  <q-tooltip>Detalle</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="modulo == null ? false : modulo.eliminar"
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
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useEncabezadoInventarioStore } from "../../../stores/encabezado_inventario_area";
import { useAuthStore } from "../../../stores/auth_store";
import { espera } from "../../../helpers/helper";

const $q = useQuasar();
const router = useRouter();
const encabezadoInventariosStore = useEncabezadoInventarioStore();
const authStore = useAuthStore();
const { modulo } = storeToRefs(authStore);
const { encabezados, loadindg } = storeToRefs(encabezadoInventariosStore);
onMounted(() => {
  encabezadoInventariosStore.loadEncabezados();
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
    name: "ano",
    align: "center",
    label: "Año",
    field: "ano",
    sortable: true,
  },
  {
    name: "area_Responsable",
    align: "center",
    label: "Área responsable",
    field: "area_Responsable",
    sortable: true,
  },
  {
    name: "area_Generadora",
    align: "center",
    label: "Área generadora",
    field: "area_Generadora",
    sortable: true,
  },
  {
    name: "enlace",
    align: "center",
    label: "Enlace",
    field: "enlace",
    sortable: true,
  },
  {
    name: "valido",
    align: "center",
    label: "Validó",
    field: "valido",
    sortable: true,
  },
  {
    name: "visto_Bueno",
    align: "center",
    label: "Visto bueno",
    field: "visto_Bueno",
    sortable: true,
  },
  {
    name: "supervisa",
    align: "center",
    label: "Supervisa",
    field: "supervisa",
    sortable: true,
  },
  {
    name: "nombre",
    align: "center",
    label: "Nombre",
    field: "nombre",
    sortable: true,
  },
  {
    name: "fecha_Registro",
    align: "center",
    label: "Fecha registro",
    field: "fecha_Registro",
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
  await encabezadoInventariosStore.loadEncabezado(id);
  await espera();
  encabezadoInventariosStore.updateEditar(true);
  encabezadoInventariosStore.actualizarModal(true);
  $q.loading.hide();
};

const toDetalle = (id) => {
  router.push({
    name: "detalleInventario",
    params: {
      encabezadoId: id,
    },
  });
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
    const resp = await encabezadoInventariosStore.deleteEncabezado(id);
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

