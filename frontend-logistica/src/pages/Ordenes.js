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
      setError('No se pudieron cargar las ordenes');
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
    const confirmar = window.confirm('Seguro que deseas eliminar esta orden?');

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
      (item) => Number(item.id_producto) === Number(idProducto)
    );

    if (!producto) {
      setError('Producto no encontrado');
      return;
    }

    const subtotal = Number(producto.precio || 0) * Number(cantidad);

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
      'Seguro que deseas quitar este producto de la orden?'
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

  const formatearFecha = (fechaValue) => {
    if (!fechaValue) return 'N/A';

    return new Date(fechaValue).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const calcularTotalOrden = (orden) => {
    return (
      orden.pagos?.reduce(
        (acc, pago) => acc + Number(pago.monto || 0),
        0
      ) || 0
    );
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

  const filtrados = ordenes.filter((orden) => {
    const texto = busqueda.toLowerCase();

    return (
      String(orden.id_orden).includes(texto) ||
      String(orden.id_usuario || '').includes(texto) ||
      orden.usuario?.nombre?.toLowerCase().includes(texto) ||
      orden.usuario?.rol?.toLowerCase().includes(texto) ||
      orden.estado?.toLowerCase().includes(texto) ||
      obtenerEstadoEmbarque(orden).toLowerCase().includes(texto)
    );
  });

  const pendientes = ordenes.filter(
    (orden) => orden.estado === 'Pendiente'
  ).length;

  const proceso = ordenes.filter(
    (orden) =>
      orden.estado === 'En proceso' ||
      orden.estado === 'En transito' ||
      orden.estado === 'En tránsito'
  ).length;

  const entregadas = ordenes.filter(
    (orden) => orden.estado === 'Entregada'
  ).length;

  const valorTotal = ordenes.reduce(
    (acc, orden) => acc + calcularTotalOrden(orden),
    0
  );

  const datosExportacion = filtrados.map((orden) => ({
    orden: orden.id_orden,
    usuario: orden.usuario?.nombre || 'Sin usuario',
    rol: orden.usuario?.rol || 'N/A',
    estado: orden.estado || 'Pendiente',
    fecha: formatearFecha(orden.fecha),
    embarque: obtenerResumenEmbarque(orden),
    productos: obtenerResumenProductos(orden),
    cantidad_productos: orden.productos?.length || 0,
    pagos: orden.pagos?.length || 0,
    total_pagado: `$${calcularTotalOrden(orden).toFixed(2)}`
  }));

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
            type="button"
            onClick={() => editarOrden(row)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white min-w-[90px] px-4 py-3 rounded-xl font-semibold whitespace-nowrap"
          >
            Editar
          </button>

          <button
            type="button"
            onClick={() => eliminarOrden(row.id_orden)}
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
        title="Gestion de Ordenes"
        subtitle="Control logistico empresarial"
        badge={`Total: ${ordenes.length}`}
      />

      <KpiGrid
        items={[
          { title: 'Pendientes', value: pendientes, color: 'bg-yellow-500' },
          { title: 'En Proceso', value: proceso, color: 'bg-blue-600' },
          { title: 'Entregadas', value: entregadas, color: 'bg-green-600' },
          { title: 'Valor Pagado', value: `$${valorTotal.toFixed(2)}`, color: 'bg-slate-800' }
        ]}
      />

      <SectionCard
        title={editando ? 'Editar Orden' : 'Nueva Orden'}
        subtitle="Asigna un usuario, registra la orden y agrega productos"
      >
        {editando && (
          <div className="mb-5">
            <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-xl font-semibold w-fit">
              Modo edicion
            </span>
          </div>
        )}

        <AlertMessage message={error} />

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
          <OrderProductsSection
            orden={ordenEditando}
            productos={productos}
            detalles={detallesOrden}
            idProducto={idProducto}
            cantidad={cantidad}
            total={calcularTotalProductos()}
            onProductoChange={setIdProducto}
            onCantidadChange={setCantidad}
            onAgregar={agregarProductoOrden}
            onEliminar={eliminarDetalleOrden}
          />
        )}

        <FormActions
          loading={loading}
          editing={editando}
          createLabel="Crear Orden"
          updateLabel="Actualizar Orden"
          onSubmit={guardarOrden}
          onCancel={limpiarFormulario}
        />
      </SectionCard>

      <SearchBox
        value={busqueda}
        onChange={setBusqueda}
        placeholder="Buscar por ID, usuario, estado o embarque..."
      />

      <ExportButtons data={datosExportacion} fileName="ordenes" />

      <DataTableCard
        columns={columns}
        data={filtrados}
        noData="No hay ordenes registradas"
      />
    </PageLayout>
  );
}

function OrderProductsSection({
  orden,
  productos,
  detalles,
  idProducto,
  cantidad,
  total,
  onProductoChange,
  onCantidadChange,
  onAgregar,
  onEliminar
}) {
  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5">
        <div>
          <h3 className="text-xl font-bold text-slate-800">
            Productos de la orden #{orden?.id_orden}
          </h3>

          <p className="text-gray-500 mt-1">
            Selecciona productos y cantidades para esta orden
          </p>
        </div>

        <div className="bg-slate-800 text-white px-4 py-2 rounded-xl font-bold w-fit">
          Total productos: ${Number(total || 0).toFixed(2)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <select
          value={idProducto}
          onChange={(e) => onProductoChange(e.target.value)}
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
          onChange={(e) => onCantidadChange(e.target.value)}
          className={inputStyle}
        />

        <button
          type="button"
          onClick={onAgregar}
          className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold whitespace-nowrap"
        >
          Agregar Producto
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {detalles.map((detalle) => (
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
              onClick={() => onEliminar(detalle.id_detalle)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-semibold whitespace-nowrap"
            >
              Quitar
            </button>
          </div>
        ))}

        {detalles.length === 0 && (
          <p className="text-gray-500">
            Esta orden todavia no tiene productos.
          </p>
        )}
      </div>
    </div>
  );
}

function EstadoBadge({ estado }) {
  let color = 'bg-yellow-500';

  if (estado === 'En proceso') color = 'bg-blue-600';
  else if (estado === 'Entregada') color = 'bg-green-600';
  else if (estado === 'Cancelada') color = 'bg-red-600';

  return (
    <StatusBadge
      text={estado}
      color={color}
      minWidth="min-w-[120px]"
    />
  );
}

function EmbarqueBadge({ estado }) {
  let color = 'bg-gray-500';

  if (estado === 'En transito' || estado === 'En tránsito') {
    color = 'bg-blue-600';
  } else if (estado === 'Entregado') {
    color = 'bg-green-600';
  } else if (estado === 'Retrasado') {
    color = 'bg-red-600';
  } else if (estado === 'En puerto') {
    color = 'bg-yellow-500';
  }

  return (
    <StatusBadge
      text={estado}
      color={color}
      minWidth="min-w-[130px]"
    />
  );
}

function obtenerResumenEmbarque(orden) {
  if (!orden.embarques || orden.embarques.length === 0) {
    return 'Sin embarque';
  }

  return orden.embarques
    .map((embarque) => {
      const ruta =
        embarque.origen || embarque.destino
          ? `${embarque.origen || 'Origen'} - ${embarque.destino || 'Destino'}`
          : 'Sin ruta';

      return `${embarque.estado || 'Sin estado'} (${ruta})`;
    })
    .join(' | ');
}

function obtenerResumenProductos(orden) {
  if (!orden.productos || orden.productos.length === 0) {
    return 'Sin productos';
  }

  return orden.productos
    .map((producto) => producto.nombre || `Producto #${producto.id_producto}`)
    .join(', ');
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
