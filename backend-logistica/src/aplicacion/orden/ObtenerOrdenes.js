class ObtenerOrdenes {

  constructor(repository) {
    this.repository = repository;
  }

  async ejecutar() {

    return await this.repository.obtenerTodos();

  }

}

module.exports = ObtenerOrdenes;