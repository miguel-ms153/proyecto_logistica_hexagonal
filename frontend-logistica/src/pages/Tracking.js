import { useEffect, useMemo, useState } from 'react';

import Sidebar from '../components/Sidebar';

import API from '../services/api';

import socket from '../services/socket';

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline
} from 'react-leaflet';

import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',

  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',

  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const coordenadasCiudades = {
  Guayaquil: [-2.1709, -79.9224],
  Quito: [-0.1807, -78.4678],
  Manta: [-0.9677, -80.7089],
  Cuenca: [-2.9006, -79.0045],
  Latacunga: [-0.9333, -78.6167],
  Shanghai: [31.2304, 121.4737],
  Japon: [35.6762, 139.6503],
  Japón: [35.6762, 139.6503],
  Miami: [25.7617, -80.1918],
  Panama: [8.9824, -79.5199],
  Panamá: [8.9824, -79.5199],
  Madrid: [40.4168, -3.7038],
  China: [35.8617, 104.1954],
  Ecuador: [-1.8312, -78.1834]
};

function Tracking() {
  const [tracking, setTracking] = useState([]);

  const obtenerTracking = async () => {
    try {
      const res = await API.get('/tracking');

      setTracking(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    obtenerTracking();

    socket.on('nuevo-tracking', (nuevo) => {
      setTracking((prev) => [nuevo, ...prev]);
    });

    return () => {
      socket.off('nuevo-tracking');
    };
  }, []);

  const trackingAnalizado = useMemo(() => {
    return tracking.map((item) => analizarTracking(item));
  }, [tracking]);

  const centroMapa = obtenerCentroMapa(trackingAnalizado);

  const enTransito = trackingAnalizado.filter(
    (t) => t.estadoNormalizado === 'En tránsito'
  ).length;

  const riesgoAlto = trackingAnalizado.filter(
    (t) => t.ia.riesgo === 'ALTO'
  ).length;

  const promedioEta =
    trackingAnalizado.length > 0
      ? Math.ceil(
          trackingAnalizado.reduce(
            (acc, t) => acc + t.diasRestantes,
            0
          ) / trackingAnalizado.length
        )
      : 0;

  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8 overflow-x-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Tracking GPS Live
            </h1>

            <p className="text-gray-500 mt-2">
              Rutas, ETA y análisis predictivo por tipo de transporte
            </p>
          </div>

          <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-semibold shadow-lg whitespace-nowrap">
            Total: {tracking.length}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <KPI titulo="En tránsito" valor={enTransito} color="bg-blue-600" />
          <KPI titulo="Riesgo alto" valor={riesgoAlto} color="bg-red-600" />
          <KPI titulo="Promedio ETA" valor={`${promedioEta} días`} color="bg-green-600" />
        </div>

        <div className="bg-white rounded-2xl shadow p-4 mb-8">
          <MapContainer
            center={centroMapa}
            zoom={3}
            style={{
              height: '520px',
              width: '100%',
              borderRadius: '16px'
            }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {trackingAnalizado.map((t, index) => (
              <div key={t._id || index}>
                {t.ruta.length >= 2 && (
                  <Polyline
                    positions={t.ruta}
                    pathOptions={{
                      color: obtenerColorRuta(t.tipoTransporte, t.ia.riesgo),
                      weight: 4,
                      opacity: 0.8,
                      dashArray:
                        t.tipoTransporte === 'Aéreo'
                          ? '8 10'
                          : t.tipoTransporte === 'Marítimo'
                            ? '2 8'
                            : null
                    }}
                  />
                )}

                {t.origenCoords && (
                  <Marker position={t.origenCoords}>
                    <Popup>
                      <strong>Origen:</strong> {t.origen}
                      <br />
                      <strong>Transporte:</strong> {t.tipoTransporte}
                    </Popup>
                  </Marker>
                )}

                {t.actualCoords && (
                  <Marker position={t.actualCoords}>
                    <Popup>
                      <strong>Estado:</strong> {t.estadoNormalizado}
                      <br />
                      <strong>Ubicación:</strong> {t.ubicacion}
                      <br />
                      <strong>Transporte:</strong> {t.tipoTransporte}
                      <br />
                      <strong>Riesgo IA:</strong> {t.ia.riesgo}
                      <br />
                      <strong>Entrega estimada:</strong> {t.fechaEstimada}
                    </Popup>
                  </Marker>
                )}

                {t.destinoCoords && (
                  <Marker position={t.destinoCoords}>
                    <Popup>
                      <strong>Destino:</strong> {t.destino}
                      <br />
                      <strong>ETA:</strong> {t.diasRestantes} días
                    </Popup>
                  </Marker>
                )}
              </div>
            ))}
          </MapContainer>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {trackingAnalizado.map((t, index) => (
            <div
              key={t._id || index}
              className="bg-white rounded-2xl shadow p-6"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Orden #{t.id_orden || 'N/A'}
                  </h2>

                  <p className="text-gray-500 mt-1">
                    {t.origen} hacia {t.destino}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <TransporteBadge tipo={t.tipoTransporte} />
                  <EstadoBadge estado={t.estadoNormalizado} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <Info label="Ubicación actual" value={t.ubicacion} />
                <Info label="Tipo de transporte" value={t.tipoTransporte} />
                <Info label="Distancia restante" value={`${t.distanciaKm} km`} />
                <Info label="Días de tránsito" value={`${t.diasTransito} días`} />
                <Info label="ETA restante" value={`${t.diasRestantes} días`} />
                <Info label="Entrega estimada" value={t.fechaEstimada} />
              </div>

              <div className="bg-slate-900 text-white rounded-2xl p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold">
                      IA Predictiva
                    </h3>

                    <p className="text-slate-300 mt-1">
                      Análisis según ruta, estado y transporte
                    </p>
                  </div>

                  <RiesgoBadge riesgo={t.ia.riesgo} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InfoDark label="Probabilidad" value={t.ia.probabilidad} />
                  <InfoDark label="Impacto" value={t.ia.impacto} />
                  <InfoDark label="Acción sugerida" value={t.ia.recomendacion} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {trackingAnalizado.length === 0 && (
          <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
            No hay registros de tracking disponibles.
          </div>
        )}
      </div>
    </div>
  );
}

function analizarTracking(t) {
  const origen = t.origen || 'Shanghai';
  const destino = t.destino || 'Guayaquil';
  const ubicacion = t.ubicacion || destino;
  const tipoTransporte = t.tipo_transporte || 'Marítimo';

  const origenCoords = obtenerCoordenadasPorLugar(origen);
  const destinoCoords = obtenerCoordenadasPorLugar(destino);
  const actualCoords = obtenerCoordenadasActuales(t, ubicacion);

  const ruta = [origenCoords, actualCoords, destinoCoords].filter(Boolean);

  const distanciaKm =
    actualCoords && destinoCoords
      ? Math.round(calcularDistanciaKm(actualCoords, destinoCoords))
      : 0;

  const estadoNormalizado = normalizarEstado(t.estado);

  const velocidadDiaria = obtenerVelocidadDiaria(
    estadoNormalizado,
    tipoTransporte
  );

  const diasRestantes =
    distanciaKm > 0
      ? Math.max(1, Math.ceil(distanciaKm / velocidadDiaria))
      : estadoNormalizado === 'Entregado'
        ? 0
        : 2;

  const diasTransito = estimarDiasTransito(t.fecha);

  const ia = calcularIA({
    estado: estadoNormalizado,
    distanciaKm,
    diasRestantes,
    tieneCoordenadas: Boolean(actualCoords),
    tipoTransporte
  });

  return {
    ...t,
    origen,
    destino,
    ubicacion,
    tipoTransporte,
    origenCoords,
    destinoCoords,
    actualCoords,
    ruta,
    distanciaKm,
    diasRestantes,
    diasTransito,
    fechaEstimada: calcularFechaEstimada(diasRestantes),
    estadoNormalizado,
    ia
  };
}

function obtenerCoordenadasActuales(t, ubicacion) {
  if (t.latitud && t.longitud) {
    return [Number(t.latitud), Number(t.longitud)];
  }

  return obtenerCoordenadasPorLugar(ubicacion);
}

function obtenerCoordenadasPorLugar(lugar) {
  return coordenadasCiudades[lugar] || null;
}

function normalizarEstado(estado) {
  if (!estado) return 'En tránsito';

  if (estado === 'En puerto') return 'En tránsito';
  if (estado === 'En camino') return 'En tránsito';

  return estado;
}

function obtenerVelocidadDiaria(estado, tipoTransporte) {
  if (estado === 'Entregado') return 99999;

  if (tipoTransporte === 'Aéreo') {
    if (estado === 'Retrasado') return 900;
    return 2500;
  }

  if (tipoTransporte === 'Marítimo') {
    if (estado === 'Retrasado') return 250;
    if (estado === 'En puerto') return 180;
    return 650;
  }

  if (tipoTransporte === 'Terrestre') {
    if (estado === 'Retrasado') return 250;
    return 500;
  }

  return 650;
}

function calcularIA({
  estado,
  distanciaKm,
  diasRestantes,
  tieneCoordenadas,
  tipoTransporte
}) {
  if (!tieneCoordenadas) {
    return {
      riesgo: 'MEDIO',
      probabilidad: '45%',
      impacto: 'Seguimiento limitado',
      recomendacion: 'Actualizar coordenadas GPS'
    };
  }

  if (estado === 'Retrasado') {
    return {
      riesgo: 'ALTO',
      probabilidad: '88%',
      impacto: 'Entrega fuera de ventana',
      recomendacion: 'Escalar con operador logístico'
    };
  }

  if (tipoTransporte === 'Marítimo' && diasRestantes > 20) {
    return {
      riesgo: 'ALTO',
      probabilidad: '82%',
      impacto: 'Tránsito marítimo extendido',
      recomendacion: 'Contactar naviera y validar transbordos'
    };
  }

  if (tipoTransporte === 'Marítimo' && estado === 'En tránsito') {
    return {
      riesgo: 'MEDIO',
      probabilidad: '55%',
      impacto: 'Posible demora portuaria',
      recomendacion: 'Revisar liberación aduanera y puerto de llegada'
    };
  }

  if (tipoTransporte === 'Aéreo' && diasRestantes > 4) {
    return {
      riesgo: 'MEDIO',
      probabilidad: '50%',
      impacto: 'Demora inusual para transporte aéreo',
      recomendacion: 'Verificar conexión de vuelo y disponibilidad'
    };
  }

  if (tipoTransporte === 'Terrestre' && diasRestantes > 5) {
    return {
      riesgo: 'MEDIO',
      probabilidad: '46%',
      impacto: 'Posible demora en ruta terrestre',
      recomendacion: 'Monitorear ruta y puntos de control'
    };
  }

  if (distanciaKm > 3000 || diasRestantes > 8) {
    return {
      riesgo: 'MEDIO',
      probabilidad: '48%',
      impacto: 'Variación posible en entrega',
      recomendacion: 'Monitorear cada 24 horas'
    };
  }

  return {
    riesgo: 'BAJO',
    probabilidad: '15%',
    impacto: 'Operación estable',
    recomendacion: 'Continuar seguimiento normal'
  };
}

function calcularDistanciaKm([lat1, lon1], [lat2, lon2]) {
  const radioTierra = 6371;

  const dLat = gradosARadianes(lat2 - lat1);
  const dLon = gradosARadianes(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(gradosARadianes(lat1)) *
      Math.cos(gradosARadianes(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return radioTierra * c;
}

function gradosARadianes(grados) {
  return grados * (Math.PI / 180);
}

function calcularFechaEstimada(dias) {
  const fecha = new Date();

  fecha.setDate(fecha.getDate() + dias);

  return fecha.toLocaleDateString('es-EC', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function estimarDiasTransito(fecha) {
  if (!fecha) return 0;

  const inicio = new Date(fecha);
  const hoy = new Date();

  return Math.max(
    0,
    Math.ceil((hoy - inicio) / (1000 * 60 * 60 * 24))
  );
}

function obtenerCentroMapa(items) {
  const itemConCoordenadas = items.find((t) => t.actualCoords);

  return itemConCoordenadas?.actualCoords || [-2.1709, -79.9224];
}

function obtenerColorRuta(tipoTransporte, riesgo) {
  if (riesgo === 'ALTO') return '#dc2626';
  if (tipoTransporte === 'Aéreo') return '#7c3aed';
  if (tipoTransporte === 'Marítimo') return '#2563eb';
  if (tipoTransporte === 'Terrestre') return '#16a34a';

  return '#2563eb';
}

function KPI({ titulo, valor, color }) {
  return (
    <div className={`${color} text-white p-6 rounded-2xl shadow-lg`}>
      <p className="text-lg font-medium">{titulo}</p>

      <h2 className="text-4xl font-bold mt-3">{valor}</h2>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <p className="text-sm text-gray-500">{label}</p>

      <p className="text-lg font-bold text-slate-800 mt-1">{value}</p>
    </div>
  );
}

function InfoDark({ label, value }) {
  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <p className="text-sm text-slate-400">{label}</p>

      <p className="text-base font-bold mt-1">{value}</p>
    </div>
  );
}

function EstadoBadge({ estado }) {
  let color = 'bg-blue-600';

  if (estado === 'Entregado') color = 'bg-green-600';
  else if (estado === 'Retrasado') color = 'bg-red-600';

  return (
    <span className={`${color} text-white px-4 py-2 rounded-full text-sm font-semibold w-fit`}>
      {estado}
    </span>
  );
}

function TransporteBadge({ tipo }) {
  let color = 'bg-blue-600';

  if (tipo === 'Aéreo') color = 'bg-purple-600';
  else if (tipo === 'Terrestre') color = 'bg-green-600';
  else if (tipo === 'Marítimo') color = 'bg-blue-600';

  return (
    <span className={`${color} text-white px-4 py-2 rounded-full text-sm font-semibold w-fit`}>
      {tipo}
    </span>
  );
}

function RiesgoBadge({ riesgo }) {
  let color = 'bg-green-600';

  if (riesgo === 'ALTO') color = 'bg-red-600';
  else if (riesgo === 'MEDIO') color = 'bg-yellow-500';

  return (
    <span className={`${color} text-white px-4 py-2 rounded-full text-sm font-bold w-fit`}>
      Riesgo {riesgo}
    </span>
  );
}

export default Tracking;