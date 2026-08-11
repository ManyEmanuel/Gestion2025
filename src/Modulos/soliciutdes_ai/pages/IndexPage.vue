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
        <div class="text-right q-pa-md items-start q-gutter-md">
          <!-- Corte: el ALTA de solicitud AI depende del picker de concentración/histórico
               (inventarioAreaAI, diferido); se deshabilita. El préstamo unificado se puede crear desde
               el módulo de Trámite. Esta pantalla queda de solo-lectura + revisión (aprobar/rechazar). -->
          <q-btn
            v-if="false"
            type="button"
            class="q-ma-sm"
            color="purple-ieen"
            icon-right="add_circle_outline"
            label="Nuevo"
            @click="showDialog()"
          />
        </div>
      </div>
    </div>
    <TablaComp v-if="modulo == null ? false : modulo.leer" />
    <ModalComp />
    <q-dialog v-model="seleccion">
      <q-card style="width: 600px; max-width: 80vw">
        <q-card-section>
          <q-card-title>
            <div class="text-h6">¿Que tipo de solicitud va realizar?</div>
          </q-card-title>
          <br />
          <q-form ref="myForm">
            <q-card-main>
              <q-select
                v-model="selectedOption"
                :options="options"
                label="Selecciona una opción"
                lazy-rules
                :rules="[(val) => !!val || 'Seleccione una opción']"
              />
            </q-card-main>
            <br />
            <q-card-actions align="right">
              <q-btn
                flat
                label="Cancelar"
                color="purple-ieen"
                @click="seleccion = false"
              />
              <q-btn
                flat
                label="Aceptar"
                color="purple-ieen"
                @click="actualizarModal()"
              />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>
<script setup>
import { storeToRefs } from "pinia";
import { useQuasar } from "quasar";
import { onBeforeMount, ref } from "vue";
import { useAuthStore } from "../../../stores/auth_store";
import { useSolicitudPrestamoAiStore } from "../../../stores/solicitud_prestamo_ai_store";

import ModalComp from "../components/ModalComp.vue";
import TablaComp from "../components/TablaComp.vue";

const $q = useQuasar();
const authStore = useAuthStore();
const solicitudPrestamoStore = useSolicitudPrestamoAiStore();
const { modulo } = storeToRefs(authStore);
const siglas = "AI-PRESTAMOS-AI";
const selectedOption = ref(null);
const seleccion = ref(false);
const myForm = ref(null);
const options = [
  { label: "Archivo en Concentración", value: "concentracion" },
  { label: "Archivo Histórico", value: "historico" },
];

const leerPermisos = async () => {
  $q.loading.show();
  await authStore.loadModulo(siglas);
  $q.loading.hide();
};

onBeforeMount(() => {
  leerPermisos();
});

const showDialog = () => {
  seleccion.value = true;
};

const actualizarModal = async () => {
  const valido = await myForm.value.validate();
  console.log("ESto es valido", valido);
  if (valido) {
    $q.loading.show();
    if (selectedOption.value.value === "historico") {
      await solicitudPrestamoStore.actualizarHistorico(true);
    } else {
      await solicitudPrestamoStore.actualizarHistorico(false);
    }
    solicitudPrestamoStore.initSolicitud();
    await solicitudPrestamoStore.loadArea();
    await solicitudPrestamoStore.loadEnlace();
    solicitudPrestamoStore.updateEditar(false);
    $q.loading.hide();
    solicitudPrestamoStore.actualizarModal(true);
    seleccion.value = false;
    selectedOption.value = null;
    $q.loading.hide();
  }
};
</script>
