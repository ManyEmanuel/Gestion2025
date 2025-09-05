import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const espera = (tiempo = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("resolved");
    }, tiempo);
  });
};

const genera_anexo_8 = (solicitud, rows, complemento, tipo, comprobante) => {

  try {
    let img = new Image();
    let tituloArchivo = ""
    img.src = require("../assets/IEEN300.png");
    const doc = new jsPDF({ format: "letter" });
    if (tipo == 1) {
      tituloArchivo = "Anexo-8" + solicitud.folio + "-cedula"
      doc.addImage(img, "png", 13, 4, 28, 16);
      doc.setFontSize(12);
      doc.text(
        "Anexo 8 \n Archivo de trámite \n Cédula de Prestamo de Expedientes Clasificados del Archivo de Trámite",
        110,
        10,
        null,
        null,
        "center"
      );
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`Folio: ${solicitud.folio}`, 203, 28, null, null, "right");
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
      //---------------------Datos del solicitante variables-----------------------------------------------------//
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(solicitud.area_Responsable, 55, 39);
      doc.text(solicitud.area_Solicitante, 55, 44);
      doc.text(solicitud.fecha_Prestamo, 81, 49, null, null, "center");
      doc.text(solicitud.fecha_Devolucion, 176, 49, null, null, "center");
      doc.text(solicitud.solicitante + " - " + complemento.puesto, 55, 54);
      //----------------------Autotable----------------------------------------------------//
      doc.setFont("helvetica", "bold");
      doc.setFillColor(252, 213, 180);
      doc.rect(13, 55, 190, 5, "FD");
      doc.setFontSize(9);
      doc.text("Información solicitada", 108, 59, null, null, "center");
      var header = [
        [
          { content: "Clave de clasificación del expediente", rowSpan: 2 },
          { content: "Fecha de inicio o conclusión del expediente", rowSpan: 2 },
          { content: "Signatura topográfica", colSpan: 1 },
          { content: "No. interno del expediente", rowSpan: 2 },
        ],
        ["Librero/Estante/Archivero - Nivel/Entrepaño/Cajón"],
      ];
      jsPDF.autoTableSetDefaults({
        headStyles: { fillColor: [255, 255, 255], halign: "center" },
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
        startY: 60,
        margin: { left: 10, rigth: 16 },
        head: header,
        body: rows,
        margin: { left: 13, right: 13 },
        bodyStyles: { fontSize: 8 },
        tableLineColor: [0, 0, 0],
      });
      //-------------Datos estaticos descripcion del contenido------------------------------------------//
      let y = doc.lastAutoTable.finalY;
      doc.setFont("helvetica", "bold");
      doc.setFillColor(252, 213, 180);
      doc.rect(13, y, 190, 5, "FD");
      doc.setFontSize(9);
      doc.text(
        "Descripción del contenido del expediente",
        108,
        y + 4,
        null,
        null,
        "center"
      );
      y = y + 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      let linesContenido = doc.splitTextToSize("**Variable contenido**", 190);
      let alturaContenido = rows.length * 5;
      let inicioContenido = y + 4;
      for (var i = 0; i < rows.length; i++) {
        doc.text(108, inicioContenido, rows[i][0] + " - " + rows[i][4], null, "center");
        inicioContenido = inicioContenido + 4;
      }
      doc.rect(13, y, 190, alturaContenido);
      //---------------------------------------------------------------------------------------------------------------------------------//
      y = y + alturaContenido;
      doc.setFont("helvetica", "bold");
      doc.setFillColor(252, 213, 180);
      doc.rect(13, y, 190, 5, "FD");
      doc.setFontSize(9);
      doc.text("Observaciones", 108, y + 4, null, null, "center");
      y = y + 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      let linesObservaciones = doc.splitTextToSize(
        solicitud.observaciones || "",
        190
      );
      let alturaObservaciones = rows.length * 5;
      let inicioObservaciones = y + 4;
      for (var i = 0; i < rows.length; i++) {
        doc.text(108, inicioObservaciones, rows[i][0] + " - " + rows[i][5], null, "center");
        inicioObservaciones = inicioObservaciones + 4;
      }
      doc.rect(13, y, 190, alturaObservaciones);
      //-------------------------------------------------------------------------------------------//

      //--------------------------------------------
      let confidencialTexto = doc.splitTextToSize("El suscrito " + solicitud.solicitante + " - " + complemento.puesto + " en mi carácter de servidor público adscrito a " + solicitud.area_Solicitante + " y bajo protesta de decir verdad, declaro conocer que conforme al artículo 63 de la Ley Federal de Transparencia y Acceso a la Información Pública Gubernamental son causas de responsabilidad administrativa de los servidores públicos usar, sustraer, destruir, ocultar, inutilizar, divulgar o alterar, total o parcialmente y de manera indebida, informacón que se encuentre bajo su custodia, a la cual tengan acceso o conocimiento con motivo de su empleo, cargo o comisión, así como entregar información considerada como reservada o confidencial conforme a lo dispuesto por dicha Ley; por lo que el expediente solicitado únicamente será utilizado para efectos del debido desempeño de las funciones propias del cargo que me fue conferido.", 189)
      let inicioConfidencial = y + alturaObservaciones + 5;
      let arregloTexto = [];
      let textoCadena = "";
      for (var i = 0; i < confidencialTexto.length; i++) {
        textoCadena = textoCadena.concat(" ", confidencialTexto[i]);
      }
      arregloTexto.push([textoCadena]);
      for (var i = 0; i < arregloTexto.length; i++) {
        doc.text(arregloTexto[i], 13, inicioConfidencial, {
          align: "justify",
          lineHeightFactor: 1.2,
          maxWidth: 189,
        });

      }

      y = inicioConfidencial + (confidencialTexto.length * 4)

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setFillColor(252, 213, 180);
      doc.rect(13, y, 90, 10, "FD");
      doc.rect(113, y, 90, 10, "FD");
      doc.text("Nombre y Firma del Responsable del Expediente", 58, y + 6, null, null, "center");
      doc.text(
        "Nombre y Firma del Responsable del Préstamo",
        158,
        y + 6,
        null,
        null,
        "center"
      );

      y = y + 10;
      doc.rect(13, y, 90, 15);
      doc.rect(113, y, 90, 15);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(complemento.responsable, 58, y + 8, null, null, "center");
      doc.text(solicitud.solicitante, 158, y + 8, null, null, "center");
      y = y + 20;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setFillColor(252, 213, 180);
      doc.rect(13, y, 40, 5, "FD");
      doc.text("Fecha de devolución", 15, y + 4);
      doc.rect(53, y, 50, 5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(solicitud.fecha_Devolucion, 78, y + 4, null, null, "center");
    } else if (tipo == 2) {
      tituloArchivo = "Anexo-8" + solicitud.folio + "-recibo"
      doc.addImage(img, "png", 13, 4, 28, 16);
      doc.setFontSize(12);
      doc.text(
        "Anexo 8 \n Archivo de trámite \n Cédula de Prestamo de Expedientes Clasificados del Archivo de Trámite",
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

      doc.rect(13, 35, 40, 5);
      doc.text("Folio", 15, 39);
      doc.rect(53, 35, 55, 5);
      doc.rect(108, 35, 40, 5);
      doc.text("Fecha de devolución", 110, 39);
      doc.rect(148, 35, 55, 5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(solicitud.folio, 80, 39, null, null, "center");
      doc.text(comprobante.fecha, 175, 39, null, null, "center");

      let y = 45;

      doc.setFont("helvetica", "bold");
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





    //Encabezados en rojo estaticos

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
export { espera, genera_anexo_8 };
