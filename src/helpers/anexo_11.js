
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const espera = (tiempo = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("resolved");
    }, tiempo);
  });
};

const genera_anexo_11 = async (solicitud, rows, complemento, tipo, comprobante) => {

  try {
    let img = new Image();
    let tituloArchivo = ""
    img.src = require("../assets/IEEN300.png");
    const doc = new jsPDF({ format: "letter" });
    if (tipo == 1) {
      tituloArchivo = "Anexo-11-" + solicitud.folio_Solicitud + "-cedula"
      doc.addImage(img, "png", 13, 4, 28, 16);
      doc.setFontSize(12);
      doc.text(
        "Anexo 11\n Archivo de Concentración \n Cédula de préstamo",
        110,
        10,
        null,
        null,
        "center"
      );
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`Folio: ${solicitud.folio_Solicitud}`, 203, 28, null, null, "right");
      doc.setFillColor(252, 213, 180);
      doc.rect(13, 30, 190, 5, "FD");
      //-------Datos del solicitante estaticos---------------------------//
      doc.setFontSize(9);
      doc.text("Datos del solicitante", 108, 34, null, null, "center");
      doc.rect(13, 35, 40, 5);
      doc.text("Área responsable", 15, 39);
      doc.rect(53, 35, 150, 5);
      doc.rect(13, 40, 40, 5);
      doc.text("Área solicitante", 15, 44);
      doc.rect(53, 40, 150, 5);
      doc.rect(13, 45, 40, 5);
      doc.text("Fecha de préstamo", 15, 49);
      doc.rect(53, 45, 55, 5);
      doc.rect(108, 45, 40, 5);
      doc.text("Fecha de devolución", 110, 49);
      doc.rect(148, 45, 55, 5);
      doc.rect(13, 50, 40, 5);
      doc.text("Nombre y cargo", 15, 54);
      doc.rect(53, 50, 150, 5);
      doc.text("Correo electrónico", 15, 59);
      doc.rect(53, 55, 55, 5);
      doc.rect(108, 55, 40, 5);
      doc.text("Teléfono", 110, 59);
      doc.rect(148, 55, 55, 5);
      doc.rect(13, 55, 40, 5);
      //---------------------Datos del solicitante variables-----------------------------------------------------//
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(solicitud.area_Responsable, 55, 39);
      doc.text(solicitud.area_Solicitante, 55, 44);
      doc.text(solicitud.fecha_Solicitada, 81, 49, null, null, "center");
      doc.text(solicitud.fecha_Posible_Devolucion, 176, 49, null, null, "center");
      doc.text(solicitud.solicitante + " - " + complemento.puesto, 55, 54);
      doc.text(solicitud.correo, 81, 59, null, null, "center");
      doc.text(solicitud.telefono, 176, 59, null, null, "center");
      //----------------------Autotable----------------------------------------------------//
      doc.setFont("helvetica", "bold");
      doc.setFillColor(252, 213, 180);
      doc.rect(13, 60, 190, 5, "FD");
      doc.setFontSize(9);
      doc.text("Información solicitada", 108, 64, null, null, "center");
      jsPDF.autoTableSetDefaults({
        headStyles: { fillColor: [252, 213, 180], halign: "center" },
        styles: {
          halign: "center",
          valign: "middle",
          fontSize: 9,
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.5,
        },
      });
      autoTable(doc, {
        theme: "grid",
        startY: 65,
        margin: { left: 10, rigth: 16 },
        head: [["Número de Transferencia", "Clave de clasificación del Expediente", "Fecha de inicio del expediente", "Signatura topográfica", "No. interno del expediente"]],
        body: rows,
        margin: { left: 13, right: 13 },
        bodyStyles: { fontSize: 8 },
        tableLineColor: [0, 0, 0],
      });
      let y = doc.lastAutoTable.finalY;
      let linesTopologia = doc.splitTextToSize(solicitud.tipologia_Documental, 183);
      let alturaTopologia = linesTopologia.length * 5;
      let linesLegajos = doc.splitTextToSize(solicitud.num_Exp_legajos, 183);
      let alturaLegajos = linesLegajos.length * 5;

      doc.text("Topología Documental", 15, y + 4);
      doc.rect(53, y, 150, alturaTopologia);
      doc.rect(13, y, 40, alturaTopologia);
      doc.text("Número de\nexpedientes/legajos", 15, y + 4 + alturaTopologia);
      if (linesLegajos.length > 1) {
        doc.rect(53, y + alturaTopologia, 150, alturaLegajos);
        doc.rect(13, y + alturaTopologia, 40, alturaLegajos);
      } else {
        doc.rect(53, y + alturaTopologia, 150, 10);
        doc.rect(13, y + alturaTopologia, 40, 10);
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      //doc.text(solicitud.tipologia_Documental, 55, y + 4);
      let yTopologia = y + 4
      for (var i = 0; i < linesTopologia.length; i++) {
        doc.text(55, yTopologia, linesTopologia[i]);
        yTopologia = yTopologia + 4;
      }
      yTopologia = yTopologia + 4
      for (var i = 0; i < linesLegajos.length; i++) {
        doc.text(55, yTopologia, linesLegajos[i]);
        yTopologia = yTopologia + 4;
      }
      y = yTopologia - 2

      let descripciones = []
      let observaciones = []
      for (let datos of rows) {
        if (datos[5] != null && datos[5] != "") {
          descripciones.push(datos[1] + " - " + datos[5])

        }
        if (datos[6] != null && datos[6] != "") {
          observaciones.push(datos[1] + " - " + datos[6])

        }
      }

      //let linesDescripcion = doc.splitTextToSize(solicitud.tipologia_Documental, 183);
      let alturaDescripcion = 5
      let alturaObservacion = 5
      if (descripciones.length > 0) {
        alturaDescripcion = descripciones.length * 5;
      }
      if (observaciones.length > 0) {
        alturaObservacion = observaciones.length * 5;
      }

      doc.setFillColor(252, 213, 180);
      let textoDescripcion = y
      doc.rect(13, y, 190, 5, "FD");
      doc.rect(13, y + 5, 190, alturaDescripcion);
      y = y + 5 + alturaDescripcion
      doc.rect(13, y, 190, 5, "FD");
      doc.rect(13, y + 5, 190, alturaObservacion,);

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("Descripción del Contenido del Expediente", 108, textoDescripcion + 4, null, null, "center");
      doc.text("Observaciones", 108, textoDescripcion + 8 + alturaDescripcion, null, null, "center");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      textoDescripcion = textoDescripcion + 9
      for (var i = 0; i < descripciones.length; i++) {
        doc.text(108, textoDescripcion, descripciones[i], null, "center");
        textoDescripcion = textoDescripcion + 4;
      }
      textoDescripcion = textoDescripcion + 7

      for (var i = 0; i < observaciones.length; i++) {
        doc.text(108, textoDescripcion, observaciones[i], null, "center");
        textoDescripcion = textoDescripcion + 4;
      }

      y = textoDescripcion + 5
      if (y > 190) {
        doc.addPage()
        y = 30
      }
      doc.setFillColor(252, 213, 180);
      doc.rect(13, y, 80, 5, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Área solicitante", 53, y + 4, null, null, "center");

      // Espacio para firma y sello
      y += 5;

      doc.setFillColor(255, 255, 255);
      doc.rect(13, y, 80, 20);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(solicitud.responsable_Area_Responsable + "\n" + solicitud.puesto_Responsable_Area_Responsable + "\n" + "Nombre, Firma y Cargo del solicitante", 53, y + 12, null, null, "center");

      // Segundo cuadro con fondo y texto centrado
      y -= 5;
      doc.setFillColor(252, 213, 180);
      doc.rect(123, y, 80, 5, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Área de concentración", 163, y + 4, null, null, "center");

      // Espacio para firma y sello
      y += 5;
      doc.setFillColor(255, 255, 255);
      doc.rect(123, y, 80, 20);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("Jorge Arturo Langarica Zepeda\nCoordinador de Archivo del IEEN\nNombre, Firma y Cargo", 163, y + 12, null, null, "center")

      // Tercer cuadro con fondo y texto centrado
      y += 25;
      doc.setFillColor(252, 213, 180);
      doc.rect(68, y, 80, 5, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Área solicitante", 108, y + 4, null, null, "center");

      // Espacio para firma y sello
      y += 5;
      doc.setFillColor(255, 255, 255);
      doc.rect(68, y, 80, 20);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(solicitud.solicitante + "\nEnlace de archivo de trámite\nNombre y Firma de quien recibe", 108, y + 12, null, null, "center");


      y += 25
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Fecha de devolución", 15, y + 4);
      doc.rect(13, y, 40, 5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(solicitud.fecha_Posible_Devolucion, 73, y + 4, null, null, "center");
      doc.rect(53, y, 40, 5);

      y += 8


    }
    else if (tipo == 2) {

      let transferencia = []
      let interno = []
      for (let datos of rows) {
        transferencia.push(datos[0])
        interno.push(datos[4])
      }
      let transferenciaSinDuplicados = [...new Set(transferencia)];
      let resultadoTransferencia = transferenciaSinDuplicados.join(",");
      let internoSinDuplicados = [...new Set(interno)];
      let resultadoInterno = internoSinDuplicados.join(",");

      tituloArchivo = "Anexo-11-" + solicitud.folio_Solicitud + "-recibo"
      doc.addImage(img, "png", 13, 4, 28, 16);
      doc.setFontSize(12);
      doc.text(
        "Anexo 11\n Archivo de Concentración \n Cédula de préstamo",
        110,
        10,
        null,
        null,
        "center"
      );
      doc.setFillColor(252, 213, 180);
      doc.rect(13, 30, 190, 5, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Comprobante de devolución", 108, 34, null, null, "center");
      doc.text("Folio", 15, 39);
      doc.rect(13, 35, 50, 5);
      doc.rect(63, 35, 45, 5);
      doc.text("Fecha de devolución", 110, 39);
      doc.rect(108, 35, 50, 5);
      doc.rect(158, 35, 45, 5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(solicitud.folio_Solicitud, 85, 39, null, null, "center");
      doc.text(solicitud.fecha_Posible_Devolucion, 180, 39, null, null, "center");

      let y = 45;

      doc.setFillColor(252, 213, 180);
      doc.rect(13, 45, 50, 5, "FD");
      doc.rect(63, 45, 140, 5,);
      doc.rect(13, 50, 50, 5, "FD");
      doc.rect(63, 50, 140, 5,);
      doc.rect(13, 55, 50, 5, "FD");
      doc.rect(63, 55, 140, 5,);
      doc.rect(13, 60, 50, 5, "FD");
      doc.rect(63, 60, 140, 5,);


      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("Número de Transferencia", 15, 49);
      doc.text("Número interno del expediente", 15, 54);
      doc.text("Tipología Documental", 15, 59);
      doc.text("Número de legajos/Expedientes", 15, 64);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(resultadoTransferencia, 65, 49);
      doc.text(resultadoInterno, 65, 54);
      doc.text(solicitud.tipologia_Documental, 65, 59);
      doc.text(solicitud.num_Exp_legajos, 65, 64);

      doc.setFillColor(252, 213, 180);
      doc.rect(13, 70, 190, 5, "FD");
      doc.rect(13, 75, 190, 25);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Archivo de concentración", 108, 74, null, null, "center");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("Jorge Arturo Langarica Zepeda\nCoordinador de Archivo del IEEN\nNombre, firma y cargo", 108, 92, null, null, "center");
      doc.setFillColor(252, 213, 180);
      doc.rect(13, 100, 190, 15, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);

      let confidencialTexto = doc.splitTextToSize("Nota\nEn caso de que los expedientes sean devueltos incompletos el Archivo de Concentración notificará de ello por escrito mediante un acta circunstanciada al titular del área responsable, a fin de deslindar responsabilidades y  el plazo máximo de préstamo de documentación será de 30 días naturales, al término del cual deberá devolverse o bien renovarse la Cédula de Préstamo.", 185)
      let arregloTexto = [];
      let textoCadena = "";
      for (var i = 0; i < confidencialTexto.length; i++) {
        textoCadena = textoCadena.concat(" ", confidencialTexto[i]);
      }
      arregloTexto.push([textoCadena]);
      for (var i = 0; i < arregloTexto.length; i++) {
        doc.text(arregloTexto[i], 15, 105, {
          align: "justify",
          lineHeightFactor: 1.2,
          maxWidth: 185,
        });

      }
      /*doc.setFont("helvetica", "bold");
      doc.setFillColor(252, 213, 180);
      doc.rect(13, y, 190, 5, "FD");
      doc.setFontSize(9);
      doc.text("Observaciones", 108, y + 4, null, null, "center");
      y = y + 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      let linesObservacionesCopia = doc.splitTextToSize(
        comprobante.observaciones,
        190
      );
      let alturaObservacionesCopia = linesObservacionesCopia.length * 5;
      let inicioObservacionesCopia = y + 4;
      for (var i = 0; i < linesObservacionesCopia.length; i++) {
        doc.text(
          108,
          inicioObservacionesCopia,
          linesObservacionesCopia[i],
          null,
          "center"
        );
        inicioObservacionesCopia = inicioObservacionesCopia + 4;
      }
      doc.rect(13, y, 190, alturaObservacionesCopia);

      y = y + alturaObservacionesCopia + 35;
      doc.line(70, y, 150, y);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(
        complemento.responsable,
        110,
        y - 1,
        null,
        null,
        "center"
      );
      doc.setFont("helvetica", "bold");
      doc.text(
        "Nombre, Firma y Sello del \n Responsable del Archivo de Trámite",
        110,
        y + 4,
        null,
        null,
        "center"
      );

    }


    //Encabezados en rojo estaticos*/


    }
    doc.save(tituloArchivo + ".pdf");
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

export { espera, genera_anexo_11 };
