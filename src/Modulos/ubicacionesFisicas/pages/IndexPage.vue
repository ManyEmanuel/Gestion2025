<template>
  <q-page padding>
    <div class="q-pa-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Ubicaciones físicas" icon="warehouse" />
      </q-breadcrumbs>
    </div>

    <div v-if="modulo && modulo.leer">
      <q-card flat bordered>
        <q-card-section class="row items-center">
          <h1 class="text-h6">Catálogo de ubicación física</h1>
          <q-space />
          <q-btn v-if="modulo.registrar" flat dense color="secondary" icon="add" label="Agregar edificio"
            @click="abrirCrear(null, 1)" />
          <q-btn flat round dense icon="refresh" @click="recargar" aria-label="Actualizar" />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-tree
            :nodes="arbol"
            node-key="id"
            label-key="nombre"
            children-key="hijos"
            default-expand-all
          >
            <template v-slot:default-header="prop">
              <div class="row items-center full-width">
                <q-icon :name="iconoDeNivel(prop.node.nivel)" class="q-mr-sm" />
                <span :class="prop.node.activa ? '' : 'text-grey text-strike'">{{ prop.node.nombre }}</span>
                <q-badge v-if="!prop.node.activa" color="grey" label="inactiva" class="q-ml-sm" />
                <q-space />
                <template v-if="modulo.registrar">
                  <q-btn v-if="prop.node.nivel !== 'Anaquel'" flat round dense size="sm" icon="add"
                    @click.stop="abrirCrear(prop.node.id, siguienteNivel(prop.node.nivel))" aria-label="Agregar hijo">
                    <q-tooltip>Agregar hijo</q-tooltip>
                  </q-btn>
                  <q-btn flat round dense size="sm" icon="edit" @click.stop="abrirRenombrar(prop.node)" aria-label="Renombrar">
                    <q-tooltip>Renombrar</q-tooltip>
                  </q-btn>
                  <q-btn v-if="prop.node.activa" flat round dense size="sm" icon="block" color="negative"
                    @click.stop="confirmarDesactivar(prop.node)" aria-label="Desactivar">
                    <q-tooltip>Desactivar</q-tooltip>
                  </q-btn>
                </template>
              </div>
            </template>
          </q-tree>
          <div v-if="arbol.length === 0" class="text-grey-7 q-pa-md">Sin ubicaciones registradas.</div>
        </q-card-section>
      </q-card>
    </div>
    <SinPermisoBanner v-else modulo="Ubicaciones físicas" />

    <q-dialog v-model="dialogoCrear" persistent>
      <q-card flat bordered style="width: 400px; max-width: 90vw">
        <q-card-section class="row items-center">
          <h2 class="text-h6">Agregar {{ nivelACrear }}</h2>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup aria-label="Cerrar" />
        </q-card-section>
        <q-card-section>
          <q-form @submit="confirmarCrear">
            <q-input v-model="nombreNuevo" label="Nombre" autofocus lazy-rules
              :rules="[(v) => !!v || 'El nombre es requerido']" />
            <div class="text-right q-mt-md q-gutter-sm">
              <BtnCancelar />
              <q-btn :loading="guardando" type="submit" color="secondary" label="Guardar" icon="save" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoRenombrar" persistent>
      <q-card flat bordered style="width: 400px; max-width: 90vw">
        <q-card-section class="row items-center">
          <h2 class="text-h6">Renombrar</h2>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup aria-label="Cerrar" />
        </q-card-section>
        <q-card-section>
          <q-form @submit="confirmarRenombrar">
            <q-input v-model="nombreRenombrar" label="Nombre" autofocus lazy-rules
              :rules="[(v) => !!v || 'El nombre es requerido']" />
            <div class="text-right q-mt-md q-gutter-sm">
              <BtnCancelar />
              <q-btn :loading="guardando" type="submit" color="secondary" label="Guardar" icon="save" />
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
import { useUbicacionesFisicasStore } from "../../../stores/ubicaciones_fisicas_store";
import SinPermisoBanner from "../../../components/SinPermisoBanner.vue";
import BtnCancelar from "../../../components/BtnCancelar.vue";

const $q = useQuasar();
const authStore = useAuthStore();
const store = useUbicacionesFisicasStore();
const { modulo } = storeToRefs(authStore);
const { arbol } = storeToRefs(store);
const siglas = "AI-UBICACIONES";

const NIVELES = { 1: "Edificio", 2: "Almacen", 3: "Estante", 4: "Anaquel" };
const iconoDeNivel = (nivel) => ({
  Edificio: "apartment", Almacen: "warehouse", Estante: "shelves", Anaquel: "inventory_2",
}[nivel] || "place");
const siguienteNivel = (nivelActual) => {
  const num = Object.keys(NIVELES).find((k) => NIVELES[k] === nivelActual);
  return Number(num) + 1;
};

const dialogoCrear = ref(false);
const padreNuevo = ref(null);
const nivelNumNuevo = ref(1);
const nivelACrear = ref("");
const nombreNuevo = ref("");
const dialogoRenombrar = ref(false);
const nodoRenombrar = ref(null);
const nombreRenombrar = ref("");
const guardando = ref(false);

const recargar = async () => {
  const resp = await store.loadArbol();
  if (!resp.success) $q.notify({ type: "negative", message: resp.data });
};

const abrirCrear = (padreId, nivelNum) => {
  padreNuevo.value = padreId;
  nivelNumNuevo.value = nivelNum;
  nivelACrear.value = NIVELES[nivelNum];
  nombreNuevo.value = "";
  dialogoCrear.value = true;
};

const confirmarCrear = async () => {
  guardando.value = true;
  const resp = await store.crear(padreNuevo.value, nivelNumNuevo.value, nombreNuevo.value);
  guardando.value = false;
  if (resp.success) {
    dialogoCrear.value = false;
    $q.notify({ type: "positive", message: resp.data });
    await recargar();
  } else {
    $q.notify({ type: "negative", message: resp.data });
  }
};

const abrirRenombrar = (nodo) => {
  nodoRenombrar.value = nodo;
  nombreRenombrar.value = nodo.nombre;
  dialogoRenombrar.value = true;
};

const confirmarRenombrar = async () => {
  guardando.value = true;
  const resp = await store.renombrar(nodoRenombrar.value.id, nombreRenombrar.value);
  guardando.value = false;
  if (resp.success) {
    dialogoRenombrar.value = false;
    $q.notify({ type: "positive", message: resp.data });
    await recargar();
  } else {
    $q.notify({ type: "negative", message: resp.data });
  }
};

const confirmarDesactivar = (nodo) => {
  $q.dialog({
    title: "Desactivar ubicación",
    message: `¿Está seguro de desactivar "${nodo.nombre}"? Los expedientes ya asignados conservan la referencia.`,
    persistent: true,
    ok: { color: "negative", label: "Desactivar" },
    cancel: { color: "primary", label: "Cancelar" },
  }).onOk(async () => {
    const resp = await store.desactivar(nodo.id);
    if (resp.success) {
      $q.notify({ type: "positive", message: resp.data });
      await recargar();
    } else {
      $q.notify({ type: "negative", message: resp.data });
    }
  });
};

onBeforeMount(async () => {
  $q.loading.show();
  await authStore.loadModulo(siglas);
  if (modulo.value && modulo.value.leer) await recargar();
  $q.loading.hide();
});
</script>

<style></style>
