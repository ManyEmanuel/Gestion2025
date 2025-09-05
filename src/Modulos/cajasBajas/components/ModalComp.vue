<template>
  <q-dialog
    v-model="modal"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card style="width: 800px; max-width: 80vw">
      <q-card-section class="row">
        <div class="text-h6">Caja de transferencia {{}}</div>
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
      <q-card-section>
        <q-form class="row q-col-gutter-xs" ref="myForm">
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="caja.no_Caja"
              label="No. Caja"
              hint="Ingrese número de caja"
              type="Number"
              lazy-rules
              :rules="[(val) => !!val || 'El numero de caja es requerido']"
            />
          </div>

          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="caja.peso"
              label="Peso ( Kilogramos)"
              hint="Ingrese peso"
              type="Number"
            />
          </div>
          <div class="col-12 col-xs-12 col-md-12">
            <q-select
              :options="listaSecciones"
              v-model="seccionId"
              multiple
              counter
              label="Seccion"
              hint="Seleccione sección"
              lazy-rules
              :rules="[(val) => !!val || 'La sección es requerida']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="caja.fecha_Antigua"
              label="Año mas antiguo"
              type="Number"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="caja.fecha_Reciente"
              label="Año mas reciente"
              type="Number"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="caja.total_Expedientes"
              label="Total expedientes"
              type="Number"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="caja.total_Paginas"
              label="Total hojas"
              type="Number"
              readonly
            />
          </div>
        </q-form>
      </q-card-section>
      <q-separator />
      <br />
      <q-card-section>
        <RegistroDetalleComp />
      </q-card-section>
      <br />
      <q-card-section>
        <TablaDetalle />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="col-12 justify-end">
          <div class="text-right q-gutter-xs">
            <q-btn
              color="red"
              label="Cancelar"
              @click="actualizarModal(false)"
              icon="highlight_off"
            />
            <q-btn
              :loading="loading"
              type="button"
              color="secondary"
              label="Guardar"
              icon="save"
              @click="onSubmit"
            >
              <template v-slot:loading>
                <q-spinner-hourglass class="on-left" />
                Cargando...
              </template>
            </q-btn>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>


<script setup>
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref, watch, watchEffect } from "vue";
import { useCajaBajaDocumentalStore } from "../../../stores/caja_baja_documental";
import { useSeccionStore } from "../../../stores/secciones_store";
import { useDetalleCajaBajaStore } from "../../../stores/detalle_caja_baja_store";
import { useInventarioAreaStore } from "../../../stores/inventario_area_store";
import { useBajaDocumentalStore } from "../../../stores/baja_documental_store";

import { espera } from "../../../helpers/helper";
import RegistroDetalleComp from "../components/RegistroDetalleComp.vue";
import TablaDetalle from "../components/TablaDetalleComp.vue";
const $q = useQuasar();
const cajaStore = useCajaBajaDocumentalStore();
const seccionStore = useSeccionStore();
const detalleCajaStore = useDetalleCajaBajaStore();
const inventariosAreaStore = useInventarioAreaStore();
const transferenciaStore = useBajaDocumentalStore();

const { listaSecciones } = storeToRefs(seccionStore);
const { caja, modal, isEditar } = storeToRefs(cajaStore);
const { arrayDetalles } = storeToRefs(detalleCajaStore);
const { encabezado } = storeToRefs(transferenciaStore);

const seccionId = ref(null);
const loading = ref(false);
const myForm = ref(null);
const props = defineProps({
  transferenciaId: Number,
});

onBeforeMount(() => {
  seccionStore.loadListaSecciones();
});

const actualizarModal = (valor) => {
  cajaStore.initCaja();
  detalleCajaStore.init_array_detalle();
  detalleCajaStore.init_detalle();
  seccionId.value = null;
  cajaStore.actualizarModal(false);
};

watch(caja.value, (val) => {
  if (isEditar.value == true) {
    cargarSeccion(val);
  }
});

watchEffect(() => {
  if (
    seccionId.value != null &&
    caja.value.fecha_Antigua != null &&
    caja.value.fecha_Reciente != null &&
    caja.value.fecha_Antigua.toString().length === 4 &&
    caja.value.fecha_Reciente.toString().length === 4
  ) {
    cargarInventariosopt();
  }
});

const cargarInventariosopt = async () => {
  $q.loading.show();
  await inventariosAreaStore.loadInventariosByAreaOptAI(
    seccionId.value,
    encabezado.value.area_Generadora_Id,
    caja.value.fecha_Antigua,
    caja.value.fecha_Reciente
  );
  $q.loading.hide();
};

const cargarSeccion = async (val) => {
  await espera(200);
  let array_secciones = [];
  val.seccion_Id.forEach((element) => {
    const seccionFiltrada = listaSecciones.value.find(
      (x) => x.value == `${element}`
    );
    array_secciones.push(seccionFiltrada);
  });

  seccionId.value = array_secciones;
};

const onSubmit = async () => {
  console.log(isEditar.value);
  const valido = await myForm.value.validate();
  if (valido == true) {
    const secciones_Id = seccionId.value.map((x) => x.value);
    caja.value.secciones = secciones_Id;
    caja.value.detalle = arrayDetalles.value;
    let resp = null;
    $q.loading.show();
    if (isEditar.value == true) {
      resp = await cajaStore.updateCaja(props.transferenciaId, caja.value);
    } else {
      resp = await cajaStore.createCaja(props.transferenciaId, caja.value);
    }
    $q.loading.hide();
    if (resp.success) {
      $q.notify({
        type: "positive",
        message: resp.data,
      });
      actualizarModal();
    } else {
      $q.notify({
        type: "negative",
        message: resp.data,
      });
    }
    $q.loading.hide();
  }
};
</script>
