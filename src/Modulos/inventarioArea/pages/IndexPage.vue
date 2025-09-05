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
            <q-breadcrumbs-el
              label="Detalle inventario general por expediente"
              icon="assignment"
            />
          </q-breadcrumbs>
        </div>
      </div>
    </div>
    <!-- <div class="row">
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
    </div> -->
    <TablaItem
      :encabezadoId="encabezadoId"
      v-if="modulo == null ? false : modulo.leer"
    />
    <ModalItem :encabezadoId="encabezadoId" />
    <ModalEditarItem :encabezadoId="encabezadoId" />
    <ModalAdjuntos :encabezadoId="encabezadoId" />
    <ModalVisor />
    <ModalAmpliacion :encabezadoId="encabezadoId" />
    <ModalVerAmpliacion />
    <!-- <Tabla />
    <Modal /> -->
  </q-page>
</template>
<script setup>
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { onBeforeMount, onMounted } from "vue";
import { useInventarioAreaStore } from "../../../stores/inventario_area_store";
import { useSeccionStore } from "../../../stores/secciones_store";
import { useAuthStore } from "../../../stores/auth_store";
import { espera } from "../../../helpers/helper";
import ModalItem from "../components/ModalItem.vue";
import TablaItem from "../components/TablaItem.vue";
import ModalEditarItem from "../components/ModalEditarItem.vue";
import ModalAdjuntos from "../components/ModalAdjuntos.vue";
import ModalVisor from "../components/ModalVisor.vue";
import ModalAmpliacion from "../components/ModalAmpliacion.vue";
import ModalVerAmpliacion from "../components/ModalVerAmpliacion.vue";

const $q = useQuasar();
const inventarioStore = useInventarioAreaStore();
const seccionStore = useSeccionStore();
const authStore = useAuthStore();
const { modulo } = storeToRefs(authStore);
onMounted(() => {
  seccionStore.loadListaSecciones();
});

const props = defineProps({
  encabezadoId: {
    type: Number,
    required: true,
  },
});

// const actualizarModal = async (valor) => {
//   $q.loading.show();
//   await espera();
//   inventarioStore.initInventario();
//   inventarioStore.actualizarModal(valor);
//   inventarioStore.updateEditar(false);
//   $q.loading.hide();
// };
</script>


<style>
</style>
