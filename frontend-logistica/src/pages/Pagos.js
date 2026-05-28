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
    const confirmar = window.confirm('Seguro que deseas eliminar este pago?');

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
      name: 'Metodo',
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
            type="button"
            onClick={() => editarPago(row)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white min-w-[90px] px-4 py-3 rounded-xl font-semibold whitespace-nowrap"
          >
            Editar
          </button>

          <button
            type="button"
            onClick={() => eliminarPago(row.id_pago)}
            className="bg-red-600 hover:bg-red-700 text-white min-w-[105px] px-4 py-3 rounded-xl font-semibold whitespace-nowrap"
          >
            Eliminar
          </button>
        </div>
      )
    }
  ];

  return (
    <PageLayout>
      <PageHeader
        title="Gestion Financiera"
        subtitle="Administracion de pagos logisticos"
        badge={`$${totalIngresos.toLocaleString()}`}
        badgeColor="bg-green-600"
      />

      <KpiGrid
        items={[
          { title: 'Aprobados', value: aprobados, color: 'bg-green-600' },
          { title: 'Pendientes', value: pendientes, color: 'bg-yellow-500' },
          { title: 'Rechazados', value: rechazados, color: 'bg-red-600' },
          { title: 'Ingresos', value: `$${totalIngresos.toFixed(2)}`, color: 'bg-blue-600' }
        ]}
      />

      <SectionCard
        title={editando ? 'Editar Pago' : 'Nuevo Pago'}
        subtitle="Registra pagos asociados a ordenes"
      >
        <AlertMessage message={error} />

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

        <FormActions
          loading={loading}
          editing={editando}
          createLabel="Crear Pago"
          updateLabel="Actualizar Pago"
          onSubmit={guardarPago}
          onCancel={limpiarFormulario}
          submitColor="bg-green-600 hover:bg-green-700 disabled:bg-green-300"
        />
      </SectionCard>

      <SearchBox
        value={busqueda}
        onChange={setBusqueda}
        placeholder="Buscar por ID, orden, estado o metodo..."
        focusColor="focus:ring-green-500"
      />

      <ExportButtons data={filtrados} fileName="pagos" />

      <DataTableCard
        columns={columns}
        data={filtrados}
        noData="No hay pagos registrados"
      />
    </PageLayout>
  );
}

function EstadoBadge({ estado }) {
  let color = 'bg-yellow-500';
  const texto = estado || 'Pendiente';

  if (texto === 'Aprobado') color = 'bg-green-600';
  else if (texto === 'Rechazado') color = 'bg-red-600';

  return <StatusBadge text={texto} color={color} />;
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
