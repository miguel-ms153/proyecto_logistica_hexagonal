function predecirRiesgo(
  tracking
) {

  const estado =
    tracking.estado;

  const ubicacion =
    tracking.ubicacion;

  // IA SIMPLE

  if (
    estado === 'Retrasado'
  ) {

    return {

      riesgo: 'ALTO',

      probabilidad:
        '90%',

      color: 'red'

    };

  }

  if (
    ubicacion === 'Zona Rural'
  ) {

    return {

      riesgo: 'MEDIO',

      probabilidad:
        '60%',

      color: 'orange'

    };

  }

  return {

    riesgo: 'BAJO',

    probabilidad:
      '15%',

    color: 'green'

  };

}

module.exports =
predecirRiesgo;