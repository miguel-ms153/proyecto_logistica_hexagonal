const express = require('express');

const router = express.Router();

const controller =
require('../controllers/UsuarioController');

// LOGIN
router.post(
  '/login',
  controller.login
);

// CREAR
router.post(
  '/',
  controller.crear
);

// OBTENER TODOS
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