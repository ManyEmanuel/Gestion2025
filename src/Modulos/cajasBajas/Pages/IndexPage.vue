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
          <!-- Corte: Anexo 14 (formato de baja completo) diferido — depende de roles legados
               (elaboró/valida/visto bueno/aprobó) que el backend nuevo no modela y de un endpoint
               legado por caja. Rehacer como reporte de backend si se requiere. -->
          <q-btn
            v-if="false"
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
import { useDisposicionDocStore } from "../../../stores/disposicion_documental_store";
import { onBeforeMount } from "vue";
import { espera } from "../../../helpers/helper";
import ModalComp from "../components/ModalComp.vue";
import TablaComp from "../components/TablaComp.vue";
import { genera_anexo_14 } from "src/helpers/anexo_14";

const $q = useQuasar();
const authStore = useAuthStore();
const bajaDocumentalStore = useBajaDocumentalStore();
const cajaBajaDocumentalStore = useCajaBajaDocumentalStore();
const disposicionDocStore = useDisposicionDocStore();
const detalleCajaBajaStore = useDetalleCajaBajaStore();

const { modulo } = storeToRefs(authStore);
const { encabezado } = storeToRefs(bajaDocumentalStore);
const { disposiciones } = storeToRefs(disposicionDocStore);
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
  $q.loading.show();
  cajaBajaDocumentalStore.updateEditar(false);
  cajaBajaDocumentalStore.initCaja();
  detalleCajaBajaStore.init_array_detalle();
  await espera();
  cajaBajaDocumentalStore.actualizarModal(valor);
  $q.loading.hide();
};

const afectarBaja = async () => {
  $q.dialog({
    title: "Afectar baja",
    message:
      "¿Esta seguro de afectar la baja?, se eliminará del sistema y no podra añadir nuevas cajas a esta baja",
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

const anexo_14 = async () => {
  $q.loading.show();
  if (cajas.value.length > 0) {
    await disposicionDocStore.loadDisposiciones("S");
    let sustantivas = disposiciones.value;
    await disposicionDocStore.loadDisposiciones("C");
    let comunes = disposiciones.value;

    let resp = await cajaBajaDocumentalStore.loadAnexo14(
      comunes,
      sustantivas,
      cajas.value,
      encabezado.value
    );
    genera_anexo_14(resp.encabezado, resp.cuerpo);
  } else {
    $q.notify({
      type: "negative",
      message: "No se cuenta con cajas registradas",
    });
  }

  $q.loading.hide();
};
</script>
