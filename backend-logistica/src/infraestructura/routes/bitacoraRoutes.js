const express = require('express');

const router = express.Router();

const controller =
require('../controllers/BitacoraController');

const verificarToken =
require('../../middlewares/authMiddleware');

const autorizarRoles =
require('../../middlewares/autorizarRoles');

router.use(
  verificarToken,
  autorizarRoles('ADMIN')
);

router.get(
  '/',
  controller.obtener
);

module.exports = router;
