import { api } from 'src/boot/axios'

// Corte al backend nuevo (UniversoArchivo): los reportes oficiales (Inventario .xlsx, CADIDO .xlsx,
// Carátula de transferencia .pdf) ahora los GENERA el backend y se descargan como binario, en lugar
// de armarse en el cliente con jsPDF/XLSX. Este helper hace la descarga por blob de forma uniforme:
// pide el archivo, toma el nombre del header Content-Disposition (si viene) y dispara la descarga.
//
//   ruta               ruta relativa del endpoint (baseURL = API_URL), p.ej. '/reportes/cadido'
//   nombrePorDefecto   nombre de archivo si el backend no envía Content-Disposition
export async function descargarReporte(ruta, nombrePorDefecto) {
  try {
    const resp = await api.get(ruta, { responseType: 'blob' })
    const tipo = resp.headers['content-type'] || 'application/octet-stream'
    const blob = new window.Blob([resp.data], { type: tipo })
    const nombre = nombreDesdeDisposicion(resp.headers['content-disposition']) || nombrePorDefecto

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', nombre)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    return { success: true }
  } catch (error) {
    // Pedimos blob, así que un error del backend (problem+json: 403 fuera de área, 404, etc.)
    // llega como Blob; intentamos leer su 'detail'/'title' para un mensaje útil.
    console.error('descargarReporte', error)
    const mensaje = await mensajeDeError(error)
    return { success: false, data: mensaje }
  }
}

function nombreDesdeDisposicion(dispo) {
  if (!dispo) return null
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(dispo)
  if (utf8) {
    try { return decodeURIComponent(utf8[1]) } catch { return utf8[1] }
  }
  const simple = /filename="?([^";]+)"?/i.exec(dispo)
  return simple ? simple[1] : null
}

async function mensajeDeError(error) {
  const defecto = 'No se pudo generar el reporte, intentelo de nuevo. Si el error persiste contacte a soporte'
  try {
    const cuerpo = error && error.response && error.response.data
    if (cuerpo instanceof window.Blob) {
      const texto = await cuerpo.text()
      try {
        const j = JSON.parse(texto)
        return j.detail || j.title || defecto
      } catch {
        return defecto
      }
    }
  } catch {
    /* noop */
  }
  return defecto
}
