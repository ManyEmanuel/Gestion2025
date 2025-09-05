<template>
  <div class="row">
    <div class="col">
      <q-table
        :rows="encabezadosFiltro"
        :columns="columns"
        :filter="filter"
        :loading="loadindg"
        :visible-columns="visible_columns"
        row-key="id"
        rows-per-page-label="Filas por pagina"
        no-data-label="No hay registros"
        class="my-sticky-last-column-table"
      >
        <template v-slot:top>
          <q-select
            v-model="areasLista"
            :options="listaAreasGeneradoras"
            label="Área generadora"
            style="width: 25%"
            class="q-mr-sm"
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
                  @click="toCajas(col.value)"
                >
                  <q-tooltip>Cajas</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="
                    modulo == null
                      ? false
                      : modulo.leer &&
                        props.row['estatus'] != 'Afectado' &&
                        props.row['estatus'] != 'Enviado'
                  "
                  flat
                  round
                  color="purple-ieen"
                  icon="send"
                  @click="enviarTransferencia(col.value)"
                >
                  <q-tooltip>Enviar transferencia</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="
                    modulo == null
                      ? false
                      : modulo.eliminar &&
                        props.row['estatus'] != 'Afectado' &&
                        props.row['estatus'] != 'Enviado'
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
import { useAuthStore } from "../../../stores/auth_store";
import { useTransferenciaPrimariaEncabezadoStore } from "../../../stores/transferencia_primaria_encabezado_store";
import { onBeforeMount, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { espera } from "../../../helpers/helper";

const $q = useQuasar();
const authStore = useAuthStore();
const transferenciaPrimariaStore = useTransferenciaPrimariaEncabezadoStore();
const router = useRouter();
const { modulo } = storeToRefs(authStore);
const {
  encabezados,
  isLoading,
  encabezado,
  listaAreasGeneradoras,
  encabezadosFiltro,
} = storeToRefs(transferenciaPrimariaStore);
const areasLista = ref("Ver todos");

onBeforeMount(() => {
  transferenciaPrimariaStore.loadEncabezados();
});

const columns = [
  {
    name: "numero_Transferencia",
    align: "center",
    label: "No. Transferencia",
    field: "numero_Transferencia",
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
    name: "nombre",
    align: "center",
    label: "Nombre",
    field: "nombre",
    sortable: true,
  },
  {
    name: "area_Responsable",
    align: "center",
    label: "área responsable",
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
    name: "fecha_Registro",
    align: "center",
    label: "Fecha registro",
    field: "fecha_Registro",
    sortable: true,
  },
  {
    name: "enlace",
    align: "center",
    label: "Elaboró",
    field: "enlace",
    sortable: true,
  },
  {
    name: "valida_Area",
    align: "center",
    label: "Valida (Responsable de area)",
    field: "valida_Area",
    sortable: true,
  },
  {
    name: "coteja",
    align: "center",
    label: "Coteja",
    field: "coteja",
    sortable: true,
  },
  {
    name: "valida",
    align: "center",
    label: "Valida",
    field: "valida",
    sortable: true,
  },
  {
    name: "conteo_Cajas",
    align: "center",
    label: "Conteo",
    field: "conteo_Cajas",
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

const visible_columns = [
  "numero_Transferencia",
  "estatus",
  "nombre",
  "area_Responsable",
  "area_Generadora",
  "fecha_Registro",
  "enlace",
  "valida_Area",
  "coteja",
  "valida",
  "id",
];

const pagination = ref({
  //********** */
  page: 1,
  rowsPerPage: 10,
  sortBy: "name",
  descending: false,
});

const editar = async (id) => {
  $q.loading.show();
  await transferenciaPrimariaStore.loadEncabezado(id);
  transferenciaPrimariaStore.updateEditar(true);
  await espera();
  transferenciaPrimariaStore.actualizarModal(true);
  $q.loading.hide();
};

const toCajas = (id) => {
  router.push({
    name: "cajasTransferencias",
    params: { transferenciaId: id },
  });
};

const filter = ref("");

const enviarTransferencia = async (id) => {
  $q.dialog({
    title: "Envio de transferencia",
    message: "¿Esta seguro de enviar la transferencia?",
    icon: "Warning",
    persistent: true,
    transitionShow: "scale",
    transitionHide: "scale",
    ok: {
      color: "positive",
      label: "Sí! enviar",
    },
    cancel: {
      color: "negative",
      label: "Cancelar",
    },
  }).onOk(async () => {
    $q.loading.show();
    const resp = await transferenciaPrimariaStore.enviarTransferencia(id);
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

watch(areasLista, (newValue) => {
  cargaDatos(newValue);
});

const cargaDatos = async (dato) => {
  $q.loading.show();
  await transferenciaPrimariaStore.loadEncabezadosFiltro(dato);
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
    const resp =
      await transferenciaPrimariaStore.deleteTransferenciaPrimariaEncabezado(
        id
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
