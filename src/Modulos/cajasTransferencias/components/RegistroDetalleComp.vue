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
          v-if="rango == false"
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
        <div class="col-8" v-if="rango == true">
          <q-select
            v-model="rangoInventarios"
            :options="inventarios_options"
            label="Clave inventario"
            multiple
            hint="Seleccione el rango de claves a elegir"
            lazy-rules
            :rules="[
              (val) => todos || rango || !!val || 'La clave es requerida',
            ]"
            :disable="todos"
            :display-value="rangoValores"
          >
          </q-select>
        </div>
        <div
          class="col-4 flex flex-center"
          v-if="inventarios_options != null && inventarios_options.length > 1"
        >
          <q-list>
            <q-checkbox
              size="xs"
              v-model="rango"
              label="Por rango"
              color="purple-ieen"
            />
            <q-checkbox
              size="xs"
              v-model="todos"
              label="Agregar todos"
              color="purple-ieen"
            />
          </q-list>
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
        :rules="[
          (val) => todos || rango || !!val || 'La descripción es requerida',
        ]"
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
import { nextTick, onBeforeMount, onMounted, ref, watch } from "vue";
import { useDetalleCajaTransferenciaStore } from "../../../stores/detalle_caja_Transferencia";
import { useInventarioAreaStore } from "../../../stores/inventario_area_store";
import { useCajaTransferenciaStore } from "../../../stores/caja_trasnferencia_store";

// Corte: transferenciaId lo pasa ModalComp por prop; createDetalle (agregar expediente al editar caja)
// lo necesita para la ruta POST /transferenciasprimarias/{id}/expedientes del backend nuevo.
const props = defineProps({
  transferenciaId: { type: String, default: null },
});

const $q = useQuasar();
const inventariosAreas = useInventarioAreaStore();
const cajaStore = useCajaTransferenciaStore();
const detalleCajaStore = useDetalleCajaTransferenciaStore();
const { caja, isEditar, cajas } = storeToRefs(cajaStore);
const { detalle, arrayDetalles, detalles } = storeToRefs(detalleCajaStore);
const { inventariosOpt, inventario } = storeToRefs(inventariosAreas);
const inventarios_options = ref(...inventariosOpt.value);
const inventarioId = ref(null);
const todos = ref(false);
const rango = ref(false);
const myFormDet = ref(null);
const year = ref(null);
const rangoInventarios = ref(null);
const rangoValores = ref([]);
const calculando = ref(false);

const years = ref([]);
watch(inventarioId, (valorInv) => {
  if (todos.value == false && rango.value == false) {
    if (valorInv != null) {
      leerInventario(valorInv.value);
    }
  }
});

watch(rangoInventarios, (val) => {
  if (calculando.value == true) return;

  if (val.length > 1) {
    calculando.value = true;
    rangoValores.value =
      rangoInventarios.value[0].label +
      " - " +
      rangoInventarios.value[rangoInventarios.value.length - 1].label;
    crearRango(
      rangoInventarios.value[0].value,
      rangoInventarios.value[rangoInventarios.value.length - 1].value
    );
  } else {
    rangoValores.value = "";
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
  if (val.fecha_Antigua != null && val.fecha_Reciente != null) {
    evalua_anos();
  } else {
    year.value = [];
  }
});

watch(todos, (val) => {
  if (val) {
    inventarioId.value = null;
    detalle.value.descripcion = "";
    detalle.value.total_Paginas = 0;
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

const crearRango = async (inicio, fin) => {
  const inicioIndex = inventarios_options.value.findIndex(
    (item) => item.value === inicio
  );
  const finIndex = inventarios_options.value.findIndex(
    (item) => item.value === fin
  );

  if (inicioIndex === -1 || finIndex === -1) {
    return [];
  }
  let listado_rango = [];
  // Si el valor inicial está antes que el final
  if (inicio <= fin) {
    listado_rango = inventarios_options.value.slice(inicioIndex, finIndex + 1);
  } else {
    // Si el valorInicio está después del valorFin
    listado_rango = inventarios_options.value.slice(finIndex, inicioIndex + 1);
  }
  await (rangoInventarios.value = listado_rango);

  $q.loading.hide();
  calculando.value = false;
};
//TODO: Filtar al cambiar el año32.
const evalua_anos = () => {
  years.value = [];

  if (
    caja.value.fecha_Antigua.length > 3 &&
    caja.value.fecha_Reciente.length > 3
  ) {
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
  inventarioId.value = null;
  inventarios_options.value = [...inventariosOpt.value];
});

const leerInventario = async (id) => {
  $q.loading.show();
  inventariosAreas.seleccionarInventarioOptLocal(id);
  detalle.value.total_Paginas = inventario.value.total_Paginas;
  detalle.value.descripcion = inventario.value.descripcion;
  $q.loading.hide();
};

const agregarDetalle = async () => {
  $q.loading.show();
  if (rango.value == true) {
    //Agregar por rango
    let total = 0;
    for (let i = 0; i < rangoInventarios.value.length; i++) {
      let existe = false;
      if (isEditar.value == true) {
        let inv = rangoInventarios.value[i];

        existe = detalles.value.some((x) => x.id == inv.value);
        if (existe == false) {
          detalle.value.inventario_Area_Id = inv.value;
          inventariosAreas.seleccionarInventarioOptLocal(inv.value);
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
          detalleCajaStore.addDetalle({ ...detalle.value });

          total += 1;
          let resp = await detalleCajaStore.createDetalle(
            props.transferenciaId,
            caja.value.id,
            detalle.value
          );
          if (resp.success == true) {
            detalleCajaStore.loadDetalles(caja.value.id);
            caja.value.total_Paginas += detalle.value.total_Paginas;
            caja.value.total_Expedientes = detalles.value.length;
            total += 1;
          } else {
          }
        }
      } else {
        let inv = rangoInventarios.value[i];
        existe = arrayDetalles.value.some(
          (x) => x.clave_Clasificacion == inv.label
        );
        if (existe == false) {
          inventariosAreas.seleccionarInventarioOptLocal(inv.value);
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
          detalleCajaStore.addDetalle({ ...detalle.value });
          caja.value.total_Paginas += inventario.value.total_Paginas;
          caja.value.total_Expedientes = arrayDetalles.value.length;
          total += 1;
        }
      }
    }
    if (isEditar.value == false) {
      $q.notify({
        type: "positive",
        message: `Se agregaron ${total} expediente(s)`,
      });
    } else {
      $q.notify({
        type: "positive",
        message: `Se agregaron ${total} expediente(s) nuevos`,
      });
    }
    limpiar();
    $q.loading.hide();
  } else {
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
        resp = await detalleCajaStore.createDetalle(
          props.transferenciaId,
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
        const Existe = arrayDetalles.value.some(
          (x) => x.inventario_Area_Id == detalle.value.inventario_Area_Id
        );
        if (!Existe) {
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
          detalle.value.destino_Final = inventario.value.disposicion_Documental;
          detalleCajaStore.addDetalle({ ...detalle.value });
          caja.value.total_Paginas = 0;
          caja.value.total_Paginas += inventario.value.total_Paginas;
          caja.value.total_Expedientes = arrayDetalles.value.length;
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
            let resp = await detalleCajaStore.createDetalle(
              props.transferenciaId,
              caja.value.id,
              detalle.value
            );
            if (resp.success == true) {
              detalleCajaStore.loadDetalles(caja.value.id);
              caja.value.total_Paginas += detalle.value.total_Paginas;
              caja.value.total_Expedientes = arrayDetalles.value.length;
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
            inventariosAreas.seleccionarInventarioOptLocal(inv.value);
            detalle.value.inventario_Area_Id = inv.value;
            detalle.value.nombre_Expediente =
              inventario.value.nombre_Expediente;
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
            detalle.value.destino_Final =
              inventario.value.disposicion_Documental;
            detalle.value.descripcion = inventario.value.descripcion;
            detalle.value.total_Paginas = inventario.value.total_Paginas;
            detalleCajaStore.addDetalle({ ...detalle.value });
            caja.value.total_Paginas += inventario.value.total_Paginas;
            caja.value.total_Expedientes = arrayDetalles.value.length;
            total += 1;
          }
        }
      }
      if (isEditar.value == false) {
        $q.notify({
          type: "positive",
          message: `Se agregaron ${total} expediente(s)`,
        });
      }
      limpiar();
      $q.loading.hide();
    }
  }
};

const limpiar = async () => {
  detalleCajaStore.initDetalle();
  inventarioId.value = null;
  await nextTick();
  myFormDet.value.reset();
};
</script>
