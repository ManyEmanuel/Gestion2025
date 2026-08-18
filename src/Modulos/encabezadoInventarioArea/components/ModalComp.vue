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
        <!-- Corte al backend nuevo: se quitaron los roles legados (validó/visto bueno/supervisa) que
             el dominio nuevo no modela. Área generadora = área del usuario (JWT, readonly); enlace =
             su enlace (readonly); el área responsable se elige de /api/areas. -->
        <q-form class="row q-col-gutter-xs" @submit="onSubmit">
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
              readonly
              v-model="encabezado.area_Generadora"
              label="Área generadora"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              v-model="encabezado.nombre"
              label="Nombre"
              hint="Ingrese un nombre para identificar el inventario"
              lazy-rules
              :rules="[(val) => !!val || 'El nombre es requerido']"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              readonly
              v-model="encabezado.enlace"
              label="Enlace"
              hint="Enlace del archivo de trámite"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-6">
            <q-input
              v-model="encabezado.ano"
              label="Año"
              hint="Ingrese el año del registro"
              type="Number"
              lazy-rules
              :rules="[(val) => !!val || 'El año de captura es requerido']"
            />
          </div>
          <div class="col-12 justify-end">
            <div class="text-right q-gutter-xs">
              <BtnCancelar @click="actualizarModal(false)" />
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
import { useEncabezadoInventarioStore } from "../../../stores/encabezado_inventario_area";
import { useAreaStore } from "../../../stores/areas_store";
import { ref } from "vue";
import { useRouter } from "vue-router";
import BtnCancelar from "../../../components/BtnCancelar.vue";

const $q = useQuasar();
const router = useRouter();
const encabezadoInventariosStore = useEncabezadoInventarioStore();
const areaStore = useAreaStore();
const { modal, isEditar, encabezado } = storeToRefs(encabezadoInventariosStore);
const { areas } = storeToRefs(areaStore);
const areaResponsableSel = ref(null);
const loading = ref(false);

const actualizarModal = () => {
  areaResponsableSel.value = null;
  encabezadoInventariosStore.initEncabezado();
  encabezadoInventariosStore.actualizarModal(false);
};

const onSubmit = async () => {
  loading.value = true;
  // Corte: el área responsable viene del selector; la generadora y el enlace ya están puestos por
  // loadArea/loadEnlace (JWT).
  if (areaResponsableSel.value) {
    encabezado.value.area_Responsable_Id = areaResponsableSel.value.value;
    encabezado.value.area_Responsable = areaResponsableSel.value.label;
  }
  const resp = await encabezadoInventariosStore.createEncabezado(encabezado.value);
  loading.value = false;
  if (resp.success) {
    $q.notify({ type: "positive", message: resp.data });
    $q.dialog({
      title: "Registro generado con éxito",
      message: "¿Desea capturar el inventario?",
      icon: "info",
      persistent: true,
      transitionShow: "scale",
      transitionHide: "scale",
      ok: { color: "positive", label: "Si, capturar inventario" },
      cancel: { color: "negative", label: "No, capturar despues" },
    })
      .onOk(() => {
        const destino = isEditar.value == true ? encabezado.value.id : resp.id;
        areaResponsableSel.value = null;
        router.push({
          name: "detalleInventario",
          params: { encabezadoId: destino },
        });
      })
      .onCancel(() => {
        actualizarModal(false);
      });
  } else {
    $q.notify({ type: "negative", message: resp.data });
  }
};
</script>
