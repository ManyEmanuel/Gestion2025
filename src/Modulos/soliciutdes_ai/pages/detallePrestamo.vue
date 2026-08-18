<template>
  <q-page padding>
    <div class="row">
      <div class="col">
        <div class="q-pa-md q-gutter-sm">
          <q-breadcrumbs>
            <q-breadcrumbs-el icon="home" to="/" />
            <q-breadcrumbs-el
              label="Cédula de prestamo de archivo institucional"
              icon="menu_book"
            />
            <q-breadcrumbs-el label="Documentos" icon="menu_book" />
          </q-breadcrumbs>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <h1 class="text-h6 text-purple-ieen q-px-md">Documentos de la cédula de préstamo institucional</h1>
      </div>
    </div>
    <div class="col-12 col-xs-6 col-md-4">
      <q-card flat bordered>
        <q-card-section>
          <div class="row" v-if="props.estatus == 'Aprobado'">
            <div class="col" v-if="isHistrico == false">
              <div class="text-right q-pa-md items-start q-gutter-md">
                <q-btn
                  type="button"
                  class="q-ma-sm"
                  color="purple-ieen"
                  icon-right="document_scanner"
                  label="Generar Anexo"
                  @click="generar_anexo(1)"
                />
                <q-btn
                  type="button"
                  class="q-ma-sm"
                  color="purple-ieen"
                  icon-right="document_scanner"
                  label="Generar recibo"
                  @click="generar_anexo(2)"
                />
              </div>
            </div>
            <div class="col" v-else>
              <div class="text-right q-pa-md items-start q-gutter-md">
                <q-btn
                  type="button"
                  class="q-ma-sm"
                  color="purple-ieen"
                  icon-right="document_scanner"
                  label="Generar Anexo"
                  @click="horarios = true"
                />
              </div>
            </div>
          </div>

          <q-form class="row q-col-gutter-xs">
            <div class="col-12 col-xs-6 col-md-4">
              <q-input
                readonly
                v-model="solicitud.area_Solicitante"
                label="Área solicitante"
              />
            </div>
            <div class="col-12 col-xs-6 col-md-4">
              <q-input
                readonly
                v-model="solicitud.area_Responsable"
                label="Área responsable"
              />
            </div>
            <div class="col-12 col-xs-6 col-md-4">
              <q-input
                readonly
                v-model="solicitud.folio_Solicitud"
                label="Folio solicitud"
              />
            </div>

            <div class="col-12 col-xs-6 col-md-4">
              <q-input
                stack-label
                readonly
                v-model="solicitud.fecha_Solicitada"
                label="Fecha de solicitud"
                hint="Fecha que se realizo la solicitud"
                type="date"
                lazy-rules
                :rules="[(val) => !!val || 'La fecha es requerida']"
              />
            </div>
            <div class="col-12 col-xs-6 col-md-4">
              <q-input
                stack-label
                v-model="solicitud.fecha_Posible_Devolucion"
                label="Fecha de devolución"
                hint="Fecha posible devolución"
                type="date"
                lazy-rules
                :rules="[(val) => !!val || 'La fecha es requerida']"
              />
            </div>
            <div class="col-12 col-xs-6 col-md-4">
              <q-input
                v-model="solicitud.solicitante"
                readonly
                label="Solicitante"
                lazy-rules
                :rules="[(val) => !!val || 'El empleado es requerido']"
              />
            </div>

            <div
              v-if="props.estatus == 'Rechazado'"
              class="col-12 col-xs-6 col-md-4"
            >
              <q-input
                v-model="solicitud.motivo_Rechazo"
                readonly
                label="Motivo de rechazo"
              />
            </div>
            <div class="col-12 col-xs-6 col-md-4">
              <q-checkbox label="Digital" v-model="solicitud.digital" disable />
            </div>
            <div class="col-12 col-xs-6 col-md-4">
              <q-checkbox label="Fisico" v-model="solicitud.fisico" disable />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
      <br />

      <Tabla_informacion />
      <ModalAdjuntoComp />
      <ModalViewer />

      <!-- <Tabla />
      <ModalAdjuntoComp />
      <ModalViewer />-->
    </div>
    <q-dialog
      v-model="comprobante"
      persistent
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card flat bordered style="width: 800px; max-width: 80vw">
        <q-bar class="bg-purple-ieen text-white">
          Datos de la solicitud
          <q-space />
          <q-btn dense flat icon="close" v-close-popup
  aria-label="Close"
>
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card-section>
          <h2 class="text-h6">
            Complete los datos para generar la cedula de prestamo
          </h2>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form>
            <div class="row q-col-gutter-sm">
              <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <q-input
                  v-model="solicitud.tipologia_Documental"
                  label="Topología documental"
                  autogrow
                />
              </div>
              <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <q-input
                  v-model="solicitud.num_Exp_legajos"
                  label="Número de expedientes o legajos"
                  autogrow
                />
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <div class="text-right q-gutter-xs">
            <BtnCancelar @click="comprobante = false" />
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
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog
      v-model="horarios"
      persistent
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card flat bordered style="width: 800px; max-width: 80vw">
        <q-bar class="bg-purple-ieen text-white">
          Datos de la solicitud
          <q-space />
          <q-btn dense flat icon="close" v-close-popup
  aria-label="Close"
>
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card-section>
          <h2 class="text-h6">
            Complete los datos para generar la cedula de prestamo del archivo
            historico
          </h2>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form>
            <div class="row q-col-gutter-sm">
              <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <q-input
                  filled
                  v-model="validaHorarios.prestamo"
                  mask="time"
                  :rules="['time']"
                  label="Hora de prestamo"
                >
                  <template v-slot:append>
                    <q-icon name="access_time" class="cursor-pointer">
                      <q-popup-proxy
                        cover
                        transition-show="scale"
                        transition-hide="scale"
                      >
                        <q-time
                          v-model="validaHorarios.prestamo"
                          color="purple-ieen"
                        >
                          <div class="row items-center justify-end">
                            <BtnCancelar />
                          </div>
                        </q-time>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <q-input
                  filled
                  v-model="validaHorarios.devolucion"
                  mask="time"
                  :rules="['time']"
                  label="Hora de devolución"
                >
                  <template v-slot:append>
                    <q-icon name="access_time" class="cursor-pointer">
                      <q-popup-proxy
                        cover
                        transition-show="scale"
                        transition-hide="scale"
                      >
                        <q-time
                          v-model="validaHorarios.devolucion"
                          color="purple-ieen"
                        >
                          <div class="row items-center justify-end">
                            <BtnCancelar />
                          </div>
                        </q-time>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <div class="text-right q-gutter-xs">
            <BtnCancelar @click="horarios = false" />
            <q-btn
              :loading="loading"
              type="button"
              color="secondary"
              label="Generar"
              icon="print"
              @click="genera_Anexo_historico"
            >
              <template v-slot:loading>
                <q-spinner-hourglass class="on-left" />
                Cargando...
              </template>
            </q-btn>
          </div>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { ref, onMounted, defineProps } from "vue";
import { useCedulaPrestamoStore } from "../../../stores/cedula_prestamo_store";
import { useDetalleCedulaPrestamoStore } from "../../../stores/detalle_cedula_prestamo";
import { useAdjuntoInventarioStore } from "../../../stores/adjunto_inventario_store";
import { genera_anexo_7 } from "../../../helpers/helper";
import { genera_anexo_8 } from "../../../helpers/anexo_08";
import { genera_anexo_11 } from "src/helpers/anexo_11";
import { genera_anexo_16 } from "src/helpers/anexo_16";
import Tabla_informacion from "../components/Tabla_informacion.vue";
import ModalAdjuntoComp from "../../inventarioAreaGral/components/ModalAdjuntosComp.vue";
import ModalViewer from "../../inventarioAreaGral/components/ModalVisorComp.vue";

//-----------------------------------------

import { useSolicitudPrestamoAiStore } from "../../../stores/solicitud_prestamo_ai_store";
import { useDetalleSolicitudAISotre } from "../../../stores/detalle_solicitud_prestamo_ai_store";
import BtnCancelar from "../../../components/BtnCancelar.vue";
//import Tabla from "../components/Tabla_Detalle_Aceptada.vue";
//import ModalAdjuntoComp from "../../inventarioAreaGral/components/ModalAdjuntosComp.vue";
//import ModalViewer from "../../inventarioAreaGral/components/ModalVisorComp.vue";
const $q = useQuasar();
const cedulaPrestamo = useCedulaPrestamoStore();
const detalleCedulaStore = useDetalleCedulaPrestamoStore();
const adjuntoStore = useAdjuntoInventarioStore();
const { registro, myLocale } = storeToRefs(cedulaPrestamo);
const comprobante = ref(false);
const horarios = ref(false);
const validaHorarios = ref({ prestamo: "", devolucion: "" });
//const { detalles } = storeToRefs(detalleCedulaStore);
const solicitudPrestamoStore = useSolicitudPrestamoAiStore();
const detalleStore = useDetalleSolicitudAISotre();

const { isLoading, solicitud, complementoAnexo } = storeToRefs(
  solicitudPrestamoStore
);
const { detalles, isHistrico } = storeToRefs(detalleStore);
function fechaHoy() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Mes en formato 2 dígitos
  const day = String(today.getDate()).padStart(2, "0"); // Día en formato 2 dígitos
  return `${year}/${month}/${day}`;
}
const datoscomprobante = ref({
  fecha: fechaHoy(),
  observaciones: "",
});

const props = defineProps({
  encabezadoId: {
    type: Number,
    required: true,
  },
  estatus: {
    type: String,
    required: true,
  },
});

onMounted(() => {
  cargaInformacion();
});

const cargaInformacion = async () => {
  await solicitudPrestamoStore.loadSolicitud(props.encabezadoId);
  await detalleStore.load_detalles(props.encabezadoId);
};

const generar_anexo = (tipo) => {
  const rows = [];
  if (tipo == 1) {
    if (
      solicitud.value.tipologia_Documental != null &&
      solicitud.value.num_Exp_legajos != null
    ) {
      detalles.value.forEach((element) => {
        rows.push([
          element.no_transferencia,
          element.Inventario_Clave_Clasificacion,
          element.fecha_Inicio,
          element.ubicacion,
          element.no_interno,
          element.descripcion,
          element.observaciones,
        ]);
      });
      //if (solicitud.value.clasificado == false) {
      genera_anexo_11(solicitud.value, rows, complementoAnexo.value, 1, "");
      //} else {
      // genera_anexo_7(solicitud.value, rows, complementoAnexo.value, 1, "");
      //}
    } else {
      comprobante.value = true;
    }
  } else {
    if (
      solicitud.value.tipologia_Documental != null &&
      solicitud.value.num_Exp_legajos != null
    ) {
      detalles.value.forEach((element) => {
        rows.push([
          element.no_transferencia,
          element.Inventario_Clave_Clasificacion,
          element.fecha_Inicio,
          element.ubicacion,
          element.no_interno,
          element.descripcion,
          element.observaciones,
        ]);
      });
      //if (solicitud.value.clasificado == false) {
      genera_anexo_11(solicitud.value, rows, complementoAnexo.value, 2, "");
    }
  }
};

const genera_Anexo_historico = () => {
  const rows = [];
  console.log(detalles.value);
  detalles.value.forEach((element) => {
    rows.push([
      element.Inventario_Clave_Clasificacion,
      element.ubicacion,
      element.descripcion,
      element.observaciones,
    ]);
  });
  genera_anexo_16(rows, solicitud.value, validaHorarios.value);
};

const onSubmit = async () => {
  $q.loading.show();
  let resp = null;
  resp = await solicitudPrestamoStore.update(solicitud.value);

  if (resp.success) {
    const rows = [];
    detalles.value.forEach((element) => {
      rows.push([
        element.no_transferencia,
        element.Inventario_Clave_Clasificacion,
        element.fecha_Inicio,
        element.ubicacion,
        element.no_interno,
      ]);
    });
    //if (solicitud.value.clasificado == false) {
    genera_anexo_11(solicitud.value, rows, complementoAnexo.value, 1, "");
    comprobante.value = false;
  } else {
    $q.notify({
      type: "negative",
      message: resp.data,
    });
  }
  $q.loading.hide();
};

const onSubmitHorario = async () => {
  $q.loading.show();
  l;
  const rows = [];
  detalles.value.forEach((element) => {
    rows.push([
      element.no_transferencia,
      element.Inventario_Clave_Clasificacion,
      element.fecha_Inicio,
      element.ubicacion,
      element.no_interno,
    ]);
  });
  //if (solicitud.value.clasificado == false) {
  genera_anexo_11(solicitud.value, rows, complementoAnexo.value, 1, "");
  horarios.value = false;
};
</script>

<style>
</style>
