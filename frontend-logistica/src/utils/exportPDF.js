import jsPDF from 'jspdf';

import autoTable
from 'jspdf-autotable';

export const exportarPDF = (
  datos,
  titulo = 'Reporte'
) => {

  const doc =
    new jsPDF();

  // VALIDAR

  if (
    !datos ||
    datos.length === 0
  ) {

    alert(
      'No hay datos para exportar'
    );

    return;

  }

  // TITULO

  doc.setFontSize(18);

  doc.text(
    titulo,
    14,
    20
  );

  // COLUMNAS DINÁMICAS

  const columnas =
    Object.keys(datos[0]);

  // FILAS

  const filas =
    datos.map((item) =>

      columnas.map(
        (col) =>

          String(
            item[col] ?? ''
          )
      )
    );

  // TABLA

  autoTable(doc, {

    startY: 30,

    head: [columnas],

    body: filas

  });

  // DESCARGAR

  doc.save(
    `${titulo}.pdf`
  );

};