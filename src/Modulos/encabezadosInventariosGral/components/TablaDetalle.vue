<template>
  <div>
    <q-form class="row q-col-gutter-xs" @submit="BuscarInventario">
      <div class="col-12 col-xs-6 col-md-6">
        <q-select
          v-model="areaId"
          :options="areas"
          label="Área"
          hint="Seleccione área"
          lazy-rules
          :rules="[(val) => !!val || 'El área es requerida']"
        />
      </div>
      <div class="col-12 col-xs-6 col-md-2">
        <q-input v-model="year" type="Number" label="Año" hint="ingrese año" />
      </div>
      <div class="col-12 col-xs-6 col-md-2">
        <q-btn
          :loading="loading"
          type="submit"
          color="secondary"
          label="Buscar"
          icon="search"
        >
        </q-btn>
      </div>
    </q-form>
  </div>
  <div class="row">
    <div class="col">
      <q-table
        dense
        :rows="inventariosArea"
        :columns="columns"
        :filter="filter"
        :loading="loading"
        row-key="id"
        rows-per-page-label="Filas por pagina"
        no-data-label="No hay expedientes registrados para el área y año seleccionados."
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
                <q-btn
                  flat
                  round
                  color="purple-ieen"
                  icon="visibility"
                  @click="ver(col.value)"
                
  aria-label="ver registro"
>
                  <q-tooltip>ver registro</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="purple-ieen"
                  icon="file_present"
                  @click="verAdjuntos(col.value)"
                
  aria-label="Ver adjuntos"
>
                  <q-tooltip>Ver adjuntos</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="props.row['estatus'] == 'Pendiente'"
                  flat
                  round
                  color="positive"
                  icon="check_circle"
                  @click="aprobar(col.value)"
                
  aria-label="Aprobar"
>
                  <q-tooltip>Aprobar</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="props.row['estatus'] == 'Pendiente'"
                  flat
                  round
                  color="negative"
                  icon="cancel"
                  @click="rechazar(col.value)"
                
  aria-label="Rechazar"
>
                  <q-tooltip>Rechazar</q-tooltip>
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
import { onBeforeMount, ref } from "vue";
import { useInventarioAreaStore } from "../../../stores/inventario_area_store";
import { useAdjuntoInventarioStore } from "../../../stores/adjunto_inventario_store";
import { useAreaStore } from "../../../stores/areas_store";
import { useAuthStore } from "../../../stores/auth_store";

const props = defineProps({
  encabezadoId: {
    type: Number,
    required: true,
  },
});

const $q = useQuasar();
const inventarioStore = useInventarioAreaStore();
const adjuntoStore = useAdjuntoInventarioStore();
const authStore = useAuthStore();
const areaStore = useAreaStore();
const { modulo } = storeToRefs(authStore);
const { inventariosArea, loading } = storeToRefs(inventarioStore);
const { areas } = storeToRefs(areaStore);
const year = ref(new Date().getFullYear());
const areaId = ref(null);

onBeforeMount(async () => {
  await areaStore.loadListaAreas();
  console.log(year.value);
  console.log(areas.value[0].value);
  const areaFiltrada = areas.value.find((x) => x.value == areas.value[0].value);
  areaId.value = areaFiltrada;
  inventarioStore.loadInventariosByAreaYear(areaId.value.value, year.value);
});

const BuscarInventario = () => {
  inventarioStore.loadInventariosByAreaYear(areaId.value.value, year.value);
};

const ver = async (id) => {
  $q.loading.show();
  await inventarioStore.loadInventario(id);
  $q.loading.hide();
  inventarioStore.actualizarModalVer(true);
};

const verAdjuntos = async (id) => {
  $q.loading.show();
  await adjuntoStore.loadAdjuntos(id);
  $q.loading.hide();
  adjuntoStore.actualizarModalVer(true);
};

const rechazar = async (id) => {
  $q.dialog({
    title: "Rechazar registro",
    message: "¿Esta seguro de rechazar el registro?, Describe el motivo",
    icon: "warning",
    persistent: true,
    transitionShow: "scale",
    transitionHide: "scale",
    ok: {
      color: "positive",
      label: "Sí! rechazar",
    },
    cancel: {
      color: "negative",
      label: "Cancelar",
    },
    prompt: {
      model: "",
      type: "text", // optional
    },
  }).onOk(async (motivo) => {
    $q.loading.show();
    const resp = await inventarioStore.rechazarInventario(
      id,
      props.encabezadoId,
      motivo
    );
    if (resp.success) {
      $q.loading.hide();
      $q.notify({
        type: "positive",
        message: resp.data,
      });
    } else {
      $q.loading.hide();
      $q.notify({
        type: "negative",
        message: resp.data,
      });
    }
  });
};

const aprobar = async (id) => {
  $q.dialog({
    title: "Aprobar registro",
    message: "¿Esta seguro de aprobar el registro?",
    icon: "warning",
    persistent: true,
    transitionShow: "scale",
    transitionHide: "scale",
    ok: {
      color: "positive",
      label: "Sí! aprobar",
    },
    cancel: {
      color: "negative",
      label: "Cancelar",
    },
  }).onOk(async () => {
    $q.loading.show();
    const resp = await inventarioStore.aprobarInventario(
      id,
      props.encabezadoId
    );
    if (resp.success) {
      $q.loading.hide();
      $q.notify({
        type: "positive",
        message: resp.data,
      });
    } else {
      $q.loading.hide();
      $q.notify({
        type: "negative",
        message: resp.data,
      });
    }
  });
};

const columns = [
  {
    name: "estatus",
    align: "center",
    label: "Estatus",
    field: "estatus",
    sortable: true,
  },
  {
    name: "seccion",
    align: "center",
    label: "Sección",
    field: "seccion",
    sortable: true,
  },
  {
    name: "serie",
    align: "center",
    label: "Serie",
    field: "serie",
    sortable: true,
  },
  {
    name: "sub_Serie",
    align: "center",
    label: "SubSerie",
    field: "sub_Serie",
    sortable: true,
  },
  {
    name: "nombre_Expediente",
    align: "center",
    label: "Nombre expediente",
    field: "nombre_Expediente",
    sortable: true,
  },
  {
    name: "clave_Clasificacion",
    align: "center",
    label: "Clave de clasificacion",
    field: "clave_Clasificacion",
    sortable: true,
  },
  {
    name: "descripcion",
    align: "center",
    label: "Descripción/Observaciones",
    field: "descripcion",
    sortable: true,
  },
  {
    name: "fecha_Inicio",
    align: "center",
    label: "Fecha inicio",
    field: "fecha_Inicio",
    sortable: true,
  },
  {
    name: "fecha_Termino",
    align: "center",
    label: "Fecha termino",
    field: "fecha_Termino",
    sortable: true,
  },
  {
    name: "ubicacion",
    align: "center",
    label: "Ubicación fisica",
    field: "ubicacion",
    sortable: true,
  },
  {
    name: "valor_Documental",
    align: "center",
    label: "Valor documental",
    field: "valor_Documental",
    sortable: true,
  },
  {
    name: "vigencia_Tramite",
    align: "center",
    label: "Vigencia tramite",
    field: "vigencia_Tramite",
    sortable: true,
  },
  {
    name: "vigencia_Concentracion",
    align: "center",
    label: "Vigencia concentración",
    field: "vigencia_Concentracion",
    sortable: true,
  },
  {
    name: "vigencia_Completa",
    align: "center",
    label: "Vigencia completa",
    field: "vigencia_Completa",
    sortable: true,
  },
  {
    name: "disposicion_Documental",
    align: "center",
    label: "Destino final",
    field: "disposicion_Documental",
    sortable: true,
  },
  {
    name: "fecha_Clasificacion",
    align: "center",
    label: "Fecha clasificación",
    field: "fecha_Clasificacion",
    sortable: true,
  },
  {
    name: "fecha_Desclasificacion",
    align: "center",
    label: "Fecha desclasificación",
    field: "fecha_Desclasificacion",
    sortable: true,
  },
  {
    name: "fecha_Ampliacion",
    align: "center",
    label: "Fecha ampliación",
    field: "fecha_Ampliacion",
    sortable: true,
  },
  {
    name: "motivo_Rechazo",
    align: "center",
    label: "Motivo de rechazo",
    field: "motivo_Rechazo",
    sortable: true,
  },
  {
    name: "clasificado_Texto",
    align: "center",
    label: "Clasificado",
    field: "clasificado_Texto",
    sortable: true,
  },
  {
    name: "total_Paginas",
    align: "center",
    label: "Total paginas",
    field: "total_Paginas",
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
</script>

