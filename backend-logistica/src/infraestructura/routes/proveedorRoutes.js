const express = require('express');

const router = express.Router();

const controller =
require('../controllers/ProveedorController');

const verificarToken =
require('../../middlewares/authMiddleware');

const autorizarRoles =
require('../../middlewares/autorizarRoles');

router.use(
  verificarToken,
  autorizarRoles('ADMIN', 'OPERADOR')
);

router.post(
  '/',
  controller.crear
);

router.get(
  '/',
  controller.obtener
);

router.put(
  '/:id',
  controller.editar
);

router.delete(
  '/:id',
  controller.eliminar
);

module.exports = router;
