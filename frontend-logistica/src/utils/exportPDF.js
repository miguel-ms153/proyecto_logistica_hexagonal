import jsPDF from 'jspdf';

import autoTable from 'jspdf-autotable';

export const exportarPDF = (
  datos,
  titulo = 'Reporte'
) => {
  if (!datos || datos.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  const columnas = Object.keys(datos[0]);
  const horizontal = columnas.length > 6;

  const doc = new jsPDF({
    orientation: horizontal ? 'landscape' : 'portrait'
  });

  const filas = datos.map((item) =>
    columnas.map((col) => formatearValor(item[col]))
  );

  doc.setFontSize(14);
  doc.text(titulo, 10, 18);

  autoTable(doc, {
    startY: 26,
    head: [columnas],
    body: filas,
    margin: {
      left: 8,
      right: 8
    },
    styles: {
      fontSize: horizontal ? 7 : 9,
      cellPadding: 2,
      overflow: 'linebreak',
      valign: 'middle'
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    }
  });

  doc.save(`${titulo}.pdf`);
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
