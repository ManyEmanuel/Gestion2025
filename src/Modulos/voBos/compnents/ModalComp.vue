<template>
  <q-dialog
    v-model="modal"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card style="width: 800px; max-width: 80vw">
      <q-card-section class="row">
        <div class="text-h6">Visto bueno</div>
        <q-space />
        <q-btn
          icon="close"
          @click="actualizarModal(false)"
          flat
          round
          dense
          v-close-popup
        />
      </q-card-section>
      <q-card-section>
        <q-form class="row q-col-gutter-xs" @submit="onSubmit">
          <div class="col-12 col-xs-6 col-md-12">
            <q-select
              use-input
              input-debounce="0"
              v-model="empleadoId"
              @filter="filtro_empleado"
              :options="options_empleado"
              label="Empleado"
              hint="Selecciona empleado"
              lazy-rules
              :rules="[(val) => !!val || 'El empleado es requerido']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-checkbox label="Activo" v-model="visto.activo" />
          </div>
          <div class="col-12 justify-end">
            <div class="text-right q-gutter-xs">
              <q-btn
                color="red"
                label="Cancelar"
                @click="actualizarModal(false)"
                icon="highlight_off"
              />
              <q-btn
                :loading="loading"
                type="submit"
                color="secondary"
                label="Guardar"
                icon="save"
              >
                <template v-slot:loading>
                  <q-spinner-hourglass class="on-left" />
                  Cargando...
                </template>
              </q-btn>
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useQuasar } from "quasar";
import { onMounted, ref, watch } from "vue";
import { useVistosBuenosStore } from "../../../stores/visto_bueno_store";
import { useAreaStore } from "../../../stores/areas_store";
import { espera } from "../../../helpers/helper";

const $q = useQuasar();
const vistoStore = useVistosBuenosStore();
const areaStore = useAreaStore();
const { visto, modal, isEditar } = storeToRefs(vistoStore);
const { empleados } = storeToRefs(areaStore);
const empleadoId = ref(null);
const options_empleado = ref(empleados.value);
const actualizarModal = () => {
  empleadoId.value = null;
  vistoStore.initVbo();
  vistoStore.updateEditar(false);
  vistoStore.actualizarModal(false);
};

const filtro_empleado = (val, update) => {
  if (val === "") {
    update(() => {
      options_empleado.value = empleados.value;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    options_empleado.value = empleados.value.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1
    );
  });
};

onMounted(() => {
  areaStore.loadEmpleadosTodos();
});

const onSubmit = async () => {
  let resp = null;
  visto.value.empleado_Id = empleadoId.value.value;
  if (isEditar.value == true) {
    resp = await vistoStore.update(visto.value);
  } else {
    resp = await vistoStore.create(visto.value);
  }
  if (resp.success) {
    $q.notify({
      type: "positive",
      message: resp.data,
    });
    actualizarModal(false);
  } else {
    $q.notify({
      type: "negative",
      message: resp.data,
    });
  }
};
</script>
