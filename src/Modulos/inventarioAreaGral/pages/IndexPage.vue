<template>
  <q-page padding>
    <div class="row">
      <div class="col">
        <div class="q-pa-md q-gutter-sm">
          <q-breadcrumbs>
            <q-breadcrumbs-el icon="home" to="/" />
            <q-breadcrumbs-el
              label="Inventario general por expediente"
              icon="assignment"
            />
            <q-breadcrumbs-el
              label="Detalle inventario general por expediente"
              icon="assignment"
            />
          </q-breadcrumbs>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <div class="text-right q-pa-md items-start q-gutter-md">
          <q-btn
            type="button"
            class="q-ma-sm"
            color="purple-ieen"
            icon-right="document_scanner"
            label="Anexo 4"
            @click="generar_anexo_4"
          />
          <q-btn
            type="button"
            class="q-ma-sm"
            color="purple-ieen"
            icon-right="document_scanner"
            label="Anexo 5"
            @click="generar_anexo_5"
          />
          <q-btn
            v-if="modulo == null ? false : modulo.registrar"
            type="button"
            class="q-ma-sm"
            color="purple-ieen"
            icon-right="add_circle_outline"
            label="Nuevo"
            @click="actualizarModal(true)"
          />
        </div>
      </div>
    </div>
    <TablaItem :encabezadoId="encabezadoId" v-if="modulo.leer" />
    <ModalComp />
    <ModalAdjuntoComp />
    <ModalViewer />
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";
import { useInventarioAreaStore } from "../../../stores/inventario_area_store";
import { useAuthStore } from "../../../stores/auth_store";
import TablaItem from "../components/TablaItem.vue";
import ModalComp from "../components/ModalComp.vue";
import ModalAdjuntoComp from "../components/ModalAdjuntosComp.vue";
import ModalViewer from "../components/ModalVisorComp.vue";
import { useEncabezadoInventarioStore } from "../../../stores/encabezado_inventario_area";
import {
  espera,
  genera_anexo_4,
  genera_anexo_5,
} from "../../../helpers/helper";

const $q = useQuasar();
const inventarioStore = useInventarioAreaStore();
const authStore = useAuthStore();
const { modulo } = storeToRefs(authStore);
const { inventarios } = storeToRefs(inventarioStore);
const encabezadoInventariosStore = useEncabezadoInventarioStore();
const { encabezado } = storeToRefs(encabezadoInventariosStore);
const props = defineProps({
  encabezadoId: {
    type: Number,
    required: true,
  },
});

onMounted(() => {
  encabezadoInventariosStore.loadEncabezado(props.encabezadoId);
});

const generar_anexo_4 = () => {
  const rows = [];
  inventarios.value.forEach((element) => {
    const arr_clave = element.clave_Clasificacion.split("/");
    rows.push([
      element.seccion,
      element.sub_Serie == "" ? element.serie : element.sub_Serie,
      element.nombre_Expediente,
      element.clave_Clasificacion,
      arr_clave[3],
      element.descripcion,
      element.fecha_Inicio,
      element.fecha_Termino,
      element.ubicacion,
      element.valor_Documental,
      element.vigencia_Tramite,
      element.vigencia_Concentracion,
      element.vigencia_Completa,
      element.disposicion_Documental == "Eliminación" ? "X" : "",
      element.disposicion_Documental == "Archivo histórico" ? "X" : "",
      element.disposicion_Documental == "Muestreo" ? "X" : "",
      element.fecha_Clasificacion,
      element.fecha_Desclasificacion,
      element.fecha_Ampliacion,
    ]);
  });
  genera_anexo_4(encabezado.value, rows);
};

const generar_anexo_5 = () => {
  let filtro = inventarios.value.filter((x) => x.Seleccion == true);
  if (filtro.length > 0) {
    genera_anexo_5(
      filtro,
      encabezado.value.area_Responsable,
      encabezado.value.area_Generadora
    );
  } else {
    $q.notify({
      type: "negative",
      message: "No se ha seleccionado ningún elemento",
    });
  }
};
</script>

<style>
</style>
