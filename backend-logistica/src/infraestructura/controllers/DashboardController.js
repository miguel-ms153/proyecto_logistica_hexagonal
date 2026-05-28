const { Op } = require('sequelize');

const Usuario =
require('../models/UsuarioModel');

const Producto =
require('../models/ProductoModel');

const Orden =
require('../models/OrdenModel');

const Embarque =
require('../models/EmbarqueModel');

const Pago =
require('../models/PagoModel');

const Aduana =
require('../models/AduanaModel');

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

      const aduanas =
        await Aduana.count();

      const productosStockBajo =
        await Producto.count({
          where: {
            stock: {
              [Op.lt]: 10
            }
          }
        });

      const ordenesCompletas =
        await Orden.findAll({
          include: [
            {
              model: Pago,
              as: 'pagos',
              required: false
            },
            {
              model: Embarque,
              as: 'embarques',
              required: false
            }
          ]
        });

      const ordenesSinPago =
        ordenesCompletas.filter((orden) =>
          !orden.pagos ||
          orden.pagos.length === 0
        ).length;

      const ordenesSinEmbarque =
        ordenesCompletas.filter((orden) =>
          !orden.embarques ||
          orden.embarques.length === 0
        ).length;

      const embarquesRetrasados =
        await Embarque.count({
          where: {
            estado: 'Retrasado'
          }
        });

      const aduanasPendientes =
        await Aduana.count({
          where: {
            estado: 'Pendiente'
          }
        });

      const aduanasObservadas =
        await Aduana.count({
          where: {
            estado: 'Observado'
          }
        });

      const aduanasConDocumentosPendientes =
        await Aduana.count({
          where: {
            documentos_pendientes: {
              [Op.ne]: ''
            }
          }
        });

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

      const alertasDetalle = {

        stockBajo:
          productosStockBajo,

        ordenesSinPago,

        ordenesSinEmbarque,

        embarquesRetrasados,

        aduanasPendientes,

        aduanasObservadas,

        aduanasConDocumentosPendientes

      };

      const totalAlertas =
        productosStockBajo +
        ordenesSinPago +
        ordenesSinEmbarque +
        embarquesRetrasados +
        aduanasPendientes +
        aduanasObservadas +
        aduanasConDocumentosPendientes +
        riesgoAlto;

      const alertasTexto =
        totalAlertas > 0
          ? `${totalAlertas} alertas requieren revision`
          : 'Sistema estable';

      res.json({

        usuarios,
        productos,
        ordenes,
        embarques,
        aduanas,

        ia: {

          alto:
            riesgoAlto,

          medio:
            riesgoMedio,

          bajo:
            riesgoBajo

        },

        alertas:
          alertasTexto,

        alertasDetalle

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
