const express = require('express');

const router = express.Router();

const OrdenController =
require('../controllers/OrdenController');

const verificarToken =
require('../../middlewares/authMiddleware');

const autorizarRoles =
require('../../middlewares/autorizarRoles');

router.use(
verificarToken,
autorizarRoles('ADMIN', 'OPERADOR', 'CLIENTE')
);

router.post('/',
OrdenController.crear);

router.get('/',
OrdenController.obtener);

router.put('/:id',
OrdenController.editar);

router.delete('/:id',
OrdenController.eliminar);

module.exports = router;
