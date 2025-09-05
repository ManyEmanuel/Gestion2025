<template>
  <div class="row">
    <div class="col">
      <q-table
        :rows="cajas"
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
                  v-if="
                    modulo == null
                      ? false
                      : modulo.actualizar &&
                        (encabezado.estatus == 'Pendiente' ||
                          encabezado.estatus == 'Con observaciones')
                  "
                  flat
                  round
                  color="purple-ieen"
                  icon="edit"
                  @click="editar(col.value)"
                >
                  <q-tooltip>Editar registro</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="
                    modulo == null
                      ? false
                      : modulo.eliminar && encabezado.estatus == 'Pendiente'
                  "
                  flat
                  round
                  color="purple-ieen"
                  icon="delete"
                  @click="eliminar(col.value)"
                >
                  <q-tooltip>Eliminar registro</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="purple-ieen"
                  icon="description"
                  @click="GenerarAnexo13(col.value)"
                >
                  <q-tooltip>Anexo 13</q-tooltip>
                </q-btn>
              </div>
              <label v-else>{{ col.value }}</label>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>
  <q-dialog v-model="posicion" persistent>
    <q-card style="width: 800px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">
          Complete la siguiente información para generar el anexo 13
        </div>
      </q-card-section>

      <q-separator />
      <q-card-section>
        <div class="text-subtitle2">
          Llene todos los campos para cumplir con el formato de ubicación
        </div>
      </q-card-section>
      <q-card-section>
        <q-form class="row q-col-gutter-xs" @submit="onSubmit">
          <div class="col-12 col-xs-12 col-md-12">
            <q-input
              v-model="ubicacion.inmueble"
              label="Anaquel"
              autogrow
              lazy-rules
              :rules="[(val) => !!val || 'El Anaquel es requerido']"
            />
          </div>
          <div class="col-12 col-xs-12 col-md-12">
            <q-input
              v-model="ubicacion.pasillo"
              label="Pasillo"
              autogrow
              lazy-rules
              :rules="[(val) => !!val || 'El Pasillo es requerido']"
            />
          </div>
          <div class="col-12 col-xs-12 col-md-12">
            <q-input
              v-model="ubicacion.estante"
              label="Estante"
              autogrow
              lazy-rules
              :rules="[(val) => !!val || 'El Estante es requerido']"
            />
          </div>
          <div class="col-12 col-xs-12 col-md-12">
            <q-input
              v-model="ubicacion.nivel"
              label="Caja"
              autogrow
              lazy-rules
              :rules="[(val) => !!val || 'La caja es requerido']"
            />
          </div>

          <div class="col-12 justify-end">
            <div class="text-right q-gutter-xs">
              <q-btn
                color="red"
                label="Cancelar"
                @click="posicion = false"
                icon="highlight_off"
              />
              <q-btn
                type="submit"
                color="secondary"
                label="Generar"
                icon="print"
              >
              </q-btn>
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../../../stores/auth_store";
import { onBeforeMount, ref } from "vue";
import { genera_anexo_13 } from "../../../helpers/anexo_13";
import { useTransferenciaSecundariaEncabezadoStore } from "../../../stores/transferencia_secundaria_encabezado_store";
import { useCajaTransferenciaSecundariaterStore } from "../../../stores/caja_transferencia_secundaria_store";
import { useDetalleCajaTransferenciaSecundariaStore } from "../../../stores/detalle_caja_transferencia_secundaria_store";
import { useCajaTransferenciaStore } from "../../../stores/caja_trasnferencia_store";

const $q = useQuasar();
const posicion = ref(false);
const authStore = useAuthStore();
const transferenciaStore = useTransferenciaSecundariaEncabezadoStore();
const cajaStore = useCajaTransferenciaSecundariaterStore();
const detalleCajaStore = useDetalleCajaTransferenciaSecundariaStore();
const cajaTransferenciaStore = useCajaTransferenciaStore();
const { modulo } = storeToRefs(authStore);
const { encabezado } = storeToRefs(transferenciaStore);
const { cajas, isLoading, caja, ubicacion } = storeToRefs(cajaStore);
const { detalles } = storeToRefs(detalleCajaStore);
const cajaId = ref();

const props = defineProps({
  transferenciaId: Number,
});

onBeforeMount(() => {
  cajaStore.loadCajas(props.transferenciaId);
});

const columns = [
  {
    name: "no_Caja",
    align: "center",
    label: "No. Caja",
    field: "no_Caja",
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
    name: "seccion",
    align: "center",
    label: "Sección",
    field: "seccion",
    sortable: true,
  },
  {
    name: "peso",
    align: "center",
    label: "Peso (Kilogramos)",
    field: "peso",
    sortable: true,
  },
  {
    name: "fecha_Antigua",
    align: "center",
    label: "Fecha antigua",
    field: "fecha_Antigua",
    sortable: true,
  },
  {
    name: "fecha_Reciente",
    align: "center",
    label: "Fecha reciente",
    field: "fecha_Reciente",
    sortable: true,
  },
  {
    name: "total_Paginas",
    align: "center",
    label: "Total hojas",
    field: "total_Paginas",
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
  cajaStore.updateEditar(true);
  await cajaStore.loadCaja(id);
  await detalleCajaStore.load_detalles(id);
  cajaStore.actualizarModal(true);
  $q.loading.hide();
};

const GenerarAnexo13 = async (id) => {
  $q.loading.show();
  posicion.value = true;
  cajaId.value = id;
  /*await cajaStore.loadCaja(id);
  await detalleCajaStore.load_detalles(id);
  let transferencia = encabezado.value.no_Transferencia;
  let area = encabezado.value.area_Generadora;
  let Nocaja = caja.value.no_Caja;
  genera_anexo_13("Historico", transferencia, area, Nocaja, detalles.value);*/

  $q.loading.hide();
};

const onSubmit = async () => {
  $q.loading.show();
  let resp = null;
  resp = await cajaTransferenciaStore.createUbicacionHistorico(
    ubicacion.value,
    cajaId.value
  );
  if (resp.success) {
    $q.notify({
      type: "positive",
      message: resp.data,
    });
    await cajaStore.loadCaja(cajaId.value);
    await detalleCajaStore.load_detalles(cajaId.value);
    await cajaStore.initUbicacion();
    let transferencia = encabezado.value.no_Transferencia;
    let area = encabezado.value.area_Generadora;
    let Nocaja = caja.value.no_Caja;
    genera_anexo_13("Historico", transferencia, area, Nocaja, detalles.value);
    posicion.value = false;
    detalleCajaStore.detalles.value = [];
  } else {
    $q.notify({
      type: "negative",
      message: resp.data,
    });
  }

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
    const resp = await cajaStore.deleteCaja(id, props.transferenciaId);
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
