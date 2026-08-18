<template>
  <q-dialog
    v-model="modal"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card flat bordered style="width: 800px; max-width: 80vw">
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
        <!-- Corte al backend nuevo: se quitaron los roles legados (valida/visto bueno/aprobó) que el
             dominio nuevo no modela. Área generadora = área del usuario (JWT, readonly); 'Elaboró' =
             su enlace (readonly); el área responsable se elige de /api/areas (la jerarquía de áreas
             no está poblada, así que ya no se deriva del área padre). -->
        <q-form class="row q-col-gutter-xs" @submit="onSubmit">
          <div class="col-12 col-xs-12 col-md-6">
            <q-select
              v-model="areaResponsableSel"
              :options="areas"
              label="Area responsable"
              hint="Seleccione el área responsable"
              lazy-rules
              :rules="[(val) => !!val || 'El area responsable es requerida']"
            />
          </div>
          <div class="col-12 col-xs-12 col-md-6">
            <q-input
              v-model="encabezado.area_Generadora"
              label="Area generadora"
              readonly
            />
          </div>
          <div class="col-12 col-xs-12 col-md-6">
            <q-input
              v-model="encabezado.nombre"
              label="Nombre de la Baja"
              lazy-rules
              :rules="[(val) => !!val || 'El nombre de la baja es requerido']"
            />
          </div>
          <div class="col-12 col-xs-12 col-md-6">
            <q-input
              v-model="encabezado.no_Transferencia"
              label="No. Baja"
              lazy-rules
              :rules="[(val) => !!val || 'El no. de baja es requerido']"
            />
          </div>
          <div class="col-12 col-xs-12 col-md-6">
            <q-input v-model="encabezado.elaboro" label="Elaboró" readonly />
          </div>
          <div class="col-12 col-xs-12 col-md-6">
            <q-input
              v-model="encabezado.observaciones"
              label="Observaciones"
              hint="Opcional"
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
import { useBajaDocumentalStore } from "../../../stores/baja_documental_store";
import { useAreaStore } from "../../../stores/areas_store";
import { ref } from "vue";
import { useRouter } from "vue-router";
import BtnCancelar from "../../../components/BtnCancelar.vue";

const $q = useQuasar();
const router = useRouter();
const bajaStore = useBajaDocumentalStore();
const areaStore = useAreaStore();
const { areas } = storeToRefs(areaStore);
const { modal, encabezado, isEditar } = storeToRefs(bajaStore);
const areaResponsableSel = ref(null);
const loading = ref(false);

const onSubmit = async () => {
  loading.value = true;
  // Corte: el área responsable viene del selector (no del legado); la generadora y el enlace ya
  // están puestos por loadArea/loadEnlace (JWT) al abrir el modal.
  if (areaResponsableSel.value) {
    encabezado.value.area_Responsable_Id = areaResponsableSel.value.value;
    encabezado.value.area_Responsable = areaResponsableSel.value.label;
  }
  const resp = await bajaStore.createTransferencia(encabezado.value);
  loading.value = false;
  if (resp.success) {
    $q.notify({ type: "positive", message: resp.data });
    $q.dialog({
      title: "Registro generado con éxito",
      message: "¿Desea capturar el inventario a dar de Baja?",
      icon: "Information",
      persistent: true,
      transitionShow: "scale",
      transitionHide: "scale",
      ok: { color: "positive", label: "Si, capturar inventario" },
      cancel: { color: "negative", label: "No, capturar despues" },
    })
      .onOk(() => {
        const destino = isEditar.value == true ? encabezado.value.id : resp.id;
        router.push({ name: "cajasBajas", params: { bajaId: destino } });
      })
      .onCancel(() => {
        actualizarModal(false);
      });
  } else {
    $q.notify({ type: "negative", message: resp.data });
  }
};

const actualizarModal = () => {
  areaResponsableSel.value = null;
  bajaStore.actualizarModal(false);
};
</script>
