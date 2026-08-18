<template>
  <q-page class="q-pa-md">
    <div v-if="modulo && modulo.leer">
      <q-breadcrumbs class="q-mb-sm">
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Usuarios" icon="manage_accounts" />
      </q-breadcrumbs>
      <div class="row items-center q-mb-md">
        <h1 class="text-h6 text-purple-ieen">Administración de usuarios</h1>
        <q-space />
        <q-btn
          v-if="modulo.registrar"
          color="purple-ieen"
          icon="person_add"
          label="Nuevo usuario"
          @click="abrirCrear"
        />
      </div>

      <q-table
        :rows="usuarios"
        :columns="columns"
        :filter="filter"
        row-key="id"
        :loading="cargando"
        rows-per-page-label="Filas por página"
        no-data-label="No hay usuarios registrados. Usa &quot;Nuevo usuario&quot; para crear el primero."
      >
        <template v-slot:top-right>
          <q-input dense debounce="300" v-model="filter" placeholder="Buscar..">
            <template v-slot:append><q-icon name="search" /></template>
          </q-input>
        </template>
        <template v-slot:body-cell-activo="props">
          <q-td :props="props" class="text-center">
            <q-chip
              dense
              :color="props.row.activo ? 'positive' : 'grey-5'"
              text-color="white"
              :label="props.row.activo ? 'Activo' : 'Inactivo'"
            />
          </q-td>
        </template>
        <template v-slot:body-cell-debeCambiarPassword="props">
          <q-td :props="props" class="text-center">
            <q-icon
              v-if="props.row.debeCambiarPassword"
              name="key"
              color="orange"
            >
              <q-tooltip>Debe cambiar su contraseña temporal</q-tooltip>
            </q-icon>
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
            
  aria-label="Editar"
>
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              v-if="modulo.actualizar"
              flat
              round
              color="orange"
              icon="lock_reset"
              @click="confirmarReset(props.row)"
            
  aria-label="Resetear contraseña"
>
              <q-tooltip>Resetear contraseña</q-tooltip>
            </q-btn>
            <q-btn
              v-if="modulo.actualizar"
              flat
              round
              :color="props.row.activo ? 'negative' : 'positive'"
              :icon="props.row.activo ? 'block' : 'check_circle'"
              @click="alternarEstado(props.row)"
            
  :aria-label="props.row.activo ? &quot;Desactivar&quot; : &quot;Activar&quot;"
>
              <q-tooltip>{{ props.row.activo ? "Desactivar" : "Activar" }}</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>
    <SinPermisoBanner v-else modulo="Administración de usuarios" />

    <!-- Alta / edición -->
    <q-dialog v-model="mostrarDialog" persistent>
      <q-card flat bordered style="min-width: 440px">
        <q-card-section class="text-h6">
          {{ editando ? "Editar usuario" : "Nuevo usuario" }}
        </q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-input
            v-model="form.userName"
            label="Usuario *"
            :readonly="editando"
            :hint="editando ? 'El nombre de usuario no se puede cambiar' : ''"
            :rules="[(v) => !!v || 'Requerido']"
          />
          <q-input v-model="form.correo" label="Correo" type="email" />
          <q-select
            v-model="form.empleadoId"
            :options="empleados"
            label="Empleado"
            clearable
            emit-value
            map-options
            use-input
            input-debounce="200"
            @filter="filtrarEmpleados"
          />
          <q-select
            v-model="form.perfilId"
            :options="perfiles"
            label="Perfil"
            clearable
            emit-value
            map-options
          />
        </q-card-section>
        <q-card-actions align="right">
          <BtnCancelar />
          <q-btn color="purple-ieen" label="Guardar" :loading="guardando" @click="guardar" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Contraseña temporal (se muestra UNA vez) -->
    <q-dialog v-model="mostrarTemp" persistent>
      <q-card flat bordered style="min-width: 380px">
        <q-card-section class="text-h6">Contraseña temporal</q-card-section>
        <q-card-section>
          <div class="text-caption text-grey-7 q-mb-sm">
            Entréguela al usuario. Se muestra una sola vez; deberá cambiarla al iniciar sesión.
          </div>
          <q-input v-model="passwordTemporal" readonly filled>
            <template v-slot:append>
              <q-btn flat round icon="content_copy" @click="copiarTemp"
  aria-label="Copiar"
>
                <q-tooltip>Copiar</q-tooltip>
              </q-btn>
            </template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn color="purple-ieen" label="Listo" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onBeforeMount } from "vue";
import { storeToRefs } from "pinia";
import { useQuasar } from "quasar";
import { useAuthStore } from "../../../stores/auth_store";
import { useUsuariosStore } from "../../../stores/usuarios_store";
import SinPermisoBanner from "../../../components/SinPermisoBanner.vue";
import BtnCancelar from "../../../components/BtnCancelar.vue";

const $q = useQuasar();
const authStore = useAuthStore();
const usuariosStore = useUsuariosStore();
const { modulo } = storeToRefs(authStore);
const { usuarios, perfiles, empleados } = storeToRefs(usuariosStore);

const filter = ref("");
const cargando = ref(false);
const guardando = ref(false);
const mostrarDialog = ref(false);
const editando = ref(false);
const form = ref(vacio());
const mostrarTemp = ref(false);
const passwordTemporal = ref("");
let empleadosBase = [];

function vacio() {
  return { id: null, userName: "", correo: "", empleadoId: null, perfilId: null };
}

const columns = [
  { name: "userName", label: "Usuario", field: "userName", align: "left", sortable: true },
  { name: "correo", label: "Correo", field: "correo", align: "left", sortable: true },
  { name: "perfil", label: "Perfil", field: "perfil", align: "left", sortable: true },
  { name: "empleado", label: "Empleado", field: "empleado", align: "left", sortable: true },
  { name: "activo", label: "Estado", field: "activo", align: "center", sortable: true },
  { name: "debeCambiarPassword", label: "Temp.", field: "debeCambiarPassword", align: "center", sortable: true },
  { name: "acciones", label: "Acciones", field: "id", align: "center", sortable: false },
];

onBeforeMount(async () => {
  await authStore.loadModulo("AI-ADMIN-USUARIOS");
  cargando.value = true;
  await Promise.all([usuariosStore.loadAdmin(), usuariosStore.loadPerfiles(), usuariosStore.loadEmpleados()]);
  empleadosBase = empleados.value;
  cargando.value = false;
});

// Filtrado local del selector de empleados (pueden ser cientos).
const filtrarEmpleados = (val, update) => {
  update(() => {
    const needle = (val || "").toLowerCase();
    empleados.value = needle
      ? empleadosBase.filter((e) => e.label.toLowerCase().includes(needle))
      : empleadosBase;
  });
};

const abrirCrear = () => {
  editando.value = false;
  form.value = vacio();
  mostrarDialog.value = true;
};

const abrirEditar = (row) => {
  editando.value = true;
  form.value = {
    id: row.id,
    userName: row.userName,
    correo: row.correo || "",
    empleadoId: row.empleadoId || null,
    perfilId: row.perfilId || null,
  };
  mostrarDialog.value = true;
};

const guardar = async () => {
  if (!form.value.userName) {
    $q.notify({ type: "warning", message: "El usuario es obligatorio." });
    return;
  }
  guardando.value = true;
  const resp = editando.value
    ? await usuariosStore.actualizar(form.value.id, form.value)
    : await usuariosStore.crear(form.value);
  guardando.value = false;
  if (resp.success) {
    $q.notify({ type: "positive", message: resp.data });
    mostrarDialog.value = false;
    if (!editando.value && resp.passwordTemporal) {
      passwordTemporal.value = resp.passwordTemporal;
      mostrarTemp.value = true;
    }
  } else {
    $q.notify({ type: "negative", message: resp.data });
  }
};

const alternarEstado = (row) => {
  const activar = !row.activo;
  $q.dialog({
    title: activar ? "Activar usuario" : "Desactivar usuario",
    message: activar
      ? `¿Activar a "${row.userName}"? Podrá volver a iniciar sesión.`
      : `¿Desactivar a "${row.userName}"? No podrá iniciar sesión hasta que se reactive.`,
    cancel: { label: "Cancelar", color: "grey" },
    ok: { label: activar ? "Activar" : "Desactivar", color: activar ? "positive" : "negative" },
    persistent: true,
  }).onOk(async () => {
    $q.loading.show();
    const resp = await usuariosStore.cambiarEstado(row.id, activar);
    $q.loading.hide();
    $q.notify({ type: resp.success ? "positive" : "negative", message: resp.data });
  });
};

const confirmarReset = (row) => {
  $q.dialog({
    title: "Resetear contraseña",
    message: `¿Generar una contraseña temporal para "${row.userName}"?`,
    cancel: { label: "Cancelar", color: "grey" },
    ok: { label: "Resetear", color: "orange" },
    persistent: true,
  }).onOk(async () => {
    $q.loading.show();
    const resp = await usuariosStore.resetPassword(row.id);
    $q.loading.hide();
    if (resp.success) {
      passwordTemporal.value = resp.passwordTemporal;
      mostrarTemp.value = true;
    } else {
      $q.notify({ type: "negative", message: resp.data });
    }
  });
};

const copiarTemp = () => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(passwordTemporal.value);
    $q.notify({ type: "positive", message: "Copiada al portapapeles" });
  }
};
</script>
