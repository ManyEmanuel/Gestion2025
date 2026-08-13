<template>
  <q-page padding>
    <div class="q-pa-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Avisos al Archivo General" icon="notification_important" />
      </q-breadcrumbs>
    </div>

    <div v-if="modulo && modulo.leer">
      <q-table
        :rows="avisos"
        :columns="columnas"
        row-key="id"
        flat bordered
        :pagination="{ rowsPerPage: 15 }"
        :loading="cargando"
      >
        <template v-slot:top>
          <div class="text-h6">Avisos de transferencia secundaria (plazo 45 días · LGA 59 / Nay 57)</div>
          <q-space />
          <q-toggle v-model="soloPendientes" label="Solo pendientes" @update:model-value="recargar" />
          <q-btn flat round dense icon="refresh" @click="recargar" />
        </template>

        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-chip dense :color="props.row.vencido ? 'red' : (props.row.estado === 'Enviado' ? 'green' : 'orange')"
              text-color="white">
              {{ props.row.vencido ? 'Vencido' : props.row.estado }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-diasRestantes="props">
          <q-td :props="props" :class="props.row.diasRestantes < 0 ? 'text-red text-weight-bold' : ''">
            {{ props.row.estado === 'Enviado' ? '—' : props.row.diasRestantes }}
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn v-if="modulo.actualizar && props.row.estado !== 'Enviado'" flat dense color="secondary"
              icon="mark_email_read" @click="abrirEnviar(props.row)">
              <q-tooltip>Marcar enviado</q-tooltip>
            </q-btn>
            <q-btn flat dense color="primary" icon="picture_as_pdf" @click="exportar(props.row.id)">
              <q-tooltip>Descargar aviso (PDF)</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-md text-grey-7">Sin avisos {{ soloPendientes ? 'pendientes' : '' }}.</div>
        </template>
      </q-table>
    </div>
    <q-banner v-else class="bg-orange-2">No tiene permiso para ver los avisos.</q-banner>

    <!-- Marcar enviado -->
    <q-dialog v-model="dialogoEnviar" persistent>
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section class="row items-center">
          <div class="text-h6">Marcar aviso como enviado</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-form @submit="confirmarEnviar">
            <q-input v-model="acuse" label="Acuse / referencia del envío" hint="p.ej. oficio o folio de acuse"
              lazy-rules :rules="[(v) => !!v || 'El acuse es requerido']" autofocus />
            <div class="text-right q-mt-md q-gutter-sm">
              <q-btn color="red" label="Cancelar" icon="highlight_off" v-close-popup />
              <q-btn :loading="guardando" type="submit" color="secondary" label="Confirmar" icon="save" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar";
import { onBeforeMount, ref } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../../../stores/auth_store";
import { useAvisosStore } from "../../../stores/avisos_store";

const $q = useQuasar();
const authStore = useAuthStore();
const store = useAvisosStore();
const { modulo } = storeToRefs(authStore);
const { avisos, soloPendientes } = storeToRefs(store);
const siglas = "AI-AVISOS";

const cargando = ref(false);
const dialogoEnviar = ref(false);
const guardando = ref(false);
const acuse = ref("");
const avisoSel = ref(null);

const fecha = (f) => (f ? new Date(f).toLocaleDateString() : "");

const columnas = [
  { name: "fechaAfectacion", label: "Afectación", field: (r) => fecha(r.fechaAfectacion), align: "left" },
  { name: "fechaLimite", label: "Fecha límite (+45d)", field: (r) => fecha(r.fechaLimite), align: "left" },
  { name: "diasRestantes", label: "Días restantes", field: "diasRestantes", align: "right" },
  { name: "estado", label: "Estado", field: "estado", align: "center" },
  { name: "fechaEnvio", label: "Enviado", field: (r) => fecha(r.fechaEnvio), align: "left" },
  { name: "acuse", label: "Acuse", field: "acuse", align: "left" },
  { name: "acciones", label: "Acciones", field: "acciones", align: "center" },
];

const recargar = async () => {
  cargando.value = true;
  const resp = await store.loadAvisos();
  cargando.value = false;
  if (!resp.success) $q.notify({ type: "negative", message: resp.data });
};

onBeforeMount(async () => {
  $q.loading.show();
  await authStore.loadModulo(siglas);
  if (modulo.value && modulo.value.leer) await store.loadAvisos();
  $q.loading.hide();
});

const abrirEnviar = (aviso) => {
  avisoSel.value = aviso;
  acuse.value = "";
  dialogoEnviar.value = true;
};

const confirmarEnviar = async () => {
  guardando.value = true;
  const resp = await store.marcarEnviado(avisoSel.value.id, acuse.value);
  guardando.value = false;
  if (resp.success) {
    $q.notify({ type: "positive", message: resp.data });
    dialogoEnviar.value = false;
    await store.loadAvisos();
  } else {
    $q.notify({ type: "negative", message: resp.data });
  }
};

const exportar = async (id) => {
  $q.loading.show();
  const resp = await store.exportarAviso(id);
  $q.loading.hide();
  if (!resp.success) $q.notify({ type: "negative", message: resp.data });
};
</script>

<style></style>
