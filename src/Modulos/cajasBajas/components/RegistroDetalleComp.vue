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
      <div class="row">
        <div
          :class="
            inventarios_options != null && inventarios_options.length > 1
              ? 'col-8'
              : 'col-12'
          "
        >
          <q-select
            v-model="inventarioId"
            :options="inventarios_options"
            label="Clave inventario"
            hint="Seleccione clave"
            lazy-rules
            :rules="[(val) => todos || !!val || 'La clave es requerida']"
            :disable="todos"
          >
          </q-select>
        </div>
        <div
          class="col-4 flex flex-center"
          v-if="inventarios_options != null && inventarios_options.length > 1"
        >
          <q-checkbox
            size="xs"
            v-model="todos"
            label="Agregar todos"
            color="purple-ieen"
          />
        </div>
      </div>
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
import { onBeforeMount, ref, watch } from "vue";
import { useDetalleCajaBajaStore } from "../../../stores/detalle_caja_baja_store";
import { useInventarioAreaStore } from "../../../stores/inventario_area_store";
import { useCajaBajaDocumentalStore } from "../../../stores/caja_baja_documental";
import { espera } from "src/helpers/helper";

// Corte: bajaId lo pasa ModalComp por prop; create (agregar expediente) lo necesita para la ruta
// POST /bajasdocumentales/{bajaId}/expedientes del backend nuevo.
const props = defineProps({
  bajaId: { type: String, default: null },
});

const $q = useQuasar();
const detalleStore = useDetalleCajaBajaStore();
const inventarioStore = useInventarioAreaStore();
const cajaStore = useCajaBajaDocumentalStore();
const { detalle, arrayDetalles, detalles } = storeToRefs(detalleStore);
const { inventariosOpt, inventario } = storeToRefs(inventarioStore);
const inventarios_options = ref(...inventariosOpt.value);
const { caja, isEditar } = storeToRefs(cajaStore);
const inventarioId = ref(null);
const myFormDet = ref(null);
const year = ref(null);
const todos = ref(false);
const years = ref([]);

const leerInventario = async (id) => {
  $q.loading.show();
  inventarioStore.seleccionarInventarioOptLocal(id);
  detalle.value.total_Paginas = inventario.value.total_Paginas;
  detalle.value.descripcion = inventario.value.descripcion;
  $q.loading.hide();
};

watch(inventarioId, (valorInv) => {
  if (todos.value == false) {
    if (valorInv != null) {
      leerInventario(valorInv.value);
    }
  }
});

watch(caja.value, (val) => {
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

const evalua_anos = () => {
  if (
    caja.value.fecha_Antigua.length > 3 &&
    caja.value.fecha_Reciente.length > 3
  ) {
    years.value = [];
    if (caja.value.fecha_Antigua == caja.value.fecha_Reciente) {
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
  if (years.value.length >= 1) {
    inventarios_options.value = inventariosOpt.value.filter((x) =>
      x.label.endsWith(`${years.value[0]}`)
    );
  }

  inventarioId.value = null;
});

watch(todos, (val) => {
  if (val) {
    inventarioId.value = null;
    detalle.value.descripcion = "";
    detalle.value.total_Paginas = 0;
  }
});

const limpiar = async () => {
  $q.loading.show();
  detalleStore.init_detalle();
  inventarioId.value = null;
  await espera(20);
  myFormDet.value.reset();
  $q.loading.hide();
};

const agregarDetalle = async () => {
  $q.loading.show();
  if (todos.value == false) {
    let resp = null;
    detalle.value.inventario_Area_Id = inventarioId.value.value;
    if (isEditar.value == true) {
      const existe = detalles.value.some(
        (x) => x.id == inventarioId.value.value
      );
      if (existe == true) {
        limpiar();
        $q.notify({
          type: "warning",
          message: "Ya has agregado esa clave",
        });
        return;
      }
      resp = await detalleStore.create(props.bajaId, caja.value.id, detalle.value);
      if (resp.success) {
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
    } else {
      const existe = arrayDetalles.value.some(
        (x) => x.inventario_Area_Id == detalle.value.inventario_Area_Id
      );
      if (!existe) {
        detalle.value.clave_Clasificacion =
          inventario.value.clave_Clasificacion;
        detalle.value.fecha_Inicio = inventario.value.fecha_Inicio;
        detalle.value.fecha_Termino = inventario.value.fecha_Termino;
        detalleStore.addDetalle({ ...detalle.value });
        caja.value.total_Paginas = 0;
        caja.value.total_Paginas += inventario.value.total_Paginas;
        caja.value.total_Expedientes = arrayDetalles.value.length;
        await espera(100);
        limpiar();
      } else {
        $q.notify({
          type: "warning",
          message: "Ya has agregado esa clave",
        });
      }
    }
  } else {
    //Agregar todos
    let total = 0;
    for (let i = 0; i < inventarios_options.value.length; i++) {
      let existe = false;
      if (isEditar.value == true) {
        let inv = inventarios_options.value[i];

        existe = detalles.value.some((x) => x.id == inv.value);
        if (existe == false) {
          detalle.value.inventario_Area_Id = inv.value;
          // Corte: se corrige el bug legado (detalleCajaStore/createDetalle no existían aquí) y se
          // pasa bajaId a create; load_detalles recarga el detalle de la caja.
          let resp = await detalleStore.create(
            props.bajaId,
            caja.value.id,
            detalle.value
          );
          if (resp.success == true) {
            detalleStore.load_detalles(caja.value.id);
            $q.notify({
              type: "positive",
              message: `Se agregó la clave ${inv.label}`,
            });
          } else {
            $q.notify({
              type: "negative",
              message: resp.data,
            });
          }
        }
      } else {
        let inv = inventarios_options.value[i];
        existe = arrayDetalles.value.some(
          (x) => x.clave_Clasificacion == inv.label
        );
        if (existe == false) {
          inventarioStore.seleccionarInventarioOptLocal(inv.value);
          detalle.value.inventario_Area_Id = inv.value;
          detalle.value.nombre_Expediente = inventario.value.nombre_Expediente;
          detalle.value.clave_Clasificacion =
            inventario.value.clave_Clasificacion;
          detalle.value.no_Expediente_Interno =
            inventario.value.no_Expediente_Interno;
          detalle.value.fecha_Inicio = inventario.value.fecha_Inicio;
          detalle.value.fecha_Termino = inventario.value.fecha_Termino;
          detalle.value.valor_Documental = inventario.value.valor_Documental;
          detalle.value.vigencia_Concentracion =
            inventario.value.vigencia_Concentracion;
          inventarioId.value = inventario.value.clave_Clasificacion;
          detalle.value.destino_Final = inventario.value.disposicion_Documental;
          detalle.value.descripcion = inventario.value.descripcion;
          detalle.value.total_Paginas = inventario.value.total_Paginas;
          detalleStore.addDetalle({ ...detalle.value });
          caja.value.total_Paginas += inventario.value.total_Paginas;
          caja.value.total_Expedientes = arrayDetalles.value.length;
          await espera(100);
          total += 1;
        }
      }
    }
    if (isEditar.value == false) {
      $q.notify({
        type: "positive",
        message: `Se agregaron ${total} expediente(s)`,
      });
      await espera(100);
    }
    limpiar();
    $q.loading.hide();
  }
};
</script>
