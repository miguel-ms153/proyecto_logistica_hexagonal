import { useEffect, useMemo, useState } from 'react';

import DataTable from 'react-data-table-component';

import Sidebar from '../components/Sidebar';

import API from '../services/api';

import { exportarExcel } from '../utils/exportExcel';
import { exportarPDF } from '../utils/exportPDF';

function Bitacora() {
  const [registros, setRegistros] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modulo, setModulo] = useState('');
  const [accion, setAccion] = useState('');
  const [error, setError] = useState('');

  const obtenerBitacora = async () => {
    try {
      const res = await API.get('/bitacora');

      setRegistros(res.data);
    } catch (error) {
      console.log(error);
      setError('No se pudo cargar la bitacora del sistema');
    }
  };

  useEffect(() => {
    obtenerBitacora();
  }, []);

  const modulos = useMemo(() => {
    return [...new Set(registros.map((item) => item.modulo).filter(Boolean))];
  }, [registros]);

  const acciones = useMemo(() => {
    return [...new Set(registros.map((item) => item.accion).filter(Boolean))];
  }, [registros]);

  const filtrados = useMemo(() => {
    const texto = busqueda.toLowerCase();

    return registros.filter((item) => {
      const coincideTexto = [
        item.usuario,
        item.email,
        item.rol,
        item.accion,
        item.modulo,
        item.detalle,
        item.ruta
      ]
        .join(' ')
        .toLowerCase()
        .includes(texto);

      const coincideModulo = modulo ? item.modulo === modulo : true;
      const coincideAccion = accion ? item.accion === accion : true;

      return coincideTexto && coincideModulo && coincideAccion;
    });
  }, [registros, busqueda, modulo, accion]);

  const creaciones = registros.filter((item) => item.accion === 'CREAR').length;
  const ediciones = registros.filter((item) => item.accion === 'EDITAR').length;
  const eliminaciones = registros.filter((item) => item.accion === 'ELIMINAR').length;

  const columns = [
    {
      name: 'ID',
      selector: (row) => row.id_bitacora,
      sortable: true,
      width: '80px'
    },
    {
      name: 'Fecha',
      selector: (row) => formatearFecha(row.fecha),
      sortable: true,
      grow: 2
    },
    {
      name: 'Usuario',
      cell: (row) => (
        <div>
          <p className="font-bold text-slate-800">{row.usuario}</p>
          <p className="text-sm text-gray-500">{row.rol}</p>
        </div>
      ),
      grow: 2
    },
    {
      name: 'Accion',
      cell: (row) => <AccionBadge accion={row.accion} />
    },
    {
      name: 'Modulo',
      selector: (row) => row.modulo,
      sortable: true
    },
    {
      name: 'Detalle',
      selector: (row) => row.detalle,
      grow: 3
    },
    {
      name: 'HTTP',
      selector: (row) => row.estado_http || 'N/A'
    }
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#0f172a',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '15px'
      }
    },
    rows: {
      style: {
        minHeight: '72px',
        fontSize: '15px'
      }
    }
  };

  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8 overflow-x-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Bitacora del Sistema
            </h1>

            <p className="text-gray-500 mt-2">
              Auditoria de acciones realizadas por usuarios en modulos operativos
            </p>
          </div>

          <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-semibold shadow-lg w-fit">
            Total: {registros.length}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl font-bold mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KPI titulo="Registros" valor={registros.length} color="bg-blue-600" />
          <KPI titulo="Creaciones" valor={creaciones} color="bg-green-600" />
          <KPI titulo="Ediciones" valor={ediciones} color="bg-yellow-500" />
          <KPI titulo="Eliminaciones" valor={eliminaciones} color="bg-red-600" />
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <input
              type="text"
              placeholder="Buscar por usuario, modulo, accion o detalle..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={inputStyle}
            />

            <select
              value={modulo}
              onChange={(e) => setModulo(e.target.value)}
              className={inputStyle}
            >
              <option value="">Todos los modulos</option>

              {modulos.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={accion}
              onChange={(e) => setAccion(e.target.value)}
              className={inputStyle}
            >
              <option value="">Todas las acciones</option>

              {acciones.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <button
            type="button"
            onClick={() => exportarExcel(filtrados, 'bitacora')}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-bold"
          >
            Exportar Excel
          </button>

          <button
            type="button"
            onClick={() => exportarPDF(filtrados, 'bitacora')}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-bold"
          >
            Exportar PDF
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <DataTable
            columns={columns}
            data={filtrados}
            pagination
            responsive
            striped
            highlightOnHover
            fixedHeader
            fixedHeaderScrollHeight="560px"
            customStyles={customStyles}
          />
        </div>
      </div>
    </div>
  );
}

function KPI({ titulo, valor, color }) {
  return (
    <div className={`${color} text-white p-6 rounded-2xl shadow-lg`}>
      <p className="text-lg font-medium">{titulo}</p>
      <h2 className="text-4xl font-bold mt-3">{valor}</h2>
    </div>
  );
}

function AccionBadge({ accion }) {
  let color = 'bg-slate-600';

  if (accion === 'CREAR') color = 'bg-green-600';
  else if (accion === 'EDITAR') color = 'bg-yellow-500';
  else if (accion === 'ELIMINAR') color = 'bg-red-600';

  return (
    <span className={`${color} text-white px-4 py-2 rounded-full text-sm font-bold w-fit`}>
      {accion}
    </span>
  );
}

function formatearFecha(fecha) {
  if (!fecha) return 'N/A';

  return new Date(fecha).toLocaleString('es-EC', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

const inputStyle = `
  w-full
  border
  border-gray-300
  rounded-xl
  p-4
  outline-none
  focus:ring-2
  focus:ring-blue-500
`;

export default Bitacora;
