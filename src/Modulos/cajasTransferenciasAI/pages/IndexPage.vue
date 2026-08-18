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
            v-if="
              modulo == null ? false : modulo.registrar && isCompleto == false
            "
            type="button"
            class="q-ma-sm"
            color="purple-ieen"
            icon-right="archive"
            label="Afectar transferencias"
            @click="afectar"
          />
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <q-card flat bordered v-if="modulo == null ? false : modulo.leer">
          <q-tabs v-model="tab" class="text-purple-ieen" align="justify">
            <q-tab name="encabezado" label="Por cajas" />
            <q-tab name="detalle" label="Detalles" />
          </q-tabs>
          <q-separator />
          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="encabezado">
              <div class="text-h6">Por cajas</div>
              <TablaComp
                :transferenciaId="transferenciaId"
                v-if="modulo == null ? false : modulo.leer"
              />
            </q-tab-panel>

            <q-tab-panel name="detalle">
              <div class="text-h6">Detalle</div>
              <TablaDetalleComp
                :transferenciaId="transferenciaId"
                v-if="modulo == null ? false : modulo.leer"
              />
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
        <SinPermisoBanner v-else modulo="Cajas de transferencia primaria AI" />
      </div>
    </div>
  </q-page>
</template>
<script setup>
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../../../stores/auth_store";
import SinPermisoBanner from "../../../components/SinPermisoBanner.vue";
import { useTransferenciaPrimariaEncabezadoStore } from "../../../stores/transferencia_primaria_encabezado_store";
import { useCajaTransferenciaStore } from "../../../stores/caja_trasnferencia_store";
import { useDetalleCajaTransferenciaStore } from "../../../stores/detalle_caja_Transferencia";
import { onBeforeMount, ref } from "vue";
import TablaComp from "../components/TablaComp.vue";
import TablaDetalleComp from "../components/TablaDetalleComp.vue";

const $q = useQuasar();
const authStore = useAuthStore();
const transferenciaPrimariaStore = useTransferenciaPrimariaEncabezadoStore();
const cajaTransferenciaStore = useCajaTransferenciaStore();
const detalleCajaTransferencia = useDetalleCajaTransferenciaStore();
const { modulo } = storeToRefs(authStore);
const { encabezado } = storeToRefs(transferenciaPrimariaStore);
const { cajas, isCompleto } = storeToRefs(cajaTransferenciaStore);
const siglas = "AI-CJS-TRANS-AI";
const tab = ref("encabezado");
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

const afectar = async () => {
  $q.dialog({
    title: "Afectar transferencia",
    message:
      "¿Esta seguro de afectar la transferencia?, el inventario aprobado de esta transferencia pasará a archivo institucional",
    icon: "warning",
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
    const resp = await transferenciaPrimariaStore.afectarTransferencia(
      props.transferenciaId
    );
    if (resp.success) {
      $q.loading.hide();
      $q.notify({
        type: "positive",
        message: resp.data,
      });
      detalleCajaTransferencia.loadDetallesAI(props.transferenciaId);
      cajaTransferenciaStore.loadCajas(props.transferenciaId);
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
