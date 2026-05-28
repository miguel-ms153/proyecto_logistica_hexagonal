import { useEffect, useMemo, useState } from 'react';

import API from '../services/api';
import socket from '../services/socket';

import PageHeader from '../components/common/PageHeader';
import PageLayout from '../components/common/PageLayout';
import SectionCard from '../components/common/SectionCard';

import {
  Bar,
  Doughnut,
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
  Legend,
  Filler
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
  Legend,
  Filler
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 10,
        boxHeight: 10,
        usePointStyle: true,
        font: {
          size: 11
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 11
        }
      }
    },
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0,
        font: {
          size: 11
        }
      }
    }
  }
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '62%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 10,
        boxHeight: 10,
        usePointStyle: true,
        font: {
          size: 11
        }
      }
    }
  }
};

function Dashboard() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const rol = usuario?.rol;

  const esAdmin = rol === 'ADMIN';
  const esOperador = rol === 'OPERADOR';
  const esCliente = rol === 'CLIENTE';
  const puedeVerGestion = esAdmin || esOperador;

  const [datos, setDatos] = useState({
    usuarios: 0,
    productos: 0,
    ordenes: 0,
    embarques: 0,
    ia: {
      alto: 0,
      medio: 0,
      bajo: 0
    },
    alertas: 'Sistema estable',
    alertasDetalle: {
      stockBajo: 0,
      ordenesSinPago: 0,
      ordenesSinEmbarque: 0,
      embarquesRetrasados: 0,
      aduanasPendientes: 0,
      aduanasObservadas: 0,
      aduanasConDocumentosPendientes: 0,
      documentosPendientes: 0,
      documentosObservados: 0,
      documentosVencidos: 0
    }
  });

  const [trackingStatus, setTrackingStatus] = useState('Sin datos');
  const [socketStatus, setSocketStatus] = useState(
    socket.connected ? 'Conectado' : 'Desconectado'
  );
  const [iaStatus, setIaStatus] = useState('Sin datos');

  const obtenerResumen = async () => {
    try {
      const res = await API.get('/dashboard');

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

  const obtenerEstadoTracking = async () => {
    try {
      const res = await API.get('/tracking');
      const registros = Array.isArray(res.data) ? res.data : [];

      if (registros.length === 0) {
        setTrackingStatus('Sin datos');
        setIaStatus('Sin datos');
        return;
      }

      setTrackingStatus('Activo');

      const tieneIA = registros.some((item) =>
        item.ia ||
        item.riesgo ||
        item.tipo_transporte
      );

      setIaStatus(tieneIA ? 'Operativa' : 'Sin datos');
    } catch (error) {
      console.log(error);
      setTrackingStatus('Inactivo');
      setIaStatus('No disponible');
    }
  };

  useEffect(() => {
    obtenerResumen();
    obtenerEstadoTracking();

    const interval = setInterval(() => {
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

  const alertasOperativas = useMemo(() => ([
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
      descripcion: 'Ordenes sin embarque asignado',
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
      titulo: 'Aduanas observadas',
      valor: datos.alertasDetalle?.aduanasObservadas || 0,
      descripcion: 'Procesos aduaneros con observaciones',
      color: 'border-red-500',
      texto: 'text-red-600'
    },
    {
      titulo: 'Docs vencidos',
      valor: datos.alertasDetalle?.documentosVencidos || 0,
      descripcion: 'Documentos con fecha limite vencida',
      color: 'border-slate-600',
      texto: 'text-slate-700'
    }
  ]), [datos.alertasDetalle]);

  const alertasCriticas = alertasOperativas.reduce(
    (acc, alerta) => acc + Number(alerta.valor || 0),
    0
  );

  const barData = {
    labels: ['Usuarios', 'Productos', 'Ordenes', 'Embarques'],
    datasets: [
      {
        label: 'Totales',
        data: [
          datos.usuarios,
          datos.productos,
          datos.ordenes,
          datos.embarques
        ],
        backgroundColor: ['#2563eb', '#16a34a', '#ea580c', '#9333ea'],
        borderRadius: 8,
        maxBarThickness: 40
      }
    ]
  };

  const iaData = {
    labels: ['Alto', 'Medio', 'Bajo'],
    datasets: [
      {
        data: [
          datos.ia?.alto || 0,
          datos.ia?.medio || 0,
          datos.ia?.bajo || 0
        ],
        backgroundColor: ['#dc2626', '#f59e0b', '#16a34a'],
        borderWidth: 0
      }
    ]
  };

  const lineData = {
    labels: ['Usuarios', 'Productos', 'Ordenes', 'Embarques'],
    datasets: [
      {
        label: 'Volumen operativo',
        data: [
          datos.usuarios,
          datos.productos,
          datos.ordenes,
          datos.embarques
        ],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.12)',
        pointBackgroundColor: '#2563eb',
        pointRadius: 4,
        tension: 0.35,
        fill: true
      }
    ]
  };

  return (
    <PageLayout>
      <PageHeader
        title="Dashboard Ejecutivo"
        subtitle="Vista gerencial de operaciones logisticas, aduana, documentos e IA"
        badge={rol || 'OPERADOR'}
        badgeColor="bg-slate-800"
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mb-5">
        <div className="xl:col-span-3 bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                {usuario?.nombre?.charAt(0)?.toUpperCase()}
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 font-bold">
                  Bienvenido nuevamente
                </p>
                <h2 className="text-lg font-bold text-slate-800">
                  {usuario?.nombre || 'Usuario'}
                </h2>
                <p className="text-sm text-slate-500">
                  {usuario?.email || 'Sin correo'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MiniMetric label="Ordenes" value={datos.ordenes} />
              <MiniMetric label="Embarques" value={datos.embarques} />
              <MiniMetric label="Alertas" value={alertasCriticas} tone={alertasCriticas > 0 ? 'danger' : 'success'} />
              <MiniMetric label="IA alto" value={datos.ia?.alto || 0} tone={datos.ia?.alto > 0 ? 'danger' : 'success'} />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-xl shadow-sm p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400 font-bold">
            Estado del sistema
          </p>
          <div className="mt-3 space-y-2">
            <StatusLine label="Tracking" value={trackingStatus} color={obtenerColorEstado(trackingStatus)} />
            <StatusLine label="Socket.IO" value={socketStatus} color={obtenerColorEstado(socketStatus)} />
            <StatusLine label="IA" value={iaStatus} color={obtenerColorEstado(iaStatus)} />
          </div>
        </div>
      </div>

      {esCliente && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <ClienteCard
            titulo="Tracking disponible"
            descripcion="Consulta el estado de tus embarques en tiempo real."
            boton="Ir a Tracking"
            ruta="/tracking"
          />

          <ClienteCard
            titulo="IA Predictiva"
            descripcion="El sistema analiza riesgos logisticos automaticamente."
            boton="Ver seguimiento"
            ruta="/tracking"
          />
        </div>
      )}

      {puedeVerGestion && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
            <SectionCard
              title="Alertas operativas"
              subtitle={datos.alertas}
              className="lg:col-span-2 !mb-0"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {alertasOperativas.map((alerta) => (
                  <AlertaCard key={alerta.titulo} {...alerta} />
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Riesgo IA" subtitle="Distribucion predictiva" className="!mb-0">
              <div className="h-[245px]">
                <Doughnut data={iaData} options={doughnutOptions} />
              </div>
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 mb-5">
            <SectionCard title="Resumen operativo" subtitle="Totales principales del sistema" className="xl:col-span-3 !mb-0">
              <div className="h-[285px]">
                <Bar data={barData} options={chartOptions} />
              </div>
            </SectionCard>

            <SectionCard title="Tendencia" subtitle="Volumen de entidades activas" className="xl:col-span-2 !mb-0">
              <div className="h-[285px]">
                <Line data={lineData} options={chartOptions} />
              </div>
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <ExecutiveCard titulo="Usuarios" valor={datos.usuarios} color="text-blue-600" />
            <ExecutiveCard titulo="Productos" valor={datos.productos} color="text-green-600" />
            <ExecutiveCard titulo="Ordenes" valor={datos.ordenes} color="text-orange-500" />
            <ExecutiveCard titulo="Embarques" valor={datos.embarques} color="text-purple-600" />
          </div>
        </>
      )}
    </PageLayout>
  );
}

function MiniMetric({ label, value, tone = 'neutral' }) {
  const colors = {
    neutral: 'bg-slate-100 text-slate-800',
    danger: 'bg-red-50 text-red-700',
    success: 'bg-green-50 text-green-700'
  };

  return (
    <div className={`${colors[tone]} rounded-lg px-4 py-3 min-w-[110px]`}>
      <p className="text-xs font-bold uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="text-2xl font-bold leading-tight">
        {value}
      </p>
    </div>
  );
}

function StatusLine({ label, value, color }) {
  return (
    <div className="flex items-center justify-between gap-3 bg-slate-800 rounded-lg px-3 py-2">
      <span className="text-sm text-slate-300">
        {label}
      </span>
      <span className={`${color} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>
        {value}
      </span>
    </div>
  );
}

function AlertaCard({
  titulo,
  valor,
  descripcion,
  color,
  texto
}) {
  return (
    <div className={`bg-slate-50 border-l-4 ${color} rounded-lg p-3`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-sm text-slate-800">
            {titulo}
          </h3>
          <p className="text-xs text-gray-500 mt-1 leading-snug">
            {descripcion}
          </p>
        </div>

        <span className={`${texto} text-2xl font-bold leading-none`}>
          {valor}
        </span>
      </div>
    </div>
  );
}

function ExecutiveCard({ titulo, valor, color }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
      <p className="text-xs uppercase tracking-wide text-slate-400 font-bold">
        {titulo}
      </p>
      <p className={`text-3xl font-bold mt-2 ${color}`}>
        {valor}
      </p>
    </div>
  );
}

function ClienteCard({ titulo, descripcion, boton, ruta }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-600">
      <h2 className="text-xl font-bold text-slate-800">
        {titulo}
      </h2>

      <p className="text-sm text-gray-500 mt-2">
        {descripcion}
      </p>

      <a
        href={ruta}
        className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition text-sm"
      >
        {boton}
      </a>
    </div>
  );
}

function obtenerColorEstado(status) {
  if (['Activo', 'Conectado', 'Operativa'].includes(status)) {
    return 'bg-green-600';
  }

  if (status === 'Sin datos') {
    return 'bg-yellow-500';
  }

  return 'bg-red-600';
}

export default Dashboard;
