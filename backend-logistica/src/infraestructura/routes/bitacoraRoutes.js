const express = require('express');

const router = express.Router();

const controller =
require('../controllers/BitacoraController');

router.get(
  '/',
  controller.obtener
);

module.exports = router;
