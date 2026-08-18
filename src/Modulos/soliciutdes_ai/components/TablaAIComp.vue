<template>
  <div class="row">
    <div class="col">
      <q-table
        :visible-columns="visible_Columns"
        :rows="solicitudes"
        :columns="columns"
        :filter="filter"
        :loading="isLoading"
        row-key="id"
        rows-per-page-label="Filas por pagina"
        :no-data-label="tipo == 0 ? 'No hay solicitudes pendientes de revisión.' : (tipo == 1 ? 'No hay solicitudes aprobadas.' : 'No hay solicitudes rechazadas.')"
        class="my-sticky-last-column-table"
      >
        <template v-slot:top-right>
          <q-input
            borderless
            dense
            debounce="300"
            v-model="filter"
            placeholder="Buscar.."
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              <div v-if="col.name === 'id'">
                <!-- Corte: el préstamo es inmutable en el backend nuevo (sin update) y su edición usa
                     el picker de concentración/histórico diferido; se deshabilita editar. La revisión
                     (aprobar/rechazar) sigue disponible. -->
                <q-btn
                  v-if="false"
                  flat
                  round
                  color="purple-ieen"
                  icon="edit"
                  @click="editar(col.value)"
                >
                  <q-tooltip>Editar registro</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="modulo == null ? false : modulo.actualizar && tipo == 0"
                  flat
                  round
                  color="purple-ieen"
                  icon="check_circle"
                  @click="aceptarcion(col.value, props.row.folio_Solicitud)"
                >
                  <q-tooltip>Aceptar solicitud</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="modulo == null ? false : modulo.actualizar && tipo == 0"
                  flat
                  round
                  color="purple-ieen"
                  icon="cancel"
                  @click="cancelacion(col.value, props.row.folio_Solicitud)"
                >
                  <q-tooltip>Rechazar solicitud</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="modulo == null ? false : modulo.actualizar && tipo == 1"
                  flat
                  round
                  color="purple-ieen"
                  icon="folder_open"
                  @click="verAceptado(col.value, props.row.folio_Solicitud)"
                >
                  <q-tooltip>Ver documento</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="modulo == null ? false : modulo.actualizar && tipo == 2"
                  flat
                  round
                  color="purple-ieen"
                  icon="visibility"
                  @click="verRechazado(col.value, props.row.folio_Solicitud)"
                >
                  <q-tooltip>Aceptar solicitud</q-tooltip>
                </q-btn>
              </div>
              <label v-else>{{ col.value }}</label>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useQuasar } from "quasar";
import { onMounted, ref } from "vue";
import { useAuthStore } from "../../../stores/auth_store";
import { useRouter } from "vue-router";
import { useSolicitudPrestamoAiStore } from "../../../stores/solicitud_prestamo_ai_store";
import { useDetalleSolicitudAISotre } from "../../../stores/detalle_solicitud_prestamo_ai_store";
import { useVistosBuenosStore } from "../../../stores/visto_bueno_store";

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const solicitudPrestamoStore = useSolicitudPrestamoAiStore();
const detalleStore = useDetalleSolicitudAISotre();
const vistoBuenoStore = useVistosBuenosStore();
const { isLoading, solicitudes } = storeToRefs(solicitudPrestamoStore);
const { modulo } = storeToRefs(authStore);

const props = defineProps({
  tipo: {
    type: Number,
    required: true,
    default: 0,
  },
});

const columns = [
  {
    name: "estatus",
    align: "center",
    label: "Estatus",
    field: "estatus",
    sortable: true,
  },
  {
    name: "folio_Solicitud",
    align: "center",
    label: "Folio solicitud",
    field: "folio_Solicitud",
    sortable: true,
  },

  {
    name: "area_Responsable",
    align: "center",
    label: "Area responsable",
    field: "area_Responsable",
    sortable: true,
  },
  {
    name: "area_Solicitante",
    align: "center",
    label: "Area solicitante",
    field: "area_Solicitante",
    sortable: true,
  },
  {
    name: "responsable_Area_Solicitante",
    align: "center",
    label: "Responsable de area solicitante",
    field: "responsable_Area_Solicitante",
    sortable: true,
  },
  {
    name: "solicitante",
    align: "center",
    label: "Solicitante",
    field: "solicitante",
    sortable: true,
  },
  {
    name: "id",
    align: "center",
    label: "Acciones",
    field: "id",
    sortable: false,
  },
];

onMounted(() => {
  switch (props.tipo) {
    case 0:
      solicitudPrestamoStore.loadPendientes();
      break;
    case 1:
      solicitudPrestamoStore.loadAprobadas();
      break;
    case 2:
      solicitudPrestamoStore.loadRechazadas();
      break;
  }
});

const pagination = ref({
  //********** */
  page: 1,
  rowsPerPage: 10,
  sortBy: "name",
  descending: false,
});

const filter = ref("");

const editar = async (id) => {
  $q.loading.show();
  solicitudPrestamoStore.updateEditar(true);
  await solicitudPrestamoStore.loadSolicitud(id);
  $q.loading.hide();
  //solicitudPrestamoStore.updateEditar(true);
  solicitudPrestamoStore.actualizarModal(true);
};

const verAceptado = (id) => {
  router.push({
    name: "prestamoInstitucional",
    params: { encabezadoId: id, estatus: "Aprobado" },
  });
};

const verRechazado = (id) => {
  router.push({
    name: "prestamoInstitucional",
    params: { encabezadoId: id, estatus: "Rechazado" },
  });
};

const aceptarcion = async (id, folio) => {
  // Corte al backend nuevo: autorizar exige un autorizador que sea visto bueno vigente. Se ofrece un
  // selector (radio) con los vistos buenos activos; el valor es el EmpleadoId del visto bueno.
  $q.loading.show();
  await vistoBuenoStore.loadVoBos();
  $q.loading.hide();
  const opciones = vistoBuenoStore.vistos_buenos
    .filter((v) => v.activo)
    .map((v) => ({ label: v.empleado, value: v.empleado_Id }));
  if (opciones.length === 0) {
    $q.notify({ type: "warning", message: "No hay vistos buenos vigentes para autorizar." });
    return;
  }
  $q.dialog({
    title: "Aceptar solicitud",
    message:
      "Solicitud con folio " + folio + ". Seleccione el visto bueno que autoriza:",
    options: {
      type: "radio",
      model: opciones[0].value,
      items: opciones,
    },
    persistent: true,
    ok: { color: "positive", label: "¡Sí!, aceptar" },
    cancel: { color: "negative", label: " No, regresar" },
  }).onOk(async (autorizaId) => {
    $q.loading.show();
    let resp = await solicitudPrestamoStore.aprobar(id, autorizaId);
    if (resp.success) {
      $q.loading.hide();
      $q.notify({ type: "positive", message: resp.mensaje });
      await solicitudPrestamoStore.loadPendientes();
    } else {
      $q.loading.hide();
      $q.notify({ type: "negative", message: resp.data });
    }
  });
};

const cancelacion = async (id, folio) => {
  $q.dialog({
    title: "Cancelar solicitud",
    message: "¿Está seguro de rechazar la solicitud con folio " + folio + " ?",
    icon: "Warning",
    persistent: true,
    transitionShow: "scale",
    transitionHide: "scale",
    ok: {
      color: "positive",
      label: "¡Sí!, rechazar",
    },
    cancel: {
      color: "negative",
      label: " No, regresar",
    },
  }).onOk(async () => {
    $q.dialog({
      title: "Motivo de rechazo",
      message: "Por favor, indique el motivo del rechazo:",
      prompt: {
        model: "", // Valor inicial del input
        type: "textarea", // Campo de texto para el motivo
        isValid: (val) => val.length > 0 || "El motivo no puede estar vacío",
      },
      cancel: true,
      persistent: true,
    })
      .onOk(async (motivo) => {
        $q.loading.show();
        let resp = await solicitudPrestamoStore.cancelar(id, motivo);
        if (resp.success) {
          $q.loading.hide();
          $q.notify({
            type: "positive",
            message: resp.mensaje,
          });
          await solicitudPrestamoStore.loadPendientes();
        } else {
          $q.loading.hide();
          $q.notify({
            type: "negative",
            message: resp.data,
          });
        }
      })
      .onCancel(() => {
        $q.notify({
          type: "warning",
          message: "La cancelación no se llevo a cabo.",
        });
      });
  });
};
</script>
