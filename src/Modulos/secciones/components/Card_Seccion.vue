<template>
  <div class="col-12 col-xs-6 col-md-4">
    <q-card flat bordered>
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="c" label="Comúnes" @click="limpiar_Series_subseries" />
        <q-tab name="s" label="Sustantivas" @click="limpiar_Series_subseries" />
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="c">
          <q-list bordered padding class="rounded-borders">
            <q-item
              v-for="seccion in seccionStore.seccionesC"
              :key="seccion.id"
              clickable
              v-ripple
              :active="link === seccion.id"
              @click="activar(seccion.id)"
              active-class="my-menu-link"
            >
              <q-item-section
                >{{ seccion.compuesto }}.-
                {{ seccion.descripcion }}</q-item-section
              >
              <q-item-section top side>
                <div class="text-grey-8 q-gutter-md">
                  <q-btn
                    v-if="modulo == null ? false : modulo.actualizar"
                    round
                    color="amber-4"
                    icon="edit"
                    size="10px"
                    @click="editar(seccion.id)"
                  aria-label="Editar" />
                  <q-btn
                    v-if="modulo == null ? false : modulo.eliminar"
                    round
                    color="red-4"
                    icon="delete_outline"
                    size="10px"
                    @click="eliminar(seccion.id, seccion.descripcion)"
                  aria-label="Eliminar" />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-tab-panel>
        <q-tab-panel name="s">
          <q-list bordered padding class="rounded-borders">
            <q-item
              v-for="seccion in seccionStore.seccionesS"
              :key="seccion.id"
              clickable
              v-ripple
              :active="link === seccion.id"
              @click="activar(seccion.id)"
              active-class="my-menu-link"
            >
              <q-item-section
                >{{ seccion.compuesto }}.-
                {{ seccion.descripcion }}</q-item-section
              >
              <q-item-section top side>
                <div class="text-grey-8 q-gutter-md">
                  <q-btn
                    v-if="modulo == null ? false : modulo.actualizar"
                    round
                    color="amber-4"
                    icon="edit"
                    size="10px"
                    @click="editar(seccion.id)"
                  aria-label="Editar" />
                  <q-btn
                    v-if="modulo == null ? false : modulo.eliminar"
                    round
                    color="red-4"
                    icon="delete_outline"
                    size="10px"
                    @click="eliminar(seccion.id, seccion.descripcion)"
                  aria-label="Eliminar" />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-tab-panel>
      </q-tab-panels>
      <q-card-section> </q-card-section>
      <q-card-actions align="right">
        <q-btn
          v-if="modulo == null ? false : modulo.registrar"
          flat
          rounded
          class="text-purple-ieen-1"
          label="Nueva sección"
          icon="add_circle_outline"
          @click="actualizarModal(true)"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { onMounted } from "vue";
import { useSeccionStore } from "../../../stores/secciones_store";
import { useSeriesStore } from "../../../stores/series_store";
import { useSubSerieStore } from "../../../stores/sub_series_store";
import { useQuasar } from "quasar";
import { useAuthStore } from "../../../stores/auth_store";
import { storeToRefs } from "pinia";

const seccionStore = useSeccionStore();
const seriesStore = useSeriesStore();
const subSerieStore = useSubSerieStore();
const $q = useQuasar();
const authStore = useAuthStore();
const { modulo } = storeToRefs(authStore);
const tab = ref("c");
onMounted(async () => {
  await seccionStore.loadSecciones();
});

const link = ref(0);
const actualizarModal = (valor) => {
  seccionStore.actualizarModal(valor);
  seccionStore.updateEditar(false);
};

const limpiar_Series_subseries = () => {
  seriesStore.initSeries();
  subSerieStore.initSubSeries();
};

const activar = async (id) => {
  link.value = id;
  const respSerie = await seriesStore.loadSeries(id);
  subSerieStore.initSubSeries();
  seccionStore.setSeccionId(id);
  if (respSerie.success === false) {
    $q.notify({
      type: "negative",
      message: respSerie.data,
    });
  }
};
const editar = async (id) => {
  $q.loading.show();
  seccionStore.updateEditar(true);
  await seccionStore.loadSeccion(id);
  $q.loading.hide();
  seccionStore.actualizarModal(true);
};

const eliminar = async (id, nombre) => {
  $q.dialog({
    title: "Eliminar sección",
    message: `¿Eliminar la sección "${nombre}"?`,
    persistent: true,
    ok: {
      color: "negative",
      label: "Eliminar",
    },
    cancel: {
      color: "grey",
      label: "Cancelar",
    },
  }).onOk(async () => {
    $q.loading.show();
    const resp = await seccionStore.deleteSeccion(id);
    if (resp.success) {
      $q.loading.hide();
      $q.notify({
        type: "positive",
        message: resp.data,
      });
    } else {
      $q.loading.hide();
      $q.notify({
        type: "negative",
        message: resp.data,
      });
    }
  });
};
</script>

<style lang="scss">
.my-menu-link {
  color: white;
  background: #bb83ca;
}
</style>
