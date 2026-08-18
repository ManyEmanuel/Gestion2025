
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useInventarioAreaAIStore } from "src/stores/inventario_area_ai_store";
import { storeToRefs } from "pinia";

const inventarioStore = useInventarioAreaAIStore();
const { inventariosConcentracion, inventariosHistorico } = storeToRefs(inventarioStore);

const espera = (tiempo = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("resolved");
    }, tiempo);
  });
};

const genera_anexo_13 = async (tipo, transferencia, area, caja, detalles) => {

  try {
    if (tipo == "Baja") {
      await inventarioStore.loadInventariosConcentracionBaja();
    } else {
      await inventarioStore.loadInventariosConcentracionBaja();
    }
    let img = new Image();
    img.src = require("../assets/branding/logo.png");
    const doc = new jsPDF({
      orientation: 'portrait', // Orientación vertical
      format: 'letter',        // Tamaño carta
    });
    doc.addImage(img, "png", 10, 4, 28, 16);
    doc.setFontSize(12);
    doc.text(
      area + "\n" + " Anexo 13 ",
      105,
      12,
      null,
      null,
      "center"
    );

    doc.setFillColor(244, 176, 132);
    doc.setDrawColor(0);
    doc.rect(8, 25, 200, 5, "FD");
    doc.rect(8, 30, 200, 5, "FD");
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold");
    doc.text(
      "Archivo de concentración - " + tipo,
      105,
      29,
      null,
      null,
      "center"
    );
    doc.text(
      "Calendario de Caducidades",
      105,
      34,
      null,
      null,
      "center"
    );
    let body = []
    for (let detalle of detalles) {
      let filtro = ""
      if (tipo == "Baja") {
        filtro = inventariosConcentracion.value.find(inventario => inventario.clave_Clasificacion == detalle.clave_Clasificacion)
      } else {
        filtro = inventariosConcentracion.value.find(inventario => inventario.clave_Clasificacion == detalle.clave_Clasificacion)
      }

      let anio = parseInt(filtro.fecha_Recepcion_Transferencia_Primaria.split("-")[0])
      let final = anio + filtro.vigencia_Concentracion
      let textobicacion = ""
      if (filtro.ubicacion_AI == null) {
        textobicacion = ""
      } else {
        let separarFiltro = filtro.ubicacion_AI.split("|")
        textobicacion = "En el pasillo " + separarFiltro[1] + ", Anaquel " + separarFiltro[0] + ", Nivel " + separarFiltro[3] + ", Estante " + separarFiltro[2]
      }

      let baja = ""
      let historico = ""
      if (tipo == "Baja") {
        baja = "X"
      } else {
        historico = "X"
      }
      body.push([
        "",
        "",
        detalle.clave_Clasificacion,
        anio.toString(),
        filtro.vigencia_Concentracion.toString(),
        final,
        baja,
        historico,
        textobicacion
      ])
    }
    let encabezado = [[
      { content: "No. de Transferencia", rowSpan: 2 },
      { content: "No. de Caja", rowSpan: 2 },
      { content: "Clave de Sección, Serie y Subserie", rowSpan: 2 },
      { content: "Fecha de recepción", rowSpan: 2 },
      { content: "Plazo de conservación", rowSpan: 2 },
      { content: "Año de vencimiento", rowSpan: 2 },
      { content: "Destino Final", colSpan: 2 },
      { content: "Signatura Topográfica", rowSpan: 2 },
    ],
    [{ content: "Baja" },
    { content: "Historico" },
    ]]

    let datos = []
    for (let i = 0; i < body.length; i++) {
      let row = [];

      // Si es la primera fila, agrega las celdas combinadas para las columnas 1 y 2
      if (i === 0) {
        row[0] = {
          rowSpan: body.length, // Combina todas las filas
          content: transferencia, // Contenido de la celda combinada
          styles: { valign: "middle", halign: "center" }, // Estilo de alineación
        };

        row[1] = {
          rowSpan: body.length, // Combina todas las filas
          content: caja, // Contenido de la celda combinada
          styles: { valign: "middle", halign: "center" }, // Estilo de alineación
        };
      }

      // Para las filas subsiguientes, deja las celdas de las columnas 1 y 2 vacías

      // Agrega las demás celdas de la fila
      row.push(
        body[i][2], // Clave de clasificación
        body[i][3], // Año
        body[i][4], // Vigencia de conservación
        body[i][5], // Año de vencimiento
        body[i][6], // Baja
        body[i][7], // Histórico
        body[i][8]  // Ubicación AI
      );

      datos.push(row);
    }

    doc.autoTable({
      head: encabezado,
      body: datos,
      theme: "grid",
      startY: 35,
      margin: { left: 8, right: 8 },
      styles: {
        halign: "center",
        valign: "middle",
        fontSize: 8,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      headStyles: { fillColor: [244, 176, 132], halign: "center" },


    });


    doc.save("Anexo 13.pdf");
    return {
      success: true,
      msj: "Recibo generado con éxito",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
    }
  }
}

export { espera, genera_anexo_13 };
