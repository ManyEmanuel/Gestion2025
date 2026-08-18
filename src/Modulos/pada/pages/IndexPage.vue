<template>
  <q-page padding>
    <div class="q-pa-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="PADA e informe anual" icon="event_note" />
      </q-breadcrumbs>
    </div>

    <div v-if="modulo && modulo.leer">
      <q-tabs v-model="tab" class="text-purple-ieen" active-color="purple-ieen" align="left">
        <q-tab name="programas" label="Programas (PADA)" icon="event_note" />
        <q-tab name="informes" label="Informes anuales" icon="fact_check" />
      </q-tabs>
      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <!-- ============ PROGRAMAS ============ -->
        <q-tab-panel name="programas">
          <q-table :rows="programas" :columns="colProgramas" row-key="id" flat bordered :pagination="{ rowsPerPage: 10 }">
            <template v-slot:top>
              <h1 class="text-h6">Programa Anual de Desarrollo Archivístico</h1><q-space />
              <q-btn v-if="modulo.registrar" color="secondary" icon="add" label="Nuevo" @click="nuevoPrograma" />
            </template>
            <template v-slot:body-cell-estado="props">
              <q-td :props="props"><q-chip dense :color="colorEstado(props.row.estado)" text-color="white">{{ props.row.estado }}</q-chip></q-td>
            </template>
            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <q-btn flat dense color="primary" icon="list_alt" @click="abrirActividades(props.row)"
  aria-label="Actividades"
><q-tooltip>Actividades</q-tooltip></q-btn>
                <q-btn v-if="modulo.actualizar && props.row.estado === 'Borrador'" flat dense color="secondary" icon="edit" @click="editarPrograma(props.row)"
  aria-label="Editar"
><q-tooltip>Editar</q-tooltip></q-btn>
                <q-btn v-if="puedeAprobar && props.row.estado === 'Borrador'" flat dense color="green" icon="task_alt" @click="aprobarPrograma(props.row)"
  aria-label="Aprobar"
><q-tooltip>Aprobar</q-tooltip></q-btn>
                <q-btn v-if="puedePublicar && props.row.estado === 'Aprobado'" flat dense color="deep-purple" icon="publish" @click="abrirPublicar('programa', props.row)"
  aria-label="Publicar"
><q-tooltip>Publicar</q-tooltip></q-btn>
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <!-- ============ INFORMES ============ -->
        <q-tab-panel name="informes">
          <q-table :rows="informes" :columns="colInformes" row-key="id" flat bordered :pagination="{ rowsPerPage: 10 }">
            <template v-slot:top>
              <h2 class="text-h6">Informe anual de cumplimiento</h2><q-space />
              <q-btn v-if="modulo.registrar" color="secondary" icon="add" label="Nuevo" @click="nuevoInforme" />
            </template>
            <template v-slot:body-cell-estado="props">
              <q-td :props="props"><q-chip dense :color="colorEstado(props.row.estado)" text-color="white">{{ props.row.estado }}</q-chip></q-td>
            </template>
            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <q-btn v-if="modulo.actualizar && props.row.estado === 'Borrador'" flat dense color="secondary" icon="edit" @click="editarInforme(props.row)"
  aria-label="Editar"
><q-tooltip>Editar</q-tooltip></q-btn>
                <q-btn v-if="puedeAprobar && props.row.estado === 'Borrador'" flat dense color="green" icon="task_alt" @click="aprobarInforme(props.row)"
  aria-label="Aprobar"
><q-tooltip>Aprobar</q-tooltip></q-btn>
                <q-btn v-if="puedePublicar && props.row.estado === 'Aprobado'" flat dense color="deep-purple" icon="publish" @click="abrirPublicar('informe', props.row)"
  aria-label="Publicar"
><q-tooltip>Publicar</q-tooltip></q-btn>
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>
      </q-tab-panels>
    </div>
    <SinPermisoBanner v-else modulo="PADA e informe anual" />

    <!-- Dialogo Programa -->
    <q-dialog v-model="dlgPrograma" persistent>
      <q-card flat bordered style="width: 640px; max-width: 92vw">
        <q-card-section class="row items-center"><h2 class="text-h6">{{ progEdit.id ? 'Editar' : 'Nuevo' }} programa</h2><q-space /><q-btn icon="close" flat round dense v-close-popup aria-label="Cerrar" /></q-card-section>
        <q-card-section><q-form @submit="guardarPrograma">
          <q-input v-model="progEdit.anio" label="Año" type="number" lazy-rules :rules="[(v) => !!v || 'Requerido']" />
          <q-input v-model="progEdit.objetivos" label="Objetivos" type="textarea" autogrow lazy-rules :rules="[(v) => !!v || 'Requerido']" />
          <q-input v-model="progEdit.alcance" label="Alcance" type="textarea" autogrow />
          <div class="text-right q-mt-md q-gutter-sm"><BtnCancelar /><q-btn :loading="guardando" type="submit" color="secondary" label="Guardar" icon="save" /></div>
        </q-form></q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialogo Actividades -->
    <q-dialog v-model="dlgActividades">
      <q-card flat bordered style="width: 860px; max-width: 94vw">
        <q-card-section class="row items-center"><h2 class="text-h6">Actividades — {{ programa && programa.anio }}</h2><q-space /><q-btn icon="close" flat round dense v-close-popup aria-label="Cerrar" /></q-card-section>
        <q-card-section>
          <q-list bordered separator v-if="programa && programa.actividades.length">
            <q-item v-for="a in programa.actividades" :key="a.id">
              <q-item-section>
                <q-item-label>{{ a.descripcion }}</q-item-label>
                <q-item-label caption>{{ a.responsable || '—' }} · {{ a.fechaInicio || '—' }} a {{ a.fechaFin || '—' }} · {{ estatusLabel(a.estatus) }}</q-item-label>
              </q-item-section>
              <q-item-section side v-if="puedeEditarActividades">
                <q-btn flat dense round color="red" icon="delete" @click="borrarActividad(a.id)" aria-label="Eliminar" />
              </q-item-section>
            </q-item>
          </q-list>
          <div v-else class="text-grey-7 q-pa-sm text-center">Sin actividades.</div>

          <q-form v-if="puedeEditarActividades" @submit="guardarActividad" class="q-mt-md q-pa-sm bg-grey-2 rounded-borders">
            <div class="text-subtitle2">Agregar actividad</div>
            <q-input v-model="actEdit.descripcion" label="Descripción" dense lazy-rules :rules="[(v) => !!v || 'Requerido']" />
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-4"><q-input v-model="actEdit.responsable" label="Responsable" dense /></div>
              <div class="col-6 col-md-3"><q-input v-model="actEdit.fechaInicio" label="Inicio" type="date" dense stack-label /></div>
              <div class="col-6 col-md-3"><q-input v-model="actEdit.fechaFin" label="Fin" type="date" dense stack-label /></div>
              <div class="col-12 col-md-2"><q-select v-model="actEdit.estatus" :options="estatusOpts" label="Estatus" dense emit-value map-options /></div>
            </div>
            <div class="text-right q-mt-sm"><q-btn :loading="guardando" type="submit" color="secondary" label="Agregar" icon="add" dense /></div>
          </q-form>
          <q-banner v-else class="bg-blue-1 q-mt-sm" dense>El programa no está en borrador; las actividades no son editables.</q-banner>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialogo Informe -->
    <q-dialog v-model="dlgInforme" persistent>
      <q-card flat bordered style="width: 660px; max-width: 92vw">
        <q-card-section class="row items-center"><h2 class="text-h6">{{ infEdit.id ? 'Editar' : 'Nuevo' }} informe</h2><q-space /><q-btn icon="close" flat round dense v-close-popup aria-label="Cerrar" /></q-card-section>
        <q-card-section><q-form @submit="guardarInforme">
          <q-input v-model="infEdit.anio" label="Año" type="number" lazy-rules :rules="[(v) => !!v || 'Requerido']" />
          <q-select v-if="!infEdit.id" v-model="infEdit.programaAnualId" :options="opcionesProgramas" label="Programa (PADA)" emit-value map-options lazy-rules :rules="[(v) => !!v || 'Requerido']" />
          <q-input v-model="infEdit.resultados" label="Resultados" type="textarea" autogrow lazy-rules :rules="[(v) => !!v || 'Requerido']" />
          <q-input v-model="infEdit.porcentajeCumplimiento" label="% de cumplimiento" type="number" />
          <q-input v-model="infEdit.observaciones" label="Observaciones" type="textarea" autogrow />
          <div class="text-right q-mt-md q-gutter-sm"><BtnCancelar /><q-btn :loading="guardando" type="submit" color="secondary" label="Guardar" icon="save" /></div>
        </q-form></q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialogo Publicar -->
    <q-dialog v-model="dlgPublicar" persistent>
      <q-card flat bordered style="width: 520px; max-width: 90vw">
        <q-card-section class="row items-center"><h2 class="text-h6">Publicar</h2><q-space /><q-btn icon="close" flat round dense v-close-popup aria-label="Cerrar" /></q-card-section>
        <q-card-section><q-form @submit="confirmarPublicar">
          <q-input v-model="urlPub" label="URL de publicación en el portal" lazy-rules :rules="[(v) => !!v || 'Requerido']" autofocus />
          <div class="text-right q-mt-md q-gutter-sm"><BtnCancelar /><q-btn :loading="guardando" type="submit" color="deep-purple" label="Publicar" icon="publish" /></div>
        </q-form></q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar";
import { onBeforeMount, ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../../../stores/auth_store";
import { usePadaStore } from "../../../stores/pada_store";
import SinPermisoBanner from "../../../components/SinPermisoBanner.vue";
import BtnCancelar from "../../../components/BtnCancelar.vue";

const $q = useQuasar();
const authStore = useAuthStore();
const store = usePadaStore();
const { modulo } = storeToRefs(authStore);
const { programas, informes, programa } = storeToRefs(store);
const siglas = "AI-PADA";

const tab = ref("programas");
const puedeAprobar = ref(false);
const puedePublicar = ref(false);
const guardando = ref(false);

const dlgPrograma = ref(false), dlgActividades = ref(false), dlgInforme = ref(false), dlgPublicar = ref(false);
const progEdit = ref({});
const infEdit = ref({});
const actEdit = ref({});
const urlPub = ref("");
const publicarCtx = ref({ tipo: null, id: null });

const ESTATUS = { 1: "Pendiente", 2: "En proceso", 3: "Concluida" };
const estatusOpts = [{ label: "Pendiente", value: 1 }, { label: "En proceso", value: 2 }, { label: "Concluida", value: 3 }];
const estatusLabel = (e) => ESTATUS[e] || e;
const colorEstado = (e) => (e === "Publicado" ? "deep-purple" : e === "Aprobado" ? "green" : "orange");

const colProgramas = [
  { name: "anio", label: "Año", field: "anio", align: "left", sortable: true },
  { name: "objetivos", label: "Objetivos", field: "objetivos", align: "left" },
  { name: "totalActividades", label: "Actividades", field: "totalActividades", align: "right" },
  { name: "estado", label: "Estado", field: "estado", align: "center" },
  { name: "acciones", label: "Acciones", field: "acciones", align: "center" },
];
const colInformes = [
  { name: "anio", label: "Año", field: "anio", align: "left", sortable: true },
  { name: "porcentajeCumplimiento", label: "% cumpl.", field: (r) => (r.porcentajeCumplimiento != null ? r.porcentajeCumplimiento + "%" : "—"), align: "right" },
  { name: "estado", label: "Estado", field: "estado", align: "center" },
  { name: "acciones", label: "Acciones", field: "acciones", align: "center" },
];

const opcionesProgramas = computed(() => programas.value.map((p) => ({ label: `${p.anio} — ${p.objetivos.slice(0, 40)}`, value: p.id })));
const puedeEditarActividades = computed(() => programa.value && programa.value.estado === "Borrador" && modulo.value && modulo.value.actualizar);

onBeforeMount(async () => {
  $q.loading.show();
  await authStore.loadModulo(siglas);
  puedeAprobar.value = authStore.tienePermiso("archivo.pada.aprobar");
  puedePublicar.value = authStore.tienePermiso("archivo.pada.publicar");
  if (modulo.value && modulo.value.leer) { await store.loadProgramas(); await store.loadInformes(); }
  $q.loading.hide();
});

// Programas
const nuevoPrograma = () => { progEdit.value = { anio: new Date().getFullYear(), objetivos: "", alcance: "" }; dlgPrograma.value = true; };
const editarPrograma = (row) => { progEdit.value = { id: row.id, anio: row.anio, objetivos: row.objetivos, alcance: row.alcance }; dlgPrograma.value = true; };
const guardarPrograma = async () => {
  guardando.value = true;
  const resp = progEdit.value.id ? await store.actualizarPrograma(progEdit.value.id, progEdit.value) : await store.crearPrograma(progEdit.value);
  guardando.value = false;
  notif(resp); if (resp.success) { dlgPrograma.value = false; await store.loadProgramas(); }
};
const abrirActividades = async (row) => { $q.loading.show(); await store.getPrograma(row.id); $q.loading.hide(); actEdit.value = { descripcion: "", responsable: "", fechaInicio: "", fechaFin: "", estatus: 1 }; dlgActividades.value = true; };
const guardarActividad = async () => {
  guardando.value = true;
  const resp = await store.agregarActividad(programa.value.id, actEdit.value);
  guardando.value = false;
  notif(resp); if (resp.success) { await store.getPrograma(programa.value.id); actEdit.value = { descripcion: "", responsable: "", fechaInicio: "", fechaFin: "", estatus: 1 }; await store.loadProgramas(); }
};
const borrarActividad = async (actividadId) => {
  const resp = await store.eliminarActividad(programa.value.id, actividadId);
  notif(resp); if (resp.success) { await store.getPrograma(programa.value.id); await store.loadProgramas(); }
};
const aprobarPrograma = async (row) => { const resp = await store.aprobarPrograma(row.id); notif(resp); if (resp.success) await store.loadProgramas(); };

// Informes
const nuevoInforme = () => { infEdit.value = { anio: new Date().getFullYear(), programaAnualId: null, resultados: "", porcentajeCumplimiento: null, observaciones: "" }; dlgInforme.value = true; };
const editarInforme = (row) => { infEdit.value = { id: row.id, anio: row.anio, resultados: row.resultados, porcentajeCumplimiento: row.porcentajeCumplimiento, observaciones: row.observaciones }; dlgInforme.value = true; };
const guardarInforme = async () => {
  guardando.value = true;
  const resp = infEdit.value.id ? await store.actualizarInforme(infEdit.value.id, infEdit.value) : await store.crearInforme(infEdit.value);
  guardando.value = false;
  notif(resp); if (resp.success) { dlgInforme.value = false; await store.loadInformes(); }
};
const aprobarInforme = async (row) => { const resp = await store.aprobarInforme(row.id); notif(resp); if (resp.success) await store.loadInformes(); };

// Publicar
const abrirPublicar = (tipo, row) => { publicarCtx.value = { tipo, id: row.id }; urlPub.value = ""; dlgPublicar.value = true; };
const confirmarPublicar = async () => {
  guardando.value = true;
  const { tipo, id } = publicarCtx.value;
  const resp = tipo === "programa" ? await store.publicarPrograma(id, urlPub.value) : await store.publicarInforme(id, urlPub.value);
  guardando.value = false;
  notif(resp);
  if (resp.success) { dlgPublicar.value = false; tipo === "programa" ? await store.loadProgramas() : await store.loadInformes(); }
};

const notif = (resp) => $q.notify({ type: resp.success ? "positive" : "negative", message: resp.data });
</script>

<style></style>
