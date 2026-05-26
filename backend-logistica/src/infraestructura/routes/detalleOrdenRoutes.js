const express = require('express');

const router = express.Router();

const controller =
require('../controllers/DetalleOrdenController');

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