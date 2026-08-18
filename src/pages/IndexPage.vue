<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-md">
      <div>
        <div class="text-h6 text-purple-ieen">
          Bienvenido{{ generoSufijo }}{{ nombreCorto ? ", " + nombreCorto : "" }}
        </div>
        <div class="text-caption text-grey-7" v-if="perfil">{{ perfil }}</div>
      </div>
      <q-space />
      <div class="text-caption text-grey-7">{{ fechaHoy }}</div>
    </div>

    <div v-if="secciones.length === 0" class="q-pa-lg text-center text-grey-7">
      <q-icon name="lock" size="40px" class="q-mb-sm" />
      <div>Aún no tienes módulos asignados en el sistema.</div>
      <div class="text-caption">
        Si crees que esto es un error, contacta a tu administrador.
      </div>
    </div>

    <template v-else>
      <div v-for="seccion in secciones" :key="seccion.titulo" class="q-mb-lg">
        <div class="text-subtitle2 text-grey-8 q-mb-sm">{{ seccion.titulo }}</div>
        <div class="row q-col-gutter-md">
          <div
            v-for="acceso in seccion.accesos"
            :key="acceso.siglas"
            class="col-6 col-sm-4 col-md-3"
          >
            <q-card flat bordered class="acceso-directo" @click="ir(acceso.link)">
              <q-card-section class="column items-center text-center q-gutter-xs">
                <q-icon :name="acceso.icon" size="28px" color="purple-ieen" />
                <div class="text-body2">{{ acceso.title }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../stores/auth_store";

// Mismo mapa siglas → acceso que arma el menú lateral (MainLayout.vue); se repite aquí a propósito
// porque MainLayout no expone sus refs para reutilizar y esto es solo texto/rutas, no lógica de negocio.
const MAPA_ACCESOS = {
  "AI-CAT-ENLACE": { grupo: "Catálogos", title: "Enlaces", icon: "group", link: { name: "enlaces" } },
  "AI-CAT-VOBO": { grupo: "Catálogos", title: "Visto bueno", icon: "group", link: { name: "voBo" } },
  "AI-CAT-SECCIONES": { grupo: "Catálogos", title: "Secciones", icon: "menu_book", link: { name: "secciones" } },
  "AI-CAT-DISP-DOC": { grupo: "Catálogos", title: "Disp. Documental", icon: "menu_book", link: { name: "dispDoc" } },
  "AI-INV-AREA": { grupo: "Archivo en trámite", title: "Inv. Gral. por expediente", icon: "assignment", link: { name: "inventarioGeneral" } },
  "AI-INV-AREA-GRAL": { grupo: "Archivo en trámite", title: "Inv. Gral. por expediente areas", icon: "assignment", link: { name: "inventarioGeneralAreas" } },
  "AI-TP": { grupo: "Archivo en trámite", title: "Transferencias primarias", icon: "move_down", link: { name: "transferenciasPrimarias" } },
  "AI-PRESTAMOS": { grupo: "Préstamos", title: "Préstamos Archivo en Trámite", icon: "sync", link: { name: "cedulasPrestamo" } },
  "AI-PRESTAMOS-CLASI": { grupo: "Préstamos", title: "Ced. Préstamos clasificados", icon: "sync_lock", link: { name: "cedulasPrestamoClasificados" } },
  "AI-PRESTAMOS-AI": { grupo: "Préstamos", title: "Préstamos archivo institucional", icon: "sync", link: { name: "prestamoAI" } },
  "AI-PRESTAMOS-AI-AI": { grupo: "Préstamos", title: "Solicitudes préstamos archivo institucional", icon: "sync", link: { name: "prestamoAIAI" } },
  "AI-TS": { grupo: "Archivo en Concentración", title: "Transferencias secundarias", icon: "move_down", link: { name: "transferenciasSecundarias" } },
  "AI-TP-AI": { grupo: "Archivo en Concentración", title: "Transferencias primarias AI", icon: "low_priority", link: { name: "transferenciasPrimariasAI" } },
  "AI-INV-AREA-AI": { grupo: "Archivo en Concentración", title: "Inventario AI", icon: "inventory", link: { name: "inventarioAI" } },
  "AI-BD": { grupo: "Archivo en Concentración", title: "Baja documental", icon: "folder_delete", link: { name: "bajaDocumental" } },
  "AI-AVISOS": { grupo: "Archivo en Concentración", title: "Avisos al Archivo General", icon: "notification_important", link: { name: "avisos" } },
  "AI-PADA": { grupo: "Cumplimiento", title: "PADA e informe anual", icon: "event_note", link: { name: "pada" } },
  "AI-GRUPO": { grupo: "Cumplimiento", title: "Grupo interdisciplinario", icon: "groups", link: { name: "grupoInterdisciplinario" } },
  "AI-PRESERVACION": { grupo: "Cumplimiento", title: "Preservación digital", icon: "shield", link: { name: "preservacion" } },
  "AI-INTEROP": { grupo: "Cumplimiento", title: "Interoperabilidad / Exportar", icon: "cloud_download", link: { name: "interoperabilidad" } },
  "AI-ADMIN-AREAS": { grupo: "Administración", title: "Áreas", icon: "account_tree", link: { name: "administracionAreas" } },
  "AI-ADMIN-EMPLEADOS": { grupo: "Administración", title: "Empleados", icon: "badge", link: { name: "administracionEmpleados" } },
  "AI-ADMIN-USUARIOS": { grupo: "Administración", title: "Usuarios", icon: "manage_accounts", link: { name: "administracionUsuarios" } },
  "AI-ADMIN-PERFILES": { grupo: "Administración", title: "Perfiles", icon: "security", link: { name: "administracionPerfiles" } },
};
const ORDEN_GRUPOS = [
  "Catálogos",
  "Archivo en trámite",
  "Préstamos",
  "Archivo en Concentración",
  "Cumplimiento",
  "Administración",
];

const router = useRouter();
const authStore = useAuthStore();
const { modulos } = storeToRefs(authStore);

const nombreCorto = computed(() => {
  // "empleado" viene del flujo SSO legado (ya no se usa); el login propio actual solo guarda
  // "usuario_nuevo" (auth_nuevo_store.js), que es lo que realmente hay disponible hoy.
  const empleado = localStorage.getItem("empleado");
  if (empleado) return empleado.split(" ")[0];
  return localStorage.getItem("usuario_nuevo") || "";
});
const perfil = computed(() => localStorage.getItem("perfil") || "");
// "Bienvenido"/"Bienvenida" no se puede inferir del nombre (evitar suponer género); se usa la forma
// neutra con paréntesis, igual que ya hace el resto de la app ("Bienvenido(a)").
const generoSufijo = "(a)";
const fechaHoy = new Intl.DateTimeFormat("es-MX", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date());

const secciones = computed(() => {
  const porGrupo = {};
  for (const m of modulos.value) {
    const acceso = MAPA_ACCESOS[m.siglas_Modulo];
    if (!acceso) continue;
    if (!porGrupo[acceso.grupo]) porGrupo[acceso.grupo] = [];
    porGrupo[acceso.grupo].push({ ...acceso, siglas: m.siglas_Modulo });
  }
  return ORDEN_GRUPOS.filter((g) => porGrupo[g]?.length).map((g) => ({
    titulo: g,
    accesos: porGrupo[g],
  }));
});

const ir = (link) => router.push(link);
</script>

<style scoped>
.acceso-directo {
  cursor: pointer;
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}
.acceso-directo:hover {
  box-shadow: 0 2px 10px rgba(103, 62, 132, 0.25);
  transform: translateY(-2px);
}
</style>
