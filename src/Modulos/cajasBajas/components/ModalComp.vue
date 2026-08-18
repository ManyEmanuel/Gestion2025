<template>
  <q-dialog
    v-model="modal"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card flat bordered style="width: 800px; max-width: 80vw">
      <q-card-section class="row">
        <div class="text-h6">Caja de baja documental</div>
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
              :readonly="soloLectura"
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
              :readonly="soloLectura"
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
              :readonly="soloLectura"
              lazy-rules
              :rules="[(val) => !!val || 'La sección es requerida']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="caja.fecha_Antigua"
              label="Año mas antiguo"
              type="Number"
              :readonly="soloLectura"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="caja.fecha_Reciente"
              label="Año mas reciente"
              type="Number"
              :readonly="soloLectura"
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
        <RegistroDetalleComp
          v-if="encabezado.estatus == 'Borrador'"
          :bajaId="transferenciaId"
        />
      </q-card-section>
      <br />
      <q-card-section>
        <TablaDetalle />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="col-12 justify-end">
          <div class="text-right q-gutter-xs">
            <BtnCancelar @click="actualizarModal(false)" />
            <!-- Corte: la caja es inmutable en el backend nuevo (sin update de noCaja/peso/años). En
                 edición el modal solo AGREGA expedientes (cada uno se persiste al vuelo vía
                 RegistroDetalleComp); por eso Guardar solo aparece al crear una caja en Borrador. -->
            <q-btn
              v-if="!isEditar && encabezado.estatus == 'Borrador'"
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
import { computed, onBeforeMount, ref, watch, watchEffect } from "vue";
import { useCajaBajaDocumentalStore } from "../../../stores/caja_baja_documental";
import { useSeccionStore } from "../../../stores/secciones_store";
import { useDetalleCajaBajaStore } from "../../../stores/detalle_caja_baja_store";
import { useInventarioAreaStore } from "../../../stores/inventario_area_store";
import { useBajaDocumentalStore } from "../../../stores/baja_documental_store";

import { espera } from "../../../helpers/helper";
import RegistroDetalleComp from "../components/RegistroDetalleComp.vue";
import TablaDetalle from "../components/TablaDetalleComp.vue";
import BtnCancelar from "../../../components/BtnCancelar.vue";
const $q = useQuasar();
const cajaStore = useCajaBajaDocumentalStore();
const seccionStore = useSeccionStore();
const detalleCajaStore = useDetalleCajaBajaStore();
const inventariosAreaStore = useInventarioAreaStore();
const bajaStore = useBajaDocumentalStore();

const { listaSecciones } = storeToRefs(seccionStore);
const { caja, cajas, modal, isEditar } = storeToRefs(cajaStore);
const { arrayDetalles } = storeToRefs(detalleCajaStore);
const { encabezado } = storeToRefs(bajaStore);

const seccionId = ref(null);
const loading = ref(false);
const myForm = ref(null);
const props = defineProps({
  // Corte al backend nuevo: los ids de baja son Guids (string), no enteros.
  transferenciaId: String,
});

// Corte: al editar una caja (o fuera de Borrador) los campos de la caja son de solo-lectura; el
// backend nuevo no actualiza la caja, en edición solo se agregan expedientes.
const soloLectura = computed(
  () => isEditar.value == true || encabezado.value.estatus != "Borrador"
);

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

// Corte al backend nuevo: el picker filtra por el área del usuario (JWT) y excluye las claves ya
// capturadas en las cajas de la baja; los años/secciones ya no filtran el endpoint (se conservan
// como metadatos de la caja / filtro local por año en el RegistroDetalle).
const cargarInventariosopt = async () => {
  $q.loading.show();
  await inventariosAreaStore.loadInventariosBajaOpt(cajas.value);
  $q.loading.hide();
};

const cargarSeccion = async (val) => {
  // TODO(ux-audit): revisar si este delay compensa una transición real o reactividad no otorgada
  await espera(200);
  let array_secciones = [];
  (val.seccion_Id || []).forEach((element) => {
    const seccionFiltrada = listaSecciones.value.find(
      (x) => x.value == `${element}`
    );
    array_secciones.push(seccionFiltrada);
  });

  seccionId.value = array_secciones;
};

const onSubmit = async () => {
  const valido = await myForm.value.validate();
  if (valido == true) {
    const secciones_Id = seccionId.value.map((x) => x.value);
    caja.value.secciones = secciones_Id;
    caja.value.detalle = arrayDetalles.value;
    let resp = null;
    $q.loading.show();
    // Corte: solo el alta (crear caja). El backend nuevo no actualiza la caja (inmutable); en
    // edición el modal solo agrega expedientes (Guardar está oculto), así que aquí no hay updateCaja.
    resp = await cajaStore.createCaja(props.transferenciaId, caja.value);
    $q.loading.hide();
    if (resp.success) {
      $q.notify({ type: "positive", message: resp.data });
      actualizarModal();
    } else {
      $q.notify({ type: "negative", message: resp.data });
    }
  }
};
</script>
