import { useEffect, useState } from 'react';

import API from '../services/api';

import Sidebar from '../components/Sidebar';

import DataTable from 'react-data-table-component';

import { exportarExcel } from '../utils/exportExcel';

import { exportarPDF } from '../utils/exportPDF';

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
    const confirmar = window.confirm(
      '¿Seguro que deseas eliminar este producto?'
    );

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

  const filtrados = productos.filter((p) =>
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalInventario = productos.reduce(
    (acc, p) => acc + Number(p.precio || 0) * Number(p.stock || 0),
    0
  );

  const stockBajo = productos.filter((p) => Number(p.stock) < 10).length;

  const columns = [
    {
      name: 'ID',
      width: '90px',
      selector: (row) => row.id_producto,
      sortable: true
    },
    {
      name: 'Producto',
      minWidth: '200px',
      selector: (row) => row.nombre,
      sortable: true
    },
    {
      name: 'Categoría',
      minWidth: '170px',
      selector: (row) => row.categoria || 'General',
      sortable: true
    },
    {
      name: 'Precio',
      minWidth: '160px',
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
      minWidth: '210px',
      selector: (row) => Number(row.stock),
      sortable: true,
      cell: (row) => <StockBadge stock={Number(row.stock)} />
    },
    {
      name: 'Acciones',
      minWidth: '250px',
      cell: (row) => (
        <div className="flex gap-3 w-full justify-center">
          <button
            onClick={() => editarProducto(row)}
            className="
              bg-yellow-500
              hover:bg-yellow-600
              text-white
              min-w-[95px]
              px-5
              py-3
              rounded-xl
              font-semibold
              whitespace-nowrap
            "
          >
            Editar
          </button>

          <button
            onClick={() => eliminarProducto(row.id_producto)}
            className="
              bg-red-600
              hover:bg-red-700
              text-white
              min-w-[110px]
              px-5
              py-3
              rounded-xl
              font-semibold
              whitespace-nowrap
            "
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
        fontSize: '15px'
      }
    }
  };

  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8 overflow-x-hidden">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Inventario de Repuestos
            </h1>

            <p className="text-gray-500 mt-2">
              Gestión de productos importados
            </p>
          </div>

          <div
            className="
              bg-blue-600
              text-white
              px-5
              py-3
              rounded-2xl
              font-semibold
              whitespace-nowrap
            "
          >
            Total: {productos.length}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <KPI
            titulo="Productos"
            valor={productos.length}
            color="bg-blue-600"
          />

          <KPI
            titulo="Stock Bajo"
            valor={stockBajo}
            color="bg-red-600"
          />

          <KPI
            titulo="Inventario"
            valor={`$${totalInventario.toFixed(2)}`}
            color="bg-green-600"
          />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow mb-8">
          <h2 className="text-2xl font-bold mb-6">
            {editando ? 'Editar Repuesto' : 'Nuevo Repuesto'}
          </h2>

          {error && (
            <div className="mb-5 bg-red-100 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
              placeholder="Categoría"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className={inputStyle}
            />
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={guardarProducto}
              disabled={loading}
              className="
                bg-blue-600
                hover:bg-blue-700
                disabled:bg-blue-300
                text-white
                px-6
                py-3
                rounded-xl
                font-semibold
                whitespace-nowrap
              "
            >
              {loading
                ? 'Guardando...'
                : editando
                  ? 'Actualizar Producto'
                  : 'Crear Producto'}
            </button>

            {editando && (
              <button
                onClick={limpiarFormulario}
                className="
                  bg-gray-500
                  hover:bg-gray-600
                  text-white
                  px-6
                  py-3
                  rounded-xl
                  font-semibold
                  whitespace-nowrap
                "
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow mb-6">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={inputStyle}
          />
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => exportarExcel(filtrados, 'productos')}
            className="
              bg-green-600
              hover:bg-green-700
              text-white
              px-5
              py-3
              rounded-xl
              whitespace-nowrap
            "
          >
            Exportar Excel
          </button>

          <button
            onClick={() => exportarPDF(filtrados)}
            className="
              bg-red-600
              hover:bg-red-700
              text-white
              px-5
              py-3
              rounded-xl
              whitespace-nowrap
            "
          >
            Exportar PDF
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 overflow-x-auto">
          <DataTable
            columns={columns}
            data={filtrados}
            pagination
            responsive
            striped
            highlightOnHover
            selectableRows
            customStyles={customStyles}
            noDataComponent="No hay productos registrados"
          />
        </div>
      </div>
    </div>
  );
}

function KPI({ titulo, valor, color }) {
  return (
    <div
      className={`
        ${color}
        text-white
        p-6
        rounded-2xl
        shadow-lg
      `}
    >
      <p className="text-lg">{titulo}</p>

      <h2 className="text-4xl font-bold mt-3">{valor}</h2>
    </div>
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
    <span
      className={`
        ${color}
        text-white
        min-w-[150px]
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
      {stock} - {texto}
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
  focus:ring-2
  focus:ring-blue-500
`;

export default Productos;