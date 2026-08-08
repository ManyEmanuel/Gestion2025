import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

// Corte al backend nuevo: las escrituras REST responden 201/204 y problem+json en error (axios lanza).
const mensajeError = (e, defecto = "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte") =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.title)) || defecto

// Deriva { destinoFinal (int), muestreo (bool) } de los flags del formulario legado.
// Backend: DestinoFinal Baja=1, ConservacionPermanente=2 (enum serializado como int).
// Decisión del usuario: "Muestreo" -> ConservacionPermanente + muestreo=true. La precedencia protege
// del caso en que la edición deje más de un flag activo.
const destinoDesdeFlags = (d) => {
  if (d.muestreo === true) return { destinoFinal: 2, muestreo: true }
  if (d.archivo_Historico === true) return { destinoFinal: 2, muestreo: false }
  return { destinoFinal: 1, muestreo: false } // Eliminación -> Baja
}

export const useDisposicionDocStore = defineStore('DisposicionDocStore', {
  state: () => ({
    modal: false,
    modalEditar: false,
    modalEditar: false,
    disposiciones: [],
    valorDocumental: [],
    NivelSeguridad: [],
    isEditar: false,
    disposicion: {
      id: null,
      seccion_Id: null,
      seccion: null,
      serie_Id: null,
      serie: null,
      subSerie_Id: null,
      subSerie: null,
      nivel_Seguridad_Id: null,
      nivel_Seguridad: null,
      valor_Documental_Id: null,
      valor_Documental: null,
      nombre: null,
      vigencia_Archivo_Tramite: null,
      vigencia_Archivo_Concentracion: null,
      eliminacion: null,
      archivo_Historico: null,
      muestreo: null,
      observaciones: null,
      sistema_Datos_Personales_Nombre: null,
      disposicion_Documental: null
    }
  }),

  actions: {
    initDisposicion() {
      this.disposicion.id = null
      this.disposicion.seccion_Id = null
      this.disposicion.seccion = null
      this.disposicion.serie_Id = null
      this.disposicion.serie = null
      this.disposicion.subSerie_Id = null
      this.disposicion.subSerie = null
      this.disposicion.nivel_Seguridad_Id = null
      this.disposicion.nivel_Seguridad = null
      this.disposicion.valor_Documental_Id = null
      this.disposicion.valor_Documental = null
      this.disposicion.nombre = null
      this.disposicion.vigencia_Archivo_Tramite = null
      this.disposicion.vigencia_Archivo_Concentracion = null
      this.disposicion.eliminacion = null
      this.disposicion.archivo_Historico = null
      this.disposicion.muestreo = null
      this.disposicion.observaciones = null
      this.disposicion.sistema_Datos_Personales_Nombre = null
      this.disposicion.disposicion_Documental = null
    },

    // MIGRADO al backend nuevo (corte de clientes): GET /api/disposiciones?tipo=C|S
    // devuelve un array directo con nombres resueltos. Se remapea a la forma de la tabla.
    async loadDisposiciones(tipo) {
      try {
        this.disposiciones = []
        const resp = await api.get(`/disposiciones?tipo=${tipo}`)
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.disposiciones = resp.data.map((element) => {
            return {
              id: element.id,
              seccion_Id: element.seccionId,
              seccion: element.seccionClave,
              serie_Id: element.serieId,
              serie: element.serieClave,
              subSerie_Id: element.subSerieId,
              subSerie: element.subSerieClave,
              nivel_Seguridad_Id: element.nivelSeguridadId,
              nivel_Seguridad: element.nivelSeguridad,
              valor_Documental_Id: element.valorDocumentalId,
              valor_Documental: element.valorDocumental,
              nombre: element.nombre,
              vigencia_Archivo_Tramite: element.vigenciaTramite,
              vigencia_Archivo_Concentracion: element.vigenciaConcentracion,
              disposicion_Documental: element.destinoFinal,
              muestreo: element.muestreo,
              observaciones: element.observaciones,
              sistema_Datos_Personales_Nombre: element.sistemaDatosPersonales,
              total_Vigencia: element.totalVigencia
            }
          })
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO: GET /api/valoresdocumentales -> array de { id, nombre }.
    async loadValoresDocumentales() {
      try {
        this.valorDocumental = []
        const resp = await api.get("/valoresdocumentales")
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.valorDocumental = resp.data.map((element) => ({ value: element.id, label: element.nombre }))
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO: GET /api/nivelesseguridad -> array de { id, nombre, descripcion }.
    async loadNivelesSeguridad() {
      try {
        this.NivelSeguridad = []
        const resp = await api.get("/nivelesseguridad")
        if (resp.status == 200 && Array.isArray(resp.data)) {
          this.NivelSeguridad = resp.data.map((element) => ({ value: element.id, label: element.nombre }))
          return { success: true }
        }
        return { success: false, data: "Respuesta inesperada del servidor." }
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO: el backend nuevo no expone GET /disposiciones/{id}. La edición se llena desde la lista
    // ya cargada (this.disposiciones, del tab actual), y se derivan los flags eliminacion/
    // archivo_Historico/muestreo a partir de destinoFinal (string) + muestreo (bool).
    loadDisposicion(id) {
      this.initDisposicion()
      const row = this.disposiciones.find((x) => x.id == id)
      if (!row) {
        return { success: false, data: "No se encontró la disposición." }
      }
      this.disposicion.id = row.id
      this.disposicion.seccion_Id = row.seccion_Id
      this.disposicion.seccion = row.seccion
      this.disposicion.serie_Id = row.serie_Id
      this.disposicion.serie = row.serie
      this.disposicion.subSerie_Id = row.subSerie_Id
      this.disposicion.subSerie = row.subSerie
      this.disposicion.nivel_Seguridad_Id = row.nivel_Seguridad_Id
      this.disposicion.nivel_Seguridad = row.nivel_Seguridad
      this.disposicion.valor_Documental_Id = row.valor_Documental_Id
      this.disposicion.valor_Documental = row.valor_Documental
      this.disposicion.nombre = row.nombre
      this.disposicion.vigencia_Archivo_Tramite = row.vigencia_Archivo_Tramite
      this.disposicion.vigencia_Archivo_Concentracion = row.vigencia_Archivo_Concentracion
      this.disposicion.observaciones = row.observaciones
      this.disposicion.sistema_Datos_Personales_Nombre = row.sistema_Datos_Personales_Nombre
      this.disposicion.disposicion_Documental = row.disposicion_Documental
      // Reset + derivar el flag del destino desde el modelo nuevo (destinoFinal string + muestreo bool).
      this.disposicion.eliminacion = null
      this.disposicion.archivo_Historico = null
      this.disposicion.muestreo = null
      const esConservacion = typeof row.disposicion_Documental === "string"
        && row.disposicion_Documental.toLowerCase().includes("conserv")
      if (row.muestreo === true) this.disposicion.muestreo = true
      else if (esConservacion) this.disposicion.archivo_Historico = true
      else this.disposicion.eliminacion = true
      return { success: true }
    },

    async loadDisposicionBySerie(seccion, serie, subserie) {
      try {
        this.initDisposicion()
        const resp = await api.get(`/Archivo/DisposicionesDocumentales/ConsultaDisposicion?Seccion_Id=${seccion}&Serie_Id=${serie}&SubSerie_Id=${subserie}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              this.disposicion.id = data.id
              this.disposicion.seccion_Id = data.seccion_Id
              this.disposicion.seccion = data.seccion
              this.disposicion.serie_Id = data.serie_Id
              this.disposicion.serie = data.serie
              this.disposicion.subSerie_Id = data.subSerie_Id
              this.disposicion.subSerie = data.subSerie
              this.disposicion.nivel_Seguridad_Id = data.nivel_Seguridad_Id
              this.disposicion.nivel_Seguridad = data.nivel_Seguridad
              this.disposicion.valor_Documental_Id = data.valor_Documental_Id
              this.disposicion.valor_Documental = data.valor_Documental
              this.disposicion.nombre = data.nombre
              this.disposicion.vigencia_Archivo_Tramite = data.vigencia_Archivo_Tramite
              this.disposicion.vigencia_Archivo_Concentracion = data.vigencia_Archivo_Concentracion
              this.disposicion.eliminacion = data.eliminacion
              this.disposicion.archivo_Historico = data.archivo_Historico
              this.disposicion.muestreo = data.muestreo
              this.disposicion.observaciones = data.observaciones
              this.disposicion.sistema_Datos_Personales_Nombre = data.sistema_Datos_Personales_Nombre
              this.disposicion.disposicion_Documental = data.disposicion_Documental
              return { success }
            } else {
              return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
            }
          } else {
            return { success, data }
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    async loadDisposicionBySerie(seccion, serie) {
      try {
        this.initDisposicion()
        const resp = await api.get(`/Archivo/DisposicionesDocumentales/ConsultaDisposicion?Seccion_Id=${seccion}&Serie_Id=${serie}`)
        if (resp.status == 200) {
          const { success, data } = resp.data
          if (success === true) {
            if (data) {
              this.disposicion.id = data.id
              this.disposicion.seccion_Id = data.seccion_Id
              this.disposicion.seccion = data.seccion
              this.disposicion.serie_Id = data.serie_Id
              this.disposicion.serie = data.serie
              this.disposicion.subSerie_Id = data.subSerie_Id
              this.disposicion.subSerie = data.subSerie
              this.disposicion.nivel_Seguridad_Id = data.nivel_Seguridad_Id
              this.disposicion.nivel_Seguridad = data.nivel_Seguridad
              this.disposicion.valor_Documental_Id = data.valor_Documental_Id
              this.disposicion.valor_Documental = data.valor_Documental
              this.disposicion.nombre = data.nombre
              this.disposicion.vigencia_Archivo_Tramite = data.vigencia_Archivo_Tramite
              this.disposicion.vigencia_Archivo_Concentracion = data.vigencia_Archivo_Concentracion
              this.disposicion.eliminacion = data.eliminacion
              this.disposicion.archivo_Historico = data.archivo_Historico
              this.disposicion.muestreo = data.muestreo
              this.disposicion.observaciones = data.observaciones
              this.disposicion.sistema_Datos_Personales_Nombre = data.sistema_Datos_Personales_Nombre
              this.disposicion.disposicion_Documental = data.disposicion_Documental
              return { success }
            } else {
              return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
            }
          } else {
            return { success, data }
          }
        } else {
          return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
        }
      } catch (e) {
        console.error(e)
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      }
    },

    // MIGRADO: POST /api/disposiciones. Mapea el objeto legado del form al comando (Guids, vigencias
    // como int, destinoFinal como int del enum + muestreo bool). 201 Created.
    async createDisposicion(disposicion) {
      try {
        const { destinoFinal, muestreo } = destinoDesdeFlags(disposicion)
        const resp = await api.post("/disposiciones", {
          serieId: disposicion.serie_Id,
          subSerieId: disposicion.subSerie_Id || null,
          valorDocumentalId: disposicion.valor_Documental_Id,
          nivelSeguridadId: disposicion.nivel_Seguridad_Id,
          nombre: disposicion.nombre,
          vigenciaTramite: Number(disposicion.vigencia_Archivo_Tramite) || 0,
          vigenciaConcentracion: Number(disposicion.vigencia_Archivo_Concentracion) || 0,
          destinoFinal,
          muestreo,
          observaciones: disposicion.observaciones,
          sistemaDatosPersonales: disposicion.sistema_Datos_Personales_Nombre
        })
        if (resp.status === 201 || resp.status === 200) {
          return { success: true, data: "Disposición registrada con éxito" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    // MIGRADO: PUT /api/disposiciones/{id} (el body no lleva serieId; la serie no cambia). 204.
    async updateDisposicion(disposicion, id) {
      try {
        const { destinoFinal, muestreo } = destinoDesdeFlags(disposicion)
        const resp = await api.put(`/disposiciones/${id}`, {
          subSerieId: disposicion.subSerie_Id || null,
          valorDocumentalId: disposicion.valor_Documental_Id,
          nivelSeguridadId: disposicion.nivel_Seguridad_Id,
          nombre: disposicion.nombre,
          vigenciaTramite: Number(disposicion.vigencia_Archivo_Tramite) || 0,
          vigenciaConcentracion: Number(disposicion.vigencia_Archivo_Concentracion) || 0,
          destinoFinal,
          muestreo,
          observaciones: disposicion.observaciones,
          sistemaDatosPersonales: disposicion.sistema_Datos_Personales_Nombre
        })
        if (resp.status === 204 || resp.status === 200) {
          return { success: true, data: "Disposición actualizada con éxito" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo. Si el error persiste contacte a soporte" }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    // MIGRADO: DELETE /api/disposiciones/{id}. 204. Recarga el tab actual (tipo = último carácter de
    // la clave de sección) porque la pantalla no recarga por sí sola tras borrar.
    async deleteDisposicion(id) {
      try {
        const fila = this.disposiciones.find((x) => x.id == id) || this.disposiciones[0]
        const tipo = fila && typeof fila.seccion === "string" ? fila.seccion.slice(-1) : null
        const resp = await api.delete(`/disposiciones/${id}`)
        if (resp.status === 204 || resp.status === 200) {
          if (tipo) await this.loadDisposiciones(tipo)
          return { success: true, data: "Disposición eliminada con éxito" }
        }
        return { success: false, data: "Ocurrio un error, intentelo de nuevo" }
      } catch (e) {
        console.error(e)
        return { success: false, data: mensajeError(e) }
      }
    },

    actualizarModal(valor) {
      this.modal = valor
    },

    actualizarModalEditar(valor) {
      this.modalEditar = valor
    },

    updateEditar(valor) {
      this.isEditar = valor
    },
  }
})
