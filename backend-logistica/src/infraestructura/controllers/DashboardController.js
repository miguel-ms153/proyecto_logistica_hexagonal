const Usuario =
require('../models/UsuarioModel');

const Producto =
require('../models/ProductoModel');

const Orden =
require('../models/OrdenModel');

const Embarque =
require('../models/EmbarqueModel');

const Tracking =
require('../models/TrackingModel');

const predecirRiesgo =
require('../../ia/predictorLogistico');

class DashboardController {

  async resumen(req, res) {

  try {

    const usuarios =
      await Usuario.count();

    const productos =
      await Producto.count();

    const ordenes =
      await Orden.count();

    const embarques =
      await Embarque.count();

    const tracking =
      await Tracking.find();

    let riesgoAlto = 0;
    let riesgoMedio = 0;
    let riesgoBajo = 0;

    tracking.forEach((t) => {

      const ia =
        predecirRiesgo(t);

      if (
        ia.riesgo === 'ALTO'
      ) {

        riesgoAlto++;

      }

      else if (
        ia.riesgo === 'MEDIO'
      ) {

        riesgoMedio++;

      }

      else {

        riesgoBajo++;

      }

    });

    res.json({

      usuarios,
      productos,
      ordenes,
      embarques,

      ia: {

        alto:
          riesgoAlto,

        medio:
          riesgoMedio,

        bajo:
          riesgoBajo

      },

      alertas:

        riesgoAlto > 3
          ? 'ALERTA CRÍTICA'
          : 'Sistema estable'

    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
  }

}

module.exports =
new DashboardController();