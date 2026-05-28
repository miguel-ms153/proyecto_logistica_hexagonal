import { useEffect, useMemo, useState } from 'react';

import DataTable from 'react-data-table-component';

import Sidebar from '../components/Sidebar';

import API from '../services/api';

import { exportarExcel } from '../utils/exportExcel';
import { exportarPDF } from '../utils/exportPDF';

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
      scorePromedio
    };
  }, [ordenes, pagos, embarques, aduanas, documentos, productos, desde, hasta]);

  const columns = [
    {
      name: 'Orden',
      selector: (row) => `#${row.orden}`,
      sortable: true
    },
    {
      name: 'Usuario',
      selector: (row) => row.usuario,
      sortable: true,
      grow: 2
    },
    {
      name: 'Estado',
      selector: (row) => row.estado,
      sortable: true
    },
    {
      name: 'Fecha',
      selector: (row) => row.fecha,
      sortable: true
    },
    {
      name: 'Valor pagado',
      cell: (row) => (
        <span className="font-bold text-green-600">
          ${Number(row.valor_pagado || 0).toFixed(2)}
        </span>
      )
    },
    {
      name: 'Embarques',
      selector: (row) => row.embarques
    },
    {
      name: 'Aduanas',
      selector: (row) => row.aduanas
    },
    {
      name: 'Docs',
      selector: (row) => row.documentos
    },
    {
      name: 'Riesgo IA',
      cell: (row) => <RiesgoBadge nivel={row.riesgo} score={row.score} />,
      grow: 2
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
    },
    rows: {
      style: {
        minHeight: '68px',
        fontSize: '15px'
      }
    }
  };

  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8 overflow-x-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Reportes Gerenciales
            </h1>

            <p className="text-gray-500 mt-2">
              Analitica por fechas para comercio exterior, pagos, aduana y documentos
            </p>
          </div>

          <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-semibold shadow-lg w-fit">
            Ordenes: {reporte.ordenesFiltradas.length}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl font-bold mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
                className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-4 rounded-xl font-bold w-full"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <KPI titulo="Valor pagado" valor={`$${reporte.valorPagado.toFixed(2)}`} color="bg-green-600" />
          <KPI titulo="Pagos pendientes" valor={reporte.pagosPendientes} color="bg-yellow-500" />
          <KPI titulo="Embarques retrasados" valor={reporte.embarquesRetrasados} color="bg-red-600" />
          <KPI titulo="Score promedio IA" valor={`${reporte.scorePromedio}/100`} color={obtenerColorRiesgoScore(reporte.scorePromedio)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <KPI titulo="Aduanas observadas" valor={reporte.aduanasObservadas} color="bg-purple-600" />
          <KPI titulo="Docs pendientes" valor={reporte.documentosPendientes} color="bg-blue-600" />
          <KPI titulo="Docs vencidos" valor={reporte.documentosVencidos} color="bg-slate-800" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
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

        <div className="flex flex-wrap gap-4 mb-6">
          <button
            type="button"
            onClick={() => exportarExcel(reporte.resumenExportable, 'reporte_gerencial')}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-bold"
          >
            Exportar Excel
          </button>

          <button
            type="button"
            onClick={() => exportarPDF(reporte.resumenExportable, 'reporte_gerencial')}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-bold"
          >
            Exportar PDF
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <DataTable
            columns={columns}
            data={reporte.resumenExportable}
            pagination
            responsive
            striped
            highlightOnHover
            fixedHeader
            fixedHeaderScrollHeight="520px"
            customStyles={customStyles}
          />
        </div>
      </div>
    </div>
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

function KPI({ titulo, valor, color }) {
  return (
    <div className={`${color} text-white p-6 rounded-2xl shadow-lg`}>
      <p className="text-lg font-medium">{titulo}</p>
      <h2 className="text-4xl font-bold mt-3 break-words">{valor}</h2>
    </div>
  );
}

function RankingCard({ titulo, items, empty }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-5">
        {titulo}
      </h2>

      {items.length === 0 && (
        <p className="text-gray-500">{empty}</p>
      )}

      <div className="space-y-4">
        {items.slice(0, 5).map((item, index) => (
          <div key={item.nombre} className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              {index + 1}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold text-slate-800">{item.nombre}</p>
                <p className="font-bold text-blue-600">{item.total}</p>
              </div>

              <div className="h-3 bg-slate-200 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-3 bg-blue-600 rounded-full"
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
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-5">
        {titulo}
      </h2>

      {items.length === 0 && (
        <p className="text-gray-500">Sin datos disponibles</p>
      )}

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.nombre}>
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-slate-700">{item.nombre}</p>
              <p className="font-bold text-slate-900">{item.total}</p>
            </div>

            <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-3 bg-green-600 rounded-full"
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

function RiesgoBadge({ nivel, score }) {
  return (
    <span className={`${obtenerColorRiesgo(nivel)} text-white px-4 py-2 rounded-full text-sm font-bold w-fit`}>
      {nivel} - {score}/100
    </span>
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
  rounded-xl
  p-4
  outline-none
  focus:ring-2
  focus:ring-blue-500
`;

export default Reportes;
