<template>
  <q-page padding>
    <div class="q-pa-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Interoperabilidad" icon="cloud_download" />
      </q-breadcrumbs>
    </div>

    <div v-if="modulo && modulo.leer">
      <q-banner dense class="bg-purple-ieen text-white q-mb-md" rounded>
        Export documentado y versionado de los instrumentos de control hacia el Registro Estatal /
        Archivo General del Estado (LGA 78-81 / Nay 60-61).
      </q-banner>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-4" v-for="e in indice" :key="e.esquema">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle1 text-purple-ieen">{{ tituloDe(e.esquema) }}</div>
              <div class="text-caption text-grey-8">{{ e.descripcion }}</div>
              <q-chip dense size="sm" color="purple-ieen-3" text-color="white" class="q-mt-sm">
                {{ e.esquema }} · v{{ e.version }}
              </q-chip>
            </q-card-section>
            <q-separator />
            <q-card-actions align="right">
              <q-btn flat color="secondary" icon="visibility" label="Ver" @click="ver(e.esquema)" />
              <q-btn flat color="primary" icon="download" label="Descargar" @click="descargar(e.esquema)" />
            </q-card-actions>
          </q-card>
        </div>
      </div>

      <q-card flat bordered class="q-mt-lg" v-if="documento">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ tituloDe(esquemaActual) }}</div>
          <q-space />
          <q-chip dense color="grey-3">Generado: {{ fecha(documento.generadoEn) }}</q-chip>
          <q-btn flat round dense icon="close" @click="cerrar" />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <!-- Cuadro de clasificación: árbol fondo → sección → serie → subserie -->
          <q-tree
            v-if="esquemaActual === 'universoarchivo.cuadro-clasificacion'"
            :nodes="nodosCuadro"
            node-key="id"
            default-expand-all
            no-connectors
          />
          <!-- CADIDO / Guía: tabla -->
          <q-table
            v-else
            :rows="documento.datos"
            :columns="columnas"
            row-key="__i"
            flat dense
            :pagination="{ rowsPerPage: 15 }"
          />
        </q-card-section>
      </q-card>
    </div>
    <q-banner v-else class="bg-orange-2">No tiene permiso para exportar instrumentos.</q-banner>
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar";
import { onBeforeMount, computed } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../../../stores/auth_store";
import { useInteroperabilidadStore } from "../../../stores/interoperabilidad_store";

const $q = useQuasar();
const authStore = useAuthStore();
const store = useInteroperabilidadStore();
const { modulo } = storeToRefs(authStore);
const { indice, documento, esquemaActual } = storeToRefs(store);
const siglas = "AI-INTEROP";

const META = {
  "universoarchivo.cuadro-clasificacion": { titulo: "Cuadro de clasificación", subruta: "cuadro-clasificacion", archivo: "cuadro-clasificacion.json" },
  "universoarchivo.cadido": { titulo: "CADIDO", subruta: "cadido", archivo: "cadido.json" },
  "universoarchivo.guia-archivo": { titulo: "Guía de archivo", subruta: "guia-archivo", archivo: "guia-archivo.json" },
};

const tituloDe = (esquema) => (META[esquema] && META[esquema].titulo) || esquema;
const fecha = (f) => (f ? new Date(f).toLocaleString() : "");

const COLUMNAS = {
  "universoarchivo.cadido": [
    { name: "serieSubSerie", label: "Serie/Subserie", field: "serieSubSerie", align: "left" },
    { name: "nombre", label: "Nombre", field: "nombre", align: "left" },
    { name: "valorDocumental", label: "Valor", field: "valorDocumental", align: "left" },
    { name: "valoresTipificados", label: "Valores tipificados", field: "valoresTipificados", align: "left" },
    { name: "nivelSeguridad", label: "Nivel", field: "nivelSeguridad", align: "left" },
    { name: "vigenciaTotal", label: "Vig. total", field: "vigenciaTotal", align: "right" },
    { name: "destinoFinal", label: "Destino", field: "destinoFinal", align: "left" },
  ],
  "universoarchivo.guia-archivo": [
    { name: "fondo", label: "Fondo", field: "fondo", align: "left" },
    { name: "area", label: "Área", field: "area", align: "left" },
    { name: "seccion", label: "Sección", field: "seccion", align: "left" },
    { name: "serie", label: "Serie", field: "serie", align: "left" },
    { name: "totalExpedientes", label: "Volumen", field: "totalExpedientes", align: "right" },
    { name: "responsable", label: "Responsable", field: "responsable", align: "left" },
  ],
};
const columnas = computed(() => COLUMNAS[esquemaActual.value] || []);

const nodosCuadro = computed(() => {
  const datos = documento.value ? documento.value.datos : [];
  return (datos || []).map((f, i) => ({
    id: `f${i}`, label: `${f.clave} — ${f.nombre}`, icon: "account_balance",
    children: (f.secciones || []).map((sec, j) => ({
      id: `f${i}s${j}`, label: `${sec.clave} — ${sec.nombre}`, icon: "menu_book",
      children: (sec.series || []).map((se, k) => ({
        id: `f${i}s${j}e${k}`, label: `${se.clave} — ${se.nombre}`, icon: "folder",
        children: (se.subSeries || []).map((ss, l) => ({
          id: `f${i}s${j}e${k}u${l}`, label: `${ss.clave} — ${ss.nombre}`, icon: "subdirectory_arrow_right",
        })),
      })),
    })),
  }));
});

onBeforeMount(async () => {
  $q.loading.show();
  await authStore.loadModulo(siglas);
  if (modulo.value && modulo.value.leer) {
    await store.loadIndice();
  }
  $q.loading.hide();
});

const ver = async (esquema) => {
  $q.loading.show();
  const resp = await store.verExport(META[esquema].subruta, esquema);
  $q.loading.hide();
  if (!resp.success) $q.notify({ type: "negative", message: resp.data });
};

const descargar = async (esquema) => {
  $q.loading.show();
  const resp = await store.descargarExport(META[esquema].subruta, META[esquema].archivo);
  $q.loading.hide();
  $q.notify({ type: resp.success ? "positive" : "negative", message: resp.success ? "Export descargado" : resp.data });
};

const cerrar = () => { store.documento = null; };
</script>

<style></style>
