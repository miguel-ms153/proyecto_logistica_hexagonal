const express = require('express');

const router = express.Router();

const OrdenController =
require('../controllers/OrdenController');

router.post('/',
OrdenController.crear);

router.get('/',
OrdenController.obtener);

router.put('/:id',
OrdenController.editar);

router.delete('/:id',
OrdenController.eliminar);

module.exports = router;