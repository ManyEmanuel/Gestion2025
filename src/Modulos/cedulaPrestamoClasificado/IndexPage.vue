<template>
  <q-page padding>
    <div class="row">
      <div class="col">
        <div class="q-pa-md q-gutter-sm">
          <q-breadcrumbs>
            <q-breadcrumbs-el icon="home" to="/" />
            <q-breadcrumbs-el
              label="Cédula de prestamo de expediente clasificados"
              icon="menu_book"
            />
          </q-breadcrumbs>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <h1 class="text-h6 text-purple-ieen q-px-md">Cédula de préstamo de expediente clasificados</h1>
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
            label="Nueva solicitud"
            @click="actualizarModal()"
          />
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <q-card flat bordered v-if="modulo == null ? false : modulo.leer">
          <q-tabs v-model="tab" class="text-purple-ieen" align="justify">
            <q-tab name="solicitudesArea" label="Solicitudes del area" />
            <q-tab name="SolicitudesAlArea" label="Solicitudes al area" />
          </q-tabs>
          <q-separator />
          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="solicitudesArea">
              <h2 class="text-h6">Solicitudes</h2>
              <Tabla :tipo="0" :clasificado="true" />
            </q-tab-panel>

            <q-tab-panel name="SolicitudesAlArea">
              <h2 class="text-h6">Prestamos</h2>
              <Tabla :tipo="1" :clasificado="true" />
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
        <SinPermisoBanner v-else modulo="Cédula de préstamo de expediente clasificados" />
      </div>
    </div>
    <Modal :clasificado="true" />
    <ModalEditar :clasificado="true" />
    <ModalVer />
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar";
import { ref, onBeforeMount, defineProps } from "vue";
import { useCedulaPrestamoStore } from "../../stores/cedula_prestamo_store";
import { useAreaStore } from "../../stores/areas_store";
import { useDetalleCedulaPrestamoStore } from "../../stores/detalle_cedula_prestamo";
import { useAuthStore } from "../../stores/auth_store";
import { storeToRefs } from "pinia";
import Modal from "../cedulaPrestamo/components/ModalComp.vue";
import ModalEditar from "../cedulaPrestamo/components/Modal_Editar.vue";
import ModalVer from "../cedulaPrestamo/components/Modal_Ver.vue";
import Tabla from "../cedulaPrestamo/components/TablaComp.vue";
import SinPermisoBanner from "../../components/SinPermisoBanner.vue";
const $q = useQuasar();
const cedulaPrestamo = useCedulaPrestamoStore();
const detalleCedulaStore = useDetalleCedulaPrestamoStore();
const authStore = useAuthStore();
const areas = useAreaStore();
const { modulo } = storeToRefs(authStore);
const tab = ref("solicitudesArea");
const tipo = ref(0);
const siglas = "AI-PRESTAMOS";

const props = defineProps({
  clasificado: Boolean,
});
console.log(props.clasificado);

const leerPermisos = async () => {
  $q.loading.show();
  await authStore.loadModulo(siglas);
  $q.loading.hide();
};
onBeforeMount(() => {
  leerPermisos();
  areas.loadListaAreas();
  cedulaPrestamo.loadMisSolicitudes(true);
  cedulaPrestamo.loadSolicitudesAreas(true);
});

const actualizarModal = () => {
  cedulaPrestamo.initRegistro();
  cedulaPrestamo.updateEditar(false);
  detalleCedulaStore.initArrayDetalle();
  cedulaPrestamo.actualizarModal(true);
};
</script>

<style>
</style>
