import * as XLSX
from 'xlsx';

import {
  saveAs
} from 'file-saver';

export const exportarExcel = (
  datos,
  nombreArchivo =
    'reporte'
) => {

  if (
    !datos ||
    datos.length === 0
  ) {

    alert(
      'No hay datos para exportar'
    );

    return;

  }

  // CONVERTIR JSON

  const worksheet =
    XLSX.utils.json_to_sheet(
      datos
    );

  // ANCHO COLUMNAS

  worksheet['!cols'] =

    Object.keys(
      datos[0]
    ).map(() => ({

      wch: 25

    }));

  // CREAR LIBRO

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(

    workbook,

    worksheet,

    'Reporte'

  );

  // GENERAR BUFFER

  const excelBuffer =
    XLSX.write(

      workbook,

      {

        bookType: 'xlsx',

        type: 'array'

      }

    );

  // BLOB

  const fileData =
    new Blob(

      [excelBuffer],

      {

        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'

      }

    );

  // DESCARGAR

  saveAs(

    fileData,

    `${nombreArchivo}.xlsx`

  );

};