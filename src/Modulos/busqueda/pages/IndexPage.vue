<template>
  <q-page padding>
    <div class="q-pa-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Buscar expedientes" icon="search" />
      </q-breadcrumbs>
    </div>

    <div v-if="modulo && modulo.leer">
      <h1 class="text-h6 text-purple-ieen q-px-md">Buscar expedientes</h1>
      <p class="text-caption text-grey-8 q-px-md">
        Busca por nombre, clave de clasificación o descripción, en todas las fases y sin necesidad de saber
        el área ni el año. Solo aparecen los expedientes de su ámbito.
      </p>

      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <q-form @submit="consultar">
            <q-input
              v-model="texto"
              label="¿Qué expediente busca?"
              hint="Al menos 2 caracteres. Por ejemplo: «convenio», «TJAN/AMP» o parte del nombre."
              autofocus
              clearable
              @clear="limpiar"
            >
              <template v-slot:prepend><q-icon name="search" /></template>
              <template v-slot:append>
                <q-btn
                  type="submit"
                  color="purple-ieen"
                  text-color="white"
                  label="Buscar"
                  icon="search"
                  :loading="cargando"
                />
              </template>
            </q-input>
          </q-form>
        </q-card-section>
      </q-card>

      <q-table
        dense
        flat
        bordered
        :rows="resultados"
        :columns="columnas"
        :loading="cargando"
        v-model:pagination="paginacion"
        :rows-number="total"
        @request="onRequest"
        row-key="id"
        rows-per-page-label="Filas por página"
        :rows-per-page-options="[10, 25, 50, 100, 200]"
      >
        <template v-slot:top>
          <div class="text-subtitle1" v-if="seHaBuscado">
            {{ total }} expediente(s) encontrado(s)
          </div>
          <div class="text-subtitle1 text-grey-7" v-else>Escriba arriba para buscar</div>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-md text-grey-7">
            <span v-if="seHaBuscado">
              Ningún expediente coincide con esa búsqueda.
            </span>
            <span v-else>Todavía no ha buscado nada.</span>
          </div>
        </template>

        <template v-slot:body-cell-clasificado_Texto="props">
          <q-td :props="props">
            <q-badge :color="props.row.clasificado ? 'orange-9' : 'grey-6'">
              {{ props.row.clasificado_Texto }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" class="text-center">
            <q-btn
              flat
              round
              dense
              color="purple-ieen"
              icon="open_in_new"
              @click="abrirEncabezado(props.row)"
              aria-label="Abrir el inventario donde está este expediente"
            >
              <q-tooltip>Abrir el inventario donde está</q-tooltip>
            </q-btn>
            <q-btn
              v-if="puedeVerBitacora"
              flat
              round
              dense
              color="purple-ieen"
              icon="fact_check"
              @click="verBitacora(props.row.id)"
              aria-label="Ver bitácora del expediente"
            >
              <q-tooltip>Ver bitácora del expediente</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>
    <SinPermisoBanner v-else modulo="Buscar expedientes" />
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../../stores/auth_store";
import { useBusquedaStore } from "../../../stores/busqueda_store";
import SinPermisoBanner from "../../../components/SinPermisoBanner.vue";

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const store = useBusquedaStore();
const { modulo } = storeToRefs(authStore);
const { resultados, total, cargando, seHaBuscado } = storeToRefs(store);
const siglas = "AI-BUSQUEDA";

const texto = ref("");
const paginacion = ref({ page: 1, rowsPerPage: 25, rowsNumber: 0 });

const puedeVerBitacora = computed(() => authStore.tienePermiso("archivo.bitacora.ver"));

const columnas = [
  { name: "clave_Clasificacion", label: "Clave", field: "clave_Clasificacion", align: "left", sortable: false },
  { name: "nombre_Expediente", label: "Nombre del expediente", field: "nombre_Expediente", align: "left", sortable: false },
  { name: "area_Generadora", label: "Área generadora", field: "area_Generadora", align: "left", sortable: false },
  { name: "anio", label: "Año", field: "anio", align: "left", sortable: false },
  { name: "seccion", label: "Sección", field: "seccion", align: "left", sortable: false },
  { name: "serie", label: "Serie", field: "serie", align: "left", sortable: false },
  { name: "fase", label: "Fase", field: "fase", align: "left", sortable: false },
  { name: "estatus", label: "Estatus", field: "estatus", align: "left", sortable: false },
  { name: "clasificado_Texto", label: "Clasificación", field: "clasificado_Texto", align: "left", sortable: false },
  { name: "acciones", label: "Acciones", field: "id", align: "center", sortable: false },
];

onBeforeMount(async () => {
  $q.loading.show();
  await authStore.loadModulo(siglas);
  $q.loading.hide();
  store.limpiar();
});

const pedirPagina = async (p) => {
  // rowsPerPage 0 es "todas" en Quasar; se acota al máximo que admite la API.
  const tamanoPagina = p.rowsPerPage > 0 ? p.rowsPerPage : 200;
  const resp = await store.buscar({ texto: texto.value, pagina: p.page, tamanoPagina });
  if (!resp.success) {
    $q.notify({ color: "negative", position: "top-right", message: resp.data, icon: "report_problem" });
    return;
  }
  paginacion.value = { page: p.page, rowsPerPage: tamanoPagina, rowsNumber: total.value };
};

// Una búsqueda nueva empieza por la primera página: conservar la 7 de un conjunto que ahora tiene 2
// dejaría la tabla vacía sin explicación.
const consultar = () => pedirPagina({ ...paginacion.value, page: 1 });

// q-table en modo servidor emite `request` al cambiar de página o de tamaño de página.
const onRequest = (props) => pedirPagina(props.pagination);

const limpiar = () => {
  texto.value = "";
  store.limpiar();
  paginacion.value = { page: 1, rowsPerPage: paginacion.value.rowsPerPage, rowsNumber: 0 };
};

// Llevar al usuario a donde vive el expediente: el inventario de su encabezado.
const abrirEncabezado = (fila) =>
  router.push({ name: "detalleInventario", params: { encabezadoId: fila.encabezado_Id } });

const verBitacora = (id) =>
  router.push({ name: "bitacora", query: { entidadTipo: "Expediente", entidadId: id } });
</script>
