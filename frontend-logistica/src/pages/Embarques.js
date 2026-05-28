import { useEffect, useState } from 'react';

import API from '../services/api';

import AlertMessage from '../components/common/AlertMessage';
import DataTableCard from '../components/common/DataTableCard';
import ExportButtons from '../components/common/ExportButtons';
import FormActions from '../components/common/FormActions';
import KpiGrid from '../components/common/KpiGrid';
import PageHeader from '../components/common/PageHeader';
import PageLayout from '../components/common/PageLayout';
import SearchBox from '../components/common/SearchBox';
import SectionCard from '../components/common/SectionCard';
import StatusBadge from '../components/common/StatusBadge';

const transportes = [
  {
    label: 'Maritimo',
    value: 'Mar\u00edtimo'
  },
  {
    label: 'Aereo',
    value: 'A\u00e9reo'
  },
  {
    label: 'Terrestre',
    value: 'Terrestre'
  }
];

function Embarques() {
  const [embarques, setEmbarques] = useState([]);

  const [idOrden, setIdOrden] = useState('');
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [estado, setEstado] = useState('En camino');

  const [tipoTransporte, setTipoTransporte] = useState('Mar\u00edtimo');
  const [ubicacion, setUbicacion] = useState('');
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');

  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState(false);
  const [embarqueEditando, setEmbarqueEditando] = useState(null);

  const [loading, setLoading] = useState(false);
  const [buscandoCoordenadas, setBuscandoCoordenadas] = useState(false);
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
    setTipoTransporte('Mar\u00edtimo');
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
    setTipoTransporte(embarque.tipo_transporte || 'Mar\u00edtimo');
    setUbicacion(embarque.ubicacion || embarque.origen || '');
    setLatitud(embarque.latitud || '');
    setLongitud(embarque.longitud || '');
    setError('');
  };

  const buscarCoordenadas = async () => {
    const lugar = ubicacion || destino || origen;

    if (!lugar.trim()) {
      setError('Ingresa una ubicacion, origen o destino para buscar coordenadas');
      return;
    }

    try {
      setBuscandoCoordenadas(true);
      setError('');

      const params = new URLSearchParams({
        q: lugar,
        format: 'json',
        limit: '1'
      });

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`
      );

      const data = await res.json();

      if (!data.length) {
        setError('No se encontraron coordenadas para esa ubicacion');
        return;
      }

      setLatitud(Number(data[0].lat).toFixed(6));
      setLongitud(Number(data[0].lon).toFixed(6));

      if (!ubicacion) {
        setUbicacion(lugar);
      }
    } catch (error) {
      console.log(error);
      setError('No se pudieron buscar las coordenadas');
    } finally {
      setBuscandoCoordenadas(false);
    }
  };

  const eliminarEmbarque = async (id) => {
    const confirmar = window.confirm('Seguro que deseas eliminar este embarque?');

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

  const filtrados = embarques.filter((embarque) => {
    const texto = busqueda.toLowerCase();

    return (
      String(embarque.id_embarque).includes(texto) ||
      String(embarque.id_orden || '').includes(texto) ||
      embarque.origen?.toLowerCase().includes(texto) ||
      embarque.destino?.toLowerCase().includes(texto) ||
      embarque.estado?.toLowerCase().includes(texto)
    );
  });

  const enCamino = embarques.filter(
    (embarque) =>
      embarque.estado === 'En camino' ||
      embarque.estado === 'En transito' ||
      embarque.estado === 'En tránsito'
  ).length;

  const entregados = embarques.filter(
    (embarque) => embarque.estado === 'Entregado'
  ).length;

  const retrasados = embarques.filter(
    (embarque) => embarque.estado === 'Retrasado'
  ).length;

  const ordenesVinculadas = new Set(
    embarques.map((embarque) => embarque.id_orden).filter(Boolean)
  ).size;

  const columns = [
    {
      name: 'ID',
      width: '70px',
      selector: (row) => row.id_embarque,
      sortable: true
    },
    {
      name: 'Orden',
      width: '90px',
      selector: (row) => row.id_orden || 'N/A',
      sortable: true,
      cell: (row) => (
        <span className="font-semibold text-slate-700">
          {row.id_orden ? `#${row.id_orden}` : 'N/A'}
        </span>
      )
    },
    {
      name: 'Ruta',
      minWidth: '250px',
      grow: 2,
      selector: (row) => `${row.origen || 'N/A'} - ${row.destino || 'N/A'}`,
      cell: (row) => (
        <div className="min-w-0">
          <p className="font-bold text-slate-800 truncate" title={`${row.origen || 'N/A'} hacia ${row.destino || 'N/A'}`}>
            {row.origen || 'N/A'} hacia {row.destino || 'N/A'}
          </p>

          <p className="text-xs text-slate-500">
            Embarque #{row.id_embarque}
          </p>
        </div>
      )
    },
    {
      name: 'Transporte',
      width: '125px',
      selector: (row) => row.tipo_transporte || 'N/A',
      cell: (row) => (
        <span className="font-semibold text-slate-700 truncate block max-w-[105px]">
          {normalizarTransporte(row.tipo_transporte)}
        </span>
      )
    },
    {
      name: 'Estado',
      width: '135px',
      selector: (row) => row.estado || 'Sin estado',
      sortable: true,
      cell: (row) => <EstadoBadge estado={row.estado} />
    },
    {
      name: 'Tracking',
      width: '145px',
      selector: (row) => row.ubicacion || row.origen || 'N/A',
      cell: (row) => (
        <div className="text-sm">
          <p className="font-semibold text-slate-700 truncate max-w-[120px]" title={row.ubicacion || row.origen || 'N/A'}>
            {row.ubicacion || row.origen || 'N/A'}
          </p>
          <p className="text-xs text-slate-500">
            {row.latitud && row.longitud ? 'GPS listo' : 'Sin GPS'}
          </p>
        </div>
      )
    },
    {
      name: 'Acciones',
      width: '170px',
      cell: (row) => (
        <div className="flex gap-2 w-full justify-end">
          <button
            type="button"
            onClick={() => editarEmbarque(row)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white min-w-[72px] px-3 py-2 rounded-lg font-semibold whitespace-nowrap text-xs"
          >
            Editar
          </button>

          <button
            type="button"
            onClick={() => eliminarEmbarque(row.id_embarque)}
            className="bg-red-600 hover:bg-red-700 text-white min-w-[80px] px-3 py-2 rounded-lg font-semibold whitespace-nowrap text-xs"
          >
            Eliminar
          </button>
        </div>
      )
    }
  ];

  const tableStyles = {
    headRow: {
      style: {
        backgroundColor: '#0f172a',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '13px',
        minHeight: '46px'
      }
    },
    rows: {
      style: {
        minHeight: '54px',
        fontSize: '13px'
      }
    },
    cells: {
      style: {
        paddingLeft: '12px',
        paddingRight: '12px'
      }
    },
    headCells: {
      style: {
        paddingLeft: '12px',
        paddingRight: '12px'
      }
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Gestion de Embarques"
        subtitle="Control logistico con actualizacion automatica de tracking"
        badge={`Total: ${embarques.length}`}
      />

      <KpiGrid
        items={[
          { title: 'En Camino', value: enCamino, color: 'bg-blue-600' },
          { title: 'Entregados', value: entregados, color: 'bg-green-600' },
          { title: 'Retrasados', value: retrasados, color: 'bg-red-600' },
          { title: 'Ordenes', value: ordenesVinculadas, color: 'bg-slate-800' }
        ]}
      />

      <SectionCard
        title={editando ? 'Editar Embarque' : 'Nuevo Embarque'}
        subtitle="Registra embarques y actualiza el tracking GPS en tiempo real"
        className="!mb-5"
      >
        {editando && (
          <div className="mb-5">
            <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-xl font-semibold w-fit">
              Modo edicion
            </span>
          </div>
        )}

        <AlertMessage message={error} />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
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
            <option value="En transito">En transito</option>
            <option value="En puerto">En puerto</option>
            <option value="Entregado">Entregado</option>
            <option value="Retrasado">Retrasado</option>
          </select>

          <select
            value={tipoTransporte}
            onChange={(e) => setTipoTransporte(e.target.value)}
            className={inputStyle}
          >
            {transportes.map((transporte) => (
              <option key={transporte.value} value={transporte.value}>
                {transporte.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Coordenadas de tracking
              </h3>

              <p className="text-xs text-slate-500">
                Usa la ubicacion actual, destino u origen para completar GPS.
              </p>
            </div>

            <button
              type="button"
              onClick={buscarCoordenadas}
              disabled={buscandoCoordenadas}
              className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg font-semibold whitespace-nowrap text-xs"
            >
              {buscandoCoordenadas ? 'Buscando...' : 'Buscar coordenadas'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Ubicacion actual"
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
        </div>

        <FormActions
          loading={loading}
          editing={editando}
          createLabel="Crear Embarque y Tracking"
          updateLabel="Actualizar Embarque y Tracking"
          onSubmit={guardarEmbarque}
          onCancel={limpiarFormulario}
        />
      </SectionCard>

      <SearchBox
        value={busqueda}
        onChange={setBusqueda}
        placeholder="Buscar por ID, orden, origen, destino o estado..."
      />

      <ExportButtons data={filtrados} fileName="embarques" />

      <DataTableCard
        columns={columns}
        data={filtrados}
        noData="No hay embarques registrados"
        selectableRows={false}
        dense
        customStyles={tableStyles}
      />
    </PageLayout>
  );
}

function normalizarTransporte(transporte) {
  if (!transporte) return 'N/A';
  if (transporte === 'Mar\u00edtimo' || transporte === 'Maritimo') return 'Maritimo';
  if (transporte === 'A\u00e9reo' || transporte === 'Aereo') return 'Aereo';

  return transporte;
}

function calcularRiesgoInicial(estado, tipoTransporte) {
  if (estado === 'Retrasado') return 'ALTO';

  if (
    (tipoTransporte === 'Mar\u00edtimo' || tipoTransporte === 'Maritimo') &&
    estado === 'En puerto'
  ) {
    return 'MEDIO';
  }

  return 'BAJO';
}

function EstadoBadge({ estado }) {
  let color = 'bg-gray-500';
  const texto = estado || 'Sin estado';

  if (texto === 'Entregado') {
    color = 'bg-green-600';
  } else if (texto === 'Retrasado') {
    color = 'bg-red-600';
  } else if (texto === 'En transito' || texto === 'En tránsito') {
    color = 'bg-blue-600';
  } else if (texto === 'En puerto') {
    color = 'bg-yellow-500';
  } else if (texto === 'En camino') {
    color = 'bg-slate-500';
  }

  return (
    <StatusBadge
      text={texto}
      color={color}
      minWidth="min-w-[105px]"
    />
  );
}

const inputStyle = `
  w-full
  border
  border-gray-300
  rounded-lg
  px-4
  py-3
  outline-none
  bg-white
  focus:ring-2
  focus:ring-blue-500
  text-sm
`;

export default Embarques;
