const Tracking =
require('../models/TrackingModel');

class TrackingRepositoryMongo {

  async crear(data) {

    return await Tracking.create(data);

  }

  async obtenerTodos() {

    return await Tracking.find();

  }

  async obtenerPorOrden(id_orden) {

    return await Tracking.find({
      id_orden
    });

  }

}

module.exports =
TrackingRepositoryMongo;