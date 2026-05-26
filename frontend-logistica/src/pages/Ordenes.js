import { useEffect, useState } from 'react';

import API from '../services/api';

import Sidebar from '../components/Sidebar';

import DataTable from 'react-data-table-component';

import { exportarExcel } from '../utils/exportExcel';

import { exportarPDF } from '../utils/exportPDF';

function Ordenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);

  const [idUsuario, setIdUsuario] = useState('');
  const [estado, setEstado] = useState('Pendiente');
  const [fecha, setFecha] = useState('');

  const [idProducto, setIdProducto] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [detallesOrden, setDetallesOrden] = useState([]);

  const [busqueda, setBusqueda] = useState('');

  const [editando, setEditando] = useState(false);
  const [ordenEditando, setOrdenEditando] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const obtenerOrdenes = async () => {
    try {
      const res = await API.get('/ordenes');

      setOrdenes(res.data);
    } catch (error) {
      console.log(error);

      setError('No se pudieron cargar las órdenes');
    }
  };

  const obtenerUsuarios = async () => {
    try {
      const res = await API.get('/usuarios');

      setUsuarios(res.data);
    } catch (error) {
      console.log(error);

      setError('No se pudieron cargar los usuarios');
    }
  };

  const obtenerProductos = async () => {
    try {
      const res = await API.get('/productos');

      setProductos(res.data);
    } catch (error) {
      console.log(error);

      setError('No se pudieron cargar los productos');
    }
  };

  const obtenerDetallesOrden = async (idOrden) => {
    try {
      const res = await API.get(`/detalle-orden/orden/${idOrden}`);

      setDetallesOrden(res.data);
    } catch (error) {
      console.log(error);

      setDetallesOrden([]);
    }
  };

  useEffect(() => {
    obtenerOrdenes();
    obtenerUsuarios();
    obtenerProductos();
  }, []);

  const limpiarFormulario = () => {
    setIdUsuario('');
    setEstado('Pendiente');
    setFecha('');
    setIdProducto('');
    setCantidad('');
    setDetallesOrden([]);
    setEditando(false);
    setOrdenEditando(null);
    setError('');
  };

  const guardarOrden = async () => {
    if (!estado || !fecha) {
      setError('Estado y fecha son obligatorios');
      return;
    }

    const data = {
      estado,
      fecha,
      id_usuario: idUsuario ? Number(idUsuario) : null
    };

    try {
      setLoading(true);
      setError('');

      if (editando && ordenEditando) {
        await API.put(`/ordenes/${ordenEditando.id_orden}`, data);
      } else {
        await API.post('/ordenes', data);
      }

      await obtenerOrdenes();

      limpiarFormulario();
    } catch (error) {
      console.log(error);

      setError(
        error.response?.data?.error ||
        error.response?.data?.message ||
        'No se pudo guardar la orden'
      );
    } finally {
      setLoading(false);
    }
  };

  const editarOrden = async (orden) => {
    setEditando(true);
    setOrdenEditando(orden);
    setIdUsuario(orden.id_usuario || '');
    setEstado(orden.estado || 'Pendiente');
    setFecha(orden.fecha?.split('T')[0] || orden.fecha || '');
    setError('');

    await obtenerDetallesOrden(orden.id_orden);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const eliminarOrden = async (id) => {
    const confirmar = window.confirm(
      '¿Seguro que deseas eliminar esta orden?'
    );

    if (!confirmar) return;

    try {
      setError('');

      await API.delete(`/ordenes/${id}`);

      obtenerOrdenes();
    } catch (error) {
      console.log(error);

      setError('No se pudo eliminar la orden');
    }
  };

  const agregarProductoOrden = async () => {
    if (!editando || !ordenEditando) {
      setError('Primero selecciona una orden para agregar productos');
      return;
    }

    if (!idProducto || !cantidad) {
      setError('Selecciona un producto y una cantidad');
      return;
    }

    const producto = productos.find(
      (p) => Number(p.id_producto) === Number(idProducto)
    );

    if (!producto) {
      setError('Producto no encontrado');
      return;
    }

    const subtotal =
      Number(producto.precio || 0) * Number(cantidad);

    const data = {
      id_orden: ordenEditando.id_orden,
      id_producto: Number(idProducto),
      cantidad: Number(cantidad),
      subtotal
    };

    try {
      setError('');

      await API.post('/detalle-orden', data);

      await obtenerDetallesOrden(ordenEditando.id_orden);
      await obtenerOrdenes();

      setIdProducto('');
      setCantidad('');
    } catch (error) {
      console.log(error);

      setError(
        error.response?.data?.error ||
        'No se pudo agregar el producto a la orden'
      );
    }
  };

  const eliminarDetalleOrden = async (idDetalle) => {
    const confirmar = window.confirm(
      '¿Seguro que deseas quitar este producto de la orden?'
    );

    if (!confirmar) return;

    try {
      await API.delete(`/detalle-orden/${idDetalle}`);

      await obtenerDetallesOrden(ordenEditando.id_orden);
      await obtenerOrdenes();
    } catch (error) {
      console.log(error);

      setError('No se pudo quitar el producto');
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

  const calcularTotalOrden = (orden) => {
    return orden.pagos?.reduce(
      (acc, pago) => acc + Number(pago.monto || 0),
      0
    ) || 0;
  };

  const calcularTotalProductos = () => {
    return detallesOrden.reduce(
      (acc, detalle) => acc + Number(detalle.subtotal || 0),
      0
    );
  };

  const obtenerEstadoEmbarque = (orden) => {
    if (!orden.embarques || orden.embarques.length === 0) {
      return 'Sin embarque';
    }

    return orden.embarques[0].estado || 'Sin estado';
  };

  const filtrados = ordenes.filter((o) => {
    const texto = busqueda.toLowerCase();

    return (
      String(o.id_orden).includes(texto) ||
      String(o.id_usuario || '').includes(texto) ||
      o.usuario?.nombre?.toLowerCase().includes(texto) ||
      o.usuario?.rol?.toLowerCase().includes(texto) ||
      o.estado?.toLowerCase().includes(texto) ||
      obtenerEstadoEmbarque(o).toLowerCase().includes(texto)
    );
  });

  const pendientes = ordenes.filter((o) => o.estado === 'Pendiente').length;

  const proceso = ordenes.filter(
    (o) => o.estado === 'En proceso' || o.estado === 'En tránsito'
  ).length;

  const entregadas = ordenes.filter((o) => o.estado === 'Entregada').length;

  const valorTotal = ordenes.reduce(
    (acc, orden) => acc + calcularTotalOrden(orden),
    0
  );

  const columns = [
    {
      name: 'ID',
      width: '90px',
      selector: (row) => row.id_orden,
      sortable: true
    },
    {
      name: 'Usuario',
      minWidth: '230px',
      selector: (row) => row.usuario?.nombre || row.id_usuario || 'N/A',
      sortable: true,
      cell: (row) => (
        <div>
          <p className="font-bold text-slate-800">
            {row.usuario?.nombre || 'N/A'}
          </p>

          <p className="text-sm text-gray-500">
            {row.usuario?.rol || (row.id_usuario ? `#${row.id_usuario}` : 'Sin usuario')}
          </p>
        </div>
      )
    },
    {
      name: 'Estado',
      width: '170px',
      selector: (row) => row.estado || 'Pendiente',
      sortable: true,
      cell: (row) => <EstadoBadge estado={row.estado || 'Pendiente'} />
    },
    {
      name: 'Embarque',
      width: '180px',
      selector: (row) => obtenerEstadoEmbarque(row),
      sortable: true,
      cell: (row) => <EmbarqueBadge estado={obtenerEstadoEmbarque(row)} />
    },
    {
      name: 'Productos',
      width: '130px',
      selector: (row) => row.productos?.length || 0,
      sortable: true,
      cell: (row) => (
        <span className="font-bold text-slate-700">
          {row.productos?.length || 0}
        </span>
      )
    },
    {
      name: 'Pagos',
      width: '120px',
      selector: (row) => row.pagos?.length || 0,
      sortable: true,
      cell: (row) => (
        <span className="font-bold text-blue-600">
          {row.pagos?.length || 0}
        </span>
      )
    },
    {
      name: 'Total Pagado',
      width: '160px',
      selector: (row) => calcularTotalOrden(row),
      sortable: true,
      cell: (row) => (
        <span className="font-bold text-green-600">
          ${calcularTotalOrden(row).toFixed(2)}
        </span>
      )
    },
    {
      name: 'Fecha',
      width: '150px',
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
            onClick={() => editarOrden(row)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white min-w-[90px] px-4 py-3 rounded-xl font-semibold whitespace-nowrap"
          >
            Editar
          </button>

          <button
            onClick={() => eliminarOrden(row.id_orden)}
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
              Gestión de Órdenes
            </h1>

            <p className="text-gray-500 mt-2">
              Control logístico empresarial
            </p>
          </div>

          <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-semibold shadow-lg whitespace-nowrap">
            Total: {ordenes.length}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KPI titulo="Pendientes" valor={pendientes} color="bg-yellow-500" />
          <KPI titulo="En Proceso" valor={proceso} color="bg-blue-600" />
          <KPI titulo="Entregadas" valor={entregadas} color="bg-green-600" />
          <KPI
            titulo="Valor Pagado"
            valor={`$${valorTotal.toFixed(2)}`}
            color="bg-slate-800"
          />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {editando ? 'Editar Orden' : 'Nueva Orden'}
              </h2>

              <p className="text-gray-500 mt-1">
                Asigna un usuario, registra la orden y agrega productos
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <select
              value={idUsuario}
              onChange={(e) => setIdUsuario(e.target.value)}
              className={inputStyle}
            >
              <option value="">Seleccionar usuario</option>

              {usuarios.map((usuario) => (
                <option
                  key={usuario.id_usuario}
                  value={usuario.id_usuario}
                >
                  {usuario.nombre} - {usuario.rol}
                </option>
              ))}
            </select>

            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className={inputStyle}
            >
              <option value="Pendiente">Pendiente</option>
              <option value="En proceso">En proceso</option>
              <option value="Entregada">Entregada</option>
              <option value="Cancelada">Cancelada</option>
            </select>

            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className={inputStyle}
            />
          </div>

          {editando && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    Productos de la orden #{ordenEditando?.id_orden}
                  </h3>

                  <p className="text-gray-500 mt-1">
                    Selecciona productos y cantidades para esta orden
                  </p>
                </div>

                <div className="bg-slate-800 text-white px-4 py-2 rounded-xl font-bold w-fit">
                  Total productos: ${calcularTotalProductos().toFixed(2)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <select
                  value={idProducto}
                  onChange={(e) => setIdProducto(e.target.value)}
                  className={inputStyle}
                >
                  <option value="">Seleccionar producto</option>

                  {productos.map((producto) => (
                    <option
                      key={producto.id_producto}
                      value={producto.id_producto}
                    >
                      {producto.nombre} - ${Number(producto.precio || 0).toFixed(2)}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Cantidad"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className={inputStyle}
                />

                <button
                  type="button"
                  onClick={agregarProductoOrden}
                  className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold whitespace-nowrap"
                >
                  Agregar Producto
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {detallesOrden.map((detalle) => (
                  <div
                    key={detalle.id_detalle}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-100 rounded-xl p-4"
                  >
                    <div>
                      <p className="font-bold text-slate-800">
                        {detalle.producto?.nombre || `Producto #${detalle.id_producto}`}
                      </p>

                      <p className="text-sm text-gray-500">
                        Cantidad: {detalle.cantidad} | Subtotal: ${Number(detalle.subtotal || 0).toFixed(2)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => eliminarDetalleOrden(detalle.id_detalle)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-semibold whitespace-nowrap"
                    >
                      Quitar
                    </button>
                  </div>
                ))}

                {detallesOrden.length === 0 && (
                  <p className="text-gray-500">
                    Esta orden todavía no tiene productos.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={guardarOrden}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-xl font-semibold whitespace-nowrap"
            >
              {loading
                ? 'Guardando...'
                : editando
                  ? 'Actualizar Orden'
                  : 'Crear Orden'}
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
            placeholder="Buscar por ID, usuario, estado o embarque..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={inputStyle}
          />
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => exportarExcel(filtrados, 'ordenes')}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-semibold whitespace-nowrap"
          >
            Exportar Excel
          </button>

          <button
            onClick={() => exportarPDF(filtrados, 'ordenes')}
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
            noDataComponent="No hay órdenes registradas"
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

  if (estado === 'En proceso') color = 'bg-blue-600';
  else if (estado === 'Entregada') color = 'bg-green-600';
  else if (estado === 'Cancelada') color = 'bg-red-600';

  return (
    <span className={`${color} text-white min-w-[120px] text-center px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap inline-block`}>
      {estado}
    </span>
  );
}

function EmbarqueBadge({ estado }) {
  let color = 'bg-gray-500';

  if (estado === 'En tránsito') color = 'bg-blue-600';
  else if (estado === 'Entregado') color = 'bg-green-600';
  else if (estado === 'Retrasado') color = 'bg-red-600';
  else if (estado === 'En puerto') color = 'bg-yellow-500';

  return (
    <span className={`${color} text-white min-w-[130px] text-center px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap inline-block`}>
      {estado}
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

export default Ordenes;