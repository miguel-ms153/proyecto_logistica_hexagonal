import { useEffect, useState } from 'react';

import API from '../services/api';

import Sidebar from '../components/Sidebar';

import DataTable from 'react-data-table-component';

import { exportarExcel } from '../utils/exportExcel';

import { exportarPDF } from '../utils/exportPDF';

function Embarques() {
  const [embarques, setEmbarques] = useState([]);

  const [idOrden, setIdOrden] = useState('');
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [estado, setEstado] = useState('En camino');

  const [tipoTransporte, setTipoTransporte] = useState('Marítimo');
  const [ubicacion, setUbicacion] = useState('');
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');

  const [busqueda, setBusqueda] = useState('');

  const [editando, setEditando] = useState(false);
  const [embarqueEditando, setEmbarqueEditando] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const obtenerEmbarques = async () => {
    try {
      const res = await API.get('/embarques');

      setEmbarques(res.data);
    } catch (error) {
      console.log(error);

      setError('No se pudieron cargar los embarques');
    }
  };

  useEffect(() => {
    obtenerEmbarques();
  }, []);

  const limpiarFormulario = () => {
    setIdOrden('');
    setOrigen('');
    setDestino('');
    setEstado('En camino');
    setTipoTransporte('Marítimo');
    setUbicacion('');
    setLatitud('');
    setLongitud('');
    setEditando(false);
    setEmbarqueEditando(null);
    setError('');
  };

  const guardarEmbarque = async () => {
    if (!idOrden || !origen || !destino || !estado || !tipoTransporte) {
      setError('ID Orden, origen, destino, estado y transporte son obligatorios');
      return;
    }

    const data = {
      id_orden: Number(idOrden),
      origen,
      destino,
      estado
    };

    const trackingData = {
      id_orden: Number(idOrden),
      origen,
      destino,
      ubicacion: ubicacion || origen,
      estado,
      tipo_transporte: tipoTransporte,
      latitud: latitud ? Number(latitud) : undefined,
      longitud: longitud ? Number(longitud) : undefined,
      riesgo: calcularRiesgoInicial(estado, tipoTransporte)
    };

    try {
      setLoading(true);
      setError('');

      if (editando && embarqueEditando) {
        await API.put(`/embarques/${embarqueEditando.id_embarque}`, data);
      } else {
        await API.post('/embarques', data);
      }

      await API.post('/tracking', trackingData);

      await obtenerEmbarques();

      limpiarFormulario();
    } catch (error) {
      console.log(error);

      setError(
        error.response?.data?.error ||
        error.response?.data?.message ||
        'No se pudo guardar el embarque'
      );
    } finally {
      setLoading(false);
    }
  };

  const editarEmbarque = (embarque) => {
    setEditando(true);
    setEmbarqueEditando(embarque);
    setIdOrden(embarque.id_orden || '');
    setOrigen(embarque.origen || '');
    setDestino(embarque.destino || '');
    setEstado(embarque.estado || 'En camino');

    setTipoTransporte(embarque.tipo_transporte || 'Marítimo');
    setUbicacion(embarque.ubicacion || embarque.origen || '');
    setLatitud(embarque.latitud || '');
    setLongitud(embarque.longitud || '');

    setError('');
  };

  const eliminarEmbarque = async (id) => {
    const confirmar = window.confirm(
      '¿Seguro que deseas eliminar este embarque?'
    );

    if (!confirmar) return;

    try {
      setError('');

      await API.delete(`/embarques/${id}`);

      obtenerEmbarques();
    } catch (error) {
      console.log(error);

      setError('No se pudo eliminar el embarque');
    }
  };

  const filtrados = embarques.filter((e) => {
    const texto = busqueda.toLowerCase();

    return (
      String(e.id_embarque).includes(texto) ||
      String(e.id_orden || '').includes(texto) ||
      e.origen?.toLowerCase().includes(texto) ||
      e.destino?.toLowerCase().includes(texto) ||
      e.estado?.toLowerCase().includes(texto)
    );
  });

  const enCamino = embarques.filter(
    (e) => e.estado === 'En camino' || e.estado === 'En tránsito'
  ).length;

  const entregados = embarques.filter((e) => e.estado === 'Entregado').length;

  const retrasados = embarques.filter((e) => e.estado === 'Retrasado').length;

  const ordenesVinculadas = new Set(
    embarques.map((e) => e.id_orden).filter(Boolean)
  ).size;

  const columns = [
    {
      name: 'ID',
      width: '80px',
      selector: (row) => row.id_embarque,
      sortable: true
    },
    {
      name: 'Orden',
      width: '120px',
      selector: (row) => row.id_orden || 'N/A',
      sortable: true,
      cell: (row) => (
        <span className="font-semibold text-slate-700">
          {row.id_orden ? `#${row.id_orden}` : 'N/A'}
        </span>
      )
    },
    {
      name: 'Origen',
      minWidth: '170px',
      selector: (row) => row.origen || 'N/A',
      sortable: true
    },
    {
      name: 'Destino',
      minWidth: '170px',
      selector: (row) => row.destino || 'N/A',
      sortable: true
    },
    {
      name: 'Ruta',
      minWidth: '240px',
      selector: (row) => `${row.origen || 'N/A'} - ${row.destino || 'N/A'}`,
      cell: (row) => (
        <span className="font-semibold text-slate-700">
          {row.origen || 'N/A'} → {row.destino || 'N/A'}
        </span>
      )
    },
    {
      name: 'Estado',
      width: '170px',
      selector: (row) => row.estado || 'Sin estado',
      sortable: true,
      cell: (row) => <EstadoBadge estado={row.estado} />
    },
    {
      name: 'Acciones',
      width: '240px',
      cell: (row) => (
        <div className="flex gap-3 w-full justify-center">
          <button
            onClick={() => editarEmbarque(row)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white min-w-[90px] px-4 py-3 rounded-xl font-semibold whitespace-nowrap"
          >
            Editar
          </button>

          <button
            onClick={() => eliminarEmbarque(row.id_embarque)}
            className="bg-red-600 hover:bg-red-700 text-white min-w-[105px] px-4 py-3 rounded-xl font-semibold whitespace-nowrap"
          >
            Eliminar
          </button>
        </div>
      )
    }
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#0f172a',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '15px',
        minHeight: '62px'
      }
    },
    rows: {
      style: {
        minHeight: '78px',
        fontSize: '15px'
      }
    }
  };

  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8 overflow-x-hidden">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-5 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Gestión de Embarques
            </h1>

            <p className="text-gray-500 mt-2">
              Control logístico con actualización automática de tracking
            </p>
          </div>

          <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-semibold shadow-lg whitespace-nowrap">
            Total: {embarques.length}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KPI titulo="En Camino" valor={enCamino} color="bg-blue-600" />
          <KPI titulo="Entregados" valor={entregados} color="bg-green-600" />
          <KPI titulo="Retrasados" valor={retrasados} color="bg-red-600" />
          <KPI titulo="Órdenes" valor={ordenesVinculadas} color="bg-slate-800" />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {editando ? 'Editar Embarque' : 'Nuevo Embarque'}
              </h2>

              <p className="text-gray-500 mt-1">
                Registra embarques y actualiza el tracking GPS en tiempo real
              </p>
            </div>

            {editando && (
              <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-xl font-semibold w-fit">
                Modo edición
              </span>
            )}
          </div>

          {error && (
            <div className="mb-5 bg-red-100 text-red-700 px-4 py-3 rounded-xl font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <input
              type="number"
              placeholder="ID Orden"
              value={idOrden}
              onChange={(e) => setIdOrden(e.target.value)}
              className={inputStyle}
            />

            <input
              type="text"
              placeholder="Origen"
              value={origen}
              onChange={(e) => setOrigen(e.target.value)}
              className={inputStyle}
            />

            <input
              type="text"
              placeholder="Destino"
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              className={inputStyle}
            />

            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className={inputStyle}
            >
              <option value="En camino">En camino</option>
              <option value="En tránsito">En tránsito</option>
              <option value="En puerto">En puerto</option>
              <option value="Entregado">Entregado</option>
              <option value="Retrasado">Retrasado</option>
            </select>

            <select
              value={tipoTransporte}
              onChange={(e) => setTipoTransporte(e.target.value)}
              className={inputStyle}
            >
              <option value="Marítimo">Marítimo</option>
              <option value="Aéreo">Aéreo</option>
              <option value="Terrestre">Terrestre</option>
            </select>

            <input
              type="text"
              placeholder="Ubicación actual"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              className={inputStyle}
            />

            <input
              type="number"
              placeholder="Latitud"
              value={latitud}
              onChange={(e) => setLatitud(e.target.value)}
              className={inputStyle}
            />

            <input
              type="number"
              placeholder="Longitud"
              value={longitud}
              onChange={(e) => setLongitud(e.target.value)}
              className={inputStyle}
            />
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={guardarEmbarque}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-xl font-semibold whitespace-nowrap"
            >
              {loading
                ? 'Guardando...'
                : editando
                  ? 'Actualizar Embarque y Tracking'
                  : 'Crear Embarque y Tracking'}
            </button>

            {editando && (
              <button
                onClick={limpiarFormulario}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold whitespace-nowrap"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow mb-6">
          <input
            type="text"
            placeholder="Buscar por ID, orden, origen, destino o estado..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={inputStyle}
          />
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => exportarExcel(filtrados, 'embarques')}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-semibold shadow-lg whitespace-nowrap"
          >
            Exportar Excel
          </button>

          <button
            onClick={() => exportarPDF(filtrados, 'embarques')}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-semibold shadow-lg whitespace-nowrap"
          >
            Exportar PDF
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 overflow-x-auto">
          <DataTable
            columns={columns}
            data={filtrados}
            pagination
            highlightOnHover
            striped
            responsive
            selectableRows
            fixedHeader
            fixedHeaderScrollHeight="500px"
            customStyles={customStyles}
            noDataComponent="No hay embarques registrados"
          />
        </div>
      </div>
    </div>
  );
}

function calcularRiesgoInicial(estado, tipoTransporte) {
  if (estado === 'Retrasado') return 'ALTO';

  if (tipoTransporte === 'Marítimo' && estado === 'En puerto') {
    return 'MEDIO';
  }

  return 'BAJO';
}

function KPI({ titulo, valor, color }) {
  return (
    <div className={`${color} text-white p-6 rounded-2xl shadow-lg`}>
      <p className="text-lg font-medium">{titulo}</p>

      <h2 className="text-4xl font-bold mt-3">{valor}</h2>
    </div>
  );
}

function EstadoBadge({ estado }) {
  let color = 'bg-gray-500';

  const texto = estado || 'Sin estado';

  if (texto === 'Entregado') {
    color = 'bg-green-600';
  } else if (texto === 'Retrasado') {
    color = 'bg-red-600';
  } else if (texto === 'En tránsito') {
    color = 'bg-blue-600';
  } else if (texto === 'En puerto') {
    color = 'bg-yellow-500';
  } else if (texto === 'En camino') {
    color = 'bg-slate-500';
  }

  return (
    <span
      className={`
        ${color}
        text-white
        min-w-[120px]
        text-center
        px-4
        py-2
        rounded-full
        text-sm
        font-semibold
        whitespace-nowrap
        inline-block
      `}
    >
      {texto}
    </span>
  );
}

const inputStyle = `
  w-full
  border
  border-gray-300
  rounded-xl
  p-4
  outline-none
  bg-white
  focus:ring-2
  focus:ring-blue-500
`;

export default Embarques;