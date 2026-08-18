<template>
  <div class="col-12 col-xs-6 col-md-4">
    <q-card flat bordered class>
      <q-card-section> Series </q-card-section>
      <q-card-section>
        <q-list bordered padding class="rounded-borders">
          <q-item
            v-for="serie in series"
            :key="serie.id"
            clickable
            v-ripple
            :active="link === serie.id"
            @click="activar(serie.id)"
            active-class="my-menu-link"
          >
            <q-item-section
              >{{ serie.serie_Compuestsa }}.-
              {{ serie.descripcion }}</q-item-section
            >
            <q-item-section top side>
              <div class="text-grey-8 q-gutter-md">
                <q-btn
                  v-if="modulo == null ? false : modulo.actualizar"
                  round
                  color="amber-4"
                  icon="edit"
                  size="10px"
                  @click="editar(serie.id)"
                />
                <q-btn
                  v-if="modulo == null ? false : modulo.eliminar"
                  round
                  color="red-4"
                  icon="delete_outline"
                  size="10px"
                  @click="eliminar(serie.id, serie.descripcion)"
                />
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
          label="Nueva serie"
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
import { useSeriesStore } from "../../../stores/series_store";
import { useSeccionStore } from "../../../stores/secciones_store";
import { useSubSerieStore } from "../../../stores/sub_series_store";
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../../../stores/auth_store";

const seriesStore = useSeriesStore();
const seccionStore = useSeccionStore();
const subSerieStore = useSubSerieStore();
const $q = useQuasar();
const authStore = useAuthStore();
const { modulo } = storeToRefs(authStore);
const { series } = storeToRefs(seriesStore);
const { seccionId } = storeToRefs(seccionStore);

const link = ref(0);
const actualizarModal = (valor) => {
  seriesStore.updateEditar(false);
  if (valor == true) {
    if (seccionId.value == null) {
      $q.notify({
        type: "warning",
        message: "Seleccione una sección",
      });
    } else {
      seriesStore.actualizarModal(valor);
    }
  }
};
const activar = async (id) => {
  link.value = id;
  seriesStore.setSerieId(id);
  const respSerie = await subSerieStore.loadSubSeries(id);
  if (respSerie.success === false) {
    $q.notify({
      type: "negative",
      message: respSerie.data,
    });
  }
};
const editar = async (id) => {
  $q.loading.show();
  seriesStore.updateEditar(true);
  await seriesStore.loadSerie(id);
  $q.loading.hide();
  seriesStore.actualizarModal(true);
};

const eliminar = async (id, nombre) => {
  $q.dialog({
    title: "Eliminar serie",
    message: `¿Eliminar la serie "${nombre}"?`,
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
    const resp = await seriesStore.deleteSerie(id);
    if (resp.success) {
      $q.loading.hide();
      await seriesStore.loadSeries(seccionId.value);
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