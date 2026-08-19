<template>
  <q-dialog
    v-model="modal"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card flat bordered style="width: 800px; max-width: 80vw">
      <q-card-section class="row">
        <h2 class="text-h6">Inventario general por expediente</h2>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup aria-label="Cerrar" />
      </q-card-section>
      <q-card-section>
        <q-form class="row q-col-gutter-xs" @submit="onSubmit">
          <div class="col-12 col-xs-6 col-md-4">
            <q-input v-model="inventario.seccion" label="Sección" readonly />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input v-model="inventario.serie" label="Serie" readonly />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input v-model="inventario.sub_Serie" label="Subserie" readonly />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="inventario.nombre_Expediente"
              label="Nombre del expediente"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="inventario.clave_Clasificacion"
              label="Clave de clasificación"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="inventario.no_Expediente_Interno"
              label="Clave de clasificación"
              readonly
            />
          </div>
          <div class="col-12 col-xs-12 col-md-12">
            <q-input
              v-model="inventario.descripcion"
              label="Descripción"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              stack-label
              v-model="inventario.fecha_Inicio"
              type="date"
              label="Fecha inicio"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              stack-label
              v-model="inventario.fecha_Termino"
              type="date"
              label="Fecha termino"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="inventario.ubicacion_AI"
              label="Ubicación"
              hint="Ingrese la ubicación "
              autofocus
              lazy-rules
              :rules="[(val) => !!val || 'La ubicación es requerida']"
            />
          </div>
          <!-- Horizonte-2 #ES-16: catálogo estructurado, adicional al texto libre de arriba (no lo
          reemplaza). Cada nivel es opcional -- se puede guardar en cualquier nivel de profundidad. -->
          <div class="col-12">
            <div class="text-caption text-grey-7 q-mb-xs">Ubicación física estructurada (opcional)</div>
          </div>
          <div class="col-12 col-xs-6 col-md-3">
            <q-select
              v-model="edificioSel"
              :options="opcionesEdificio"
              option-label="nombre"
              option-value="id"
              label="Edificio"
              clearable
              emit-value
              map-options
              @update:model-value="onCambioEdificio"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-3">
            <q-select
              v-model="almacenSel"
              :options="opcionesAlmacen"
              option-label="nombre"
              option-value="id"
              label="Almacén"
              clearable
              emit-value
              map-options
              :disable="!edificioSel"
              @update:model-value="onCambioAlmacen"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-3">
            <q-select
              v-model="estanteSel"
              :options="opcionesEstante"
              option-label="nombre"
              option-value="id"
              label="Estante"
              clearable
              emit-value
              map-options
              :disable="!almacenSel"
              @update:model-value="onCambioEstante"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-3">
            <q-select
              v-model="anaquelSel"
              :options="opcionesAnaquel"
              option-label="nombre"
              option-value="id"
              label="Anaquel"
              clearable
              emit-value
              map-options
              :disable="!estanteSel"
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="inventario.valor_Documental"
              label="Valor documental"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="inventario.vigencia_Tramite"
              label="Vigencia archivo tramite"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="inventario.vigencia_Concentracion"
              label="Vigencia concentración"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              v-model="inventario.disposicion_Documental"
              label="Destino final"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              stack-label
              v-model="inventario.fecha_Clasificacion"
              type="date"
              label="Fecha clasificación"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              stack-label
              v-model="inventario.fecha_Desclasificacion"
              type="date"
              label="Fecha desclasificación"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-input
              stack-label
              v-model="inventario.fecha_Ampliacion"
              type="date"
              label="Fecha ampliación"
              readonly
            />
          </div>
          <div class="col-12 col-xs-6 col-md-4">
            <q-checkbox
              label="Clasificado"
              v-model="inventario.clasificado"
              disable
            />
          </div>
        </q-form>
      </q-card-section>
      <q-card-section>
        <div class="col-12 justify-end">
          <div class="text-right q-gutter-xs">
            <BtnCancelar @click="actualizarModal(false)" />
            <q-btn
              :loading="loading"
              type="button"
              color="secondary"
              label="Guardar ubicación"
              icon="save"
              @click="onSubmit"
            >
              <template v-slot:loading>
                <q-spinner-hourglass class="on-left" />
                Cargando...
              </template>
            </q-btn>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { ref, computed, watch } from "vue";
import { useInventarioAreaAIStore } from "../../../stores/inventario_area_ai_store";
import { useUbicacionesFisicasStore } from "../../../stores/ubicaciones_fisicas_store";
import BtnCancelar from "../../../components/BtnCancelar.vue";

const $q = useQuasar();
const inventarioStore = useInventarioAreaAIStore();
const ubicacionesStore = useUbicacionesFisicasStore();
const { modal, isEditar, inventario } = storeToRefs(inventarioStore);
const { arbol } = storeToRefs(ubicacionesStore);
const loading = ref(false);

// Horizonte-2 #ES-16: catálogo estructurado, cascada Edificio > Almacén > Estante > Anaquel.
const edificioSel = ref(null);
const almacenSel = ref(null);
const estanteSel = ref(null);
const anaquelSel = ref(null);

const soloActivas = (lista) => (lista || []).filter((n) => n.activa);
const nodoPorId = (lista, id) => (lista || []).find((n) => n.id === id) || null;

// Cada nivel deriva sus opciones de los hijos del nodo seleccionado en el nivel anterior (encadenado,
// no una búsqueda plana sobre todo el árbol -- así un mismo id de Almacén en dos Edificios distintos no
// mezcla sus Estantes).
const opcionesEdificio = computed(() => soloActivas(arbol.value));
const nodoEdificio = computed(() => nodoPorId(arbol.value, edificioSel.value));
const opcionesAlmacen = computed(() => soloActivas(nodoEdificio.value?.hijos));
const nodoAlmacen = computed(() => nodoPorId(nodoEdificio.value?.hijos, almacenSel.value));
const opcionesEstante = computed(() => soloActivas(nodoAlmacen.value?.hijos));
const nodoEstante = computed(() => nodoPorId(nodoAlmacen.value?.hijos, estanteSel.value));
const opcionesAnaquel = computed(() => soloActivas(nodoEstante.value?.hijos));

const onCambioEdificio = () => {
  almacenSel.value = null;
  estanteSel.value = null;
  anaquelSel.value = null;
};
const onCambioAlmacen = () => {
  estanteSel.value = null;
  anaquelSel.value = null;
};
const onCambioEstante = () => {
  anaquelSel.value = null;
};

/** Busca el camino (lista de nodos, raíz primero) hasta el nodo con el id dado. */
const buscarCamino = (nodos, id, camino = []) => {
  for (const n of nodos || []) {
    const nuevoCamino = [...camino, n];
    if (n.id === id) return nuevoCamino;
    const encontrado = buscarCamino(n.hijos, id, nuevoCamino);
    if (encontrado) return encontrado;
  }
  return null;
};

const precargarSeleccion = () => {
  edificioSel.value = null;
  almacenSel.value = null;
  estanteSel.value = null;
  anaquelSel.value = null;
  if (!inventario.value.ubicacion_Fisica_Id) return;
  const camino = buscarCamino(arbol.value, inventario.value.ubicacion_Fisica_Id);
  if (!camino) return;
  for (const nodo of camino) {
    if (nodo.nivel === "Edificio") edificioSel.value = nodo.id;
    else if (nodo.nivel === "Almacen") almacenSel.value = nodo.id;
    else if (nodo.nivel === "Estante") estanteSel.value = nodo.id;
    else if (nodo.nivel === "Anaquel") anaquelSel.value = nodo.id;
  }
};

watch(modal, async (abierto) => {
  if (!abierto) return;
  if (arbol.value.length === 0) {
    await ubicacionesStore.loadArbol();
  }
  precargarSeleccion();
});

const actualizarModal = () => {
  inventarioStore.initInventario();
  inventarioStore.actualizarModal(false);
};

const onSubmit = async () => {
  loading.value = true;
  const resp = await inventarioStore.updateUbicacion(
    inventario.value.id,
    inventario.value.ubicacion_AI
  );
  if (!resp.success) {
    $q.notify({ type: "negative", message: resp.data });
    loading.value = false;
    return;
  }

  // Ubicación estructurada: el nivel más profundo elegido es el que se guarda (un nodo intermedio,
  // p.ej. solo hasta Estante, es válido -- no es obligatorio llegar a Anaquel).
  const ubicacionFisicaId = anaquelSel.value || estanteSel.value || almacenSel.value || edificioSel.value || null;
  const respFisica = await inventarioStore.updateUbicacionFisica(inventario.value.id, ubicacionFisicaId);
  loading.value = false;
  if (respFisica.success) {
    $q.notify({ type: "positive", message: resp.data });
    inventarioStore.actualizarModal(false);
  } else {
    $q.notify({
      type: "warning",
      message: "La ubicación se guardó, pero la ubicación física estructurada no pudo actualizarse: " + respFisica.data,
    });
  }
};
</script>
