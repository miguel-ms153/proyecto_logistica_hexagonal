import { useEffect, useMemo, useState } from 'react';

import API from '../services/api';

import AlertMessage from '../components/common/AlertMessage';
import DataTableCard from '../components/common/DataTableCard';
import ExportButtons from '../components/common/ExportButtons';
import KpiGrid from '../components/common/KpiGrid';
import PageHeader from '../components/common/PageHeader';
import PageLayout from '../components/common/PageLayout';
import SectionCard from '../components/common/SectionCard';
import StatusBadge from '../components/common/StatusBadge';

function Notificaciones() {
  const [productos, setProductos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [embarques, setEmbarques] = useState([]);
  const [aduanas, setAduanas] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [filtro, setFiltro] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
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
    const texto = busqueda.toLowerCase();

    return notificaciones.filter((item) => {
      const coincidePrioridad =
        filtro === 'Todas' ||
        item.prioridad === filtro;

      const coincideBusqueda = [
        item.modulo,
        item.titulo,
        item.detalle,
        item.prioridad,
        item.accion
      ]
        .join(' ')
        .toLowerCase()
        .includes(texto);

      return coincidePrioridad && coincideBusqueda;
    });
  }, [notificaciones, filtro, busqueda]);

  const altas = notificaciones.filter(
    (item) => item.prioridad === 'Alta'
  ).length;

  const medias = notificaciones.filter(
    (item) => item.prioridad === 'Media'
  ).length;

  const bajas = notificaciones.filter(
    (item) => item.prioridad === 'Baja'
  ).length;

  const datosExportacion = filtradas.map((item) => ({
    Modulo: item.modulo,
    Prioridad: item.prioridad,
    Alerta: item.titulo,
    Detalle: item.detalle,
    Accion_sugerida: item.accion
  }));

  const columns = [
    {
      name: 'Modulo',
      selector: (row) => row.modulo,
      sortable: true,
      width: '130px',
      cell: (row) => (
        <span className="font-bold text-slate-700">
          {row.modulo}
        </span>
      )
    },
    {
      name: 'Alerta',
      selector: (row) => row.titulo,
      sortable: true,
      minWidth: '250px',
      grow: 2,
      cell: (row) => (
        <div className="min-w-0 py-1">
          <p className="font-bold text-slate-800 truncate" title={row.titulo}>
            {row.titulo}
          </p>

          <p className="text-xs text-slate-500 truncate" title={row.detalle}>
            {row.detalle}
          </p>
        </div>
      )
    },
    {
      name: 'Prioridad',
      selector: (row) => row.prioridad,
      sortable: true,
      width: '125px',
      cell: (row) => <PrioridadBadge prioridad={row.prioridad} />
    },
    {
      name: 'Accion sugerida',
      selector: (row) => row.accion,
      minWidth: '260px',
      grow: 2,
      cell: (row) => (
        <span className="text-slate-700 line-clamp-2" title={row.accion}>
          {row.accion}
        </span>
      )
    }
  ];

  const customStyles = {
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
        minHeight: '58px',
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
        title="Centro de Notificaciones"
        subtitle="Alertas operativas para inventario, pagos, embarques, aduana y documentos"
        badge={`Alertas: ${notificaciones.length}`}
        badgeColor={altas > 0 ? 'bg-red-600' : 'bg-green-600'}
      />

      <AlertMessage message={error} />

      <KpiGrid
        items={[
          { title: 'Total alertas', value: notificaciones.length, color: 'bg-blue-600' },
          { title: 'Prioridad alta', value: altas, color: 'bg-red-600' },
          { title: 'Prioridad media', value: medias, color: 'bg-yellow-500' },
          { title: 'Informativas', value: bajas, color: 'bg-green-600' }
        ]}
      />

      <SectionCard
        title="Bandeja operativa"
        subtitle="Filtra alertas por prioridad o busca por modulo, detalle y accion sugerida"
        className="!mb-5"
      >
        <div className="flex flex-col xl:flex-row gap-4 xl:items-end">
          <div className="flex-1">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por modulo, alerta, detalle o accion..."
              className={inputStyle}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {['Todas', 'Alta', 'Media', 'Baja'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFiltro(item)}
                className={`
                  px-4
                  py-2.5
                  rounded-lg
                  font-bold
                  text-sm
                  ${filtro === item
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}
                `}
              >
                {item}
              </button>
            ))}

            <button
              type="button"
              onClick={obtenerDatos}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm"
            >
              Actualizar
            </button>
          </div>
        </div>
      </SectionCard>

      <PanelCritico items={notificaciones.filter((item) => item.prioridad === 'Alta')} />

      <ExportButtons
        data={datosExportacion}
        fileName="notificaciones_operativas"
      />

      <DataTableCard
        columns={columns}
        data={filtradas}
        noData="No hay notificaciones para este filtro"
        fixedHeaderScrollHeight="520px"
        selectableRows={false}
        dense
        customStyles={customStyles}
      />
    </PageLayout>
  );
}

function PanelCritico({ items }) {
  const destacados = items.slice(0, 3);

  if (destacados.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 mb-5 border-l-4 border-green-600">
        <p className="text-sm font-bold text-green-700">
          Sin alertas criticas activas
        </p>

        <p className="text-sm text-slate-500 mt-1">
          La operacion no registra eventos de prioridad alta en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-5">
      {destacados.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-600"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-500 uppercase">
                {item.modulo}
              </p>

              <h2 className="text-lg font-bold text-slate-800 mt-1">
                {item.titulo}
              </h2>
            </div>

            <PrioridadBadge prioridad={item.prioridad} />
          </div>

          <p className="text-sm text-slate-600 mt-3 line-clamp-2">
            {item.detalle}
          </p>

          <div className="bg-slate-100 rounded-lg p-3 mt-4">
            <p className="text-xs text-slate-500 font-bold">
              Accion sugerida
            </p>

            <p className="text-sm text-slate-800 font-semibold mt-1">
              {item.accion}
            </p>
          </div>
        </div>
      ))}
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

function PrioridadBadge({ prioridad }) {
  let color = 'bg-green-600';

  if (prioridad === 'Alta') color = 'bg-red-600';
  else if (prioridad === 'Media') color = 'bg-yellow-500';

  return (
    <StatusBadge
      text={prioridad}
      color={color}
      minWidth="min-w-[82px]"
    />
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

export default Notificaciones;
