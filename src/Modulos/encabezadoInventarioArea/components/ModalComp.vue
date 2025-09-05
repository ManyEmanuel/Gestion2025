<template>
  <q-dialog
    v-model="modal"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card style="width: 800px; max-width: 80vw">
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
        <q-form class="row q-col-gutter-xs" @submit="onSubmit">
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
              readonly
              v-model="encabezado.area_Generadora"
              label="Área generadora"
              hint="Ingrese área generadora"
              lazy-rules
              :rules="[(val) => !!val || 'El área generadora es requerida']"
            />
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
              label="Enlace"
              hint="Enlace registrado previamente"
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
              :rules="[(val) => !!val || 'Quien validó bueno es requerido']"
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
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              v-model="encabezado.ano"
              label="Año"
              hint="Ingrese el año del registro"
              lazy-rules
              :rules="[(val) => !!val || 'El año de captura es requerido']"
            />
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
import { Loading, useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { useEncabezadoInventarioStore } from "../../../stores/encabezado_inventario_area";
import { useVistosBuenosStore } from "../../../stores/visto_bueno_store";
import { onBeforeMount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { espera } from "../../../helpers/helper";

const $q = useQuasar();
const router = useRouter();
const encabezadoInventariosStore = useEncabezadoInventarioStore();
const vistoBuenoStore = useVistosBuenosStore();
const { modal, isEditar, encabezado } = storeToRefs(encabezadoInventariosStore);
const { vistos_buenos_opt } = storeToRefs(vistoBuenoStore);
const enlaceId = ref(null);
const empleadoId = ref(null);
const loading = ref(false);
const actualizarModal = (valor) => {
  encabezadoInventariosStore.initEncabezado();
  encabezadoInventariosStore.actualizarModal(valor);
};

const cargarEnlace = async (val) => {
  $q.loading.show();
  await espera(150);
  $q.loading.hide();
  if (isEditar.value == true) {
    const enlace_Id_Filtrado = listaEnlaces.value.find(
      (x) => x.value == `${val.enlace_Id}`
    );
    enlaceId.value = enlace_Id_Filtrado;
    const empleado_id_filtrado = vistos_buenos_opt.value.find(
      (x) => x.value == `${val.visto_Bueno_Id}`
    );
    empleadoId.value = empleado_id_filtrado;
  }
};

watch(encabezado.value, (val) => {
  if (val.id != null) {
    cargarEnlace(val);
  }
});

watch(modal, (val) => {
  if (val == true && isEditar.value == false) {
    encabezado.value.nombre = encabezado.value.valido;
  }
});

onBeforeMount(() => {
  vistoBuenoStore.loadListaVoBos();
});

const onSubmit = async () => {
  let resp = null;
  loading.value = true;
  if (isEditar.value == true) {
    resp = await encabezadoInventariosStore.updateEncabezado(
      encabezado.value,
      encabezado.value.id
    );
  } else {
    resp = await encabezadoInventariosStore.createEncabezado(encabezado.value);
  }
  if (resp.success) {
    $q.notify({
      type: "positive",
      message: resp.data,
    });
    loading.value = false;
    $q.dialog({
      title: "Registro generado con éxito",
      message: "¿Desea capturar el inventario?",
      icon: "Information",
      persistent: true,
      transitionShow: "scale",
      transitionHide: "scale",
      ok: {
        color: "positive",
        label: "Si, capturar inventario",
      },
      cancel: {
        color: "negative",
        label: "No, capturar despues",
      },
    })
      .onOk(() => {
        actualizarModal(false);
        if (isEditar.value == true) {
          router.push({
            name: "detalleInventario",
            params: { encabezadoId: encabezado.value.id },
          });
        } else {
          router.push({
            name: "detalleInventario",
            params: { encabezadoId: resp.id },
          });
        }
      })
      .onCancel(() => {
        actualizarModal(false);
      });
  } else {
    $q.notify({
      type: "negative",
      message: resp.data,
    });
    loading.value = false;
  }
};
</script>

<style>
</style>
