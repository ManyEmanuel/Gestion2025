<template>
  <q-page padding>
    <div class="q-pa-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Estado de cumplimiento" icon="verified" />
      </q-breadcrumbs>
    </div>

    <div v-if="modulo && modulo.leer">
      <div class="row items-center q-px-md">
        <div class="col">
          <h1 class="text-h6 text-purple-ieen q-my-none">Estado de cumplimiento</h1>
        </div>
        <div class="col-auto">
          <q-btn flat round dense icon="refresh" color="purple-ieen" @click="recargar" aria-label="Actualizar" />
        </div>
      </div>

      <p class="text-caption text-grey-8 q-px-md">
        Obligaciones archivísticas que este sistema puede acreditar por sí mismo, con la cifra que sostiene
        cada estado. <b>No es un dictamen de cumplimiento legal</b>: una obligación puede estar cubierta
        fuera del sistema —en papel o en otra plataforma— y aquí aparecería como no acreditada.
      </p>

      <div class="row q-col-gutter-md q-mb-md q-px-md" v-if="requisitos.length">
        <div class="col-4">
          <q-card flat bordered><q-card-section class="text-center">
            <div class="text-h5 text-green-8">{{ resumen.cumple }}</div>
            <div class="text-caption">Acreditadas</div>
          </q-card-section></q-card>
        </div>
        <div class="col-4">
          <q-card flat bordered><q-card-section class="text-center">
            <div class="text-h5 text-orange-9">{{ resumen.parcial }}</div>
            <div class="text-caption">Parciales</div>
          </q-card-section></q-card>
        </div>
        <div class="col-4">
          <q-card flat bordered><q-card-section class="text-center">
            <div class="text-h5 text-red-9">{{ resumen.noCumple }}</div>
            <div class="text-caption">Sin acreditar</div>
          </q-card-section></q-card>
        </div>
      </div>

      <q-list bordered separator v-if="requisitos.length">
        <q-item v-for="r in requisitos" :key="r.clave">
          <q-item-section avatar top>
            <q-icon :name="r.icono" :color="r.color" size="26px" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-medium">{{ r.requisito }}</q-item-label>
            <q-item-label caption>{{ r.fundamento }}</q-item-label>
            <q-item-label class="q-mt-xs">{{ r.evidencia }}</q-item-label>
            <q-item-label v-if="r.recomendacion" class="q-mt-xs text-primary">
              <q-icon name="arrow_right" /> {{ r.recomendacion }}
            </q-item-label>
          </q-item-section>
          <q-item-section side top>
            <q-badge :color="r.color">{{ r.texto }}</q-badge>
          </q-item-section>
        </q-item>
      </q-list>

      <div v-else-if="!cargando" class="q-pa-lg text-center text-grey-7">
        No se pudo obtener el estado de cumplimiento.
      </div>
    </div>
    <SinPermisoBanner v-else modulo="Estado de cumplimiento" />
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { onBeforeMount } from "vue";
import { useAuthStore } from "../../../stores/auth_store";
import { useCumplimientoStore } from "../../../stores/cumplimiento_store";
import SinPermisoBanner from "../../../components/SinPermisoBanner.vue";

const $q = useQuasar();
const authStore = useAuthStore();
const store = useCumplimientoStore();
const { modulo } = storeToRefs(authStore);
const { requisitos, resumen, cargando } = storeToRefs(store);
const siglas = "AI-CUMPLIMIENTO";

onBeforeMount(async () => {
  $q.loading.show();
  await authStore.loadModulo(siglas);
  if (modulo.value && modulo.value.leer) {
    await cargar();
  }
  $q.loading.hide();
});

const cargar = async () => {
  const resp = await store.loadPanel();
  if (!resp.success) {
    $q.notify({ color: "negative", position: "top-right", message: resp.data, icon: "report_problem" });
  }
};

const recargar = async () => {
  $q.loading.show();
  await cargar();
  $q.loading.hide();
};
</script>
