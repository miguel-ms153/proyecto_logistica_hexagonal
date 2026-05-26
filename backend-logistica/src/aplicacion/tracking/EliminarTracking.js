class EliminarTracking {

  constructor(repository) {
    this.repository = repository;
  }

  async ejecutar(id) {
    return await this.repository.eliminar(id);
  }

}

module.exports = EliminarTracking;