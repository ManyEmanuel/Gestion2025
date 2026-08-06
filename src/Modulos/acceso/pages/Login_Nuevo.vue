<template>
  <div class="fullscreen flex flex-center bg-grey-2">
    <q-card style="width: 360px; max-width: 90vw" class="q-pa-md">
      <q-card-section class="text-center">
        <div class="text-h6">Gestión Documental</div>
        <div class="text-caption text-grey-7">Archivo — acceso al sistema</div>
      </q-card-section>

      <q-form @submit.prevent="onSubmit" class="q-gutter-md">
        <q-input
          v-model="usuario"
          label="Usuario"
          autofocus
          :rules="[(v) => !!v || 'Requerido']"
        />
        <q-input
          v-model="password"
          label="Contraseña"
          type="password"
          :rules="[(v) => !!v || 'Requerido']"
        />

        <div v-if="error" class="text-negative text-caption">{{ error }}</div>

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
        router.push('/');
      } else {
        error.value = r.data;
      }
    }

    return { usuario, password, error, cargando, onSubmit };
  },
});
</script>
