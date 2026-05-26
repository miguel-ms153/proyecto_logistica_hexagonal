const ProductoRepositoryMysql =
require('../repositories/ProductoRepositoryMysql');

const CrearProducto =
require('../../aplicacion/producto/CrearProducto');

const ObtenerProductos =
require('../../aplicacion/producto/ObtenerProductos');

const EditarProducto =
require('../../aplicacion/producto/EditarProducto');

const EliminarProducto =
require('../../aplicacion/producto/EliminarProducto');

const repository =
new ProductoRepositoryMysql();

const crearProductoUseCase =
new CrearProducto(repository);

const obtenerProductosUseCase =
new ObtenerProductos(repository);

const editarProductoUseCase =
new EditarProducto(repository);

const eliminarProductoUseCase =
new EliminarProducto(repository);

class ProductoController {

  async crear(req, res) {

    const result =
    await crearProductoUseCase.ejecutar(req.body);

    res.json(result);

  }

  async obtener(req, res) {

    const result =
    await obtenerProductosUseCase.ejecutar();

    res.json(result);

  }

  async editar(req, res) {

    const result =
    await editarProductoUseCase.ejecutar(
      req.params.id,
      req.body
    );

    res.json(result);

  }

  async eliminar(req, res) {

    const result =
    await eliminarProductoUseCase.ejecutar(
      req.params.id
    );

    res.json(result);

  }

}

module.exports = new ProductoController();