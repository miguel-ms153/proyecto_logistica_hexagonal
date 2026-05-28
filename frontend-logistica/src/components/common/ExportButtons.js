import { exportarExcel } from '../../utils/exportExcel';
import { exportarPDF } from '../../utils/exportPDF';

function ExportButtons({ data, fileName }) {
  return (
    <div className="flex flex-wrap gap-3 mb-5">
      <button
        type="button"
        onClick={() => exportarExcel(data, fileName)}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-semibold whitespace-nowrap text-sm"
      >
        Exportar Excel
      </button>

      <button
        type="button"
        onClick={() => exportarPDF(data, fileName)}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-semibold whitespace-nowrap text-sm"
      >
        Exportar PDF
      </button>
    </div>
  );
}

export default ExportButtons;
