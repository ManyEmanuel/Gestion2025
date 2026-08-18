<template>
  <q-page class="q-pa-md">
    <div v-if="modulo && modulo.leer">
      <q-breadcrumbs class="q-mb-sm">
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Áreas" icon="account_tree" />
      </q-breadcrumbs>
      <div class="row items-center q-mb-md">
        <h1 class="text-h6 text-purple-ieen">Administración de áreas</h1>
        <q-space />
        <q-btn
          v-if="modulo.registrar"
          color="purple-ieen"
          icon="add"
          label="Nueva área"
          @click="abrirCrear"
        />
      </div>

      <q-table
        :rows="areasAdmin"
        :columns="columns"
        :filter="filter"
        row-key="id"
        :loading="cargando"
        rows-per-page-label="Filas por página"
        no-data-label="No hay áreas registradas. Usa &quot;Nueva área&quot; para crear la primera."
      >
        <template v-slot:top-right>
          <q-input dense debounce="300" v-model="filter" placeholder="Buscar..">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
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
            
  aria-label="Editar"
>
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <BtnEliminar
              v-if="modulo.eliminar"
              label="Eliminar área"
              titulo="Eliminar área"
              :mensaje="mensajeEliminar(props.row)"
              @confirmado="eliminarArea(props.row)"
            />
          </q-td>
        </template>
      </q-table>
    </div>
    <SinPermisoBanner v-else modulo="Administración de áreas" />

    <q-dialog v-model="mostrarDialog" persistent>
      <q-card flat bordered style="min-width: 420px">
        <q-card-section class="text-h6">
          {{ editando ? "Editar área" : "Nueva área" }}
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input
            v-model="form.nombre"
            label="Nombre *"
            autofocus
            :rules="[(v) => !!v || 'Requerido']"
          />
          <q-input v-model="form.siglas" label="Siglas" maxlength="30" />
          <q-select
            v-model="form.areaPadreId"
            :options="opcionesPadre"
            label="Área padre"
            clearable
            emit-value
            map-options
          />
        </q-card-section>
        <q-card-actions align="right">
          <BtnCancelar />
          <q-btn
            color="purple-ieen"
            label="Guardar"
            :loading="guardando"
            @click="guardar"
          />
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
import { useAreaStore } from "../../../stores/areas_store";
import SinPermisoBanner from "../../../components/SinPermisoBanner.vue";
import BtnCancelar from "../../../components/BtnCancelar.vue";
import BtnEliminar from "../../../components/BtnEliminar.vue";

const $q = useQuasar();
const authStore = useAuthStore();
const areaStore = useAreaStore();
const { modulo } = storeToRefs(authStore);
const { areasAdmin } = storeToRefs(areaStore);

const filter = ref("");
const cargando = ref(false);
const guardando = ref(false);
const mostrarDialog = ref(false);
const editando = ref(false);
const form = ref({ id: null, nombre: "", siglas: "", areaPadreId: null });

const columns = [
  { name: "siglas", label: "Siglas", field: "siglas", align: "left", sortable: true },
  { name: "nombre", label: "Nombre", field: "nombre", align: "left", sortable: true },
  { name: "area_Padre", label: "Área padre", field: "area_Padre", align: "left", sortable: true },
  { name: "acciones", label: "Acciones", field: "id", align: "center", sortable: false },
];

// Opciones de área padre: todas menos la que se edita (el backend además veta descendientes -> ciclo).
const opcionesPadre = computed(() =>
  areasAdmin.value
    .filter((a) => a.id !== form.value.id)
    .map((a) => ({ label: a.siglas ? `${a.siglas} - ${a.nombre}` : a.nombre, value: a.id }))
);

onBeforeMount(async () => {
  await authStore.loadModulo("AI-ADMIN-AREAS");
  cargando.value = true;
  await areaStore.loadArbol();
  cargando.value = false;
});

const abrirCrear = () => {
  editando.value = false;
  form.value = { id: null, nombre: "", siglas: "", areaPadreId: null };
  mostrarDialog.value = true;
};

const abrirEditar = (row) => {
  editando.value = true;
  form.value = {
    id: row.id,
    nombre: row.nombre,
    siglas: row.siglas || "",
    areaPadreId: row.areaPadreId || null,
  };
  mostrarDialog.value = true;
};

const guardar = async () => {
  if (!form.value.nombre) {
    $q.notify({ type: "warning", message: "El nombre es obligatorio." });
    return;
  }
  guardando.value = true;
  const resp = editando.value
    ? await areaStore.actualizarArea(form.value.id, form.value)
    : await areaStore.crearArea(form.value);
  guardando.value = false;
  if (resp.success) {
    $q.notify({ type: "positive", message: resp.data });
    mostrarDialog.value = false;
  } else {
    $q.notify({ type: "negative", message: resp.data });
  }
};

const mensajeEliminar = (row) => `¿Eliminar el área "${row.nombre}"?`;

const eliminarArea = async (row) => {
  $q.loading.show();
  const resp = await areaStore.eliminarArea(row.id);
  $q.loading.hide();
  $q.notify({ type: resp.success ? "positive" : "negative", message: resp.data });
};
</script>
