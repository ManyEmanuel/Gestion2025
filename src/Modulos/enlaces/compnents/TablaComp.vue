<template>
  <div class="row">
    <div class="col">
      <q-table
        :rows="enlacesFiltro"
        :columns="columns"
        :filter="filter"
        :loading="loading"
        row-key="id"
        :rows-per-page-options="[10]"
        rows-per-page-label="Filas por pagina"
        no-data-label="No hay registros"
        class="my-sticky-last-column-table"
      >
        <template v-slot:top-left>
          <q-select
            v-model="estatusVista"
            :options="estatusEnlaces"
            label="Estatus del enlace"
            class="q-mr-sm"
            style="width: 300px"
          ></q-select>
        </template>
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
                <!-- Corte: el backend nuevo no actualiza empleado/área de un enlace (solo el estado,
                     vía activar/desactivar); se deshabilita editar. -->
                <q-btn
                  v-if="false"
                  flat
                  round
                  color="purple-ieen"
                  icon="edit"
                  @click="editar(col.value)"
                >
                  <q-tooltip>Editar registro</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="modulo.eliminar"
                  flat
                  round
                  color="purple-ieen"
                  icon="delete"
                  @click="eliminar(col.value)"
                >
                  <q-tooltip>Eliminar registro</q-tooltip>
                </q-btn>
                <!-- Corte: Anexo 12 (catálogo de firmas) diferido — depende del responsable de área,
                     que el backend nuevo no modela. Rehacer como reporte de backend si se requiere. -->
                <q-btn
                  v-if="false"
                  flat
                  round
                  color="purple-ieen"
                  icon="description"
                  @click="generar(col.value)"
                >
                  <q-tooltip>Catálogo de firmas(Anexo 12)</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="props.row.estatus == 'Inactivo'"
                  flat
                  round
                  color="purple-ieen"
                  icon="person_add"
                  @click="activarEnlace(col.value)"
                >
                  <q-tooltip>Activar Enlace </q-tooltip>
                </q-btn>
                <q-btn
                  v-if="props.row.estatus == 'Activo'"
                  flat
                  round
                  color="purple-ieen"
                  icon="person_remove"
                  @click="desactivarEnlace(col.value)"
                >
                  <q-tooltip>Desactivar Enlace</q-tooltip>
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
import { onMounted, ref, watch } from "vue";
import { useEnlaceArchivoStore } from "../../../stores/enlace_archivo_store";
import { genera_anexo_12 } from "../../../helpers/anexo_12";
import { useAuthStore } from "../../../stores/auth_store";
import { espera } from "../../../helpers/helper";

const $q = useQuasar();
const enlaceArchivoStore = useEnlaceArchivoStore();
const authStore = useAuthStore();
const { modulo } = storeToRefs(authStore);
const { enlaces, loading, enlacesFiltro } =
  storeToRefs(enlaceArchivoStore);

const estatusEnlaces = ref(["Todos", "Inactivo", "Activo"]);
const estatusVista = ref("Todos");

onMounted(() => {
  enlaceArchivoStore.loadEnlaces();
});

const columns = [
  {
    name: "area",
    align: "center",
    label: "Área",
    field: "area",
    sortable: true,
  },
  {
    name: "empleado",
    align: "center",
    label: "Enlace",
    field: "empleado",
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
  await espera();
  enlaceArchivoStore.initEnlaces();
  enlaceArchivoStore.loadEnlace(id);
  enlaceArchivoStore.updateEditar(true);
  $q.loading.hide();
  enlaceArchivoStore.actualizarModal(true);
};

const generar = async (id) => {
  $q.loading.show();
  let resp = await enlaceArchivoStore.loadInformacionAnexo(id);
  genera_anexo_12(resp[0]);
  if (resp[0].registro == false) {
    $q.dialog({
      title: "Sin fecha de asignación",
      message:
        "El enlace no cuenta con fecha de asignación, para actualizar este dato, ingrese a la edición de información del enlace",
    }).onOk(() => {
      // console.log('OK')
    });
  }
  $q.loading.hide();
};

const activarEnlace = async (id) => {
  $q.dialog({
    title: "Activar enlace",
    message: "¿Esta seguro de activar al enlace?",
    icon: "Warning",
    persistent: true,
    transitionShow: "scale",
    transitionHide: "scale",
    ok: {
      color: "positive",
      label: "Sí! activar",
    },
    cancel: {
      color: "negative",
      label: "Cancelar",
    },
  }).onOk(async () => {
    $q.loading.show();
    // Corte: PATCH /api/enlaces/{id}/estado { activo:true } (reemplaza al loadEnlace+updateEnlace legado).
    const resp2 = await enlaceArchivoStore.cambiarEstadoEnlace(id, true);
    if (resp2.success) {
      $q.loading.hide();
      $q.notify({
        type: "positive",
        message: resp2.data,
      });
      await enlaceArchivoStore.loadEnlaces();
    } else {
      $q.loading.hide();
      $q.notify({
        type: "negative",
        message: resp2.data,
      });
    }
  });
};

const desactivarEnlace = async (id) => {
  $q.dialog({
    title: "Desactivar enlace",
    message: "¿Esta seguro de desactivar al enlace?",
    icon: "Warning",
    persistent: true,
    transitionShow: "scale",
    transitionHide: "scale",
    ok: {
      color: "positive",
      label: "Sí! desactivar",
    },
    cancel: {
      color: "negative",
      label: "Cancelar",
    },
  }).onOk(async () => {
    $q.loading.show();
    // Corte: PATCH /api/enlaces/{id}/estado { activo:false } (reemplaza al loadEnlace+updateEnlace legado).
    const resp2 = await enlaceArchivoStore.cambiarEstadoEnlace(id, false);

    if (resp2.success) {
      $q.loading.hide();
      $q.notify({
        type: "positive",
        message: resp2.data,
      });
      await enlaceArchivoStore.loadEnlaces();
    } else {
      $q.loading.hide();
      $q.notify({
        type: "negative",
        message: resp2.data,
      });
    }
  });
};

watch(estatusVista, (val) => {
  if (val == "Todos") {
    enlacesFiltro.value = enlaces.value;
  } else {
    enlacesFiltro.value = enlaces.value.filter((x) => x.estatus == val);
  }
});

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
    const resp = await enlaceArchivoStore.deleteEnlace(id);
    if (resp.success) {
      $q.loading.hide();
      $q.notify({
        type: "positive",
        message: resp.data,
      });
      await enlaceArchivoStore.loadEnlaces();
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
