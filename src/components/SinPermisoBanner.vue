<template>
  <q-banner rounded class="bg-orange-2 text-orange-10 q-pa-md">
    <template v-slot:avatar>
      <q-icon name="lock" color="orange-9" />
    </template>
    No tiene permiso para ver <strong>&quot;{{ modulo }}&quot;</strong>. Contacte a su
    administrador si considera que es un error.
  </q-banner>
</template>

<script setup>
defineProps({
  modulo: { type: String, required: true },
});
</script>
