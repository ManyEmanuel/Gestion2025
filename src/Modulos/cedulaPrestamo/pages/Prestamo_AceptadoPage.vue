<template>
  <q-page padding>
    <div class="row">
      <div class="col">
        <div class="q-pa-md q-gutter-sm">
          <q-breadcrumbs>
            <q-breadcrumbs-el icon="home" to="/" />
            <q-breadcrumbs-el
              label="Cédula de prestamo de expediente"
              icon="menu_book"
            />
            <q-breadcrumbs-el label="Documentos" icon="menu_book" />
          </q-breadcrumbs>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <h1 class="text-h6 text-purple-ieen q-px-md">Documentos de la cédula de préstamo</h1>
      </div>
    </div>
    <div class="col-12 col-xs-6 col-md-4">
      <q-card flat bordered>
        <q-card-section>
          <div class="row">
            <div class="col">
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
          </div>
          <q-form class="row q-col-gutter-xs">
            <div class="col-12 col-xs-6 col-md-4">
              <q-input
                readonly
                v-model="registro.area_Solicitante"
                label="Área solicitante"
              />
            </div>
            <div class="col-12 col-xs-6 col-md-4">
              <q-input
                readonly
                v-model="registro.folio_Solicitud"
                label="Folio solicitud"
              />
            </div>
            <div class="col-12 col-xs-6 col-md-4">
              <q-input
                readonly
                v-model="registro.folio"
                label="Folio prestamo"
              />
            </div>
            <div class="col-12 col-xs-6 col-md-4">
              <q-input
                stack-label
                readonly
                v-model="registro.fecha_Prestamo"
                label=""
                hint="Fecha prestamo"
                type="date"
                lazy-rules
                :rules="[(val) => !!val || 'La fecha es requerida']"
              />
            </div>
            <div class="col-12 col-xs-6 col-md-4">
              <q-input
                stack-label
                v-model="registro.fecha_Devolucion"
                label=""
                hint="Fecha devolución"
                type="date"
                lazy-rules
                :rules="[(val) => !!val || 'La fecha es requerida']"
              />
            </div>
            <div class="col-12 col-xs-6 col-md-4">
              <q-input
                v-model="registro.solicitante"
                readonly
                label="Solicitante"
                lazy-rules
                :rules="[(val) => !!val || 'El empleado es requerido']"
              />
            </div>
            <div class="col-12 col-xs-6 col-md-4">
              <q-checkbox label="Digital" v-model="registro.digital" disable />
            </div>
            <div class="col-12 col-xs-6 col-md-4">
              <q-checkbox label="Fisico" v-model="registro.fisico" disable />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
      <br />
      <Tabla />
      <ModalAdjuntoComp />
      <ModalViewer />
    </div>
    <q-dialog
      v-model="comprobante"
      persistent
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card flat bordered style="width: 800px; max-width: 80vw">
        <q-bar class="bg-purple-ieen text-white">
          Datos de comprobante
          <q-space />
          <q-btn dense flat icon="close" v-close-popup
  aria-label="Close"
>
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card-section>
          <h2 class="text-h6">
            Complete los datos para generar el comprobante de devolución
          </h2>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form>
            <div class="row q-col-gutter-sm">
              <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <q-input
                  v-model="datoscomprobante.observaciones"
                  label="Observaciones de la entrega"
                  autogrow
                />
              </div>
              <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <q-input
                  label="Fecha de entrega"
                  v-model="datoscomprobante.fecha"
                  mask="date"
                  :rules="['date']"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy
                        transition-show="scale"
                        transition-hide="scale"
                      >
                        <q-date
                          v-model="datoscomprobante.fecha"
                          :locale="myLocale"
                          color="purple"
                        >
                          <div class="row items-center justify-end">
                            <q-btn
                              v-close-popup
                              label="Listo"
                              color="purple"
                              flat
                            />
                          </div>
                        </q-date>
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
            <BtnCancelar @click="comprobante = false" />
            <q-btn
              :loading="loading"
              type="button"
              color="secondary"
              label="Generar"
              icon="print"
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
import Tabla from "../components/Tabla_Detalle_Aceptada.vue";
import ModalAdjuntoComp from "../../inventarioAreaGral/components/ModalAdjuntosComp.vue";
import ModalViewer from "../../inventarioAreaGral/components/ModalVisorComp.vue";
import BtnCancelar from "../../../components/BtnCancelar.vue";
const $q = useQuasar();
const cedulaPrestamo = useCedulaPrestamoStore();
const detalleCedulaStore = useDetalleCedulaPrestamoStore();
const adjuntoStore = useAdjuntoInventarioStore();
const { registro, complementoAnexo, myLocale } = storeToRefs(cedulaPrestamo);
const { detalles } = storeToRefs(detalleCedulaStore);
const comprobante = ref(false);
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
});

onMounted(() => {
  cedulaPrestamo.loadPrestamo(props.encabezadoId);
  detalleCedulaStore.loadDetalles(props.encabezadoId);
});

const generar_anexo = (tipo) => {
  const rows = [];
  if (tipo == 1) {
    detalles.value.forEach((element) => {
      const arr_clave = element.inventario_Clave_Clasificacion.split("/");
      rows.push([
        element.inventario_Clave_Clasificacion,
        element.fecha_Inicio_Conclusion,
        element.ubicacion,
        arr_clave[3],
        element.descripcion,
        element.observaciones,
      ]);
    });
    if (registro.value.clasificado == true) {
      genera_anexo_8(registro.value, rows, complementoAnexo.value, 1, "");
    } else {
      genera_anexo_7(registro.value, rows, complementoAnexo.value, 1, "");
    }
  } else {
    comprobante.value = true;
  }
};

const onSubmit = async () => {
  $q.loading.show();
  // Horizonte-0 #11: antes esto solo generaba el PDF sin avisar al backend, así que el préstamo
  // autorizado nunca transicionaba a "Devuelto" en el sistema de registro. Se avisa al backend primero;
  // si falla, no se genera el comprobante ni se cierra el diálogo (mismo patrón que otros flujos ya
  // corregidos: no producir un documento con apariencia de válido si la operación real falló).
  const resp = await cedulaPrestamo.devolver(registro.value.id);
  if (!resp.success) {
    $q.loading.hide();
    $q.notify({
      type: "negative",
      message: resp.data,
    });
    return;
  }

  const rows = [];
  detalles.value.forEach((element) => {
    const arr_clave = element.inventario_Clave_Clasificacion.split("/");
    rows.push([
      element.inventario_Clave_Clasificacion,
      element.fecha_Inicio_Conclusion,
      element.ubicacion,
      arr_clave[3],
      element.descripcion,
      element.observaciones,
    ]);
  });
  if (registro.value.clasificado == true) {
    genera_anexo_8(
      registro.value,
      rows,
      complementoAnexo.value,
      2,
      datoscomprobante.value
    );
  } else {
    genera_anexo_7(
      registro.value,
      rows,
      complementoAnexo.value,
      2,
      datoscomprobante.value
    );
  }
  comprobante.value = false;
  $q.loading.hide();
};
</script>

<style>
</style>
