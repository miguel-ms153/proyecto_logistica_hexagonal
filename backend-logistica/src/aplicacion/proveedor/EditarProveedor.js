class EditarProveedores {

  constructor(repository) {
    this.repository = repository;
  }

  async ejecutar(data) {
    return await this.repository.editar(data);
  }

}

module.exports = EditarProveedores;