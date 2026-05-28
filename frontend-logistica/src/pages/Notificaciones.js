import { useEffect, useMemo, useState } from 'react';

import Sidebar from '../components/Sidebar';

import API from '../services/api';

function Notificaciones() {
  const [productos, setProductos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [embarques, setEmbarques] = useState([]);
  const [aduanas, setAduanas] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [filtro, setFiltro] = useState('Todas');
  const [error, setError] = useState('');

  const obtenerDatos = async () => {
    try {
      const [
        productosRes,
        ordenesRes,
        embarquesRes,
        aduanasRes,
        documentosRes
      ] = await Promise.all([
        API.get('/productos'),
        API.get('/ordenes'),
        API.get('/embarques'),
        API.get('/aduanas'),
        API.get('/documentos')
      ]);

      setProductos(productosRes.data);
      setOrdenes(ordenesRes.data);
      setEmbarques(embarquesRes.data);
      setAduanas(aduanasRes.data);
      setDocumentos(documentosRes.data);
    } catch (error) {
      console.log(error);
      setError('No se pudieron cargar las notificaciones');
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  const notificaciones = useMemo(() => {
    return generarNotificaciones({
      productos,
      ordenes,
      embarques,
      aduanas,
      documentos
    });
  }, [productos, ordenes, embarques, aduanas, documentos]);

  const filtradas = useMemo(() => {
    if (filtro === 'Todas') return notificaciones;

    return notificaciones.filter(
      (item) => item.prioridad === filtro
    );
  }, [notificaciones, filtro]);

  const altas = notificaciones.filter(
    (item) => item.prioridad === 'Alta'
  ).length;

  const medias = notificaciones.filter(
    (item) => item.prioridad === 'Media'
  ).length;

  const bajas = notificaciones.filter(
    (item) => item.prioridad === 'Baja'
  ).length;

  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8 overflow-x-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Notificaciones Operativas
            </h1>

            <p className="text-gray-500 mt-2">
              Alertas automaticas para inventario, pagos, embarques, aduana y documentos
            </p>
          </div>

          <button
            type="button"
            onClick={obtenerDatos}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg w-fit"
          >
            Actualizar
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl font-bold mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KPI titulo="Total alertas" valor={notificaciones.length} color="bg-blue-600" />
          <KPI titulo="Prioridad alta" valor={altas} color="bg-red-600" />
          <KPI titulo="Prioridad media" valor={medias} color="bg-yellow-500" />
          <KPI titulo="Informativas" valor={bajas} color="bg-green-600" />
        </div>

        <div className="bg-white rounded-2xl shadow p-5 mb-6">
          <div className="flex flex-wrap gap-3">
            {['Todas', 'Alta', 'Media', 'Baja'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFiltro(item)}
                className={`
                  px-5
                  py-3
                  rounded-xl
                  font-bold
                  ${filtro === item
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}
                `}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {filtradas.length === 0 && (
          <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
            No hay notificaciones para este filtro.
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filtradas.map((item) => (
            <NotificacionCard
              key={item.id}
              item={item}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function generarNotificaciones({
  productos,
  ordenes,
  embarques,
  aduanas,
  documentos
}) {
  const alertas = [];

  productos
    .filter((producto) => Number(producto.stock || 0) < 10)
    .forEach((producto) => {
      alertas.push({
        id: `stock-${producto.id_producto}`,
        modulo: 'Inventario',
        titulo: 'Stock bajo',
        detalle: `${producto.nombre} tiene ${producto.stock || 0} unidades disponibles`,
        prioridad: Number(producto.stock || 0) === 0 ? 'Alta' : 'Media',
        accion: 'Revisar reposicion o proveedor'
      });
    });

  ordenes
    .filter((orden) => !orden.pagos || orden.pagos.length === 0)
    .forEach((orden) => {
      alertas.push({
        id: `orden-pago-${orden.id_orden}`,
        modulo: 'Ordenes',
        titulo: 'Orden sin pago',
        detalle: `Orden #${orden.id_orden} no tiene pagos registrados`,
        prioridad: 'Media',
        accion: 'Registrar pago o validar estado financiero'
      });
    });

  ordenes
    .filter((orden) => !orden.embarques || orden.embarques.length === 0)
    .forEach((orden) => {
      alertas.push({
        id: `orden-embarque-${orden.id_orden}`,
        modulo: 'Ordenes',
        titulo: 'Orden sin embarque',
        detalle: `Orden #${orden.id_orden} no tiene embarque asociado`,
        prioridad: 'Media',
        accion: 'Crear embarque para iniciar seguimiento logistico'
      });
    });

  embarques
    .filter((embarque) => embarque.estado === 'Retrasado')
    .forEach((embarque) => {
      alertas.push({
        id: `embarque-${embarque.id_embarque}`,
        modulo: 'Embarques',
        titulo: 'Embarque retrasado',
        detalle: `${embarque.origen || 'Origen'} hacia ${embarque.destino || 'Destino'} esta retrasado`,
        prioridad: 'Alta',
        accion: 'Contactar operador logistico y actualizar tracking'
      });
    });

  aduanas
    .filter((aduana) => aduana.estado === 'Observado')
    .forEach((aduana) => {
      alertas.push({
        id: `aduana-observada-${aduana.id_aduana}`,
        modulo: 'Aduana',
        titulo: 'Tramite aduanero observado',
        detalle: `Aduana #${aduana.id_aduana} de orden #${aduana.id_orden || 'N/A'} requiere revision`,
        prioridad: 'Alta',
        accion: 'Revisar observaciones y corregir documentacion'
      });
    });

  aduanas
    .filter((aduana) => aduana.documentos_pendientes?.trim())
    .forEach((aduana) => {
      alertas.push({
        id: `aduana-docs-${aduana.id_aduana}`,
        modulo: 'Aduana',
        titulo: 'Documentos aduaneros pendientes',
        detalle: `Aduana #${aduana.id_aduana}: ${aduana.documentos_pendientes}`,
        prioridad: 'Media',
        accion: 'Solicitar documento pendiente al responsable'
      });
    });

  documentos
    .filter((documento) => documento.estado === 'Pendiente')
    .forEach((documento) => {
      alertas.push({
        id: `documento-pendiente-${documento.id_documento}`,
        modulo: 'Documentos',
        titulo: 'Documento pendiente',
        detalle: `${documento.nombre} esta pendiente de gestion`,
        prioridad: 'Media',
        accion: 'Completar, recibir o aprobar documento'
      });
    });

  documentos
    .filter((documento) => documento.estado === 'Observado')
    .forEach((documento) => {
      alertas.push({
        id: `documento-observado-${documento.id_documento}`,
        modulo: 'Documentos',
        titulo: 'Documento observado',
        detalle: `${documento.nombre} tiene observaciones`,
        prioridad: 'Alta',
        accion: 'Corregir documento y actualizar estado'
      });
    });

  documentos
    .filter((documento) => estaVencido(documento))
    .forEach((documento) => {
      alertas.push({
        id: `documento-vencido-${documento.id_documento}`,
        modulo: 'Documentos',
        titulo: 'Documento vencido',
        detalle: `${documento.nombre} vencio el ${formatearFecha(documento.fecha_vencimiento)}`,
        prioridad: 'Alta',
        accion: 'Renovar documento o escalar gestion'
      });
    });

  return alertas.sort((a, b) =>
    prioridadValor(b.prioridad) - prioridadValor(a.prioridad)
  );
}

function NotificacionCard({ item }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 border-l-8 border-slate-300">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-gray-500">
            {item.modulo}
          </p>

          <h2 className="text-2xl font-bold text-slate-800 mt-1">
            {item.titulo}
          </h2>

          <p className="text-gray-600 mt-3">
            {item.detalle}
          </p>
        </div>

        <PrioridadBadge prioridad={item.prioridad} />
      </div>

      <div className="bg-slate-100 rounded-xl p-4 mt-5">
        <p className="text-sm text-gray-500 font-bold">
          Accion sugerida
        </p>

        <p className="text-slate-800 font-semibold mt-1">
          {item.accion}
        </p>
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

function PrioridadBadge({ prioridad }) {
  let color = 'bg-green-600';

  if (prioridad === 'Alta') color = 'bg-red-600';
  else if (prioridad === 'Media') color = 'bg-yellow-500';

  return (
    <span className={`${color} text-white px-4 py-2 rounded-full text-sm font-bold w-fit`}>
      {prioridad}
    </span>
  );
}

function prioridadValor(prioridad) {
  if (prioridad === 'Alta') return 3;
  if (prioridad === 'Media') return 2;
  return 1;
}

function estaVencido(documento) {
  if (!documento.fecha_vencimiento) return false;
  if (
    documento.estado === 'Aprobado' ||
    documento.estado === 'Recibido'
  ) {
    return false;
  }

  const hoy = new Date();
  const vencimiento = new Date(documento.fecha_vencimiento);

  hoy.setHours(0, 0, 0, 0);
  vencimiento.setHours(0, 0, 0, 0);

  return vencimiento < hoy;
}

function formatearFecha(fecha) {
  if (!fecha) return 'N/A';

  return new Date(fecha).toLocaleDateString('es-EC', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

export default Notificaciones;
