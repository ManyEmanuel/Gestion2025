
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { storeToRefs } from "pinia";


const espera = (tiempo = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("resolved");
    }, tiempo);
  });
};

const genera_anexo_14 = async (encabezado, inventarios) => {
  try {

    let img = new Image();

    img.src = require("../assets/IEEN300.png");
    let totalPagesExp = "{total_pages_count_string}";
    const doc = new jsPDF({ orientation: "landscape", format: "legal" });
    doc.addImage(img, "png", 10, 3, 35, 21);
    doc.setFontSize(14);
    doc.text(
      "Anexo 14 \n Archivo de concentración \n Inventario de Baja Documental ",
      180,
      10,
      null,
      null,
      "center"
    );
    //--------------------------------------------------------------------------//
    //Encabezados en rojo
    doc.setFillColor(239, 107, 107);
    doc.rect(10, 25, 100, 5, "FD");
    doc.rect(240, 25, 102, 5, "FD");
    doc.rect(10, 30, 100, 5, "FD");
    doc.rect(10, 35, 100, 5, "FD");
    doc.rect(240, 35, 102, 5, "FD");
    doc.rect(10, 40, 100, 5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Nombre del área responsable", 12, 29);
    doc.text("Área generadora", 12, 34);
    doc.text("Nombre y cargo del Encargado de archivo de tramíte", 12, 39);
    doc.text("Sección", 12, 44);
    doc.text("Fecha de elaboración ", 290, 29, null, null, "center");
    doc.text("No. de transferencia ", 290, 39, null, null, "center");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.rect(110, 25, 130, 5);
    doc.text(encabezado.area_Responsable, 112, 29);
    doc.rect(110, 30, 130, 5);
    doc.text(encabezado.area_Generadora, 112, 34);
    doc.rect(240, 30, 102, 5);
    doc.text(encabezado.fecha_Transferencia, 290, 34, null, null, "center");
    doc.rect(110, 35, 130, 5);
    doc.text(`${encabezado.valida_Area}, ${encabezado.puesto_Valida_Area}`, 112, 39);
    doc.rect(110, 40, 130, 5);
    doc.text(encabezado.secciones, 112, 44);
    doc.rect(240, 40, 102, 5);
    doc.text(encabezado.numero_Transferencia, 290, 44, null, null, "center");
    //----------------------------------------------------------------------------------------//
    var header = [
      [
        { content: "Serie y Subserie", rowSpan: 2 },
        { content: "Nombre del expediente", rowSpan: 2 },
        { content: "Clave de clasificación", rowSpan: 2 },
        { content: "No. de expediente interno", rowSpan: 2 },
        {
          content: "Descripción del asunto del expediente \n Observaciones",
          rowSpan: 2,
        },
        { content: "Fecha inicio", rowSpan: 2 },
        { content: "Fecha término", rowSpan: 2 },
        { content: "Caja", rowSpan: 2 },
        { content: "Valor documental", rowSpan: 2 },
        { content: "Vigencia documental (Años)", colSpan: 1 },
        { content: "Destino final", colSpan: 1 },
      ],
      ["Concentración", "Baja / Histórico"],
    ];
    jsPDF.autoTableSetDefaults({
      headStyles: { fillColor: [239, 107, 107], halign: "center" },
      styles: {
        halign: "center",
        valign: "middle",
        fontSize: 7,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
    });
    autoTable(doc, {
      theme: "grid",
      startY: 45,
      margin: { left: 10, rigth: 14 },
      head: header,
      body: inventarios,
      bodyStyles: { fontSize: 6 },
      tableLineColor: [0, 0, 0],
    });
    doc.setFillColor(239, 107, 107);
    doc.rect(10, doc.lastAutoTable.finalY, 332, 5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    let inicioFirmas = 0;
    if (doc.lastAutoTable.finalY <= 154) {
      inicioFirmas = 165;
    } else {
      doc.addPage();
      inicioFirmas = 30;
      doc.setPage(doc.internal.getNumberOfPages() - 1);
    }
    doc.text(`El presente inventario consta de ${doc.internal.getNumberOfPages()} hoja(s) y ampara la cantidad de ${inventarios.length} expediente(s) de los años ${encabezado.anios} contenidos en ${encabezado.cajas} caja(s) con un peso aproximado de ${encabezado.peso} kilogramo(s).`, 12,
      doc.lastAutoTable.finalY + 4
    );
    doc.setPage(doc.internal.getNumberOfPages());
    doc.setFontSize(11);
    doc.text("Elaboró", 45, inicioFirmas, null, null, "center");
    doc.line(20, inicioFirmas + 15, 70, inicioFirmas + 15);
    doc.text("Valida", 130, inicioFirmas, null, null, "center");
    doc.line(105, inicioFirmas + 15, 155, inicioFirmas + 15);
    doc.text("Supervisa", 215, inicioFirmas, null, null, "center");
    doc.line(190, inicioFirmas + 15, 240, inicioFirmas + 15);
    doc.text("Aprobación", 290, inicioFirmas, null, null, "center");
    doc.line(265, inicioFirmas + 15, 315, inicioFirmas + 15);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(
      encabezado.elaboro,
      45,
      inicioFirmas + 20,
      null,
      null,
      "center"
    );
    doc.text(
      encabezado.valida,
      130,
      inicioFirmas + 20,
      null,
      null,
      "center"
    );
    doc.text(
      encabezado.visto_Bueno,
      215,
      inicioFirmas + 20,
      null,
      null,
      "center"
    );
    doc.text(
      encabezado.aprobo,
      290,
      inicioFirmas + 20,
      null,
      null,
      "center"
    );

    doc.setFont("helvetica", "bold");

    var linesElaboro = doc.splitTextToSize(encabezado.puesto_Elaboro, 65);
    var y = inicioFirmas + 24;
    for (var i = 0; i < linesElaboro.length; i++) {
      doc.text(45, y, linesElaboro[i], null, "center");
      y = y + 4;
    }

    var linesValido = doc.splitTextToSize(encabezado.puesto_Valida, 65);
    var y = inicioFirmas + 24;
    for (var i = 0; i < linesValido.length; i++) {
      doc.text(130, y, linesValido[i], null, "center");
      y = y + 4;
    }

    var linesVobo = doc.splitTextToSize(encabezado.puesto_Visto_Bueno, 65);
    var y = inicioFirmas + 24;
    for (var i = 0; i < linesVobo.length; i++) {
      doc.text(215, y, linesVobo[i], null, "center");
      y = y + 4;
    }

    var linesSuperviso = doc.splitTextToSize(encabezado.puesto_Aprobo, 65);
    var y = inicioFirmas + 24;
    for (var i = 0; i < linesSuperviso.length; i++) {
      doc.text(290, y, linesSuperviso[i], null, "center");
      y = y + 4;
    }

    //Codigo numeracion de paginas
    doc.setFontSize(9);
    var footer = function () {
      var pageCount = doc.internal.getNumberOfPages();

      for (var i = 0; i < pageCount; i++) {
        doc.setPage(i + 1);
        doc.text(
          "Página " + (i + 1) + " de " + pageCount,
          340,
          205,
          null,
          null,
          "right"
        );
      }
    };
    footer();
    doc.save("Anexo 14" + ".pdf");
    return {
      success: true,
      data: "Recibo generado con éxito",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
    };
  }
}

export { espera, genera_anexo_14 };
