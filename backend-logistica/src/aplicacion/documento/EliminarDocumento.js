class EliminarDocumento {

  constructor(repository) {
    this.repository = repository;
  }

  async ejecutar(id) {
    return await this.repository.eliminar(id);
  }

}

module.exports = EliminarDocumento;
