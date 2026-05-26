const express = require('express');

const router = express.Router();

const controller =
require('../controllers/ProveedorController');

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