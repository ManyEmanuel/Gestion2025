<template>
  <q-page padding>
    <div class="q-pa-md q-gutter-sm row items-center">
      <q-breadcrumbs>
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Grupo interdisciplinario" icon="groups" to="/grupoInterdisciplinario" />
        <q-breadcrumbs-el label="Sesiones" icon="event" />
      </q-breadcrumbs>
    </div>

    <div v-if="modulo && modulo.leer">
      <q-table :rows="sesiones" :columns="columnas" row-key="id" flat bordered :pagination="{ rowsPerPage: 10 }">
        <template v-slot:top>
          <div class="text-h6">Sesiones y acuerdos</div><q-space />
          <q-btn v-if="modulo.registrar" color="secondary" icon="add" label="Nueva sesión" @click="nuevaSesion" />
        </template>
        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn flat dense color="primary" icon="gavel" @click="abrirAcuerdos(props.row)"><q-tooltip>Acuerdos</q-tooltip></q-btn>
            <q-btn v-if="modulo.actualizar" flat dense color="deep-purple" icon="edit" @click="editarSesion(props.row)"><q-tooltip>Editar</q-tooltip></q-btn>
            <q-btn v-if="modulo.eliminar" flat dense color="red" icon="delete" @click="borrarSesion(props.row)"><q-tooltip>Eliminar</q-tooltip></q-btn>
          </q-td>
        </template>
        <template v-slot:no-data><div class="full-width row flex-center q-pa-md text-grey-7">Sin sesiones.</div></template>
      </q-table>
    </div>
    <q-banner v-else class="bg-orange-2">No tiene permiso.</q-banner>

    <!-- Dialogo Sesión -->
    <q-dialog v-model="dlgSesion" persistent>
      <q-card style="width: 640px; max-width: 92vw">
        <q-card-section class="row items-center"><div class="text-h6">{{ sesEdit.id ? 'Editar' : 'Nueva' }} sesión</div><q-space /><q-btn icon="close" flat round dense v-close-popup /></q-card-section>
        <q-card-section><q-form @submit="guardarSesion">
          <q-input v-model="sesEdit.fecha" label="Fecha" type="date" stack-label lazy-rules :rules="[(v) => !!v || 'Requerido']" />
          <q-input v-model="sesEdit.ordenDelDia" label="Orden del día" type="textarea" autogrow />
          <q-input v-model="sesEdit.minuta" label="Minuta (texto o URL del acta)" type="textarea" autogrow />
          <div class="text-right q-mt-md q-gutter-sm"><q-btn color="red" label="Cancelar" icon="highlight_off" v-close-popup /><q-btn :loading="guardando" type="submit" color="secondary" label="Guardar" icon="save" /></div>
        </q-form></q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialogo Acuerdos -->
    <q-dialog v-model="dlgAcuerdos">
      <q-card style="width: 860px; max-width: 94vw">
        <q-card-section class="row items-center"><div class="text-h6">Acuerdos — sesión {{ sesion && fecha(sesion.fecha) }}</div><q-space /><q-btn icon="close" flat round dense v-close-popup /></q-card-section>
        <q-card-section>
          <q-list bordered separator v-if="sesion && sesion.acuerdos.length">
            <q-item v-for="a in sesion.acuerdos" :key="a.id">
              <q-item-section>
                <q-item-label>{{ a.descripcion }}</q-item-label>
                <q-item-label caption>
                  <q-badge v-if="a.disposicionDocumentalId" color="teal" class="q-mr-xs">Disposición vinculada</q-badge>
                  <q-badge v-if="a.fichaTecnicaValoracionId" color="indigo">Ficha vinculada</q-badge>
                  <span v-if="!a.disposicionDocumentalId && !a.fichaTecnicaValoracionId">Sin vínculo a valoración</span>
                </q-item-label>
              </q-item-section>
              <q-item-section side v-if="modulo.actualizar"><q-btn flat dense round color="red" icon="delete" @click="borrarAcuerdo(a.id)" /></q-item-section>
            </q-item>
          </q-list>
          <div v-else class="text-grey-7 q-pa-sm text-center">Sin acuerdos.</div>

          <q-form v-if="modulo.actualizar" @submit="guardarAcuerdo" class="q-mt-md q-pa-sm bg-grey-2 rounded-borders">
            <div class="text-subtitle2">Agregar acuerdo</div>
            <q-input v-model="acuEdit.descripcion" label="Descripción" dense lazy-rules :rules="[(v) => !!v || 'Requerido']" />
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-7"><q-select v-model="acuEdit.disposicionDocumentalId" :options="disposiciones" label="Disposición vinculada (opcional)" dense clearable emit-value map-options use-input @filter="filtrarDisp" :options-dense="true" /></div>
              <div class="col-12 col-md-5"><q-input v-model="acuEdit.fichaTecnicaValoracionId" label="Ficha (GUID, opcional)" dense /></div>
            </div>
            <div class="text-right q-mt-sm"><q-btn :loading="guardando" type="submit" color="secondary" label="Agregar" icon="add" dense /></div>
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
import { useGrupoStore } from "../../../stores/grupo_interdisciplinario_store";

const props = defineProps({ grupoId: { type: String, required: true } });
const $q = useQuasar();
const authStore = useAuthStore();
const store = useGrupoStore();
const { modulo } = storeToRefs(authStore);
const { sesiones, sesion, disposiciones } = storeToRefs(store);
const siglas = "AI-GRUPO";
let dispCompletas = [];

const dlgSesion = ref(false), dlgAcuerdos = ref(false), guardando = ref(false);
const sesEdit = ref({});
const acuEdit = ref({});

const fecha = (f) => (f ? new Date(f).toLocaleDateString() : "");
const columnas = [
  { name: "fecha", label: "Fecha", field: (r) => fecha(r.fecha), align: "left" },
  { name: "ordenDelDia", label: "Orden del día", field: "ordenDelDia", align: "left" },
  { name: "totalAcuerdos", label: "Acuerdos", field: "totalAcuerdos", align: "right" },
  { name: "acciones", label: "Acciones", field: "acciones", align: "center" },
];

onBeforeMount(async () => {
  $q.loading.show();
  await authStore.loadModulo(siglas);
  if (modulo.value && modulo.value.leer) {
    await store.loadSesiones(props.grupoId);
    await store.loadDisposiciones();
    dispCompletas = disposiciones.value;
  }
  $q.loading.hide();
});

const filtrarDisp = (val, update) => {
  update(() => {
    if (!val) { disposiciones.value = dispCompletas; return; }
    const n = val.toLowerCase();
    disposiciones.value = dispCompletas.filter((d) => d.label.toLowerCase().includes(n));
  });
};

const nuevaSesion = () => { sesEdit.value = { grupoId: props.grupoId, fecha: "", ordenDelDia: "", minuta: "" }; dlgSesion.value = true; };
const editarSesion = (row) => { sesEdit.value = { id: row.id, fecha: row.fecha, ordenDelDia: row.ordenDelDia, minuta: row.minuta }; dlgSesion.value = true; };
const guardarSesion = async () => {
  guardando.value = true;
  const resp = sesEdit.value.id ? await store.actualizarSesion(sesEdit.value.id, sesEdit.value) : await store.crearSesion(sesEdit.value);
  guardando.value = false;
  notif(resp); if (resp.success) { dlgSesion.value = false; await store.loadSesiones(props.grupoId); }
};
const borrarSesion = (row) => $q.dialog({ title: "Eliminar", message: "¿Eliminar la sesión?", cancel: true, persistent: true }).onOk(async () => {
  const resp = await store.eliminarSesion(row.id); notif(resp); if (resp.success) await store.loadSesiones(props.grupoId);
});

const abrirAcuerdos = async (row) => { $q.loading.show(); await store.getSesion(row.id); $q.loading.hide(); acuEdit.value = { descripcion: "", disposicionDocumentalId: null, fichaTecnicaValoracionId: "" }; dlgAcuerdos.value = true; };
const guardarAcuerdo = async () => {
  guardando.value = true;
  const resp = await store.agregarAcuerdo(sesion.value.id, acuEdit.value);
  guardando.value = false;
  notif(resp); if (resp.success) { await store.getSesion(sesion.value.id); acuEdit.value = { descripcion: "", disposicionDocumentalId: null, fichaTecnicaValoracionId: "" }; await store.loadSesiones(props.grupoId); }
};
const borrarAcuerdo = async (acuerdoId) => {
  const resp = await store.eliminarAcuerdo(sesion.value.id, acuerdoId);
  notif(resp); if (resp.success) { await store.getSesion(sesion.value.id); await store.loadSesiones(props.grupoId); }
};

const notif = (resp) => $q.notify({ type: resp.success ? "positive" : "negative", message: resp.data });
</script>

<style></style>
