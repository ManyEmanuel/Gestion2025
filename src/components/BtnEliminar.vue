<template>
  <q-btn flat round color="negative" icon="delete" @click="confirmar"
  :aria-label="label"
>
    <q-tooltip>{{ label }}</q-tooltip>
  </q-btn>
</template>

<script setup>
import { useQuasar } from "quasar";

const props = defineProps({
  // Texto del botón/tooltip y del botón "Ok" del diálogo, p.ej. "Eliminar" o "Eliminar área".
  label: { type: String, default: "Eliminar" },
  titulo: { type: String, default: "Eliminar registro" },
  // Pregunta ya interpolada con el dato real (p.ej. `¿Eliminar el área "${row.nombre}"?`);
  // el componente no adivina el nombre del elemento, lo decide quien lo usa.
  mensaje: { type: String, required: true },
});

const emit = defineEmits(["confirmado"]);
const $q = useQuasar();

const confirmar = () => {
  $q.dialog({
    title: props.titulo,
    message: props.mensaje,
    cancel: { label: "Cancelar", color: "grey" },
    ok: { label: props.label, color: "negative" },
    persistent: true,
  }).onOk(() => emit("confirmado"));
};
</script>
