import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from 'src/stores/auth_store'
import { useAuthNuevoStore } from 'src/stores/auth_nuevo_store'
import routes from 'src/router/routes'

// Auditoría T-13 + UX-003 (P1-6). La guardia del router decide con `puedeVerModulo(siglas)` y las siglas
// que cada ruta declara en `meta.siglas`. Aquí se comprueban las dos mitades de esa decisión sin levantar
// el router entero: la regla de permisos y el cableado de las rutas.

const rutasDeModulo = () => {
  const hijas = routes.find((r) => r.path === '/')?.children ?? []
  return hijas.filter((r) => r.name && r.meta?.siglas)
}

const todasLasHijasConNombre = () => {
  const hijas = routes.find((r) => r.path === '/')?.children ?? []
  // La portada (`path: ''`) no tiene nombre ni sigla: es accesible a cualquier autenticado.
  return hijas.filter((r) => r.name)
}

describe('permisos por ruta', () => {
  beforeEach(() => setActivePinia(createPinia()))

  const conPermisos = (permisos) => {
    useAuthNuevoStore().permisos = permisos
    return useAuthStore()
  }

  it('cada ruta de módulo declara su sigla', () => {
    const sinSigla = todasLasHijasConNombre()
      .filter((r) => !r.meta?.siglas)
      .map((r) => r.name)

    expect(sinSigla).toEqual([])
  })

  it('todas las siglas de las rutas están mapeadas a un grupo de permiso', () => {
    // Una sigla no mapeada devuelve false para TODO el mundo: la pantalla quedaría inaccesible en
    // silencio, incluso para un administrador. `puedeVerModulo` lo avisa por consola; aquí ese aviso se
    // convierte en un fallo de la serie.
    const avisos = []
    const original = console.warn
    console.warn = (...args) => avisos.push(args.join(' '))
    try {
      const auth = conPermisos([])
      for (const ruta of rutasDeModulo()) {
        auth.puedeVerModulo(ruta.meta.siglas)
      }
    } finally {
      console.warn = original
    }

    expect(avisos).toEqual([])
  })

  it('concede el acceso con cualquier permiso del grupo, no solo con .ver', () => {
    // Interoperabilidad no tiene `.ver`: su único permiso es `.exportar`. Si la regla exigiera `.ver`,
    // esa pantalla sería inalcanzable para todo el mundo.
    const auth = conPermisos(['archivo.interoperabilidad.exportar'])

    expect(auth.puedeVerModulo('AI-INTEROP')).toBe(true)
  })

  it('niega el acceso sin ningún permiso del grupo', () => {
    const auth = conPermisos(['archivo.inventario.ver'])

    expect(auth.puedeVerModulo('AI-BITACORA')).toBe(false)
    expect(auth.puedeVerModulo('AI-ADMIN-USUARIOS')).toBe(false)
  })

  it('concede el acceso con el permiso del grupo correspondiente', () => {
    const auth = conPermisos(['archivo.bitacora.ver'])

    expect(auth.puedeVerModulo('AI-BITACORA')).toBe(true)
  })

  it('una sigla desconocida se niega (default restrictivo)', () => {
    const auth = conPermisos(['archivo.inventario.ver'])

    expect(auth.puedeVerModulo('AI-NO-EXISTE')).toBe(false)
  })

  it('sin permisos no se concede nada', () => {
    const auth = conPermisos([])

    for (const ruta of rutasDeModulo()) {
      expect(auth.puedeVerModulo(ruta.meta.siglas)).toBe(false)
    }
  })

  // Lo que el menú ofrece y lo que la guardia deja abrir deben salir de la MISMA regla; si divergieran,
  // el usuario vería entradas que no puede abrir, o al revés.
  it('el menú y la guardia usan el mismo criterio', () => {
    const auth = conPermisos(['archivo.bitacora.ver'])
    auth.loadModulos()

    const enElMenu = auth.modulos.some((m) => m.siglas_Modulo === 'AI-BITACORA')

    expect(enElMenu).toBe(auth.puedeVerModulo('AI-BITACORA'))
  })
})
