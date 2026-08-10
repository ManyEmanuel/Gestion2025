<template>
  <q-dialog
    v-model="modal"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card style="width: 800px; max-width: 80vw">
      <q-card-section class="row">
        <div class="text-h6">Caja de transferencia</div>
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
              :readonly="
                encabezado.estatus == 'Afectado' ||
                encabezado.estatus == 'Enviado'
              "
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
              :readonly="
                encabezado.estatus == 'Afectado' ||
                encabezado.estatus == 'Enviado'
              "
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="caja.fecha_Antigua"
              label="Año mas antiguo"
              type="Number"
              :readonly="
                encabezado.estatus == 'Afectado' ||
                encabezado.estatus == 'Enviado'
              "
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="caja.fecha_Reciente"
              label="Año mas reciente"
              type="Number"
              :readonly="
                encabezado.estatus == 'Afectado' ||
                encabezado.estatus == 'Enviado'
              "
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
              :readonly="
                encabezado.estatus == 'Afectado' ||
                encabezado.estatus == 'Enviado'
              "
            />
          </div>
        </q-form>
      </q-card-section>
      <q-separator />
      <br />
      <q-card-section>
        <RegistroDetalle
          v-if="
            encabezado.estatus != 'Afectado' && encabezado.estatus != 'Enviado'
          "
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
            <q-btn
              color="red"
              label="Cancelar"
              @click="actualizarModal(false)"
              icon="highlight_off"
            />
            <q-btn
              v-if="
                encabezado.estatus != 'Afectado' &&
                encabezado.estatus != 'Enviado'
              "
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
import { useAuthStore } from "../../../stores/auth_store";
import { useCajaTransferenciaStore } from "../../../stores/caja_trasnferencia_store";
import { useSeccionStore } from "../../../stores/secciones_store";
import { useDetalleCajaTransferenciaStore } from "../../../stores/detalle_caja_Transferencia";
import { useInventarioAreaStore } from "../../../stores/inventario_area_store";
import { useTransferenciaPrimariaEncabezadoStore } from "../../../stores/transferencia_primaria_encabezado_store";
import { onBeforeMount, ref, watch } from "vue";
import { espera } from "../../../helpers/helper";
import RegistroDetalle from "../components/RegistroDetalleComp.vue";
import TablaDetalle from "../components/Tabla_Detalle.vue";

const $q = useQuasar();
const cajaTransferenciaStore = useCajaTransferenciaStore();
const seccionStore = useSeccionStore();
const detalleCaja = useDetalleCajaTransferenciaStore();
const inventariosAreas = useInventarioAreaStore();
const transferenciaPrimariaStore = useTransferenciaPrimariaEncabezadoStore();
const { listaSecciones } = storeToRefs(seccionStore);
const { caja, modal, isEditar, cajas } = storeToRefs(cajaTransferenciaStore);
const { arrayDetalles } = storeToRefs(detalleCaja);
const { encabezado } = storeToRefs(transferenciaPrimariaStore);
const siglas = "AI-CJS-TRANS";
const seccionId = ref(null);
const loading = ref(false);
const myForm = ref(null);

const props = defineProps({
  transferenciaId: Number,
});

onBeforeMount(() => {
  seccionStore.loadListaSecciones();
});

const loadTransferencia = async () => {
  $q.loading.show();
  await transferenciaPrimariaStore.loadEncabezado(props.transferenciaId);
  $q.loading.hide();
};

const actualizarModal = (valor) => {
  cajaTransferenciaStore.initCaja();
  detalleCaja.initDetalle();
  detalleCaja.initArrayDetalle();
  seccionId.value = null;
  cajaTransferenciaStore.actualizarModal(valor);
};

watch(caja.value, (val) => {
  if (isEditar.value == true) {
    cargarSeccion(val);
  }
});

watch(seccionId, (val) => {
  setTimeout(() => {
    cargarInventariosopt(val);
  }, 100);
});

const cargarInventariosopt = async (val) => {
  if (val == null) return;
  $q.loading.show();
  await inventariosAreas.loadInventariosAreaOpt(
    val,
    caja.value.fecha_Antigua,
    caja.value.fecha_Reciente,
    cajas.value
  );
  $q.loading.hide();
};

const cargarSeccion = async (val) => {
  $q.loading.show();
  await espera(500);
  let array_secciones = [];
  val.secciones_Id.forEach((element) => {
    const seccionFiltrada = listaSecciones.value.find(
      (x) => x.value == `${element}`
    );
    array_secciones.push(seccionFiltrada);
  });

  seccionId.value = array_secciones;
  await espera(500);
  cargarInventariosopt(seccionId.value);
  $q.loading.hide();
};

const onSubmit = async () => {
  const valido = await myForm.value.validate();
  if (valido == true) {
    const secciones_Id = seccionId.value.map((x) => x.value);
    caja.value.secciones = secciones_Id;
    let resp = null;
    loading.value = true;
    if (isEditar.value == true) {
      resp = await cajaTransferenciaStore.updateCaja(
        props.transferenciaId,
        caja.value.id,
        caja.value
      );
    } else {
      caja.value.detalle = arrayDetalles.value;
      resp = await cajaTransferenciaStore.createCaja(
        props.transferenciaId,
        caja.value
      );
    }
    if (resp.success) {
      $q.notify({
        type: "positive",
        message: resp.data,
      });
      loading.value = false;

      actualizarModal(false);
    } else {
      $q.notify({
        type: "negative",
        message: resp.data,
      });
      loading.value = false;
    }
  }
};
</script>
