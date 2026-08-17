<template>
  <q-page class="q-pa-md">
    <div v-if="modulo && modulo.leer">
      <div class="row items-center q-mb-md">
        <div class="text-h6 text-purple-ieen">Administración de perfiles</div>
        <q-space />
        <q-btn
          v-if="modulo.registrar"
          color="purple-ieen"
          icon="add"
          label="Nuevo perfil"
          @click="abrirCrear"
        />
      </div>

      <q-table
        :rows="perfiles"
        :columns="columns"
        :filter="filter"
        row-key="id"
        :loading="cargando"
        rows-per-page-label="Filas por página"
        no-data-label="No hay perfiles"
      >
        <template v-slot:top-right>
          <q-input dense debounce="300" v-model="filter" placeholder="Buscar..">
            <template v-slot:append><q-icon name="search" /></template>
          </q-input>
        </template>
        <template v-slot:body-cell-permisos="props">
          <q-td :props="props" class="text-center">
            <q-chip dense color="purple-ieen" text-color="white" :label="props.row.permisoIds.length" />
          </q-td>
        </template>
        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" class="text-center">
            <q-btn
              v-if="modulo.actualizar"
              flat
              round
              color="purple-ieen"
              icon="edit"
              @click="abrirEditar(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              v-if="modulo.actualizar"
              flat
              round
              color="teal"
              icon="key"
              @click="abrirPermisos(props.row)"
            >
              <q-tooltip>Permisos</q-tooltip>
            </q-btn>
            <q-btn
              v-if="modulo.eliminar"
              flat
              round
              color="negative"
              icon="delete"
              @click="confirmarEliminar(props.row)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>
    <div v-else class="text-grey q-pa-lg">No tiene permisos para ver este módulo.</div>

    <!-- Alta / edición -->
    <q-dialog v-model="mostrarDialog" persistent>
      <q-card style="min-width: 420px">
        <q-card-section class="text-h6">{{ editando ? "Editar perfil" : "Nuevo perfil" }}</q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model="form.nombre" label="Nombre *" autofocus :rules="[(v) => !!v || 'Requerido']" />
          <q-input v-model="form.descripcion" label="Descripción" type="textarea" autogrow />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="purple-ieen" label="Guardar" :loading="guardando" @click="guardar" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Asignación de permisos -->
    <q-dialog v-model="mostrarPermisos" persistent>
      <q-card style="min-width: 480px; max-width: 90vw">
        <q-card-section class="text-h6">Permisos — {{ perfilPermisos.nombre }}</q-card-section>
        <q-card-section style="max-height: 60vh" class="scroll q-pt-none">
          <q-list>
            <q-expansion-item
              v-for="g in grupos"
              :key="g.grupo"
              :label="g.label"
              :caption="`${contarGrupo(g)} / ${g.permisos.length}`"
              expand-separator
              dense
            >
              <div class="q-pl-md q-pb-sm">
                <q-checkbox
                  v-for="p in g.permisos"
                  :key="p.id"
                  v-model="sel[p.id]"
                  :label="p.accion"
                  color="purple-ieen"
                  dense
                  class="q-mr-md"
                />
              </div>
            </q-expansion-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="purple-ieen" label="Guardar permisos" :loading="guardando" @click="guardarPermisos" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onBeforeMount } from "vue";
import { storeToRefs } from "pinia";
import { useQuasar } from "quasar";
import { useAuthStore } from "../../../stores/auth_store";
import { usePerfilesStore } from "../../../stores/perfiles_store";

const $q = useQuasar();
const authStore = useAuthStore();
const perfilesStore = usePerfilesStore();
const { modulo } = storeToRefs(authStore);
const { perfiles, permisos } = storeToRefs(perfilesStore);

const filter = ref("");
const cargando = ref(false);
const guardando = ref(false);
const mostrarDialog = ref(false);
const editando = ref(false);
const form = ref({ id: null, nombre: "", descripcion: "" });
const mostrarPermisos = ref(false);
const perfilPermisos = ref({ id: null, nombre: "" });
const sel = ref({});

const columns = [
  { name: "nombre", label: "Perfil", field: "nombre", align: "left", sortable: true },
  { name: "descripcion", label: "Descripción", field: "descripcion", align: "left", sortable: true },
  { name: "permisos", label: "Permisos", field: (r) => r.permisoIds.length, align: "center", sortable: true },
  { name: "acciones", label: "Acciones", field: "id", align: "center", sortable: false },
];

// Agrupa el catálogo por el prefijo de la clave (todo menos la acción final).
const grupos = computed(() => {
  const map = {};
  for (const p of permisos.value) {
    const partes = p.clave.split(".");
    const accion = partes[partes.length - 1];
    const grupo = partes.slice(0, -1).join(".");
    if (!map[grupo]) map[grupo] = { grupo, label: grupo.replace(/^archivo\./, ""), permisos: [] };
    map[grupo].permisos.push({ id: p.id, accion, clave: p.clave });
  }
  return Object.values(map).sort((a, b) => a.grupo.localeCompare(b.grupo));
});

const contarGrupo = (g) => g.permisos.filter((p) => sel.value[p.id]).length;

onBeforeMount(async () => {
  await authStore.loadModulo("AI-ADMIN-PERFILES");
  cargando.value = true;
  await Promise.all([perfilesStore.loadAdmin(), perfilesStore.loadPermisos()]);
  cargando.value = false;
});

const abrirCrear = () => {
  editando.value = false;
  form.value = { id: null, nombre: "", descripcion: "" };
  mostrarDialog.value = true;
};

const abrirEditar = (row) => {
  editando.value = true;
  form.value = { id: row.id, nombre: row.nombre, descripcion: row.descripcion || "" };
  mostrarDialog.value = true;
};

const guardar = async () => {
  if (!form.value.nombre) {
    $q.notify({ type: "warning", message: "El nombre es obligatorio." });
    return;
  }
  guardando.value = true;
  const resp = editando.value
    ? await perfilesStore.actualizar(form.value.id, form.value)
    : await perfilesStore.crear(form.value);
  guardando.value = false;
  if (resp.success) {
    $q.notify({ type: "positive", message: resp.data });
    mostrarDialog.value = false;
  } else {
    $q.notify({ type: "negative", message: resp.data });
  }
};

const abrirPermisos = (row) => {
  perfilPermisos.value = { id: row.id, nombre: row.nombre };
  const marcado = {};
  for (const id of row.permisoIds) marcado[id] = true;
  sel.value = marcado;
  mostrarPermisos.value = true;
};

const guardarPermisos = async () => {
  const ids = Object.keys(sel.value).filter((k) => sel.value[k]);
  guardando.value = true;
  const resp = await perfilesStore.asignarPermisos(perfilPermisos.value.id, ids);
  guardando.value = false;
  if (resp.success) {
    $q.notify({ type: "positive", message: resp.data });
    mostrarPermisos.value = false;
  } else {
    $q.notify({ type: "negative", message: resp.data });
  }
};

const confirmarEliminar = (row) => {
  $q.dialog({
    title: "Eliminar perfil",
    message: `¿Eliminar el perfil "${row.nombre}"?`,
    cancel: { label: "Cancelar", color: "grey" },
    ok: { label: "Eliminar", color: "negative" },
    persistent: true,
  }).onOk(async () => {
    $q.loading.show();
    const resp = await perfilesStore.eliminar(row.id);
    $q.loading.hide();
    $q.notify({ type: resp.success ? "positive" : "negative", message: resp.data });
  });
};
</script>
