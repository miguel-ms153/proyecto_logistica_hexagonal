class EditarTracking {

  constructor(repository) {
    this.repository = repository;
  }

  async ejecutar(data) {
    return await this.repository.crear(data);
  }

}

module.exports = EditarTracking;