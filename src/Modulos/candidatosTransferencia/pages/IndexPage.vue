<template>
  <q-page padding>
    <div class="q-pa-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Candidatos a transferencia primaria" icon="move_to_inbox" />
      </q-breadcrumbs>
    </div>

    <div v-if="modulo && modulo.leer">
      <q-table
        :rows="candidatos"
        :columns="columnas"
        row-key="id"
        flat bordered
        :pagination="{ rowsPerPage: 20 }"
        :loading="cargando"
      >
        <template v-slot:top>
          <h1 class="text-h6">Expedientes listos para transferencia primaria</h1>
          <q-space />
          <q-btn flat round dense icon="refresh" @click="recargar" aria-label="Actualizar" />
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn flat dense color="secondary" icon="arrow_forward" :to="{ name: 'transferenciasPrimarias' }"
              aria-label="Ir a transferencias primarias">
              <q-tooltip>Agregar a una transferencia</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-md text-grey-7">No hay expedientes listos para transferencia.</div>
        </template>
      </q-table>
    </div>
    <SinPermisoBanner v-else modulo="Candidatos a transferencia primaria" />
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar";
import { onBeforeMount, ref } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../../../stores/auth_store";
import { useCandidatosTransferenciaStore } from "../../../stores/candidatos_transferencia_store";
import SinPermisoBanner from "../../../components/SinPermisoBanner.vue";

const $q = useQuasar();
const authStore = useAuthStore();
const store = useCandidatosTransferenciaStore();
const { modulo } = storeToRefs(authStore);
const { candidatos } = storeToRefs(store);
const siglas = "AI-TP-CANDIDATOS";

const cargando = ref(false);

const fecha = (f) => (f ? new Date(f).toLocaleDateString() : "");

const columnas = [
  { name: "claveClasificacion", label: "Clave", field: "claveClasificacion", align: "left" },
  { name: "nombreExpediente", label: "Nombre del expediente", field: "nombreExpediente", align: "left" },
  { name: "areaGeneradora", label: "Área", field: "areaGeneradora", align: "left" },
  { name: "fechaTermino", label: "Fecha término", field: (r) => fecha(r.fechaTermino), align: "left" },
  { name: "acciones", label: "Acciones", field: "acciones", align: "center" },
];

const recargar = async () => {
  cargando.value = true;
  const resp = await store.loadCandidatos();
  cargando.value = false;
  if (!resp.success) $q.notify({ type: "negative", message: resp.data });
};

onBeforeMount(async () => {
  $q.loading.show();
  await authStore.loadModulo(siglas);
  if (modulo.value && modulo.value.leer) await store.loadCandidatos();
  $q.loading.hide();
});
</script>

<style></style>
