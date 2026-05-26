class Embarque {

  constructor({
    id_embarque,
    origen,
    destino,
    estado,
    id_orden
  }) {

    this.id_embarque = id_embarque;
    this.origen = origen;
    this.destino = destino;
    this.estado = estado;
    this.id_orden = id_orden;

  }

}

module.exports = Embarque;