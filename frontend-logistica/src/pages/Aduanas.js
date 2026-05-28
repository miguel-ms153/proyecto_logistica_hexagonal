import { useEffect, useMemo, useState } from 'react';

import API from '../services/api';

import AlertMessage from '../components/common/AlertMessage';
import DataTableCard from '../components/common/DataTableCard';
import ExportButtons from '../components/common/ExportButtons';
import FormActions from '../components/common/FormActions';
import KpiGrid from '../components/common/KpiGrid';
import PageHeader from '../components/common/PageHeader';
import PageLayout from '../components/common/PageLayout';
import SearchBox from '../components/common/SearchBox';
import SectionCard from '../components/common/SectionCard';
import StatusBadge from '../components/common/StatusBadge';

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

const documentoOptions = [
  '',
  'Factura comercial',
  'Packing list',
  'BL',
  'Guia aerea',
  'Certificado de origen',
  'Poliza de seguro',
  'Declaracion aduanera',
  'Comprobante de pago',
  'Permiso tecnico'
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
        id_orden: Number(form.id_orden),
        fecha_ingreso: form.fecha_ingreso || null,
        fecha_nacionalizacion: form.fecha_nacionalizacion || null
      };

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
      name: 'Ingreso',
      selector: (row) => formatearFechaTabla(row.fecha_ingreso),
      sortable: true
    },
    {
      name: 'Nacionalizacion',
      selector: (row) => formatearFechaTabla(row.fecha_nacionalizacion),
      sortable: true
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

  return (
    <PageLayout>
      <PageHeader
        title="Gestion Aduanera"
        subtitle="Control de nacionalizacion, documentos y procesos de comercio exterior"
        badge={`Total: ${aduanas.length}`}
      />

      <KpiGrid
        items={[
          { title: 'Pendientes', value: pendientes, color: 'bg-yellow-500' },
          { title: 'Observados', value: observados, color: 'bg-red-600' },
          { title: 'Liberados', value: liberados, color: 'bg-green-600' },
          { title: 'Docs pendientes', value: documentosPendientes, color: 'bg-slate-800' }
        ]}
      />

      <SectionCard
        title={editando ? 'Editar tramite aduanero' : 'Nuevo tramite aduanero'}
        subtitle="Asocia una orden y registra su estado aduanero"
      >
        {editando && (
          <div className="mb-5">
            <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-xl font-bold w-fit">
              Modo edicion
            </span>
          </div>
        )}

        <AlertMessage message={error} />

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

          <CampoFormulario label="Fecha de ingreso">
            <input
              type="date"
              value={form.fecha_ingreso}
              onChange={(e) => handleChange('fecha_ingreso', e.target.value)}
              className={inputStyle}
            />
          </CampoFormulario>

          <CampoFormulario label="Fecha de nacionalizacion">
            <input
              type="date"
              value={form.fecha_nacionalizacion}
              onChange={(e) => handleChange('fecha_nacionalizacion', e.target.value)}
              disabled={
                form.estado !== 'Nacionalizado' &&
                form.estado !== 'Liberado'
              }
              className={`${inputStyle} disabled:bg-slate-100 disabled:text-slate-400`}
            />
          </CampoFormulario>

          <CampoFormulario label="Documento pendiente">
            <select
              value={form.documentos_pendientes}
              onChange={(e) => handleChange('documentos_pendientes', e.target.value)}
              className={inputStyle}
            >
              {documentoOptions.map((documento) => (
                <option key={documento || 'sin-documento'} value={documento}>
                  {documento || 'Sin documentos pendientes'}
                </option>
              ))}
            </select>
          </CampoFormulario>
        </div>

        <textarea
          placeholder="Observaciones"
          value={form.observaciones}
          onChange={(e) => handleChange('observaciones', e.target.value)}
          className={`${inputStyle} mt-5 min-h-[105px]`}
        />

        <FormActions
          loading={false}
          editing={editando}
          createLabel="Crear tramite"
          updateLabel="Actualizar tramite"
          onSubmit={guardarAduana}
          onCancel={limpiarFormulario}
        />
      </SectionCard>

      <SearchBox
        value={busqueda}
        onChange={setBusqueda}
        placeholder="Buscar por orden, declaracion, regimen, partida, agente o estado..."
      />

      <ExportButtons data={filtrados} fileName="aduanas" />

      <DataTableCard
        columns={columns}
        data={filtrados}
        noData="No hay tramites aduaneros registrados"
        fixedHeaderScrollHeight="520px"
      />
    </PageLayout>
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

  return <StatusBadge text={estado || 'Sin estado'} color={color} />;
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

function formatearFechaInput(fecha) {
  if (!fecha) return '';

  return new Date(fecha).toISOString().slice(0, 10);
}

function formatearFechaTabla(fecha) {
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
  rounded-xl
  p-4
  outline-none
  focus:ring-2
  focus:ring-blue-500
`;

export default Aduanas;
