<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card flat bordered style="width: 960px; max-width: 95vw">
      <q-card-section class="row items-center bg-purple-ieen text-white">
        <h2 class="text-h6">Actos de disposición {{ nombre ? '— ' + nombre : '' }}</h2>
        <q-space />
        <q-btn icon="close" flat round dense color="white" @click="cerrar" aria-label="Cerrar" />
      </q-card-section>

      <q-card-section>
        <div class="q-mb-sm">
          <q-btn v-if="puedeAfectar" color="secondary" icon="description" label="Nuevo dictamen" dense @click="abrirCrear('dictamen')" />
          <q-btn v-if="puedeAfectar && proceso === 'baja'" color="deep-purple" icon="gavel" label="Nueva acta" dense class="q-ml-sm" @click="abrirCrear('acta')" />
          <q-btn flat round dense icon="refresh" class="float-right" @click="recargar" aria-label="Actualizar" />
        </div>

        <q-banner v-if="proceso === 'baja'" dense class="bg-blue-1 q-mb-sm">
          Para afectar la baja se requiere un <b>dictamen</b> y un <b>acta</b> firmados (LGA 58 / Nay 56).
        </q-banner>
        <q-banner v-else dense class="bg-blue-1 q-mb-sm">
          Para afectar la transferencia secundaria se requiere un <b>dictamen</b> firmado.
        </q-banner>

        <q-list bordered separator v-if="actos.length">
          <q-item v-for="a in actos" :key="a.id">
            <q-item-section>
              <q-item-label>
                <q-badge :color="a.tipo === 'Acta' ? 'deep-purple' : 'secondary'">{{ a.tipo }}</q-badge>
                <span class="q-ml-sm text-weight-medium">Folio {{ a.folio }}</span>
                <q-chip dense size="sm" class="q-ml-sm" :color="colorEstado(a.estado)" text-color="white">{{ a.estado }}</q-chip>
                <q-badge v-if="a.tieneFirmaAvanzada" color="green" class="q-ml-xs">firma avanzada</q-badge>
              </q-item-label>
              <q-item-label caption>
                {{ fecha(a.fecha) }} · guarda hasta {{ fecha(a.conservarHasta) }}
                <span v-if="a.urlPublicacion"> · <a :href="a.urlPublicacion" target="_blank">publicación</a></span>
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="q-gutter-xs">
                <q-btn v-if="puedeAfectar && a.estado === 'Proyecto'" flat dense color="green" icon="draw" @click="firmar(a)"
  aria-label="Firmar"
><q-tooltip>Firmar</q-tooltip></q-btn>
                <q-btn v-if="puedeAfectar && a.estado === 'Firmado'" flat dense color="deep-purple" icon="publish" @click="abrirPublicar(a)"
  aria-label="Publicar"
><q-tooltip>Publicar</q-tooltip></q-btn>
                <q-btn v-if="puedeVerificar && a.estaFirmado" flat dense color="teal" icon="verified_user" @click="verificar(a)"
  aria-label="Verificar firma"
><q-tooltip>Verificar firma</q-tooltip></q-btn>
                <q-btn flat dense color="primary" icon="picture_as_pdf" @click="descargar(a)"
  aria-label="PDF"
><q-tooltip>PDF</q-tooltip></q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
        <div v-else class="text-grey-7 q-pa-md text-center">Sin actos registrados.</div>
      </q-card-section>
    </q-card>

    <!-- Crear acto -->
    <q-dialog v-model="dlgCrear" persistent>
      <q-card flat bordered style="width: 560px; max-width: 92vw">
        <q-card-section class="row items-center"><h3 class="text-h6">Nuevo {{ tipoCrear === 'acta' ? 'acta' : 'dictamen' }}</h3><q-space /><q-btn icon="close" flat round dense v-close-popup aria-label="Cerrar" /></q-card-section>
        <q-card-section><q-form @submit="guardarActo">
          <q-input v-model="actoNuevo.folio" label="Folio" autofocus lazy-rules :rules="[(v) => !!v || 'Requerido']" />
          <q-input v-model="actoNuevo.fundamentoLegal" label="Fundamento legal" type="textarea" autogrow lazy-rules :rules="[(v) => !!v || 'Requerido']" />
          <div class="text-right q-mt-md q-gutter-sm"><BtnCancelar /><q-btn :loading="guardando" type="submit" color="secondary" label="Guardar" icon="save" /></div>
        </q-form></q-card-section>
      </q-card>
    </q-dialog>

    <!-- Publicar -->
    <q-dialog v-model="dlgPublicar" persistent>
      <q-card flat bordered style="width: 520px; max-width: 90vw">
        <q-card-section class="row items-center"><h3 class="text-h6">Publicar acto</h3><q-space /><q-btn icon="close" flat round dense v-close-popup aria-label="Cerrar" /></q-card-section>
        <q-card-section><q-form @submit="confirmarPublicar">
          <q-input v-model="urlPub" label="URL de publicación (portal de transparencia)" lazy-rules :rules="[(v) => !!v || 'Requerido']" autofocus />
          <div class="text-right q-mt-md q-gutter-sm"><BtnCancelar /><q-btn :loading="guardando" type="submit" color="deep-purple" label="Publicar" icon="publish" /></div>
        </q-form></q-card-section>
      </q-card>
    </q-dialog>

    <!-- Verificación de firma -->
    <q-dialog v-model="dlgVerif">
      <q-card flat bordered style="width: 560px; max-width: 92vw">
        <q-card-section class="row items-center"><h3 class="text-h6">Verificación de firma</h3><q-space /><q-btn icon="close" flat round dense v-close-popup aria-label="Cerrar" /></q-card-section>
        <q-card-section v-if="verificacion">
          <q-banner v-if="!verificacion.tieneFirmaAvanzada" class="bg-orange-2">Este acto no tiene firma electrónica avanzada (firmado sin proveedor).</q-banner>
          <template v-else>
            <div class="row items-center q-mb-sm">
              <q-icon :name="verificacion.esValida ? 'check_circle' : 'cancel'" :color="verificacion.esValida ? 'green' : 'red'" size="md" />
              <span class="q-ml-sm text-h6">{{ verificacion.esValida ? 'Firma válida' : 'Firma no válida' }}</span>
            </div>
            <q-list dense>
              <q-item><q-item-section>Integridad del contenido</q-item-section><q-item-section side><q-icon :name="verificacion.integridadOk ? 'check' : 'close'" :color="verificacion.integridadOk ? 'green' : 'red'" /></q-item-section></q-item>
              <q-item><q-item-section>Certificado vigente al firmar</q-item-section><q-item-section side><q-icon :name="verificacion.certificadoVigenteAlFirmar ? 'check' : 'close'" :color="verificacion.certificadoVigenteAlFirmar ? 'green' : 'red'" /></q-item-section></q-item>
              <q-item><q-item-section>Algoritmo</q-item-section><q-item-section side>{{ verificacion.algoritmo }}</q-item-section></q-item>
              <q-item><q-item-section>Certificado</q-item-section><q-item-section side>{{ verificacion.certificadoSujeto }}</q-item-section></q-item>
              <q-item><q-item-section>Sello de tiempo</q-item-section><q-item-section side>{{ verificacion.selloTiempo ? new Date(verificacion.selloTiempo).toLocaleString() : '—' }}</q-item-section></q-item>
            </q-list>
          </template>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script setup>
import { useQuasar } from "quasar";
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../stores/auth_store";
import { useActosStore } from "../stores/actos_store";
import BtnCancelar from "./BtnCancelar.vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  proceso: { type: String, required: true }, // 'baja' | 'secundaria'
  procesoId: { type: String, default: null },
  nombre: { type: String, default: "" },
});
const emit = defineEmits(["update:modelValue"]);

const $q = useQuasar();
const authStore = useAuthStore();
const store = useActosStore();
const { actos, verificacion } = storeToRefs(store);

const dlgCrear = ref(false), dlgPublicar = ref(false), dlgVerif = ref(false), guardando = ref(false);
const tipoCrear = ref("dictamen");
const actoNuevo = ref({ folio: "", fundamentoLegal: "" });
const urlPub = ref("");
const actoSel = ref(null);

const grupo = props.proceso === "baja" ? "baja" : "transferencia-secundaria";
const puedeAfectar = authStore.tienePermiso(`archivo.${grupo}.afectar`);
const puedeVerificar = authStore.tienePermiso("archivo.disposicion.ver");

const fecha = (f) => (f ? new Date(f).toLocaleDateString() : "");
const colorEstado = (e) => (e === "Publicado" ? "deep-purple" : e === "Firmado" ? "green" : "orange");
const notif = (r) => $q.notify({ type: r.success ? "positive" : "negative", message: r.data });

watch(() => props.modelValue, async (v) => { if (v && props.procesoId) await recargar(); });

const recargar = async () => {
  $q.loading.show();
  const r = await store.loadActos(props.proceso, props.procesoId);
  $q.loading.hide();
  if (!r.success) notif(r);
};

const cerrar = () => emit("update:modelValue", false);

const abrirCrear = (tipo) => { tipoCrear.value = tipo; actoNuevo.value = { folio: "", fundamentoLegal: "" }; dlgCrear.value = true; };
const guardarActo = async () => {
  guardando.value = true;
  const r = await store.crearActo(props.proceso, props.procesoId, tipoCrear.value, actoNuevo.value);
  guardando.value = false;
  notif(r); if (r.success) { dlgCrear.value = false; await recargar(); }
};

const firmar = async (a) => {
  const r = await store.firmar(props.proceso, props.procesoId, a.id);
  notif(r); if (r.success) await recargar();
};

const abrirPublicar = (a) => { actoSel.value = a; urlPub.value = ""; dlgPublicar.value = true; };
const confirmarPublicar = async () => {
  guardando.value = true;
  const r = await store.publicar(props.proceso, props.procesoId, actoSel.value.id, urlPub.value);
  guardando.value = false;
  notif(r); if (r.success) { dlgPublicar.value = false; await recargar(); }
};

const verificar = async (a) => {
  $q.loading.show();
  const r = await store.verificarFirma(a.id);
  $q.loading.hide();
  if (r.success) dlgVerif.value = true; else notif(r);
};

const descargar = async (a) => {
  const tipo = a.tipo === "Acta" ? "acta" : "dictamen";
  $q.loading.show();
  const r = await store.descargarPdf(props.proceso, props.procesoId, tipo);
  $q.loading.hide();
  if (!r.success) notif(r);
};
</script>

<style></style>
