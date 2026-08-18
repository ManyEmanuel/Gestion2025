<template>
  <q-page padding>
    <div class="row">
      <div class="col">
        <div class="q-pa-md q-gutter-sm">
          <q-breadcrumbs>
            <q-breadcrumbs-el icon="home" to="/" />
            <q-breadcrumbs-el
              label="Inventario general por expediente de todas las areas"
              icon="assignment"
            />
          </q-breadcrumbs>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <div class="text-right q-pa-md items-start q-gutter-md">
          <q-btn
            type="button"
            class="q-ma-sm"
            color="purple-ieen"
            icon-right="add_circle_outline"
            label="Nuevo"
            @click="actualizarModal(true)"
          />
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <q-card flat bordered v-if="modulo == null ? false : modulo.leer">
          <q-tabs v-model="tab" class="text-purple-ieen" align="justify">
            <q-tab name="encabezado" label="Por encabezado" />
            <q-tab name="detalle" label="Detalles" />
          </q-tabs>
          <q-separator />
          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="encabezado">
              <div class="text-h6">Por encabezado</div>
              <Tabla v-if="modulo == null ? false : modulo.leer" />
            </q-tab-panel>

            <q-tab-panel name="detalle">
              <div class="text-h6">Detalle</div>
              <TablaDetalle v-if="modulo == null ? false : modulo.leer" />
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
        <SinPermisoBanner v-else modulo="Inventario general por expediente de todas las areas" />
      </div>
    </div>
    <Modal />
    <ModalComp />
    <ModalAdjuntos />
    <ModalVisor />
  </q-page>
</template>
<script setup>
import { useQuasar } from "quasar";
import { useEncabezadoInventarioStore } from "../../../stores/encabezado_inventario_area";
import { useEnlaceArchivoStore } from "../../../stores/enlace_archivo_store";
import { useAuthStore } from "../../../stores/auth_store";
import { onBeforeMount, ref } from "vue";
import { storeToRefs } from "pinia";

import Tabla from "../components/TablaComp.vue";
import TablaDetalle from "../components/TablaDetalle.vue";
import SinPermisoBanner from "../../../components/SinPermisoBanner.vue";
import Modal from "../components/ModalComp.vue";
import ModalComp from "../../inventarioAreaGral/components/ModalComp.vue";
import ModalAdjuntos from "../../inventarioAreaGral/components/ModalAdjuntosComp.vue";
import ModalVisor from "../../inventarioAreaGral/components/ModalVisorComp.vue";

const $q = useQuasar();
const encabezadoInventariosStore = useEncabezadoInventarioStore();
const enlaceStore = useEnlaceArchivoStore();
const authStore = useAuthStore();
const { modulo } = storeToRefs(authStore);
const siglas = "AI-INV-AREA-GRAL";
const tab = ref("encabezado");
onBeforeMount(() => {
  leerPermisos();
});

const leerPermisos = async () => {
  $q.loading.show();
  await authStore.loadModulo(siglas);
  $q.loading.hide();
};

enlaceStore.loadListaEnlaces();
const actualizarModal = () => {
  encabezadoInventariosStore.actualizarModalGral(true);
};
</script>

<style>
</style>
