<template>
  <div class="row q-pa-lg">
    <div class="col">
      <q-table
        grid
        flat
        bordered
        :rows="list_Notificaciones_Filtro"
        :columns="columns"
        row-key="name"
        :filter="filter"
        hide-header
        :rows-per-page-options="[5, 15, 20, 25, 50]"
        v-model:pagination="pagination"
        rows-per-page-label="Filas por pagina"
        no-data-label="No hay registros"
      >
        <template v-slot:top-left>
          <div class="row">
            <q-select
              style="width: 250px"
              outlined
              dense
              color="purple-ieen"
              v-model="sistema_Id"
              :options="sistemas"
              label="Filtrar por sistemas"
            />
            <q-btn
              color="purple-ieen"
              icon-right="done_all"
              @click="marcarTodoComoLeido"
              label="Marcar todo como leido"
            />
          </div>
        </template>
        <template v-slot:top-right>
          <q-input
            outlined
            borderless
            dense
            debounce="300"
            v-model="filter"
            placeholder="Search"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
        <template v-slot:item="props">
          <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3">
            <q-card flat bordered>
              <q-card-section class="text-center">
                <div class="text-right">
                  <q-btn
                    v-if="props.row.leido"
                    @click="marcarNoLeido(props.row)"
                    flat
                    icon="mark_email_unread"
                    color="purple-ieen"
                  >
                    <q-tooltip>Marcar como no leido</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="!props.row.leido"
                    icon="check_circle"
                    color="purple-ieen"
                    flat
                    @click="toSolicitudes(props.row)"
                  >
                    <q-tooltip>Marcar como leido</q-tooltip>
                  </q-btn>
                  <q-btn
                    @click="verSolicitud(props.row)"
                    v-else
                    icon="search"
                    color="purple-ieen"
                    flat
                  >
                    <q-tooltip>Ver solicitud</q-tooltip>
                  </q-btn>
                </div>
                <q-badge
                  :color="props.row.leido == true ? 'green' : 'orange'"
                  :label="props.row.leido == true ? 'Leido' : 'Sin leer'"
                >
                  <q-icon
                    :name="props.row.leido == true ? 'done' : 'warning'"
                  /> </q-badge
                ><br />
                {{ props.row.fecha_Registro }} <br />
                <strong>Sistema: {{ props.row.sistema }}</strong>
                <br />
                <strong>{{ props.row.titulo }}</strong>
              </q-card-section>
              <q-card-section class="text-caption">
                <div>{{ props.row.mensaje }} g</div>
              </q-card-section>
            </q-card>
          </div>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script setup>
import { useQuasar, QSpinnerFacebook } from "quasar";
import { onBeforeMount, ref, watchEffect } from "vue";
import { storeToRefs } from "pinia";
import { useNotificacionStore } from "../../../stores/notificaciones_store";
import { useAuthStore } from "src/stores/auth_store";
//import { EncryptStorage } from "storage-encryption";
import Swal from "sweetalert2";

//-----------------------------------------------------------

const $q = useQuasar();
const notificacionStore = useNotificacionStore();
const authStore = useAuthStore();
//const encryptStorage = new EncryptStorage("SECRET_KEY", "sessionStorage");
const { sistemas } = storeToRefs(authStore);
const { notificaciones_all, isLoading } = storeToRefs(notificacionStore);
const sistema_Id = ref({ value: 0, label: "Todos" });
const list_Notificaciones_Filtro = ref([]);

//-----------------------------------------------------------

onBeforeMount(() => {
  cargarData();
});

//-----------------------------------------------------------

const loading = () => {
  $q.loading.show({
    spinner: QSpinnerFacebook,
    spinnerColor: "purple-ieen",
    spinnerSize: 140,
    backgroundColor: "purple-3",
    message: "Espere un momento, por favor...",
    messageColor: "black",
  });
};

const cargarData = async () => {
  loading();
  await notificacionStore.loadNotificaciones();
  await notificacionStore.loadNotificacionesAll();
  $q.loading.hide();
};

const alertNotify = (position, type, resp) => {
  $q.notify({
    position: position,
    type: type,
    message: resp,
    actions: [
      {
        icon: "close",
        color: "black",
        round: true,
        handler: () => {},
      },
    ],
  });
};

const marcarTodoComoLeido = () => {
  Swal.fire({
    icon: "question",
    title: "Marcar todo como leido",
    text: "¿Está seguro de marcar todo como leido?",
    reverseButtons: true,
    showCloseButton: true,
    showCancelButton: true,
    allowOutsideClick: false,
    cancelButtonColor: "#f44336",
    confirmButtonColor: "#26A69A",
    cancelButtonText: `No, regresar!`,
    confirmButtonText: `Si, aceptar!`,
  }).then(async (result) => {
    if (result.isConfirmed) {
      loading();
      let resp = null;
      resp = await notificacionStore.leerTodas();
      if (resp.success) {
        await notificacionStore.loadNotificacionesAll();
        await notificacionStore.loadNotificaciones();
        alertNotify("top-right", "positive", resp.data);
      } else {
        alertNotify("top-right", "negative", resp.data);
      }
      $q.loading.hide();
    }
  });
};

const marcarNoLeido = async (row) => {
  loading();
  let resp = null;
  resp = await notificacionStore.noLeer(row.id);
  if (resp.success) {
    await notificacionStore.loadNotificaciones();
    await notificacionStore.loadNotificacionesAll();
    alertNotify("top-right", "positive", resp.data);
  } else {
    alertNotify("top-right", "negative", resp.data);
  }
  $q.loading.hide();
};

const toSolicitudes = async (row) => {
  loading();
  let resp = await notificacionStore.leerNotificacion(row.id);
  if (resp.success == true) {
    cargarData();
  }
  $q.loading.hide();
};

const verSolicitud = (row) => {
  let url = sistemas.value.find((x) => x.value == row.sistema_Id);

  window.location =
    url.url +
    `/#/?key=${localStorage.getItem("key")}&sistema=${
      row.sistema_Id
    }&usr=${localStorage.getItem("usuario")}`;
};

const filtrar = (notificaciones, filtro) => {
  list_Notificaciones_Filtro.value = notificaciones.filter((item) => {
    let cumple = true;
    if (filtro.sistema !== undefined) {
      if (filtro.sistema == 0) {
        cumple = cumple && item.sistema_Id === item.sistema_Id;
      } else {
        cumple = cumple && item.sistema_Id === filtro.sistema;
      }
    }
    return cumple;
  });
};

watchEffect(() => {
  const filtro = {};
  if (sistema_Id.value != null) filtro.sistema = sistema_Id.value.value;
  filtrar(notificaciones_all.value, filtro);
});

//-----------------------------------------------------------

const columns = [
  {
    name: "sistema",
    align: "center",
    label: "Sistema",
    field: "sistema",
    sortable: true,
  },
  {
    name: "titulo",
    align: "center",
    label: "Titulo",
    field: "titulo",
    sortable: true,
  },
  {
    name: "leido",
    align: "center",
    label: "Leído",
    field: "leido",
    sortable: true,
  },
  {
    name: "mensaje",
    align: "center",
    label: "Mensaje",
    field: "mensaje",
    sortable: true,
  },
  {
    name: "fecha_Registro",
    align: "center",
    label: "Fecha registro",
    field: "fecha_Registro",
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

const pagination = ref({
  page: 1,
  rowsPerPage: 8,
  sortBy: "name",
  descending: false,
});

const filter = ref("");
</script>
<style lang="sass">
.my-sticky-last-column-table
  thead tr:last-child th:last-child
    /* bg color is important for th; just specify one */
    background-color: white

  td:last-child
    background-color: white

  th:last-child,
  td:last-child
    position: sticky
    right: 0
    z-index: 1
</style>
