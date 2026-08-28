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

// Auditoría UX-004: el texto anterior —«se eliminará del sistema y no podrá añadir nuevas cajas»— era
// INCORRECTO y además omitía lo importante. Lo que ocurre de verdad al afectar, leído del dominio:
//   1. Cada expediente pasa a FASE DE BAJA con su fecha (`InventarioGeneral.DarDeBaja`). NO se borra
//      nada: el registro del expediente y su historial se conservan.
//   2. La baja queda en estatus Afectada y ya no admite cajas nuevas.
//   3. Es el acto que AMPARA la destrucción física de la documentación, respaldado por el dictamen de
//      valoración y el acta de baja firmados que el backend exige antes de dejar afectar.
//   4. No existe ninguna operación para revertirlo (no hay «desafectar» en el dominio ni en la API).
// El recuento sale de las cajas ya cargadas: cada una trae su `total_Expedientes`.
const afectarBaja = async () => {
  const totalCajas = cajas.value.length;
  const totalExpedientes = cajas.value.reduce((suma, caja) => suma + (caja.total_Expedientes || 0), 0);

  $q.dialog({
    title: "Afectar baja documental",
    html: true,
    message:
      `<p>Se afectará esta baja con <b>${totalCajas} caja(s)</b> y <b>${totalExpedientes} expediente(s)</b>.</p>` +
      "<p>Al afectarla:</p>" +
      "<ul>" +
      "<li>Los expedientes pasan a <b>fase de baja</b> con la fecha de hoy. <b>No se eliminan</b> del sistema: su registro y su historial se conservan.</li>" +
      "<li>Esta baja deja de admitir cajas nuevas.</li>" +
      "<li>Es el acto que <b>ampara la destrucción física</b> de esa documentación, conforme al dictamen de valoración y al acta de baja firmados.</li>" +
      "</ul>" +
      "<p><b>Esta acción no se puede deshacer desde el sistema.</b></p>",
    icon: "warning",
    persistent: true,
    transitionShow: "scale",
    transitionHide: "scale",
    ok: {
      color: "negative",
      label: "Sí, afectar la baja",
    },
    cancel: {
      color: "primary",
      flat: true,
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
