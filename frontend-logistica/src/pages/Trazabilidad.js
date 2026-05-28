import { useEffect, useMemo, useState } from 'react';

import API from '../services/api';

import AlertMessage from '../components/common/AlertMessage';
import KpiGrid from '../components/common/KpiGrid';
import PageHeader from '../components/common/PageHeader';
import PageLayout from '../components/common/PageLayout';
import SectionCard from '../components/common/SectionCard';
import StatusBadge from '../components/common/StatusBadge';

import {
  calcularScoreRiesgo,
  estaVencido
} from '../utils/riskScoring';

const estadosOrden = [
  'Orden',
  'Productos',
  'Pago',
  'Embarque',
  'Tracking',
  'Aduana',
  'Documentos',
  'Cierre'
];

function Trazabilidad() {
  const usuarioActual =
    JSON.parse(localStorage.getItem('usuario')) || {};

  const idUsuarioActual =
    Number(usuarioActual?.id_usuario || usuarioActual?.id);

  const esCliente =
    usuarioActual?.rol === 'CLIENTE';

  const [ordenes, setOrdenes] = useState([]);
  const [aduanas, setAduanas] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [tracking, setTracking] = useState([]);
  const [idOrdenSeleccionada, setIdOrdenSeleccionada] = useState('');
  const [error, setError] = useState('');

  const obtenerDatos = async () => {
    try {
      const [ordenesRes, aduanasRes, documentosRes, trackingRes] =
        await Promise.all([
          API.get('/ordenes'),
          API.get('/aduanas'),
          API.get('/documentos'),
          API.get('/tracking')
        ]);

      setOrdenes(ordenesRes.data);
      setAduanas(aduanasRes.data);
      setDocumentos(documentosRes.data);
      setTracking(trackingRes.data);
    } catch (error) {
      console.log(error);
      setError('No se pudo cargar la trazabilidad');
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  const ordenesVisibles = useMemo(() => {
    if (!esCliente) return ordenes;

    return ordenes.filter(
      (orden) => obtenerIdUsuarioOrden(orden) === idUsuarioActual
    );
  }, [ordenes, esCliente, idUsuarioActual]);

  useEffect(() => {
    if (!idOrdenSeleccionada && ordenesVisibles.length > 0) {
      setIdOrdenSeleccionada(String(ordenesVisibles[0].id_orden));
    }
  }, [ordenesVisibles, idOrdenSeleccionada]);

  const ordenSeleccionada = ordenesVisibles.find(
    (orden) => Number(orden.id_orden) === Number(idOrdenSeleccionada)
  );

  const resumen = useMemo(() => {
    if (!ordenSeleccionada) return null;

    const idOrden = Number(ordenSeleccionada.id_orden);

    const aduanasOrden = aduanas.filter(
      (aduana) => Number(aduana.id_orden) === idOrden
    );

    const documentosOrden = documentos.filter(
      (documento) =>
        Number(documento.id_orden) === idOrden ||
        aduanasOrden.some(
          (aduana) => Number(aduana.id_aduana) === Number(documento.id_aduana)
        )
    );

    const trackingOrden = tracking.filter(
      (item) => Number(item.id_orden) === idOrden
    );

    const productos = ordenSeleccionada.productos || [];
    const pagos = ordenSeleccionada.pagos || [];
    const embarques = ordenSeleccionada.embarques || [];

    const tieneDocumentoVencido = documentosOrden.some((documento) =>
      estaVencido(documento)
    );

    const tieneAduanaObservada = aduanasOrden.some(
      (aduana) => aduana.estado === 'Observado'
    );

    const tieneDocumentoObservado = documentosOrden.some(
      (documento) => documento.estado === 'Observado'
    );

    const timeline = [
      {
        titulo: 'Orden creada',
        estado: ordenSeleccionada.estado || 'Pendiente',
        detalle: `Orden #${ordenSeleccionada.id_orden}`,
        completado: Boolean(ordenSeleccionada.id_orden),
        alerta: false
      },
      {
        titulo: 'Productos asignados',
        estado: productos.length > 0 ? 'Completado' : 'Pendiente',
        detalle: `${productos.length} productos asociados`,
        completado: productos.length > 0,
        alerta: productos.length === 0
      },
      {
        titulo: 'Pago registrado',
        estado: pagos.length > 0 ? 'Completado' : 'Pendiente',
        detalle: `${pagos.length} pagos registrados`,
        completado: pagos.length > 0,
        alerta: pagos.length === 0
      },
      {
        titulo: 'Embarque generado',
        estado: embarques[0]?.estado || 'Sin embarque',
        detalle:
          embarques.length > 0
            ? `${embarques[0]?.origen || 'Origen'} hacia ${embarques[0]?.destino || 'Destino'}`
            : 'No hay embarque asociado',
        completado: embarques.length > 0,
        alerta: embarques.length === 0 || embarques[0]?.estado === 'Retrasado'
      },
      {
        titulo: 'Tracking activo',
        estado: trackingOrden.length > 0 ? 'Monitoreado' : 'Pendiente',
        detalle: `${trackingOrden.length} registros de seguimiento`,
        completado: trackingOrden.length > 0,
        alerta: trackingOrden.length === 0
      },
      {
        titulo: 'Proceso aduanero',
        estado: aduanasOrden[0]?.estado || 'Sin tramite',
        detalle:
          aduanasOrden.length > 0
            ? `${aduanasOrden.length} tramites aduaneros`
            : 'No hay tramite aduanero',
        completado: aduanasOrden.length > 0,
        alerta: aduanasOrden.length === 0 || tieneAduanaObservada
      },
      {
        titulo: 'Documentos',
        estado:
          documentosOrden.length > 0
            ? tieneDocumentoVencido
              ? 'Vencido'
              : tieneDocumentoObservado
                ? 'Observado'
                : 'Registrado'
            : 'Pendiente',
        detalle: `${documentosOrden.length} documentos asociados`,
        completado: documentosOrden.length > 0,
        alerta:
          documentosOrden.length === 0 ||
          tieneDocumentoVencido ||
          tieneDocumentoObservado
      },
      {
        titulo: 'Cierre operativo',
        estado: calcularCierre(ordenSeleccionada, aduanasOrden, documentosOrden),
        detalle: 'Validacion final de entrega y liberacion',
        completado:
          ordenSeleccionada.estado === 'Entregada' &&
          aduanasOrden.some((aduana) =>
            ['Nacionalizado', 'Liberado'].includes(aduana.estado)
          ) &&
          documentosOrden.length > 0 &&
          !tieneDocumentoVencido,
        alerta: false
      }
    ];

    const completados = timeline.filter((item) => item.completado).length;
    const alertas = timeline.filter((item) => item.alerta).length;

    const riesgo =
      calcularScoreRiesgo({
        orden: ordenSeleccionada,
        pagos,
        embarques,
        aduanas: aduanasOrden,
        documentos: documentosOrden,
        tracking: trackingOrden
      });

    return {
      idOrden,
      usuario: ordenSeleccionada.usuario,
      productos,
      pagos,
      embarques,
      aduanas: aduanasOrden,
      documentos: documentosOrden,
      tracking: trackingOrden,
      timeline,
      completados,
      alertas,
      avance: Math.round((completados / timeline.length) * 100),
      riesgo
    };
  }, [ordenSeleccionada, aduanas, documentos, tracking]);

  return (
    <PageLayout>
      <PageHeader
        title="Trazabilidad por Orden"
        subtitle="Linea de tiempo integral desde la orden hasta la liberacion documental y aduanera"
        badge={resumen ? `Avance: ${resumen.avance}%` : 'Sin orden'}
        badgeColor={resumen?.alertas > 0 ? 'bg-red-600' : 'bg-blue-600'}
      />

      <AlertMessage message={error} />

      <SectionCard
        title="Consulta operacional"
        subtitle="Selecciona una orden para visualizar tiempos, hitos, alertas y riesgo IA"
        className="!mb-5"
      >
          <label className="block text-sm font-bold text-slate-600 mb-2">
            Seleccionar orden
          </label>

          <select
            value={idOrdenSeleccionada}
            onChange={(e) => setIdOrdenSeleccionada(e.target.value)}
            className={inputStyle}
          >
            <option value="">Seleccionar orden</option>

            {ordenesVisibles.map((orden) => (
              <option key={orden.id_orden} value={orden.id_orden}>
                Orden #{orden.id_orden} - {orden.usuario?.nombre || 'Sin usuario'} - {formatearFecha(orden.fecha)}
              </option>
            ))}
          </select>
      </SectionCard>

        {!resumen && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            No hay ordenes disponibles para mostrar trazabilidad.
          </div>
        )}

        {resumen && (
          <>
            <KpiGrid
              items={[
                {
                  title: 'Etapas completadas',
                  value: `${resumen.completados}/${estadosOrden.length}`,
                  color: 'bg-green-600'
                },
                {
                  title: 'Alertas',
                  value: resumen.alertas,
                  color: 'bg-red-600'
                },
                {
                  title: 'Documentos',
                  value: resumen.documentos.length,
                  color: 'bg-blue-600'
                },
                {
                  title: 'Riesgo IA',
                  value: `${resumen.riesgo.score}/100`,
                  color: obtenerColorRiesgo(resumen.riesgo.nivel)
                }
              ]}
            />

            <div className="bg-slate-900 text-white rounded-2xl shadow-lg p-5 md:p-6 mb-5">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                <div>
                  <p className="text-slate-300 text-sm font-bold uppercase tracking-wide">
                    Scoring avanzado de riesgo logistico
                  </p>

                  <h2 className="text-3xl md:text-4xl font-bold mt-2">
                    {resumen.riesgo.nivel} - {resumen.riesgo.score}/100
                  </h2>

                  <p className="text-slate-300 mt-3">
                    {resumen.riesgo.recomendacion}
                  </p>
                </div>

                <RiesgoBadge nivel={resumen.riesgo.nivel} />
              </div>

              <div className="mt-6">
                <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                  <div
                    className={`${obtenerColorRiesgo(resumen.riesgo.nivel)} h-4 rounded-full transition-all`}
                    style={{ width: `${resumen.riesgo.score}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
                {resumen.riesgo.factores.map((factor) => (
                  <div
                    key={factor.descripcion}
                    className="bg-slate-800 rounded-xl p-4"
                  >
                    <p className="text-sm text-slate-400">
                      +{factor.puntos} puntos
                    </p>

                    <p className="font-bold mt-1">
                      {factor.descripcion}
                    </p>
                  </div>
                ))}

                {resumen.riesgo.factores.length === 0 && (
                  <div className="bg-slate-800 rounded-xl p-4 font-bold">
                    Sin factores criticos detectados.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6 mb-5">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm text-slate-500 font-bold uppercase">
                    Timeline operacional
                  </p>

                  <h2 className="text-2xl font-bold text-slate-800 mt-1">
                    Orden #{resumen.idOrden}
                  </h2>

                  <p className="text-gray-500 mt-1">
                    Cliente/usuario: {resumen.usuario?.nombre || 'N/A'}
                  </p>
                </div>

                <EstadoBadge estado={ordenSeleccionada.estado || 'Pendiente'} />
              </div>

              <div className="w-full bg-slate-200 rounded-full h-3 mb-8 overflow-hidden">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${resumen.avance}%` }}
                />
              </div>

              <div className="relative">
                <div className="hidden md:block absolute left-6 top-0 bottom-0 w-1 bg-slate-200" />

                <div className="space-y-5">
                  {resumen.timeline.map((item, index) => (
                    <TimelineItem
                      key={item.titulo}
                      index={index + 1}
                      item={item}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <ResumenPanel
                titulo="Productos"
                items={resumen.productos}
                empty="Sin productos asociados"
                render={(item) => `${item.nombre || 'Producto'} - $${Number(item.precio || 0).toFixed(2)}`}
              />

              <ResumenPanel
                titulo="Pagos"
                items={resumen.pagos}
                empty="Sin pagos registrados"
                render={(item) => `$${Number(item.monto || 0).toFixed(2)} - ${item.estado || 'Sin estado'}`}
              />

              <ResumenPanel
                titulo="Embarques"
                items={resumen.embarques}
                empty="Sin embarques asociados"
                render={(item) => `${item.origen || 'Origen'} hacia ${item.destino || 'Destino'} - ${item.estado || 'Sin estado'}`}
              />

              <ResumenPanel
                titulo="Aduana"
                items={resumen.aduanas}
                empty="Sin tramite aduanero"
                render={(item) => `${item.numero_declaracion || 'Sin declaracion'} - ${item.estado || 'Sin estado'}`}
              />

              <ResumenPanel
                titulo="Documentos"
                items={resumen.documentos}
                empty="Sin documentos registrados"
                render={(item) => `${item.nombre} - ${estaVencido(item) ? 'Vencido' : item.estado}`}
              />

              <ResumenPanel
                titulo="Tracking"
                items={resumen.tracking}
                empty="Sin tracking registrado"
                render={(item) => `${item.ubicacion || 'Ubicacion'} - ${item.estado || 'Sin estado'}`}
              />
            </div>
          </>
        )}
    </PageLayout>
  );
}

function TimelineItem({ index, item }) {
  let circle = 'bg-slate-400';
  let border = 'border-slate-200';
  let surface = 'bg-white';

  if (item.completado) {
    circle = 'bg-green-600';
    border = 'border-green-500';
    surface = 'bg-green-50';
  }

  if (item.alerta) {
    circle = 'bg-red-600';
    border = 'border-red-500';
    surface = 'bg-red-50';
  }

  return (
    <div className="relative md:pl-16">
      <div className={`hidden md:flex absolute left-0 top-3 w-12 h-12 rounded-full ${circle} text-white items-center justify-center font-bold shadow-lg`}>
        {index}
      </div>

      <div className={`border-l-4 ${border} ${surface} rounded-xl p-4 shadow-sm`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="md:hidden bg-slate-800 text-white px-2 py-1 rounded-lg text-xs font-bold">
                {index}
              </span>

              <span className="text-xs font-bold text-slate-500 uppercase">
                {estimarTiempoEtapa(index)}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-800">
              {item.titulo}
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              {item.detalle}
            </p>
          </div>

          <EstadoBadge estado={item.estado} />
        </div>
      </div>
    </div>
  );
}

function ResumenPanel({ titulo, items, empty, render }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="text-lg font-bold text-slate-800 mb-4">
        {titulo}
      </h3>

      {items.length === 0 && (
        <p className="text-gray-500">{empty}</p>
      )}

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id_documento || item.id_aduana || item.id_embarque || item.id_pago || item._id || index}
            className="bg-slate-50 border border-slate-200 rounded-lg p-3 font-semibold text-sm text-slate-700"
          >
            {render(item)}
          </div>
        ))}
      </div>
    </div>
  );
}

function EstadoBadge({ estado }) {
  let color = 'bg-gray-600';

  if (
    ['Entregada', 'Completado', 'Registrado', 'Monitoreado', 'Liberado', 'Nacionalizado', 'Aprobado'].includes(estado)
  ) {
    color = 'bg-green-600';
  } else if (
    ['Pendiente', 'Sin embarque', 'Sin tramite'].includes(estado)
  ) {
    color = 'bg-yellow-500';
  } else if (
    ['Observado', 'Vencido', 'Retrasado'].includes(estado)
  ) {
    color = 'bg-red-600';
  } else if (
    ['En proceso', 'En revision', 'En transito', 'En puerto'].includes(estado)
  ) {
    color = 'bg-blue-600';
  }

  return (
    <StatusBadge
      text={estado || 'Sin estado'}
      color={color}
      minWidth="min-w-[110px]"
    />
  );
}

function calcularCierre(orden, aduanas, documentos) {
  const aduanaCerrada = aduanas.some((aduana) =>
    ['Nacionalizado', 'Liberado'].includes(aduana.estado)
  );

  const documentosOk =
    documentos.length > 0 &&
    documentos.every((documento) =>
      ['Aprobado', 'Recibido'].includes(documento.estado) ||
      !estaVencido(documento)
    );

  if (orden.estado === 'Entregada' && aduanaCerrada && documentosOk) {
    return 'Completado';
  }

  return 'Pendiente';
}

function obtenerIdUsuarioOrden(orden) {
  return Number(
    orden?.id_usuario ||
      orden?.usuario?.id_usuario ||
      orden?.usuario?.id ||
      0
  );
}

function formatearFecha(fecha) {
  if (!fecha) return 'Sin fecha';

  return new Date(fecha).toLocaleDateString('es-EC', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function estimarTiempoEtapa(index) {
  const tiempos = [
    'Dia 0',
    'Dia 0-1',
    'Dia 1',
    'Dia 2-5',
    'Monitoreo continuo',
    'Dia 5-15',
    'Control documental',
    'Cierre operativo'
  ];

  return tiempos[index - 1] || `Etapa ${index}`;
}

function RiesgoBadge({ nivel }) {
  return (
    <StatusBadge
      text={`Riesgo ${nivel}`}
      color={obtenerColorRiesgo(nivel)}
      minWidth="min-w-[120px]"
    />
  );
}

function obtenerColorRiesgo(nivel) {
  if (nivel === 'ALTO') return 'bg-red-600';
  if (nivel === 'MEDIO') return 'bg-yellow-500';

  return 'bg-green-600';
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

export default Trazabilidad;
