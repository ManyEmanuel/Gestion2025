import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import * as TodoQuasar from 'quasar'
import { Quasar, Screen, Loading, Notify, Dialog, BottomSheet } from 'quasar'
import { createPinia, setActivePinia } from 'pinia'
import MainLayout from 'layouts/MainLayout.vue'
import { useAuthStore } from 'src/stores/auth_store'
import { useAuthNuevoStore } from 'src/stores/auth_nuevo_store'

// Auditoría T-13. El plan decía literalmente: «empezar por el montaje del layout: habría atrapado UX-001
// y UX-002». Aquí está esa prueba.
//
// UX-002: el modelo del cajón arrancaba en `false` mientras `show-if-above` lo dejaba ABIERTO en
// escritorio. Modelo y estado visual nacían desfasados, así que el primer clic en «Menu» lo cerraba y ya
// no volvía a abrirse: el usuario perdía toda la navegación hasta recargar.
//
// UX-001: la cabecera del menú vive dentro de un QImg, que solo pinta su slot cuando la imagen terminó de
// cargar. Con el `lazy` por defecto nunca llegaba a pedirse y el saludo no aparecía NUNCA.

vi.mock('src/branding.js', () => ({ SYSTEM_NAME: 'Sistema de prueba', FOOTER_TEXT: 'Pie de prueba' }))

// En la aplicación real los componentes `q-*` los auto-importa el build de Quasar; en las pruebas hay que
// registrarlos a mano o el layout se monta lleno de componentes sin resolver.
const componentesQuasar = Object.fromEntries(
  Object.entries(TodoQuasar).filter(([nombre, valor]) =>
    /^Q[A-Z]/.test(nombre) && valor && (valor.render || valor.setup || valor.template))
)

const montar = (anchoPantalla) => {
  // `$q.screen.width` es lo que decide el estado inicial del cajón. El plugin de Quasar lo fija al
  // instalarse y en jsdom no vuelve a leer `window.innerWidth`, así que se asigna directamente sobre
  // `Screen`, que es reactivo y es exactamente el valor que consulta el componente.
  Screen.width = anchoPantalla

  return mount(MainLayout, {
    global: {
      // Los plugins que el layout usa ($q.loading en loadMenu, $q.bottomSheet en el menú de apps); sin
      // ellos el montaje deja errores sueltos de "reading 'show'".
      plugins: [[Quasar, { plugins: { Loading, Notify, Dialog, BottomSheet } }]],
      components: componentesQuasar,
      stubs: {
        'router-view': true,
        EssentialLink: true,
      },
      mocks: {
        $route: { query: {} },
      },
    },
  })
}

describe('MainLayout', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

    const authNuevo = useAuthNuevoStore()
    authNuevo.usuario = 'admin'
    authNuevo.perfilNombre = 'Super Administrador'

    const auth = useAuthStore()
    // El menú se arma desde `modulos`; sin permisos la lista queda vacía, que es suficiente para el
    // montaje. Se evita cualquier llamada de red.
    auth.modulos = []
    auth.apps = []
    vi.spyOn(auth, 'loadSistemas').mockResolvedValue(undefined)
    vi.spyOn(auth, 'loadModulos').mockResolvedValue({ success: true })
  })

  it('UX-002: en escritorio el cajón nace ABIERTO, en fase con show-if-above', () => {
    const wrapper = montar(1440)

    expect(wrapper.vm.leftDrawerOpen).toBe(true)
  })

  it('UX-002: en móvil el cajón nace cerrado', () => {
    const wrapper = montar(500)

    expect(wrapper.vm.leftDrawerOpen).toBe(false)
  })

  it('UX-002: el primer clic en «Menu» ALTERNA el cajón en vez de dejarlo inservible', async () => {
    const wrapper = montar(1440)

    await wrapper.find('button[aria-label="Menu"]').trigger('click')
    expect(wrapper.vm.leftDrawerOpen).toBe(false)

    await wrapper.find('button[aria-label="Menu"]').trigger('click')
    expect(wrapper.vm.leftDrawerOpen).toBe(true)
  })

  it('UX-001: la imagen de la cabecera se pide con carga anticipada', () => {
    const wrapper = montar(1440)

    const img = wrapper.find('.q-img img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('loading')).toBe('eager')
  })

  // Auditoría ARCH-001: el saludo salía de las claves `empleado`/`perfil` de localStorage, que solo
  // escribía el flujo SSO legado ya retirado — con él muerto, siempre estaban vacías. Ahora viene del
  // estado de sesión.
  //
  // Se comprueba sobre el estado del componente y no sobre el texto renderizado a propósito: ese bloque
  // vive DENTRO del QImg, que en jsdom nunca termina de cargar la imagen y por tanto no pinta su slot. Es
  // el mismo mecanismo de UX-001, y la prueba de arriba ya cubre que la imagen se pida con carga
  // anticipada, que es lo que en un navegador real hace que el bloque aparezca.
  it('la cabecera toma el usuario y el perfil de la sesión, no de localStorage', async () => {
    localStorage.setItem('empleado', 'NO DEBE USARSE')
    localStorage.setItem('perfil', 'NO DEBE USARSE')

    const wrapper = montar(1440)
    await flushPromises()

    expect(wrapper.vm.Empleado).toBe('admin')
    expect(wrapper.vm.Perfil).toBe('Super Administrador')
  })

  // Auditoría ARCH-001: el layout llamaba a `validarToken` contra `/Accesos/ValidaToken`, un endpoint que
  // el backend nuevo no tiene. Ya no existe siquiera como método del store.
  it('el store de autenticación ya no expone el camino del portal legado', () => {
    const auth = useAuthStore()

    expect(auth.validarToken).toBeUndefined()
  })
})
