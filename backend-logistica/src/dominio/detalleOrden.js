class DetalleOrden {

  constructor({
    id_detalle,
    cantidad,
    subtotal,
    id_orden,
    id_producto
  }) {

    this.id_detalle = id_detalle;
    this.cantidad = cantidad;
    this.subtotal = subtotal;
    this.id_orden = id_orden;
    this.id_producto = id_producto;

  }

}

module.exports = DetalleOrden;