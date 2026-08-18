<template>
  <q-page padding>
    <div class="q-pa-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Preservación digital" icon="shield" />
      </q-breadcrumbs>
    </div>

    <div v-if="modulo && modulo.leer">
      <h1 class="text-h6 text-purple-ieen">Preservación digital</h1>
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-4">
          <q-card flat bordered class="full-height">
            <q-card-section>
              <div class="text-subtitle1 text-purple-ieen">Política de formatos de preservación</div>
              <div class="q-mt-sm q-gutter-xs">
                <q-chip v-for="f in politica.formatosAceptados" :key="f" dense color="purple-ieen-1" text-color="white">{{ f }}</q-chip>
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-8" v-if="estado">
          <div class="row q-col-gutter-sm">
            <div class="col-6 col-md-3"><q-card flat bordered><q-card-section class="text-center">
              <div class="text-h5">{{ estado.totalAdjuntos }}</div><div class="text-caption">Adjuntos</div></q-card-section></q-card></div>
            <div class="col-6 col-md-3"><q-card flat bordered><q-card-section class="text-center">
              <div class="text-h5 text-orange">{{ estado.sinHash }}</div><div class="text-caption">Sin huella</div></q-card-section></q-card></div>
            <div class="col-6 col-md-3"><q-card flat bordered><q-card-section class="text-center">
              <div class="text-h5 text-orange">{{ estado.formatoNoPreservacion }}</div><div class="text-caption">Formato no pres.</div></q-card-section></q-card></div>
            <div class="col-6 col-md-3"><q-card flat bordered><q-card-section class="text-center">
              <div class="text-h5 text-red">{{ estado.integridadFallida }}</div><div class="text-caption">Integridad ✗</div></q-card-section></q-card></div>
          </div>
        </div>
      </div>

      <q-table
        v-if="estado"
        :rows="estado.enRiesgo"
        :columns="columnas"
        row-key="adjuntoId"
        flat bordered
        :pagination="{ rowsPerPage: 15 }"
      >
        <template v-slot:top>
          <h2 class="text-h6">Adjuntos en riesgo de preservación</h2>
          <q-space />
          <q-btn flat round dense icon="refresh" @click="recargar" aria-label="Actualizar" />
        </template>
        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn v-if="puedeEjecutar" flat dense color="secondary" icon="fingerprint" @click="verificar(props.row.adjuntoId)"
  aria-label="Verificar integridad"
>
              <q-tooltip>Verificar integridad</q-tooltip>
            </q-btn>
            <q-btn v-if="puedeEjecutar" flat dense color="deep-purple" icon="autorenew" @click="abrirMigrar(props.row)"
  aria-label="Migrar formato"
>
              <q-tooltip>Migrar formato</q-tooltip>
            </q-btn>
            <q-btn flat dense color="primary" icon="history" @click="verHistorial(props.row)"
  aria-label="Historial"
>
              <q-tooltip>Historial</q-tooltip>
            </q-btn>
          </q-td>
        </template>
        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-md text-grey-7">No hay adjuntos en riesgo.</div>
        </template>
      </q-table>
    </div>
    <SinPermisoBanner v-else modulo="Preservación digital" />

    <!-- Migrar formato -->
    <q-dialog v-model="dialogoMigrar" persistent>
      <q-card flat bordered style="width: 520px; max-width: 90vw">
        <q-card-section class="row items-center"><h2 class="text-h6">Migrar formato</h2><q-space />
          <q-btn icon="close" flat round dense v-close-popup aria-label="Cerrar" /></q-card-section>
        <q-card-section>
          <div class="text-caption text-grey-8 q-mb-sm">{{ adjuntoSel && adjuntoSel.nombre }}</div>
          <q-form @submit="confirmarMigrar">
            <q-input v-model="nuevoFormato" label="Nuevo formato" hint="p.ej. PDFA" lazy-rules
              :rules="[(v) => !!v || 'El nuevo formato es requerido']" autofocus />
            <q-input v-model="observaciones" label="Observaciones" type="textarea" autogrow class="q-mt-sm" />
            <div class="text-right q-mt-md q-gutter-sm">
              <BtnCancelar />
              <q-btn :loading="guardando" type="submit" color="secondary" label="Registrar" icon="save" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Historial -->
    <q-dialog v-model="dialogoHistorial">
      <q-card flat bordered style="width: 800px; max-width: 92vw">
        <q-card-section class="row items-center"><h2 class="text-h6">Historial de preservación</h2><q-space />
          <q-btn icon="close" flat round dense v-close-popup aria-label="Cerrar" /></q-card-section>
        <q-card-section>
          <q-list bordered separator v-if="acciones.length">
            <q-item v-for="a in acciones" :key="a.id">
              <q-item-section>
                <q-item-label><q-badge :color="a.tipo === 'MigracionFormato' ? 'deep-purple' : 'secondary'">{{ a.tipo }}</q-badge>
                  <span class="q-ml-sm">{{ a.resultado }}</span></q-item-label>
                <q-item-label caption>{{ new Date(a.fecha).toLocaleString() }}
                  <span v-if="a.formatoNuevo"> · formato: {{ a.formatoAnterior || '—' }} → {{ a.formatoNuevo }}</span>
                  <span v-if="a.observaciones"> · {{ a.observaciones }}</span></q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <div v-else class="text-grey-7 q-pa-md text-center">Sin acciones registradas.</div>
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
import { usePreservacionStore } from "../../../stores/preservacion_store";
import SinPermisoBanner from "../../../components/SinPermisoBanner.vue";
import BtnCancelar from "../../../components/BtnCancelar.vue";

const $q = useQuasar();
const authStore = useAuthStore();
const store = usePreservacionStore();
const { modulo } = storeToRefs(authStore);
const { politica, estado, acciones } = storeToRefs(store);
const siglas = "AI-PRESERVACION";

const puedeEjecutar = ref(false);
const dialogoMigrar = ref(false);
const dialogoHistorial = ref(false);
const guardando = ref(false);
const nuevoFormato = ref("");
const observaciones = ref("");
const adjuntoSel = ref(null);

const columnas = [
  { name: "nombre", label: "Adjunto", field: "nombre", align: "left" },
  { name: "formato", label: "Formato", field: (r) => r.formato || "—", align: "left" },
  { name: "motivo", label: "Motivo", field: "motivo", align: "left" },
  { name: "acciones", label: "Acciones", field: "acciones", align: "center" },
];

onBeforeMount(async () => {
  $q.loading.show();
  await authStore.loadModulo(siglas);
  puedeEjecutar.value = authStore.tienePermiso("archivo.preservacion.ejecutar");
  if (modulo.value && modulo.value.leer) {
    await store.loadPolitica();
    await store.loadEstado();
  }
  $q.loading.hide();
});

const recargar = async () => { $q.loading.show(); await store.loadEstado(); $q.loading.hide(); };

const verificar = async (adjuntoId) => {
  $q.loading.show();
  const resp = await store.verificarIntegridad(adjuntoId);
  $q.loading.hide();
  if (resp.success) {
    const r = resp.data.resultado;
    $q.notify({ type: r === "Alterado" ? "negative" : (r === "Íntegro" ? "positive" : "warning"), message: `Integridad: ${r}` });
    await store.loadEstado();
  } else {
    $q.notify({ type: "negative", message: resp.data });
  }
};

const abrirMigrar = (row) => { adjuntoSel.value = row; nuevoFormato.value = ""; observaciones.value = ""; dialogoMigrar.value = true; };

const confirmarMigrar = async () => {
  guardando.value = true;
  const resp = await store.migrarFormato(adjuntoSel.value.adjuntoId, nuevoFormato.value, observaciones.value);
  guardando.value = false;
  if (resp.success) {
    $q.notify({ type: "positive", message: resp.data });
    dialogoMigrar.value = false;
    await store.loadEstado();
  } else {
    $q.notify({ type: "negative", message: resp.data });
  }
};

const verHistorial = async (row) => {
  adjuntoSel.value = row;
  $q.loading.show();
  await store.loadAcciones(row.adjuntoId);
  $q.loading.hide();
  dialogoHistorial.value = true;
};
</script>

<style></style>
