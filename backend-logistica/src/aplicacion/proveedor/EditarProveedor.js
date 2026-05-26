class EditarProveedores {

  constructor(repository) {
    this.repository = repository;
  }

  async ejecutar(data) {
    return await this.repository.crear(data);
  }

}

module.exports = EditarProveedores;