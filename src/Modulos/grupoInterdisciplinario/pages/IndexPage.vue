<template>
  <q-page padding>
    <div class="q-pa-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Grupo interdisciplinario" icon="groups" />
      </q-breadcrumbs>
    </div>

    <div v-if="modulo && modulo.leer">
      <q-table :rows="grupos" :columns="columnas" row-key="id" flat bordered :pagination="{ rowsPerPage: 10 }">
        <template v-slot:top>
          <div class="text-h6">Grupos interdisciplinarios</div><q-space />
          <q-btn v-if="modulo.registrar" color="secondary" icon="add" label="Nuevo" @click="nuevoGrupo" />
        </template>
        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn flat dense color="primary" icon="event" @click="irSesiones(props.row)"><q-tooltip>Sesiones</q-tooltip></q-btn>
            <q-btn flat dense color="secondary" icon="group" @click="abrirIntegrantes(props.row)"><q-tooltip>Integrantes</q-tooltip></q-btn>
            <q-btn v-if="modulo.actualizar" flat dense color="deep-purple" icon="edit" @click="editarGrupo(props.row)"><q-tooltip>Editar</q-tooltip></q-btn>
            <q-btn v-if="modulo.eliminar" flat dense color="red" icon="delete" @click="borrarGrupo(props.row)"><q-tooltip>Eliminar</q-tooltip></q-btn>
          </q-td>
        </template>
        <template v-slot:no-data><div class="full-width row flex-center q-pa-md text-grey-7">Sin grupos registrados.</div></template>
      </q-table>
    </div>
    <q-banner v-else class="bg-orange-2">No tiene permiso para ver los grupos.</q-banner>

    <!-- Dialogo Grupo -->
    <q-dialog v-model="dlgGrupo" persistent>
      <q-card style="width: 640px; max-width: 92vw">
        <q-card-section class="row items-center"><div class="text-h6">{{ grupoEdit.id ? 'Editar' : 'Nuevo' }} grupo</div><q-space /><q-btn icon="close" flat round dense v-close-popup /></q-card-section>
        <q-card-section><q-form @submit="guardarGrupo">
          <q-input v-model="grupoEdit.nombre" label="Nombre" lazy-rules :rules="[(v) => !!v || 'Requerido']" />
          <div class="row q-col-gutter-sm">
            <div class="col-6"><q-input v-model="grupoEdit.vigenciaDesde" label="Vigencia desde" type="date" stack-label lazy-rules :rules="[(v) => !!v || 'Requerido']" /></div>
            <div class="col-6"><q-input v-model="grupoEdit.vigenciaHasta" label="Vigencia hasta" type="date" stack-label /></div>
          </div>
          <q-input v-model="grupoEdit.descripcion" label="Descripción" type="textarea" autogrow />
          <div class="text-right q-mt-md q-gutter-sm"><q-btn color="red" label="Cancelar" icon="highlight_off" v-close-popup /><q-btn :loading="guardando" type="submit" color="secondary" label="Guardar" icon="save" /></div>
        </q-form></q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialogo Integrantes -->
    <q-dialog v-model="dlgIntegrantes">
      <q-card style="width: 720px; max-width: 92vw">
        <q-card-section class="row items-center"><div class="text-h6">Integrantes — {{ grupo && grupo.nombre }}</div><q-space /><q-btn icon="close" flat round dense v-close-popup /></q-card-section>
        <q-card-section>
          <q-list bordered separator v-if="grupo && grupo.integrantes.length">
            <q-item v-for="i in grupo.integrantes" :key="i.id">
              <q-item-section><q-item-label>{{ i.nombre }}</q-item-label><q-item-label caption>{{ i.rol }}</q-item-label></q-item-section>
              <q-item-section side v-if="modulo.actualizar"><q-btn flat dense round color="red" icon="delete" @click="borrarIntegrante(i.id)" /></q-item-section>
            </q-item>
          </q-list>
          <div v-else class="text-grey-7 q-pa-sm text-center">Sin integrantes.</div>
          <q-form v-if="modulo.actualizar" @submit="guardarIntegrante" class="q-mt-md q-pa-sm bg-grey-2 rounded-borders">
            <div class="text-subtitle2">Agregar integrante</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-5"><q-input v-model="intEdit.nombre" label="Nombre" dense lazy-rules :rules="[(v) => !!v || 'Requerido']" /></div>
              <div class="col-12 col-md-7"><q-input v-model="intEdit.rol" label="Carácter / rol" dense lazy-rules :rules="[(v) => !!v || 'Requerido']" /></div>
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
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../../../stores/auth_store";
import { useGrupoStore } from "../../../stores/grupo_interdisciplinario_store";

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const store = useGrupoStore();
const { modulo } = storeToRefs(authStore);
const { grupos, grupo } = storeToRefs(store);
const siglas = "AI-GRUPO";

const dlgGrupo = ref(false), dlgIntegrantes = ref(false), guardando = ref(false);
const grupoEdit = ref({});
const intEdit = ref({});

const fecha = (f) => (f ? new Date(f).toLocaleDateString() : "");
const columnas = [
  { name: "nombre", label: "Nombre", field: "nombre", align: "left" },
  { name: "vigenciaDesde", label: "Desde", field: (r) => fecha(r.vigenciaDesde), align: "left" },
  { name: "vigenciaHasta", label: "Hasta", field: (r) => fecha(r.vigenciaHasta), align: "left" },
  { name: "totalIntegrantes", label: "Integrantes", field: "totalIntegrantes", align: "right" },
  { name: "acciones", label: "Acciones", field: "acciones", align: "center" },
];

onBeforeMount(async () => {
  $q.loading.show();
  await authStore.loadModulo(siglas);
  if (modulo.value && modulo.value.leer) await store.loadGrupos();
  $q.loading.hide();
});

const irSesiones = (row) => router.push({ name: "sesionesGrupo", params: { grupoId: row.id } });

const nuevoGrupo = () => { grupoEdit.value = { nombre: "", vigenciaDesde: "", vigenciaHasta: "", descripcion: "" }; dlgGrupo.value = true; };
const editarGrupo = (row) => { grupoEdit.value = { id: row.id, nombre: row.nombre, vigenciaDesde: row.vigenciaDesde, vigenciaHasta: row.vigenciaHasta, descripcion: row.descripcion }; dlgGrupo.value = true; };
const guardarGrupo = async () => {
  guardando.value = true;
  const resp = grupoEdit.value.id ? await store.actualizarGrupo(grupoEdit.value.id, grupoEdit.value) : await store.crearGrupo(grupoEdit.value);
  guardando.value = false;
  notif(resp); if (resp.success) { dlgGrupo.value = false; await store.loadGrupos(); }
};
const borrarGrupo = (row) => $q.dialog({ title: "Eliminar", message: `¿Eliminar el grupo "${row.nombre}"?`, cancel: true, persistent: true }).onOk(async () => {
  const resp = await store.eliminarGrupo(row.id); notif(resp); if (resp.success) await store.loadGrupos();
});

const abrirIntegrantes = async (row) => { $q.loading.show(); await store.getGrupo(row.id); $q.loading.hide(); intEdit.value = { nombre: "", rol: "" }; dlgIntegrantes.value = true; };
const guardarIntegrante = async () => {
  guardando.value = true;
  const resp = await store.agregarIntegrante(grupo.value.id, intEdit.value);
  guardando.value = false;
  notif(resp); if (resp.success) { await store.getGrupo(grupo.value.id); intEdit.value = { nombre: "", rol: "" }; await store.loadGrupos(); }
};
const borrarIntegrante = async (integranteId) => {
  const resp = await store.eliminarIntegrante(grupo.value.id, integranteId);
  notif(resp); if (resp.success) { await store.getGrupo(grupo.value.id); await store.loadGrupos(); }
};

const notif = (resp) => $q.notify({ type: resp.success ? "positive" : "negative", message: resp.data });
</script>

<style></style>
