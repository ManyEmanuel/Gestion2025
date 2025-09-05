<template>
  <q-dialog
    v-model="modalVer"
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
        <q-form class="row q-col-gutter-xs">
          <div class="col-12 col-xs-12 col-md-12">
            <q-input
              v-model="inventario.seccion"
              label="Sección"
              hint="Seleccione sección"
              lazy-rules
              :rules="[(val) => !!val || 'La sección es requerida']"
              readonly
            />
          </div>
          <div class="col-12 col-xs-12 col-md-12">
            <q-input
              v-model="inventario.serie"
              label="Serie"
              hint="Seleccione serie"
              lazy-rules
              :rules="[(val) => !!val || 'La serie es requerida']"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-12">
            <q-input
              v-model="inventario.sub_Serie"
              label="SubSerie"
              hint="Seleccione Subserie"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              v-model="inventario.nombre_Expediente"
              label="Nombre del expediente"
              hint="ingrese nombre del expediente"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              v-model="inventario.clave_Clasificacion"
              label="Clave de clasificación"
              hint="ingrese clave de clasificación"
              readonly
            />
          </div>
          <div class="col-12 col-xs-12 col-md-12">
            <q-input
              v-model="inventario.descripcion"
              label="Descripción"
              hint="ingrese descripción"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              stack-label
              v-model="inventario.fecha_Inicio"
              type="date"
              label="Fecha inicio"
              hint="ingrese fecha inicio"
              readonly
            >
            </q-input>
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              stack-label
              v-model="inventario.fecha_Termino"
              type="date"
              label="Fecha termino"
              hint="ingrese fecha termino"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="inventario.ubicacion"
              label="Ubicación"
              hint="ingrese ubicación"
              readonly
              lazy-rules
              :rules="[
                (val) => !!val || 'El  no. expediente interno es requerido',
              ]"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              readonly
              v-model="inventario.valor_Documental"
              label="Valor documental"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              readonly
              v-model="inventario.vigencia_Tramite"
              label="Vigencia archivo tramite"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              readonly
              v-model="inventario.vigencia_Concentracion"
              label="Destino concentración"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              readonly
              v-model="inventario.disposicion_Documental"
              label="Destino final"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              readonly
              stack-label
              v-model="inventario.fecha_Clasificacion"
              type="date"
              label="Fecha clasificación"
              hint="ingrese fecha clasificación"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              readonly
              stack-label
              v-model="inventario.fecha_Desclasificacion"
              type="date"
              label="Fecha desclasificación"
              hint="ingrese fecha desclasificación"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              readonly
              stack-label
              v-model="inventario.fecha_Ampliacion"
              type="date"
              label="Fecha ampliación"
              hint="ingrese fecha ampliación"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-checkbox
              label="Clasificado"
              v-model="inventario.clasificado"
              disable
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { useInventarioAreaStore } from "../../../stores/inventario_area_store";
const props = defineProps({
  encabezadoId: {
    type: Number,
    required: true,
  },
});
const $q = useQuasar();
const inventarioStore = useInventarioAreaStore();
const { modalVer, isEditar, inventario } = storeToRefs(inventarioStore);

const actualizarModal = () => {
  inventarioStore.actualizarModalVer(false);
};
</script>
<style>
</style>
