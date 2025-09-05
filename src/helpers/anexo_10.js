
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const espera = (tiempo = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("resolved");
    }, tiempo);
  });
};

const genera_anexo_10 = (caja, detalles, encabezado, ubicacion) => {

  try {

    let raw = [];
    let serie = new Set();
    let subserie = new Set();
    let valorDocumental = new Set()
    console.log("Detalles", detalles);
    for (let detalle of detalles) {
      raw.push([detalle.clave_Clasificacion, `${detalle.vigencia_Concentracion} Años`, ""]);
      const objeto = detalle.clave_Clasificacion.split("/");
      subserie.add(objeto[2]);
      serie.add(objeto[2].split(".")[0]);
      valorDocumental.add(detalle.valor_Documental)
    }
    const seriesTexto = [...serie].join(', ');
    const subseriesTexto = [...subserie].join(', ');
    const valorDocumentalTexto = [...valorDocumental].join(', ')


    //---------------------------------------------------------------------//
    let img = new Image();
    img.src = require("../assets/IEEN300.png");
    const doc = new jsPDF({
      orientation: 'portrait', // Orientación vertical
      format: 'letter',        // Tamaño carta
    });
    doc.addImage(img, "png", 90, 4, 28, 16);
    doc.setFontSize(12);
    doc.text(
      "Archivo de Trámite \n Cédula de identificación por caja",
      108,
      25,
      null,
      null,
      "center"
    );
    doc.setFillColor(244, 176, 132);
    doc.setDrawColor(0);
    doc.rect(8, 35, 200, 8, "FD");
    doc.rect(8, 43, 200, 15, "D");
    doc.rect(8, 58, 200, 8, "FD");
    doc.rect(8, 66, 200, 15, "D");
    doc.rect(8, 81, 200, 8, "FD");
    doc.rect(8, 89, 200, 15, "D");
    doc.rect(8, 104, 200, 8, "FD");
    doc.rect(8, 112, 200, 15, "D");
    doc.rect(8, 127, 200, 8, "FD");
    doc.rect(8, 135, 200, 15, "D");


    doc.setLineWidth(.5);
    doc.line(105, 35, 105, 104)
    doc.line(105, 127, 105, 150)
    doc.setFontSize(13)
    doc.setFont("helvetica", "bold");
    doc.text(
      "Área Responsable",
      56,
      64,
      null,
      null,
      "center"
    );
    var linesResponsable = doc.splitTextToSize(encabezado.area_Responsable, 90);
    let yRe = 72
    for (var i = 0; i < linesResponsable.length; i++) {
      doc.text(56, yRe, linesResponsable[i], null, "center");
      yRe = yRe + 5;
    }


    doc.text(
      "Área Generadora",
      153,
      64,
      null,
      null,
      "center"
    );
    var linesGeneradora = doc.splitTextToSize(encabezado.area_Generadora, 90);
    let yGe = 72
    for (var i = 0; i < linesGeneradora.length; i++) {
      doc.text(155, yGe, linesGeneradora[i], null, "center");
      yGe = yGe + 5;
    }
    doc.text(
      "Sección",
      56,
      87,
      null,
      null,
      "center"
    );
    var linesSeccion = doc.splitTextToSize(seriesTexto, 90);
    let ySe = 95
    for (var i = 0; i < linesSeccion.length; i++) {
      doc.text(56, ySe, linesSeccion[i], null, "center");
      ySe = ySe + 5;
    }

    doc.text(
      "Serie y Subserie",
      153,
      87,
      null,
      null,
      "center"
    );
    var linesSubs = doc.splitTextToSize(subseriesTexto, 90);
    let ySu = 95
    for (var i = 0; i < linesSubs.length; i++) {
      doc.text(155, ySu, linesSubs[i], null, "center");
      ySu = ySu + 5;
    }


    doc.text(
      "Valor Documental",
      105,
      110,
      null,
      null,
      "center"
    );

    var linesValor = doc.splitTextToSize(valorDocumentalTexto, 190);
    let yva = 118
    for (var i = 0; i < linesValor.length; i++) {
      doc.text(105, yva, linesValor[i], null, "center");
      yva = yva + 5;
    }

    doc.text(
      "Total Expedientes",
      56,
      133,
      null,
      null,
      "center"
    );
    doc.text(
      caja.total_Expedientes.toString(),
      56,
      141,
      null,
      null,
      "center"
    );
    doc.text(
      "Fechas Extremas",
      153,
      133,
      null,
      null,
      "center"
    );
    doc.text(
      caja.fecha_Antigua.toString() + " - " + caja.fecha_Reciente.toString(),
      155,
      141,
      null,
      null,
      "center"
    );
    doc.text(
      "Transferencia",
      56,
      39,
      null,
      null,
      "center"
    );
    doc.text(
      encabezado.nombre,
      56,
      52,
      null,
      null,
      "center"
    );
    doc.text(
      "Caja",
      153,
      39,
      null,
      null,
      "center"
    );
    doc.text(
      caja.no_Caja.toString(),
      155,
      52,
      null,
      null,
      "center"
    );


    var body = []
    let vuelta = 0
    let contador = 0
    for (var i = 0; i < raw.length; i++) {
      var row = [];
      for (var key in raw[i]) {
        row.push(raw[i][key]); // Agrega el valor de cada clave al arreglo `row`.
      }
      if (vuelta == 0) {
        if (i % 12 === 0) {
          row[2] = { // Modifica la tercera columna
            rowSpan: 12, // Combina 5 filas en una sola celda.
            content: "1", // Contenido de la celda combinada (número de grupo).
            styles: { valign: 'middle', halign: 'center' }, // Estilo de alineación.
          };
          vuelta = vuelta + 1
          contador = 0
        } else {
          contador = contador + 1
        }
      } else {
        if (contador % 28 === 0) {
          row[2] = { // Modifica la tercera columna
            rowSpan: 28, // Combina 5 filas en una sola celda.
            content: "1", // Contenido de la celda combinada (número de grupo).
            styles: { valign: 'middle', halign: 'center' }, // Estilo de alineación.
          };
          vuelta = vuelta + 1
          contador = 0
        } else {
          contador = contador + 1
        }
      }
      body.push(row);
    }

    doc.autoTable({
      head: [["Clave de Clasificación", "Vigencia Documental", "Total de Cajas"]],
      body: body,
      theme: "grid",
      startY: 150,
      margin: { left: 8, right: 8 },
      styles: {
        halign: "center",
        valign: "middle",
        fontSize: 12,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      headStyles: { fillColor: [244, 176, 132], halign: "center" },


    });

    let finalY = doc.lastAutoTable.finalY;
    doc.setFillColor(244, 176, 132);
    doc.setDrawColor(0);
    doc.rect(8, finalY, 200, 36, "FD");
    doc.line(8, finalY + 8, 208, finalY + 8)
    doc.line(40, finalY + 16, 208, finalY + 16)
    doc.line(40, finalY + 8, 40, finalY + 36)
    doc.line(80, finalY + 8, 80, finalY + 36)
    doc.line(120, finalY + 8, 120, finalY + 36)
    doc.line(160, finalY + 8, 160, finalY + 36)
    doc.text(
      "Para uso de Exclusivo del Archivo de Concentración",
      105,
      finalY + 6,
      null,
      null,
      "center"
    );

    doc.setFontSize(11);
    doc.text(
      "Signatura\nTopográfica",
      24,
      finalY + 20,
      null,
      null,
      "center"
    );
    doc.text(
      "Inmueble",
      60,
      finalY + 14,
      null,
      null,
      "center"
    );

    doc.text(
      "Pasillo",
      100,
      finalY + 14,
      null,
      null,
      "center"
    );

    doc.text(
      "Estante",
      140,
      finalY + 14,
      null,
      null,
      "center"
    );

    doc.text(
      "Nivel",
      183,
      finalY + 14,
      null,
      null,
      "center"
    );
    doc.setFontSize(13);
    doc.text(
      ubicacion.inmueble,
      60,
      finalY + 25,
      null,
      null,
      "center"
    );
    doc.text(
      ubicacion.pasillo,
      100,
      finalY + 25,
      null,
      null,
      "center"
    );
    doc.text(
      ubicacion.estante,
      140,
      finalY + 25,
      null,
      null,
      "center"
    );
    doc.text(
      ubicacion.nivel,
      183,
      finalY + 25,
      null,
      null,
      "center"
    );

    doc.save("Anexo 10" + ".pdf");
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

export { espera, genera_anexo_10 };
