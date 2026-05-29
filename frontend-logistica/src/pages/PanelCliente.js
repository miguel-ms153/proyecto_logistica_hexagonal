import { useEffect, useMemo, useState } from 'react';

import { Link } from 'react-router-dom';

import API from '../services/api';

import AlertMessage from '../components/common/AlertMessage';
import KpiGrid from '../components/common/KpiGrid';
import PageHeader from '../components/common/PageHeader';
import PageLayout from '../components/common/PageLayout';
import SectionCard from '../components/common/SectionCard';
import StatusBadge from '../components/common/StatusBadge';

function PanelCliente() {
  const usuarioActual = useMemo(
    () => JSON.parse(localStorage.getItem('usuario') || '{}'),
    []
  );

  const idUsuarioActual = Number(
    usuarioActual?.id_usuario ||
      usuarioActual?.id ||
      0
  );

  const [ordenes, setOrdenes] = useState([]);
  const [tracking, setTracking] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [aduanas, setAduanas] = useState([]);
  const [error, setError] = useState('');

  const obtenerDatos = async () => {
    try {
      const [
        ordenesRes,
        trackingRes,
        documentosRes,
        aduanasRes
      ] = await Promise.all([
        API.get('/ordenes'),
        API.get('/tracking'),
        API.get('/documentos'),
        API.get('/aduanas')
      ]);

      setOrdenes(ordenesRes.data);
      setTracking(trackingRes.data);
      setDocumentos(documentosRes.data);
      setAduanas(aduanasRes.data);
      setError('');
    } catch (error) {
      console.log(error);
      setError('No se pudo cargar el panel del cliente');
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  const ordenesCliente = useMemo(() => {
    return ordenes.filter((orden) =>
      obtenerIdUsuarioOrden(orden) === idUsuarioActual
    );
  }, [ordenes, idUsuarioActual]);

  const idsOrdenCliente = useMemo(() => {
    return new Set(
      ordenesCliente.map((orden) => Number(orden.id_orden))
    );
  }, [ordenesCliente]);

  const aduanasCliente = useMemo(() => {
    return aduanas.filter((aduana) =>
      idsOrdenCliente.has(Number(aduana.id_orden))
    );
  }, [aduanas, idsOrdenCliente]);

  const idsAduanaCliente = useMemo(() => {
    return new Set(
      aduanasCliente.map((aduana) => Number(aduana.id_aduana))
    );
  }, [aduanasCliente]);

  const documentosCliente = useMemo(() => {
    return documentos.filter((documento) =>
      idsOrdenCliente.has(Number(documento.id_orden)) ||
      idsAduanaCliente.has(Number(documento.id_aduana))
    );
  }, [documentos, idsOrdenCliente, idsAduanaCliente]);

  const trackingCliente = useMemo(() => {
    return tracking.filter((item) =>
      idsOrdenCliente.has(Number(item.id_orden))
    );
  }, [tracking, idsOrdenCliente]);

  const resumenOrdenes = useMemo(() => {
    return ordenesCliente.map((orden) => {
      const total = calcularTotalOrden(orden);
      const pagado = calcularPagadoOrden(orden);
      const saldo = Math.max(total - pagado, 0);

      const tramiteAduanero = aduanasCliente.find((aduana) =>
        Number(aduana.id_orden) === Number(orden.id_orden)
      );

      const trackingOrden = trackingCliente.find((item) =>
        Number(item.id_orden) === Number(orden.id_orden)
      );

      const documentosOrden = documentosCliente.filter((documento) =>
        Number(documento.id_orden) === Number(orden.id_orden) ||
        Number(documento.id_aduana) === Number(tramiteAduanero?.id_aduana)
      );

      return {
        orden,
        total,
        pagado,
        saldo,
        tramiteAduanero,
        trackingOrden,
        documentosOrden
      };
    });
  }, [
    ordenesCliente,
    aduanasCliente,
    trackingCliente,
    documentosCliente
  ]);

  const saldoPendiente = resumenOrdenes.reduce(
    (acc, item) => acc + item.saldo,
    0
  );

  const ordenesEnTransito = trackingCliente.filter((item) =>
    ['En transito', 'En transito', 'En puerto', 'En camino'].includes(
      normalizarTexto(item.estado)
    )
  ).length;

  const docsPendientes = documentosCliente.filter((documento) =>
    documento.estado !== 'Aprobado'
  ).length;

  const nacionalizadas = aduanasCliente.filter((aduana) =>
    ['Nacionalizado', 'Liberado'].includes(aduana.estado)
  ).length;

  return (
    <PageLayout>
      <PageHeader
        title="Panel del Cliente"
        subtitle="Seguimiento privado de ordenes, pagos, documentos, tracking y nacionalizacion"
        badge={usuarioActual?.nombre || 'Cliente'}
        badgeColor="bg-slate-800"
      />

      <AlertMessage message={error} />

      <ClienteHero
        usuario={usuarioActual}
        ordenes={ordenesCliente.length}
        saldo={saldoPendiente}
      />

      <KpiGrid
        items={[
          {
            title: 'Mis ordenes',
            value: ordenesCliente.length,
            color: 'bg-blue-600'
          },
          {
            title: 'Saldo pendiente',
            value: `$${saldoPendiente.toFixed(2)}`,
            color: saldoPendiente > 0 ? 'bg-yellow-500' : 'bg-green-600'
          },
          {
            title: 'En tracking',
            value: ordenesEnTransito,
            color: 'bg-purple-600'
          },
          {
            title: 'Docs pendientes',
            value: docsPendientes,
            color: docsPendientes > 0 ? 'bg-red-600' : 'bg-slate-800'
          }
        ]}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        <SectionCard
          title="Estado financiero"
          subtitle="Pagos aprobados y saldo por cubrir"
          className="xl:col-span-1"
        >
          <div className="space-y-3">
            <MetricLine
              label="Total ordenado"
              value={`$${sumar(resumenOrdenes, 'total').toFixed(2)}`}
            />

            <MetricLine
              label="Pagado aprobado"
              value={`$${sumar(resumenOrdenes, 'pagado').toFixed(2)}`}
              tone="text-green-600"
            />

            <MetricLine
              label="Saldo a pagar"
              value={`$${saldoPendiente.toFixed(2)}`}
              tone={saldoPendiente > 0 ? 'text-yellow-600' : 'text-green-600'}
            />
          </div>

          <Link
            to="/orden-completa"
            className="inline-block mt-5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-bold text-sm"
          >
            Crear nueva orden
          </Link>
        </SectionCard>

        <SectionCard
          title="Nacionalizacion"
          subtitle="Avance aduanero de tus operaciones"
          className="xl:col-span-1"
        >
          <div className="space-y-3">
            <MetricLine
              label="Tramites aduaneros"
              value={aduanasCliente.length}
            />

            <MetricLine
              label="Nacionalizados"
              value={nacionalizadas}
              tone="text-green-600"
            />

            <MetricLine
              label="Observados"
              value={
                aduanasCliente.filter((aduana) =>
                  aduana.estado === 'Observado'
                ).length
              }
              tone="text-red-600"
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Tracking activo"
          subtitle="Rutas asociadas a tus ordenes"
          className="xl:col-span-1"
        >
          <div className="space-y-3">
            <MetricLine
              label="Registros de tracking"
              value={trackingCliente.length}
            />

            <MetricLine
              label="En movimiento"
              value={ordenesEnTransito}
              tone="text-blue-600"
            />

            <MetricLine
              label="Entregados"
              value={
                trackingCliente.filter((item) =>
                  item.estado === 'Entregado'
                ).length
              }
              tone="text-green-600"
            />
          </div>

          <Link
            to="/tracking"
            className="inline-block mt-5 bg-slate-800 hover:bg-slate-900 text-white px-4 py-3 rounded-lg font-bold text-sm"
          >
            Ver mapa
          </Link>
        </SectionCard>
      </div>

      <SectionCard
        title="Mis operaciones"
        subtitle="Resumen de ordenes, pagos, tracking, documentos y aduana"
      >
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
          {resumenOrdenes.map((item) => (
            <OrdenClienteCard
              key={item.orden.id_orden}
              item={item}
            />
          ))}
        </div>

        {resumenOrdenes.length === 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
            <p className="font-bold text-slate-700">
              Todavia no tienes ordenes asignadas.
            </p>

            <p className="text-slate-500 mt-1">
              Cuando registres una orden, aqui veras su seguimiento completo.
            </p>
          </div>
        )}
      </SectionCard>
    </PageLayout>
  );
}

function ClienteHero({ usuario, ordenes, saldo }) {
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 md:p-6 shadow-lg mb-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div>
          <p className="text-blue-200 text-sm font-bold uppercase tracking-wide">
            Portal privado del cliente
          </p>

          <h2 className="text-3xl md:text-4xl font-bold mt-2">
            {usuario?.nombre || 'Cliente'}
          </h2>

          <p className="text-slate-300 mt-2">
            Consulta tus cargas, pagos, documentos y avance aduanero en una sola vista.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
          <HeroMetric title="Ordenes" value={ordenes} />
          <HeroMetric title="Saldo" value={`$${saldo.toFixed(2)}`} />
        </div>
      </div>
    </div>
  );
}

function HeroMetric({ title, value }) {
  return (
    <div className="bg-white/10 border border-white/10 rounded-xl p-4 min-w-[150px]">
      <p className="text-xs text-slate-300 font-bold uppercase">
        {title}
      </p>

      <p className="text-2xl font-bold mt-1">
        {value}
      </p>
    </div>
  );
}

function OrdenClienteCard({ item }) {
  const {
    orden,
    total,
    pagado,
    saldo,
    tramiteAduanero,
    trackingOrden,
    documentosOrden
  } = item;

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">
            Orden #{orden.id_orden}
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            Fecha: {formatearFecha(orden.fecha)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <EstadoBadge estado={orden.estado || 'Pendiente'} />
          <EstadoBadge estado={trackingOrden?.estado || 'Sin tracking'} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <InfoBox
          label="Total orden"
          value={`$${total.toFixed(2)}`}
        />

        <InfoBox
          label="Pagado"
          value={`$${pagado.toFixed(2)}`}
          tone="text-green-600"
        />

        <InfoBox
          label="Saldo"
          value={`$${saldo.toFixed(2)}`}
          tone={saldo > 0 ? 'text-yellow-600' : 'text-green-600'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InfoBox
          label="Tracking"
          value={
            trackingOrden
              ? `${trackingOrden.ubicacion || 'Ubicacion no registrada'}`
              : 'Sin tracking'
          }
        />

        <InfoBox
          label="Nacionalizacion"
          value={tramiteAduanero?.estado || 'Sin tramite'}
        />

        <InfoBox
          label="Documentos"
          value={`${documentosOrden.length} registrados`}
        />

        <InfoBox
          label="Embarque"
          value={obtenerEstadoEmbarque(orden)}
        />
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <Link
          to="/tracking"
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-bold text-xs"
        >
          Ver tracking
        </Link>

        <Link
          to="/documentos"
          className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-2 rounded-lg font-bold text-xs"
        >
          Ver documentos
        </Link>
      </div>
    </div>
  );
}

function MetricLine({ label, value, tone = 'text-slate-800' }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-b-0">
      <span className="text-sm font-bold text-slate-500">
        {label}
      </span>

      <span className={`text-lg font-bold ${tone}`}>
        {value}
      </span>
    </div>
  );
}

function InfoBox({ label, value, tone = 'text-slate-800' }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
      <p className="text-xs font-bold uppercase text-slate-500">
        {label}
      </p>

      <p className={`font-bold mt-1 ${tone}`}>
        {value}
      </p>
    </div>
  );
}

function EstadoBadge({ estado }) {
  let color = 'bg-gray-600';
  const texto = estado || 'Sin estado';

  if (texto === 'Pendiente') color = 'bg-yellow-500';
  else if (texto === 'En proceso') color = 'bg-blue-600';
  else if (texto === 'Entregada' || texto === 'Entregado') color = 'bg-green-600';
  else if (texto === 'Cancelada' || texto === 'Retrasado') color = 'bg-red-600';
  else if (texto === 'En puerto') color = 'bg-yellow-500';
  else if (texto === 'En camino' || texto === 'En transito') color = 'bg-blue-600';

  return (
    <StatusBadge
      text={texto}
      color={color}
      minWidth="min-w-[105px]"
    />
  );
}

function obtenerIdUsuarioOrden(orden) {
  return Number(
    orden?.id_usuario ||
      orden?.usuario?.id_usuario ||
      orden?.usuario?.id ||
      0
  );
}

function calcularTotalOrden(orden) {
  if (!orden) return 0;

  const productos = orden.productos || [];

  if (productos.length === 0) {
    return Number(orden.total || 0);
  }

  return productos.reduce((acc, producto) => {
    const detalle =
      producto.detalle_orden ||
      producto.detalle_ordens ||
      producto.orden_producto ||
      {};

    const subtotal =
      detalle.subtotal ??
      producto.subtotal;

    if (subtotal !== undefined && subtotal !== null) {
      return acc + Number(subtotal || 0);
    }

    const cantidad =
      detalle.cantidad ??
      producto.cantidad ??
      1;

    return acc + (Number(producto.precio || 0) * Number(cantidad || 1));
  }, 0);
}

function calcularPagadoOrden(orden) {
  return (orden?.pagos || [])
    .filter((pago) => pago.estado === 'Aprobado')
    .reduce((acc, pago) => acc + Number(pago.monto || 0), 0);
}

function obtenerEstadoEmbarque(orden) {
  if (!orden.embarques || orden.embarques.length === 0) {
    return 'Sin embarque';
  }

  return orden.embarques[0].estado || 'Sin estado';
}

function sumar(items, campo) {
  return items.reduce((acc, item) => acc + Number(item[campo] || 0), 0);
}

function formatearFecha(fecha) {
  if (!fecha) return 'N/A';

  return new Date(fecha).toLocaleDateString('es-EC', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function normalizarTexto(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export default PanelCliente;
