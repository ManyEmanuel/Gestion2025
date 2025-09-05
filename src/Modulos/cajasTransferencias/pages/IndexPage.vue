<template>
  <q-page padding>
    <div class="row">
      <div class="col">
        <div class="q-pa-md q-gutter-sm">
          <q-breadcrumbs>
            <q-breadcrumbs-el icon="home" to="/" />
            <q-breadcrumbs-el label="Transferencias primarias" icon="group" />
            <q-breadcrumbs-el
              icon="group"
              label="Cajas transferencias primarias"
            />
          </q-breadcrumbs>
        </div>
      </div>
    </div>
    <div class="row items-center">
      <div class="col">
        <div class="text-left">
          <h5>
            Cajas de transferencia
            {{ encabezado != null ? encabezado.numero_Transferencia : "" }}
          </h5>
        </div>
      </div>
      <div class="col">
        <div class="text-right q-pa-md items-start q-gutter-md">
          <q-btn
            type="button"
            class="q-ma-sm"
            color="purple-ieen"
            icon-right="document_scanner"
            label="Anexo 9"
            @click="generar_anexo_9"
          />
          <q-btn
            v-if="
              modulo == null
                ? false
                : modulo.registrar &&
                  (encabezado.estatus == 'Pendiente' ||
                    encabezado.estatus == 'Con observaciones')
            "
            type="button"
            class="q-ma-sm"
            color="purple-ieen"
            icon-right="send"
            label="Enviar transferencia"
            @click="enviarTransferencia"
          />
          <q-btn
            v-if="
              modulo == null
                ? false
                : modulo.registrar && encabezado.estatus == 'Pendiente'
            "
            type="button"
            class="q-ma-sm"
            color="purple-ieen"
            icon-right="add_circle_outline"
            label="Nueva caja"
            @click="actualizarModal(true)"
          />
        </div>
      </div>
    </div>
    <TablaComp
      :transferenciaId="transferenciaId"
      v-if="modulo == null ? false : modulo.leer"
    />
    <ModalComp
      v-if="modulo == null ? false : modulo.registrar"
      :transferenciaId="transferenciaId"
    />
  </q-page>
</template>
<script setup>
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../../../stores/auth_store";
import { useTransferenciaPrimariaEncabezadoStore } from "../../../stores/transferencia_primaria_encabezado_store";
import { useCajaTransferenciaStore } from "../../../stores/caja_trasnferencia_store";
import { useDetalleCajaTransferenciaStore } from "../../../stores/detalle_caja_Transferencia";
import { onBeforeMount } from "vue";
import { genera_anexo_9 } from "../../../helpers/helper";
import { genera_anexo_10 } from "../../../helpers/anexo_10";

import ModalComp from "../components/ModalComp.vue";
import TablaComp from "../components/TablaComp.vue";

const $q = useQuasar();
const authStore = useAuthStore();
const transferenciaPrimariaStore = useTransferenciaPrimariaEncabezadoStore();
const cajaTransferenciaStore = useCajaTransferenciaStore();
const detalleCajaTransferencia = useDetalleCajaTransferenciaStore();
const { modulo } = storeToRefs(authStore);
const { encabezado, inventarios } = storeToRefs(transferenciaPrimariaStore);
const { cajas } = storeToRefs(cajaTransferenciaStore);
const siglas = "AI-CJS-TRANS";

const leerPermisos = async () => {
  $q.loading.show();
  await authStore.loadModulo(siglas);
  $q.loading.hide();
};

const props = defineProps({
  transferenciaId: Number,
});

onBeforeMount(() => {
  leerPermisos();
  transferenciaPrimariaStore.loadEncabezado(props.transferenciaId);
});

const actualizarModal = (valor) => {
  $q.loading.show();
  cajaTransferenciaStore.updateEditar(false);
  cajaTransferenciaStore.actualizarModal(valor);
  detalleCajaTransferencia.initArrayDetalle();
  $q.loading.hide();
};

const generar_anexo_9 = async () => {
  const rows = [];
  let cajas = [];
  await transferenciaPrimariaStore.loadInventarios(encabezado.value.id);
  console.log("Esto es inventarios", inventarios);
  inventarios.value.forEach((element) => {
    rows.push([
      element.serie_Sub_Serie,
      element.nombre_Expediente,
      element.clave_Clasificacion,
      element.no_Expediente_Interno,
      element.descripcion,
      element.fecha_Inicio,
      element.fecha_Termino,
      element.caja,
      element.valor_Documental,
      element.concentracion,
      element.historico_Baja,
      element.signatura_Topografica,
    ]);
    cajas.push(element.caja);
  });

  var cajas_unicas = cajas.filter(
    (value, index, array) => array.indexOf(value) === index
  );

  genera_anexo_9(encabezado.value, rows);
};

const enviarTransferencia = async () => {
  if (cajas.value.length == 0) {
    $q.notify({
      type: "warning",
      message: "No hay cajas registradas por enviar",
    });
  } else {
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
      const resp = await transferenciaPrimariaStore.enviarTransferencia(
        props.transferenciaId
      );
      if (resp.success) {
        $q.loading.hide();
        $q.notify({
          type: "positive",
          message: resp.data,
        });
        transferenciaPrimariaStore.loadEncabezado(props.transferenciaId);
        cajaTransferenciaStore.loadCajas(props.transferenciaId);
      } else {
        $q.loading.hide();
        $q.notify({
          type: "negative",
          message: resp.data,
        });
      }
    });
  }
};
</script>
