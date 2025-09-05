

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

const genera_anexo_12 = async (encabezado) => {
  try {

    let img = new Image();

    img.src = require("../assets/IEEN300.png");
    let totalPagesExp = "{total_pages_count_string}";
    const doc = new jsPDF({ orientation: "portrait", format: "letter" });
    doc.addImage(img, "png", 10, 3, 35, 21);
    doc.setFontSize(14);
    doc.text(
      "Anexo 12 \n Archivo de concentración",
      108,
      12,
      null,
      null,
      "center"
    );


    //--------------------------------------------------------------------------//
    //Encabezados en rojo
    doc.setFillColor(239, 107, 107);
    doc.rect(10, 25, 195, 6, "FD");

    doc.rect(10, 31, 45, 12, "FD");
    doc.rect(55, 31, 150, 12);
    doc.rect(10, 43, 45, 12, "FD");
    doc.rect(55, 43, 150, 12);
    //---------------------------------------------
    doc.rect(10, 55, 45, 24, "FD");
    doc.rect(55, 55, 50, 17);
    doc.rect(105, 55, 50, 17);
    doc.rect(155, 55, 50, 17);
    doc.rect(55, 72, 50, 7, "FD");
    doc.rect(105, 72, 50, 7, "FD");
    doc.rect(155, 72, 50, 7, "FD");
    //---------------------------------------------
    doc.rect(10, 79, 45, 24, "FD");
    doc.rect(55, 79, 50, 17);
    doc.rect(105, 79, 50, 17);
    doc.rect(155, 79, 50, 17);
    doc.rect(55, 96, 50, 7, "FD");
    doc.rect(105, 96, 50, 7, "FD");
    doc.rect(155, 96, 50, 7, "FD");
    //-------------------------------------------
    doc.rect(10, 103, 45, 24, "FD");
    doc.rect(55, 103, 150, 24);
    doc.setFontSize(11);
    doc.text(
      "Catálogo de Firmas",
      108,
      30,
      null,
      null,
      "center"
    );
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(
      "Área\n Responsable",
      33,
      37,
      null,
      null,
      "center"
    );
    doc.text(
      "Área\n Generadora",
      33,
      49,
      null,
      null,
      "center"
    );
    doc.text(
      "Encargado del \n Archivo de Tramite\n del área generadora",
      33,
      65,
      null,
      null,
      "center"
    );
    doc.text(
      "Nombre, cargo y \n firma del personal \n autorizado",
      33,
      89,
      null,
      null,
      "center"
    );
    doc.text(
      "Fecha de actualización",
      33,
      115,
      null,
      null,
      "center"
    );
    doc.text(
      "Nombre",
      80,
      77,
      null,
      null,
      "center"
    );
    doc.text(
      "Cargo",
      130,
      77,
      null,
      null,
      "center"
    );
    doc.text(
      "Firma",
      180,
      77,
      null,
      null,
      "center"
    );
    doc.text(
      "Nombre",
      80,
      101,
      null,
      null,
      "center"
    );
    doc.text(
      "Cargo",
      130,
      101,
      null,
      null,
      "center"
    );
    doc.text(
      "Firma",
      180,
      101,
      null,
      null,
      "center"
    );
    //---------------------------------------------------------------------------------------------------------------/


    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      encabezado.area,
      130,
      38,
      null,
      null,
      "center"
    );
    doc.text(
      encabezado.area,
      130,
      50,
      null,
      null,
      "center"
    );

    //------------------------------------------------------------------------------------
    let nombreEncargado = encabezado.responsable
    let puestoEncargado = encabezado.responsablePuesto
    let linesNombreEncargado = doc.splitTextToSize(nombreEncargado, 40);
    let linesPuestoEncargado = doc.splitTextToSize(puestoEncargado, 40);

    let y1 = 0
    let y2 = 0
    if (linesNombreEncargado.length == 1) {
      y1 = 66
    } else if (linesNombreEncargado.length == 2) {
      y1 = 63
    } else if (linesNombreEncargado.length > 2) {
      y1 = 60
    }

    if (linesPuestoEncargado.length == 1) {
      y2 = 66
    } else if (linesPuestoEncargado.length == 2) {
      y2 = 63
    } else if (linesPuestoEncargado.length > 2) {
      y2 = 60
    }

    let sumaY = y1
    for (var i = 0; i < linesNombreEncargado.length; i++) {
      doc.text(80, sumaY, linesNombreEncargado[i], null, "center");
      sumaY = sumaY + 5;
    }
    sumaY = y2
    for (var i = 0; i < linesPuestoEncargado.length; i++) {
      doc.text(130, sumaY, linesPuestoEncargado[i], null, "center");
      sumaY = sumaY + 5;
    }

    //------------------------------------------------------------------------------------------

    let nombreEnlace = encabezado.enlace
    let puestoEnlace = "Enlace del Archivo de Trámite"
    let linesNombreEnlace = doc.splitTextToSize(nombreEnlace, 40);
    let linesPuestoEnlace = doc.splitTextToSize(puestoEnlace, 40);

    let y3 = 0
    let y4 = 0
    if (linesNombreEnlace.length == 1) {
      y3 = 90
    } else if (linesNombreEnlace.length == 2) {
      y3 = 87
    } else if (linesNombreEnlace.length > 2) {
      y3 = 84
    }

    if (linesPuestoEnlace.length == 1) {
      y4 = 90
    } else if (linesPuestoEnlace.length == 2) {
      y4 = 87
    } else if (linesPuestoEnlace.length > 2) {
      y4 = 84
    }

    let sumaYE = y3
    for (var i = 0; i < linesNombreEnlace.length; i++) {
      doc.text(80, sumaYE, linesNombreEnlace[i], null, "center");
      sumaYE = sumaYE + 5;
    }
    sumaYE = y4
    for (var i = 0; i < linesPuestoEnlace.length; i++) {
      doc.text(130, sumaYE, linesPuestoEnlace[i], null, "center");
      sumaYE = sumaYE + 5;
    }

    //_-------------------------------------------------------------------------------------

    doc.text(
      encabezado.fecha,
      130,
      115,
      null,
      null,
      "center"
    );




    //----------------------------------------------------------------------------------------//
    doc.save("Anexo 12 -" + encabezado.area + ".pdf");
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

export { espera, genera_anexo_12 };
