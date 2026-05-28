import { useEffect, useMemo, useState } from 'react';

import DataTable from 'react-data-table-component';

import Sidebar from '../components/Sidebar';

import API from '../services/api';

import { exportarExcel } from '../utils/exportExcel';
import { exportarPDF } from '../utils/exportPDF';

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
        const res =
          await API.put(`/documentos/${idEditando}`, payload);

        idDocumento =
          res.data?.id_documento || idEditando;
      } else {
        const res =
          await API.post('/documentos', payload);

        idDocumento =
          res.data?.id_documento;
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
      width: '80px'
    },
    {
      name: 'Documento',
      selector: (row) => row.nombre,
      sortable: true,
      grow: 2
    },
    {
      name: 'Tipo',
      selector: (row) => row.tipo,
      sortable: true,
      grow: 2
    },
    {
      name: 'Orden',
      selector: (row) => row.id_orden ? `#${row.id_orden}` : 'N/A'
    },
    {
      name: 'Aduana',
      selector: (row) => row.id_aduana ? `#${row.id_aduana}` : 'N/A'
    },
    {
      name: 'Estado',
      cell: (row) => (
        <EstadoBadge
          estado={estaVencido(row) ? 'Vencido' : row.estado}
        />
      )
    },
    {
      name: 'Vencimiento',
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold"
          >
            Ver archivo
          </a>
        ) : (
          <span className="text-gray-500 font-semibold">
            Sin archivo
          </span>
        )
      ),
      grow: 2
    },
    {
      name: 'Acciones',
      cell: (row) => (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => editarDocumento(row)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-3 rounded-xl font-bold min-w-[95px]"
          >
            Editar
          </button>

          <button
            type="button"
            onClick={() => eliminarDocumento(row.id_documento)}
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
              Gestion Documental
            </h1>

            <p className="text-gray-500 mt-2">
              Control de documentos de comercio exterior, aduana y soporte logistico
            </p>
          </div>

          <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-semibold shadow-lg w-fit">
            Total: {documentos.length}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KPI titulo="Pendientes" valor={pendientes} color="bg-yellow-500" />
          <KPI titulo="Aprobados" valor={aprobados} color="bg-green-600" />
          <KPI titulo="Observados" valor={observados} color="bg-red-600" />
          <KPI titulo="Vencidos" valor={vencidos} color="bg-slate-800" />
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {editando ? 'Editar documento' : 'Nuevo documento'}
              </h2>

              <p className="text-gray-500 mt-1">
                Registra documentos requeridos para ordenes y procesos aduaneros
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

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              type="button"
              onClick={guardarDocumento}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold"
            >
              {editando ? 'Actualizar documento' : 'Crear documento'}
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
            placeholder="Buscar por documento, tipo, estado, orden o aduana..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={inputStyle}
          />
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <button
            type="button"
            onClick={() => exportarExcel(documentos, 'documentos')}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-bold"
          >
            Exportar Excel
          </button>

          <button
            type="button"
            onClick={() => exportarPDF(documentos, 'documentos')}
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
    <span className={`${color} text-white px-4 py-2 rounded-full text-sm font-bold w-fit`}>
      {estado || 'Sin estado'}
    </span>
  );
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

export default Documentos;
