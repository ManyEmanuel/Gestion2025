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
                  v-if="modulo == null ? false : modulo.actualizar"
                  flat
                  round
                  color="purple-ieen"
                  icon="visibility"
                  @click="ver(col.value)"
                >
                  <q-tooltip>ver registro</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="modulo == null ? false : modulo.actualizar"
                  flat
                  round
                  color="purple-ieen"
                  icon="inventory_2"
                  @click="cargarDatos(col.value)"
                >
                  <q-tooltip>Generar anexo 10</q-tooltip>
                </q-btn>
              </div>
              <label v-else>{{ col.value }}</label>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>
  <q-dialog v-model="fixed" persistent>
    <q-card style="width: 800px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">
          Complete la siguiente información para generar el anexo 10
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
              label="Inmueble"
              autogrow
              lazy-rules
              :rules="[(val) => !!val || 'El Inmueble es requerido']"
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
              label="Nivel"
              autogrow
              lazy-rules
              :rules="[(val) => !!val || 'El Nivel es requerido']"
            />
          </div>
          <div v-if="textoIgual == true" class="text-subtitle2">
            Ubicación ya registrada, en caso de realizar un cambio, impactara en
            el inventario
          </div>
          <div class="col-12 justify-end">
            <div class="text-right q-gutter-xs">
              <q-btn
                color="red"
                label="Cancelar"
                @click="cancelar()"
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
import { useCajaTransferenciaStore } from "../../../stores/caja_trasnferencia_store";
import { useDetalleCajaTransferenciaStore } from "../../../stores/detalle_caja_Transferencia";
import { useTransferenciaPrimariaEncabezadoStore } from "../../../stores/transferencia_primaria_encabezado_store";
import { onBeforeMount, ref } from "vue";
import { espera } from "../../../helpers/helper";
import { genera_anexo_10 } from "../../../helpers/anexo_10";

const $q = useQuasar();
const authStore = useAuthStore();
const cajaTransferenciaStore = useCajaTransferenciaStore();
const detalleCajaTransferencia = useDetalleCajaTransferenciaStore();
const transferenciaPrimariaStore = useTransferenciaPrimariaEncabezadoStore();
const { modulo } = storeToRefs(authStore);
const { cajas, isLoading, caja, ubicacion } = storeToRefs(
  cajaTransferenciaStore
);
const { arrayDetalles, detalles } = storeToRefs(detalleCajaTransferencia);
const { encabezado } = storeToRefs(transferenciaPrimariaStore);
const fixed = ref(false);
let cajaId = 0;
const textoIgual = ref(false);

const props = defineProps({
  transferenciaId: Number,
});

onBeforeMount(() => {
  cajaTransferenciaStore.loadCajas(props.transferenciaId);
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

const cancelar = async () => {
  $q.loading.show();
  fixed.value = false;
  cajaTransferenciaStore.initUbicacion();
  textoIgual.value = false;
  $q.loading.hide();
};

const ver = async (id) => {
  $q.loading.show();
  await cajaTransferenciaStore.loadCaja(props.transferenciaId, id);
  cajaTransferenciaStore.actualizarModalAI(true);
  $q.loading.hide();
};

const cargarDatos = async (id) => {
  $q.loading.show();
  textoIgual.value = false;
  await cajaTransferenciaStore.loadCaja(props.transferenciaId, id);
  await detalleCajaTransferencia.loadDetalles(id, caja.value.ubicacion);

  await cargarUbicacion(detalles.value);
  fixed.value = true;
  cajaId = id;
  $q.loading.hide();
};

const cargarUbicacion = async (detalle) => {
  $q.loading.show();
  if (detalle.length > 0) {
    let ubicacionRegistrada = detalle[0].ubicacion;

    if (ubicacionRegistrada != "" && ubicacionRegistrada != null) {
      let filtroUbicacion = ubicacionRegistrada.split("|");
      if (filtroUbicacion.length == 4) {
        ubicacion.value.inmueble = filtroUbicacion[0];
        ubicacion.value.pasillo = filtroUbicacion[1];
        ubicacion.value.estante = filtroUbicacion[2];
        ubicacion.value.nivel = filtroUbicacion[3];
        textoIgual.value = true;
      }
    }
  } else {
    ubicacion.value.inmueble = "";
    ubicacion.value.pasillo = "";
    ubicacion.value.estante = "";
    ubicacion.value.nivel = "";
  }

  $q.loading.hide();
};

const onSubmit = async () => {
  $q.loading.show();
  let resp = null;
  resp = await cajaTransferenciaStore.createUbicacion(ubicacion.value, cajaId);
  if (resp.success) {
    $q.notify({
      type: "positive",
      message: resp.data,
    });
    await anexo10();
    await cancelar();
  } else {
    $q.notify({
      type: "negative",
      message: resp.data,
    });
  }

  $q.loading.hide();
};

const anexo10 = async (id) => {
  $q.loading.show();
  genera_anexo_10(
    caja.value,
    detalles.value,
    encabezado.value,
    ubicacion.value
  );
  $q.loading.hide();
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
