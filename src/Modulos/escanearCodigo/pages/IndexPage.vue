<template>
  <q-page padding>
    <div class="q-pa-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Escanear código" icon="qr_code_scanner" />
      </q-breadcrumbs>
    </div>

    <div v-if="modulo && modulo.leer">
      <q-card flat bordered class="q-pa-md" style="max-width: 500px">
        <div class="text-caption text-grey-7 q-mb-sm">
          Use una lectora de código de barras/QR (funciona como teclado: escanea y presiona Enter) o
          escriba el código manualmente.
        </div>
        <q-input
          ref="inputCodigo"
          v-model="codigo"
          label="Código escaneado"
          autofocus
          dense
          outlined
          :loading="buscando"
          @keyup.enter="escanear"
        >
          <template v-slot:append>
            <q-btn flat round dense icon="search" @click="escanear" aria-label="Buscar" />
          </template>
        </q-input>
      </q-card>

      <q-card v-if="resultado" flat bordered class="q-pa-md q-mt-md" style="max-width: 500px">
        <div class="text-subtitle1">{{ resultado.claveClasificacion }}</div>
        <div class="text-body2">{{ resultado.nombreExpediente }}</div>
        <div class="text-caption text-grey-7 q-mb-sm">Fase: {{ resultado.fase }}</div>
        <q-btn
          v-if="resultado.fase === 'Concentracion' || resultado.fase === 'Historico'"
          color="secondary"
          no-caps
          icon="edit_location_alt"
          label="Actualizar ubicación física"
          :loading="preparando"
          @click="actualizarUbicacion"
        />
        <q-banner v-else dense class="bg-grey-3 q-mt-sm">
          Este expediente aún está en trámite; la ubicación física estructurada solo aplica en
          concentración o histórico.
        </q-banner>
      </q-card>
    </div>
    <SinPermisoBanner v-else modulo="Escanear código" />

    <ModalComp />
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar";
import { onBeforeMount, ref } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../../../stores/auth_store";
import { useInventarioAreaAIStore } from "../../../stores/inventario_area_ai_store";
import SinPermisoBanner from "../../../components/SinPermisoBanner.vue";
import ModalComp from "../../inventarioAreaAI/components/ModalComp.vue";

const $q = useQuasar();
const authStore = useAuthStore();
const inventarioStore = useInventarioAreaAIStore();
const { modulo } = storeToRefs(authStore);
const siglas = "AI-QR-ESCANEAR";

const codigo = ref("");
const resultado = ref(null);
const buscando = ref(false);
const preparando = ref(false);

const escanear = async () => {
  if (!codigo.value) return;
  buscando.value = true;
  resultado.value = null;
  const resp = await inventarioStore.resolverCodigo(codigo.value);
  buscando.value = false;
  if (resp.success) {
    resultado.value = resp.data;
  } else {
    $q.notify({ type: "negative", message: resp.data });
  }
  codigo.value = "";
};

const actualizarUbicacion = async () => {
  preparando.value = true;
  const resp = await inventarioStore.prepararEdicionDesdeCodigo(resultado.value);
  preparando.value = false;
  if (!resp.success) {
    $q.notify({ type: "negative", message: resp.data });
  }
};

onBeforeMount(async () => {
  $q.loading.show();
  await authStore.loadModulo(siglas);
  $q.loading.hide();
});
</script>

<style></style>
