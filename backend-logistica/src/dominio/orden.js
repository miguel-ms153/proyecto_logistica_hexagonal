class Orden {

  constructor({
    id_orden,
    fecha,
    estado,
    id_usuario
  }) {

    this.id_orden = id_orden;
    this.fecha = fecha;
    this.estado = estado;
    this.id_usuario = id_usuario;

  }

}

module.exports = Orden;