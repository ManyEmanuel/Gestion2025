import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const espera = (tiempo = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("resolved");
    }, tiempo);
  });
};

const genera_anexo_16 = async (rows, solicitud, horarios) => {

  try {
    let img = new Image();
    console.log("genera_anexo_16 -> solicitud", solicitud)
    img.src = require("../assets/IEEN300.png");
    const doc = new jsPDF({ format: "letter" });
    doc.addImage(img, "png", 13, 4, 28, 16);
    doc.setFontSize(12);
    doc.text(
      "Anexo 16\n Archivo Histórico \n Cédula de préstamo de Expedientes",
      110,
      10,
      null,
      null,
      "center"
    );
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    //doc.text(`Folio: ${solicitud.folio_Solicitud}`, 203, 28, null, null, "right");
    doc.text(`Folio: ${solicitud.folio_Solicitud}`, 203, 28, null, null, "right");
    doc.setFillColor(252, 213, 180);
    doc.rect(13, 30, 190, 5, "FD");
    doc.rect(13, 70, 190, 5, "FD");
    doc.setFontSize(9);
    doc.text("Datos del solicitante", 108, 34, null, null, "center");
    doc.text("Información Solicitada", 108, 74, null, null, "center");

    doc.text("Nombre de la Institución\nó Área solicitante", 15, 39);
    doc.rect(13, 35, 40, 10);
    doc.rect(53, 35, 150, 10);
    doc.text("Nombre del solicitante", 15, 49);
    doc.rect(13, 45, 40, 10);
    doc.rect(53, 45, 150, 10);
    doc.text("Fecha de préstamo", 15, 59);
    doc.rect(13, 55, 40, 10);
    doc.rect(53, 55, 55, 10);
    doc.text("Horario de préstamo", 110, 59);
    doc.rect(108, 55, 40, 10);
    doc.rect(148, 55, 55, 10);
    doc.text("Clave de clasificación del expediente", 108, 79, null, null, "center");
    doc.rect(13, 75, 190, 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(solicitud.area_Solicitante, 55, 39);
    doc.text(solicitud.solicitante, 55, 49);
    doc.text(solicitud.fecha_Solicitada, 55, 59);
    doc.text(horarios.prestamo, 150, 59);

    let y = 84
    let descripciones = []
    let observaciones = []
    let ubicaciones = []
    for (let datos of rows) {
      if (datos[0] != null && datos[2] != "") {
        descripciones.push(datos[0] + " - " + datos[2])

      }
      if (datos[0] != null && datos[3] != "") {
        observaciones.push(datos[0] + " - " + datos[3])

      }
      if (datos[0] != null && datos[1] != "") {
        ubicaciones.push(datos[0] + " - " + datos[1])

      }
    }
    let alturaDescripcion = 5
    let alturaObservacion = 5
    let alturaUbicacion = 5
    if (descripciones.length > 0) {
      alturaDescripcion = descripciones.length * 5;
    }
    if (observaciones.length > 0) {
      alturaObservacion = observaciones.length * 5;
    }
    if (ubicaciones.length > 0) {
      alturaUbicacion = ubicaciones.length * 5;
    }
    doc.rect(13, 80, 190, alturaDescripcion);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    for (var i = 0; i < descripciones.length; i++) {
      doc.text(108, y, descripciones[i], null, "center");
      y = y + 4;
    }
    doc.setFillColor(252, 213, 180);
    doc.rect(13, y, 190, 5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Observaciones", 108, y + 4, null, null, "center");
    y = y + 5
    doc.rect(13, y, 190, alturaObservacion);
    y = y + 4
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    for (var i = 0; i < observaciones.length; i++) {
      doc.text(108, y, observaciones[i], null, "center");
      y = y + 4;
    }
    doc.setFillColor(252, 213, 180);
    doc.rect(13, y, 190, 5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Signatura Topográfica", 108, y + 4, null, null, "center");
    y = y + 5
    doc.rect(13, y, 190, alturaUbicacion);
    y = y + 4
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    for (var i = 0; i < ubicaciones.length; i++) {
      doc.text(108, y, ubicaciones[i], null, "center");
      y = y + 4;
    }
    y = y + 5
    doc.setFillColor(252, 213, 180);
    doc.rect(13, y, 80, 5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Área Solicitante", 53, y + 4, null, null, "center");

    // Espacio para firma y sello
    y += 5;

    doc.setFillColor(255, 255, 255);
    doc.rect(13, y, 80, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(solicitud.solicitante + "\nNombre y firma del solicitante", 53, y + 15, null, null, "center");

    // Segundo cuadro con fondo y texto centrado
    y -= 5;
    doc.setFillColor(252, 213, 180);
    doc.rect(123, y, 80, 5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Encargado del Archivo Histórico", 163, y + 4, null, null, "center");

    // Espacio para firma y sello
    y += 5;
    doc.setFillColor(255, 255, 255);
    doc.rect(123, y, 80, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Jorge Arturo Langarica Zepeda\nCoordinador de Archivo del IEEN\nNombre, Firma y Cargo", 163, y + 12, null, null, "center")

    y += 25
    doc.setFillColor(252, 213, 180);
    doc.rect(13, y, 80, 5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Fecha de devolución", 53, y + 4, null, null, "center");

    doc.setFillColor(252, 213, 180);
    doc.rect(123, y, 80, 5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Hora de devolución", 163, y + 4, null, null, "center");

    y += 5;

    doc.setFillColor(255, 255, 255);
    doc.rect(13, y, 80, 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(solicitud.fecha_Posible_Devolucion, 53, y + 5, null, null, "center");

    doc.setFillColor(255, 255, 255);
    doc.rect(123, y, 80, 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(horarios.devolucion, 163, y + 5, null, null, "center");




    doc.save("Anexo_16_Historico.pdf");
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

export { espera, genera_anexo_16 };
