const TrackingRepositoryMongo =
require('../repositories/TrackingRepositoryMongo');

const CrearTracking =
require('../../aplicacion/tracking/CrearTracking');

const ObtenerTracking =
require('../../aplicacion/tracking/ObtenerTracking');

const predecirRiesgo =
require('../../ia/predictorLogistico');

const repository =
new TrackingRepositoryMongo();

const crearTrackingUseCase =
new CrearTracking(repository);

const obtenerTrackingUseCase =
new ObtenerTracking(repository);

class TrackingController {

  async crear(req, res) {

    try {

      // GUARDAR TRACKING

      const result =
      await crearTrackingUseCase.ejecutar(
        req.body
      );

      // IA PREDICTIVA

      const prediccion =
      predecirRiesgo(result);

      // SOCKET.IO

      const io =
      req.app.get('io');

      io.emit(
        'nuevo-tracking',
        {
          ...result.toObject(),
          ia: prediccion
        }
      );

      // RESPUESTA

      res.json({

        tracking: result,

        ia: prediccion

      });

    } catch (error) {

      res.status(500).json({
        error: error.message
      });

    }

  }

  async obtener(req, res) {

    try {

      const result =
      await obtenerTrackingUseCase.ejecutar();

      const trackingConIA =
      result.map((t) => ({

        ...t.toObject(),

        ia:
        predecirRiesgo(t)

      }));

      res.json(
        trackingConIA
      );

    } catch (error) {

      res.status(500).json({
        error: error.message
      });

    }

  }

}

module.exports =
new TrackingController();