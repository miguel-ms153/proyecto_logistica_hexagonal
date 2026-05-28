import { useEffect, useMemo, useState } from 'react';

import DataTable from 'react-data-table-component';

import Sidebar from '../components/Sidebar';

import API from '../services/api';

import { exportarExcel } from '../utils/exportExcel';
import { exportarPDF } from '../utils/exportPDF';

const estadoOptions = [
  'Pendiente',
  'En revision',
  'Observado',
  'Aprobado',
  'Nacionalizado',
  'Liberado'
];

const regimenOptions = [
  'Importacion a consumo',
  'Admision temporal',
  'Deposito aduanero',
  'Reimportacion',
  'Exportacion'
];

const formInicial = {
  id_orden: '',
  numero_declaracion: '',
  regimen: 'Importacion a consumo',
  partida_arancelaria: '',
  agente_aduanero: '',
  estado: 'Pendiente',
  documentos_pendientes: '',
  observaciones: '',
  fecha_ingreso: '',
  fecha_nacionalizacion: ''
};

function Aduanas() {
  const [aduanas, setAduanas] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [form, setForm] = useState(formInicial);
  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [error, setError] = useState('');

  const obtenerDatos = async () => {
    try {
      const [aduanasRes, ordenesRes] = await Promise.all([
        API.get('/aduanas'),
        API.get('/ordenes')
      ]);

      setAduanas(aduanasRes.data);
      setOrdenes(ordenesRes.data);
    } catch (error) {
      console.log(error);
      setError('No se pudo cargar la gestion aduanera');
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  const filtrados = useMemo(() => {
    const texto = busqueda.toLowerCase();

    return aduanas.filter((item) =>
      [
        item.id_aduana,
        item.id_orden,
        item.numero_declaracion,
        item.regimen,
        item.partida_arancelaria,
        item.agente_aduanero,
        item.estado
      ]
        .join(' ')
        .toLowerCase()
        .includes(texto)
    );
  }, [aduanas, busqueda]);

  const pendientes = aduanas.filter(
    (item) => item.estado === 'Pendiente'
  ).length;

  const observados = aduanas.filter(
    (item) => item.estado === 'Observado'
  ).length;

  const liberados = aduanas.filter(
    (item) => item.estado === 'Liberado'
  ).length;

  const documentosPendientes = aduanas.filter(
    (item) => item.documentos_pendientes?.trim()
  ).length;

  const handleChange = (campo, valor) => {
    setForm({
      ...form,
      [campo]: valor
    });
  };

  const limpiarFormulario = () => {
    setForm(formInicial);
    setEditando(false);
    setIdEditando(null);
    setError('');
  };

  const guardarAduana = async () => {
    if (!form.id_orden) {
      setError('Selecciona una orden para asociar el tramite aduanero');
      return;
    }

    try {
      const payload = {
        ...form,
        id_orden: Number(form.id_orden)
      };

      if (!payload.fecha_ingreso) {
        payload.fecha_ingreso = null;
      }

      if (!payload.fecha_nacionalizacion) {
        payload.fecha_nacionalizacion = null;
      }

      if (editando) {
        await API.put(`/aduanas/${idEditando}`, payload);
      } else {
        await API.post('/aduanas', payload);
      }

      limpiarFormulario();
      obtenerDatos();
    } catch (error) {
      console.log(error);
      setError(
        error.response?.data?.error ||
          'No se pudo guardar el tramite aduanero'
      );
    }
  };

  const editarAduana = (item) => {
    setForm({
      id_orden: item.id_orden || '',
      numero_declaracion: item.numero_declaracion || '',
      regimen: item.regimen || 'Importacion a consumo',
      partida_arancelaria: item.partida_arancelaria || '',
      agente_aduanero: item.agente_aduanero || '',
      estado: item.estado || 'Pendiente',
      documentos_pendientes: item.documentos_pendientes || '',
      observaciones: item.observaciones || '',
      fecha_ingreso: formatearFechaInput(item.fecha_ingreso),
      fecha_nacionalizacion: formatearFechaInput(item.fecha_nacionalizacion)
    });

    setEditando(true);
    setIdEditando(item.id_aduana);
    setError('');
  };

  const eliminarAduana = async (id) => {
    const confirmar = window.confirm(
      'Seguro que deseas eliminar este tramite aduanero?'
    );

    if (!confirmar) return;

    try {
      await API.delete(`/aduanas/${id}`);
      obtenerDatos();

      if (idEditando === id) {
        limpiarFormulario();
      }
    } catch (error) {
      console.log(error);
      setError('No se pudo eliminar el tramite aduanero');
    }
  };

  const columns = [
    {
      name: 'ID',
      selector: (row) => row.id_aduana,
      sortable: true,
      width: '80px'
    },
    {
      name: 'Orden',
      selector: (row) => `#${row.id_orden || 'N/A'}`,
      sortable: true
    },
    {
      name: 'Declaracion',
      selector: (row) => row.numero_declaracion || 'Sin numero',
      sortable: true
    },
    {
      name: 'Regimen',
      selector: (row) => row.regimen || 'N/A',
      sortable: true
    },
    {
      name: 'Partida',
      selector: (row) => row.partida_arancelaria || 'N/A'
    },
    {
      name: 'Estado',
      cell: (row) => <EstadoBadge estado={row.estado} />
    },
    {
      name: 'Documentos',
      cell: (row) => (
        <span className="font-semibold text-slate-700">
          {row.documentos_pendientes || 'Completos'}
        </span>
      ),
      grow: 2
    },
    {
      name: 'Acciones',
      cell: (row) => (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => editarAduana(row)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-3 rounded-xl font-bold min-w-[95px]"
          >
            Editar
          </button>

          <button
            type="button"
            onClick={() => eliminarAduana(row.id_aduana)}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-bold min-w-[105px]"
          >
            Eliminar
          </button>
        </div>
      ),
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
        minHeight: '72px',
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
              Gestion Aduanera
            </h1>

            <p className="text-gray-500 mt-2">
              Control de nacionalizacion, documentos y procesos de comercio exterior
            </p>
          </div>

          <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-semibold shadow-lg w-fit">
            Total: {aduanas.length}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KPI titulo="Pendientes" valor={pendientes} color="bg-yellow-500" />
          <KPI titulo="Observados" valor={observados} color="bg-red-600" />
          <KPI titulo="Liberados" valor={liberados} color="bg-green-600" />
          <KPI titulo="Docs pendientes" valor={documentosPendientes} color="bg-slate-800" />
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {editando ? 'Editar tramite aduanero' : 'Nuevo tramite aduanero'}
              </h2>

              <p className="text-gray-500 mt-1">
                Asocia una orden y registra su estado aduanero
              </p>
            </div>

            {editando && (
              <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-xl font-bold w-fit">
                Modo edicion
              </span>
            )}
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl font-bold mb-5">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <select
              value={form.id_orden}
              onChange={(e) => handleChange('id_orden', e.target.value)}
              className={inputStyle}
            >
              <option value="">Seleccionar orden</option>

              {ordenes.map((orden) => (
                <option key={orden.id_orden} value={orden.id_orden}>
                  Orden #{orden.id_orden} - {orden.usuario?.nombre || 'Sin usuario'}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Numero de declaracion"
              value={form.numero_declaracion}
              onChange={(e) => handleChange('numero_declaracion', e.target.value)}
              className={inputStyle}
            />

            <select
              value={form.regimen}
              onChange={(e) => handleChange('regimen', e.target.value)}
              className={inputStyle}
            >
              {regimenOptions.map((regimen) => (
                <option key={regimen} value={regimen}>
                  {regimen}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Partida arancelaria"
              value={form.partida_arancelaria}
              onChange={(e) => handleChange('partida_arancelaria', e.target.value)}
              className={inputStyle}
            />

            <input
              type="text"
              placeholder="Agente aduanero"
              value={form.agente_aduanero}
              onChange={(e) => handleChange('agente_aduanero', e.target.value)}
              className={inputStyle}
            />

            <select
              value={form.estado}
              onChange={(e) => handleChange('estado', e.target.value)}
              className={inputStyle}
            >
              {estadoOptions.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={form.fecha_ingreso}
              onChange={(e) => handleChange('fecha_ingreso', e.target.value)}
              className={inputStyle}
            />

            <input
              type="date"
              value={form.fecha_nacionalizacion}
              onChange={(e) => handleChange('fecha_nacionalizacion', e.target.value)}
              className={inputStyle}
            />

            <input
              type="text"
              placeholder="Documentos pendientes"
              value={form.documentos_pendientes}
              onChange={(e) => handleChange('documentos_pendientes', e.target.value)}
              className={inputStyle}
            />
          </div>

          <textarea
            placeholder="Observaciones"
            value={form.observaciones}
            onChange={(e) => handleChange('observaciones', e.target.value)}
            className={`${inputStyle} mt-5 min-h-[105px]`}
          />

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              type="button"
              onClick={guardarAduana}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold"
            >
              {editando ? 'Actualizar tramite' : 'Crear tramite'}
            </button>

            {editando && (
              <button
                type="button"
                onClick={limpiarFormulario}
                className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-5 mb-6">
          <input
            type="text"
            placeholder="Buscar por orden, declaracion, regimen, partida, agente o estado..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={inputStyle}
          />
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <button
            type="button"
            onClick={() => exportarExcel(aduanas, 'aduanas')}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-bold"
          >
            Exportar Excel
          </button>

          <button
            type="button"
            onClick={() => exportarPDF(aduanas, 'aduanas')}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-bold"
          >
            Exportar PDF
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <DataTable
            columns={columns}
            data={filtrados}
            pagination
            responsive
            striped
            highlightOnHover
            selectableRows
            fixedHeader
            fixedHeaderScrollHeight="520px"
            customStyles={customStyles}
          />
        </div>
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

function EstadoBadge({ estado }) {
  let color = 'bg-gray-600';

  if (estado === 'Pendiente') color = 'bg-yellow-500';
  else if (estado === 'En revision') color = 'bg-blue-600';
  else if (estado === 'Observado') color = 'bg-red-600';
  else if (estado === 'Aprobado') color = 'bg-indigo-600';
  else if (estado === 'Nacionalizado') color = 'bg-green-600';
  else if (estado === 'Liberado') color = 'bg-emerald-600';

  return (
    <span className={`${color} text-white px-4 py-2 rounded-full text-sm font-bold w-fit`}>
      {estado || 'Sin estado'}
    </span>
  );
}

function formatearFechaInput(fecha) {
  if (!fecha) return '';

  return new Date(fecha).toISOString().slice(0, 10);
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

export default Aduanas;
