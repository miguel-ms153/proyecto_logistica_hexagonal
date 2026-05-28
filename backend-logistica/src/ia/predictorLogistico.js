function predecirRiesgo(
  tracking
) {

  const estado =
    tracking.estado;

  const ubicacion =
    tracking.ubicacion;

  if (
    estado === 'Retrasado'
  ) {

    return {

      riesgo: 'ALTO',

      probabilidad:
        '90%',

      color: 'red',

      score: 90,

      recomendacion:
        'Escalar con operador logistico y actualizar tracking'

    };

  }

  if (
    ubicacion === 'Zona Rural'
  ) {

    return {

      riesgo: 'MEDIO',

      probabilidad:
        '60%',

      color: 'orange',

      score: 60,

      recomendacion:
        'Monitorear ruta y solicitar actualizacion de ubicacion'

    };

  }

  return {

    riesgo: 'BAJO',

    probabilidad:
      '15%',

    color: 'green',

    score: 15,

    recomendacion:
      'Continuar seguimiento normal'

  };

}

module.exports =
predecirRiesgo;
