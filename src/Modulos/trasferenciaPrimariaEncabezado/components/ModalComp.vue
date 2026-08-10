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
            <q-select
              v-model="areaResponsableSel"
              :options="areas"
              label="Área responsable"
              hint="Seleccione el área responsable"
              lazy-rules
              :rules="[(val) => !!val || 'El área responsable es requerida']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              v-model="encabezado.area_Generadora"
              label="Área generadora"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              v-model="encabezado.enlace"
              label="Elaboró"
              hint="Enlace del archivo de trámite"
              readonly
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
import { useAreaStore } from "../../../stores/areas_store";
import { ref } from "vue";
import { useRouter } from "vue-router";

const $q = useQuasar();
const router = useRouter();
const transferenciaStore = useTransferenciaPrimariaEncabezadoStore();
const areaStore = useAreaStore();
const { modal, isEditar, encabezado } = storeToRefs(transferenciaStore);
// Corte al backend nuevo: el área responsable se elige de /api/areas (loadListaAreas en la página).
const { areas } = storeToRefs(areaStore);
const areaResponsableSel = ref(null);
const loading = ref(false);

const actualizarModal = (valor) => {
  transferenciaStore.initEncabezado();
  areaResponsableSel.value = null;
  transferenciaStore.actualizarModal(valor);
};

const onSubmit = async () => {
  let resp = null;
  loading.value = true;
  // Corte: el área responsable viene del selector (no del legado).
  if (areaResponsableSel.value) {
    encabezado.value.area_Responsable_Id = areaResponsableSel.value.value;
    encabezado.value.area_Responsable = areaResponsableSel.value.label;
  }
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
