const express = require('express');

const router = express.Router();

const controller =
require('../controllers/AduanaController');

const verificarToken =
require('../../middlewares/authMiddleware');

const autorizarRoles =
require('../../middlewares/autorizarRoles');

router.post(
  '/',
  verificarToken,
  autorizarRoles('ADMIN', 'OPERADOR'),
  controller.crear
);

router.get(
  '/',
  verificarToken,
  autorizarRoles('ADMIN', 'OPERADOR', 'CLIENTE'),
  controller.obtener
);

router.put(
  '/:id',
  verificarToken,
  autorizarRoles('ADMIN', 'OPERADOR'),
  controller.editar
);

router.delete(
  '/:id',
  verificarToken,
  autorizarRoles('ADMIN', 'OPERADOR'),
  controller.eliminar
);

module.exports = router;
