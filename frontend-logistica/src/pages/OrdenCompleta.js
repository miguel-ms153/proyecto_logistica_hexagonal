import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import Sidebar from '../components/Sidebar';

import API from '../services/api';

const coordenadasLugares = {
  Busan: {
    latitud: 35.1796,
    longitud: 129.0756
  },
  Cuenca: {
    latitud: -2.9006,
    longitud: -79.0045
  },
  Guayaquil: {
    latitud: -2.1709,
    longitud: -79.9224
  },
  Japon: {
    latitud: 35.6762,
    longitud: 139.6503
  },
  Japón: {
    latitud: 35.6762,
    longitud: 139.6503
  },
  Latacunga: {
    latitud: -0.9333,
    longitud: -78.6167
  },
  Manta: {
    latitud: -0.9677,
    longitud: -80.7089
  },
  Miami: {
    latitud: 25.7617,
    longitud: -80.1918
  },
  Panama: {
    latitud: 8.9824,
    longitud: -79.5199
  },
  Panamá: {
    latitud: 8.9824,
    longitud: -79.5199
  },
  Quito: {
    latitud: -0.1807,
    longitud: -78.4678
  },
  Shanghai: {
    latitud: 31.2304,
    longitud: 121.4737
  },
  Yokohama: {
    latitud: 35.4437,
    longitud: 139.6380
  }
};

function OrdenCompleta() {
  const navigate = useNavigate();

  const usuarioActual =
    JSON.parse(
      localStorage.getItem('usuario')
    );

  const esCliente =
    usuarioActual?.rol === 'CLIENTE';

  const idUsuarioActual =
    usuarioActual?.id_usuario ||
    usuarioActual?.id;

  const [paso, setPaso] = useState(1);

  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);

  const [idUsuario, setIdUsuario] = useState('');
  const [estadoOrden, setEstadoOrden] = useState('Pendiente');
  const [fechaOrden, setFechaOrden] = useState('');

  const [productosOrden, setProductosOrden] = useState([]);
  const [idProducto, setIdProducto] = useState('');
  const [cantidad, setCantidad] = useState('');

  const [monto, setMonto] = useState('');
  const [metodo, setMetodo] = useState('Transferencia');
  const [estadoPago, setEstadoPago] = useState('Pendiente');
  const [fechaPago, setFechaPago] = useState('');

  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [estadoEmbarque, setEstadoEmbarque] = useState('En camino');
  const [tipoTransporte, setTipoTransporte] = useState('Marítimo');
  const [ubicacion, setUbicacion] = useState('');
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');

  const [ordenCreada, setOrdenCreada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [buscandoCoordenadas, setBuscandoCoordenadas] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const [usuariosRes, productosRes] = await Promise.all([
          API.get('/usuarios'),
          API.get('/productos')
        ]);

        setUsuarios(usuariosRes.data);
        setProductos(productosRes.data);

        if (esCliente && idUsuarioActual) {
          setIdUsuario(String(idUsuarioActual));
        }
      } catch (error) {
        console.log(error);
        setError('No se pudieron cargar usuarios o productos');
      }
    };

    obtenerDatos();
  }, [esCliente, idUsuarioActual]);

  const usuarioSeleccionado = usuarios.find(
    (usuario) => Number(usuario.id_usuario) === Number(idUsuario)
  );

  const totalProductos = productosOrden.reduce(
    (acc, item) => acc + Number(item.subtotal || 0),
    0
  );

  const agregarProducto = () => {
    if (!idProducto || !cantidad) {
      setError('Selecciona un producto y una cantidad');
      return;
    }

    const cantidadNumero = Number(cantidad);

    if (cantidadNumero <= 0) {
      setError('La cantidad debe ser mayor a cero');
      return;
    }

    const producto = productos.find(
      (p) => Number(p.id_producto) === Number(idProducto)
    );

    if (!producto) {
      setError('Producto no encontrado');
      return;
    }

    if (Number(producto.stock || 0) < cantidadNumero) {
      setError('No hay stock suficiente para ese producto');
      return;
    }

    const subtotal =
      Number(producto.precio || 0) * cantidadNumero;

    setProductosOrden([
      ...productosOrden,
      {
        id_producto: producto.id_producto,
        nombre: producto.nombre,
        precio: Number(producto.precio || 0),
        cantidad: cantidadNumero,
        subtotal
      }
    ]);

    setIdProducto('');
    setCantidad('');
    setError('');
  };

  const quitarProducto = (index) => {
    setProductosOrden(
      productosOrden.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const irSiguiente = () => {
    if (paso === 1 && (!idUsuario || !fechaOrden)) {
      setError('Selecciona usuario y fecha de orden');
      return;
    }

    if (paso === 2 && productosOrden.length === 0) {
      setError('Agrega al menos un producto');
      return;
    }

    if (paso === 3 && (!monto || !fechaPago)) {
      setError('Completa monto y fecha de pago');
      return;
    }

    setError('');
    setPaso(paso + 1);
  };

  const crearOrdenCompleta = async () => {
    if (!origen || !destino || !estadoEmbarque || !tipoTransporte) {
      setError('Completa los datos principales del embarque');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const ordenRes = await API.post('/ordenes', {
        id_usuario: Number(idUsuario),
        estado: estadoOrden,
        fecha: fechaOrden
      });

      const idOrden = ordenRes.data.id_orden;

      await Promise.all(
        productosOrden.map((item) =>
          API.post('/detalle-orden', {
            id_orden: idOrden,
            id_producto: item.id_producto,
            cantidad: item.cantidad,
            subtotal: item.subtotal
          })
        )
      );

      await API.post('/pagos', {
        id_orden: idOrden,
        monto: Number(monto),
        metodo,
        estado: estadoPago,
        fecha: fechaPago
      });

      await API.post('/embarques', {
        id_orden: idOrden,
        origen,
        destino,
        estado: estadoEmbarque
      });

      await API.post('/tracking', {
        id_orden: idOrden,
        origen,
        destino,
        ubicacion: ubicacion || origen,
        estado: estadoEmbarque,
        tipo_transporte: tipoTransporte,
        latitud: latitud ? Number(latitud) : undefined,
        longitud: longitud ? Number(longitud) : undefined,
        riesgo: estadoEmbarque === 'Retrasado' ? 'ALTO' : 'BAJO'
      });

      setOrdenCreada({
        id_orden: idOrden,
        totalProductos
      });

      setPaso(5);
    } catch (error) {
      console.log(error);

      setError(
        error.response?.data?.error ||
        error.response?.data?.message ||
        'No se pudo crear la orden completa'
      );
    } finally {
      setLoading(false);
    }
  };

  const aplicarCoordenadas = (lugar) => {
    const nombreLugar =
      lugar?.trim();

    if (!nombreLugar) {
      setError('Escribe una ubicacion para buscar coordenadas');
      return false;
    }

    const coordenadas =
      coordenadasLugares[nombreLugar];

    if (!coordenadas) {
      return false;
    }

    setLatitud(String(coordenadas.latitud));
    setLongitud(String(coordenadas.longitud));
    setError('');

    return true;
  };

  const buscarCoordenadas = async () => {
    const lugar =
      ubicacion ||
      origen ||
      destino;

    if (aplicarCoordenadas(lugar)) {
      return;
    }

    if (!lugar?.trim()) {
      setError('Escribe una ubicacion para buscar coordenadas');
      return;
    }

    try {
      setBuscandoCoordenadas(true);
      setError('');

      const res =
        await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(lugar)}`
        );

      const data =
        await res.json();

      if (!data || data.length === 0) {
        setError('No se encontraron coordenadas para esa ubicacion');
        return;
      }

      setLatitud(String(Number(data[0].lat).toFixed(6)));
      setLongitud(String(Number(data[0].lon).toFixed(6)));
    } catch (error) {
      console.log(error);
      setError('No se pudo buscar coordenadas automaticamente');
    } finally {
      setBuscandoCoordenadas(false);
    }
  };

  const limpiarTodo = () => {
    setPaso(1);
    setIdUsuario(
      esCliente && idUsuarioActual
        ? String(idUsuarioActual)
        : ''
    );
    setEstadoOrden('Pendiente');
    setFechaOrden('');
    setProductosOrden([]);
    setIdProducto('');
    setCantidad('');
    setMonto('');
    setMetodo('Transferencia');
    setEstadoPago('Pendiente');
    setFechaPago('');
    setOrigen('');
    setDestino('');
    setEstadoEmbarque('En camino');
    setTipoTransporte('Marítimo');
    setUbicacion('');
    setLatitud('');
    setLongitud('');
    setOrdenCreada(null);
    setError('');
  };

  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8 overflow-x-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Nueva Orden Completa
            </h1>

            <p className="text-gray-500 mt-2">
              Registra usuario, productos, pago, embarque y tracking en un solo flujo
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(esCliente ? '/tracking' : '/ordenes')}
            className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-3 rounded-xl font-bold w-fit"
          >
            {esCliente ? 'Ver tracking' : 'Ver ordenes'}
          </button>
        </div>

        {error && (
          <div className="mt-6 bg-red-100 text-red-700 px-4 py-3 rounded-xl font-semibold">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow p-6 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-8">
            <PasoButton numero={1} actual={paso} texto="Usuario" setPaso={setPaso} />
            <PasoButton numero={2} actual={paso} texto="Productos" setPaso={setPaso} />
            <PasoButton numero={3} actual={paso} texto="Pago" setPaso={setPaso} />
            <PasoButton numero={4} actual={paso} texto="Embarque" setPaso={setPaso} />
            <PasoButton numero={5} actual={paso} texto="Confirmacion" setPaso={setPaso} />
          </div>

          {paso === 1 && (
            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-5">
                Usuario y datos de orden
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <select
                  value={idUsuario}
                  onChange={(e) => setIdUsuario(e.target.value)}
                  disabled={esCliente}
                  className={inputStyle}
                >
                  <option value="">
                    {esCliente ? 'Usuario actual' : 'Seleccionar usuario'}
                  </option>

                  {esCliente && idUsuarioActual && (
                    <option value={idUsuarioActual}>
                      {usuarioActual?.nombre} - {usuarioActual?.rol}
                    </option>
                  )}

                  {usuarios
                    .filter((usuario) =>
                      !esCliente ||
                      Number(usuario.id_usuario) !== Number(idUsuarioActual)
                    )
                    .map((usuario) => (
                    <option
                      key={usuario.id_usuario}
                      value={usuario.id_usuario}
                    >
                      {usuario.nombre} - {usuario.rol}
                    </option>
                  ))}
                </select>

                <select
                  value={estadoOrden}
                  onChange={(e) => setEstadoOrden(e.target.value)}
                  className={inputStyle}
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En proceso">En proceso</option>
                  <option value="Entregada">Entregada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>

                <input
                  type="date"
                  value={fechaOrden}
                  onChange={(e) => setFechaOrden(e.target.value)}
                  className={inputStyle}
                />
              </div>
            </section>
          )}

          {paso === 2 && (
            <section>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Productos de la orden
                  </h2>

                  <p className="text-gray-500 mt-1">
                    Selecciona productos y cantidades antes de crear la orden
                  </p>
                </div>

                <div className="bg-slate-900 text-white px-4 py-3 rounded-xl font-bold w-fit">
                  Total: ${totalProductos.toFixed(2)}
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
                      {producto.nombre} - ${Number(producto.precio || 0).toFixed(2)} - Stock {producto.stock}
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
                  onClick={agregarProducto}
                  className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-bold"
                >
                  Agregar producto
                </button>
              </div>

              <div className="mt-6 space-y-3">
                {productosOrden.map((item, index) => (
                  <div
                    key={`${item.id_producto}-${index}`}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-100 rounded-xl p-4"
                  >
                    <div>
                      <p className="font-bold text-slate-800">
                        {item.nombre}
                      </p>

                      <p className="text-gray-500">
                        Cantidad: {item.cantidad} | Precio: ${item.precio.toFixed(2)} | Subtotal: ${item.subtotal.toFixed(2)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => quitarProducto(index)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold w-fit"
                    >
                      Quitar
                    </button>
                  </div>
                ))}

                {productosOrden.length === 0 && (
                  <p className="text-gray-500">
                    Todavia no hay productos agregados.
                  </p>
                )}
              </div>
            </section>
          )}

          {paso === 3 && (
            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-5">
                Pago
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
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
                  value={estadoPago}
                  onChange={(e) => setEstadoPago(e.target.value)}
                  className={inputStyle}
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Aprobado">Aprobado</option>
                  <option value="Rechazado">Rechazado</option>
                </select>

                <input
                  type="date"
                  value={fechaPago}
                  onChange={(e) => setFechaPago(e.target.value)}
                  className={inputStyle}
                />
              </div>
            </section>
          )}

          {paso === 4 && (
            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-5">
                Embarque y tracking
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <input
                  type="text"
                  placeholder="Origen"
                  value={origen}
                  onChange={(e) => {
                    setOrigen(e.target.value);

                    if (!ubicacion) {
                      setUbicacion(e.target.value);
                      aplicarCoordenadas(e.target.value);
                    }
                  }}
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
                  value={estadoEmbarque}
                  onChange={(e) => setEstadoEmbarque(e.target.value)}
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
                  placeholder="Ubicacion actual"
                  value={ubicacion}
                  onChange={(e) => {
                    setUbicacion(e.target.value);
                    aplicarCoordenadas(e.target.value);
                  }}
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

              <div className="flex flex-wrap gap-3 mt-5">
                <button
                  type="button"
                  onClick={buscarCoordenadas}
                  disabled={buscandoCoordenadas}
                  className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white px-6 py-3 rounded-xl font-bold"
                >
                  {buscandoCoordenadas
                    ? 'Buscando...'
                    : 'Buscar coordenadas'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUbicacion(origen);
                    aplicarCoordenadas(origen);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold"
                >
                  Usar origen
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUbicacion(destino);
                    aplicarCoordenadas(destino);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold"
                >
                  Usar destino
                </button>
              </div>
            </section>
          )}

          {paso === 5 && (
            <section>
              <h2 className="text-2xl font-bold text-green-600">
                {ordenCreada
                  ? `Orden #${ordenCreada.id_orden} creada correctamente`
                  : 'Confirmacion'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
                <ResumenCard titulo="Usuario" valor={usuarioSeleccionado?.nombre || 'Sin usuario'} />
                <ResumenCard titulo="Productos" valor={productosOrden.length} />
                <ResumenCard titulo="Total productos" valor={`$${totalProductos.toFixed(2)}`} />
                <ResumenCard titulo="Pago" valor={`$${Number(monto || 0).toFixed(2)}`} />
              </div>

              <div className="mt-6 bg-slate-100 rounded-xl p-5">
                <p className="font-bold text-slate-800">
                  Ruta: {origen || 'N/A'} - {destino || 'N/A'}
                </p>

                <p className="text-gray-500 mt-1">
                  Transporte: {tipoTransporte} | Estado: {estadoEmbarque}
                </p>
              </div>

              {ordenCreada && (
                <div className="flex flex-wrap gap-3 mt-6">
                  <button
                    type="button"
                    onClick={limpiarTodo}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold"
                  >
                    Crear otra orden
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/ordenes')}
                    className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-bold"
                  >
                    Ir a ordenes
                  </button>
                </div>
              )}
            </section>
          )}

          {!ordenCreada && (
            <div className="flex flex-wrap gap-3 mt-8">
              {paso > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setPaso(paso - 1);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-bold"
                >
                  Atras
                </button>
              )}

              {paso < 4 && (
                <button
                  type="button"
                  onClick={irSiguiente}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold"
                >
                  Siguiente
                </button>
              )}

              {paso === 4 && (
                <button
                  type="button"
                  onClick={crearOrdenCompleta}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-6 py-3 rounded-xl font-bold"
                >
                  {loading ? 'Creando...' : 'Crear orden completa'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PasoButton({
  numero,
  actual,
  texto,
  setPaso
}) {
  return (
    <button
      type="button"
      onClick={() => setPaso(numero)}
      className={`
        px-5
        py-3
        rounded-xl
        font-bold
        text-left
        ${actual === numero
          ? 'bg-blue-600 text-white'
          : 'bg-slate-100 text-slate-700'}
      `}
    >
      {numero}. {texto}
    </button>
  );
}

function ResumenCard({
  titulo,
  valor
}) {
  return (
    <div className="bg-slate-100 rounded-xl p-4">
      <p className="text-gray-500 text-sm">
        {titulo}
      </p>

      <p className="text-xl font-bold text-slate-800 mt-1">
        {valor}
      </p>
    </div>
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

export default OrdenCompleta;
