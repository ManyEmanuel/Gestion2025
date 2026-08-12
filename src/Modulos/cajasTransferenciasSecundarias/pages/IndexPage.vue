<template>
  <q-page padding>
    <div class="row">
      <div class="col">
        <div class="q-pa-md q-gutter-sm">
          <q-breadcrumbs>
            <q-breadcrumbs-el icon="home" to="/" />
            <q-breadcrumbs-el label="Transferencias secundarias" icon="group" />
            <q-breadcrumbs-el
              icon="group"
              label="Cajas transferencias secundarias"
            />
          </q-breadcrumbs>
        </div>
      </div>
    </div>
    <div class="row items-center">
      <div class="col">
        <div class="text-left">
          <h5>
            Cajas de transferencia secundaria
            {{ encabezado != null ? encabezado.no_Transferencia : "" }}
          </h5>
        </div>
      </div>
      <div class="col">
        <div class="text-right q-pa-md items-start q-gutter-md">
          <!-- Corte al backend nuevo: el Anexo 15 (cédula por caja de transferencia secundaria) es un PDF
               de cliente que dependía de endpoints y roles legados; se OCULTA y queda diferido para
               rehacerse como reporte de backend (análogo a Anexo 10/14). -->
          <q-btn
            v-if="false"
            type="button"
            class="q-ma-sm"
            color="purple-ieen"
            icon-right="document_scanner"
            label="Anexo 15"
            @click="anexo_15()"
          />
          <q-btn
            v-if="isCompleto == false"
            type="button"
            class="q-ma-sm"
            color="purple-ieen"
            icon-right="check"
            label="Afectar transferencia"
            @click="afectar_transferencia"
          />
          <q-btn
            v-if="isCompleto == false"
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
import { useTransferenciaSecundariaEncabezadoStore } from "../../../stores/transferencia_secundaria_encabezado_store";
import { useCajaTransferenciaSecundariaterStore } from "../../../stores/caja_transferencia_secundaria_store";
import { useDetalleCajaTransferenciaSecundariaStore } from "../../../stores/detalle_caja_transferencia_secundaria_store";
import { onBeforeMount } from "vue";
import TablaComp from "../components/TablaComp.vue";
import ModalComp from "../components/ModalComp.vue";

const $q = useQuasar();
const authStore = useAuthStore();
const transferenciaStore = useTransferenciaSecundariaEncabezadoStore();
const cajaStore = useCajaTransferenciaSecundariaterStore();
const detalleCajaStore = useDetalleCajaTransferenciaSecundariaStore();
const { modulo } = storeToRefs(authStore);
const { encabezado, encabezados } = storeToRefs(transferenciaStore);
const { cajas, isCompleto } = storeToRefs(cajaStore);
const siglas = "AI-CJS-TRNS-SEC";

const leerPermisos = async () => {
  $q.loading.show();
  await authStore.loadModulo(siglas);
  $q.loading.hide();
};

const props = defineProps({
  // Corte al backend nuevo: los ids de transferencia secundaria son Guids (string), no enteros.
  transferenciaId: String,
});

onBeforeMount(() => {
  leerPermisos();
  transferenciaStore.loadEncabezado(props.transferenciaId);
});

const actualizarModal = () => {
  cajaStore.updateEditar(false);
  detalleCajaStore.init_array_detalle();
  cajaStore.actualizarModal(true);
};

const afectar_transferencia = async () => {
  if (cajas.value.length == 0) {
    $q.notify({
      type: "warning",
      message: "No hay cajas registradas por enviar",
    });
  } else {
    $q.dialog({
      title: "Afectar transferencia",
      message:
        "¿Esta seguro de afectar la transferencia? afectará el inventario, una vez afectado no podrá añadir nuevas cajas en esta transferencia",
      icon: "Warning",
      persistent: true,
      transitionShow: "scale",
      transitionHide: "scale",
      ok: {
        color: "positive",
        label: "Sí! afectar",
      },
      cancel: {
        color: "negative",
        label: "Cancelar",
      },
    }).onOk(async () => {
      $q.loading.show();
      const resp = await transferenciaStore.afectar(props.transferenciaId);
      if (resp.success) {
        $q.loading.hide();
        $q.notify({
          type: "positive",
          message: resp.data,
        });
        transferenciaStore.loadEncabezado(props.transferenciaId);
        cajaStore.loadCajas(props.transferenciaId);
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

<style>
</style>
