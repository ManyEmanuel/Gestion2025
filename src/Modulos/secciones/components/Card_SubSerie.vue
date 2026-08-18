<template>
  <div class="col-12 col-xs-6 col-md-4">
    <q-card flat bordered class>
      <q-card-section> Subseries </q-card-section>
      <q-card-section>
        <q-list bordered padding class="rounded-borders">
          <q-item
            v-for="subserie in subSeries"
            :key="subserie.id"
            clickable
            v-ripple
            :active="link === subserie.id"
            @click="activar(subserie.id)"
            active-class="my-menu-link"
          >
            <q-item-section
              >{{ subserie.subSerie_Compuesta }}.-
              {{ subserie.descripcion }}</q-item-section
            >
            <q-item-section top side>
              <div class="text-grey-8 q-gutter-md">
                <q-btn
                  round
                  color="amber-4"
                  icon="edit"
                  size="10px"
                  @click="editar(subserie.id)"
                aria-label="Editar" />
                <q-btn
                  v-if="modulo == null ? false : modulo.eliminar"
                  round
                  color="red-4"
                  icon="delete_outline"
                  size="10px"
                  @click="eliminar(subserie.id, subserie.descripcion)"
                aria-label="Eliminar" />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          v-if="modulo == null ? false : modulo.registrar"
          flat
          rounded
          class="text-purple-ieen-1"
          label="Nueva Subserie"
          icon="add_circle_outline"
          @click="actualizarModal(true)"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useSeriesStore } from "../../../stores/series_store";
import { useSubSerieStore } from "../../../stores/sub_series_store";
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../../../stores/auth_store";

const seriesStore = useSeriesStore();
const subSerieStore = useSubSerieStore();
const $q = useQuasar();
const authStore = useAuthStore();
const { modulo } = storeToRefs(authStore);
const { subSeries } = storeToRefs(subSerieStore);
const { serieId } = storeToRefs(seriesStore);

const link = ref(0);
const actualizarModal = (valor) => {
  subSerieStore.updateEditar(false);
  if (valor == true) {
    if (serieId.value == null) {
      $q.notify({
        type: "warning",
        message: "Seleccione una serie",
      });
    } else {
      subSerieStore.actualizarModal(valor);
    }
  } else {
    subSerieStore.actualizarModal(valor);
  }
};
const activar = async (id) => {
  link.value = id;
};
const editar = async (id) => {
  $q.loading.show();
  subSerieStore.updateEditar(true);
  await subSerieStore.loadSubSerie(id);
  $q.loading.hide();
  subSerieStore.actualizarModal(true);
};

const eliminar = async (id, nombre) => {
  $q.dialog({
    title: "Eliminar subserie",
    message: `¿Eliminar la subserie "${nombre}"?`,
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
    const resp = await subSerieStore.deleteSubserie(id);
    if (resp.success) {
      $q.loading.hide();
      await subSerieStore.loadSubSeries(serieId.value);
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