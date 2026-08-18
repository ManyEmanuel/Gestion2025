<template>
  <q-dialog
    v-model="modalGral"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card flat bordered style="width: 800px; max-width: 80vw">
      <q-card-section class="row">
        <div class="text-h6">Inventario general por expediente</div>
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
        <q-form class="row q-col-gutter-xs">
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              readonly
              v-model="encabezado.area_Responsable"
              label="Área responsable"
              hint="Ingrese área responsable"
              lazy-rules
              :rules="[(val) => !!val || 'El área responsable es requerida']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              v-if="edicionGeneradora == false"
              readonly
              v-model="encabezado.area_Generadora"
              label="Área generadora"
              hint="Ingrese área generadora"
              lazy-rules
              :rules="[(val) => !!val || 'El área generadora es requerida']"
            >
            </q-input>
            <q-select
              v-if="edicionGeneradora == true"
              v-model="area_Id"
              label="Área generadora"
              hint="Ingrese área generadora"
              :options="opcionesAreas"
              use-input
              @filter="filterCla"
            >
            </q-select>
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              readonly
              v-model="encabezado.nombre"
              label="Nombre"
              hint="Ingrese nombre"
              lazy-rules
              :rules="[(val) => !!val || 'El nombre es requerido']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              readonly
              v-model="encabezado.enlace"
              label="Elaboró"
              hint="Seleccione enlace"
              lazy-rules
              :rules="[(val) => !!val || 'El enlace es requerido']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              readonly
              v-model="encabezado.valido"
              label="Validó"
              hint="Ingrese quien validó"
              lazy-rules
              :rules="[(val) => !!val || 'Quien dió visto bueno es requerido']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              readonly
              v-model="encabezado.visto_Bueno"
              label="Visto bueno"
              hint="Ingrese quien dió visto bueno"
              lazy-rules
              :rules="[(val) => !!val || 'Quien dió visto bueno es requerido']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              readonly
              v-model="encabezado.supervisa"
              label="Supervisa"
              hint="Ingrese quien supervisa"
              lazy-rules
              :rules="[(val) => !!val || 'Quien supervisa es requerido']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6 text-center">
            <q-checkbox
              label="Cambiar área generadora"
              v-model="edicionGeneradora"
              size="sm"
              style="font-size: 15px"
            >
            </q-checkbox>
          </div>
          <div class="col-12 justify-end">
            <div class="text-right q-gutter-xs">
              <q-btn
                color="red"
                label="Cerrar"
                @click="actualizarModal()"
                icon="highlight_off"
              />
              <q-btn
                v-if="edicionGeneradora == true"
                color="secondary"
                label="Guardar"
                icon="save"
                @click="guardar(encabezado.id)"
              >
              </q-btn>
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { useQuasar } from "quasar";
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useEncabezadoInventarioStore } from "../../../stores/encabezado_inventario_area";
import { useVistosBuenosStore } from "../../../stores/visto_bueno_store";
import { useAreaStore } from "../../../stores/areas_store";
import { onBeforeMount } from "vue-demi";
const $q = useQuasar();
const encabezadoInventariosStore = useEncabezadoInventarioStore();
const areaStore = useAreaStore();
const vistoBuenoStore = useVistosBuenosStore();
const { encabezado, modalGral } = storeToRefs(encabezadoInventariosStore);
const { areas } = storeToRefs(areaStore);
const edicionGeneradora = ref(false);
const opcionesAreas = ref([...areas.value]);
const area_Id = ref();
const actualizarModal = () => {
  edicionGeneradora.value = false;
  encabezadoInventariosStore.actualizarModalGral(false);
};

onBeforeMount(() => {
  vistoBuenoStore.loadListaVoBos();
});

const guardar = async (id) => {
  $q.loading.show();
  let resp = await encabezadoInventariosStore.cambiarAreaGeneradora(
    id,
    area_Id.value.value
  );
  if (resp.success) {
    $q.notify({
      type: "positive",
      message: resp.data,
    });
    //loading.value = false;
    actualizarModal();
  } else {
    $q.notify({
      type: "negative",
      message: resp.data,
    });
    //loading.value = false;
  }

  $q.loading.hide();
};

const filterCla = (val, update) => {
  if (val === "") {
    update(() => {
      opcionesAreas.value = areas.value;
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    opcionesAreas.value = areas.value.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1
    );
  });
};
</script>
