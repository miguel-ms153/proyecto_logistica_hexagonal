const express = require('express');

const router = express.Router();

const controller =
require('../controllers/ProductoController');

const verificarToken =
require('../../middlewares/authMiddleware');

const autorizarRoles =
require('../../middlewares/autorizarRoles');

// CREAR
router.post(
  '/',
  verificarToken,
  autorizarRoles('ADMIN', 'OPERADOR'),
  controller.crear
);

// OBTENER
router.get(
  '/',
  verificarToken,
  autorizarRoles('ADMIN', 'OPERADOR', 'CLIENTE'),
  controller.obtener
);

// EDITAR
router.put(
  '/:id',
  verificarToken,
  autorizarRoles('ADMIN', 'OPERADOR'),
  controller.editar
);

// ELIMINAR
router.delete(
  '/:id',
  verificarToken,
  autorizarRoles('ADMIN', 'OPERADOR'),
  controller.eliminar
);

module.exports = router;
