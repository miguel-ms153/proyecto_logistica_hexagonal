const express = require('express');

const router = express.Router();

const controller =
require('../controllers/TrackingController');

router.post(
  '/',
  controller.crear
);

router.get(
  '/',
  controller.obtener
);

module.exports = router;