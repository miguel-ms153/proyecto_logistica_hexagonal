import { exportarExcel } from '../../utils/exportExcel';
import { exportarPDF } from '../../utils/exportPDF';

function ExportButtons({ data, fileName }) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <button
        type="button"
        onClick={() => exportarExcel(data, fileName)}
        className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-semibold whitespace-nowrap"
      >
        Exportar Excel
      </button>

      <button
        type="button"
        onClick={() => exportarPDF(data, fileName)}
        className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-semibold whitespace-nowrap"
      >
        Exportar PDF
      </button>
    </div>
  );
}

export default ExportButtons;
