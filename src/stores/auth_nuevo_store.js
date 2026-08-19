import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

// Login propio contra el backend nuevo (UniversoArchivo): POST /api/auth/login.
// Horizonte-1 #F7: el JWT ya NO se guarda en localStorage -- el backend lo fija como cookie httpOnly
// (invisible a JS, mitiga robo de token por XSS). Como el navegador ya no puede decodificar el JWT para
// leer permisos/área/empleado, esos datos se obtienen de GET /api/auth/me tras el login (y al arrancar
// la app si había una sesión activa) y se guardan aquí, en memoria (estado de Pinia).
// `sesion_activa` en localStorage NO es el token -- es solo un indicador no sensible ("la última vez que
// se consultó /me, había sesión") para que el guard de rutas decida síncronamente si debe intentar
// cargar /me antes de renderizar; la autorización real la sigue haciendo el backend en cada petición.
export const useAuthNuevoStore = defineStore('AuthNuevoStore', {
  state: () => ({
    usuario: localStorage.getItem('usuario_nuevo') || null,
    areaId: null,
    empleadoId: null,
    permisos: [],
    esAmbitoGlobal: false,
    perfilNombre: null,
    cargado: false,
  }),

  getters: {
    autenticado: (state) => state.cargado,
  },

  actions: {
    // Consulta quién es el usuario de la cookie actual. Se llama tras login y al arrancar la app
    // (si `sesion_activa` sugiere que podría haber una sesión vigente).
    async cargarUsuarioActual() {
      try {
        const resp = await api.get('/auth/me');
        const d = resp.data || {};
        this.usuario = d.userName || null;
        this.areaId = d.areaId || null;
        this.empleadoId = d.empleadoId || null;
        this.permisos = Array.isArray(d.permisos) ? d.permisos : [];
        this.esAmbitoGlobal = !!d.esAmbitoGlobal;
        this.perfilNombre = d.perfilNombre || null;
        this.cargado = true;
        if (this.usuario) localStorage.setItem('usuario_nuevo', this.usuario);
        localStorage.setItem('sesion_activa', '1');
        return { success: true };
      } catch (e) {
        this.cargado = false;
        localStorage.removeItem('sesion_activa');
        return { success: false, data: e };
      }
    },

    async login(usuario, password) {
      try {
        const resp = await api.post('/auth/login', { usuario, password });
        if (!resp?.data) {
          return { success: false, data: 'Respuesta inválida del servidor.' };
        }
        const debeCambiarPassword = !!resp.data.debeCambiarPassword;
        await this.cargarUsuarioActual();
        return { success: true, debeCambiarPassword };
      } catch (e) {
        const detail = e?.response?.data?.detail || 'Usuario o contraseña incorrectos.';
        return { success: false, data: detail };
      }
    },

    // Cambio de contraseña propio (self-service). Tras el alta/reset con contraseña temporal, el
    // usuario debe cambiarla antes de usar el sistema. POST /api/usuarios/cambiar-password (204).
    async cambiarPassword(passwordActual, passwordNueva) {
      try {
        const resp = await api.post('/usuarios/cambiar-password', { passwordActual, passwordNueva });
        if (resp.status === 204 || resp.status === 200) {
          return { success: true, data: 'Contraseña actualizada' };
        }
        return { success: false, data: 'Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte' };
      } catch (e) {
        const detail = (e?.response?.data?.detail || e?.response?.data?.title) || 'No se pudo cambiar la contraseña.';
        return { success: false, data: detail };
      }
    },

    async logout() {
      // Limpia el estado local PRIMERO (síncrono): algunos llamadores hacen `authStore.logout()` seguido
      // de `router.push('/login')` sin esperar la promesa -- si `cargado` siguiera true hasta que
      // resuelva la llamada al backend, el guard de rutas rebotaría el login de vuelta a '/'.
      localStorage.removeItem('sesion_activa');
      localStorage.removeItem('usuario_nuevo');
      this.usuario = null;
      this.areaId = null;
      this.empleadoId = null;
      this.permisos = [];
      this.esAmbitoGlobal = false;
      this.perfilNombre = null;
      this.cargado = false;
      try {
        await api.post('/auth/logout');
      } catch (e) {
        console.error(e); // la cookie puede haber expirado ya; el estado local ya quedó limpio de todos modos
      }
    },
  },
});
