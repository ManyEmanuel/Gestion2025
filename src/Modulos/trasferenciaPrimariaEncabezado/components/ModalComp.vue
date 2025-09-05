<template>
  <q-dialog
    v-model="modal"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card style="width: 800px; max-width: 80vw">
      <q-card-section class="row">
        <div class="text-h6">Transferencia primaria</div>
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
          <div class="col-12 col-xs-6 col-md-6" v-if="isEditar">
            <q-input
              v-model="encabezado.fecha_Registro"
              label="Fecha registro"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              v-model="encabezado.numero_Transferencia"
              label="No. transferencia"
              lazy-rules
              :rules="[
                (val) => !!val || 'El número de transferencia es requerido',
              ]"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              v-model="encabezado.nombre"
              label="Nombre"
              hint="Ingrese un nombre para identificar la transferencia"
              lazy-rules
              :rules="[(val) => !!val || 'Quien supervisa es requerido']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              v-model="encabezado.area_Responsable"
              label="Área responsable"
              hint="Ingrese área responsable"
              lazy-rules
              :rules="[(val) => !!val || 'El área responsable es requerida']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              v-model="encabezado.area_Generadora"
              label="Área generadora"
              hint="Ingrese área generadora"
              lazy-rules
              :rules="[(val) => !!val || 'El área generadora es requerida']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              v-model="encabezado.enlace"
              label="Elaboró"
              hint="Enlace del archivo de tramite"
              lazy-rules
              :rules="[(val) => !!val || 'El enlace de area es requerido']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              v-model="encabezado.valida_Area"
              label="Valida"
              lazy-rules
              readonly
              :rules="[(val) => !!val || 'Quien dió visto bueno es requerido']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              v-model="encabezado.coteja"
              label="Coteja"
              readonly
              lazy-rules
              :rules="[(val) => !!val || 'Quien dió visto bueno es requerido']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              v-model="encabezado.valida"
              label="Valida"
              readonly
              lazy-rules
              :rules="[(val) => !!val || 'Quien supervisa es requerido']"
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
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { useTransferenciaPrimariaEncabezadoStore } from "../../../stores/transferencia_primaria_encabezado_store";
import { useEnlaceArchivoStore } from "../../../stores/enlace_archivo_store";
import { ref, watch, onBeforeMount } from "vue";
import { useRouter } from "vue-router";
import { espera } from "../../../helpers/helper";

const $q = useQuasar();
const router = useRouter();
const transferenciaStore = useTransferenciaPrimariaEncabezadoStore();
const enlaceArchivoStore = useEnlaceArchivoStore();
const { modal, isEditar, encabezado } = storeToRefs(transferenciaStore);
const { listaEnlaces } = storeToRefs(enlaceArchivoStore);
// const { listaSecciones } = storeToRefs(seccionStore);
const enlaceId = ref(null);
const seccionId = ref(null);
const loading = ref(false);

// onBeforeMount(() => {
//   transferenciaStore.loadArea();
//   transferenciaStore.loadValidaAreaGeneradora();
//   transferenciaStore.loadCoteja();
//   transferenciaStore.loadValida();
// });

const actualizarModal = (valor) => {
  transferenciaStore.initEncabezado();
  transferenciaStore.actualizarModal(valor);
};

watch(encabezado.value, (val) => {
  cargarEnlace(val);
});

const cargarEnlace = async (val) => {
  await espera();
  if (isEditar.value == true) {
    const enlace_Id_Filtrado = listaEnlaces.value.find(
      (x) => x.value == `${val.enlace_Id}`
    );
    enlaceId.value = enlace_Id_Filtrado;
  }
};

const onSubmit = async () => {
  let resp = null;
  loading.value = true;
  if (isEditar.value == true) {
    resp = await transferenciaStore.updateTransferenciaPrimariaEncabezado(
      encabezado.value.id,
      encabezado.value
    );
  } else {
    resp = await transferenciaStore.createTransferenciaPrimariaEncabezado(
      encabezado.value
    );
  }
  if (resp.success) {
    $q.notify({
      type: "positive",
      message: resp.data,
    });
    loading.value = false;
    $q.dialog({
      title: "Registro generado con éxito",
      message: "¿Desea capturar el inventario a transferir?",
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
        if (isEditar.value == true) {
          router.push({
            name: "cajasTransferencias",
            params: { transferenciaId: encabezado.value.id },
          });
        } else {
          router.push({
            name: "cajasTransferencias",
            params: { transferenciaId: resp.id },
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
