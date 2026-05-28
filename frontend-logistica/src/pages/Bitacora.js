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

function Bitacora() {
  const [registros, setRegistros] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modulo, setModulo] = useState('');
  const [accion, setAccion] = useState('');
  const [error, setError] = useState('');

  const obtenerBitacora = async () => {
    try {
      const res = await API.get('/bitacora');

      setRegistros(res.data);
    } catch (error) {
      console.log(error);
      setError('No se pudo cargar la bitacora del sistema');
    }
  };

  useEffect(() => {
    obtenerBitacora();
  }, []);

  const modulos = useMemo(() => {
    return [...new Set(registros.map((item) => item.modulo).filter(Boolean))];
  }, [registros]);

  const acciones = useMemo(() => {
    return [...new Set(registros.map((item) => item.accion).filter(Boolean))];
  }, [registros]);

  const filtrados = useMemo(() => {
    const texto = busqueda.toLowerCase();

    return registros.filter((item) => {
      const coincideTexto = [
        item.usuario,
        item.email,
        item.rol,
        item.accion,
        item.modulo,
        item.detalle,
        item.ruta
      ]
        .join(' ')
        .toLowerCase()
        .includes(texto);

      const coincideModulo = modulo ? item.modulo === modulo : true;
      const coincideAccion = accion ? item.accion === accion : true;

      return coincideTexto && coincideModulo && coincideAccion;
    });
  }, [registros, busqueda, modulo, accion]);

  const creaciones = registros.filter((item) => item.accion === 'CREAR').length;
  const ediciones = registros.filter((item) => item.accion === 'EDITAR').length;
  const eliminaciones = registros.filter((item) => item.accion === 'ELIMINAR').length;
  const operacionesCriticas = eliminaciones;

  const datosExportacion = filtrados.map((item) => ({
    ID: item.id_bitacora,
    Fecha: formatearFecha(item.fecha),
    Usuario: item.usuario || 'N/A',
    Email: item.email || 'N/A',
    Rol: item.rol || 'N/A',
    Accion: item.accion || 'N/A',
    Modulo: item.modulo || 'N/A',
    Detalle: item.detalle || 'N/A',
    Ruta: item.ruta || 'N/A',
    HTTP: item.estado_http || 'N/A'
  }));

  const columns = [
    {
      name: 'ID',
      selector: (row) => row.id_bitacora,
      sortable: true,
      width: '72px'
    },
    {
      name: 'Fecha',
      selector: (row) => formatearFecha(row.fecha),
      sortable: true,
      width: '145px',
      cell: (row) => (
        <span className="text-slate-700 text-sm">
          {formatearFecha(row.fecha)}
        </span>
      )
    },
    {
      name: 'Usuario',
      minWidth: '190px',
      grow: 2,
      cell: (row) => (
        <div className="min-w-0">
          <p className="font-bold text-slate-800">{row.usuario}</p>
          <p className="text-xs text-gray-500 truncate" title={row.email}>
            {row.rol || 'Sin rol'} | {row.email || 'Sin email'}
          </p>
        </div>
      )
    },
    {
      name: 'Accion',
      width: '120px',
      selector: (row) => row.accion,
      sortable: true,
      cell: (row) => <AccionBadge accion={row.accion} />
    },
    {
      name: 'Modulo',
      selector: (row) => row.modulo,
      sortable: true,
      width: '135px',
      cell: (row) => (
        <span className="font-bold text-slate-700">
          {row.modulo || 'N/A'}
        </span>
      )
    },
    {
      name: 'Detalle',
      selector: (row) => row.detalle,
      minWidth: '260px',
      grow: 3,
      cell: (row) => (
        <div className="min-w-0">
          <p className="text-slate-700 line-clamp-2" title={row.detalle}>
            {row.detalle || 'Sin detalle'}
          </p>

          {row.ruta && (
            <p className="text-xs text-slate-500 truncate mt-1" title={row.ruta}>
              {row.ruta}
            </p>
          )}
        </div>
      )
    },
    {
      name: 'HTTP',
      width: '105px',
      selector: (row) => row.estado_http || 'N/A',
      sortable: true,
      cell: (row) => <HttpBadge estado={row.estado_http} />
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
        title="Bitacora del Sistema"
        subtitle="Auditoria empresarial de acciones realizadas por usuarios en modulos operativos"
        badge={`Registros: ${registros.length}`}
        badgeColor={operacionesCriticas > 0 ? 'bg-red-600' : 'bg-blue-600'}
      />

      <AlertMessage message={error} />

      <KpiGrid
        items={[
          { title: 'Registros', value: registros.length, color: 'bg-blue-600' },
          { title: 'Creaciones', value: creaciones, color: 'bg-green-600' },
          { title: 'Ediciones', value: ediciones, color: 'bg-yellow-500' },
          { title: 'Eliminaciones', value: eliminaciones, color: 'bg-red-600' }
        ]}
      />

      <PanelAuditoria
        registros={registros.length}
        filtrados={filtrados.length}
        modulos={modulos.length}
        operacionesCriticas={operacionesCriticas}
      />

      <SectionCard
        title="Filtros de auditoria"
        subtitle="Busca por usuario, modulo, ruta o detalle y segmenta por accion"
        className="!mb-5"
      >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Buscar por usuario, modulo, accion o detalle..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={inputStyle}
            />

            <select
              value={modulo}
              onChange={(e) => setModulo(e.target.value)}
              className={inputStyle}
            >
              <option value="">Todos los modulos</option>

              {modulos.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={accion}
              onChange={(e) => setAccion(e.target.value)}
              className={inputStyle}
            >
              <option value="">Todas las acciones</option>

              {acciones.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
      </SectionCard>

      <ExportButtons data={datosExportacion} fileName="bitacora" />

      <DataTableCard
        columns={columns}
        data={filtrados}
        noData="No hay registros de bitacora para los filtros seleccionados"
        fixedHeaderScrollHeight="560px"
        selectableRows={false}
        dense
        customStyles={customStyles}
      />
    </PageLayout>
  );
}

function PanelAuditoria({
  registros,
  filtrados,
  modulos,
  operacionesCriticas
}) {
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 md:p-6 shadow-lg mb-5">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
        <div>
          <p className="text-blue-200 text-sm font-bold uppercase tracking-wide">
            Control de auditoria
          </p>

          <h2 className="text-3xl md:text-4xl font-bold mt-2">
            {filtrados} eventos visibles
          </h2>

          <p className="text-slate-300 mt-2">
            Trazabilidad de actividad por usuario, modulo, accion y respuesta HTTP.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full xl:w-auto">
          <AuditMetric title="Total logs" value={registros} />
          <AuditMetric title="Modulos" value={modulos} />
          <AuditMetric title="Criticos" value={operacionesCriticas} />
        </div>
      </div>
    </div>
  );
}

function AuditMetric({ title, value }) {
  return (
    <div className="bg-white/10 border border-white/10 rounded-xl p-4 min-w-[150px]">
      <p className="text-xs text-slate-300 font-bold uppercase">
        {title}
      </p>

      <p className="text-xl font-bold mt-1">
        {value}
      </p>
    </div>
  );
}

function AccionBadge({ accion }) {
  let color = 'bg-slate-600';

  if (accion === 'CREAR') color = 'bg-green-600';
  else if (accion === 'EDITAR') color = 'bg-yellow-500';
  else if (accion === 'ELIMINAR') color = 'bg-red-600';

  return (
    <StatusBadge
      text={accion || 'N/A'}
      color={color}
      minWidth="min-w-[92px]"
    />
  );
}

function HttpBadge({ estado }) {
  const codigo = Number(estado || 0);
  let color = 'bg-slate-600';

  if (codigo >= 200 && codigo < 300) color = 'bg-green-600';
  else if (codigo >= 400 && codigo < 500) color = 'bg-yellow-500';
  else if (codigo >= 500) color = 'bg-red-600';

  return (
    <StatusBadge
      text={estado || 'N/A'}
      color={color}
      minWidth="min-w-[75px]"
    />
  );
}

function formatearFecha(fecha) {
  if (!fecha) return 'N/A';

  return new Date(fecha).toLocaleString('es-EC', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
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

export default Bitacora;
