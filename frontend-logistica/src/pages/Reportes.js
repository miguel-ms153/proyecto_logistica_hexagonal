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

import {
  calcularScoreRiesgo,
  estaVencido
} from '../utils/riskScoring';

function Reportes() {
  const [ordenes, setOrdenes] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [embarques, setEmbarques] = useState([]);
  const [aduanas, setAduanas] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [error, setError] = useState('');

  const obtenerDatos = async () => {
    try {
      const [
        ordenesRes,
        pagosRes,
        embarquesRes,
        aduanasRes,
        documentosRes,
        productosRes
      ] = await Promise.all([
        API.get('/ordenes'),
        API.get('/pagos'),
        API.get('/embarques'),
        API.get('/aduanas'),
        API.get('/documentos'),
        API.get('/productos')
      ]);

      setOrdenes(ordenesRes.data);
      setPagos(pagosRes.data);
      setEmbarques(embarquesRes.data);
      setAduanas(aduanasRes.data);
      setDocumentos(documentosRes.data);
      setProductos(productosRes.data);
    } catch (error) {
      console.log(error);
      setError('No se pudieron cargar los reportes gerenciales');
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  const reporte = useMemo(() => {
    const ordenesFiltradas = filtrarPorFecha(ordenes, desde, hasta, 'fecha');
    const pagosFiltrados = filtrarPorFecha(pagos, desde, hasta, 'fecha');
    const embarquesFiltrados = embarques;
    const aduanasFiltradas = filtrarPorFecha(aduanas, desde, hasta, 'fecha_ingreso');
    const documentosFiltrados = filtrarPorFecha(documentos, desde, hasta, 'fecha_emision');

    const idsOrdenes = new Set(
      ordenesFiltradas.map((orden) => Number(orden.id_orden))
    );

    const embarquesPorOrden = embarquesFiltrados.filter((embarque) =>
      idsOrdenes.size > 0
        ? idsOrdenes.has(Number(embarque.id_orden))
        : true
    );

    const aduanasPorOrden = aduanasFiltradas.filter((aduana) =>
      idsOrdenes.size > 0
        ? idsOrdenes.has(Number(aduana.id_orden))
        : true
    );

    const documentosPorOrden = documentosFiltrados.filter((documento) =>
      idsOrdenes.size > 0
        ? idsOrdenes.has(Number(documento.id_orden)) ||
          aduanasPorOrden.some(
            (aduana) => Number(aduana.id_aduana) === Number(documento.id_aduana)
          )
        : true
    );

    const valorPagado = pagosFiltrados.reduce(
      (acc, pago) => acc + Number(pago.monto || 0),
      0
    );

    const pagosPendientes = pagosFiltrados.filter(
      (pago) => pago.estado === 'Pendiente'
    ).length;

    const embarquesRetrasados = embarquesPorOrden.filter(
      (embarque) => embarque.estado === 'Retrasado'
    ).length;

    const aduanasObservadas = aduanasPorOrden.filter(
      (aduana) => aduana.estado === 'Observado'
    ).length;

    const documentosPendientes = documentosPorOrden.filter(
      (documento) => documento.estado === 'Pendiente'
    ).length;

    const documentosVencidos = documentosPorOrden.filter((documento) =>
      estaVencido(documento)
    ).length;

    const clientesRanking = generarRankingClientes(ordenesFiltradas);
    const productosRanking = generarRankingProductos(ordenesFiltradas, productos);
    const estadosOrden = generarConteoPorCampo(ordenesFiltradas, 'estado');
    const estadosDocumentos = generarConteoPorCampo(documentosPorOrden, 'estado');

    const resumenExportable = ordenesFiltradas.map((orden) => {
      const pagosOrden = pagos.filter(
        (pago) => Number(pago.id_orden) === Number(orden.id_orden)
      );

      const embarquesOrden = embarques.filter(
        (embarque) => Number(embarque.id_orden) === Number(orden.id_orden)
      );

      const aduanasOrden = aduanas.filter(
        (aduana) => Number(aduana.id_orden) === Number(orden.id_orden)
      );

      const documentosOrden =
        documentosPorOrden.filter(
          (documento) => Number(documento.id_orden) === Number(orden.id_orden)
        );

      const riesgo =
        calcularScoreRiesgo({
          orden,
          pagos: pagosOrden,
          embarques: embarquesOrden,
          aduanas: aduanasOrden,
          documentos: documentosOrden,
          tracking: []
        });

      return {
        orden: orden.id_orden,
        usuario: orden.usuario?.nombre || 'N/A',
        estado: orden.estado || 'N/A',
        fecha: formatearFecha(orden.fecha),
        pagos: pagosOrden.length,
        valor_pagado: pagosOrden.reduce(
          (acc, pago) => acc + Number(pago.monto || 0),
          0
        ),
        embarques: embarquesOrden.length,
        aduanas: aduanasOrden.length,
        documentos: documentosOrden.length,
        riesgo: riesgo.nivel,
        score: riesgo.score,
        recomendacion_ia: riesgo.recomendacion
      };
    });

    const scorePromedio =
      resumenExportable.length > 0
        ? Math.round(
            resumenExportable.reduce(
              (acc, item) => acc + Number(item.score || 0),
              0
            ) / resumenExportable.length
          )
        : 0;

    const datosExportacion = resumenExportable.map((item) => ({
      Orden: `#${item.orden}`,
      Usuario: item.usuario,
      Estado: item.estado,
      Fecha: item.fecha,
      Pagos: item.pagos,
      Valor_pagado: `$${Number(item.valor_pagado || 0).toFixed(2)}`,
      Embarques: item.embarques,
      Aduanas: item.aduanas,
      Documentos: item.documentos,
      Riesgo_IA: `${item.riesgo} - ${item.score}/100`,
      Recomendacion: resumirTexto(item.recomendacion_ia)
    }));

    return {
      ordenesFiltradas,
      pagosFiltrados,
      embarquesPorOrden,
      aduanasPorOrden,
      documentosPorOrden,
      valorPagado,
      pagosPendientes,
      embarquesRetrasados,
      aduanasObservadas,
      documentosPendientes,
      documentosVencidos,
      clientesRanking,
      productosRanking,
      estadosOrden,
      estadosDocumentos,
      resumenExportable,
      datosExportacion,
      scorePromedio
    };
  }, [ordenes, pagos, embarques, aduanas, documentos, productos, desde, hasta]);

  const columns = [
    {
      name: 'Orden',
      width: '82px',
      selector: (row) => `#${row.orden}`,
      sortable: true
    },
    {
      name: 'Usuario',
      minWidth: '180px',
      grow: 2,
      selector: (row) => row.usuario,
      sortable: true,
      cell: (row) => (
        <div className="min-w-0">
          <p className="font-bold text-slate-800 truncate" title={row.usuario}>
            {row.usuario}
          </p>

          <p className="text-xs text-slate-500">
            Orden #{row.orden}
          </p>
        </div>
      )
    },
    {
      name: 'Estado',
      width: '130px',
      selector: (row) => row.estado,
      sortable: true,
      cell: (row) => <EstadoOrdenBadge estado={row.estado} />
    },
    {
      name: 'Fecha',
      width: '110px',
      selector: (row) => row.fecha,
      sortable: true,
      cell: (row) => (
        <span className="truncate block max-w-[95px]" title={row.fecha}>
          {row.fecha}
        </span>
      )
    },
    {
      name: 'Pagado',
      width: '120px',
      cell: (row) => (
        <span className="font-bold text-green-600">
          ${Number(row.valor_pagado || 0).toFixed(2)}
        </span>
      )
    },
    {
      name: 'Embarques',
      width: '110px',
      selector: (row) => row.embarques
    },
    {
      name: 'Aduanas',
      width: '100px',
      selector: (row) => row.aduanas
    },
    {
      name: 'Docs',
      width: '85px',
      selector: (row) => row.documentos
    },
    {
      name: 'Riesgo IA',
      width: '125px',
      cell: (row) => <RiesgoBadge nivel={row.riesgo} score={row.score} />,
      center: true
    }
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#0f172a',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '13px',
        minHeight: '48px'
      }
    },
    rows: {
      style: {
        minHeight: '54px',
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
        title="Reportes Gerenciales"
        subtitle="Analitica ejecutiva para comercio exterior, pagos, aduana, documentos e IA"
        badge={`Ordenes: ${reporte.ordenesFiltradas.length}`}
      />

      <AlertMessage message={error} />

      <SectionCard
        title="Filtros de reporte"
        subtitle="Define un rango de fechas para analizar el desempeno operativo"
        className="!mb-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CampoFormulario label="Desde">
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className={inputStyle}
            />
          </CampoFormulario>

          <CampoFormulario label="Hasta">
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className={inputStyle}
            />
          </CampoFormulario>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setDesde('');
                setHasta('');
              }}
              className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-3 rounded-lg font-bold w-full text-sm"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </SectionCard>

      <KpiGrid
        items={[
          {
            title: 'Valor pagado',
            value: `$${reporte.valorPagado.toFixed(2)}`,
            color: 'bg-green-600'
          },
          {
            title: 'Pagos pendientes',
            value: reporte.pagosPendientes,
            color: 'bg-yellow-500'
          },
          {
            title: 'Embarques retrasados',
            value: reporte.embarquesRetrasados,
            color: 'bg-red-600'
          },
          {
            title: 'Score promedio IA',
            value: `${reporte.scorePromedio}/100`,
            color: obtenerColorRiesgoScore(reporte.scorePromedio)
          }
        ]}
      />

      <KpiGrid
        columns="md:grid-cols-3"
        items={[
          {
            title: 'Aduanas observadas',
            value: reporte.aduanasObservadas,
            color: 'bg-purple-600'
          },
          {
            title: 'Docs pendientes',
            value: reporte.documentosPendientes,
            color: 'bg-blue-600'
          },
          {
            title: 'Docs vencidos',
            value: reporte.documentosVencidos,
            color: 'bg-slate-800'
          }
        ]}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-5">
        <RankingCard
          titulo="Clientes con mas ordenes"
          items={reporte.clientesRanking}
          empty="Sin datos de clientes"
        />

        <RankingCard
          titulo="Productos mas solicitados"
          items={reporte.productosRanking}
          empty="Sin datos de productos"
        />

        <DistribucionCard
          titulo="Estados de ordenes"
          items={reporte.estadosOrden}
        />

        <DistribucionCard
          titulo="Estados documentales"
          items={reporte.estadosDocumentos}
        />
      </div>

      <ExportButtons
        data={reporte.datosExportacion}
        fileName="reporte_gerencial"
      />

      <DataTableCard
        columns={columns}
        data={reporte.resumenExportable}
        noData="No hay datos para el reporte seleccionado"
        fixedHeaderScrollHeight="520px"
        selectableRows={false}
        dense
        customStyles={customStyles}
      />
    </PageLayout>
  );
}

function CampoFormulario({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-bold text-slate-600 mb-2">
        {label}
      </span>

      {children}
    </label>
  );
}

function RankingCard({ titulo, items, empty }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h2 className="text-lg font-bold text-slate-800 mb-4">
        {titulo}
      </h2>

      {items.length === 0 && (
        <p className="text-gray-500">{empty}</p>
      )}

      <div className="space-y-3">
        {items.slice(0, 5).map((item, index) => (
          <div key={item.nombre} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              {index + 1}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold text-sm text-slate-800 truncate">{item.nombre}</p>
                <p className="font-bold text-sm text-blue-600">{item.total}</p>
              </div>

              <div className="h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-2 bg-blue-600 rounded-full"
                  style={{ width: `${item.porcentaje}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DistribucionCard({ titulo, items }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h2 className="text-lg font-bold text-slate-800 mb-4">
        {titulo}
      </h2>

      {items.length === 0 && (
        <p className="text-gray-500">Sin datos disponibles</p>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.nombre}>
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-sm text-slate-700">{item.nombre}</p>
              <p className="font-bold text-sm text-slate-900">{item.total}</p>
            </div>

            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-2 bg-green-600 rounded-full"
                style={{ width: `${item.porcentaje}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function filtrarPorFecha(items, desde, hasta, campo) {
  if (!desde && !hasta) return items;

  const desdeDate = desde ? crearFechaLocal(desde) : null;
  const hastaDate = hasta ? crearFechaLocal(hasta) : null;

  if (hastaDate) {
    hastaDate.setHours(23, 59, 59, 999);
  }

  return items.filter((item) => {
    if (!item[campo]) return false;

    const fecha = new Date(item[campo]);

    if (desdeDate && fecha < desdeDate) return false;
    if (hastaDate && fecha > hastaDate) return false;

    return true;
  });
}

function crearFechaLocal(value) {
  const [year, month, day] = value.split('-').map(Number);

  return new Date(year, month - 1, day);
}

function generarRankingClientes(ordenes) {
  const conteo = {};

  ordenes.forEach((orden) => {
    const nombre =
      orden.usuario?.nombre ||
      'Sin usuario';

    conteo[nombre] = (conteo[nombre] || 0) + 1;
  });

  return convertirConteoEnRanking(conteo);
}

function generarRankingProductos(ordenes, productos) {
  const conteo = {};

  ordenes.forEach((orden) => {
    (orden.productos || []).forEach((producto) => {
      const nombre =
        producto.nombre ||
        productos.find((item) => Number(item.id_producto) === Number(producto.id_producto))?.nombre ||
        'Producto';

      conteo[nombre] = (conteo[nombre] || 0) + 1;
    });
  });

  return convertirConteoEnRanking(conteo);
}

function generarConteoPorCampo(items, campo) {
  const conteo = {};

  items.forEach((item) => {
    const nombre = item[campo] || 'Sin estado';
    conteo[nombre] = (conteo[nombre] || 0) + 1;
  });

  return convertirConteoEnRanking(conteo);
}

function convertirConteoEnRanking(conteo) {
  const maximo = Math.max(...Object.values(conteo), 0);

  return Object.entries(conteo)
    .map(([nombre, total]) => ({
      nombre,
      total,
      porcentaje: maximo > 0 ? Math.round((total / maximo) * 100) : 0
    }))
    .sort((a, b) => b.total - a.total);
}

function formatearFecha(fecha) {
  if (!fecha) return 'N/A';

  return new Date(fecha).toLocaleDateString('es-EC', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function resumirTexto(texto) {
  if (!texto) return 'N/A';

  return texto.length > 70
    ? `${texto.slice(0, 70)}...`
    : texto;
}

function EstadoOrdenBadge({ estado }) {
  let color = 'bg-gray-600';

  if (estado === 'Pendiente') color = 'bg-yellow-500';
  else if (estado === 'En proceso') color = 'bg-blue-600';
  else if (estado === 'Entregada') color = 'bg-green-600';
  else if (estado === 'Cancelada') color = 'bg-red-600';

  return (
    <StatusBadge
      text={estado || 'N/A'}
      color={color}
      minWidth="min-w-[105px]"
    />
  );
}

function RiesgoBadge({ nivel, score }) {
  return (
    <StatusBadge
      text={`${nivel} ${score}/100`}
      color={obtenerColorRiesgo(nivel)}
      minWidth="min-w-[105px]"
    />
  );
}

function obtenerColorRiesgo(nivel) {
  if (nivel === 'ALTO') return 'bg-red-600';
  if (nivel === 'MEDIO') return 'bg-yellow-500';

  return 'bg-green-600';
}

function obtenerColorRiesgoScore(score) {
  if (score >= 66) return 'bg-red-600';
  if (score >= 31) return 'bg-yellow-500';

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

export default Reportes;
