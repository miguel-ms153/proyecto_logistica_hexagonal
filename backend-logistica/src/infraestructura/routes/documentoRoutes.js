const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const controller =
require('../controllers/DocumentoController');

const verificarToken =
require('../../middlewares/authMiddleware');

const autorizarRoles =
require('../../middlewares/autorizarRoles');

const carpetaDocumentos =
path.join(
  __dirname,
  '../../../uploads/documentos'
);

fs.mkdirSync(
  carpetaDocumentos,
  {
    recursive: true
  }
);

const storage =
multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, carpetaDocumentos);
  },

  filename: (req, file, cb) => {
    const extension =
      path.extname(file.originalname);

    const nombre =
      `${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`;

    cb(null, nombre);
  }

});

const upload =
multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

router.post(
  '/',
  verificarToken,
  autorizarRoles('ADMIN', 'OPERADOR'),
  controller.crear
);

router.post(
  '/:id/archivo',
  verificarToken,
  autorizarRoles('ADMIN', 'OPERADOR'),
  upload.single('archivo'),
  controller.subirArchivo
);

router.get(
  '/',
  verificarToken,
  autorizarRoles('ADMIN', 'OPERADOR', 'CLIENTE'),
  controller.obtener
);

router.put(
  '/:id',
  verificarToken,
  autorizarRoles('ADMIN', 'OPERADOR'),
  controller.editar
);

router.delete(
  '/:id',
  verificarToken,
  autorizarRoles('ADMIN', 'OPERADOR'),
  controller.eliminar
);

module.exports = router;
