const express = require('express');

const router = express.Router();

const controller =
require('../controllers/DetalleOrdenController');

const verificarToken =
require('../../middlewares/authMiddleware');

const autorizarRoles =
require('../../middlewares/autorizarRoles');

router.use(
  verificarToken,
  autorizarRoles('ADMIN', 'OPERADOR', 'CLIENTE')
);

router.post(
  '/',
  controller.crear
);

router.get(
  '/',
  controller.obtener
);

router.delete(
  '/:id',
  controller.eliminar
);

module.exports = router;
