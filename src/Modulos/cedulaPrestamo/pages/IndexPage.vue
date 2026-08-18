<template>
  <q-page padding>
    <div class="row">
      <div class="col">
        <div class="q-pa-md q-gutter-sm">
          <q-breadcrumbs>
            <q-breadcrumbs-el icon="home" to="/" />
            <q-breadcrumbs-el
              label="Cédula de préstamo de expediente"
              icon="menu_book"
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
              <div class="text-h6">Solicitudes</div>
              <Tabla :tipo="0" :clasificado="false" />
            </q-tab-panel>

            <q-tab-panel name="SolicitudesAlArea">
              <div class="text-h6">Préstamos</div>
              <Tabla :tipo="1" :clasificado="false" />
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
        <SinPermisoBanner v-else modulo="Cédula de préstamo de expediente" />
      </div>
    </div>
    <Modal :clasificado="false" />
    <ModalEditar :clasificado="false" />
    <ModalVer />
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar";
import { ref, onBeforeMount } from "vue";
import { useCedulaPrestamoStore } from "../../../stores/cedula_prestamo_store";
import { useAreaStore } from "../../../stores/areas_store";
import { useDetalleCedulaPrestamoStore } from "../../../stores/detalle_cedula_prestamo";
import { useAuthStore } from "../../../stores/auth_store";
import { storeToRefs } from "pinia";
import Modal from "../components/ModalComp.vue";
import ModalEditar from "../components/Modal_Editar.vue";
import ModalVer from "../components/Modal_Ver.vue";
import Tabla from "../components/TablaComp.vue";
import SinPermisoBanner from "../../../components/SinPermisoBanner.vue";
const $q = useQuasar();
const cedulaPrestamo = useCedulaPrestamoStore();
const detalleCedulaStore = useDetalleCedulaPrestamoStore();
const authStore = useAuthStore();
const areas = useAreaStore();
const { modulo } = storeToRefs(authStore);
const tab = ref("solicitudesArea");
const tipo = ref(0);
const siglas = "AI-PRESTAMOS";

const leerPermisos = async () => {
  $q.loading.show();
  await authStore.loadModulo(siglas);
  $q.loading.hide();
};
onBeforeMount(() => {
  leerPermisos();
  areas.loadListaAreas();
  cedulaPrestamo.loadMisSolicitudes(false);
  cedulaPrestamo.loadSolicitudesAreas(false);
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
