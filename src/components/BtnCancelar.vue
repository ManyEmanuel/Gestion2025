<template>
  <q-btn flat :label="label" v-close-popup />
</template>

<script setup>
defineProps({
  label: { type: String, default: "Cancelar" },
});
</script>
