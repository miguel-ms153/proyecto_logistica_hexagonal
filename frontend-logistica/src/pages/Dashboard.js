import { useEffect, useState } from 'react';

import Sidebar from '../components/Sidebar';

import API from '../services/api';

import socket from '../services/socket';

import {
  Bar,
  Pie,
  Line
} from 'react-chartjs-2';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const usuario =
    JSON.parse(
      localStorage.getItem('usuario')
    );

  const rol =
    usuario?.rol;

  const esAdmin =
    rol === 'ADMIN';

  const esOperador =
    rol === 'OPERADOR';

  const esCliente =
    rol === 'CLIENTE';

  const puedeVerGestion =
    esAdmin || esOperador;

  const [datos, setDatos] =
    useState({
      usuarios: 0,
      productos: 0,
      ordenes: 0,
      embarques: 0,

      ia: {
        alto: 0,
        medio: 0,
        bajo: 0
      },

      alertas:
        'Sistema estable',

      alertasDetalle: {
        stockBajo: 0,
        ordenesSinPago: 0,
        ordenesSinEmbarque: 0,
        embarquesRetrasados: 0,
        aduanasPendientes: 0,
        aduanasObservadas: 0,
        aduanasConDocumentosPendientes: 0
      }
    });

  const [trackingStatus, setTrackingStatus] =
    useState('Sin datos');

  const [socketStatus, setSocketStatus] =
    useState(socket.connected ? 'Conectado' : 'Desconectado');

  const [iaStatus, setIaStatus] =
    useState('Sin datos');

  const obtenerResumen =
    async () => {
      try {
        const res =
          await API.get('/dashboard');

        setDatos(res.data);

        const totalIA =
          Number(res.data.ia?.alto || 0) +
          Number(res.data.ia?.medio || 0) +
          Number(res.data.ia?.bajo || 0);

        if (totalIA > 0) {
          setIaStatus('Operativa');
        }
      } catch (error) {
        console.log(error);
      }
    };

  const obtenerEstadoTracking =
    async () => {
      try {
        const res =
          await API.get('/tracking');

        const registros =
          Array.isArray(res.data)
            ? res.data
            : [];

        if (registros.length === 0) {
          setTrackingStatus('Sin datos');
          setIaStatus('Sin datos');
          return;
        }

        setTrackingStatus('Activo');

        const tieneIA =
          registros.some((item) =>
            item.ia ||
            item.riesgo ||
            item.tipo_transporte
          );

        setIaStatus(
          tieneIA
            ? 'Operativa'
            : 'Sin datos'
        );
      } catch (error) {
        console.log(error);

        setTrackingStatus('Inactivo');
        setIaStatus('No disponible');
      }
    };

  useEffect(() => {
    obtenerResumen();
    obtenerEstadoTracking();

    const interval =
      setInterval(() => {
        obtenerResumen();
        obtenerEstadoTracking();
      }, 5000);

    const conectarSocket = () => {
      setSocketStatus('Conectado');
    };

    const desconectarSocket = () => {
      setSocketStatus('Desconectado');
    };

    socket.on('connect', conectarSocket);
    socket.on('disconnect', desconectarSocket);
    socket.on('connect_error', desconectarSocket);

    if (socket.connected) {
      setSocketStatus('Conectado');
    }

    return () => {
      clearInterval(interval);

      socket.off('connect', conectarSocket);
      socket.off('disconnect', desconectarSocket);
      socket.off('connect_error', desconectarSocket);
    };
  }, []);

  const barData = {
    labels: [
      'Usuarios',
      'Productos',
      'Órdenes',
      'Embarques'
    ],

    datasets: [
      {
        label: 'Totales',

        data: [
          datos.usuarios,
          datos.productos,
          datos.ordenes,
          datos.embarques
        ],

        backgroundColor: [
          '#2563eb',
          '#16a34a',
          '#ea580c',
          '#9333ea'
        ],

        borderRadius: 12
      }
    ]
  };

  const pieData = {
    labels: [
      'Usuarios',
      'Productos',
      'Órdenes',
      'Embarques'
    ],

    datasets: [
      {
        data: [
          datos.usuarios,
          datos.productos,
          datos.ordenes,
          datos.embarques
        ],

        backgroundColor: [
          '#2563eb',
          '#16a34a',
          '#ea580c',
          '#9333ea'
        ]
      }
    ]
  };

  const iaPieData = {
    labels: [
      'Riesgo Alto',
      'Riesgo Medio',
      'Riesgo Bajo'
    ],

    datasets: [
      {
        data: [
          datos.ia?.alto || 0,
          datos.ia?.medio || 0,
          datos.ia?.bajo || 0
        ],

        backgroundColor: [
          '#dc2626',
          '#f97316',
          '#16a34a'
        ]
      }
    ]
  };

  const lineData = {
    labels: [
      'Usuarios',
      'Productos',
      'Órdenes',
      'Embarques'
    ],

    datasets: [
      {
        label: 'Crecimiento Sistema',

        data: [
          datos.usuarios,
          datos.productos,
          datos.ordenes,
          datos.embarques
        ],

        borderColor: '#2563eb',

        backgroundColor: '#93c5fd',

        tension: 0.4,

        fill: true
      }
    ]
  };

  const alertasOperativas = [
    {
      titulo: 'Stock bajo',
      valor: datos.alertasDetalle?.stockBajo || 0,
      descripcion: 'Productos con menos de 10 unidades',
      color: 'border-red-500',
      texto: 'text-red-600'
    },
    {
      titulo: 'Ordenes sin pago',
      valor: datos.alertasDetalle?.ordenesSinPago || 0,
      descripcion: 'Ordenes que aun no tienen pagos registrados',
      color: 'border-orange-500',
      texto: 'text-orange-600'
    },
    {
      titulo: 'Ordenes sin embarque',
      valor: datos.alertasDetalle?.ordenesSinEmbarque || 0,
      descripcion: 'Ordenes que aun no tienen embarque asignado',
      color: 'border-blue-500',
      texto: 'text-blue-600'
    },
    {
      titulo: 'Embarques retrasados',
      valor: datos.alertasDetalle?.embarquesRetrasados || 0,
      descripcion: 'Embarques marcados como retrasados',
      color: 'border-purple-500',
      texto: 'text-purple-600'
    },
    {
      titulo: 'Aduanas pendientes',
      valor: datos.alertasDetalle?.aduanasPendientes || 0,
      descripcion: 'Tramites aduaneros pendientes de gestion',
      color: 'border-yellow-500',
      texto: 'text-yellow-600'
    },
    {
      titulo: 'Aduanas observadas',
      valor: datos.alertasDetalle?.aduanasObservadas || 0,
      descripcion: 'Procesos aduaneros con observaciones',
      color: 'border-red-500',
      texto: 'text-red-600'
    },
    {
      titulo: 'Docs aduaneros',
      valor: datos.alertasDetalle?.aduanasConDocumentosPendientes || 0,
      descripcion: 'Tramites con documentos pendientes',
      color: 'border-slate-500',
      texto: 'text-slate-700'
    }
  ];

  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Dashboard Inteligente
            </h1>

            <div className="mt-4">
              <p className="text-gray-500">
                Bienvenido nuevamente
              </p>

              <div className="flex items-center gap-4 mt-3">
                <div
                  className="
                    w-14
                    h-14
                    bg-blue-600
                    rounded-full
                    flex
                    items-center
                    justify-center
                    text-white
                    font-bold
                    text-2xl
                    shadow-lg
                  "
                >
                  {
                    usuario?.nombre
                      ?.charAt(0)
                      ?.toUpperCase()
                  }
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {usuario?.nombre}
                  </h2>

                  <p className="text-gray-500">
                    {usuario?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            className="
              bg-green-100
              text-green-700
              px-6
              py-4
              rounded-2xl
              font-bold
              shadow-lg
              text-center
            "
          >
            <p>Sistema Online</p>

            <p className="text-sm mt-1">
              {rol || 'OPERADOR'}
            </p>
          </div>
        </div>

        <div
          className="
            mt-8
            p-5
            rounded-2xl
            shadow-lg
            bg-white
            border-l-8
            border-red-500
          "
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-red-600">
                Alertas operativas
              </h2>

              <p className="text-gray-600 mt-2">
                {datos.alertas}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
            {alertasOperativas.map((alerta) => (
              <AlertaCard
                key={alerta.titulo}
                titulo={alerta.titulo}
                valor={alerta.valor}
                descripcion={alerta.descripcion}
                color={alerta.color}
                texto={alerta.texto}
              />
            ))}
          </div>
        </div>

        {esCliente && (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <ClienteCard
              titulo="Tracking disponible"
              descripcion="Consulta el estado de tus embarques en tiempo real."
              boton="Ir a Tracking"
              ruta="/tracking"
            />

            <ClienteCard
              titulo="IA Predictiva"
              descripcion="El sistema analiza riesgos logísticos automáticamente."
              boton="Ver seguimiento"
              ruta="/tracking"
            />
          </div>
        )}

        {puedeVerGestion && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
              <Card
                titulo="Usuarios"
                valor={datos.usuarios}
                color="text-blue-600"
              />

              <Card
                titulo="Productos"
                valor={datos.productos}
                color="text-green-600"
              />

              <Card
                titulo="Órdenes"
                valor={datos.ordenes}
                color="text-orange-500"
              />

              <Card
                titulo="Embarques"
                valor={datos.embarques}
                color="text-purple-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card
                titulo="IA Riesgo Alto"
                valor={datos.ia?.alto || 0}
                color="text-red-600"
              />

              <Card
                titulo="IA Riesgo Medio"
                valor={datos.ia?.medio || 0}
                color="text-orange-500"
              />

              <Card
                titulo="IA Riesgo Bajo"
                valor={datos.ia?.bajo || 0}
                color="text-green-600"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6">
                  Estadísticas Generales
                </h2>

                <Bar data={barData} />
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6">
                  Distribución Sistema
                </h2>

                <Pie data={pieData} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg mt-10">
              <h2 className="text-2xl font-bold mb-6">
                IA Predictiva Logística
              </h2>

              <div className="max-w-md mx-auto">
                <Pie data={iaPieData} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg mt-10">
              <h2 className="text-2xl font-bold mb-6">
                Tendencia del Sistema
              </h2>

              <Line data={lineData} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              <LiveCard
                titulo="Tracking Live"
                valor={trackingStatus}
                color={obtenerColorTracking(trackingStatus)}
              />

              <LiveCard
                titulo="Socket.IO"
                valor={socketStatus}
                color={obtenerColorSocket(socketStatus)}
              />

              <LiveCard
                titulo="IA Predictiva"
                valor={iaStatus}
                color={obtenerColorIA(iaStatus)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function obtenerColorTracking(status) {
  if (status === 'Activo') return 'bg-green-600';
  if (status === 'Sin datos') return 'bg-yellow-500';

  return 'bg-red-600';
}

function obtenerColorSocket(status) {
  if (status === 'Conectado') return 'bg-blue-600';

  return 'bg-red-600';
}

function obtenerColorIA(status) {
  if (status === 'Operativa') return 'bg-purple-600';
  if (status === 'Sin datos') return 'bg-yellow-500';

  return 'bg-red-600';
}

function AlertaCard({
  titulo,
  valor,
  descripcion,
  color,
  texto
}) {
  return (
    <div
      className={`
        bg-slate-50
        border-l-4
        ${color}
        rounded-xl
        p-4
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-800">
            {titulo}
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            {descripcion}
          </p>
        </div>

        <span
          className={`
            ${texto}
            text-3xl
            font-bold
          `}
        >
          {valor}
        </span>
      </div>
    </div>
  );
}

function Card({
  titulo,
  valor,
  color
}) {
  return (
    <div
      className="
        bg-white
        p-6
        rounded-2xl
        shadow-lg
        hover:shadow-2xl
        transition
      "
    >
      <h2 className="text-gray-500">
        {titulo}
      </h2>

      <p
        className={`
          text-5xl
          font-bold
          mt-3
          ${color}
        `}
      >
        {valor}
      </p>
    </div>
  );
}

function LiveCard({
  titulo,
  valor,
  color
}) {
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
      <h2 className="text-xl font-bold">
        {titulo}
      </h2>

      <p className="mt-4 text-3xl font-bold">
        {valor}
      </p>
    </div>
  );
}

function ClienteCard({
  titulo,
  descripcion,
  boton,
  ruta
}) {
  return (
    <div
      className="
        bg-white
        p-8
        rounded-2xl
        shadow-lg
        border-l-8
        border-blue-600
      "
    >
      <h2 className="text-2xl font-bold text-slate-800">
        {titulo}
      </h2>

      <p className="text-gray-500 mt-3">
        {descripcion}
      </p>

      <a
        href={ruta}
        className="
          inline-block
          mt-6
          bg-blue-600
          hover:bg-blue-700
          text-white
          px-6
          py-3
          rounded-xl
          font-bold
          transition
        "
      >
        {boton}
      </a>
    </div>
  );
}

export default Dashboard;
