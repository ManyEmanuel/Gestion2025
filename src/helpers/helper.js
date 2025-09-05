import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const espera = (tiempo = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("resolved");
    }, tiempo);
  });
};


const genera_anexo_4 = (encabezado, inventarios) => {
  try {
    let img = new Image();
    img.src = require("../assets/IEEN300.png");
    const doc = new jsPDF({ orientation: "landscape", format: "legal" });
    doc.addImage(img, "png", 10, 5, 35, 21);
    doc.setFontSize(14);
    doc.text(
      "Anexo 4 \n Archivo de trámite \n Inventario general por expediente",
      180,
      10,
      null,
      null,
      "center"
    );
    //--------------------------------------------------------------------------//
    doc.setFillColor(239, 107, 107);
    doc.rect(255, 25, 45, 5, "FD");
    doc.rect(300, 25, 40, 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Fecha de elaboración", 277, 29, null, null, "center");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`${encabezado.fecha_Registro}`, 320, 29, null, null, "center");
    //--------------------------------------------------------------------------//
    doc.setFillColor(239, 107, 107);
    doc.rect(10, 30, 165, 5, "FD");
    doc.rect(10, 35, 165, 5, "FD");
    doc.rect(10, 40, 165, 5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Nombre del área responsable", 12, 34);
    doc.text("Área generadora", 12, 39);
    doc.text(
      "Nombre, cargo del archivo de trámite del área responsable",
      12,
      44
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.rect(175, 30, 165, 5);
    doc.text(`${encabezado.area_Responsable}`, 177, 34);
    doc.rect(175, 35, 165, 5);
    doc.text(`${encabezado.area_Generadora}`, 177, 39);
    doc.rect(175, 40, 165, 5);
    doc.text(`${encabezado.valido}, ${encabezado.puesto_Valido}`, 177, 44);

    //----------------------------------------------------------------------------------------//
    var header = [
      [
        { content: "Sección", rowSpan: 2 },
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
        { content: "Ubicación fisica del expediente", rowSpan: 2 },
        { content: "Valor Documental", rowSpan: 2 },
        { content: "Vigencia documental", colSpan: 3 },
        { content: "Destino final", colSpan: 2 },
        { content: "Fecha clasificación", rowSpan: 2 },
        { content: "Fecha desclasificación", rowSpan: 2 },
        { content: "Fecha ampliacion", rowSpan: 2 },
      ],
      ["Trámite", "Concentración", "Completa", "Baja", "Histórico"],
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
      startY: 46,
      margin: { left: 10, rigth: 16 },
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

    //Obtener los años
    // Array para almacenar los años
    const anios = [];

    // Recorrer cada elemento del arreglo y extraer el año de la fecha de inicio
    inventarios.forEach(elemento => {
      console.log(elemento)
      const fechaInicio = new Date(elemento[6]);
      const anio = fechaInicio.getFullYear();
      anios.push(anio)
    });
    const inicio = Math.min(...anios)
    const fin = Math.max(...anios)
    doc.text(
      "El presente inventario consta de " +
      doc.internal.getNumberOfPages() +
      " hoja(s) y ampara la cantidad de " +
      inventarios.length +
      " expediente(s) del año " +
      `${inicio} - ${fin}`,
      12,
      doc.lastAutoTable.finalY + 4
    );
    doc.setPage(doc.internal.getNumberOfPages());
    //Aqui se ingresan las firmas//
    doc.setFontSize(11);
    doc.text("Elaboró", 45, inicioFirmas, null, null, "center");
    doc.line(20, inicioFirmas + 15, 70, inicioFirmas + 15);
    doc.text("Validó", 130, inicioFirmas, null, null, "center");
    doc.line(105, inicioFirmas + 15, 155, inicioFirmas + 15);
    doc.text("Vo.Bo.", 215, inicioFirmas, null, null, "center");
    doc.line(190, inicioFirmas + 15, 240, inicioFirmas + 15);
    doc.text("Supervisa", 290, inicioFirmas, null, null, "center");
    doc.line(265, inicioFirmas + 15, 315, inicioFirmas + 15);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(
      encabezado.enlace,
      45,
      inicioFirmas + 20,
      null,
      null,
      "center"
    );
    doc.text(
      encabezado.valido,
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
      encabezado.supervisa,
      290,
      inicioFirmas + 20,
      null,
      null,
      "center"
    );

    doc.setFont("helvetica", "bold");

    var linesElaboro = doc.splitTextToSize(encabezado.puesto_Enlace, 65);
    var y = inicioFirmas + 24;
    for (var i = 0; i < linesElaboro.length; i++) {
      doc.text(45, y, linesElaboro[i], null, "center");
      y = y + 4;
    }

    var linesValido = doc.splitTextToSize(encabezado.puesto_Valido, 65);
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

    var linesSuperviso = doc.splitTextToSize(encabezado.puesto_Supervisa, 65);
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
    doc.save("Anexo 4" + ".pdf");
    return {
      success: true,
      data: "Recibo generado con éxito",
    };
  }
  catch (error) {
    console.error(error);
    return {
      success: false,
      data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
    }
  }
}

const genera_anexo_5 = (expedientes, responsable, generadora) => {
  try {
    let img = new Image();
    img.src = require("../assets/IEEN300.png");
    const doc = new jsPDF("landscape");
    let multiplo = 0;
    for (let j = 0; j < expedientes.length; j++) {
      console.log(expedientes[j])
      let posicion = multiplo * 68;
      doc.rect(8 + posicion, 6, 60, 20);
      doc.addImage(img, "png", 22 + posicion, 7, 32, 18);
      //--------------------------------------------------------------------------//
      doc.setFillColor(221, 217, 196);
      doc.rect(8 + posicion, 26, 60, 8, "FD");
      doc.setFontSize(15);
      doc.text("Fondo", 38 + posicion, 32, null, null, "center");
      //--------------------------------------------------------------------------//
      doc.rect(8 + posicion, 34, 60, 10);
      doc.setFontSize(10);
      doc.text(
        "Instituto Estatal Electoral",
        38 + posicion,
        40,
        null,
        null,
        "center"
      );
      //--------------------------------------------------------------------------//
      doc.setFillColor(221, 217, 196);
      doc.rect(8 + posicion, 44, 60, 8, "FD");
      doc.setFontSize(15);
      doc.text("Sección", 38 + posicion, 50, null, null, "center");
      //--------------------------------------------------------------------------//
      doc.setFontSize(10);
      var lines = doc.splitTextToSize(expedientes[j].seccion, 55);
      var y = 56;
      for (var i = 0; i < lines.length; i++) {
        doc.text(38 + posicion, y, lines[i], null, "center");
        y = y + 4;
      }

      let rectanguloSeccion = lines.length * 5;
      doc.rect(8 + posicion, 52, 60, rectanguloSeccion);
      //--------------------------------------------------------------------------//
      let puntoFinSeccion = 52 + rectanguloSeccion;
      doc.setFillColor(221, 217, 196);
      doc.rect(8 + posicion, puntoFinSeccion, 60, 8, "FD");
      doc.setFontSize(15);
      doc.text(
        "Serie",
        38 + posicion,
        puntoFinSeccion + 6,
        null,
        null,
        "center"
      );

      //--------------------------------------------------------------------------//
      doc.setFontSize(10);
      y = puntoFinSeccion + 12;
      var linesSeries = doc.splitTextToSize(expedientes[j].serie, 55);
      for (var i = 0; i < linesSeries.length; i++) {
        doc.text(38 + posicion, y, linesSeries[i], null, "center");
        y = y + 4;
      }
      let rectanguloSerie = linesSeries.length * 5;
      doc.rect(8 + posicion, puntoFinSeccion + 8, 60, rectanguloSerie);
      let puntoFinSerie = puntoFinSeccion + rectanguloSerie + 8;

      //--------------------------------------------------------------------------//
      doc.setFillColor(221, 217, 196);
      doc.rect(8 + posicion, puntoFinSerie, 60, 8, "FD");
      doc.setFontSize(15);
      doc.text(
        "Subserie",
        38 + posicion,
        puntoFinSerie + 6,
        null,
        null,
        "center"
      );

      //-------------------------------------------------------------------------------------//
      doc.setFontSize(10);
      y = puntoFinSerie + 12;
      //let textSerie = **Ingresa variable**
      var linesSubSeries = doc.splitTextToSize(expedientes[j].sub_Serie == null ? "" : expedientes[j].sub_Serie, 55);
      for (var i = 0; i < linesSubSeries.length; i++) {
        doc.text(38 + posicion, y, linesSubSeries[i], null, "center");
        y = y + 4;
      }
      let rectanguloSubSerie = linesSubSeries.length * 5;
      doc.rect(8 + posicion, puntoFinSerie + 8, 60, rectanguloSubSerie);
      let puntoFinSubSerie = puntoFinSerie + rectanguloSubSerie + 8;

      //---------------------------------------------------------------------------------------//
      doc.setFillColor(221, 217, 196);
      doc.rect(8 + posicion, puntoFinSubSerie, 60, 8, "FD");
      doc.setFontSize(15);
      doc.text(
        "Área responsable",
        38 + posicion,
        puntoFinSubSerie + 6,
        null,
        null,
        "center"
      );
      //----------------------------------------------------------------------------------------//
      doc.setFontSize(10);
      y = puntoFinSubSerie + 12;
      var lineAreaReponsable = doc.splitTextToSize(responsable, 55);
      for (var i = 0; i < lineAreaReponsable.length; i++) {
        doc.text(38 + posicion, y, lineAreaReponsable[i], null, "center");
        y = y + 4;
      }
      let rectanguloAreaResponsable = lineAreaReponsable.length * 5;
      doc.rect(
        8 + posicion,
        puntoFinSubSerie + 8,
        60,
        rectanguloAreaResponsable
      );
      let puntoFinAreaResponsable =
        puntoFinSubSerie + rectanguloAreaResponsable + 8;

      //---------------------------------------------------------------------------------------//
      doc.setFillColor(221, 217, 196);
      doc.rect(8 + posicion, puntoFinAreaResponsable, 60, 8, "FD");
      doc.setFontSize(15);
      doc.text(
        "Área generadora",
        38 + posicion,
        puntoFinAreaResponsable + 6,
        null,
        null,
        "center"
      );

      //---------------------------------------------------------------------------------------//
      doc.setFontSize(10);
      y = puntoFinAreaResponsable + 12;
      //let textSerie = **Ingresa variable**
      var lineAreaGeneradora = doc.splitTextToSize(generadora, 55);
      for (var i = 0; i < lineAreaGeneradora.length; i++) {
        doc.text(38 + posicion, y, lineAreaGeneradora[i], null, "center");
        y = y + 4;
      }
      let rectanguloAreaGeneradora = lineAreaGeneradora.length * 5;
      doc.rect(
        8 + posicion,
        puntoFinAreaResponsable + 8,
        60,
        rectanguloAreaGeneradora
      );
      let puntoFinAreaGeneradora =
        puntoFinAreaResponsable + rectanguloAreaGeneradora + 8;

      //---------------------------------------------------------------------------------------//
      doc.setFillColor(221, 217, 196);
      doc.rect(8 + posicion, puntoFinAreaGeneradora, 60, 8, "FD");
      doc.setFontSize(15);
      doc.text(
        "Clave de clasificación",
        38 + posicion,
        puntoFinAreaGeneradora + 6,
        null,
        null,
        "center"
      );

      //---------------------------------------------------------------------------------------//
      doc.setFontSize(10);
      y = puntoFinAreaGeneradora + 12;
      var lineClaveClasificacion = doc.splitTextToSize(
        expedientes[j].clave_Clasificacion,
        55
      );
      for (var i = 0; i < lineClaveClasificacion.length; i++) {
        doc.text(38 + posicion, y, lineClaveClasificacion[i], null, "center");
        y = y + 4;
      }
      let rectanguloClaveClasificacion = lineClaveClasificacion.length * 5;
      doc.rect(
        8 + posicion,
        puntoFinAreaGeneradora + 8,
        60,
        rectanguloClaveClasificacion
      );
      let puntoFinClaveClasificacion =
        puntoFinAreaGeneradora + rectanguloClaveClasificacion + 8;

      //---------------------------------------------------------------------------------------//
      doc.setFillColor(221, 217, 196);
      doc.rect(8 + posicion, puntoFinClaveClasificacion, 60, 8, "FD");
      doc.setFontSize(14);
      doc.text(
        "No. de Expediente Interno",
        38 + posicion,
        puntoFinClaveClasificacion + 6,
        null,
        null,
        "center"
      );

      //---------------------------------------------------------------------------------------//
      doc.setFontSize(10);
      y = puntoFinClaveClasificacion + 12;
      //let textSerie = **Ingresa variable**
      const arr_clave = expedientes[j].clave_Clasificacion.split('/')
      var lineExpedienteExterno = doc.splitTextToSize(
        expedientes[j].sub_Serie == null ? arr_clave[3] : arr_clave[4],
        55
      );
      for (var i = 0; i < lineExpedienteExterno.length; i++) {
        doc.text(38 + posicion, y, lineExpedienteExterno[i], null, "center");
        y = y + 4;
      }
      let rectanguloExpedienteExterno = lineExpedienteExterno.length * 5;
      doc.rect(
        8 + posicion,
        puntoFinClaveClasificacion + 8,
        60,
        rectanguloExpedienteExterno
      );
      let puntoFinExpedienteExterno =
        puntoFinClaveClasificacion + rectanguloExpedienteExterno + 8;
      //---------------------------------------------------------------------------------------//
      doc.setFillColor(221, 217, 196);
      doc.rect(8 + posicion, puntoFinExpedienteExterno, 60, 8, "FD");
      doc.setFontSize(16);
      doc.text(
        "Fechas Extremas (9)",
        38 + posicion,
        puntoFinExpedienteExterno + 6,
        null,
        null,
        "center"
      );
      //---------------------------------------------------------------------------------------//
      doc.setFontSize(10);
      y = puntoFinExpedienteExterno + 12;
      const arr_inicio = expedientes[j].fecha_Inicio.split('-')
      const arr_fin = expedientes[j].fecha_Termino.split('-')
      let textFecha = `${arr_inicio[0]} al ${arr_fin[0]}`;
      var lineFecha = doc.splitTextToSize(textFecha, 55);
      for (var i = 0; i < lineFecha.length; i++) {
        doc.text(38 + posicion, y, lineFecha[i], null, "center");
        y = y + 4;
      }
      let rectanguloFecha = lineFecha.length * 5;
      doc.rect(
        8 + posicion,
        puntoFinExpedienteExterno + 8,
        60,
        rectanguloFecha
      );
      let puntoFinFechas = puntoFinExpedienteExterno + rectanguloFecha + 8;
      //---------------------------------------------------------------------------------------//
      doc.setFillColor(221, 217, 196);
      doc.rect(8 + posicion, puntoFinFechas, 60, 8, "FD");
      doc.setFontSize(16);
      doc.text(
        "Valor documental",
        38 + posicion,
        puntoFinFechas + 6,
        null,
        null,
        "center"
      );
      //---------------------------------------------------------------------------------------//
      doc.setFontSize(10);
      y = puntoFinFechas + 12;
      var lineValor = doc.splitTextToSize(expedientes[j].valor_Documental, 55);
      for (var i = 0; i < lineValor.length; i++) {
        doc.text(38 + posicion, y, lineValor[i], null, "center");
        y = y + 4;
      }
      let rectanguloValor = lineValor.length * 5;
      doc.rect(8 + posicion, puntoFinFechas + 8, 60, rectanguloValor);

      if (posicion == 204) {
        doc.addPage();
        multiplo = 0;
      } else {
        multiplo = multiplo + 1;
      }

      //----------------------------------------------------------------------------------------//
    }
    doc.save("Anexo 5" + ".pdf");
    return {
      success: true,
      msj: "Recibo generado con éxito",
    };

  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
    };
  }

}

const genera_anexo_7 = async (solicitud, rows, complemento, tipo, comprobante) => {

  try {
    let img = new Image();
    let tituloArchivo = ""
    img.src = require("../assets/IEEN300.png");
    const doc = new jsPDF({ format: "letter" });
    if (tipo == 1) {
      tituloArchivo = "Anexo-7" + solicitud.folio + "-cedula"
      doc.addImage(img, "png", 13, 4, 28, 16);
      doc.setFontSize(12);
      doc.text(
        "Anexo 7 \n Archivo de trámite \n Cédula de prestamo de expedientes de Archivo de Trámite ",
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
        console.log("esto es rows", rows[i])
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
      y = y + alturaObservaciones + 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setFillColor(252, 213, 180);
      doc.rect(13, y, 90, 10, "FD");
      doc.rect(113, y, 90, 10, "FD");
      doc.text("Nombre y firma del solicitante", 58, y + 6, null, null, "center");
      doc.text(
        "Nombre y firma del encargado \n del archivo de trámite",
        158,
        y + 4,
        null,
        null,
        "center"
      );

      y = y + 10;
      doc.rect(13, y, 90, 15);
      doc.rect(113, y, 90, 15);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(solicitud.solicitante, 58, y + 8, null, null, "center");
      doc.text(complemento.responsable, 158, y + 8, null, null, "center");
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

    }
    else if (tipo == 2) {
      tituloArchivo = "Anexo-7" + solicitud.folio + "-recibo"
      doc.addImage(img, "png", 13, 4, 28, 16);
      doc.setFontSize(12);
      doc.text(
        "Anexo 7 \n Archivo de trámite \n Cédula de prestamo de expedientes de Archivo de Trámite ",
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

const genera_anexo_9 = (encabezado, inventarios) => {
  try {
    console.log(inventarios)
    let img = new Image();

    img.src = require("../assets/IEEN300.png");
    let totalPagesExp = "{total_pages_count_string}";
    const doc = new jsPDF({ orientation: "landscape", format: "legal" });
    doc.addImage(img, "png", 10, 4, 35, 21);
    doc.setFontSize(14);
    doc.text(
      "Anexo 9 \n Archivo de trámite \n Inventario de transferencia primaria ",
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
    doc.rect(240, 25, 100, 5, "FD");
    doc.rect(10, 30, 100, 5, "FD");
    doc.rect(10, 35, 100, 5, "FD");
    doc.rect(240, 35, 100, 5, "FD");
    doc.rect(10, 40, 100, 5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Nombre del área responsable", 12, 29);
    doc.text("Área generadora", 12, 34);
    doc.text("Nombre y cargo del Encargado de archivo de tramíte", 12, 39);
    doc.text("Sección", 12, 44);
    doc.text("Fecha de elaboración ", 290, 29, null, null, "center");
    doc.text("No. de transferencia ", 290, 39, null, null, "center");
    //Rectangulos de información y variables
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.rect(110, 25, 130, 5);
    doc.text(encabezado.area_Responsable, 112, 29);
    doc.rect(110, 30, 130, 5);
    doc.text(encabezado.area_Generadora, 112, 34);
    doc.rect(240, 30, 100, 5);
    doc.text(encabezado.fecha_Transferencia, 290, 34, null, null, "center");
    doc.rect(110, 35, 130, 5);
    doc.text(`${encabezado.valida_Area}, ${encabezado.puesto_Valida_Area}`, 112, 39);
    doc.rect(110, 40, 130, 5);
    doc.text(encabezado.secciones, 112, 44);
    doc.rect(240, 40, 100, 5);
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
        { content: "Signatura topográfica", rowSpan: 2 },
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
      startY: 46,
      margin: { left: 10, rigth: 16 },
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
    doc.text(`El presente inventario consta de ${doc.internal.getNumberOfPages()} hoja(s) y ampara la cantidad de ${inventarios.length} expediente(s) de los años ${encabezado.fecha_Antigua} - ${encabezado.fecha_Reciente} contenidos en ${encabezado.conteo_Cajas} caja(s) con un peso aproximado de ${encabezado.peso_Total} kilogramo(s).`, 12,
      doc.lastAutoTable.finalY + 4
    );
    doc.setPage(doc.internal.getNumberOfPages());
    doc.setFontSize(11);
    doc.text("Elaboró", 45, inicioFirmas, null, null, "center");
    doc.line(20, inicioFirmas + 15, 70, inicioFirmas + 15);
    doc.text("Valida", 130, inicioFirmas, null, null, "center");
    doc.line(105, inicioFirmas + 15, 155, inicioFirmas + 15);
    doc.text("Coteja", 215, inicioFirmas, null, null, "center");
    doc.line(190, inicioFirmas + 15, 240, inicioFirmas + 15);
    doc.text("Valida", 290, inicioFirmas, null, null, "center");
    doc.line(265, inicioFirmas + 15, 315, inicioFirmas + 15);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(
      encabezado.enlace,
      45,
      inicioFirmas + 20,
      null,
      null,
      "center"
    );
    doc.text(
      encabezado.valida_Area,
      130,
      inicioFirmas + 20,
      null,
      null,
      "center"
    );
    doc.text(
      encabezado.coteja,
      215,
      inicioFirmas + 20,
      null,
      null,
      "center"
    );
    doc.text(
      encabezado.valida,
      290,
      inicioFirmas + 20,
      null,
      null,
      "center"
    );

    doc.setFont("helvetica", "bold");

    var linesElaboro = doc.splitTextToSize(encabezado.puesto_Enlace, 65);
    var y = inicioFirmas + 24;
    for (var i = 0; i < linesElaboro.length; i++) {
      doc.text(45, y, linesElaboro[i], null, "center");
      y = y + 4;
    }

    var linesValido = doc.splitTextToSize(encabezado.puesto_Valida_Area, 65);
    var y = inicioFirmas + 24;
    for (var i = 0; i < linesValido.length; i++) {
      doc.text(130, y, linesValido[i], null, "center");
      y = y + 4;
    }

    var linesVobo = doc.splitTextToSize(encabezado.puesto_Coteja, 65);
    var y = inicioFirmas + 24;
    for (var i = 0; i < linesVobo.length; i++) {
      doc.text(215, y, linesVobo[i], null, "center");
      y = y + 4;
    }

    var linesSuperviso = doc.splitTextToSize(encabezado.puesto_Valida, 65);
    var y = inicioFirmas + 24;
    for (var i = 0; i < linesSuperviso.length; i++) {
      doc.text(290, y, linesSuperviso[i], null, "center");
      y = y + 4;
    }

    //Codigo numeracion de paginas
    doc.setFontSize(9);
    var footer = function () {
      var pageCount = doc.internal.getNumberOfPages();
      console.log("Esto es el total de paginas", pageCount);
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
    doc.save("Anexo 9" + ".pdf");
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

const genera_anexo_10 = (solicitud, rows) => {
  console.log(rows)
  try {
    let img = new Image();
    img.src = require("../assets/IEEN300.png");
    const doc = new jsPDF({ orientation: "landscape", format: "legal" });
    doc.addImage(img, "png", 166, 4, 28, 16);
    doc.setFontSize(12);
    doc.text(
      "Archivo de Trámite \n Cédula de identificación por caja",
      180,
      25,
      null,
      null,
      "center"
    );
    doc.setFillColor(244, 176, 132);
    doc.setDrawColor(0);
    doc.rect(40, 35, 270, 8, "FD");
    doc.rect(40, 43, 270, 17, "D");
    doc.rect(40, 60, 270, 15, "D");
    doc.rect(40, 75, 270, 15, "D");
    doc.rect(40, 90, 270, 15, "D");
    doc.rect(40, 105, 270, 15, "D");
    doc.rect(40, 120, 270, 8, "FD");
    doc.rect(40, 128, 270, 17, "D");
    doc.rect(40, 145, 270, 8, "FD");
    doc.rect(40, 153, 270, 20, "FD");

    doc.setLineWidth(.5);
    doc.line(175, 35, 175, 120)
    doc.line(130, 120, 130, 145)
    doc.line(220, 120, 220, 145)
    doc.line(70, 153, 70, 173)
    doc.line(70, 158, 310, 158)
    doc.line(130, 153, 130, 173)
    doc.line(190, 153, 190, 173)
    doc.line(250, 153, 250, 173)

    doc.setFontSize(11)
    doc.text(
      "ÁREA RESPONSABLE",
      108,
      64,
      null,
      null,
      "center"
    );
    doc.text(
      "ÁREA GENERADORA",
      243,
      64,
      null,
      null,
      "center"
    );
    doc.text(
      "SECCIÓN",
      108,
      79,
      null,
      null,
      "center"
    );
    doc.text(
      "SERIE Y SUBSERIE",
      243,
      79,
      null,
      null,
      "center"
    );
    doc.text(
      "VALOR DOCUMENTAL",
      108,
      94,
      null,
      null,
      "center"
    );
    doc.text(
      "TOTAL EXPEDIENTES",
      108,
      109,
      null,
      null,
      "center"
    );
    doc.text(
      "FECHAS EXTREMAS",
      243,
      109,
      null,
      null,
      "center"
    );

    doc.setFontSize(13);
    doc.text(
      "TRANSFERENCIA",
      108,
      41,
      null,
      null,
      "center"
    );
    doc.text(
      "CAJA",
      243,
      41,
      null,
      null,
      "center"
    );




    doc.text(
      "CLAVE DE CLASIFICACIÓN",
      85,
      126,
      null,
      null,
      "center"
    );
    doc.text(
      "VIGENCIA DOCUMENTAL",
      175,
      126,
      null,
      null,
      "center"
    );
    doc.text(
      "TOTAL DE CAJAS",
      265,
      126,
      null,
      null,
      "center"
    );
    doc.text(
      "PARA USO EXCLUSIVO DEL ARCHIVO DE CONCENTRACIÓN",
      180,
      151,
      null,
      null,
      "center"
    );
    //----------------------------------------------------------//
    doc.setFontSize(10);
    doc.text(
      "SIGNATURA\nTOPOGRÁFICA",
      55,
      163,
      null,
      null,
      "center"
    );
    doc.text(
      "INMUEBLE",
      100,
      157,
      null,
      null,
      "center"
    );
    doc.text(
      "PASILLO",
      160,
      157,
      null,
      null,
      "center"
    );
    doc.text(
      "ESTANTE",
      220,
      157,
      null,
      null,
      "center"
    );
    doc.text(
      "NIVEL",
      280,
      157,
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

export { espera, genera_anexo_4, genera_anexo_5, genera_anexo_7, genera_anexo_9, genera_anexo_10 };
