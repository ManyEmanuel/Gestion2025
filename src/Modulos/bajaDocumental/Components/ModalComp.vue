<template>
  <q-dialog
    v-model="modal"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card style="width: 800px; max-width: 80vw">
      <q-card-section class="row">
        <div class="text-h6">Baja documental</div>
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
          <div class="col-12 col-xs-12 col-md-12">
            <q-input
              v-model="encabezado.area_Responsable"
              label="Area responsable"
              readonly
              lazy-rules
              :rules="[(val) => !!val || 'El area responsable es requerida']"
            />
          </div>
          <div class="col-12 col-xs-12 col-md-6">
            <q-select
              v-model="area_id"
              use-input
              input-debounce="0"
              @filter="filtro_areas"
              :options="options_areas"
              autofocus
              label="Area generadora"
              hint="Seleccione area generadora"
              lazy-rules
              :rules="[(val) => !!val || 'El area generadora es requerida']"
            />
          </div>
          <div class="col-12 col-xs-12 col-md-6">
            <q-input
              v-model="encabezado.nombre"
              label="Nombre de la Trasferencia"
              lazy-rules
              :rules="[
                (val) => !!val || 'El nombre de transferencia es requerido',
              ]"
            />
          </div>
          <div class="col-12 col-xs-12 col-md-6">
            <q-input
              v-model="encabezado.no_Transferencia"
              label="No. Trasferencia"
              lazy-rules
              :rules="[
                (val) => !!val || 'El no. de transferencia es requerido',
              ]"
            />
          </div>
          <div class="col-12 col-xs-12 col-md-6">
            <q-input
              stack-label
              v-model="encabezado.fecha_Elaboracion"
              type="date"
              label="Fecha elaboración"
              lazy-rules
              :rules="[
                (val) => !!val || 'La fecha de elaboración es requerida',
              ]"
            />
          </div>
          <div class="col-12 col-xs-12 col-md-6">
            <q-input
              v-model="encabezado.elaboro"
              label="Elaboró"
              readonly
              lazy-rules
              :rules="[
                (val) =>
                  !!val ||
                  'El empleado(a) que elaboró la transferencia es requerido(a)',
              ]"
            />
          </div>
          <div class="col-12 col-xs-12 col-md-6">
            <q-input
              v-model="encabezado.valida"
              label="Valida"
              readonly
              lazy-rules
              :rules="[
                (val) =>
                  !!val ||
                  'El empleado(a) que valida la transferencia es requerido(a)',
              ]"
            />
          </div>
          <div class="col-12 col-xs-12 col-md-6">
            <q-input
              v-model="encabezado.visto_Bueno"
              label="Visto bueno"
              readonly
              lazy-rules
              :rules="[
                (val) =>
                  !!val ||
                  'El empleado(a) dió visto bueno a la transferencia es requerido(a)',
              ]"
            />
          </div>
          <div class="col-12 col-xs-12 col-md-6">
            <q-input
              v-model="encabezado.aprobo"
              label="Aprobó"
              readonly
              lazy-rules
              :rules="[
                (val) =>
                  !!val ||
                  'El empleado(a) aprobó a la transferencia es requerido(a)',
              ]"
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
import { useBajaDocumentalStore } from "../../../stores/baja_documental_store";
import { useAreaStore } from "../../../stores/areas_store";
import { ref, watch, onBeforeMount } from "vue";
import { useRouter } from "vue-router";
import { espera } from "../../../helpers/helper";

const $q = useQuasar();
const router = useRouter();
const bajaStore = useBajaDocumentalStore();
const areaStore = useAreaStore();
const { areas, area } = storeToRefs(areaStore);
const { modal, encabezado, isEditar } = storeToRefs(bajaStore);
const options_areas = ref(areas.value);
const area_id = ref(null);
let captura = false;
const filtro_areas = (val, update) => {
  if (val === "") {
    update(() => {
      options_areas.value = areas.value;
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    options_areas.value = areas.value.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1
    );
  });
};

watch(area_id, (val) => {
  if (val != null) {
    load_padre(val.value);
  } else {
    areaStore.initArea();
  }
});

const load_padre = async (id) => {
  $q.loading.show();
  await areaStore.loadPadreByHija(id);
  await bajaStore.loadEnlace(id);
  await bajaStore.loadResponsableArea(id);
  await bajaStore.loadAprueba();
  await espera();
  encabezado.value.area_Responsable = area.value.area;
  encabezado.value.area_Responsable_Id = area.value.id;
  $q.loading.hide();
};

const onSubmit = async () => {
  $q.loading.show();
  encabezado.value.area_Generadora_Id = area_id.value.value;
  encabezado.value.area_Responsable_Id = area.value.id;
  const resp = await bajaStore.createTransferencia(encabezado.value);
  $q.loading.hide();
  if (resp.success) {
    await bajaStore.loadEncabezados();
    $q.notify({
      type: "positive",
      message: resp.data,
    });
    $q.dialog({
      title: "Registro generado con éxito",
      message: "¿Desea capturar el inventario a dar de Baja?",
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
            name: "cajasBajas",
            params: { bajaId: encabezado.value.id },
          });
        } else {
          router.push({
            name: "cajasBajas",
            params: { bajaId: resp.id },
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
  }
};

const actualizarModal = () => {
  area_id.value = null;
  bajaStore.actualizarModal(false);
};
</script>
