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

import { estaVencido } from '../utils/riskScoring';

const tipoOptions = [
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

const estadoOptions = [
  'Pendiente',
  'Recibido',
  'Aprobado',
  'Observado',
  'Vencido'
];

const formInicial = {
  nombre: '',
  tipo: 'Factura comercial',
  estado: 'Pendiente',
  fecha_emision: '',
  fecha_vencimiento: '',
  observaciones: '',
  id_orden: '',
  id_aduana: ''
};

function Documentos() {
  const [documentos, setDocumentos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [aduanas, setAduanas] = useState([]);
  const [form, setForm] = useState(formInicial);
  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [error, setError] = useState('');

  const obtenerDatos = async () => {
    try {
      const [documentosRes, ordenesRes, aduanasRes] = await Promise.all([
        API.get('/documentos'),
        API.get('/ordenes'),
        API.get('/aduanas')
      ]);

      setDocumentos(documentosRes.data);
      setOrdenes(ordenesRes.data);
      setAduanas(aduanasRes.data);
    } catch (error) {
      console.log(error);
      setError('No se pudo cargar la gestion documental');
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  const filtrados = useMemo(() => {
    const texto = busqueda.toLowerCase();

    return documentos.filter((documento) =>
      [
        documento.id_documento,
        documento.nombre,
        documento.tipo,
        documento.estado,
        documento.id_orden,
        documento.id_aduana
      ]
        .join(' ')
        .toLowerCase()
        .includes(texto)
    );
  }, [documentos, busqueda]);

  const pendientes = documentos.filter(
    (documento) => documento.estado === 'Pendiente'
  ).length;

  const aprobados = documentos.filter(
    (documento) => documento.estado === 'Aprobado'
  ).length;

  const observados = documentos.filter(
    (documento) => documento.estado === 'Observado'
  ).length;

  const vencidos = documentos.filter((documento) =>
    estaVencido(documento)
  ).length;

  const datosExportacion = filtrados.map((documento) => ({
    ID: documento.id_documento,
    Documento: documento.nombre || 'Sin nombre',
    Tipo: documento.tipo || 'N/A',
    Estado: estaVencido(documento) ? 'Vencido' : documento.estado || 'Sin estado',
    Orden: documento.id_orden ? `#${documento.id_orden}` : 'N/A',
    Aduana: documento.id_aduana ? `#${documento.id_aduana}` : 'N/A',
    Emision: formatearFechaTabla(documento.fecha_emision),
    Vence: formatearFechaTabla(documento.fecha_vencimiento),
    Archivo: documento.archivo_ruta ? 'Adjunto' : 'Sin archivo',
    Observaciones: resumirTexto(documento.observaciones)
  }));

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
    setArchivo(null);
    setError('');
  };

  const subirArchivo = async (idDocumento) => {
    if (!archivo) return;

    const formData = new FormData();
    formData.append('archivo', archivo);

    await API.post(
      `/documentos/${idDocumento}/archivo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
  };

  const guardarDocumento = async () => {
    if (!form.nombre.trim()) {
      setError('Ingresa el nombre del documento');
      return;
    }

    if (!form.id_orden && !form.id_aduana) {
      setError('Asocia el documento a una orden o tramite aduanero');
      return;
    }

    try {
      const payload = {
        ...form,
        id_orden: form.id_orden ? Number(form.id_orden) : null,
        id_aduana: form.id_aduana ? Number(form.id_aduana) : null,
        fecha_emision: form.fecha_emision || null,
        fecha_vencimiento: form.fecha_vencimiento || null
      };

      let idDocumento = idEditando;

      if (editando) {
        const res = await API.put(`/documentos/${idEditando}`, payload);
        idDocumento = res.data?.id_documento || idEditando;
      } else {
        const res = await API.post('/documentos', payload);
        idDocumento = res.data?.id_documento;
      }

      await subirArchivo(idDocumento);
      limpiarFormulario();
      obtenerDatos();
    } catch (error) {
      console.log(error);

      setError(
        error.response?.data?.error ||
        'No se pudo guardar el documento'
      );
    }
  };

  const editarDocumento = (documento) => {
    setForm({
      nombre: documento.nombre || '',
      tipo: documento.tipo || 'Factura comercial',
      estado: documento.estado || 'Pendiente',
      fecha_emision: formatearFechaInput(documento.fecha_emision),
      fecha_vencimiento: formatearFechaInput(documento.fecha_vencimiento),
      observaciones: documento.observaciones || '',
      id_orden: documento.id_orden || '',
      id_aduana: documento.id_aduana || ''
    });

    setEditando(true);
    setIdEditando(documento.id_documento);
    setArchivo(null);
    setError('');
  };

  const eliminarDocumento = async (id) => {
    const confirmar = window.confirm(
      'Seguro que deseas eliminar este documento?'
    );

    if (!confirmar) return;

    try {
      await API.delete(`/documentos/${id}`);
      obtenerDatos();

      if (idEditando === id) {
        limpiarFormulario();
      }
    } catch (error) {
      console.log(error);
      setError('No se pudo eliminar el documento');
    }
  };

  const columns = [
    {
      name: 'ID',
      selector: (row) => row.id_documento,
      sortable: true,
      width: '70px'
    },
    {
      name: 'Documento',
      selector: (row) => row.nombre,
      sortable: true,
      minWidth: '220px',
      grow: 2,
      cell: (row) => (
        <div className="min-w-0">
          <p className="font-bold text-slate-800 truncate" title={row.nombre}>
            {row.nombre || 'Sin nombre'}
          </p>

          <p className="text-xs text-slate-500">
            {row.tipo || 'Sin tipo'}
          </p>
        </div>
      )
    },
    {
      name: 'Orden',
      width: '90px',
      selector: (row) => (row.id_orden ? `#${row.id_orden}` : 'N/A')
    },
    {
      name: 'Aduana',
      width: '95px',
      selector: (row) => (row.id_aduana ? `#${row.id_aduana}` : 'N/A')
    },
    {
      name: 'Estado',
      width: '125px',
      cell: (row) => (
        <EstadoBadge
          estado={estaVencido(row) ? 'Vencido' : row.estado}
        />
      )
    },
    {
      name: 'Vencimiento',
      width: '120px',
      selector: (row) => formatearFechaTabla(row.fecha_vencimiento),
      sortable: true
    },
    {
      name: 'Archivo',
      cell: (row) => (
        row.archivo_ruta ? (
          <a
            href={`http://localhost:3001${row.archivo_ruta}`}
            target="_blank"
            rel="noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-bold text-xs whitespace-nowrap"
          >
            Ver archivo
          </a>
        ) : (
          <span className="text-gray-500 font-semibold text-xs">
            Sin archivo
          </span>
        )
      ),
      width: '115px'
    },
    {
      name: 'Acciones',
      cell: (row) => (
        <div className="flex gap-2 w-full justify-end">
          <button
            type="button"
            onClick={() => editarDocumento(row)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg font-bold min-w-[72px] text-xs"
          >
            Editar
          </button>

          <button
            type="button"
            onClick={() => eliminarDocumento(row.id_documento)}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-bold min-w-[80px] text-xs"
          >
            Eliminar
          </button>
        </div>
      ),
      width: '170px'
    }
  ];

  const tableStyles = {
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
        title="Gestion Documental"
        subtitle="Control de documentos de comercio exterior, aduana y soporte logistico"
        badge={`Total: ${documentos.length}`}
      />

      <KpiGrid
        items={[
          { title: 'Pendientes', value: pendientes, color: 'bg-yellow-500' },
          { title: 'Aprobados', value: aprobados, color: 'bg-green-600' },
          { title: 'Observados', value: observados, color: 'bg-red-600' },
          { title: 'Vencidos', value: vencidos, color: 'bg-slate-800' }
        ]}
      />

      <SectionCard
        title={editando ? 'Editar documento' : 'Nuevo documento'}
        subtitle="Registra documentos requeridos para ordenes y procesos aduaneros"
        className="!mb-5"
      >
        {editando && (
          <div className="mb-5">
            <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-xl font-bold w-fit">
              Modo edicion
            </span>
          </div>
        )}

        <AlertMessage message={error} />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <CampoFormulario label="Nombre del documento">
            <input
              type="text"
              placeholder="Ej: Factura proveedor Shanghai"
              value={form.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              className={inputStyle}
            />
          </CampoFormulario>

          <CampoFormulario label="Tipo">
            <select
              value={form.tipo}
              onChange={(e) => handleChange('tipo', e.target.value)}
              className={inputStyle}
            >
              {tipoOptions.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </CampoFormulario>

          <CampoFormulario label="Estado">
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
          </CampoFormulario>

          <CampoFormulario label="Orden relacionada">
            <select
              value={form.id_orden}
              onChange={(e) => handleChange('id_orden', e.target.value)}
              className={inputStyle}
            >
              <option value="">Sin orden</option>

              {ordenes.map((orden) => (
                <option key={orden.id_orden} value={orden.id_orden}>
                  Orden #{orden.id_orden} - {orden.usuario?.nombre || 'Sin usuario'}
                </option>
              ))}
            </select>
          </CampoFormulario>

          <CampoFormulario label="Tramite aduanero">
            <select
              value={form.id_aduana}
              onChange={(e) => handleChange('id_aduana', e.target.value)}
              className={inputStyle}
            >
              <option value="">Sin tramite aduanero</option>

              {aduanas.map((aduana) => (
                <option key={aduana.id_aduana} value={aduana.id_aduana}>
                  Aduana #{aduana.id_aduana} - Orden #{aduana.id_orden || 'N/A'}
                </option>
              ))}
            </select>
          </CampoFormulario>

          <CampoFormulario label="Fecha de emision">
            <input
              type="date"
              value={form.fecha_emision}
              onChange={(e) => handleChange('fecha_emision', e.target.value)}
              className={inputStyle}
            />
          </CampoFormulario>

          <CampoFormulario label="Fecha de vencimiento">
            <input
              type="date"
              value={form.fecha_vencimiento}
              onChange={(e) => handleChange('fecha_vencimiento', e.target.value)}
              className={inputStyle}
            />
          </CampoFormulario>

          <CampoFormulario label="Archivo adjunto">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
              className={inputStyle}
            />
          </CampoFormulario>
        </div>

        {archivo && (
          <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-xl font-bold mt-5">
            Archivo seleccionado: {archivo.name}
          </div>
        )}

        <textarea
          placeholder="Observaciones"
          value={form.observaciones}
          onChange={(e) => handleChange('observaciones', e.target.value)}
          className={`${inputStyle} mt-5 min-h-[105px]`}
        />

        <FormActions
          loading={false}
          editing={editando}
          createLabel="Crear documento"
          updateLabel="Actualizar documento"
          onSubmit={guardarDocumento}
          onCancel={limpiarFormulario}
        />
      </SectionCard>

      <SearchBox
        value={busqueda}
        onChange={setBusqueda}
        placeholder="Buscar por documento, tipo, estado, orden o aduana..."
      />

      <ExportButtons data={datosExportacion} fileName="documentos" />

      <DataTableCard
        columns={columns}
        data={filtrados}
        noData="No hay documentos registrados"
        fixedHeaderScrollHeight="520px"
        selectableRows={false}
        dense
        customStyles={tableStyles}
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

function EstadoBadge({ estado }) {
  let color = 'bg-gray-600';

  if (estado === 'Pendiente') color = 'bg-yellow-500';
  else if (estado === 'Recibido') color = 'bg-blue-600';
  else if (estado === 'Aprobado') color = 'bg-green-600';
  else if (estado === 'Observado') color = 'bg-red-600';
  else if (estado === 'Vencido') color = 'bg-slate-800';

  return (
    <StatusBadge
      text={estado || 'Sin estado'}
      color={color}
      minWidth="min-w-[105px]"
    />
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

function resumirTexto(texto) {
  if (!texto) return 'N/A';

  return texto.length > 55
    ? `${texto.slice(0, 55)}...`
    : texto;
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

export default Documentos;
