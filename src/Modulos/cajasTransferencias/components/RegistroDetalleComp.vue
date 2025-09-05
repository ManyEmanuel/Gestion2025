<template>
  <div class="text-h6">Detalle</div>
  <q-form class="row q-col-gutter-xs" @submit="agregarDetalle" ref="myFormDet">
    <div class="col-12 col-xs-6 col-md-2">
      <q-select
        v-model="year"
        :options="years"
        label="Año"
        hint="Seleccione año"
      />
    </div>
    <div class="col-12 col-xs-6 col-md-8">
      <q-select
        v-model="inventarioId"
        :options="inventarios_options"
        label="Clave inventario"
        hint="Seleccione clave"
        lazy-rules
        :rules="[(val) => !!val || 'La clave es requerida']"
      />
    </div>
    <div class="col-12 col-xs-6 col-md-2">
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
import { onBeforeMount, onMounted, ref, watch } from "vue";
import { useDetalleCajaTransferenciaStore } from "../../../stores/detalle_caja_Transferencia";
import { useInventarioAreaStore } from "../../../stores/inventario_area_store";
import { useCajaTransferenciaStore } from "../../../stores/caja_trasnferencia_store";
import { espera } from "src/helpers/helper";

const $q = useQuasar();
const inventariosAreas = useInventarioAreaStore();
const cajaStore = useCajaTransferenciaStore();
const detalleCajaStore = useDetalleCajaTransferenciaStore();
const { caja, isEditar } = storeToRefs(cajaStore);
const { detalle, arrayDetalles, detalles } = storeToRefs(detalleCajaStore);
const { inventariosOpt, inventario } = storeToRefs(inventariosAreas);
const inventarios_options = ref(...inventariosOpt.value);
const inventarioId = ref(null);
const myFormDet = ref(null);
const year = ref(null);
const years = ref([]);
watch(inventarioId, (valorInv) => {
  if (valorInv != null) {
    leerInventario(valorInv.value);
  }
});

onMounted(() => {
  if (isEditar.value) {
    setTimeout(() => {
      evalua_anos();
    }, 200);
  }
});

watch(caja.value, (val) => {
  console.log(val);
  if (val.fecha_Antigua != null && val.fecha_Reciente != null) {
    evalua_anos();
  } else {
    year.value = [];
  }
});

watch(year, (val) => {
  if (val === null) {
    inventarios_options.value = [...inventariosOpt.value];
  } else {
    inventarios_options.value = inventariosOpt.value.filter((x) =>
      x.label.endsWith(`${val}`)
    );
  }
});

//TODO: Filtar al cambiar el año32.
const evalua_anos = () => {
  years.value = [];

  if (
    caja.value.fecha_Antigua.length > 3 &&
    caja.value.fecha_Reciente.length > 3
  ) {
    if (caja.value.fecha_Antigua == caja.value.fecha_Reciente) {
      console.log("entro");
      years.value.push(caja.value.fecha_Antigua);
    } else {
      let diferencia =
        caja.value.fecha_Reciente * 1 - caja.value.fecha_Antigua * 1;

      let current_year = caja.value.fecha_Antigua * 1;
      for (let i = 0; i <= diferencia; i++) {
        years.value.push(current_year + i);
      }
    }
    year.value = years.value[0];
  }
};

watch(inventariosOpt, (val) => {
  inventarioId.value = null;
  inventarios_options.value = [...inventariosOpt.value];
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
    const existe = detalles.value.some((x) => x.id == inventarioId.value.value);
    if (existe == true) {
      limpiar();
      $q.notify({
        type: "warning",
        message: "Ya has agregado esa clave",
      });
      return;
    }
    resp = await detalleCajaStore.createDetalle(caja.value.id, detalle.value);
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
    const Existe = arrayDetalles.value.some(
      (x) => x.inventario_Area_Id == detalle.value.inventario_Area_Id
    );
    if (!Existe) {
      detalle.value.nombre_Expediente = inventario.value.nombre_Expediente;
      detalle.value.clave_Clasificacion = inventario.value.clave_Clasificacion;
      detalle.value.no_Expediente_Interno =
        inventario.value.no_Expediente_Interno;
      detalle.value.fecha_Inicio = inventario.value.fecha_Inicio;
      detalle.value.fecha_Termino = inventario.value.fecha_Termino;
      detalle.value.valor_Documental = inventario.value.valor_Documental;
      detalle.value.vigencia_Concentracion =
        inventario.value.vigencia_Concentracion;
      detalle.value.destino_Final = inventario.value.disposicion_Documental;
      detalleCajaStore.addDetalle({ ...detalle.value });
      caja.value.total_Paginas = 0;
      arrayDetalles.value.forEach((element) => {
        caja.value.total_Paginas += element.total_Paginas;
      });
      caja.value.total_Expedientes = arrayDetalles.value.length;
      await espera(100);
      limpiar();
      $q.loading.hide();
    } else {
      $q.loading.hide();
      $q.notify({
        type: "warning",
        message: "Ya has agregado esa clave",
      });
    }
  }
};

const limpiar = async () => {
  detalleCajaStore.initDetalle();
  inventarioId.value = null;
  await espera(20);
  myFormDet.value.reset();
};
</script>
