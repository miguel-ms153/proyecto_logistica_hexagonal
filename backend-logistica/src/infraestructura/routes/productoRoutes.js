const express = require('express');

const router = express.Router();

const controller =
require('../controllers/ProductoController');

// CREAR
router.post(
  '/',
  controller.crear
);

// OBTENER
router.get(
  '/',
  controller.obtener
);

// EDITAR
router.put(
  '/:id',
  controller.editar
);

// ELIMINAR
router.delete(
  '/:id',
  controller.eliminar
);

module.exports = router;