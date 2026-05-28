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

function Productos() {
  const [productos, setProductos] = useState([]);

  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [categoria, setCategoria] = useState('');

  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const obtenerProductos = async () => {
    try {
      const res = await API.get('/productos');
      setProductos(res.data);
    } catch (error) {
      console.log(error);
      setError('No se pudieron cargar los productos');
    }
  };

  useEffect(() => {
    obtenerProductos();
  }, []);

  const limpiarFormulario = () => {
    setNombre('');
    setPrecio('');
    setStock('');
    setCategoria('');
    setEditando(false);
    setProductoEditando(null);
    setError('');
  };

  const guardarProducto = async () => {
    if (!nombre || !precio || !stock) {
      setError('Nombre, precio y stock son obligatorios');
      return;
    }

    const data = {
      nombre,
      precio: Number(precio),
      stock: Number(stock),
      categoria: categoria || 'General'
    };

    try {
      setLoading(true);
      setError('');

      if (editando && productoEditando) {
        await API.put(`/productos/${productoEditando.id_producto}`, data);
      } else {
        await API.post('/productos', data);
      }

      await obtenerProductos();
      limpiarFormulario();
    } catch (error) {
      console.log(error);
      setError('No se pudo guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  const editarProducto = (producto) => {
    setEditando(true);
    setProductoEditando(producto);
    setNombre(producto.nombre || '');
    setPrecio(producto.precio || '');
    setStock(producto.stock || '');
    setCategoria(producto.categoria || '');
    setError('');
  };

  const eliminarProducto = async (id) => {
    const confirmar = window.confirm('Seguro que deseas eliminar este producto?');

    if (!confirmar) return;

    try {
      setError('');
      await API.delete(`/productos/${id}`);
      obtenerProductos();
    } catch (error) {
      console.log(error);
      setError('No se pudo eliminar el producto');
    }
  };

  const filtrados = productos.filter((producto) =>
    producto.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalInventario = productos.reduce(
    (acc, producto) =>
      acc + Number(producto.precio || 0) * Number(producto.stock || 0),
    0
  );

  const stockBajo = productos.filter(
    (producto) => Number(producto.stock) < 10
  ).length;

  const columns = [
    {
      name: 'ID',
      width: '70px',
      selector: (row) => row.id_producto,
      sortable: true
    },
    {
      name: 'Producto',
      minWidth: '180px',
      grow: 2,
      selector: (row) => row.nombre,
      sortable: true,
      cell: (row) => (
        <div className="min-w-0">
          <p className="font-bold text-slate-800 truncate" title={row.nombre}>
            {row.nombre}
          </p>

          <p className="text-xs text-slate-500">
            ID #{row.id_producto}
          </p>
        </div>
      )
    },
    {
      name: 'Categoria',
      width: '135px',
      selector: (row) => row.categoria || 'General',
      sortable: true,
      cell: (row) => (
        <span className="text-slate-700 truncate block max-w-[115px]" title={row.categoria || 'General'}>
          {row.categoria || 'General'}
        </span>
      )
    },
    {
      name: 'Precio',
      width: '115px',
      selector: (row) => Number(row.precio),
      sortable: true,
      cell: (row) => (
        <span className="font-bold text-green-600">
          ${Number(row.precio || 0).toFixed(2)}
        </span>
      )
    },
    {
      name: 'Stock',
      width: '155px',
      selector: (row) => Number(row.stock),
      sortable: true,
      cell: (row) => <StockBadge stock={Number(row.stock)} />
    },
    {
      name: 'Valor',
      width: '125px',
      selector: (row) => Number(row.precio || 0) * Number(row.stock || 0),
      sortable: true,
      cell: (row) => (
        <span className="font-bold text-slate-700">
          ${(Number(row.precio || 0) * Number(row.stock || 0)).toFixed(2)}
        </span>
      )
    },
    {
      name: 'Acciones',
      width: '175px',
      cell: (row) => (
        <div className="flex gap-2 w-full justify-end">
          <button
            type="button"
            onClick={() => editarProducto(row)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white min-w-[72px] px-3 py-2 rounded-lg font-semibold whitespace-nowrap text-xs"
          >
            Editar
          </button>

          <button
            type="button"
            onClick={() => eliminarProducto(row.id_producto)}
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
        minHeight: '52px',
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
        title="Inventario de Repuestos"
        subtitle="Gestion de productos importados"
        badge={`Total: ${productos.length}`}
      />

      <KpiGrid
        columns="md:grid-cols-3"
        items={[
          { title: 'Productos', value: productos.length, color: 'bg-blue-600' },
          { title: 'Stock Bajo', value: stockBajo, color: 'bg-red-600' },
          { title: 'Inventario', value: `$${totalInventario.toFixed(2)}`, color: 'bg-green-600' }
        ]}
      />

      <SectionCard
        title={editando ? 'Editar Repuesto' : 'Nuevo Repuesto'}
        className="!mb-5"
      >
        <AlertMessage message={error} />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={inputStyle}
          />

          <input
            type="number"
            placeholder="Precio"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className={inputStyle}
          />

          <input
            type="number"
            placeholder="Stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className={inputStyle}
          />

          <input
            type="text"
            placeholder="Categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className={inputStyle}
          />
        </div>

        <FormActions
          loading={loading}
          editing={editando}
          createLabel="Crear Producto"
          updateLabel="Actualizar Producto"
          onSubmit={guardarProducto}
          onCancel={limpiarFormulario}
        />
      </SectionCard>

      <SearchBox
        value={busqueda}
        onChange={setBusqueda}
        placeholder="Buscar producto..."
      />

      <ExportButtons data={filtrados} fileName="productos" />

      <DataTableCard
        columns={columns}
        data={filtrados}
        noData="No hay productos registrados"
        fixedHeader={false}
        selectableRows={false}
        dense
        customStyles={tableStyles}
      />
    </PageLayout>
  );
}

function StockBadge({ stock }) {
  let color = 'bg-green-600';
  let texto = 'Stock Alto';

  if (stock < 10) {
    color = 'bg-red-600';
    texto = 'Stock Bajo';
  } else if (stock < 30) {
    color = 'bg-yellow-500';
    texto = 'Stock Medio';
  }

  return (
    <StatusBadge
      text={`${stock} | ${texto}`}
      color={color}
      minWidth="min-w-[118px]"
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
  focus:ring-2
  focus:ring-blue-500
  text-sm
`;

export default Productos;
