<template>
  <q-page class="q-pa-md">
    <div v-if="modulo && modulo.leer">
      <q-breadcrumbs class="q-mb-sm">
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Empleados" icon="badge" />
      </q-breadcrumbs>
      <div class="row items-center q-mb-md">
        <div class="text-h6 text-purple-ieen">Administración de empleados</div>
        <q-space />
        <q-btn
          v-if="modulo.registrar"
          color="purple-ieen"
          icon="person_add"
          label="Nuevo empleado"
          @click="abrirCrear"
        />
      </div>

      <q-table
        :rows="empleadosAdmin"
        :columns="columns"
        :filter="filter"
        row-key="id"
        :loading="cargando"
        rows-per-page-label="Filas por página"
        no-data-label="No hay empleados registrados. Usa &quot;Nuevo empleado&quot; para crear el primero."
      >
        <template v-slot:top-right>
          <q-input dense debounce="300" v-model="filter" placeholder="Buscar..">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
        <template v-slot:body-cell-concentracion="props">
          <q-td :props="props" class="text-center">
            <q-icon
              :name="props.row.concentracion ? 'check_circle' : 'remove'"
              :color="props.row.concentracion ? 'positive' : 'grey-5'"
            />
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
            <BtnEliminar
              v-if="modulo.eliminar"
              label="Eliminar empleado"
              titulo="Eliminar empleado"
              :mensaje="mensajeEliminar(props.row)"
              @confirmado="eliminarEmpleado(props.row)"
            />
          </q-td>
        </template>
      </q-table>
    </div>
    <SinPermisoBanner v-else modulo="Administración de empleados" />

    <q-dialog v-model="mostrarDialog" persistent>
      <q-card flat bordered style="min-width: 460px">
        <q-card-section class="text-h6">
          {{ editando ? "Editar empleado" : "Nuevo empleado" }}
        </q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-input v-model="form.nombres" label="Nombre(s) *" autofocus :rules="[(v) => !!v || 'Requerido']" />
          <div class="row q-col-gutter-sm">
            <q-input class="col" v-model="form.apellidoPaterno" label="Apellido paterno" />
            <q-input class="col" v-model="form.apellidoMaterno" label="Apellido materno" />
          </div>
          <q-input v-model="form.correo" label="Correo" type="email" />
          <q-select
            v-model="form.areaId"
            :options="areas"
            label="Área *"
            emit-value
            map-options
            :rules="[(v) => !!v || 'Requerida']"
          />
          <div class="row items-center q-col-gutter-sm">
            <q-select
              class="col"
              v-model="form.puestoId"
              :options="puestos"
              label="Puesto"
              clearable
              emit-value
              map-options
            />
            <q-btn flat round color="purple-ieen" icon="add" @click="nuevoPuesto">
              <q-tooltip>Nuevo puesto</q-tooltip>
            </q-btn>
          </div>
          <q-toggle v-model="form.concentracion" label="Personal de Concentración (ámbito global)" color="purple-ieen" />
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
import { ref, onBeforeMount } from "vue";
import { storeToRefs } from "pinia";
import { useQuasar } from "quasar";
import { useAuthStore } from "../../../stores/auth_store";
import { useEmpleadosStore } from "../../../stores/empleados_store";
import { useAreaStore } from "../../../stores/areas_store";
import SinPermisoBanner from "../../../components/SinPermisoBanner.vue";
import BtnCancelar from "../../../components/BtnCancelar.vue";
import BtnEliminar from "../../../components/BtnEliminar.vue";

const $q = useQuasar();
const authStore = useAuthStore();
const empleadosStore = useEmpleadosStore();
const areaStore = useAreaStore();
const { modulo } = storeToRefs(authStore);
const { empleadosAdmin, puestos } = storeToRefs(empleadosStore);
const { areas } = storeToRefs(areaStore);

const filter = ref("");
const cargando = ref(false);
const guardando = ref(false);
const mostrarDialog = ref(false);
const editando = ref(false);
const form = ref(vacio());

function vacio() {
  return {
    id: null, nombres: "", apellidoPaterno: "", apellidoMaterno: "",
    correo: "", areaId: null, puestoId: null, concentracion: false,
  };
}

const columns = [
  { name: "nombreCompleto", label: "Nombre", field: "nombreCompleto", align: "left", sortable: true },
  { name: "correo", label: "Correo", field: "correo", align: "left", sortable: true },
  { name: "area", label: "Área", field: "area", align: "left", sortable: true },
  { name: "puesto", label: "Puesto", field: "puesto", align: "left", sortable: true },
  { name: "concentracion", label: "Concentración", field: "concentracion", align: "center", sortable: true },
  { name: "acciones", label: "Acciones", field: "id", align: "center", sortable: false },
];

onBeforeMount(async () => {
  await authStore.loadModulo("AI-ADMIN-EMPLEADOS");
  cargando.value = true;
  await Promise.all([empleadosStore.loadAdmin(), empleadosStore.loadPuestos(), areaStore.loadListaAreas()]);
  cargando.value = false;
});

const abrirCrear = () => {
  editando.value = false;
  form.value = vacio();
  mostrarDialog.value = true;
};

const abrirEditar = (row) => {
  editando.value = true;
  form.value = {
    id: row.id,
    nombres: row.nombres,
    apellidoPaterno: row.apellidoPaterno || "",
    apellidoMaterno: row.apellidoMaterno || "",
    correo: row.correo || "",
    areaId: row.areaId,
    puestoId: row.puestoId || null,
    concentracion: !!row.concentracion,
  };
  mostrarDialog.value = true;
};

const nuevoPuesto = () => {
  $q.dialog({
    title: "Nuevo puesto",
    message: "Nombre del puesto",
    prompt: { model: "", type: "text" },
    cancel: { label: "Cancelar", color: "grey" },
    ok: { label: "Crear", color: "purple-ieen" },
    persistent: true,
  }).onOk(async (nombre) => {
    if (!nombre || !nombre.trim()) return;
    const resp = await empleadosStore.crearPuesto(nombre.trim());
    if (resp.success) {
      form.value.puestoId = resp.id;
      $q.notify({ type: "positive", message: resp.data });
    } else {
      $q.notify({ type: "negative", message: resp.data });
    }
  });
};

const guardar = async () => {
  if (!form.value.nombres) {
    $q.notify({ type: "warning", message: "El nombre es obligatorio." });
    return;
  }
  if (!form.value.areaId) {
    $q.notify({ type: "warning", message: "El área es obligatoria." });
    return;
  }
  guardando.value = true;
  const resp = editando.value
    ? await empleadosStore.actualizarEmpleado(form.value.id, form.value)
    : await empleadosStore.crearEmpleado(form.value);
  guardando.value = false;
  if (resp.success) {
    $q.notify({ type: "positive", message: resp.data });
    mostrarDialog.value = false;
  } else {
    $q.notify({ type: "negative", message: resp.data });
  }
};

const mensajeEliminar = (row) => `¿Eliminar a "${row.nombreCompleto}"?`;

const eliminarEmpleado = async (row) => {
  $q.loading.show();
  const resp = await empleadosStore.eliminarEmpleado(row.id);
  $q.loading.hide();
  $q.notify({ type: resp.success ? "positive" : "negative", message: resp.data });
};
</script>
