<template>
  <div class="text-h6">Detalle</div>
  <q-form class="row q-col-gutter-xs" @submit="agregarDetalle" ref="myFormDet">
    <div class="col-12 col-xs-6 col-md-8">
      <q-select
        v-model="inventarioId"
        :options="inventariosOpt"
        label="Clave inventario"
        hint="Seleccione clave"
        lazy-rules
        :rules="[(val) => !!val || 'La clave es requerida']"
      />
    </div>
    <div class="col-12 col-xs-6 col-md-4">
      <q-input
        v-model="detalle.total_Paginas"
        label="Total hojas"
        type="Number"
      />
    </div>
    <div class="col-12 col-xs-12 col-md-12">
      <q-input
        v-model="detalle.descripcion"
        label="Descripción"
        hint="Indique descripción"
        lazy-rules
        :rules="[(val) => !!val || 'La descripción es requerida']"
      />
    </div>
    <div class="col-12 justify-end">
      <div class="text-right q-gutter-xs">
        <q-btn
          color="red"
          label="limpiar"
          @click="limpiar"
          icon="highlight_off"
        />
        <q-btn
          :loading="loading"
          type="submit"
          color="secondary"
          label="Agregar"
          icon="add"
        >
          <template v-slot:loading>
            <q-spinner-hourglass class="on-left" />
            Cargando...
          </template>
        </q-btn>
      </div>
    </div>
  </q-form>
</template>
<script setup>
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref, watch, nextTick } from "vue";
import { useDetalleCajaBaja } from "../../../stores/detalle_caja_baja_store";
import { useInventarioAreaStore } from "../../../stores/inventario_area_store";
import { useCajaBajaDocumentalStore } from "../../../stores/caja_baja_documental";

const $q = useQuasar();
const detalleCajaStore = useDetalleCajaBaja();
const cajaBajaStore = useCajaBajaDocumentalStore();
const inventariosAreas = useInventarioAreaStore();
const { caja, isEditar } = storeToRefs(cajaBajaStore);
const { detalle, arrayDetalles } = storeToRefs(detalleCajaStore);
const { inventariosOpt, inventario } = storeToRefs(inventariosAreas);
const inventarioId = ref(null);
const myFormDet = ref(null);

watch(inventarioId, (valorInv) => {
  if (valorInv != null) {
    leerInventario(valorInv.value);
  }
});

const leerInventario = async (id) => {
  $q.loading.show();
  await inventariosAreas.loadInventario(id);
  detalle.value.total_Paginas = inventario.value.total_Paginas;
  detalle.value.descripcion = inventario.value.descripcion;
  $q.loading.hide();
};

const agregarDetalle = async () => {
  $q.loading.show();
  let resp = null;
  detalle.value.inventario_Area_Id = inventarioId.value.value;
  if (isEditar.value == true) {
    resp = await detalleCajaStore.updateDetalle(
      detalle.value.id,
      caja.value.id,
      detalle.value
    );
    if (resp.success == true) {
      detalleCajaStore.loadDetalles(caja.value.id);
      limpiar();
      $q.notify({
        type: "positive",
        message: resp.data,
      });
    } else {
      $q.notify({
        type: "negative",
        message: resp.data,
      });
    }
    $q.loading.hide();
  } else {
    const objDetalle = {
      id: arrayDetalles.value.length + 1,
      Inventario_Area_Id: inventarioId.value.value,
      nombre_Expediente: inventario.value.nombre_Expediente,
      clave_Clasificacion: inventario.value.clave_Clasificacion,
      no_Expediente_Interno: inventario.value.no_Expediente_Interno,
      fecha_Inicio: inventario.value.fecha_Inicio,
      fecha_Termino: inventario.value.fecha_Termino,
      valor_Documental: inventario.value.valor_Documental,
      vigencia_Concentracion: inventario.value.vigencia_Concentracion,
      destino_Final: inventario.value.disposicion_Documental,
      descripcion: detalle.value.descripcion,
      total_Paginas: inventario.value.total_Paginas,
    };
    detalleCajaStore.addDetalle(objDetalle);
    caja.value.total_Paginas = 0;
    arrayDetalles.value.forEach((element) => {
      caja.value.total_Paginas += element.total_Paginas;
    });
    caja.value.total_Expedientes = arrayDetalles.value.length;
    limpiar();
    $q.loading.hide();
  }
};

const limpiar = async () => {
  detalleCajaStore.initDetalle();
  inventarioId.value = null;
  await nextTick();
  myFormDet.value.reset();
};
</script>