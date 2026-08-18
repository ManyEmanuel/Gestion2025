<template>
  <q-page padding>
    <div class="row">
      <div class="col">
        <div class="q-pa-md q-gutter-sm">
          <q-breadcrumbs>
            <q-breadcrumbs-el icon="home" to="/" />
            <q-breadcrumbs-el label="Bajas documentales" icon="folder_delete" />
            <q-breadcrumbs-el
              icon="folder_delete"
              label="Cajas de baja documental"
            />
          </q-breadcrumbs>
        </div>
      </div>
    </div>
    <div class="row items-center">
      <div class="col">
        <div class="text-left">
          <h5>
            Cajas de baja documental
            {{ encabezado ? encabezado.no_Transferencia : "" }}
          </h5>
        </div>
      </div>
      <div class="col">
        <div class="text-right q-pa-md items-start q-gutter-md">
          <!-- Corte al backend nuevo: Anexo 14 (inventario de baja) ahora es un reporte de backend
               (GET /api/reportes/baja/{bajaId}/inventario, PDF QuestPDF). Los roles de firma que el
               dominio nuevo no modela (valida/supervisa/aprobación) se imprimen con línea en blanco. -->
          <q-btn
            v-if="modulo == null ? false : modulo.leer"
            type="button"
            class="q-ma-sm"
            color="purple-ieen"
            icon-right="document_scanner"
            label="Anexo 14"
            @click="anexo_14()"
          />
          <q-btn
            v-if="
              modulo == null ? false : modulo.registrar && isCompleto == false
            "
            type="button"
            class="q-ma-sm"
            color="purple-ieen"
            icon-right="folder_delete"
            label="Afectar baja"
            @click="afectarBaja"
          />
          <q-btn
            v-if="
              modulo == null ? false : modulo.registrar && isCompleto == false
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
    <TablaComp :bajaId="bajaId" v-if="modulo == null ? false : modulo.leer" />
    <SinPermisoBanner v-else modulo="Cajas de baja documental" />
    <ModalComp
      v-if="modulo == null ? false : modulo.registrar"
      :transferenciaId="bajaId"
    />
  </q-page>
</template>
<script setup>
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../../../stores/auth_store";
import { useBajaDocumentalStore } from "../../../stores/baja_documental_store";
import { useCajaBajaDocumentalStore } from "../../../stores/caja_baja_documental";
import { useDetalleCajaBajaStore } from "../../../stores/detalle_caja_baja_store";
import { onBeforeMount } from "vue";
import ModalComp from "../components/ModalComp.vue";
import TablaComp from "../components/TablaComp.vue";
import SinPermisoBanner from "../../../components/SinPermisoBanner.vue";
import { descargarReporte } from "../../../helpers/descargar_reporte";

const $q = useQuasar();
const authStore = useAuthStore();
const bajaDocumentalStore = useBajaDocumentalStore();
const cajaBajaDocumentalStore = useCajaBajaDocumentalStore();
const detalleCajaBajaStore = useDetalleCajaBajaStore();

const { modulo } = storeToRefs(authStore);
const { encabezado } = storeToRefs(bajaDocumentalStore);
const { cajas, isCompleto } = storeToRefs(cajaBajaDocumentalStore);
const siglas = "AI-CJS-BAJAS";

const leerPermisos = async () => {
  $q.loading.show();
  await authStore.loadModulo(siglas);
  $q.loading.hide();
};

const props = defineProps({
  // Corte al backend nuevo: los ids de baja son Guids (string), no enteros.
  bajaId: String,
});

onBeforeMount(() => {
  leerPermisos();
  bajaDocumentalStore.loadEncabezado(props.bajaId);
});

const actualizarModal = async (valor) => {
  cajaBajaDocumentalStore.updateEditar(false);
  cajaBajaDocumentalStore.initCaja();
  detalleCajaBajaStore.init_array_detalle();
  cajaBajaDocumentalStore.actualizarModal(valor);
};

const afectarBaja = async () => {
  $q.dialog({
    title: "Afectar baja",
    message:
      "¿Esta seguro de afectar la baja?, se eliminará del sistema y no podra añadir nuevas cajas a esta baja",
    icon: "warning",
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
    const resp = await bajaDocumentalStore.afectar(props.bajaId);
    if (resp.success) {
      $q.loading.hide();
      $q.notify({
        type: "positive",
        message: resp.data,
      });
      bajaDocumentalStore.loadEncabezado(props.bajaId);
      cajaBajaDocumentalStore.loadCajas(props.bajaId);
    } else {
      $q.loading.hide();
      $q.notify({
        type: "negative",
        message: resp.data,
      });
    }
  });
};

// MIGRADO al backend nuevo: descarga el Anexo 14 (inventario de baja documental) en PDF generado por
// el servidor (GET /api/reportes/baja/{bajaId}/inventario), aislado por área.
const anexo_14 = async () => {
  if (cajas.value.length == 0) {
    $q.notify({ type: "negative", message: "No se cuenta con cajas registradas" });
    return;
  }
  $q.loading.show();
  const resp = await descargarReporte(
    `/reportes/baja/${props.bajaId}/inventario`,
    "Anexo14_Baja.pdf"
  );
  $q.loading.hide();
  if (!resp.success) {
    $q.notify({ type: "negative", message: resp.data });
  }
};
</script>
