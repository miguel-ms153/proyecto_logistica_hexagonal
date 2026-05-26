import { useEffect, useState } from 'react';

import API from '../services/api';

import Sidebar from '../components/Sidebar';

import DataTable from 'react-data-table-component';

import { exportarExcel } from '../utils/exportExcel';

import { exportarPDF } from '../utils/exportPDF';

function Pagos() {
  const [pagos, setPagos] = useState([]);

  const [idOrden, setIdOrden] = useState('');
  const [monto, setMonto] = useState('');
  const [metodo, setMetodo] = useState('Transferencia');
  const [estado, setEstado] = useState('Pendiente');
  const [fecha, setFecha] = useState('');

  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState(false);
  const [pagoEditando, setPagoEditando] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const obtenerPagos = async () => {
    try {
      const res = await API.get('/pagos');
      setPagos(res.data);
    } catch (error) {
      console.log(error);
      setError('No se pudieron cargar los pagos');
    }
  };

  useEffect(() => {
    obtenerPagos();
  }, []);

  const limpiarFormulario = () => {
    setIdOrden('');
    setMonto('');
    setMetodo('Transferencia');
    setEstado('Pendiente');
    setFecha('');
    setEditando(false);
    setPagoEditando(null);
    setError('');
  };

  const guardarPago = async () => {
    if (!idOrden || !monto || !metodo || !estado || !fecha) {
      setError('Todos los campos son obligatorios');
      return;
    }

    const data = {
      id_orden: Number(idOrden),
      monto: Number(monto),
      metodo,
      estado,
      fecha
    };

    try {
      setLoading(true);
      setError('');

      if (editando && pagoEditando) {
        await API.put(`/pagos/${pagoEditando.id_pago}`, data);
      } else {
        await API.post('/pagos', data);
      }

      await obtenerPagos();
      limpiarFormulario();
    } catch (error) {
      console.log(error);

      setError(
        error.response?.data?.error ||
        error.response?.data?.message ||
        'No se pudo guardar el pago'
      );
    } finally {
      setLoading(false);
    }
  };

  const editarPago = (pago) => {
    setEditando(true);
    setPagoEditando(pago);
    setIdOrden(pago.id_orden || '');
    setMonto(pago.monto || '');
    setMetodo(pago.metodo || 'Transferencia');
    setEstado(pago.estado || 'Pendiente');
    setFecha(pago.fecha?.split('T')[0] || pago.fecha || '');
    setError('');
  };

  const eliminarPago = async (id) => {
    const confirmar = window.confirm('¿Seguro que deseas eliminar este pago?');

    if (!confirmar) return;

    try {
      setError('');
      await API.delete(`/pagos/${id}`);
      obtenerPagos();
    } catch (error) {
      console.log(error);
      setError('No se pudo eliminar el pago');
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';

    return new Date(fecha).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const filtrados = pagos.filter((p) => {
    const texto = busqueda.toLowerCase();

    return (
      String(p.id_pago).includes(texto) ||
      String(p.id_orden).includes(texto) ||
      p.estado?.toLowerCase().includes(texto) ||
      p.metodo?.toLowerCase().includes(texto)
    );
  });

  const totalIngresos = pagos.reduce(
    (acc, p) => acc + Number(p.monto || 0),
    0
  );

  const aprobados = pagos.filter((p) => p.estado === 'Aprobado').length;
  const pendientes = pagos.filter((p) => p.estado === 'Pendiente').length;
  const rechazados = pagos.filter((p) => p.estado === 'Rechazado').length;

  const columns = [
    {
      name: 'ID',
      width: '80px',
      selector: (row) => row.id_pago,
      sortable: true
    },
    {
      name: 'Orden',
      width: '120px',
      selector: (row) => row.id_orden,
      sortable: true,
      cell: (row) => (
        <span className="font-semibold text-slate-700">
          #{row.id_orden}
        </span>
      )
    },
    {
      name: 'Monto',
      width: '150px',
      selector: (row) => Number(row.monto || 0),
      sortable: true,
      cell: (row) => (
        <span className="font-bold text-green-600">
          ${Number(row.monto || 0).toFixed(2)}
        </span>
      )
    },
    {
      name: 'Método',
      width: '180px',
      selector: (row) => row.metodo || 'Transferencia',
      sortable: true
    },
    {
      name: 'Estado',
      width: '170px',
      selector: (row) => row.estado || 'Pendiente',
      sortable: true,
      cell: (row) => <EstadoBadge estado={row.estado || 'Pendiente'} />
    },
    {
      name: 'Fecha',
      width: '160px',
      selector: (row) => row.fecha || 'N/A',
      sortable: true,
      cell: (row) => <span>{formatearFecha(row.fecha)}</span>
    },
    {
      name: 'Acciones',
      width: '240px',
      cell: (row) => (
        <div className="flex gap-3 w-full justify-center">
          <button
            onClick={() => editarPago(row)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white min-w-[90px] px-4 py-3 rounded-xl font-semibold whitespace-nowrap"
          >
            Editar
          </button>

          <button
            onClick={() => eliminarPago(row.id_pago)}
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
              Gestión Financiera
            </h1>

            <p className="text-gray-500 mt-2">
              Administración de pagos logísticos
            </p>
          </div>

          <div className="bg-green-600 text-white px-5 py-3 rounded-2xl font-semibold shadow-lg whitespace-nowrap">
            ${totalIngresos.toLocaleString()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KPI titulo="Aprobados" valor={aprobados} color="bg-green-600" />
          <KPI titulo="Pendientes" valor={pendientes} color="bg-yellow-500" />
          <KPI titulo="Rechazados" valor={rechazados} color="bg-red-600" />
          <KPI titulo="Ingresos" valor={`$${totalIngresos.toFixed(2)}`} color="bg-blue-600" />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow mb-8">
          <h2 className="text-2xl font-bold text-slate-800">
            {editando ? 'Editar Pago' : 'Nuevo Pago'}
          </h2>

          <p className="text-gray-500 mt-1 mb-6">
            Registra pagos asociados a órdenes
          </p>

          {error && (
            <div className="mb-5 bg-red-100 text-red-700 px-4 py-3 rounded-xl font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
            <input
              type="number"
              placeholder="ID Orden"
              value={idOrden}
              onChange={(e) => setIdOrden(e.target.value)}
              className={inputStyle}
            />

            <input
              type="number"
              placeholder="Monto"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className={inputStyle}
            />

            <select
              value={metodo}
              onChange={(e) => setMetodo(e.target.value)}
              className={inputStyle}
            >
              <option value="Transferencia">Transferencia</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Cheque">Cheque</option>
            </select>

            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className={inputStyle}
            >
              <option value="Pendiente">Pendiente</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Rechazado">Rechazado</option>
            </select>

            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className={inputStyle}
            />
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={guardarPago}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-6 py-3 rounded-xl font-semibold whitespace-nowrap"
            >
              {loading ? 'Guardando...' : editando ? 'Actualizar Pago' : 'Crear Pago'}
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
            placeholder="Buscar por ID, orden, estado o método..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={inputStyle}
          />
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => exportarExcel(filtrados, 'pagos')}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-semibold whitespace-nowrap"
          >
            Exportar Excel
          </button>

          <button
            onClick={() => exportarPDF(filtrados, 'pagos')}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-semibold whitespace-nowrap"
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
            noDataComponent="No hay pagos registrados"
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

function EstadoBadge({ estado }) {
  let color = 'bg-yellow-500';
  const texto = estado || 'Pendiente';

  if (texto === 'Aprobado') color = 'bg-green-600';
  else if (texto === 'Rechazado') color = 'bg-red-600';

  return (
    <span className={`${color} text-white min-w-[110px] text-center px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap inline-block`}>
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
  focus:ring-green-500
`;

export default Pagos;