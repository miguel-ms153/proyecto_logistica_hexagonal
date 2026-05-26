class ObtenerTracking {

  constructor(repository) {
    this.repository = repository;
  }

  async ejecutar() {

    return await this.repository.obtenerTodos();

  }

}

module.exports = ObtenerTracking;