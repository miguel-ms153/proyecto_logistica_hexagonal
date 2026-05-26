const express = require('express');

const router = express.Router();

const EmbarqueController =
require('../controllers/EmbarqueController');

router.post('/',
EmbarqueController.crear);

router.get('/',
EmbarqueController.obtener);

router.put('/:id',
EmbarqueController.editar);

router.delete('/:id',
EmbarqueController.eliminar);

module.exports = router;