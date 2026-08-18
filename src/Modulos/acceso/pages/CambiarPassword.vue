<template>
  <div class="fullscreen flex flex-center bg-grey-2">
    <q-card flat bordered style="width: 380px; max-width: 90vw" class="q-pa-md">
      <q-card-section class="text-center">
        <h1 class="text-h6">Cambiar contraseña</h1>
        <div class="text-caption text-grey-7">
          Ingresaste con una contraseña temporal. Define una nueva para continuar.
        </div>
      </q-card-section>

      <q-form @submit.prevent="onSubmit" class="q-gutter-md">
        <q-input
          v-model="actual"
          label="Contraseña temporal"
          type="password"
          autocomplete="current-password"
          :rules="[(v) => !!v || 'Requerido']"
        />
        <q-input
          v-model="nueva"
          label="Nueva contraseña"
          type="password"
          autocomplete="new-password"
          :rules="[
            (v) => !!v || 'Requerido',
            (v) => (v && v.length >= 6) || 'Mínimo 6 caracteres',
          ]"
        />
        <q-input
          v-model="confirmar"
          label="Confirmar nueva contraseña"
          type="password"
          autocomplete="new-password"
          :rules="[(v) => v === nueva || 'No coincide']"
        />

        <div v-if="error" class="text-negative text-caption" role="alert" aria-live="assertive">{{ error }}</div>

        <q-btn
          type="submit"
          color="primary"
          class="full-width"
          label="Guardar y continuar"
          :loading="cargando"
        />
        <BtnCancelar class="full-width" @click="cancelar" />
      </q-form>
    </q-card>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useAuthNuevoStore } from "src/stores/auth_nuevo_store";
import BtnCancelar from "src/components/BtnCancelar.vue";

export default defineComponent({
  name: "CambiarPassword",
  components: { BtnCancelar },
  setup() {
    const router = useRouter();
    const $q = useQuasar();
    const authStore = useAuthNuevoStore();
    const actual = ref("");
    const nueva = ref("");
    const confirmar = ref("");
    const error = ref("");
    const cargando = ref(false);

    async function onSubmit() {
      error.value = "";
      if (nueva.value !== confirmar.value) {
        error.value = "La confirmación no coincide.";
        return;
      }
      cargando.value = true;
      const r = await authStore.cambiarPassword(actual.value, nueva.value);
      cargando.value = false;
      if (r.success) {
        $q.notify({ type: "positive", message: "Contraseña actualizada." });
        router.push("/");
      } else {
        error.value = r.data;
      }
    }

    function cancelar() {
      // Sin cambiar la contraseña no puede entrar: cierra sesión y vuelve al login.
      authStore.logout();
      router.push({ name: "login" });
    }

    return { actual, nueva, confirmar, error, cargando, onSubmit, cancelar };
  },
});
</script>
