class Pago {

  constructor({
    id_pago,
    monto,
    metodo,
    fecha,
    id_orden
  }) {

    this.id_pago = id_pago;
    this.monto = monto;
    this.metodo = metodo;
    this.fecha = fecha;
    this.id_orden = id_orden;

  }

}

module.exports = Pago;