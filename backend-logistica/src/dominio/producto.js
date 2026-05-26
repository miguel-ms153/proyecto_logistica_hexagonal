class Producto {

  constructor({
    id_producto,
    nombre,
    precio,
    stock,
    id_proveedor
  }) {

    this.id_producto = id_producto;
    this.nombre = nombre;
    this.precio = precio;
    this.stock = stock;
    this.id_proveedor = id_proveedor;

  }

}

module.exports = Producto;