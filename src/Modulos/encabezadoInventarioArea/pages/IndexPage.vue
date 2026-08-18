<template>
  <q-page padding>
    <div class="row">
      <div class="col">
        <div class="q-pa-md q-gutter-sm">
          <q-breadcrumbs>
            <q-breadcrumbs-el icon="home" to="/" />
            <q-breadcrumbs-el
              label="Inventario general por expediente"
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
            v-if="modulo == null ? false : modulo.registrar"
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
        <SinPermisoBanner v-else modulo="Inventario general por expediente" />
      </div>
    </div>
    <Modal />
    <ModalComp />
    <ModalAdjuntoComp />
    <ModalViewer />
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar";
import { useEncabezadoInventarioStore } from "../../../stores/encabezado_inventario_area";
import { useAreaStore } from "../../../stores/areas_store";
import { useAuthStore } from "../../../stores/auth_store";
import { onBeforeMount, ref } from "vue";
import { storeToRefs } from "pinia";

import Modal from "../components/ModalComp.vue";
import ModalComp from "../../inventarioAreaGral/components/ModalComp.vue";
import ModalAdjuntoComp from "../../inventarioAreaGral/components/ModalAdjuntosComp.vue";
import ModalViewer from "../../inventarioAreaGral/components/ModalVisorComp.vue";
import Tabla from "../components/TablaComp.vue";
import TablaDetalle from "../components/TablaDetalle.vue";
import SinPermisoBanner from "../../../components/SinPermisoBanner.vue";

const $q = useQuasar();
const encabezadoInventariosStore = useEncabezadoInventarioStore();
const areaStore = useAreaStore();
const authStore = useAuthStore();
const { modulo } = storeToRefs(authStore);
const siglas = "AI-INV-AREA";
onBeforeMount(() => {
  leerPermisos();
});
const tab = ref("encabezado");
const leerPermisos = async () => {
  $q.loading.show();
  await authStore.loadModulo(siglas);
  $q.loading.hide();
};
// Corte al backend nuevo: se cargan el área generadora (del usuario) y su enlace; el área responsable
// se elige con un selector (loadListaAreas). Los roles legados (validó/VoBo/supervisa) no los modela
// el backend, así que ya no se cargan.
encabezadoInventariosStore.loadArea();
encabezadoInventariosStore.loadEnlace();
areaStore.loadListaAreas();

const actualizarModal = async (valor) => {
  encabezadoInventariosStore.initEncabezado();
  encabezadoInventariosStore.actualizarModal(valor);
  encabezadoInventariosStore.updateEditar(false);
};
</script>

<style>
</style>
