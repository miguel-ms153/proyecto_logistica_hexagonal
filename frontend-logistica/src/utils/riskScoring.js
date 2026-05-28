export function calcularScoreRiesgo({
  orden,
  pagos = [],
  embarques = [],
  aduanas = [],
  documentos = [],
  tracking = []
}) {
  const factores = [];

  agregarFactor(
    factores,
    !pagos.length,
    15,
    'Orden sin pago registrado'
  );

  agregarFactor(
    factores,
    !embarques.length,
    20,
    'Orden sin embarque asignado'
  );

  agregarFactor(
    factores,
    embarques.some((embarque) => embarque.estado === 'Retrasado'),
    30,
    'Embarque retrasado'
  );

  agregarFactor(
    factores,
    !tracking.length,
    10,
    'Tracking sin registros'
  );

  agregarFactor(
    factores,
    tracking.some((item) => !item.latitud || !item.longitud),
    10,
    'Tracking sin coordenadas completas'
  );

  agregarFactor(
    factores,
    !aduanas.length,
    15,
    'Tramite aduanero no registrado'
  );

  agregarFactor(
    factores,
    aduanas.some((aduana) => aduana.estado === 'Observado'),
    25,
    'Tramite aduanero observado'
  );

  agregarFactor(
    factores,
    aduanas.some((aduana) => aduana.documentos_pendientes?.trim()),
    15,
    'Documentos aduaneros pendientes'
  );

  agregarFactor(
    factores,
    !documentos.length,
    15,
    'Sin documentos asociados'
  );

  agregarFactor(
    factores,
    documentos.some((documento) => documento.estado === 'Observado'),
    20,
    'Documento observado'
  );

  agregarFactor(
    factores,
    documentos.some((documento) => estaVencido(documento)),
    30,
    'Documento vencido'
  );

  agregarFactor(
    factores,
    documentos.some((documento) => !documento.archivo_ruta),
    10,
    'Documento sin archivo adjunto'
  );

  agregarFactor(
    factores,
    embarques.some((embarque) =>
      esInternacional(embarque.origen, embarque.destino)
    ),
    10,
    'Ruta internacional'
  );

  agregarFactor(
    factores,
    orden?.estado === 'Pendiente',
    10,
    'Orden pendiente'
  );

  const score =
    Math.min(
      100,
      factores.reduce(
        (acc, factor) => acc + factor.puntos,
        0
      )
    );

  const nivel =
    score >= 66
      ? 'ALTO'
      : score >= 31
        ? 'MEDIO'
        : 'BAJO';

  return {
    score,
    nivel,
    factores,
    recomendacion: obtenerRecomendacion(nivel, factores)
  };
}

function agregarFactor(factores, condicion, puntos, descripcion) {
  if (!condicion) return;

  factores.push({
    puntos,
    descripcion
  });
}

function obtenerRecomendacion(nivel, factores) {
  const textos =
    factores.map((factor) => factor.descripcion).join(', ');

  if (nivel === 'ALTO') {
    return `Escalar la operacion y corregir factores criticos: ${textos}.`;
  }

  if (nivel === 'MEDIO') {
    return `Monitorear la operacion y atender pendientes: ${textos}.`;
  }

  return 'Operacion estable. Continuar seguimiento normal.';
}

function esInternacional(origen, destino) {
  if (!origen || !destino) return false;

  const ecuador = [
    'guayaquil',
    'quito',
    'cuenca',
    'manta',
    'latacunga'
  ];

  const origenLocal =
    ecuador.includes(String(origen).toLowerCase());

  const destinoLocal =
    ecuador.includes(String(destino).toLowerCase());

  return origenLocal !== destinoLocal;
}

export function estaVencido(documento) {
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
