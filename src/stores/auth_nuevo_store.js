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
        return { success: true };
      } catch (e) {
        const detail = e?.response?.data?.detail || 'Usuario o contraseña incorrectos.';
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
