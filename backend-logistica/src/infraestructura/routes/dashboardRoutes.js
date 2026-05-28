const express =
require('express');

const router =
express.Router();

const DashboardController =
require('../controllers/DashboardController');

const verificarToken =
require('../../middlewares/authMiddleware');

router.use(
  verificarToken
);

router.get(
  '/',
  DashboardController.resumen
);


module.exports = router;
