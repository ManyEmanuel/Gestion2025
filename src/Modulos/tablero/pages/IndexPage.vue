<template>
  <q-page padding>
    <div class="q-pa-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Tablero de vencimientos" icon="event_busy" />
      </q-breadcrumbs>
    </div>

    <div v-if="modulo && modulo.leer">
      <q-table
        :rows="items"
        :columns="columnas"
        row-key="referenciaId"
        flat bordered
        :pagination="{ rowsPerPage: 20, sortBy: 'fechaLimite' }"
        :loading="cargando"
      >
        <template v-slot:top>
          <h1 class="text-h6">Tablero único de vencimientos</h1>
          <q-space />
          <q-btn flat round dense icon="refresh" @click="recargar" aria-label="Actualizar" />
        </template>

        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-chip dense :color="props.row.vencido ? 'red' : 'orange'" text-color="white">
              {{ props.row.vencido ? 'Vencido' : 'Por vencer' }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-diasRestantes="props">
          <q-td :props="props" :class="props.row.diasRestantes < 0 ? 'text-red text-weight-bold' : ''">
            {{ props.row.diasRestantes }}
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-md text-grey-7">Sin vencimientos próximos.</div>
        </template>
      </q-table>
    </div>
    <SinPermisoBanner v-else modulo="Tablero de vencimientos" />
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar";
import { onBeforeMount, ref } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../../../stores/auth_store";
import { useTableroStore } from "../../../stores/tablero_store";
import SinPermisoBanner from "../../../components/SinPermisoBanner.vue";

const $q = useQuasar();
const authStore = useAuthStore();
const store = useTableroStore();
const { modulo } = storeToRefs(authStore);
const { items } = storeToRefs(store);
const siglas = "AI-TABLERO";

const cargando = ref(false);

const fecha = (f) => (f ? new Date(f).toLocaleDateString() : "");

const etiquetasTipo = {
  AvisoTransferencia: "Aviso de transferencia",
  Prestamo: "Préstamo",
  ExpedienteReservado: "Expediente reservado",
  Pada: "PADA",
  InformeAnual: "Informe anual",
  ActoPurgable: "Acto purgable",
};

const columnas = [
  { name: "tipo", label: "Tipo", field: (r) => etiquetasTipo[r.tipo] || r.tipo, align: "left", sortable: true },
  { name: "referencia", label: "Referencia", field: "referencia", align: "left" },
  { name: "area", label: "Área", field: (r) => r.area || "—", align: "left" },
  { name: "fechaLimite", label: "Fecha límite", field: (r) => fecha(r.fechaLimite), align: "left", sortable: true },
  { name: "diasRestantes", label: "Días restantes", field: "diasRestantes", align: "right" },
  { name: "estado", label: "Estado", field: "vencido", align: "center" },
];

const recargar = async () => {
  cargando.value = true;
  const resp = await store.loadVencimientos();
  cargando.value = false;
  if (!resp.success) $q.notify({ type: "negative", message: resp.data });
};

onBeforeMount(async () => {
  $q.loading.show();
  await authStore.loadModulo(siglas);
  if (modulo.value && modulo.value.leer) await store.loadVencimientos();
  $q.loading.hide();
});
</script>

<style></style>
