<template>
  <q-page padding>
    <div class="row">
      <div class="col">
        <div class="q-pa-md q-gutter-sm">
          <q-breadcrumbs>
            <q-breadcrumbs-el icon="home" to="/" />
            <q-breadcrumbs-el
              label="Solicitudes de prestamos archivo institucional"
              icon="sync"
            />
          </q-breadcrumbs>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <h1 class="text-h6 text-purple-ieen q-px-md">Solicitudes de prestamos archivo institucional</h1>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <div class="text-right q-pa-md items-start q-gutter-md">
          <!-- Corte al backend nuevo: el ALTA de solicitud AI ya está migrada. El picker de expedientes
               en Concentración/Histórico se scopea por el área responsable elegida en el modal
               (loadInventariosAreaAi, ?fase=Concentracion&fase=Historico). -->
          <q-btn
            v-if="modulo == null ? false : modulo.registrar"
            type="button"
            class="q-ma-sm"
            color="purple-ieen"
            icon-right="add_circle_outline"
            label="Nuevo"
            @click="abrirModal()"
          />
        </div>
      </div>
    </div>
    <TablaComp v-if="modulo == null ? false : modulo.leer" />
    <SinPermisoBanner v-else modulo="Solicitudes de préstamos archivo institucional" />
    <ModalComp />
  </q-page>
</template>
<script setup>
import { storeToRefs } from "pinia";
import { useQuasar } from "quasar";
import { onBeforeMount } from "vue";
import { useAuthStore } from "../../../stores/auth_store";
import { useSolicitudPrestamoAiStore } from "../../../stores/solicitud_prestamo_ai_store";
import { useAreaStore } from "../../../stores/areas_store";

import ModalComp from "../components/ModalComp.vue";
import TablaComp from "../components/TablaComp.vue";
import SinPermisoBanner from "../../../components/SinPermisoBanner.vue";

const $q = useQuasar();
const authStore = useAuthStore();
const solicitudPrestamoStore = useSolicitudPrestamoAiStore();
const areasStore = useAreaStore();
const { modulo } = storeToRefs(authStore);
const siglas = "AI-PRESTAMOS-AI";

const leerPermisos = async () => {
  $q.loading.show();
  await authStore.loadModulo(siglas);
  $q.loading.hide();
};

onBeforeMount(() => {
  leerPermisos();
});

// Corte al backend nuevo: el alta se abre directo. Se cargan las áreas (selector de área responsable,
// que scopea el picker) y los empleados (selector de solicitante); el área solicitante y el empleado de
// registro salen del JWT en el store al crear.
const abrirModal = async () => {
  $q.loading.show();
  solicitudPrestamoStore.initSolicitud();
  await areasStore.loadListaAreas();
  await areasStore.loadEmpleadosTodos();
  solicitudPrestamoStore.updateEditar(false);
  $q.loading.hide();
  solicitudPrestamoStore.actualizarModal(true);
};
</script>
