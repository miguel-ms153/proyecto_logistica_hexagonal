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
  const [ordenes, setOrdenes] = useState([]);

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
      const [pagosRes, ordenesRes] = await Promise.all([
        API.get('/pagos'),
        API.get('/ordenes')
      ]);

      setPagos(pagosRes.data);
      setOrdenes(ordenesRes.data);
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

  const totalAprobado = pagos
    .filter((p) => p.estado === 'Aprobado')
    .reduce((acc, p) => acc + Number(p.monto || 0), 0);

  const totalPendiente = pagos
    .filter((p) => p.estado === 'Pendiente')
    .reduce((acc, p) => acc + Number(p.monto || 0), 0);

  const totalRechazado = pagos
    .filter((p) => p.estado === 'Rechazado')
    .reduce((acc, p) => acc + Number(p.monto || 0), 0);

  const aprobados = pagos.filter((p) => p.estado === 'Aprobado').length;
  const pendientes = pagos.filter((p) => p.estado === 'Pendiente').length;
  const ticketPromedio =
    pagos.length > 0
      ? totalIngresos / pagos.length
      : 0;
  const tasaAprobacion =
    pagos.length > 0
      ? Math.round((aprobados / pagos.length) * 100)
      : 0;

  const datosExportacion = filtrados.map((pago) => ({
    ID: pago.id_pago,
    Orden: pago.id_orden ? `#${pago.id_orden}` : 'N/A',
    Monto: `$${Number(pago.monto || 0).toFixed(2)}`,
    Metodo: pago.metodo || 'Transferencia',
    Estado: pago.estado || 'Pendiente',
    Fecha: formatearFecha(pago.fecha)
  }));

  const columns = [
    {
      name: 'ID',
      width: '72px',
      selector: (row) => row.id_pago,
      sortable: true
    },
    {
      name: 'Orden',
      width: '110px',
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
      width: '135px',
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
      minWidth: '170px',
      selector: (row) => row.metodo || 'Transferencia',
      sortable: true,
      cell: (row) => (
        <div>
          <p className="font-bold text-slate-800">
            {row.metodo || 'Transferencia'}
          </p>

          <p className="text-xs text-slate-500">
            Canal de pago
          </p>
        </div>
      )
    },
    {
      name: 'Estado',
      width: '135px',
      selector: (row) => row.estado || 'Pendiente',
      sortable: true,
      cell: (row) => <EstadoBadge estado={row.estado || 'Pendiente'} />
    },
    {
      name: 'Fecha',
      width: '120px',
      selector: (row) => row.fecha || 'N/A',
      sortable: true,
      cell: (row) => <span>{formatearFecha(row.fecha)}</span>
    },
    {
      name: 'Acciones',
      width: '180px',
      cell: (row) => (
        <div className="flex gap-2 w-full justify-end">
          <button
            type="button"
            onClick={() => editarPago(row)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white min-w-[72px] px-3 py-2 rounded-lg font-bold whitespace-nowrap text-xs"
          >
            Editar
          </button>

          <button
            type="button"
            onClick={() => eliminarPago(row.id_pago)}
            className="bg-red-600 hover:bg-red-700 text-white min-w-[82px] px-3 py-2 rounded-lg font-bold whitespace-nowrap text-xs"
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
        fontSize: '13px',
        minHeight: '46px'
      }
    },
    rows: {
      style: {
        minHeight: '56px',
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
        title="Gestion Financiera"
        subtitle="Control bancario de pagos, conciliacion y estados de cobranza"
        badge={`Cartera: $${totalIngresos.toLocaleString()}`}
        badgeColor="bg-green-600"
      />

      <PanelFinanciero
        totalAprobado={totalAprobado}
        totalPendiente={totalPendiente}
        totalRechazado={totalRechazado}
        tasaAprobacion={tasaAprobacion}
      />

      <KpiGrid
        items={[
          { title: 'Transacciones', value: pagos.length, color: 'bg-blue-600' },
          { title: 'Aprobados', value: aprobados, color: 'bg-green-600' },
          { title: 'Pendientes', value: pendientes, color: 'bg-yellow-500' },
          { title: 'Ticket promedio', value: `$${ticketPromedio.toFixed(2)}`, color: 'bg-slate-800' }
        ]}
      />

      <SectionCard
        title={editando ? 'Editar transaccion' : 'Nueva transaccion'}
        subtitle="Registra pagos asociados a ordenes y controla su estado financiero"
      >
        <AlertMessage message={error} />

        {editando && (
          <div className="mb-5">
            <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-xl font-bold w-fit text-sm">
              Modo edicion
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          <select
            value={idOrden}
            onChange={(e) => setIdOrden(e.target.value)}
            className={inputStyle}
          >
            <option value="">Seleccionar orden</option>

            {ordenes.map((orden) => (
              <option key={orden.id_orden} value={orden.id_orden}>
                Orden #{orden.id_orden} - {orden.usuario?.nombre || 'Sin usuario'}
              </option>
            ))}
          </select>

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

      <ExportButtons data={datosExportacion} fileName="pagos" />

      <DataTableCard
        columns={columns}
        data={filtrados}
        noData="No hay pagos registrados"
        selectableRows={false}
        dense
        fixedHeaderScrollHeight="520px"
        customStyles={customStyles}
      />
    </PageLayout>
  );
}

function PanelFinanciero({
  totalAprobado,
  totalPendiente,
  totalRechazado,
  tasaAprobacion
}) {
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 md:p-6 shadow-lg mb-5">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
        <div>
          <p className="text-emerald-300 text-sm font-bold uppercase tracking-wide">
            Posicion financiera
          </p>

          <h2 className="text-3xl md:text-4xl font-bold mt-2">
            ${totalAprobado.toFixed(2)}
          </h2>

          <p className="text-slate-300 mt-2">
            Capital confirmado por pagos aprobados y conciliados.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full xl:w-auto">
          <FinMetric title="Pendiente" value={`$${totalPendiente.toFixed(2)}`} />
          <FinMetric title="Rechazado" value={`$${totalRechazado.toFixed(2)}`} />
          <FinMetric title="Aprobacion" value={`${tasaAprobacion}%`} />
        </div>
      </div>
    </div>
  );
}

function FinMetric({ title, value }) {
  return (
    <div className="bg-white/10 border border-white/10 rounded-xl p-4 min-w-[160px]">
      <p className="text-xs text-slate-300 font-bold uppercase">
        {title}
      </p>

      <p className="text-xl font-bold mt-1">
        {value}
      </p>
    </div>
  );
}

function EstadoBadge({ estado }) {
  let color = 'bg-yellow-500';
  const texto = estado || 'Pendiente';

  if (texto === 'Aprobado') color = 'bg-green-600';
  else if (texto === 'Rechazado') color = 'bg-red-600';

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
  focus:ring-green-500
  text-sm
`;

export default Pagos;
