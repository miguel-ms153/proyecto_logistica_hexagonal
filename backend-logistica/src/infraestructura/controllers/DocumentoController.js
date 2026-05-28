const DocumentoRepositoryMysql =
require('../repositories/DocumentoRepositoryMysql');

const CrearDocumento =
require('../../aplicacion/documento/CrearDocumento');

const ObtenerDocumentos =
require('../../aplicacion/documento/ObtenerDocumentos');

const EditarDocumento =
require('../../aplicacion/documento/EditarDocumento');

const EliminarDocumento =
require('../../aplicacion/documento/EliminarDocumento');

const repository =
new DocumentoRepositoryMysql();

const crearDocumentoUseCase =
new CrearDocumento(repository);

const obtenerDocumentosUseCase =
new ObtenerDocumentos(repository);

const editarDocumentoUseCase =
new EditarDocumento(repository);

const eliminarDocumentoUseCase =
new EliminarDocumento(repository);

class DocumentoController {

  async crear(req, res) {

    try {

      const result =
      await crearDocumentoUseCase.ejecutar(req.body);

      res.json(result);

    } catch (error) {

      res.status(500).json({
        error: error.message
      });

    }

  }

  async obtener(req, res) {

    try {

      const result =
      await obtenerDocumentosUseCase.ejecutar();

      res.json(result);

    } catch (error) {

      res.status(500).json({
        error: error.message
      });

    }

  }

  async editar(req, res) {

    try {

      const result =
      await editarDocumentoUseCase.ejecutar(
        req.params.id,
        req.body
      );

      res.json(result);

    } catch (error) {

      res.status(500).json({
        error: error.message
      });

    }

  }

  async eliminar(req, res) {

    try {

      const result =
      await eliminarDocumentoUseCase.ejecutar(
        req.params.id
      );

      res.json(result);

    } catch (error) {

      res.status(500).json({
        error: error.message
      });

    }

  }

  async subirArchivo(req, res) {

    try {

      if (!req.file) {

        return res.status(400).json({
          error: 'Debe seleccionar un archivo'
        });

      }

      const archivoRuta =
        `/uploads/documentos/${req.file.filename}`;

      const result =
      await editarDocumentoUseCase.ejecutar(
        req.params.id,
        {
          archivo_original:
            req.file.originalname,

          archivo_nombre:
            req.file.filename,

          archivo_ruta:
            archivoRuta,

          archivo_mime:
            req.file.mimetype,

          archivo_tamano:
            req.file.size
        }
      );

      res.json(result);

    } catch (error) {

      res.status(500).json({
        error: error.message
      });

    }

  }

}

module.exports =
new DocumentoController();
