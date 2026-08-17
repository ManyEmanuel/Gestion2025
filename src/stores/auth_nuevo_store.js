import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

// Login propio contra el backend nuevo (UniversoArchivo): POST /api/auth/login -> JWT.
// El token se guarda en localStorage['key'] para que el interceptor de axios lo adjunte.
export const useAuthNuevoStore = defineStore('AuthNuevoStore', {
  state: () => ({
    usuario: localStorage.getItem('usuario_nuevo') || null,
  }),

  getters: {
    autenticado: () => !!localStorage.getItem('key'),
  },

  actions: {
    async login(usuario, password) {
      try {
        const resp = await api.post('/auth/login', { usuario, password });
        const token = resp?.data?.accessToken;
        if (!token) {
          return { success: false, data: 'Respuesta inválida del servidor.' };
        }
        localStorage.setItem('key', token);
        localStorage.setItem('usuario_nuevo', usuario);
        this.usuario = usuario;
        // El backend avisa si el usuario entró con una contraseña temporal y debe cambiarla.
        return { success: true, debeCambiarPassword: !!resp?.data?.debeCambiarPassword };
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

    logout() {
      localStorage.removeItem('key');
      localStorage.removeItem('usuario_nuevo');
      this.usuario = null;
    },
  },
});
