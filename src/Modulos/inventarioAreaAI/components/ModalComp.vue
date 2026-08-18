<template>
  <q-dialog
    v-model="modal"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card flat bordered style="width: 800px; max-width: 80vw">
      <q-card-section class="row">
        <div class="text-h6">Inventario general por expediente</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <q-form class="row q-col-gutter-xs" @submit="onSubmit">
          <div class="col-12 col-xs-6 col-md-4">
            <q-input v-model="inventario.seccion" label="Sección" readonly />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input v-model="inventario.serie" label="Serie" readonly />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input v-model="inventario.sub_Serie" label="Subserie" readonly />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="inventario.nombre_Expediente"
              label="Nombre del expediente"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="inventario.clave_Clasificacion"
              label="Clave de clasificación"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="inventario.no_Expediente_Interno"
              label="Clave de clasificación"
              readonly
            />
          </div>
          <div class="col-12 col-xs-12 col-md-12">
            <q-input
              v-model="inventario.descripcion"
              label="Descripción"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              stack-label
              v-model="inventario.fecha_Inicio"
              type="date"
              label="Fecha inicio"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              stack-label
              v-model="inventario.fecha_Termino"
              type="date"
              label="Fecha termino"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="inventario.ubicacion_AI"
              label="Ubicación"
              hint="Ingrese la ubicación "
              autofocus
              lazy-rules
              :rules="[(val) => !!val || 'La ubicación es requerida']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="inventario.valor_Documental"
              label="Valor documental"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="inventario.vigencia_Tramite"
              label="Vigencia archivo tramite"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="inventario.vigencia_Concentracion"
              label="Vigencia concentración"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="inventario.disposicion_Documental"
              label="Destino final"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              stack-label
              v-model="inventario.fecha_Clasificacion"
              type="date"
              label="Fecha clasificación"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              stack-label
              v-model="inventario.fecha_Desclasificacion"
              type="date"
              label="Fecha desclasificación"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              stack-label
              v-model="inventario.fecha_Ampliacion"
              type="date"
              label="Fecha ampliación"
              readonly
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
      <q-card-section>
        <div class="col-12 justify-end">
          <div class="text-right q-gutter-xs">
            <BtnCancelar @click="actualizarModal(false)" />
            <q-btn
              :loading="loading"
              type="button"
              color="secondary"
              label="Guardar ubicación"
              icon="save"
              @click="onSubmit"
            >
              <template v-slot:loading>
                <q-spinner-hourglass class="on-left" />
                Cargando...
              </template>
            </q-btn>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { ref, toRef } from "vue";
import { useInventarioAreaAIStore } from "../../../stores/inventario_area_ai_store";
import BtnCancelar from "../../../components/BtnCancelar.vue";

const $q = useQuasar();
const inventarioStore = useInventarioAreaAIStore();
const { modal, isEditar, inventario } = storeToRefs(inventarioStore);
const loading = ref(false);
const actualizarModal = () => {
  inventarioStore.initInventario();
  inventarioStore.actualizarModal(false);
};
const onSubmit = async () => {
  loading.value = true;
  const resp = await inventarioStore.updateUbicacion(
    inventario.value.id,
    inventario.value.ubicacion_AI
  );
  if (resp.success) {
    $q.notify({
      type: "positive",
      message: resp.data,
    });
    loading.value = false;
    inventarioStore.actualizarModal(false);
  } else {
    $q.notify({
      type: "negative",
      message: resp.data,
    });
    loading.value = false;
  }
};
</script>
