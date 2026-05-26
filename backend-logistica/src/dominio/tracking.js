class Tracking {

  constructor({
    id_orden,
    ubicacion,
    estado,
    fecha
  }) {

    this.id_orden = id_orden;
    this.ubicacion = ubicacion;
    this.estado = estado;
    this.fecha = fecha;

  }

}

module.exports = Tracking;