<template>
  <div class="fullscreen flex flex-center bg-grey-2">
    <q-card flat bordered style="width: 360px; max-width: 90vw" class="q-pa-md">
      <q-card-section class="text-center">
        <h1 class="text-h6">{{ SYSTEM_NAME }}</h1>
        <div class="text-caption text-grey-7">{{ LOGIN_SUBTITLE }}</div>
      </q-card-section>

      <q-form @submit.prevent="onSubmit" class="q-gutter-md">
        <q-input
          v-model="usuario"
          label="Usuario"
          autofocus
          name="usuario"
          autocomplete="username"
          :rules="[(v) => !!v || 'Requerido']"
        />
        <q-input
          v-model="password"
          label="Contraseña"
          type="password"
          name="password"
          autocomplete="current-password"
          :rules="[(v) => !!v || 'Requerido']"
        />

        <div v-if="error" class="text-negative text-caption" role="alert" aria-live="assertive">{{ error }}</div>

        <q-btn
          type="submit"
          color="primary"
          class="full-width"
          label="Ingresar"
          :loading="cargando"
        />
      </q-form>
    </q-card>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthNuevoStore } from 'src/stores/auth_nuevo_store';
import { SYSTEM_NAME, LOGIN_SUBTITLE } from 'src/branding.js';

export default defineComponent({
  name: 'LoginNuevo',
  setup() {
    const router = useRouter();
    const authStore = useAuthNuevoStore();
    const usuario = ref('');
    const password = ref('');
    const error = ref('');
    const cargando = ref(false);

    async function onSubmit() {
      error.value = '';
      cargando.value = true;
      const r = await authStore.login(usuario.value, password.value);
      cargando.value = false;
      if (r.success) {
        // Entró con contraseña temporal -> forzar el cambio antes de usar el sistema.
        router.push(r.debeCambiarPassword ? '/cambiar-password' : '/');
      } else {
        error.value = r.data;
      }
    }

    return { usuario, password, error, cargando, onSubmit, SYSTEM_NAME, LOGIN_SUBTITLE };
  },
});
</script>
