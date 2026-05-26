class CrearEmbarque {

  constructor(repository) {
    this.repository = repository;
  }

  async ejecutar(data) {
    return await this.repository.crear(data);
  }

}

module.exports = CrearEmbarque;