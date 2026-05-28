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

          formatearValor(
            item[col]
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

function formatearValor(valor) {
  if (valor === null || valor === undefined) {
    return '';
  }

  if (Array.isArray(valor)) {
    return valor
      .map((item) => formatearValor(item))
      .join(', ');
  }

  if (typeof valor === 'object') {
    if (valor.nombre) return String(valor.nombre);
    if (valor.estado) return String(valor.estado);
    if (valor.email) return String(valor.email);

    return Object.entries(valor)
      .map(([key, value]) => `${key}: ${formatearValor(value)}`)
      .join(', ');
  }

  return String(valor);
}
